# DEVELOPER HANDBOOK (SOP)
## Sentinel Nexus 360 Enterprise – Versión 3.2.0-DEV-HB
**Guía de Implementación Técnica, Recetas de Código y Operaciones**

---

## 0. Control Documental e Introducción

Este **Developer Handbook (SOP)** constituye la guía de ingeniería física, de desarrollo y de operaciones para **Sentinel Nexus 360 Enterprise**. Funciona como la capa de **infraestructura e implementación** de la documentación técnica y mantiene una sincronización del 100% con las decisiones descritas en el [Master SAD (v3.2.0-MASTER)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/SAD.md).

### Matriz de Relación de Versiones:
| Versión del Handbook | Fecha | Versión SAD Asociada | Estado | Propósito |
|---|---|---|---|---|
| `3.2.0-DEV-HB` | 2026-05-20 | [`3.2.0-MASTER`](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/SAD.md) | **Aprobado** | Extracción del DDL, ORMs, middlewares de inyección RLS, scripts de seguridad de IA, configuraciones CI/CD y QA de referencia. |

### Cómo Usar este Handbook:
*   **Obligatorio vs. Sugerido**: Los fragmentos de código relativos al **aislamiento RLS (SQLAlchemy/Prisma)**, **seguridad de webhooks (Bearer token para Belvo / HMAC para endpoint interno /authorize)**, y **enmascaramiento de PII** son de carácter **OBLIGATORIO** para el cumplimiento normativo. Las configuraciones de pruebas unitarias (pytest) y pipelines de CI/CD son de carácter **SUGERIDO / REFERENCIA** para el equipo de desarrollo.
*   **Modificaciones**: Cualquier cambio físico en los modelos de base de datos o en la inyección RLS debe ser primero avalado mediante un Architecture Decision Record (ADR) y posteriormente reflejado tanto en el [Master SAD](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/SAD.md) como en este Handbook.

---

## 1. Esquema Físico DDL de Persistencia (PostgreSQL 17)

A continuación se detalla el script DDL de creación de la base de datos completa de Sentinel, incluyendo las 18 tablas operativas de la versión `3.1.0-MASTER`, los índices de rendimiento B-Tree, constraints compuestos de multi-tenant de CFDI compound y las políticas de Row-Level Security (RLS).

### 1.1 Script SQL de Inicialización Completa:

```sql
-- Inicialización de extensiones obligatorias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Tabla de Tenants (Despachos Contables / Holdings)
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, expired, canceled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios (Identidad Global)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    language VARCHAR(10) DEFAULT 'es-MX',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 3. Tabla de Relación Despacho - Usuario (Roles y RBAC)
CREATE TABLE tenant_users (
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER','ADMIN','ACCOUNTANT','VIEWER')),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    disabled_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (tenant_id, user_id)
);

-- 4. Preferencias del Usuario (Configuración Estética y Notificaciones)
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    tenant_id UUID NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    notify_email BOOLEAN NOT NULL DEFAULT TRUE,
    notify_in_app BOOLEAN NOT NULL DEFAULT TRUE,
    notify_critical_only BOOLEAN NOT NULL DEFAULT FALSE,
    alert_types JSONB NOT NULL DEFAULT '["69B","PLD","RISK","SYSTEM"]'::jsonb,
    dashboard_default_view VARCHAR(50) DEFAULT 'dashboard',
    ui_density VARCHAR(20) DEFAULT 'comfortable',
    theme VARCHAR(20) DEFAULT 'light'
);

-- 5. Tabla de Perfiles Fiscales (Contribuyentes Monitoreados)
CREATE TABLE tax_profiles (
    tax_profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    rfc VARCHAR(13) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    criticality_level VARCHAR(1) NOT NULL DEFAULT 'C' CHECK (criticality_level IN ('A','B','C')),
    coverage_level VARCHAR(20) NOT NULL DEFAULT 'manual_only' CHECK (coverage_level IN ('full', 'belvo_only', 'lens_only', 'manual_only')),
    belvo_link_id VARCHAR(255) UNIQUE,
    belvo_status VARCHAR(50) DEFAULT 'unlinked', -- unlinked, linked, error, mfa_required, onboarded_without_belvo
    belvo_last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rfc_format_check CHECK (rfc ~ '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$')
);

-- 6. Calendario Fiscal de Cierres y Ventanas de Sensibilidad IQR
CREATE TABLE fiscal_calendar (
    calendar_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'ANUAL', 'MENSUAL'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL, -- e.g. 'Cierre anual ISR'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Invoices (CFDI) - Constraint Compuesto de Tenant para Evitar Colisiones de Double-Entry
CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_profile_id UUID NOT NULL REFERENCES tax_profiles(tax_profile_id) ON DELETE CASCADE,
    uuid UUID NOT NULL, 
    invoice_hash VARCHAR(64) NOT NULL, -- SHA-256 del contenido binario
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inflow', 'outflow')),
    amount NUMERIC(15, 2) NOT NULL,
    rfc_proveedor VARCHAR(13) NOT NULL,
    nombre_proveedor VARCHAR(255) NOT NULL,
    status_69b VARCHAR(50) NOT NULL DEFAULT 'clean', -- clean, presunto, definitivo
    quality_flag VARCHAR(30) NOT NULL DEFAULT 'valid' CHECK (quality_flag IN ('valid','invalid_structure','suspicious')),
    quality_notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Nota: Constraints de unicidad basados en el contexto del perfil fiscal
    CONSTRAINT uq_invoice_uuid_per_profile UNIQUE (tax_profile_id, uuid),
    CONSTRAINT uq_invoice_hash_per_profile UNIQUE (tax_profile_id, invoice_hash)
);

-- 8. Tabla de Alertas con Versionado de Reglas y Bloqueo Multisesión (Alert Locking)
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_profile_id UUID NOT NULL REFERENCES tax_profiles(tax_profile_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, CLOSED
    details JSONB NOT NULL,
    locked_by UUID NULL REFERENCES users(user_id) ON DELETE SET NULL,
    locked_at TIMESTAMP WITH TIME ZONE,
    rules_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabla sat_69b_list para el ETL Nocturno del Diario Oficial de la Federación (DOF)
CREATE TABLE sat_69b_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfc VARCHAR(13) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('presunto','definitivo','desvirtuado')),
    fecha_publicacion DATE NOT NULL,
    fuente VARCHAR(255) NOT NULL,
    version_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Catálogo de Versionado de Reglas Analíticas Fiscales (Risk Engine)
CREATE TABLE risk_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version INTEGER NOT NULL,
    description TEXT NOT NULL,
    params JSONB NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Catálogo de Reglas PLD para Actividades Vulnerables y Límites UMA
CREATE TABLE pld_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'INMOBILIARIA', 'MUTUO', 'DONATIVOS'
    uma_threshold NUMERIC(15, 2) NOT NULL, -- umbral expresado en UMAs
    obligation_type VARCHAR(20) NOT NULL CHECK (obligation_type IN ('IDENTIFICAR', 'AVISAR', 'CONSERVAR')),
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Historial de Chequeos de Operaciones PLD (UMA Checks)
CREATE TABLE pld_checks (
    check_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_profile_id UUID NOT NULL REFERENCES tax_profiles(tax_profile_id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(invoice_id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    uma_amount NUMERIC(15, 2) NOT NULL, -- cantidad en UMAs de la operación
    obligation_type VARCHAR(20) NOT NULL CHECK (obligation_type IN ('IDENTIFICAR', 'AVISAR', 'CONSERVAR')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLIANT', 'ALERTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Historial de Eventos de Riesgo Estadístico
CREATE TABLE risk_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_profile_id UUID NOT NULL REFERENCES tax_profiles(tax_profile_id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL, -- 'HHI', 'IQR', 'Z-SCORE'
    metric_value NUMERIC(15, 4) NOT NULL,
    rules_version INTEGER NOT NULL DEFAULT 1,
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabla de Vault (Archivos de Evidencia WORM Cifrados e Inmutables)
CREATE TABLE vault_files (
    vault_file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_profile_id UUID NOT NULL REFERENCES tax_profiles(tax_profile_id) ON DELETE CASCADE,
    alert_id UUID REFERENCES alerts(alert_id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    nom151_sealed BOOLEAN NOT NULL DEFAULT FALSE,
    nom151_sealing_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Tabla Inmutable de Logs de Auditoría ("Caja Negra" - No Update, No Delete)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Eventos de webhooks (idempotencia y trazabilidad)
CREATE TABLE webhook_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('BELVO', 'STRIPE', 'INTERNAL')),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 17. Auditoría de IA (tokens, costo, contradiction_status)
CREATE TABLE ai_audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    prompt_hash VARCHAR(64) NOT NULL,
    prompt_scrubbed TEXT NOT NULL,
    response_text TEXT,
    tokens_in INTEGER,
    tokens_out INTEGER,
    cost_estimate NUMERIC(10,6),
    model_version VARCHAR(50) NOT NULL,
    contradiction_status VARCHAR(30) CHECK (contradiction_status IN ('none', 'contradicted', 'low_confidence', 'fallback')),
    ai_confidence_score NUMERIC(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Scores de riesgo por perfil fiscal
CREATE TABLE risk_scores (
    score_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    tax_profile_id UUID NOT NULL REFERENCES tax_profiles(tax_profile_id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    hhi_score NUMERIC(10,2),
    z_score NUMERIC(10,4),
    iqr_score NUMERIC(10,4),
    pld_weight NUMERIC(5,2),
    alerts_weight NUMERIC(5,2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rules_version VARCHAR(20) NOT NULL
);
```

### 1.2 Índices B-Tree de Rendimiento:
Para optimizar las búsquedas bajo aislamiento RLS y el filtrado por perfiles en grandes volúmenes:

```sql
CREATE INDEX idx_invoices_quality ON invoices(tax_profile_id, quality_flag);
CREATE INDEX idx_alerts_lock ON alerts(locked_by, locked_at) WHERE locked_by IS NOT NULL;
CREATE INDEX idx_pld_checks_profile ON pld_checks(tax_profile_id, activity_type);
CREATE INDEX idx_risk_events_metrics ON risk_events(tax_profile_id, metric_name);
CREATE INDEX idx_sat_69b_rfc ON sat_69b_list(rfc);
CREATE INDEX idx_invoices_rfc_prov ON invoices(tax_profile_id, rfc_proveedor);
```

### 1.3 Configuración de Row Level Security (RLS) en Postgres:

```sql
-- Habilitar Row Level Security en todas las tablas operativas protegidas
ALTER TABLE tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pld_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS basadas en la variable de transacción 'app.current_tenant_id'
-- Importante: El segundo argumento 'true' en current_setting evita errores de variable no inicializada.

CREATE POLICY tax_profiles_tenant_isolation ON tax_profiles
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY invoices_tenant_isolation ON invoices
    FOR ALL USING (tax_profile_id IN (
        SELECT tax_profile_id FROM tax_profiles 
        WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));

CREATE POLICY alerts_tenant_isolation ON alerts
    FOR ALL USING (tax_profile_id IN (
        SELECT tax_profile_id FROM tax_profiles 
        WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));

CREATE POLICY vault_files_tenant_isolation ON vault_files
    FOR ALL USING (tax_profile_id IN (
        SELECT tax_profile_id FROM tax_profiles 
        WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));

CREATE POLICY fiscal_calendar_tenant_isolation ON fiscal_calendar
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_users_isolation ON tenant_users
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY user_preferences_isolation ON user_preferences
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY audit_logs_tenant_isolation ON audit_logs
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY pld_checks_tenant_isolation ON pld_checks
    FOR ALL USING (tax_profile_id IN (
        SELECT tax_profile_id FROM tax_profiles 
        WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));

CREATE POLICY risk_events_tenant_isolation ON risk_events
    FOR ALL USING (tax_profile_id IN (
        SELECT tax_profile_id FROM tax_profiles 
        WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));
```

### 1.4 Regla Inmutable de Auditoría en Postgres (Bypass Trigger):
Para asegurar que `audit_logs` sea un registro inmutable WORM, se inhabilita el borrado o edición física mediante un trigger de base de datos a nivel físico:

```sql
CREATE OR REPLACE FUNCTION prevent_audit_alteration()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operación no permitida: La tabla audit_logs es inmutable (WORM).';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_delete_update
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_alteration();
```

---

## 2. Inyección de RLS en SQLAlchemy 2.0 (FastAPI Core Python)

Para el backend en Python (FastAPI/Celery), la inyección se automatiza utilizando eventos de ciclo de vida de la sesión de SQLAlchemy 2.0 y Context Managers. Esto garantiza que ningún desarrollador tenga que recordar escribir la inyección del tenant de manera manual en los controladores.

### 2.1 Código de Referencia Obligatorio (Inyector RLS):

```python
import uuid
from typing import AsyncGenerator
from contextvars import ContextVar
from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# ContextVar segura para ambientes asíncronos y multihilo (Coroutines)
current_tenant_id_ctx: ContextVar[uuid.UUID | None] = ContextVar("current_tenant_id", default=None)

class RlsContextManager:
    """
    Gestor de contexto para inyectar de forma transparente el tenant_id
    en el hilo/coroutina de ejecución actual.
    """
    def __init__(self, tenant_id: uuid.UUID):
        self.tenant_id = tenant_id
        self.token = None

    def __enter__(self):
        self.token = current_tenant_id_ctx.set(self.tenant_id)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.token:
            current_tenant_id_ctx.reset(self.token)

# Configuración del Motor Asíncrono de SQLAlchemy
# Optimizado con pool_size de 20 y pre_ping de estado
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost:5432/sentinel",
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Interceptor de Eventos de Base de Datos - OBLIGATORIO
@event.listens_for(AsyncSession, "after_transaction_create")
def inject_rls_context(session: AsyncSession, transaction):
    """
    Listener que se ejecuta inmediatamente después de que se inicia
    cualquier transacción en la sesión. Inyecta el contexto del tenant_id.
    """
    tenant_id = current_tenant_id_ctx.get()
    if tenant_id is None:
        # En ambientes administrativos globales (e.g. ETL Beat global), no se inyecta
        # la variable para forzar el bloqueo RLS o el bypass explícito administrado.
        return

    # Escuchar el inicio de la ejecución del cursor de forma atómica para esta transacción
    @event.listens_for(session.sync_session, "before_cursor_execute", once=True)
    def set_local_tenant(conn, cursor, statement, parameters, context, executemany):
        # SET LOCAL restringe el ciclo de vida al bloque BEGIN ... COMMIT/ROLLBACK
        conn.execute(
            text("SET LOCAL app.current_tenant_id = :tenant_id"),
            {"tenant_id": str(tenant_id)}
        )

# Dependency Provider de FastAPI para inyección de dependencias limpia
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency provider que garantiza que la sesión de base de datos
    está asociada al tenant_id del usuario autenticado actual.
    """
    tenant_id = current_tenant_id_ctx.get()
    if not tenant_id:
        raise PermissionError("Acceso no autorizado: Contexto de Tenant no inicializado.")

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()
```

---

## 3. Node.js Prisma Extension + AsyncLocalStorage (Express BFF)

En el BFF de Express 5 / React 19, utilizamos Prisma ORM v6. Dado que Prisma no cuenta con soporte nativo para inyectar variables de sesión en su abstracción de consultas de alto nivel, se implementa una **Prisma Client Extension** combinada con **AsyncLocalStorage** de Node.js para un control totalmente imperativo e invisible.

### 3.1 Implementación en Prisma Client (Código Obligatorio):

```typescript
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// Almacenamiento seguro por Request en Node.js (similar a ThreadLocal)
export interface TenantContext {
  tenantId: string;
}
export const tenantStorage = new AsyncLocalStorage<TenantContext>();

const prismaRaw = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Extensión de Prisma para interceptar todas las llamadas operativas y envolverlas
 * en una transacción interactiva que inyecta automáticamente el tenant_id actual.
 */
export const prisma = prismaRaw.$extends({
  query: {
    $allOperations: async ({ model, operation, args, query }) => {
      const context = tenantStorage.getStore();
      
      // Si no hay tenant_id en el contexto (e.g. rutas públicas o scripts de seed),
      // ejecutamos la consulta normal. RLS denegará por default si es tabla protegida.
      if (!context?.tenantId) {
        return query(args);
      }

      // Envolver la operación en una transacción interactiva de corta duración
      // para inyectar el SET LOCAL de forma garantizada y atómica.
      return prismaRaw.$transaction(async (tx) => {
        // Inyectar el Tenant ID dentro del alcance exclusivo de esta transacción
        await tx.$queryRawUnsafe(
          `SET LOCAL app.current_tenant_id = '${context.tenantId}'`
        );
        
        // Ejecutar la consulta original dentro del contexto transaccional protegido
        const txBoundQuery = (query as any).bind(tx);
        return txBoundQuery(args);
      }, {
        timeout: 5000, // Límite de tiempo interactivo estricto de 5 segundos
      });
    },
  },
});

/**
 * Middleware de Express 5 para interceptar el tenant_id de la petición
 * y ponerlo en el AsyncLocalStorage antes de que llegue a los controladores.
 */
export function rlsMiddleware(req: any, res: any, next: () => void) {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ 
      error: 'Acceso no autorizado: Contexto de Tenant no inicializado en token JWT.' 
    });
  }

  // Ejecutar el resto de la cadena de middlewares/controladores bajo el almacenamiento contextual
  tenantStorage.run({ tenantId }, () => {
    next();
  });
}
```

---

## 4. AI Proxy y Código del Motor de Contradicción (FastAPI Core)

Esta sección define el código base en Python para ejecutar las validaciones de enmascaramiento de prompts y el motor matemático local de contradicción, el cual anula las inferencias del modelo si se detectan divergencias atípicas.

### 4.1 Enmascarador Local de PII (`scrub_pii`):

```python
import re
import hashlib

def scrub_pii(prompt_content: str) -> str:
    """
    Anonimiza estrictamente datos sensibles (RFC, CURP, Emails, Nombres de entidades,
    Montos) antes de interactuar con el SDK externo de Gemini.
    """
    # Regex para RFC (personas físicas y morales)
    rfc_pattern = re.compile(r'\b[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}\b', re.IGNORECASE)
    # Regex para CURP (ahora con hash SHA-256, no redaction)
    curp_pattern = re.compile(r'\b[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[A-Z0-9]{2}\b', re.IGNORECASE)
    # Regex para correos electrónicos
    email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    # Regex para nombres de personas físicas/morales
    entity_pattern = re.compile(
        r'\b(?:[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+(?:[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+|de|del|la|las|los|y|e)){1,4})\b'
    )

    # Regex para montos (múltiples formatos en español e inglés)
    amount_pattern = re.compile(
        r'\$\s*[\d,]+\.?\d*\s*(?:MXN|USD|EUR)?\b|\b[\d,]+\.?\d*\s*(?:MXN|USD|EUR)\b'
    )

    def curp_hasher(match):
        return hashlib.sha256(match.group().encode()).hexdigest()

    def amount_categorizer(match):
        raw = match.group()
        digits = re.sub(r'[^\d.]', '', raw)
        try:
            val = float(digits)
        except ValueError:
            return '[MONTO_BAJO]'
        if val < 50000:
            return '[MONTO_BAJO]'
        elif val < 500000:
            return '[MONTO_MEDIO]'
        else:
            return '[MONTO_ALTO]'

    sanitized = rfc_pattern.sub("[RFC_REDACTED]", prompt_content)
    sanitized = curp_pattern.sub(curp_hasher, sanitized)
    sanitized = email_pattern.sub("[EMAIL_REDACTED]", sanitized)
    sanitized = entity_pattern.sub("[ENTIDAD_REDACTED]", sanitized)
    sanitized = amount_pattern.sub(amount_categorizer, sanitized)
    return sanitized
```

### 4.2 Motor de Contradicción Técnica (`evaluate_ai_contradiction`):

```python
def evaluate_ai_contradiction(ai_response: dict, math_risk_level: str) -> bool:
    """
    Compara el nivel de riesgo sugerido por el LLM vs el cálculo matemático local.
    Si difieren por 2 o más niveles y la confianza es baja, activa el fallback local.
    
    Riesgos definidos: LOW = 1, MEDIUM = 2, HIGH = 3, CRITICAL = 4.
    """
    risk_mapping = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    
    ai_risk = ai_response.get("risk_level", "LOW").upper()
    ai_confidence = ai_response.get("confidence_score", 0.0)
    
    if ai_risk not in risk_mapping or math_risk_level not in risk_mapping:
        return True # Fuerza fallback ante valores inválidos o alucinados
        
    diff = abs(risk_mapping[ai_risk] - risk_mapping[math_risk_level])
    
    # Condición de Contradicción: Diferencia >= 2 niveles y confianza < 90%
    if diff >= 2 and ai_confidence < 0.90:
        return True # Se detecta anomalía / contradicción
        
    return False # Inferencia congruente, aprobada para despliegue
```

---

## 5. Payloads de Integraciones y Seguridad Webhook (BFF Node)

El BFF de Node.js maneja la recepción y autenticación de webhooks críticos del proveedor Open Finance Belvo. Según [ADR-0008](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/SAD.md#adr-0008--doble-verificación-de-webhooks-belvo), Belvo no ofrece firma HMAC nativa (a mayo 2026). La estrategia de seguridad se basa en **Bearer token + IP allowlist + deduplicación por `event_id`**, con verificación en capas independientes.

### 5.1 Verificador de Webhook con Bearer Token y Deduplicación

```javascript
import crypto from 'crypto';

const BELVO_WEBHOOK_TOKEN = process.env.BELVO_WEBHOOK_TOKEN;
const BELVO_IPS = (process.env.BELVO_IP_ALLOWLIST || '').split(',');

function verifyBelvoWebhook(req, res, next) {
  // Capa 1: Validación de IP (Kong/Gateway puede hacerlo; aquí como segunda línea)
  const clientIp = req.ip || req.connection.remoteAddress;
  if (BELVO_IPS.length > 0 && !BELVO_IPS.includes(clientIp)) {
    return res.status(403).json({ error: 'IP no autorizada para webhook Belvo' });
  }

  // Capa 2: Validación de Bearer token
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${BELVO_WEBHOOK_TOKEN}`) {
    return res.status(401).json({ error: 'Token de webhook inválido' });
  }

  // Capa 3: Deduplicación por event_id (prevención de replay attacks)
  const eventId = req.body?.event_id;
  if (!eventId) {
    return res.status(400).json({ error: 'Falta event_id en el payload' });
  }

  next();
}
```

El middleware de deduplicación con `event_id` verifica contra la tabla `webhook_events` (constraint UNIQUE), ignorando eventos ya procesados y garantizando idempotencia. Si Belvo agrega HMAC como firma nativa en el futuro, se migrará de inmediato según ADR-0008.

### 5.2 Middleware de Idempotencia para Webhook Events

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function idempotencyMiddleware(req, res, next) {
  const eventId = req.body?.event_id;
  try {
    await prisma.webhook_events.create({ data: { event_id: eventId, payload: req.body } });
    next();
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(200).json({ status: 'duplicate', message: 'Evento ya procesado' });
    }
    next(err);
  }
}
```

---

## 6. Pipelines CI/CD y Hardening (DevSecOps)

Para garantizar despliegues seguros y consistentes con los NFRs definidos en el [Master SAD](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/SAD.md), se describen los artefactos de infraestructura de CI/CD.

### 6.1 GitHub Actions Workflow (`CI-CD-Pipeline.yml`):

```yaml
name: Sentinel Enterprise CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ develop ]

jobs:
  sonar-gate:
    name: SonarQube & Security Audit Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Gitleaks Secret Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Semgrep Security Scan
        run: |
          pip install semgrep
          semgrep scan --config auto --error

      - name: Run Backend Unit Tests (pytest)
        run: |
          pip install -r core/requirements.txt
          pytest --cov=core --cov-fail-under=75

      - name: SonarQube Quality Gate Check
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### 6.2 Dockerfile Distroless Multietapa para Core Python (FastAPI):

```dockerfile
# Etapa 1: Build y compilación de dependencias
FROM python:3.12-slim AS builder

WORKDIR /app
COPY core/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Etapa 2: Imagen final Distroless segura contra exploit de shell
FROM gcr.io/distroless/python3-debian12

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY core/ .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

EXPOSE 8000
ENTRYPOINT ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 7. Suite de QA y Pruebas Unitarias/E2E de Referencia

Estrategia física y plantillas de pruebas para garantizar el aislamiento y la consistencia de las transacciones 69-B del CFF.

### 7.1 Test Unitario Pytest para Transiciones 69-B del CFF (`test_69b_workflow.py`):

```python
import pytest
from unittest.mock import MagicMock
from core.models import Invoice, Alert, AuditLog
from core.rules import process_69b_transition

@pytest.mark.asyncio
async def test_efos_transition_escalation():
    """
    Verifica que la transición de un proveedor a definitivo scale las facturas asociadas
    y genere de manera automática alertas críticas (CRITICAL) en la base de datos.
    """
    # Mock de la sesión de base de datos
    db_session = MagicMock()
    
    # RFC del proveedor catalogado
    efos_rfc = "XAXX010101000"
    
    # Simular facturas del emisor EFOS registradas
    mock_invoice = Invoice(
        invoice_id="inv-123",
        rfc_proveedor=efos_rfc,
        amount=50000.00,
        status_69b="clean"
    )
    
    # 1. Ejecutar transición a Presunto
    alerts = await process_69b_transition(
        db=db_session,
        rfc=efos_rfc,
        new_status="presunto",
        affected_invoices=[mock_invoice]
    )
    
    # Verificar alertas generadas en estado presunto
    assert len(alerts) == 1
    assert alerts[0].severity == "HIGH"
    assert mock_invoice.status_69b == "presunto"
    
    # 2. Transicionar de Presunto a Definitivo
    alerts_definitivo = await process_69b_transition(
        db=db_session,
        rfc=efos_rfc,
        new_status="definitivo",
        affected_invoices=[mock_invoice]
    )
    
    # Verificar escala mandatoria a CRITICAL
    assert len(alerts_definitivo) == 1
    assert alerts_definitivo[0].severity == "CRITICAL"
    assert mock_invoice.status_69b == "definitivo"
```

### 7.2 Test de Cypress para E2E Login & MFA Sandbox Flow:

```javascript
describe('Sentinel Access & Multi-Tenant Onboarding E2E Suite', () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  it('Debe iniciar sesión, requerir MFA y comprobar inmutabilidad de cookies HttpOnly', () => {
    // 1. Login Inicial
    cy.visit('/login');
    cy.get('input[id="email-field"]').type('contador@despacho-a.com');
    cy.get('input[id="password-field"]').type('Pass1234Secure!');
    cy.get('button[id="submit-login"]').click();

    // 2. Requerir pantalla 2FA
    cy.url().should('include', '/auth/2fa');
    cy.get('input[id="totp-field"]').type('123456'); // Código sandbox mockeado
    cy.get('button[id="submit-2fa"]').click();

    // 3. Redirección al Tactical HUD
    cy.url().should('include', '/dashboard');
    cy.get('[id="hud-risk-gauge"]').should('be.visible');

    // 4. Asegurar que las cookies de sesión son inaccesibles por JS
    cy.getCookie('sentinel_jwt_session').should('exist')
      .and((cookie) => {
        expect(cookie.httpOnly).to.be.true;
        expect(cookie.secure).to.be.true;
        expect(cookie.sameSite).to.equal('strict');
      });
  });
});
```

---

# 8. Module Contracts — APIs, NFRs y Criterios QA por Módulo

> **Referencia:** SAD §9 — Descomposición por módulos.  
> Cada contrato define los endpoints del módulo, sus NFRs vinculantes, los casos de prueba de alto nivel y el checklist de Compliance-QA que debe pasar antes de merge.

## 8.1 Frontend SPA (React 19)

**Endpoints consumidos (vía BFF):** `/api/auth/session`, `/api/auth/login`, `/api/auth/2fa/verify`, `/api/dashboard`, `/api/tax-profile/{id}`, `/api/alerts`, `/api/vault/upload`, `/api/nexus-ai/query`.

**NFRs:** LCP < 2.5s, CLS < 0.1, FID < 100ms, Lighthouse ≥ 90, Axe DevTools 0 violaciones, bundle < 300KB gzipped.

**Casos de prueba:** (1) Login → cookie HttpOnly, `document.cookie` vacío. (2) SSE actualiza RiskGauge < 5s. (3) Modo degradado: banner, botón SAT disabled, upload LENS enabled.

**Checklist QA:** ¿0 colores hardcoded? ¿0 violaciones Axe? ¿`credentials: 'include'`? ¿Sin `@google/genai` en bundle? ¿Skeleton/spinner en carga?

---

## 8.2 BFF Express 5

**Endpoints:** `/api/auth/login` (pública), `/api/auth/session`, `/api/auth/2fa/setup`, `/api/auth/logout`, `/api/me`, `/api/admin/users`, `/api/admin/users/invite`, `/api/admin/users/{id}/role`.

**NFRs:** Login < 1s p95, proxy forward < 100ms adicional, rate limiting login 5/min, API 100/min, cookies HttpOnly+Secure+SameSite=Strict.

**Casos de prueba:** (1) Login Google → 2FA → cookie HttpOnly. (2) VIEWER → POST `/admin/users/invite` → 403. (3) 6 intentos login fallidos → 429.

**Checklist QA:** ¿Cookies HttpOnly, Secure, SameSite=Strict? ¿Refresh token rotation? ¿CSRF en POST/PUT/DELETE? ¿Security headers? ¿RLS en queries Prisma? ¿Gitleaks limpio?

---

## 8.3 Core Fiscal (FastAPI)

**Endpoints:** `POST /api/v1/tax-profiles`, `POST /belvo/widget-token`, `POST /belvo/link-registered`, `POST /webhooks/belvo`, `POST /api/v1/lens/upload`, `GET /api/v1/belvo/sync-status/{id}`.

**NFRs:** API < 500ms p95, throughput 200 rps, HMAC validation < 10ms, SHA-256 dedup < 5ms, upload max 50MB ZIP / 10MB XML.

**Casos de prueba:** (1) Ciclo Belvo: widget→callback→webhook→facturas en DB. (2) CFDI duplicado Belvo vs LENS → rechazado con `quality_notes`. (3) Webhook sin Bearer → 401; IP no whitelist → 403.

**Checklist QA:** ¿`SET LOCAL app.current_tenant_id` en cada query? ¿Bearer token en webhooks Belvo (ADR-0008)? ¿Dedup SHA-256 Belvo+LENS? ¿CFDI inválido rechazado sin crash? ¿JWT interno requerido? ¿Zero credenciales SAT en logs?

---

## 8.4 Motor de Riesgo Matemático

**Endpoints:** `POST /api/v1/risk/analyze/{id}`, `GET /api/v1/risk/score/{id}`, `GET /api/v1/risk/anomalies/{id}`, `GET /api/v1/risk/trend/{id}`.

**NFRs:** Análisis < 2s (1000 facturas), batch > 100/min, determinista, probabilidad auditoría cap 80%.

**Casos de prueba:** (1) 65% ingresos de un cliente → RiskGauge ≥ 70, SINGLE_DEPENDENCY. (2) Perfil uniforme → RiskGauge < 30, SAFE. (3) Ventana cierre fiscal → sensibilidad +20%.

**Checklist QA:** ¿Determinista? ¿Sin APIs externas? ¿`rules_version` en cada risk_event? ¿Recomendaciones accionables? ¿Probabilidad nunca > 80%?

---

## 8.5 Motor PLD y Listas Negras

**Endpoints:** `GET /api/v1/pld/check/{id}`, `GET /api/v1/pld/checks`, `POST /api/v1/pld/screen`, `GET /api/v1/pld/thresholds`.

**NFRs:** Jaro-Winkler < 50ms, falsos positivos < 5%, PLD check < 200ms.

**Casos de prueba:** (1) Acumulado supera umbral Aviso → alerta HIGH. (2) Match OFAC ≥0.92 → alerta PLD_SCREENING, bloqueo. (3) Sin actividad vulnerable → CLEAR.

**Checklist QA:** ¿UMA vigente? ¿`pld_rules_version`? ¿Falsos positivos < 5%? ¿Listas OFAC/ONU semanales? ¿Alertas PLD no silenciables?

---

## 8.6 AI Proxy

**Endpoints:** `POST /api/v1/ai/risk-explanation`, `POST /api/v1/ai/explain-alert/{id}`, `POST /api/v1/ai/draft-response`, `POST /api/v1/ai/copilot`, `GET /api/v1/ai/audit`.

**NFRs:** Scrubbing < 50ms, Gemini < 2s p95, costo < $1 USD/tenant/mes, rate limit 20 req/min, pgvector top-5 < 20ms, caché semántica < 1h.

**Casos de prueba:** (1) Prompt con PII → scrubbed. (2) IA contradice ≥2 niveles + confianza < 90% → descarte. (3) Misma consulta en < 1h → Redis cache, $0.

**Checklist QA:** ¿Prompt original nunca logueado? ¿`test_pii_scrubber.py` 0 fugas? ¿Rate limit 20 req/min? ¿Contradicción correcta? ¿`ai_audit_logs` con tokens+costo? ¿API key en Secrets Manager?

---

## 8.7 Celery Workers

**Tareas:** `sync_belvo_invoices` (5min), `process_lens_upload` (10min), `nightly_69b_screening` (02:00 AM, 10min), `reconcile_belvo_syncs` (04:00 AM, 15min).

**NFRs:** Job pickup < 500ms, reintentos max 5 con backoff (2s-32s), DLQ visibilidad 7 días.

**Casos de prueba:** (1) Belvo sync → facturas en DB, SSE `sync_complete`. (2) 5 fallos → DLQ, alerta SRE. (3) ETL 69-B detecta clean→presunto → alerta HIGH.

**Checklist QA:** ¿Max 5 reintentos con backoff? ¿DLQ visible? ¿Lock en ETL? ¿Belvo 429 respeta Retry-After? ¿Workers no crashean?

---

## 8.8 Vault de Evidencia

**Endpoints:** `POST /api/v1/vault/cases`, `POST /api/v1/vault/cases/{id}/documents`, `GET /api/v1/vault/documents/{id}`, `POST /api/v1/vault/cases/{id}/export`.

**NFRs:** Sello NOM-151 < 2s, upload max 50MB, retención 5 años, WORM enforcement 100%.

**Casos de prueba:** (1) Subir PDF → S3 WORM + sello, `status='sealed'`. (2) DELETE doc 2 años → trigger rechaza, 403. (3) Exportar → ZIP con docs+.tsr+cadena+manifiesto SHA-256.

**Checklist QA:** ¿S3 Object Lock Compliance? ¿Triggers bloquean UPDATE/DELETE? ¿Sello automático? ¿Export 4 componentes? ¿Doble firma borrado? ¿MIME whitelist?

---

## 8.9 Administración y FinOps

**Endpoints:** `GET /api/v1/admin/users`, `POST /api/v1/admin/users/invite`, `DELETE /api/v1/admin/users/{id}`, `GET/PUT /api/v1/admin/tenant-config`, `GET /api/v1/admin/finops`, `POST /internal/authorize`.

> **Nota:** El endpoint `/internal/authorize` es implementado por **Core Fiscal** (SAD §9.3), pero su configuración y gestión de credenciales (API keys, whitelist de IPs, rate limits) se realiza desde el portal **Admin/FinOps**.

**NFRs:** CRUD < 200ms, FinOps < 5s, HMAC timingSafeEqual < 5ms, rate limit admin 30 req/min.

**Casos de prueba:** (1) OWNER invita ACCOUNTANT → email, `tenant_users`. (2) VIEWER intenta POST → 403, audit_logs. (3) `/internal/authorize` HMAC correcto → 200.

**Checklist QA:** ¿Solo OWNER asigna OWNER? ¿Desactivar no elimina? ¿Cambios en audit_logs con diff? ¿HMAC timingSafeEqual? ¿Rate limit 30 req/min?

---

## 8.10 Observabilidad y Auditoría

**Endpoints:** `GET /health`, `GET /metrics`, `GET /api/v1/admin/audit-logs`, `GET /api/v1/admin/ai-audit`.

**NFRs:** Trace sampling 100% errores/10% normal, log ingestion < 100ms, audit query < 500ms, health check 30s, métricas scrape 15s.

**Dashboards:** API Overview, Belvo Integration, AI Cost & Quality, DB Health, Executive (tenants activos, facturas, uptime).

**Casos de prueba:** (1) Request BFF→Core→Risk→DB → trace con spans anidados. (2) Belvo health check 2 fallos → alerta Slack. (3) UPDATE audit_logs → trigger rechaza.

**Checklist QA:** ¿Spans OT en todos los endpoints? ¿Logs sin PII? ¿Triggers WORM en audit_logs? ¿Dashboards cubren todos los módulos? ¿Alertas SRE configuradas? ¿`/health` con estado de cada dependencia?
