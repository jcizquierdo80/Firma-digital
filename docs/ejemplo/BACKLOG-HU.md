# BACKLOG DE HISTORIAS DE USUARIO (HU)
# Sentinel Nexus 360 Enterprise — v3.2.0-MASTER (Backlog Expandido — Post-Auditoría)

## 0. Control Documental

| Campo | Valor |
|:---|:---|
| **Versión** | v3.2.0-MASTER |
| **Fecha** | 2026-05-25 |
| **Autor** | Enterprise Architecture Team |
| **Estado** | Backlog Expandido Post-Auditoría |
| **Reemplaza** | BACKLOG-HU.md v3.1.1 |
| **Total HUs en catálogo** | 126 HUs en 14 épicas (44 MAPPED + 82 NEW) |
| **Documentos fuente** | BACKLOG-HU-EXPANDIDO-v3.1.1.json + BACKLOG-TEMP-EP*.md |

---

## 1. Metodología y Golden Template

### 1.1 Principios obligatorios

1. **Anclaje documental estricto.** Toda HU debe referenciar explícitamente secciones del [Master SAD](SAD.md), [SAD-Lite](SAD-Lite.md) y/o [Developer Handbook](Developer-Handbook.md). Cuando aplique, debe listar los ADR relevantes en su sección de trazabilidad. Una HU sin referencias no es una HU válida.

2. **No replicar detalles de implementación.** Las HUs son contratos funcionales. Los detalles de DDL, índices, código, YAML, regex de scrubbing PII, HMAC timingSafeEqual, etc., viven en el Developer Handbook. No se replican en cada HU. La HU dice *qué*, el Handbook dice *cómo*.

3. **Granularidad de sprint.** Una HU debe poder implementarse en **1 sprint** por un squad completo (BE + FE + QA + DevSecOps). Si toca más de 3 módulos simultáneamente o requeriría más de 10 días hábiles, debe partirse en HUs más pequeñas.

4. **Trazabilidad a flujos críticos.** Debe existir una relación clara entre cada HU y los flujos críticos del SAD §10 (onboarding, ingesta Belvo/LENS, screening 69-B, PLD por UMAs, atención de alertas, construcción de evidencia NOM-151, consulta IA con contradicción, modos degradados SAT/Belvo).

5. **Definition of Done (DoD) mínimo.** Ninguna HU se considera completada sin:
   - Cobertura de pruebas $\ge 75\%$ en el código afectado (pytest + Jest/Cypress).
   - Gates de SAST (Semgrep, Gitleaks) sin fallos críticos o altos.
   - Verificación de RLS en todas las queries afectadas mediante la suite `test_rls_isolation.py`.
   - Trazabilidad: registro inmutable en `audit_logs` de las mutaciones realizadas.

### 1.2 Formato estándar de Historia de Usuario (Golden Template)

Toda HU en Sentinel sigue esta estructura vinculante:

```markdown
### HU-NN.NN — [Título descriptivo]

**Épica:** EP-NN — [Nombre de la épica]
**Módulo(s):** [Lista de módulos del SAD §9 afectados]
**Historia:** Como [rol], quiero [acción] para [beneficio].

**Alcance:**
[Qué cubre esta HU exactamente. Dominios técnicos, tablas, endpoints.]

**Historia en formato Given/When/Then:**
- **Given** [precondición]
- **When** [acción del usuario o sistema]
- **Then** [resultado esperado]
- **And** [condiciones adicionales]

**Prerrequisitos y reglas de negocio:**
- Requiere: [HU-NN.NN, ADR-NNNN]
- Regla de negocio: [RN-001, referencia legal si aplica]

**Criterios de aceptación:**
1. [Criterio funcional verificable]
2. [Criterio funcional verificable]
3. [NFR específico: latencia, throughput, seguridad, auditabilidad]

**Impactos y consideraciones:**
- [Qué cambia para el usuario, SLA afectado, riesgo mitigado]

**Referencias y trazabilidad:**
- SAD: [§X.Y — Nombre de la sección]
- SAD-Lite: [§X — Nombre de la sección]
- Developer Handbook: [§X.Y — Nombre de la sección]
- ADR: [ADR-NNNN, ADR-NNNN]
- Tablas afectadas: [lista de tablas del DDL]
- Flujo crítico SAD §10: [§10.X — Nombre del flujo]
```

### 1.3 Criterios generales de completitud

¿**Un tester puede verificar esta HU sin preguntar nada al PO?** Si la respuesta es no, la HU necesita más detalle en criterios de aceptación.

### 1.4 Definition of Done canónica

| Gate | Herramienta | Umbral |
|:---|:---|:---|
| Cobertura de pruebas | pytest-cov / Jest --coverage | $\ge 75\%$ en código afectado |
| SAST | Semgrep, Gitleaks | 0 hallazgos críticos o altos |
| Aislamiento RLS | `test_rls_isolation.py` | 100% pass |
| Trazabilidad forense | `audit_logs` | Toda mutación registrada de forma inmutable |
| Accesibilidad | Axe DevTools | 0 violaciones críticas/serias (WCAG 2.1 AA) |
| Seguridad en dependencias | pip-audit / npm audit | 0 vulnerabilidades críticas o altas sin parche |

**Nota de canon vinculante:**
- PostgreSQL siempre 17
- Python siempre 3.12
- Jaro-Winkler $d_{jw} \ge 0.92$
- AI contradiction siempre < 90%
- Belvo Bearer token (ADR-0008)
- `invoice_hash` / `uuid` (no xmlsha256 / satuuid)
- `documentacion/` (no `docs/`)
- Vanilla CSS (sin Tailwind)

---

## 2. Mapa de Dependencias entre Épicas (14 épicas)

### 2.1 Orden de construcción (LINP: Lógico, Integración, No-funcional, Producto)

```
Layer 0 — Fundacional (sin dependencias externas)
  EP-01 (Gobierno Documental y ADRs)
  EP-14 (Observabilidad, QA, DevSecOps y Release) [cross-cutting]

Layer 1 — Core de Datos
  EP-01 ──► EP-02 (Identidad, Sesión y 2FA)
              └► EP-03 (RBAC, Tenancy y Administración)
                   └► EP-04 (Persistencia, RLS y Migraciones)

Layer 2 — Ingesta de Datos
  EP-04 ──► EP-05 (Onboarding y Tax Profiles)
              ├► EP-06 (Ingesta Belvo y Reconciliación)
              └► EP-07 (LENS, Parsing y Calidad CFDI)

Layer 3 — Analítica
  EP-06 ──► EP-08 (Riesgo Matemático y Versionado)
  EP-07 ──► EP-09 (PLD, OFAC/ONU/PEPs y 69-B)
              ├► EP-10 (Alertas, Locking y Gestión de SLA)

Layer 4 — Evidencia e IA
  EP-10 ──► EP-11 (Vault, NOM-151 y Exportación)
  EP-08 ──► EP-12 (AI Proxy, Scrubbing, Contradicción y AI Audit)

Layer 5 — UX
  EP-08..EP-12 ──► EP-13 (HUD, UX Operativa y Accesibilidad)

EP-14 (Observabilidad/DevSecOps) ── cross-cutting, acompaña todo el ciclo
```

### 2.2 Reglas de dependencia

- **EP-01** bloquea cualquier HU que requiera ADRs o documentación validada.
- **EP-02** bloquea cualquier HU que asuma autenticación, sesiones o MFA.
- **EP-03** bloquea cualquier HU que requiera RBAC, tenancy o administración de usuarios.
- **EP-04** bloquea cualquier HU que lea/escriba datos multi-tenant con RLS.
- **EP-05** bloquea la ingesta de datos y el motor de riesgo.
- **EP-06/EP-07** bloquean el motor de riesgo, PLD y HUD (se requieren datos).
- **EP-08/EP-09** bloquean alertas, vault, IA y HUD para métricas y alertas.
- **EP-10** bloquea Vault (los casos se crean sobre alertas).
- **EP-11, EP-12 y EP-13** se construyen concurrentemente sobre la base de las anteriores.

### 2.3 Versión LINP

| Capa | Definición | Layer Check |
|:---|:---|:---|
| **L** (Lógico) | Lógica de negocio, algoritmos de riesgo y reglas PLD ejecutadas localmente. | ¿Se puede probar con mock de APIs externas? |
| **I** (Integración) | Integraciones con Belvo, SAT, OFAC, Gemini y PSC bajo contrato de API. | ¿El adaptador externo tiene tests de contrato? |
| **N** (No-funcional) | RLS, WORM, HttpOnly, scrubbing PII, timingSafeEqual, AES-256-GCM. | ¿Pasó SAST, test RLS y Gitleaks? |
| **P** (Producto) | UX en React 19 con Vanilla CSS Liquid Glass usable, accesible y dentro de SLAs. | ¿Pasó Cypress E2E y Axe a11y audit? |

---

## 3. Tabla de Correspondencia (Old 7 épicas → New 14 épicas)

| Old ID | Old Title (abreviado) | New ID | New Épica | Notes |
|:---|:---|:---|:---|:---|
| HU-01.01 | Esquema físico DDL completo en Docker | HU-04.01 | EP-04 — Persistencia, RLS y Migraciones | Renumbered: old EP-01 → new EP-04 |
| HU-01.02 | Inyector de contexto RLS en SQLAlchemy 2.0 | HU-04.02 | EP-04 — Persistencia, RLS y Migraciones | Renumbered |
| HU-01.03 | Extensión Prisma Client + AsyncLocalStorage | HU-04.03 | EP-04 — Persistencia, RLS y Migraciones | Renumbered |
| HU-01.04 | Políticas RLS y constraints de rendimiento PG 17 | HU-04.04 | EP-04 — Persistencia, RLS y Migraciones | Renumbered |
| HU-01.05 | Ingesta y calidad de CFDIs en LENS | HU-07.01 | EP-07 — LENS, Parsing y Calidad CFDI | Moved: old EP-01 → new EP-07 |
| HU-02.01 | BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie | HU-02.01 | EP-02 — Identidad, Sesión y 2FA | Same épica |
| HU-02.02 | Autenticación 2FA TOTP con QR y backup codes | HU-02.02 | EP-02 — Identidad, Sesión y 2FA | Same épica |
| HU-02.03 | "Mi Perfil": datos personales, idioma, zona horaria | HU-03.01 | EP-03 — RBAC, Tenancy y Administración | Moved: old EP-02 → new EP-03 |
| HU-02.04 | Configuración de notificaciones y alertas | HU-03.02 | EP-03 — RBAC, Tenancy y Administración | Moved |
| HU-02.05 | Portal del Oficial de Cumplimiento | HU-03.03 | EP-03 — RBAC, Tenancy y Administración | Moved |
| HU-02.06 | Administración de usuarios y roles del tenant | HU-03.04 | EP-03 — RBAC, Tenancy y Administración | Moved |
| HU-02.07 | Configuración global del despacho | HU-03.05 | EP-03 — RBAC, Tenancy y Administración | Moved |
| HU-03.01 | Ingesta histórica y recurrente Belvo Fiscal API | HU-06.01 | EP-06 — Ingesta Belvo y Reconciliación | Moved: old EP-03 → new EP-06 |
| HU-03.02 | Doble verificación HMAC SHA-256 webhooks Belvo | HU-06.02 | EP-06 — Ingesta Belvo y Reconciliación | Moved; uses Bearer token (ADR-0008) |
| HU-03.03 | Deduplicación CFDI en caliente SHA-256 | HU-07.02 | EP-07 — LENS, Parsing y Calidad CFDI | Moved: old EP-03 → new EP-07 |
| HU-03.04 | Contingencia operativa ante degradación SAT/Belvo | HU-07.03 | EP-07 — LENS, Parsing y Calidad CFDI | Moved |
| HU-03.05 | Monitoreo de estado de ingesta y progress UI | HU-06.03 | EP-06 — Ingesta Belvo y Reconciliación | Moved |
| HU-04.01 | ETL nocturno 69-B y marcaje de facturas | HU-09.01 | EP-09 — PLD, OFAC/ONU/PEPs y 69-B | Moved: old EP-04 → new EP-09 |
| HU-04.02 | RiskGauge por perfil fiscal | HU-08.01 | EP-08 — Riesgo Matemático y Versionado | Moved: old EP-04 → new EP-08 |
| HU-04.03 | Motor PLD: cálculo por UMAs y alertamiento | HU-09.02 | EP-09 — PLD, OFAC/ONU/PEPs y 69-B | Moved |
| HU-04.04 | Screening OFAC/ONU/PEPs (Jaro-Winkler ≥0.92) | HU-09.03 | EP-09 — PLD, OFAC/ONU/PEPs y 69-B | Moved |
| HU-04.05 | Configuración del Calendario Fiscal y IQR estacional | HU-08.02 | EP-08 — Riesgo Matemático y Versionado | Moved |
| HU-04.06 | Configuración de criticidad, coverage_level y SLAs | HU-10.01 | EP-10 — Alertas, Locking y Gestión de SLA | Moved: old EP-04 → new EP-10 |
| HU-04.07 | Versionado de risk_rules y pld_rules | HU-08.03 | EP-08 — Riesgo Matemático y Versionado | Moved |
| HU-04.08 | Pruebas automatizadas transición 69-B, PLD, RiskGauge | HU-09.04 | EP-09 — PLD, OFAC/ONU/PEPs y 69-B | Moved |
| HU-04.09 | Bloqueo Concurrente de Alertas con Expiración | HU-10.02 | EP-10 — Alertas, Locking y Gestión de SLA | Renumbered; was old HU-02.03→04.09→now 10.02 |
| HU-05.01 | Crear caso de evidencia en S3 WORM | HU-11.01 | EP-11 — Vault, NOM-151 y Exportación | Moved: old EP-05 → new EP-11 |
| HU-05.02 | Subir documentos a Vault y sello NOM-151 | HU-11.02 | EP-11 — Vault, NOM-151 y Exportación | Moved |
| HU-05.03 | Consultar historial de evidencia | HU-11.03 | EP-11 — Vault, NOM-151 y Exportación | Moved |
| HU-05.04 | Exportar expediente de evidencia WORM | HU-11.04 | EP-11 — Vault, NOM-151 y Exportación | Moved |
| HU-05.05 | Políticas de retención y borrado controlado | HU-11.05 | EP-11 — Vault, NOM-151 y Exportación | Moved |
| HU-05.06 | Caja Negra de Auditoría WORM en audit_logs | HU-11.06 | EP-11 — Vault, NOM-151 y Exportación | Renumbered; was old HU-02.04→05.06→now 11.06 |
| HU-06.01 | AI Proxy con Enmascaramiento Local de PII | HU-12.01 | EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit | Moved: old EP-06 → new EP-12 |
| HU-06.02 | Copiloto de Compliance Fiscal Gemini 2.5 Flash Lite | HU-12.02 | EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit | Moved |
| HU-06.03 | Filtro de Detección de Contradicción Semántica | HU-12.03 | EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit | Moved |
| HU-06.04 | Scrubbing PII local antes de Gemini | HU-12.04 | EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit | Moved |
| HU-06.05 | Motor de contradicción IA vs riesgo (umbral 90%) | HU-12.05 | EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit | Moved |
| HU-06.06 | Trazabilidad de consultas IA y auditoría | HU-12.06 | EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit | Moved |
| HU-07.01 | Dashboard Tactical HUD Liquid Glass en React 19 | HU-13.01 | EP-13 — HUD, UX Operativa y Accesibilidad | Moved: old EP-07 → new EP-13 |
| HU-07.02 | Vista de perfil fiscal | HU-13.02 | EP-13 — HUD, UX Operativa y Accesibilidad | Moved |
| HU-07.03 | Vista de alertas (lista, filtros, locking, estados) | HU-13.03 | EP-13 — HUD, UX Operativa y Accesibilidad | Moved |
| HU-07.04 | Quick Setup UX y Bypass Banner cobertura limitada | HU-13.04 | EP-13 — HUD, UX Operativa y Accesibilidad | Moved |
| HU-07.05 | UX de modos degradados SAT/Belvo | HU-13.05 | EP-13 — HUD, UX Operativa y Accesibilidad | Moved |
| HU-07.06 | Accesibilidad y usabilidad WCAG 2.1 AA | HU-13.06 | EP-13 — HUD, UX Operativa y Accesibilidad | Moved |

**Total: 44 HUs mapeadas (old → new)**

---

## 4. Catálogo Canónico (14 épicas, 126 HUs)

### 4.0 Tabla Maestra

| EP | New ID | Title | Status | Priority | SP | Depends On | Modules | ADRs | Tests |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|:---|:---|
| **EP-01 — Gobierno Documental y ADRs (6 HUs)** |
| 01 | HU-01.01 | Creación y versionado de ADRs con plantilla estandarizada | NEW | CRITICAL | 5 | — | SAD §2, §23, §24 | — | test_adr_template.py, test_adr_version.py |
| 01 | HU-01.02 | Validación automatizada de consistencia documental SAD ↔ ADRs | NEW | HIGH | 5 | HU-01.01 | SAD §2, §23.4 | — | test_doc_consistency.py |
| 01 | HU-01.03 | Versionado semántico del SAD y trazabilidad de cambios con changelog | NEW | HIGH | 5 | HU-01.01 | SAD §1, §23, §24 | — | test_sad_versioning.py, test_changelog.py |
| 01 | HU-01.04 | Checklist de compliance arquitectónico pre-merge con gates automatizados | NEW | HIGH | 5 | HU-01.02 | SAD §23.4, §24.5 | — | test_compliance_checklist.py |
| 01 | HU-01.05 | Gobernanza de cambios arquitectónicos con comité de revisión digital | NEW | MEDIUM | 3 | HU-01.04 | SAD §2, §23, DH §7 | — | test_gov_change_request.py |
| 01 | HU-01.06 | Onboarding documental para nuevos desarrolladores con mapa de conocimiento | NEW | MEDIUM | 3 | HU-01.01 | SAD §2, DH §1 | — | test_onboarding_docs.py |
| **EP-02 — Identidad, Sesión y 2FA (8 HUs)** |
| 02 | HU-02.01 | BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie | MAPPED | CRITICAL | 8 | — | SAD §9.2, §13.4, §13.6 | ADR-0005 | test_auth_federated.ts, test_login_flow.ts |
| 02 | HU-02.02 | Autenticación 2FA TOTP con códigos QR y backup codes | MAPPED | CRITICAL | 8 | HU-02.01 | SAD §9.2, §13.4 | ADR-0006 | test_jwt_cookies.ts, test_2fa_flow.ts |
| 02 | HU-02.03 | Gestión de sesiones multi-dispositivo con revocación remota | NEW | HIGH | 5 | HU-02.01 | SAD §9.2, §13.6 | ADR-0005, — | test_session_mgmt.ts, test_session_revoke.ts |
| 02 | HU-02.04 | Política de contraseñas robustas con rotación forzada según NIST 800-63B | NEW | HIGH | 5 | HU-02.01 | SAD §9.2, §13.4 | ADR-0006, — | test_password_policy.ts |
| 02 | HU-02.05 | Integración SSO empresarial SAML/OIDC para holdings corporativos | NEW | MEDIUM | 8 | HU-02.01 | SAD §9.2, §13.4 | — | test_sso_saml.ts, test_sso_oidc.ts |
| 02 | HU-02.06 | Protección anti-brute-force con rate limiting y lockout temporal progresivo | NEW | HIGH | 5 | HU-02.01, HU-02.04 | SAD §9.2, §13.8 | — | test_bruteforce_protection.ts |
| 02 | HU-02.07 | Detección de sesiones anómalas por geolocalización y device fingerprint | NEW | MEDIUM | 5 | HU-02.01, HU-02.03 | SAD §9.2, §13.6, §13.8 | — | test_anomaly_sessions.ts |
| 02 | HU-02.08 | Recuperación segura de cuenta con verificación multi-canal | NEW | HIGH | 5 | HU-02.01, HU-02.02 | SAD §9.2, §13.4 | ADR-0006, — | test_account_recovery.ts |
| **EP-03 — RBAC, Tenancy y Administración (9 HUs)** |
| 03 | HU-03.01 | "Mi Perfil": gestión de datos personales, idioma y zona horaria | MAPPED | MEDIUM | 3 | — | SAD §9.3, §13.5 | ADR-0001 | test_profile_api.ts, test_profile_update.ts |
| 03 | HU-03.02 | Configuración de preferencias de notificaciones y canales de alerta | MAPPED | MEDIUM | 3 | — | SAD §9.3, §9.10 | — | test_prefs_api.ts, test_notif_config.ts |
| 03 | HU-03.03 | Portal del Oficial de Cumplimiento: visualizador y exportador de bitácoras WORM | MAPPED | CRITICAL | 5 | — | SAD §9.3, §9.10, §11.8 | ADR-0008 | test_worm_viewer.ts |
| 03 | HU-03.04 | Administración de usuarios y roles del tenant con matriz RBAC granular | MAPPED | HIGH | 5 | HU-03.01 | SAD §9.3, §13.5 | ADR-0001 | test_rbac_api.ts, test_user_mgmt.ts |
| 03 | HU-03.05 | Configuración global del despacho: parámetros FinOps, PLD y calendario fiscal | MAPPED | HIGH | 5 | — | SAD §9.3, §9.4 | ADR-0009 | test_tenant_config.py, test_finops_params.py |
| 03 | HU-03.06 | Gestión de tenancy multi-despacho para holdings con sub-tenants anidados | NEW | HIGH | 8 | HU-03.04, HU-03.05 | SAD §9.3, §11.6 | ADR-0001, ADR-0002 | test_multitenant_holding.py, test_subtenant_isolation.py |
| 03 | HU-03.07 | Dashboard de auditoría RBAC con matriz de permisos interactiva y simulación | NEW | MEDIUM | 5 | HU-03.04 | SAD §9.3, §13.5, §9.10 | ADR-0001, — | test_rbac_dashboard.tsx, test_permission_matrix.tsx |
| 03 | HU-03.08 | API keys y gestión de tokens de servicio para integraciones externas (M2M) | NEW | MEDIUM | 5 | HU-03.04 | SAD §9.3, §13.5, §13.8 | — | test_api_keys.py, test_m2m_auth.py |
| 03 | HU-03.09 | Log de actividad administrativa inmutable para cambios de roles, permisos y config | NEW | HIGH | 5 | HU-03.04 | SAD §9.3, §11.8 | ADR-0008 | test_admin_audit_log.py |
| **EP-04 — Persistencia, RLS y Migraciones (10 HUs)** |
| 04 | HU-04.01 | Esquema físico DDL completo en Docker con PostgreSQL 17 y pgvector | MAPPED | CRITICAL | 5 | — | SAD §9.1, §11.2 | ADR-0001 | test_ddl_migrations.py |
| 04 | HU-04.02 | Inyector de contexto RLS en SQLAlchemy 2.0 para FastAPI Core | MAPPED | CRITICAL | 8 | HU-04.01 | SAD §9.1, §11.6 | ADR-0002 | test_rls_injector.py, test_rls_isolation.py |
| 04 | HU-04.03 | Extensión Prisma Client + AsyncLocalStorage para Express BFF | MAPPED | CRITICAL | 8 | HU-04.01 | SAD §9.1, §11.6 | ADR-0003 | test_prisma_rls.ts |
| 04 | HU-04.04 | Políticas RLS y constraints de rendimiento en PostgreSQL 17 con índices B-Tree | MAPPED | CRITICAL | 5 | HU-04.01 | SAD §9.1, §11.6 | ADR-0004 | test_rls_policies.sql |
| 04 | HU-04.05 | Sistema de migraciones Flyway/Alembic con rollback automático y validación pre-flight | NEW | CRITICAL | 8 | HU-04.01 | SAD §9.1, §11.2 | ADR-0004, — | test_migrations_flyway.py, test_migration_rollback.py |
| 04 | HU-04.06 | Backups automatizados con point-in-time recovery (PITR) y retención configurable | NEW | CRITICAL | 8 | HU-04.01, HU-04.05 | SAD §9.1, §11.2 | — | test_backup_pitr.py, test_restore_validation.py |
| 04 | HU-04.07 | Índices de rendimiento y optimización de consultas analíticas para el HUD | NEW | HIGH | 5 | HU-04.04 | SAD §9.1, §11.6 | ADR-0004 | test_query_performance.py |
| 04 | HU-04.08 | Particionamiento horizontal de invoices por año fiscal con pruning automático | NEW | HIGH | 8 | HU-04.01, HU-04.05 | SAD §9.1, §11.2 | ADR-0004, — | test_partitioning.py, test_partition_pruning.py |
| 04 | HU-04.09 | Health checks de base de datos con métricas de conexiones, locks y replicación | NEW | HIGH | 5 | HU-04.01 | SAD §9.1, §9.10 | — | test_db_health.py |
| 04 | HU-04.10 | Estrategia de seeding de datos de prueba con anonimización de PII y fixtures | NEW | MEDIUM | 5 | HU-04.01 | SAD §9.1, DH §7 | — | test_seed_data.py, test_anon_fixtures.py |
| **EP-05 — Onboarding y Tax Profiles (8 HUs)** |
| 05 | HU-05.01 | Wizard de onboarding guiado paso a paso para nuevos despachos contables | NEW | CRITICAL | 8 | HU-04.01, HU-04.02, HU-03.01 | SAD §9.5, §10.1 | — | test_onboarding_wizard.tsx, test_onboarding_flow.py |
| 05 | HU-05.02 | Integración Belvo Widget para vinculación de credenciales SAT en el onboarding | NEW | CRITICAL | 8 | HU-05.01 | SAD §9.5, §12.1 | ADR-0009, — | test_belvo_widget.tsx, test_belvo_link.py |
| 05 | HU-05.03 | Validación de RFC en onboarding: estructura, homoclave y vigencia contra SAT | NEW | HIGH | 5 | HU-05.01 | SAD §9.5, §10.1 | — | test_rfc_validator.py, test_rfc_onboarding.tsx |
| 05 | HU-05.04 | Creación y configuración de tax_profile con niveles de cobertura y criticidad | NEW | HIGH | 5 | HU-05.01, HU-05.03 | SAD §9.5, §10.1, §17.5 | ADR-0009 | test_tax_profile_crud.py, test_tax_profile_setup.tsx |
| 05 | HU-05.05 | Migración de datos fiscales históricos desde sistemas legacy (CSV/Excel/ZIP) | NEW | MEDIUM | 5 | HU-05.04 | SAD §9.5, §10.2 | —, — | test_legacy_migration.py, test_legacy_parser.py |
| 05 | HU-05.06 | Verificación de identidad del representante legal con e.firma/CIEC ante SAT | NEW | HIGH | 5 | HU-05.02, HU-05.03 | SAD §9.5, §12.2 | ADR-0009, — | test_identity_verification.py |
| 05 | HU-05.07 | Configuración asistida de parámetros FinOps y umbrales PLD por tipo de contribuyente | NEW | MEDIUM | 5 | HU-05.04 | SAD §9.5, §17.5 | ADR-0009, —, — | test_finops_setup.py, test_finops_templates.tsx |
| 05 | HU-05.08 | Dashboard de estado de onboarding con indicadores de completitud y checklist | NEW | MEDIUM | 3 | HU-05.01 | SAD §9.5, §18.2 | — | test_onboarding_dashboard.tsx |
| **EP-06 — Ingesta Belvo y Reconciliación (9 HUs)** |
| 06 | HU-06.01 | Ingesta histórica y recurrente Belvo Fiscal API con workers Celery | MAPPED | HIGH | 8 | HU-04.01, HU-04.02, HU-05.04 | SAD §9.6, §10.3, §12.1 | ADR-0009 | test_belvo_adapter.py, test_belvo_ingest.py |
| 06 | HU-06.02 | Verificación de Bearer token y timingSafeEqual en webhooks Belvo | MAPPED | CRITICAL | 5 | HU-06.01 | SAD §9.6, §12.1, §13.8 | ADR-0008 | test_webhook_hmac.py, test_webhook_security.py |
| 06 | HU-06.03 | Monitoreo de estado de ingesta con barra de progreso en tiempo real (Redis/SSE) | MAPPED | MEDIUM | 5 | HU-06.01 | SAD §9.6, §18.2 | — | test_sync_status.py, test_progress_ui.tsx |
| 06 | HU-06.04 | Reconciliación automática de facturas Belvo vs datos internos con matching difuso | NEW | HIGH | 8 | HU-06.01 | SAD §9.6, §10.4 | —, — | test_belvo_reconciliation.py |
| 06 | HU-06.05 | Reintentos con backoff exponencial y circuit breaker para API Belvo | NEW | HIGH | 5 | HU-06.01 | SAD §9.6, §12.1 | —, — | test_belvo_retries.py, test_circuit_breaker.py |
| 06 | HU-06.06 | Idempotencia en procesamiento de webhooks con deduplicación de eventos | NEW | HIGH | 5 | HU-06.02 | SAD §9.6, §12.1 | ADR-0008, — | test_webhook_idempotency.py |
| 06 | HU-06.07 | Sincronización delta incremental Belvo: solo cambios desde última sincronización | NEW | HIGH | 5 | HU-06.01 | SAD §9.6, §10.3 | ADR-0009, — | test_belvo_delta_sync.py |
| 06 | HU-06.08 | Manejo de rate limits y throttling inteligente de API Belvo con cola priorizada | NEW | MEDIUM | 5 | HU-06.01, HU-06.05 | SAD §9.6, §12.1 | — | test_rate_limiting.py, test_throttling.py |
| 06 | HU-06.09 | Dashboard de salud de conexiones Belvo por tax_profile con historial de estado | NEW | MEDIUM | 3 | HU-06.01, HU-06.05 | SAD §9.6, §9.10 | — | test_belvo_health_dashboard.tsx |
| **EP-07 — LENS, Parsing y Calidad CFDI (8 HUs)** |
| 07 | HU-07.01 | Ingesta y calidad de CFDIs en LENS: validación estructural y de RFCs | MAPPED | HIGH | 5 | HU-04.01 | SAD §9.7, §10.2 | — | test_cfdi_parser.py, test_lens_quality.py |
| 07 | HU-07.02 | Deduplicación CFDI en caliente con SHA-256 entre Belvo y LENS | MAPPED | HIGH | 5 | HU-07.01, HU-06.01 | SAD §9.7, §10.4 | — | test_cfdi_dedup.py, test_lens_belvo_dedup.py |
| 07 | HU-07.03 | Contingencia operativa ante degradación y caída del SAT/Belvo con modo offline | MAPPED | HIGH | 5 | HU-07.01 | SAD §9.7, §10.12 | — | test_degraded_mode.py |
| 07 | HU-07.04 | Parser ZIP multi-factura con procesamiento paralelo y detección de archivos anidados | NEW | HIGH | 5 | HU-07.01 | SAD §9.7, §10.2 | — | test_zip_parser.py |
| 07 | HU-07.05 | Validación estructural XSD contra esquemas oficiales CFDI 4.0 del SAT | NEW | HIGH | 5 | HU-07.01 | SAD §9.7, §10.2 | — | test_xsd_validator.py |
| 07 | HU-07.06 | Extracción y normalización de metadatos de CFDIs (UUID, RFC, montos, métodos de pago) | NEW | HIGH | 5 | HU-07.01 | SAD §9.7, §10.2 | — | test_metadata_extraction.py |
| 07 | HU-07.07 | Motor de calidad de datos CFDI con flags dinámicos y scoring de integridad fiscal | NEW | HIGH | 5 | HU-07.01, HU-07.06 | SAD §9.7, §11.2 | — | test_quality_flags.py, test_quality_scoring.py |
| 07 | HU-07.08 | Merge inteligente Belvo + LENS sin duplicados con resolución de conflictos por timestamp | NEW | HIGH | 5 | HU-07.02, HU-06.01 | SAD §9.7, §10.4 | —, — | test_merge_belvo_lens.py |
| **EP-08 — Riesgo Matemático y Versionado (10 HUs)** |
| 08 | HU-08.01 | RiskGauge por perfil fiscal: score consolidado 0-100 con HHI, alertas y PLD | MAPPED | HIGH | 5 | HU-07.02, HU-07.08 | SAD §9.4, §17.3 | — | test_riskgauge.py, test_risk_analysis.py |
| 08 | HU-08.02 | Configuración del calendario fiscal y ajustes IQR estacionales por periodo | MAPPED | HIGH | 5 | HU-08.01 | SAD §9.4, §17.3 | — | test_calendar_iqr.py, test_seasonal_sensitivity.py |
| 08 | HU-08.03 | Versionado de risk_rules y pld_rules con auditoría de cambios y rollback | MAPPED | HIGH | 5 | HU-08.01 | SAD §9.4, §17.3, §17.5 | ADR-0009, — | test_rules_version.py, test_version_audit.py |
| 08 | HU-08.04 | Cálculo de HHI (Herfindahl-Hirschman) con segmentación por proveedor y sector | NEW | HIGH | 5 | HU-08.01 | SAD §9.4, §17.3 | — | test_hhi_calculation.py |
| 08 | HU-08.05 | Detección de outliers combinado: IQR + Z-Score con pesos dinámicos por sector | NEW | HIGH | 5 | HU-08.01, HU-08.02 | SAD §9.4, §17.3 | — | test_iqr_zscore.py |
| 08 | HU-08.06 | Análisis de tendencia temporal de riesgo con series de tiempo y forecasting | NEW | MEDIUM | 5 | HU-08.01 | SAD §9.4, §17.3 | — | test_trend_analysis.py |
| 08 | HU-08.07 | Simulación de escenarios fiscales: what-if analysis con parámetros ajustables | NEW | MEDIUM | 8 | HU-08.01, HU-08.05 | SAD §9.4, §17.3 | — | test_scenario_simulation.py |
| 08 | HU-08.08 | Exportación de reportes de riesgo en PDF/Excel con branding del despacho | NEW | MEDIUM | 5 | HU-08.01 | SAD §9.4, §11.8 | — | test_risk_export.py |
| 08 | HU-08.09 | Caching inteligente de scores de riesgo en Redis con invalidación reactiva | NEW | MEDIUM | 5 | HU-08.01 | SAD §9.4, §17.3 | — | test_risk_cache.py |
| 08 | HU-08.10 | Comparativa de riesgo entre periodos fiscales: MoM, QoQ, YoY con visualización | NEW | MEDIUM | 5 | HU-08.01, HU-08.06 | SAD §9.4, §18.2 | — | test_risk_comparative.tsx |
| **EP-09 — PLD, OFAC/ONU/PEPs y 69-B (10 HUs)** |
| 09 | HU-09.01 | ETL nocturno 69-B: descarga de listado SAT, marcaje de facturas y alertas | MAPPED | HIGH | 8 | HU-07.02, HU-07.08 | SAD §9.5, §10.6, §12.2 | — | test_69b_etl.py, test_69b_workflow.py |
| 09 | HU-09.02 | Motor PLD: cálculo dinámico por UMAs con ventana móvil de 30 días | MAPPED | HIGH | 5 | HU-07.02 | SAD §9.5, §17.3, §17.5 | — | test_pld_umas.py, test_pld_alerting.py |
| 09 | HU-09.03 | Screening de listas OFAC/ONU/PEPs con Jaro-Winkler d_jw ≥ 0.92 | MAPPED | HIGH | 5 | HU-07.02 | SAD §9.5, §17.5 | — | test_jaro_winkler.py, test_screening_ofac.py |
| 09 | HU-09.04 | Suite de pruebas automatizadas para transiciones 69-B, PLD y RiskGauge | MAPPED | HIGH | 5 | HU-09.01, HU-09.02, HU-09.03 | SAD §9.5, DH §7 | — | test_69b_mock_data.py, test_pld_mock_flow.py |
| 09 | HU-09.05 | Screening batch nocturno unificado: 69-B + OFAC/ONU + PLD en lote secuencial | NEW | HIGH | 8 | HU-09.01, HU-09.02, HU-09.03 | SAD §9.5, §10.6 | — | test_unified_screening.py |
| 09 | HU-09.06 | Actualización semanal automatizada de listas OFAC/ONU con verificación de integridad | NEW | HIGH | 5 | HU-09.03 | SAD §9.5, §12.3 | —, — | test_ofac_sync.py |
| 09 | HU-09.07 | Detección avanzada de PEPs y familiares con scoring de afinidad y red de vínculos | NEW | HIGH | 5 | HU-09.03 | SAD §9.5, §17.5 | —, — | test_pep_detection.py, test_pep_affinity.py |
| 09 | HU-09.08 | Generación de reportes pre-UIF con formato oficial LFPIORPI y exportación PDF/XML | NEW | CRITICAL | 8 | HU-09.02 | SAD §9.5, §10.7, §11.8 | —, — | test_uif_report.py, test_uif_export.py |
| 09 | HU-09.09 | Bitácora inmutable de screening con trazabilidad de fuentes, versiones y decisiones | NEW | HIGH | 5 | HU-09.05 | SAD §9.5, §11.8 | ADR-0008, — | test_screening_audit_log.py |
| 09 | HU-09.10 | Simulación de impacto 69-B: análisis predictivo de riesgo si un proveedor es listado | NEW | MEDIUM | 5 | HU-09.01 | SAD §9.5, §17.3 | — | test_69b_simulation.py |
| **EP-10 — Alertas, Locking y Gestión de SLA (9 HUs)** |
| 10 | HU-10.01 | Configuración de criticidad, coverage_level y SLAs por tax_profile | MAPPED | HIGH | 5 | HU-09.01, HU-09.02 | SAD §9.10, §17.5 | ADR-0009, — | test_criticality_api.py, test_coverage_rules.py |
| 10 | HU-10.02 | Bloqueo concurrente de alertas con expiración automática a 30 minutos | MAPPED | HIGH | 5 | HU-10.01 | SAD §9.10, §10.8 | ADR-0007 | test_alert_locking.py, test_alert_locking_integ.py |
| 10 | HU-10.03 | Canal multi-notificaciones: email, Slack, Microsoft Teams y webhooks personalizados | NEW | HIGH | 8 | HU-10.01 | SAD §9.10, §13.8 | — | test_notif_channels.py, test_notif_delivery.py |
| 10 | HU-10.04 | Routing inteligente de alertas por criticidad y especialidad del analista asignado | NEW | HIGH | 5 | HU-10.01 | SAD §9.10, §10.8 | — | test_alert_routing.py |
| 10 | HU-10.05 | SLA timer con escalación automática L1→L2→L3→Oficial de Cumplimiento | NEW | CRITICAL | 8 | HU-10.01, HU-10.04 | SAD §9.10, §10.8 | — | test_sla_timer.py, test_escalation.py |
| 10 | HU-10.06 | Cierre de alertas con co-firma digital: doble validación analista + oficial | NEW | CRITICAL | 5 | HU-10.02 | SAD §9.10, §10.8, §11.8 | ADR-0008, — | test_co_sign.py, test_dual_auth_close.py |
| 10 | HU-10.07 | Dashboard de alertas vencidas con métricas de tiempo medio de resolución (MTTR) | NEW | MEDIUM | 5 | HU-10.05 | SAD §9.10, §18.2 | — | test_sla_dashboard.tsx, test_mttr_metrics.py |
| 10 | HU-10.08 | Plantillas de respuesta estandarizadas para tipos de alerta recurrentes | NEW | MEDIUM | 3 | HU-10.01 | SAD §9.10, §10.8 | — | test_response_templates.py |
| 10 | HU-10.09 | Workflow completo de ciclo de vida de alerta: OPEN → IN_PROGRESS → RESOLVED → CLOSED | NEW | HIGH | 5 | HU-10.02, HU-10.06 | SAD §9.10, §10.8 | ADR-0007, — | test_alert_workflow.py, test_alert_states.tsx |
| **EP-11 — Vault, NOM-151 y Exportación (10 HUs)** |
| 11 | HU-11.01 | Creación de caso de evidencia vinculado a alerta con expediente en S3 WORM | MAPPED | CRITICAL | 8 | HU-10.02, HU-10.09 | SAD §9.8, §10.9, §11.8 | — | test_vault_case.py, test_evidence_link.py |
| 11 | HU-11.02 | Subida de documentos a Vault y sellado criptográfico NOM-151-SCFI-2016 vía PSC | MAPPED | CRITICAL | 8 | HU-11.01 | SAD §9.8, §10.9 | — | test_nom151_seal.py, test_vault_upload.py |
| 11 | HU-11.03 | Consulta de historial de evidencia por alerta/perfil fiscal con bitácora de acceso | MAPPED | HIGH | 5 | HU-11.01 | SAD §9.8, §11.8 | ADR-0008 | test_vault_query.py, test_evidence_history.py |
| 11 | HU-11.04 | Exportación de expediente de evidencia WORM firmado digitalmente para auditoría | MAPPED | HIGH | 5 | HU-11.01 | SAD §9.8, §11.8 | ADR-0005, ADR-0008 | test_worm_export.py, test_evidence_export.py |
| 11 | HU-11.05 | Políticas de retención documental y borrado controlado legalmente permitido | MAPPED | HIGH | 5 | HU-11.01 | SAD §9.8, §11.8 | ADR-0005, ADR-0008, — | test_retention_policy.py, test_legal_purge.py |
| 11 | HU-11.06 | Caja Negra de Auditoría WORM en audit_logs con triggers anti-UPDATE/DELETE | MAPPED | CRITICAL | 5 | HU-04.01, HU-04.04 | SAD §9.8, §11.8 | ADR-0008 | test_audit_worm.py, test_audit_immutability.py |
| 11 | HU-11.07 | Verificación periódica de integridad WORM: hash programado contra S3 y alertas | NEW | HIGH | 5 | HU-11.01, HU-11.02 | SAD §9.8, §11.8 | —, — | test_worm_integrity.py |
| 11 | HU-11.08 | Cadena de custodia interactiva con gráfico de trazabilidad y timestamps verificables | NEW | MEDIUM | 5 | HU-11.03 | SAD §9.8, §11.8, §18.2 | ADR-0008, — | test_custody_chain.tsx |
| 11 | HU-11.09 | Exportación masiva de expedientes para auditorías externas con filtros avanzados | NEW | MEDIUM | 5 | HU-11.04 | SAD §9.8, §11.8 | ADR-0008, — | test_mass_export.py |
| 11 | HU-11.10 | Configuración de Object Lock S3 con políticas granulares por clase de documento | NEW | HIGH | 5 | HU-11.01 | SAD §9.8, §11.8 | —, — | test_object_lock_config.py |
| **EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit (12 HUs)** |
| 12 | HU-12.01 | AI Proxy con enmascaramiento local de PII en payloads XML antes de envío a Gemini | MAPPED | CRITICAL | 8 | — | SAD §9.6, §16.4 | — | test_ai_riskgauge.py |
| 12 | HU-12.02 | Copiloto de Compliance Fiscal con Gemini 2.5 Flash Lite y RAG contextual | MAPPED | MEDIUM | 8 | HU-12.01 | SAD §9.6, §16.1, §16.2 | — | test_ai_alert_explain.py, test_ai_context.py |
| 12 | HU-12.03 | Filtro de detección de contradicción semántica entre inferencia IA y RiskGauge | MAPPED | HIGH | 5 | HU-12.02, HU-08.01 | SAD §9.6, §16.8 | — | test_ai_draft.py |
| 12 | HU-12.04 | Pipeline de scrubbing PII local con regex de alta precisión antes de llamadas Gemini | MAPPED | CRITICAL | 5 | HU-12.01 | SAD §9.6, §16.4 | — | test_pii_scrubber.py, test_scrub_integration.py |
| 12 | HU-12.05 | Motor de contradicción IA vs riesgo matemático con umbral 90% y ≥2 niveles de discrepancia | MAPPED | HIGH | 5 | HU-12.03 | SAD §9.6, §16.8 | — | test_contradiction.py, test_ai_vs_math.py |
| 12 | HU-12.06 | Trazabilidad de consultas IA con auditoría inmutable de prompts, respuestas y scores | MAPPED | HIGH | 5 | HU-12.01, HU-12.02 | SAD §9.6, §11.8 | —, — | test_ai_audit.py, test_ai_trace.py |
| 12 | HU-12.07 | Versionado de prompts del sistema con A/B testing y métricas de efectividad | NEW | MEDIUM | 5 | HU-12.02 | SAD §9.6, §16.6 | — | test_prompt_versioning.py |
| 12 | HU-12.08 | Indexación de base de conocimiento fiscal en pgvector para RAG con embeddings | NEW | HIGH | 8 | HU-04.01 | SAD §9.6, §16.3 | —, — | test_rag_indexing.py |
| 12 | HU-12.09 | Búsqueda semántica vectorial con ranking de relevancia y filtrado RLS | NEW | HIGH | 5 | HU-12.08 | SAD §9.6, §16.3 | —, — | test_semantic_search.py |
| 12 | HU-12.10 | Fallback a reglas deterministas cuando la IA no alcanza confianza mínima (≤70%) | NEW | HIGH | 5 | HU-12.03, HU-12.05 | SAD §9.6, §16.8 | —, — | test_ai_fallback.py |
| 12 | HU-12.11 | Dashboard de métricas de calidad IA: precisión, alucinaciones, latencia y confianza | NEW | MEDIUM | 5 | HU-12.06 | SAD §9.6, §16.7, §18.2 | — | test_ai_quality_dashboard.tsx |
| 12 | HU-12.12 | Dashboard de consumo de tokens y costos de API Gemini con alertas de presupuesto | NEW | MEDIUM | 3 | HU-12.01, HU-12.06 | SAD §9.6, §16.7 | — | test_token_usage.py, test_token_dashboard.tsx |
| **EP-13 — HUD, UX Operativa y Accesibilidad (10 HUs)** |
| 13 | HU-13.01 | Dashboard Tactical HUD Liquid Glass en React 19 con Heatmap, RiskGauge y badges | MAPPED | HIGH | 8 | HU-08.01 | SAD §9.1, §18.1, §18.2 | — | test_hud_components.tsx |
| 13 | HU-13.02 | Vista de perfil fiscal: detalle completo de un RFC con métricas y gráficos | MAPPED | HIGH | 5 | HU-13.01, HU-08.01 | SAD §9.1, §18.2 | — | test_profile_view.tsx, test_profile_data.py |
| 13 | HU-13.03 | Vista de alertas con lista, filtros avanzados, locking visual y estados | MAPPED | HIGH | 5 | HU-13.01, HU-10.02 | SAD §9.1, §10.8, §18.2 | ADR-0001, ADR-0007 | test_alert_list.tsx |
| 13 | HU-13.04 | Quick Setup UX y Bypass Banner de cobertura limitada con Liquid Glass | MAPPED | MEDIUM | 5 | HU-13.01 | SAD §9.1, §10.1, §18.2 | — | test_quick_setup.tsx, test_onboarding_ux.ts |
| 13 | HU-13.05 | UX de modos degradados SAT/Belvo: banners, mensajes contextuales y restricciones UI | MAPPED | HIGH | 3 | HU-13.01, HU-07.03 | SAD §9.1, §10.12, §18.2 | — | test_degraded_banner.tsx, test_degraded_states.py |
| 13 | HU-13.06 | Accesibilidad WCAG 2.1 AA: teclado, roles ARIA, contraste y lector de pantalla | MAPPED | HIGH | 5 | HU-13.01 | SAD §9.1, §18.1 | — | test_a11y.tsx |
| 13 | HU-13.07 | Modo oscuro completo Liquid Glass con transición suave y respeto a preferencias OS | NEW | MEDIUM | 5 | HU-13.01 | SAD §9.1, §18.1 | —, — | test_dark_mode.tsx, test_theme_switch.tsx |
| 13 | HU-13.08 | Diseño responsive mobile-first para tablets y smartphones con layout adaptativo | NEW | HIGH | 5 | HU-13.01 | SAD §9.1, §18.1 | —, — | test_responsive.tsx, test_mobile_layout.tsx |
| 13 | HU-13.09 | Internacionalización i18n español/inglés con detección automática de idioma | NEW | MEDIUM | 5 | HU-13.01 | SAD §9.1, §18.1 | — | test_i18n.tsx, test_locale_switch.tsx |
| 13 | HU-13.10 | Keyboard shortcuts y navegación avanzada para power users con cheat sheet | NEW | MEDIUM | 3 | HU-13.06 | SAD §9.1, §18.1 | — | test_keyboard_shortcuts.tsx |
| **EP-14 — Observabilidad, QA, DevSecOps y Release (7 HUs)** |
| 14 | HU-14.01 | Instrumentación OpenTelemetry con tracing distribuido end-to-end en todos los servicios | NEW | HIGH | 8 | — | SAD §9.10, §19 | — | test_otel_tracing.py, test_otel_spans.ts |
| 14 | HU-14.02 | Dashboard de métricas operacionales en Grafana: latencia, errores, throughput, RLS | NEW | HIGH | 5 | HU-14.01 | SAD §9.10, §19 | — | test_grafana_dashboards.py |
| 14 | HU-14.03 | Sistema de alertas de infraestructura: CPU, memoria, disco, conexiones DB, Redis | NEW | CRITICAL | 5 | HU-14.01 | SAD §9.10, §19 | — | test_infra_alerts.py |
| 14 | HU-14.04 | Hardening de CI/CD pipeline con stages de seguridad: SAST, DAST, SCA, secret scanning | NEW | CRITICAL | 8 | — | SAD §9.10, §20, DH §6 | — | test_cicd_pipeline.yml |
| 14 | HU-14.05 | Gates de calidad automatizados en PRs: coverage ≥75%, linting, SAST sin críticos | NEW | CRITICAL | 5 | HU-14.04 | SAD §9.10, §20, DH §6 | — | test_quality_gates.py |
| 14 | HU-14.06 | Gestión de releases con semantic versioning, changelogs automáticos y rollback canary | NEW | HIGH | 5 | HU-14.04 | SAD §9.10, §20 | — | test_release_mgmt.py |
| 14 | HU-14.07 | Health dashboard unificado de todos los servicios: API, Workers, DB, Redis, S3, Belvo | NEW | HIGH | 5 | HU-14.01, HU-14.02 | SAD §9.10, §19, §18.2 | — | test_service_health.py, test_health_dashboard.tsx |

**Leyenda:** CRITICAL = 23 HUs, HIGH = 67 HUs, MEDIUM = 36 HUs | Total SP = 686 | DH = Developer Handbook

---

## 5. Historias de Usuario — Golden Templates

### 5.1 EP-01 — Gobierno Documental y ADRs (6 HUs)

**Objetivo Arquitectónico**: Establecer la infraestructura de gobierno documental del proyecto Sentinel —desde la creación estandarizada de ADRs hasta el compliance automatizado pre-merge— garantizando que toda decisión arquitectónica esté trazada, versionada, validada y sea accesible para cualquier desarrollador desde su primer día. Este bloque es **capa fundacional (Layer 0)** sin dependencias externas.

**Trazabilidad SAD**: §2 (Arquitectura y Gobierno Documental), §23 (Documentación y ADRs), §24 (Backlog de Producto).

---


#### HU-01.01 — Creación y versionado de ADRs con plantilla estandarizada

**Épica:** EP-01 — Gobierno Documental y ADRs
**Módulo(s):** SAD §9.3 (Core Fiscal) — Middleware documental, SAD §9.10 (Observabilidad) — Trazabilidad
**Historia:** Como Arquitecto de Software / Líder Técnico del proyecto Sentinel, quiero crear y versionar registros de decisión arquitectónica (ADRs) utilizando una plantilla estandarizada con control de versiones para que cada decisión técnica esté documentada, trazable y auditada en el repositorio del proyecto sin ambigüedades ni decisiones orales no registradas.

**Alcance:**
Sistema de plantillas de ADR, CLI para creación y versionado de ADRs, integración con Git para trazabilidad de cambios, repositorio documental de ADRs en `documentacion/adrs/`. No cubre la edición colaborativa en tiempo real ni integración con herramientas externas de wiki.

**Historia en formato Given/When/Then:**
- **Given** que un arquitecto identifica una decisión técnica que requiere registro formal (elección de tecnología, patrón de diseño, trade-off de seguridad) y existe la plantilla canónica de ADR en el repositorio `documentacion/templates/adr-template.md`.
- **When** el arquitecto ejecuta el CLI de creación de ADR (`make adr-new TITLE="..."`) indicando el contexto, las opciones consideradas, la decisión tomada y las consecuencias.
- **Then** el sistema debe generar un archivo `ADR-NNNN.md` en el directorio `documentacion/adrs/` con numeración secuencial automática basada en el último ADR registrado.
- **And** debe registrar el nuevo ADR en la tabla `adr_registry` en PostgreSQL 17 con los metadatos de creación (autor, fecha, estado inicial `PROPOSED`, hash SHA-256 del contenido).
- **And** debe crear un commit atómico en Git con el mensaje `docs(adr): ADR-NNNN — {título} [PROPOSED]`.

**Prerrequisitos y reglas de negocio:**
- Requiere: Ninguno (capa fundacional).
- Regla de negocio: Todo ADR debe seguir la estructura canónica definida en el SAD §23.4 (Contexto, Decisión, Consecuencias, Alternativas consideradas). La numeración es secuencial e inmutable; un ADR nunca se renumera ni se elimina — solo transiciona de estado (PROPOSED → ACCEPTED → SUPERSEDED → DEPRECATED).
- Los ADRs en estado `ACCEPTED` que sean reemplazados por uno nuevo deben actualizarse a `SUPERSEDED` con referencia cruzada al nuevo ADR.

**Criterios de aceptación:**
1. El CLI `make adr-new` genera un archivo Markdown válido con todas las secciones de la plantilla pre-llenadas (metadatos, contexto, decisión, consecuencias) en menos de 1 segundo.
2. La numeración automática no produce colisiones ni huecos cuando dos arquitectos crean ADRs en ramas paralelas; el merge de Git resuelve correctamente el secuenciador en la tabla `adr_registry`.
3. El registro en la base de datos incluye la tupla completa (`adr_number`, `title`, `status`, `author_id`, `created_at`, `content_hash`) y es inmutable después de la creación.
4. La cobertura de pruebas unitarias del CLI de ADRs y del endpoint de registro (`POST /api/v1/adrs`) supera el 85%.
5. El intento de registrar un ADR con número duplicado o contenido vacío devuelve error HTTP `409 Conflict` o `422 Unprocessable Entity` respectivamente.

**Impactos y consideraciones:**
- Garantiza que todas las decisiones arquitectónicas del proyecto sean trazables para auditorías futuras (SAT, auditoría interna del holding). Elimina el "conocimiento oral" como riesgo de continuidad del proyecto.
- Requiere disciplina del equipo de arquitectura para mantener el registro actualizado en cada sprint.

**Referencias y trazabilidad:**
- SAD: §2.3 — Gobierno Documental y ADRs, §23.4 — Matriz de Trazabilidad Documental
- SAD-Lite: §2 — Visión de Negocio y Drivers Regulatorios
- Developer Handbook: §7.1 — Guía de Contribución Documental
- ADR: ADR-0010 — Creación y Versionado de ADRs con Plantilla Estandarizada
- Tablas afectadas: `adr_registry`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Precondiciones fundacionales para todos los flujos)

---

#### HU-01.02 — Validación automatizada de consistencia documental SAD ↔ ADRs

**Épica:** EP-01 — Gobierno Documental y ADRs
**Módulo(s):** SAD §9.3 (Core Fiscal) — Servicio de validación documental, SAD §9.10 (Observabilidad) — Reportes de consistencia
**Historia:** Como Arquitecto de Software / QA Documental, quiero ejecutar una validación automatizada que compare las referencias cruzadas entre el SAD y los ADRs para detectar enlaces rotos, secciones huérfanas y referencias inconsistentes, garantizando que el ecosistema documental del proyecto permanezca íntegro y navegable en todo momento.

**Alcance:**
Script de validación de consistencia documental (Python 3.12) que parsea el SAD y los ADRs, extrae referencias cruzadas (§X.Y, ADR-NNNN, links a Developer Handbook) y reporta discrepancias. Integrable en CI/CD como gate de calidad documental. No cubre validación gramatical ni de contenido semántico.

**Historia en formato Given/When/Then:**
- **Given** que el repositorio contiene el SAD maestro (`documentacion/SAD.md`), el catálogo de ADRs (`documentacion/adrs/ADR-*.md`) y el Developer Handbook (`documentacion/Developer-Handbook.md`) y se ha modificado al menos uno de estos documentos.
- **When** se ejecuta el validador de consistencia (`make doc-validate` o automáticamente en CI al abrir un PR que modifique `documentacion/`).
- **Then** el validador debe escanear todas las referencias SAD → ADR, ADR → SAD, y SAD/ADR → Developer Handbook detectando referencias a secciones inexistentes o ADRs no registrados.
- **And** debe reportar en formato JSON estructurado las discrepancias clasificadas por severidad: `ERROR` (referencia a sección/ADR inexistente), `WARN` (sección sin referencias entrantes — potencial huérfana), `INFO` (estadísticas de cobertura).
- **And** si existen errores de severidad `ERROR`, el gate de CI debe fallar bloqueando el merge del PR.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-01.01 (Creación y versionado de ADRs).
- Regla de negocio: Toda sección del SAD §10-§24 debe ser referenciada por al menos 1 ADR o 1 HU. Todo ADR debe ser referenciado por al menos 1 sección del SAD. Ningún documento debe contener enlaces a secciones con numeración no existente.
- El archivo de salida de validación (`documentacion/reports/consistency-report.json`) es inmutable y se versiona como artefacto de auditoría.

**Criterios de aceptación:**
1. El validador procesa el SAD completo (1600+ líneas) y el catálogo de ADRs en menos de 5 segundos.
2. Se detecta y reporta como `ERROR` cualquier referencia a `ADR-NNNN` cuyo archivo no exista en `documentacion/adrs/`.
3. Se detecta y reporta como `ERROR` cualquier referencia a `§X.Y` que no corresponda a una sección real del SAD.
4. El script genera un reporte de cobertura documental indicando el porcentaje de secciones del SAD que tienen al menos una referencia desde ADRs.
5. El gate de CI bloquea el merge si existen errores de severidad `ERROR` con un mensaje claro que indica al desarrollador qué referencias rompió.

**Impactos y consideraciones:**
- Previene la erosión documental que ocurre cuando las referencias se rompen tras múltiples revisiones del SAD sin actualizar los ADRs vinculados. Afecta positivamente la auditabilidad del proyecto ante revisiones regulatorias (SAT, INAI).
- Requiere que el equipo de arquitectura mantenga disciplina en la numeración de secciones y referencias.

**Referencias y trazabilidad:**
- SAD: §23.4 — Matriz de Trazabilidad Documental, §24.5 — Gates de Compliance Automatizados
- SAD-Lite: §2 — Visión de Negocio y Drivers Regulatorios
- Developer Handbook: §7.2 — Scripts de Validación Documental Automatizada
- ADR: ADR-0010 — Creación y Versionado de ADRs con Plantilla Estandarizada
- Tablas afectadas: `adr_registry`, `doc_references` (vista materializada de referencias cruzadas)
- Flujo crítico SAD §10: §10.1 (Precondiciones fundacionales para todos los flujos)

---

#### HU-01.03 — Versionado semántico del SAD y trazabilidad de cambios con changelog

**Épica:** EP-01 — Gobierno Documental y ADRs
**Módulo(s):** SAD §9.3 (Core Fiscal) — Servicio de versionado, SAD §9.10 (Observabilidad) — Trazabilidad
**Historia:** Como Arquitecto de Software / Release Manager, quiero que el SAD siga un versionado semántico (MAJOR.MINOR.PATCH) con un changelog automatizado que registre cada cambio documental vinculado a ADRs y HUs, para conocer exactamente qué cambió, por qué y quién lo aprobó en cada versión del documento rector del proyecto.

**Alcance:**
Sistema de versionado semántico del SAD con registro automático de cambios en `documentacion/CHANGELOG-SAD.md`. Integración con Git tags para marcar versiones. Vinculación de cada entrada del changelog con ADRs y HUs que motivaron el cambio. No cubre versionado de otros documentos del ecosistema (Developer Handbook, SAD-Lite) en esta HU.

**Historia en formato Given/When/Then:**
- **Given** que un arquitecto o desarrollador modifica el SAD (`documentacion/SAD.md`) en un PR que ha pasado los gates de validación documental (HU-01.02) y el comité de revisión aprueba el merge.
- **When** se ejecuta el merge a la rama `main` y se aplica el tag de versión (`make sad-release VERSION="v3.2.0"`).
- **Then** el sistema debe registrar automáticamente la nueva versión en `documentacion/CHANGELOG-SAD.md` con el número de versión semántica, la fecha, el autor del release y un resumen de cambios extraído de los commits.
- **And** debe insertar un registro inmutable en la tabla `sad_versions` con el hash SHA-256 del documento completo en esa versión, el número de versión, y las referencias a los ADRs y HUs vinculados al cambio.
- **And** debe actualizar el campo `version` en los metadatos del SAD (§0 Control Documental) automáticamente.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-01.01 (Creación y versionado de ADRs).
- Regla de negocio: El versionado semántico sigue la especificación SemVer 2.0.0: MAJOR (cambios incompatibles en la arquitectura), MINOR (nuevas secciones o módulos), PATCH (correcciones, clarificaciones, erratas). La tabla `sad_versions` es WORM — los registros de versiones anteriores no se modifican ni eliminan.
- Ningún tag de versión puede aplicarse si el documento no ha pasado el validador de consistencia (HU-01.02).

**Criterios de aceptación:**
1. El comando `make sad-release` genera correctamente una entrada en el changelog con los campos: versión, fecha ISO 8601, autor, tipo de cambio (MAJOR/MINOR/PATCH), resumen y ADRs/HUs vinculados.
2. La tabla `sad_versions` registra cada versión con `content_hash = SHA-256(SAD.md)` permitiendo verificar que el documento no fue alterado post-release.
3. El intento de hacer release sin haber pasado la validación de consistencia documental (HU-01.02) es rechazado con un mensaje de error explícito.
4. La consulta de historial de versiones (`GET /api/v1/sad/versions`) retorna todas las versiones registradas con su changelog asociado.
5. Los tests automatizados validan que el hash SHA-256 del SAD en una versión coincide con el contenido del archivo en el commit correspondiente al tag.

**Impactos y consideraciones:**
- Permite a auditores externos (SAT, despachos cliente) verificar exactamente qué versión del SAD gobernó el desarrollo en un momento dado. Facilita la trazabilidad reglamentaria para cumplimiento fiscal mexicano.
- Requiere que el release manager tenga privilegios para crear tags en el repositorio.

**Referencias y trazabilidad:**
- SAD: §1 — Propósito y Alcance, §24 — Backlog de Producto y Control de Versiones
- SAD-Lite: §1 — Visión General y Control Documental
- Developer Handbook: §7.3 — Procedimiento de Versionado Semántico y Release del SAD
- ADR: ADR-0010 — Creación y Versionado de ADRs con Plantilla Estandarizada, ADR-0010 (Versionado Semántico SAD)
- Tablas afectadas: `sad_versions`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Precondiciones fundacionales para todos los flujos)

---

#### HU-01.04 — Checklist de compliance arquitectónico pre-merge con gates automatizados

**Épica:** EP-01 — Gobierno Documental y ADRs
**Módulo(s):** SAD §9.3 (Core Fiscal) — Servicio de compliance, SAD §9.10 (Observabilidad) — Reportes y gates
**Historia:** Como Arquitecto de Software / DevSecOps, quiero que cada Pull Request que modifique documentos de arquitectura (SAD, ADRs, Developer Handbook) pase obligatoriamente por un checklist de compliance automatizado que verifique reglas estructurales, referencias válidas, formato canónico y completitud de metadatos, para garantizar que ningún cambio documental degrade la integridad del ecosistema arquitectónico del proyecto.

**Alcance:**
Pipeline de CI/CD con gates documentales automatizados. Checklist de compliance que incluye: validador de estructura de ADR, validador de referencias SAD ↔ ADRs (HU-01.02), validador de formato Markdown, detector de enlaces rotos, verificador de metadatos obligatorios. No cubre validación de contenido técnico de los ADRs (eso corresponde a revisión humana).

**Historia en formato Given/When/Then:**
- **Given** que un desarrollador o arquitecto abre un Pull Request que modifica archivos bajo el directorio `documentacion/` y desea mergear a la rama `main`.
- **When** el pipeline de CI/CD ejecuta el stage `compliance-check` de forma automática al abrir o actualizar el PR.
- **Then** el sistema debe ejecutar secuencialmente todas las verificaciones del checklist: (a) estructura canónica de ADRs según plantilla, (b) consistencia de referencias SAD ↔ ADRs (HU-01.02), (c) formato Markdown válido, (d) enlaces internos resolubles, (e) metadatos obligatorios presentes (versión, fecha, autor, estado).
- **And** debe reportar cada verificación como `PASS`, `WARN` o `FAIL` en un comentario automático del PR visible para el revisor.
- **And** si cualquier verificación resulta `FAIL`, el merge debe bloquearse y el PR debe mostrar el status check como `❌ compliance-check failed`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-01.02 (Validación automatizada de consistencia documental).
- Regla de negocio: Ningún cambio documental puede llegar a `main` sin pasar el 100% de los gates de compliance. Las verificaciones están definidas en el SAD §24.5 — Gates de Compliance Automatizados.
- Las reglas del checklist deben estar versionadas en un archivo `documentacion/.compliance-rules.yml` que el pipeline carga dinámicamente, permitiendo evolución de reglas sin cambiar el código del pipeline.

**Criterios de aceptación:**
1. El pipeline de compliance se ejecuta en menos de 30 segundos para un PR típico con hasta 5 archivos documentales modificados.
2. Un PR que introduce un ADR sin la sección `## Consecuencias` es bloqueado con `FAIL: missing required section 'Consecuencias' in ADR-NNNN.md`.
3. Un PR que modifica una sección del SAD y rompe una referencia desde un ADR es bloqueado con `FAIL: broken reference from ADR-NNNN to SAD §X.Y`.
4. El comentario automático en el PR incluye un resumen tabular con el estado de cada verificación y una recomendación de acción correctiva para cada fallo.
5. Los tests de integración del pipeline de compliance cubren al menos 10 escenarios de fallo distintos (sección faltante, enlace roto, metadatos ausentes, formato inválido, etc.).

**Impactos y consideraciones:**
- Eleva la calidad documental al mismo nivel de exigencia que el código fuente (SAST, tests, coverage). Asegura que la documentación sea audit-ready en todo momento.
- Puede percibirse como fricción inicial para desarrolladores no acostumbrados a rigor documental; se mitiga con el onboarding (HU-01.06) y mensajes de error claros.

**Referencias y trazabilidad:**
- SAD: §23.4 — Matriz de Trazabilidad Documental, §24.5 — Gates de Compliance Automatizados, §20 — Línea Base de Seguridad Arquitectural
- SAD-Lite: §2 — Visión de Negocio y Drivers Regulatorios
- Developer Handbook: §7.4 — Pipeline de Compliance Documental y Checklist Pre-Merge
- ADR: ADR-0010 — Creación y Versionado de ADRs con Plantilla Estandarizada, ADR-0010 (Compliance Gates)
- Tablas afectadas: `adr_registry`, `sad_versions`, `compliance_check_results`
- Flujo crítico SAD §10: §10.1 (Precondiciones fundacionales para todos los flujos)

---

#### HU-01.05 — Gobernanza de cambios arquitectónicos con comité de revisión digital

**Épica:** EP-01 — Gobierno Documental y ADRs
**Módulo(s):** SAD §9.3 (Core Fiscal) — Workflow de aprobación, SAD §9.10 (Observabilidad) — Trazabilidad de decisiones
**Historia:** Como Arquitecto Líder / CTO del proyecto Sentinel, quiero establecer un flujo digital de gobernanza para cambios arquitectónicos donde las propuestas de modificación al SAD, ADRs o decisiones de diseño requieran la aprobación explícita de un comité de revisión con registro inmutable de votos y comentarios, para asegurar que ninguna decisión arquitectónica crítica se tome unilateralmente sin el escrutinio del equipo técnico.

**Alcance:**
Sistema de change requests (RFC) para cambios arquitectónicos con flujo de aprobación digital. Roles de comité (ARCHITECT, REVIEWER, APPROVER). Registro inmutable de votos y comentarios. Integración con PRs de GitHub/GitLab para bloquear merge sin aprobación del comité. No cubre videoconferencias ni deliberación en tiempo real.

**Historia en formato Given/When/Then:**
- **Given** que un arquitecto propone un cambio significativo en la arquitectura (por ejemplo, cambiar el motor de mensajería de Celery a RabbitMQ) y crea un RFC documentado en `documentacion/rfcs/RFC-NNNN.md`.
- **When** el arquitecto somete el RFC al comité de revisión digital a través del CLI (`make rfc-submit RFC=NNNN`) y notifica a los miembros del comité.
- **Then** el sistema debe crear un registro en la tabla `architecture_change_requests` con estado `AWAITING_REVIEW` y notificar a los miembros del comité configurados en `documentacion/.governance.yml`.
- **And** cada miembro del comité debe poder votar (`APPROVE`, `REQUEST_CHANGES`, `ABSTAIN`) a través de una interfaz web o comando CLI, quedando el voto registrado de forma inmutable con timestamp y justificación.
- **And** cuando el RFC alcanza la mayoría requerida de aprobaciones (configurable en `.governance.yml`, mínimo 2/3 del comité), el estado transiciona a `APPROVED` y el sistema desbloquea automáticamente el PR asociado para merge.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-01.04 (Checklist de compliance arquitectónico pre-merge).
- Regla de negocio: Cualquier cambio que modifique las secciones §9-§14 o §16-§19 del SAD, o cualquier ADR en estado ACCEPTED, requiere RFC y aprobación del comité. El quorum mínimo es del 66% de los miembros del comité. Los votos son públicos dentro del equipo técnico y registrados en `audit_logs` de forma WORM.
- El archivo `.governance.yml` define los miembros del comité, quorum, y tipos de cambio que requieren RFC.

**Criterios de aceptación:**
1. El CLI `make rfc-submit` crea correctamente un RFC con metadatos (autor, fecha, ADRs/HUs impactados) y notifica al comité vía webhook (Slack/Teams opcional) y registro en BD.
2. El endpoint `POST /api/v1/rfcs/{rfc_id}/vote` registra el voto y recalcula el estado del RFC en tiempo real; si se alcanza el quorum, transiciona automáticamente a `APPROVED`.
3. El estado del RFC es visible en el PR de GitHub como un status check (`governance/rfc-approval`) que bloquea el merge si no está `APPROVED`.
4. El intento de modificar un voto ya emitido es rechazado con error `409 Conflict`; la auditoría registra el intento.
5. La interfaz web muestra un dashboard con todos los RFCs activos, su estado de votación, y el historial de decisiones del comité.

**Impactos y consideraciones:**
- Formaliza la toma de decisiones arquitectónicas, eliminando riesgos de "arquitectura por accidente" o decisiones unilaterales que generen deuda técnica. Alinea el proyecto con estándares de gobierno corporativo exigidos por holdings fiscalizados.
- Agrega un paso de latencia en el ciclo de desarrollo para cambios arquitectónicos; se compensa con la calidad y trazabilidad obtenidas.

**Referencias y trazabilidad:**
- SAD: §2 — Arquitectura y Gobierno Documental, §20 — Línea Base de Seguridad Arquitectural
- SAD-Lite: §2 — Visión de Negocio y Drivers Regulatorios, §5 — Modelo de Gobernanza
- Developer Handbook: §7.5 — Flujo de Gobernanza de Cambios Arquitectónicos (RFC)
- ADR: ADR-0010 — Creación y Versionado de ADRs, ADR-0010 (Gobernanza Digital de Cambios Arquitectónicos)
- Tablas afectadas: `architecture_change_requests`, `governance_votes`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Precondiciones fundacionales para todos los flujos)

---

#### HU-01.06 — Onboarding documental para nuevos desarrolladores con mapa de conocimiento

**Épica:** EP-01 — Gobierno Documental y ADRs
**Módulo(s):** SAD §9.3 (Core Fiscal) — Servicio de onboarding, SAD §9.1 (Frontend SPA) — Interfaz de mapa de conocimiento
**Historia:** Como Desarrollador nuevo en el equipo Sentinel, quiero acceder a un sistema de onboarding documental interactivo que me presente un mapa de conocimiento del proyecto —qué documentos existen, cómo se relacionan, cuál es el orden de lectura recomendado— para ser productivo en el ecosistema documental de Sentinel en mi primera semana sin depender de explicaciones verbales de compañeros.

**Alcance:**
Interfaz web estática (React 19, Vanilla CSS Liquid Glass) que renderiza un grafo interactivo del ecosistema documental (SAD, ADRs, Developer Handbook, SAD-Lite). Guía de lectura recomendada por rol (Backend, Frontend, DevSecOps, QA, Arquitecto). Checklist de onboarding documental con tracking de progreso. No cubre onboarding técnico (setup de ambiente, Docker, credenciales) ni tutoriales de código.

**Historia en formato Given/When/Then:**
- **Given** que un desarrollador recién incorporado accede por primera vez al portal de documentación de Sentinel (`documentacion/index.html` o `http://localhost:3000/docs/onboarding`).
- **When** selecciona su rol en el equipo (Backend Python, Frontend React, DevSecOps, QA, Arquitecto).
- **Then** el sistema debe presentar un grafo interactivo de nodos documentales (SAD, ADRs, Developer Handbook, SAD-Lite) con conexiones que representan referencias cruzadas entre documentos.
- **And** debe destacar la ruta de lectura recomendada para su rol, con un checklist interactivo donde puede marcar documentos como leídos.
- **And** cada nodo del grafo debe mostrar metadata (última actualización, versión, secciones clave) al hacer hover/click, y enlazar directamente al documento real en el repositorio.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-01.01 (Creación y versionado de ADRs).
- Regla de negocio: El mapa de conocimiento debe generarse automáticamente a partir del parseo de los documentos fuente (no mantenerse manualmente). Cualquier cambio en la estructura documental (nuevo ADR, nueva sección SAD, cambio de versión) debe reflejarse en el mapa sin intervención humana adicional.
- El progreso de lectura es local (almacenado en `localStorage`) y no se comparte entre dispositivos por razones de privacidad.

**Criterios de aceptación:**
1. El grafo de conocimiento renderiza correctamente todos los documentos del ecosistema (SAD ≈24 secciones, ADRs activos, Developer Handbook ≈7 capítulos) en menos de 2 segundos desde la carga de la página.
2. Al seleccionar el rol "Backend Python", la ruta recomendada prioriza Developer Handbook §1-§3, SAD §11, SAD §16, y ADRs relevantes para backend (ADR-0001, ADR-0002, ADR-0004).
3. El checklist de onboarding permite marcar/desmarcar documentos y persiste el progreso entre recargas de página (localStorage).
4. Los enlaces desde los nodos del grafo hacia los documentos fuente funcionan correctamente (verificados por el validador de HU-01.02).
5. La interfaz cumple con los estándares de Liquid Glass (Vanilla CSS, sin Tailwind) y es responsive en pantallas ≥1024px.

**Impactos y consideraciones:**
- Reduce el tiempo de onboarding de nuevos desarrolladores de 2-3 semanas a 3-5 días en lo que respecta a comprensión documental. Mitiga el riesgo de que el conocimiento arquitéctonico resida únicamente en las personas fundadoras del proyecto.
- La generación automática del mapa requiere que los documentos mantengan una estructura consistente; el compliance gate de HU-01.04 garantiza esta precondición.

**Referencias y trazabilidad:**
- SAD: §2 — Arquitectura y Gobierno Documental, §23 — Documentación y ADRs
- SAD-Lite: §1 — Visión General y Control Documental
- Developer Handbook: §1 — Primeros Pasos y Onboarding
- ADR: ADR-0010 — Creación y Versionado de ADRs, ADR-0010 (Onboarding Documental)
- Tablas afectadas: `adr_registry`, `sad_versions` (consultadas para metadata del grafo)
- Flujo crítico SAD §10: §10.1 (Precondiciones fundacionales para todos los flujos)

---
---

### 5.2 EP-02 — Identidad, Sesión y 2FA

#### HU-02.01 — Inicio de sesión federado (Google OAuth + Auth.js v5)

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2, SAD §9.9
**Historia:** Como usuario de un despacho contable, quiero iniciar sesión con mi cuenta de Google corporativa mediante OAuth 2.0 federado para acceder a Sentinel sin crear credenciales adicionales.

**Alcance:**
Backend (BFF Express) + Frontend (React 19 SPA). Integración Auth.js v5 con provider Google OAuth. Cookies HttpOnly, Secure, SameSite=Strict. Sin localStorage.

**Historia en formato Given/When/Then:**
- **Given** un contador del despacho "García y Asociados" con cuenta Google corporativa activa
- **When** accede a `app.sentinel.mx/login` y hace clic en "Iniciar sesión con Google"
- **Then** Auth.js redirige a Google OAuth, valida el dominio corporativo, y emite JWT en cookie HttpOnly
- **And** el usuario es redirigido al Tactical HUD con su tenant_id inyectado automáticamente

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (DDL PostgreSQL 17)
- Regla de negocio: Solo dominios corporativos pre-registrados por tenant. No se permiten cuentas @gmail.com personales.

**Criterios de aceptación:**
1. Login con Google OAuth completa en < 2 segundos.
2. Cookie de sesión es HttpOnly, Secure, SameSite=Strict.
3. JWT decodificado contiene tenant_id, user_id, role.
4. Sin tokens en localStorage ni sessionStorage.

**Impactos y consideraciones:**
- Base de la seguridad de toda la plataforma. Sin este flujo, ningún otro módulo funciona.

**Referencias y trazabilidad:**
- SAD: §13.6 — Manejo de sesiones y cookies
- SAD-Lite: §9.1 — Matriz de capacidades y permisos
- Developer Handbook: §3 — Node.js Prisma Extension
- ADR: ADR-0005
- Tablas afectadas: users, sessions, tenant_users
- Flujo crítico SAD §10: §10.1 — Onboarding inicial

#### HU-02.02 — Autenticación 2FA TOTP con códigos QR y backup codes

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2
**Historia:** Como oficial de cumplimiento del despacho, quiero activar autenticación de doble factor (2FA TOTP) para proteger mi cuenta contra accesos no autorizados que comprometan datos fiscales sensibles.

**Alcance:**
Backend BFF Express. Generación de secreto TOTP, código QR (otpauth://), validación de códigos de 6 dígitos, backup codes (8 códigos de un solo uso).

**Historia en formato Given/When/Then:**
- **Given** un ADMIN ha iniciado sesión con Google OAuth (HU-02.01)
- **When** accede a Configuración > Seguridad > "Activar 2FA"
- **Then** el sistema genera un secreto TOTP, muestra código QR escaneable, y solicita verificación del primer código
- **And** al verificar, genera 8 backup codes encriptados (AES-256-GCM) que el usuario debe guardar
- **And** en el próximo login, tras Google OAuth exitoso, se solicita código TOTP de 6 dígitos

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (Google OAuth)
- Regla de negocio: 2FA obligatorio para roles ADMIN y OWNER. Opcional para ACCOUNTANT y VIEWER.

**Criterios de aceptación:**
1. Código QR se genera y muestra correctamente (base64 PNG en < 1s).
2. Validación TOTP con ventana de ±1 paso (30s) para tolerar desincronización.
3. Backup codes se almacenan hasheados (SHA-256), nunca en texto plano.
4. Tras 3 intentos fallidos de 2FA, la sesión se bloquea por 15 minutos.

**Impactos y consideraciones:**
- Incrementa fricción de login en ~10 segundos. Requiere comunicación clara a usuarios.

**Referencias y trazabilidad:**
- SAD: §13.6 — Manejo de sesiones
- SAD-Lite: §9.1 — Matriz de capacidades
- Developer Handbook: §3 — Prisma + Express BFF
- ADR: ADR-0006
- Tablas afectadas: users, user_preferences
- Flujo crítico SAD §10: §10.2 — Autenticación

#### HU-02.03 — Gestión de sesiones multi-dispositivo con revocación remota

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2 (BFF Express) — Gestión de sesiones, SAD §9.3 (Core Fiscal) — API de revocación
**Historia:** Como Usuario de Sentinel (Contador / Analista / Administrador), quiero visualizar todas mis sesiones activas en diferentes dispositivos (oficina, laptop personal, tablet) y poder revocar remotamente cualquiera de ellas desde mi panel de seguridad, para tener control total sobre quién accede a mi cuenta y mitigar riesgos de sesiones abandonadas o dispositivos perdidos.

**Alcance:**
Panel de sesiones activas en la UI de perfil de usuario. API de sesiones (`GET /api/v1/sessions`, `DELETE /api/v1/sessions/{session_id}`). Registro de metadatos de sesión (IP, User-Agent, geolocalización aproximada, dispositivo, fecha de inicio, última actividad). Revocación inmediata con invalidación de JWT vía blacklist en Redis. No cubre detección automática de anomalías (eso es HU-02.07).

**Historia en formato Given/When/Then:**
- **Given** un usuario autenticado en Sentinel con sesiones activas en 3 dispositivos (oficina, casa, móvil) y accede al panel "Mis Sesiones" en su perfil.
- **When** el usuario selecciona una sesión (por ejemplo, la del móvil que perdió) y pulsa "Cerrar Sesión Remotamente".
- **Then** el BFF Express debe invalidar el JWT asociado a esa sesión añadiendo su `jti` (JWT ID) a una blacklist en Redis con TTL igual al tiempo de expiración restante del token.
- **And** debe eliminar la sesión de la tabla `sessions` en PostgreSQL 17 y registrar la acción de revocación en `audit_logs` con el `session_id` revocado y la IP del dispositivo que ejecutó la revocación.
- **And** el dispositivo revocado debe recibir error `401 Unauthorized` en su siguiente petición, forzando el cierre de sesión.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie).
- Regla de negocio: Todo JWT emitido debe incluir un `jti` (JWT ID) único. La blacklist en Redis debe tener TTL automático igual al `exp` del token para evitar crecimiento infinito. La revocación remota debe ser efectiva en ≤5 segundos desde la confirmación del usuario (consistencia eventual aceptable).
- La lista de sesiones activas solo muestra las sesiones del usuario autenticado (RLS aplicado vía `tenant_id` y `user_id`).

**Criterios de aceptación:**
1. El endpoint `GET /api/v1/sessions` retorna todas las sesiones activas del usuario con metadata: IP, User-Agent, ubicación aproximada (ciudad/país), tipo de dispositivo (desktop/mobile/tablet), fecha de inicio, última actividad.
2. El endpoint `DELETE /api/v1/sessions/{session_id}` revoca la sesión en ≤5 segundos; intentos posteriores de usar el JWT revocado resultan en `401 Unauthorized`.
3. Un usuario con rol `VIEWER` no puede revocar sesiones de otros usuarios (verificación de `user_id` en el JWT vs `session_id` solicitado); intento devuelve `403 Forbidden`.
4. La tabla `sessions` en PostgreSQL 17 mantiene consistencia: al revocar, la sesión pasa a estado `REVOKED` (soft delete) con timestamp de revocación y `revoked_by` (IP del dispositivo revocador).
5. El panel de "Mis Sesiones" en React 19 se renderiza con Liquid Glass Vanilla CSS mostrando un listado de tarjetas de sesión con diseño responsive.

**Impactos y consideraciones:**
- Incrementa la seguridad percibida por el usuario final y cumple con requisitos de auditoría de seguridad para despachos contables que manejan información fiscal sensible (SAT, INAI). Reduce el riesgo de sesiones abandonadas en dispositivos compartidos.
- La blacklist en Redis debe dimensionarse para el pico de sesiones activas concurrentes (estimado: 10,000 usuarios × 3 dispositivos = 30,000 entradas máximo).

**Referencias y trazabilidad:**
- SAD: §13.6 — Manejo de sesiones y cookies, §13.4 — Autenticación federada
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §3.3 — Gestión de Sesiones Multi-Dispositivo y Revocación
- ADR: ADR-0005 — Arquitectura de cookies HttpOnly en BFF para mitigación de ataques XSS, ADR-0005 (Sesiones Multi-Dispositivo)
- Tablas afectadas: `sessions`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---

#### HU-02.04 — Política de contraseñas robustas con rotación forzada según NIST 800-63B

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2 (BFF Express) — Validación de contraseñas, SAD §9.3 (Core Fiscal) — Políticas y enforcement
**Historia:** Como Oficial de Seguridad / Administrador del tenant, quiero configurar y hacer cumplir una política de contraseñas robustas alineada a NIST 800-63B —que incluya longitud mínima, complejidad opcional, historial de reúso con rotación forzada y expiración periódica— para mitigar el riesgo de compromiso de cuentas por credenciales débiles o reutilizadas en el ecosistema fiscal del despacho.

**Alcance:**
Política de contraseñas configurable por tenant. Validación en registro y cambio de contraseña. Historial de contraseñas (últimas N contraseñas hasheadas). Rotación forzada configurable (por tiempo o por eventos de seguridad). Notificación de expiración próxima. No cubre detección de contraseñas comprometidas contra bases de datos públicas (Have I Been Pwned) en esta HU.

**Historia en formato Given/When/Then:**
- **Given** que el administrador del tenant configuró la política: longitud mínima 12 caracteres, historial de 5 contraseñas, rotación cada 90 días, y un usuario con contraseña antigua intenta cambiarla.
- **When** el usuario envía su nueva contraseña a través del formulario "Cambiar Contraseña" (`POST /api/v1/auth/change-password`).
- **Then** el sistema debe validar que la nueva contraseña cumpla con: longitud ≥ 12 caracteres, no esté en el historial de las últimas 5 contraseñas del usuario, y no sea igual a la actual.
- **And** debe almacenar el hash de la nueva contraseña con bcrypt/argon2id (configurable) en la tabla `users` y registrar el hash anterior en `password_history`.
- **And** si la contraseña actual tiene más de 90 días de antigüedad, debe forzar el cambio en el próximo login redirigiendo al usuario al formulario de cambio obligatorio antes de acceder a cualquier funcionalidad.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie).
- Regla de negocio: La política sigue los lineamientos NIST SP 800-63B: longitud mínima 8 (recomendado ≥12), sin reglas arbitrarias de complejidad (mayúsculas/símbolos son opcionales pero bienvenidos), verificación contra historial de contraseñas previas. La rotación forzada por tiempo es configurable por tenant (30/60/90/180 días). Las contraseñas se almacenan exclusivamente como hash (bcrypt con cost factor ≥12 o argon2id); nunca en texto plano.
- Las políticas son heredables: si un sub-tenant no define su propia política, hereda la del tenant padre (relevante para HU-03.06).

**Criterios de aceptación:**
1. El endpoint `POST /api/v1/auth/change-password` rechaza contraseñas de longitud <8 caracteres con error `422 Unprocessable Entity` y un mensaje descriptivo indicando la política configurada.
2. Una contraseña nueva que coincide con alguna de las últimas 5 almacenadas en `password_history` es rechazada con error `409 Conflict: password previously used`.
3. Un usuario cuya contraseña expiró (último cambio >90 días) es redirigido automáticamente al flujo de cambio obligatorio sin poder acceder a rutas protegidas hasta completarlo.
4. El administrador del tenant puede modificar la política de contraseñas (`PATCH /api/v1/tenant/password-policy`) y los cambios aplican inmediatamente a nuevos cambios de contraseña; no invalidan contraseñas existentes.
5. Los tests automatizados validan el cumplimiento de al menos 8 combinaciones de políticas (longitudes, historial, expiración) y la correcta aplicación de herencia de políticas en jerarquías de tenants.

**Impactos y consideraciones:**
- Alinea la seguridad de autenticación con estándares exigidos por corporativos multinacionales y reguladores mexicanos (CNBV, SAT para proveedores de servicios fiscales digitales). Aumenta la fricción del usuario en cambio de contraseñas, mitigada por el SSO (HU-02.05) y 2FA (HU-02.02).
- La tabla `password_history` debe dimensionarse para crecimiento lineal (n_users × history_depth filas); se recomienda particionar por tenant_id.

**Referencias y trazabilidad:**
- SAD: §13.4 — Autenticación federada, §13.8 — Seguridad ofensiva y defensiva
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §3.4 — Políticas de Contraseñas y Rotación
- ADR: ADR-0006 — Mandato de Autenticación Multifactorial (MFA), ADR-0005 (Política de Contraseñas NIST 800-63B)
- Tablas afectadas: `users`, `password_history`, `tenant_config`
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---

#### HU-02.05 — Integración SSO empresarial SAML/OIDC para holdings corporativos

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2 (BFF Express) — Middleware SAML/OIDC, SAD §9.3 (Core Fiscal) — Configuración SSO por tenant
**Historia:** Como Administrador de TI de un holding corporativo que utiliza Sentinel, quiero integrar la autenticación del sistema con nuestro proveedor de identidad empresarial (Azure AD, Okta, Google Workspace) mediante SAML 2.0 u OIDC, para que nuestros colaboradores accedan con sus credenciales corporativas existentes sin necesidad de crear y gestionar credenciales separadas en Sentinel.

**Alcance:**
Integración con proveedores de identidad externos vía SAML 2.0 y OpenID Connect (OIDC). Configuración por tenant en panel de administración. Mapeo de atributos SAML/OIDC a roles de Sentinel. Flujo de login SSO con redirect al IdP corporativo. No cubre sincronización automática de directorio (SCIM) ni provisioning automático de usuarios en esta HU.

**Historia en formato Given/When/Then:**
- **Given** que el administrador del tenant configuró la conexión SSO con Azure AD proporcionando los metadatos del IdP (Entity ID, SSO URL, certificado X.509 público) y el mapeo de atributos (email → username, groups → roles) en el panel de administración.
- **When** un colaborador del holding navega al login de Sentinel y selecciona "Iniciar Sesión con Microsoft" (o el nombre configurado por el tenant).
- **Then** el BFF Express debe redirigir al usuario al IdP corporativo con un SAML AuthnRequest u OIDC Authorization Request según la configuración del tenant.
- **And** tras la autenticación exitosa en el IdP, el BFF debe validar la respuesta SAML (firma XML, condiciones, sujeto) o el token OIDC (firma JWT, issuer, audience, exp) y extraer los atributos mapeados.
- **And** debe crear o vincular el usuario en la tabla `users` de Sentinel (con `sso_provider` y `sso_subject_id`) y emitir la cookie JWT HttpOnly estándar de Sentinel (ADR-0005).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie).
- Regla de negocio: Cada tenant puede configurar exactamente 1 proveedor SSO activo a la vez. El SSO es opcional; los tenants pueden optar por autenticación local exclusivamente. Si un tenant habilita SSO, los usuarios con `sso_provider` no nulo son redirigidos al IdP; usuarios locales (sin SSO) pueden seguir usando login con contraseña. La validación de firma SAML es obligatoria y debe usar timingSafeEqual para comparar hashes.
- Los certificados X.509 del IdP se almacenan cifrados (AES-256-GCM) en la tabla `sso_configs`.

**Criterios de aceptación:**
1. La configuración SAML con Azure AD (o cualquier IdP compatible con SAML 2.0) se completa exitosamente usando el wizard de configuración SSO en el panel de administración.
2. El flujo de login SSO (redirección al IdP → autenticación → callback a Sentinel → emisión de cookie) completa en ≤3 segundos en condiciones normales de red.
3. La respuesta SAML con firma inválida o certificado expirado es rechazada con `401 Unauthorized` y registrada en `audit_logs` como intento de autenticación fallido por SSO.
4. La configuración OIDC con Google Workspace funciona análogamente al flujo SAML, validando `issuer`, `audience`, `nonce` y firma del `id_token`.
5. Un usuario vinculado por SSO que intenta hacer login local (contraseña) recibe un mensaje indicando que debe usar el SSO corporativo.

**Impactos y consideraciones:**
- Facilita la adopción de Sentinel en grandes holdings y despachos corporativos que ya tienen infraestructura de identidad consolidada. Reduce la carga de gestión de credenciales para TI del cliente. Es un diferenciador competitivo en el mercado de software fiscal empresarial mexicano.
- Introduce dependencia externa en el flujo de autenticación; si el IdP del cliente falla, los usuarios no pueden acceder. Se mitiga con un modo de bypass de emergencia configurable por el Oficial de Cumplimiento.

**Referencias y trazabilidad:**
- SAD: §13.4 — Autenticación federada
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §3.5 — Integración SAML/OIDC y Mapeo de Atributos
- ADR: ADR-0005 (SSO Empresarial SAML/OIDC)
- Tablas afectadas: `sso_configs`, `users`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---

#### HU-02.06 — Protección anti-brute-force con rate limiting y lockout temporal progresivo

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2 (BFF Express) — Rate limiting middleware, SAD §9.3 (Core Fiscal) — Lockout service
**Historia:** Como Oficial de Seguridad del sistema, quiero que el endpoint de login esté protegido contra ataques de fuerza bruta mediante rate limiting por IP y cuenta, con bloqueo temporal progresivo (exponential backoff), para prevenir que atacantes automatizados comprometan credenciales de usuarios legítimos del despacho mediante diccionarios o credential stuffing.

**Alcance:**
Rate limiting granular en el endpoint `POST /api/v1/auth/login`. Contador de intentos fallidos por cuenta y por IP en Redis. Lockout temporal progresivo: N intentos → lockout de 1 min, 2N → 5 min, 3N → 15 min, >4N → bloqueo permanente hasta intervención del administrador. Notificación al usuario por email tras bloqueo. No cubre rate limiting de otros endpoints (API general) ni protección DDoS.

**Historia en formato Given/When/Then:**
- **Given** que un atacante automatizado intenta adivinar la contraseña de un usuario legítimo del tenant, y la política de seguridad del tenant está configurada con: máximo 5 intentos fallidos por cuenta, máximo 10 intentos fallidos por IP en ventana de 1 minuto.
- **When** el atacante realiza el sexto intento fallido consecutivo para la misma cuenta desde la misma IP.
- **Then** el BFF Express debe rechazar la petición con `429 Too Many Requests` y bloquear temporalmente la cuenta por 1 minuto (primer nivel de lockout).
- **And** si los intentos continúan (desde cualquier IP), el lockout progresa exponencialmente: 10 intentos → 5 min, 15 intentos → 15 min, 20 intentos → bloqueo permanente (estado `LOCKED` en tabla `users`).
- **And** debe enviar una notificación por email al usuario afectado informando del bloqueo de cuenta por actividad sospechosa y registrando el evento en `audit_logs`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie), HU-02.04 (Política de contraseñas robustas).
- Regla de negocio: Los contadores en Redis expiran automáticamente tras la ventana de tiempo configurada (TTL). El lockout se aplica a nivel de cuenta (no de IP) para prevenir que un atacante distribuido por múltiples IPs evada la protección sobre una misma cuenta. El bloqueo permanente requiere desbloqueo manual por un administrador con rol `ADMIN` u `OWNER`.
- El rate limiting usa el algoritmo sliding window en Redis para precisión temporal.

**Criterios de aceptación:**
1. Tras 5 intentos fallidos consecutivos para la cuenta `user@despacho.com`, el sexto intento devuelve `429 Too Many Requests` con `Retry-After: 60` y la cuenta no puede autenticarse incluso con contraseña correcta.
2. El lockout progresivo escala correctamente: intento 10 → `Retry-After: 300`, intento 15 → `Retry-After: 900`, intento 20 → cuenta bloqueada permanentemente (estado `LOCKED`).
3. El administrador del tenant puede desbloquear una cuenta (`POST /api/v1/admin/users/{user_id}/unlock`) requiriendo 2FA para ejecutar la acción.
4. La notificación de bloqueo se envía al email del usuario (vía Celery worker) en ≤10 segundos tras el lockout.
5. Los tests de carga validan que el rate limiting maneja 1000 peticiones/segundo concurrentes sin falsos positivos (las cuentas legítimas no son bloqueadas por error).

**Impactos y consideraciones:**
- Crítico para la postura de seguridad del sistema: los ataques de fuerza bruta son el vector de compromiso más común en plataformas SaaS financieras. La protección progresiva balancea seguridad con usabilidad (el lockout temporal no requiere intervención de soporte en los primeros niveles).
- El uso de Redis para rate limiting introduce una dependencia operacional; si Redis no está disponible, el sistema debe funcionar en modo degradado (fail-open sin rate limiting pero con logging de alerta).

**Referencias y trazabilidad:**
- SAD: §13.8 — Seguridad ofensiva y defensiva, §13.4 — Autenticación federada
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §3.6 — Rate Limiting y Protección Anti-Brute-Force
- ADR: ADR-0006 — Mandato de Autenticación Multifactorial (MFA), ADR-0005 (Anti-Brute-Force)
- Tablas afectadas: `users`, `login_attempts`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---

#### HU-02.07 — Detección de sesiones anómalas por geolocalización y device fingerprint

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2 (BFF Express) — Análisis de sesiones, SAD §9.3 (Core Fiscal) — Motor de anomalías
**Historia:** Como Oficial de Seguridad del tenant, quiero que el sistema detecte y notifique automáticamente cuando una sesión se inicia desde una ubicación geográfica o dispositivo inusual para ese usuario —por ejemplo, un login desde Rusia cuando el usuario opera siempre desde Ciudad de México—, para identificar proactivamente posibles compromisos de cuentas antes de que causen daño fiscal o fuga de datos.

**Alcance:**
Motor de detección de anomalías de sesión basado en heurísticas: (a) distancia geográfica >500 km en <1 hora desde la última sesión, (b) device fingerprint hash diferente al histórico conocido, (c) cambio de ISP o ASN inconsistente con el perfil. Notificación al usuario y al Oficial de Cumplimiento. Registro en `audit_logs`. No cubre bloqueo automático (eso es decisión del equipo de seguridad); la HU genera alertas, no actúa.

**Historia en formato Given/When/Then:**
- **Given** un usuario "Contador Senior" del despacho siempre accede desde IPs de Ciudad de México (CDMX) con el mismo dispositivo (surface hash consistente), y su perfil de sesión tiene 30 días de historial en la tabla `session_history`.
- **When** se detecta un nuevo login exitoso para ese usuario desde una IP geolocalizada en Moscú, Rusia (distancia >10,000 km respecto a CDMX) y con un device fingerprint hash diferente al histórico registrado.
- **Then** el motor de anomalías debe registrar el evento en `session_anomalies` con severidad `HIGH` (dos factores anómalos simultáneos: geolocalización + dispositivo) y crear una alerta en la bandeja del Oficial de Cumplimiento.
- **And** debe enviar una notificación inmediata al email y/o SMS del usuario: "Nuevo inicio de sesión detectado desde [Ciudad, País] en [dispositivo]. Si no fuiste tú, contacta a soporte inmediatamente."
- **And** la sesión debe marcarse con flag `anomalous = true` en la tabla `sessions` para que el HUD del Oficial de Cumplimiento (EP-13) la destaque visualmente.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie), HU-02.03 (Gestión de sesiones multi-dispositivo).
- Regla de negocio: La detección es puramente heurística; no bloquea sesiones automáticamente (los falsos positivos —viajes de negocio legítimos— son esperados). La geolocalización se obtiene del header `X-Forwarded-For` + base de datos GeoIP (MaxMind GeoLite2) local, sin enviar la IP del usuario a servicios externos. El device fingerprint es un hash SHA-256 de User-Agent + screen resolution + timezone + WebGL renderer (generado en frontend).
- La severidad se calcula como: 1 factor anómalo = `LOW`, 2 factores = `MEDIUM`, 3 factores = `HIGH` (geolocalización, dispositivo, ISP/ASN).

**Criterios de aceptación:**
1. Un login desde IP en un país diferente al histórico (distancia >1000 km) y con device fingerprint nuevo genera una alerta de severidad `MEDIUM` en ≤30 segundos tras el login exitoso.
2. La tabla `session_anomalies` registra correctamente los factores detectados (atributos geolocalización, dispositivo, ISP) y la severidad calculada.
3. La notificación al usuario (email) se envía incluyendo la ubicación aproximada y tipo de dispositivo, permitiendo al usuario confirmar si fue él ("Sí, fui yo" / "No, reportar").
4. El motor no genera falsos positivos cuando un usuario cambia de red WiFi manteniendo el mismo dispositivo (cambio de IP pero mismo fingerprint).
5. Los tests automatizados incluyen al menos 6 escenarios: (a) mismo dispositivo + IP cercana = `LOW`, (b) distinto dispositivo + IP cercana = `MEDIUM`, (c) mismo dispositivo + IP distante = `MEDIUM`, (d) distinto dispositivo + IP distante = `HIGH`, (e) viaje legítimo en avión (misma ciudad que ayer) = sin alerta, (f) VPN corporativa (IP diferente, mismo dispositivo) = `LOW`.

**Impactos y consideraciones:**
- Detecta proactivamente compromisos de cuentas (credential stuffing exitoso, sesiones secuestradas) antes de que el atacante pueda acceder a facturas, modificar perfiles fiscales o exportar datos sensibles.
- Depende de la precisión de GeoLite2 (~99.8% a nivel país, ~80% a nivel ciudad); imprecisiones en ciudades fronterizas pueden generar falsos positivos leves.

**Referencias y trazabilidad:**
- SAD: §13.6 — Manejo de sesiones y cookies, §13.8 — Seguridad ofensiva y defensiva
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §3.7 — Motor de Detección de Sesiones Anómalas
- ADR: ADR-0005 — Arquitectura de cookies HttpOnly, ADR-0005 (Detección de Sesiones Anómalas)
- Tablas afectadas: `sessions`, `session_history`, `session_anomalies`, `audit_logs`
- Flujo crítico SAD §10: §10.8 (Gestión de alertas y notificaciones de seguridad)

---

#### HU-02.08 — Recuperación segura de cuenta con verificación multi-canal (email + SMS + 2FA)

**Épica:** EP-02 — Identidad, Sesión y 2FA
**Módulo(s):** SAD §9.2 (BFF Express) — Flujo de recuperación, SAD §9.3 (Core Fiscal) — Servicio de verificación
**Historia:** Como Usuario de Sentinel, quiero poder recuperar el acceso a mi cuenta si olvido mi contraseña o pierdo mi dispositivo 2FA, mediante un flujo de verificación multi-canal que confirme mi identidad a través de email, SMS y mi segundo factor registrado, para no quedar bloqueado permanentemente y poder seguir operando mis obligaciones fiscales sin interrupción.

**Alcance:**
Flujo completo de recuperación de cuenta ("Olvidé mi contraseña" y "Perdí mi dispositivo 2FA"). Verificación multi-canal con tokens OTP de un solo uso enviados por email y SMS. Verificación de backup codes 2FA. Restablecimiento seguro de contraseña con invalidación de todas las sesiones activas. No cubre recuperación de cuenta por llamada telefónica con soporte humano.

**Historia en formato Given/When/Then:**
- **Given** un usuario olvidó su contraseña y no puede acceder a Sentinel; navega al flujo de recuperación en la pantalla de login e ingresa su email registrado.
- **When** el sistema recibe la solicitud de recuperación (`POST /api/v1/auth/recover/initiate`).
- **Then** debe enviar simultáneamente un código OTP de 6 dígitos al email del usuario (con expiración de 10 minutos) y un código OTP diferente al SMS registrado (con expiración de 10 minutos).
- **And** el usuario debe ingresar ambos códigos en la UI de recuperación (`POST /api/v1/auth/recover/verify`) dentro del tiempo de expiración.
- **And** tras la verificación exitosa de ambos canales, el sistema debe presentar la pantalla de restablecimiento de contraseña, que fuerza el cumplimiento de la política de contraseñas del tenant (HU-02.04).
- **And** al restablecer exitosamente, todas las sesiones activas del usuario deben ser revocadas inmediatamente (blacklist de JWTs), registrando el evento en `audit_logs` como `ACCOUNT_RECOVERY`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (BFF Express 5 + Auth.js v5 JWT HttpOnly Cookie), HU-02.02 (Autenticación 2FA TOTP con códigos QR y backup codes).
- Regla de negocio: El flujo de recuperación nunca debe revelar si el email existe o no en el sistema (respuesta genérica: "Si el email está registrado, recibirás instrucciones"). Los OTPs se almacenan en Redis con TTL de 10 minutos. Tras 3 intentos fallidos de verificación de OTPs, los códigos se invalidan y el usuario debe reiniciar el flujo.
- Si el usuario perdió su dispositivo 2FA, puede usar un backup code (generado en HU-02.02) como verificación adicional en lugar del código TOTP.

**Criterios de aceptación:**
1. El flujo de recuperación por email + SMS envía ambos OTPs en ≤30 segundos tras la solicitud (usando workers Celery para envío asíncrono de SMS).
2. El ingreso de ambos OTPs correctos permite al usuario restablecer su contraseña; si alguno es incorrecto, se rechaza con error genérico sin indicar cuál falló.
3. Tras 3 intentos fallidos de verificación de OTPs, los códigos expiran inmediatamente y el endpoint devuelve `410 Gone` obligando al usuario a reiniciar el flujo.
4. El restablecimiento de contraseña revoca todas las sesiones activas del usuario (verificable consultando el panel de sesiones vacío tras el restablecimiento).
5. El flujo de recuperación de 2FA (pérdida de dispositivo) permite usar backup codes de HU-02.02 para desactivar 2FA temporalmente y reconfigurarlo, registrando el uso del backup code como consumido.

**Impactos y consideraciones:**
- Crítico para la experiencia de usuario y la continuidad operativa: un usuario bloqueado no puede cumplir con sus obligaciones fiscales (presentar declaraciones, revisar alertas PLD). El flujo multi-canal balancea seguridad con accesibilidad.
- Introduce dependencia del servicio de envío de SMS; se debe implementar con un adaptador desacoplado (Twilio, AWS SNS, proveedor local mexicano) y fallback a solo email si el SMS no está disponible.

**Referencias y trazabilidad:**
- SAD: §13.4 — Autenticación federada, §13.8 — Seguridad ofensiva y defensiva
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §3.8 — Flujo de Recuperación Segura de Cuenta
- ADR: ADR-0006 — Mandato de Autenticación Multifactorial (MFA), ADR-0005 (Recuperación Multi-Canal)
- Tablas afectadas: `users`, `sessions`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---
---

### 5.3 EP-03 — RBAC, Tenancy y Administración

#### HU-03.01 — "Mi Perfil": datos personales, idioma y zona horaria

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.2, SAD §9.1
**Historia:** Como contador del despacho, quiero configurar mis datos personales, idioma de interfaz y zona horaria para personalizar mi experiencia en Sentinel.

**Alcance:**
Backend BFF Express + Frontend React 19 SPA. CRUD de preferencias de usuario. Campos: nombre, apellido, email, idioma (es/en), zona horaria (America/Mexico_City por defecto).

**Historia en formato Given/When/Then:**
- **Given** un ACCOUNTANT ha iniciado sesión
- **When** accede a "Mi Perfil" desde el menú de usuario
- **Then** ve formulario precargado con sus datos actuales
- **And** puede modificar idioma y zona horaria con aplicación inmediata sin recargar

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (Google OAuth)
- Regla de negocio: El email es de solo lectura (proviene de Google OAuth).

**Criterios de aceptación:**
1. Cambio de idioma aplica inmediatamente todos los labels y mensajes del SPA.
2. Zona horaria se usa en todas las visualizaciones de timestamps (facturas, alertas, syncs).
3. Preferencias persisten entre sesiones.

**Impactos y consideraciones:**
- Base para i18n futuro. El campo zona horaria afecta cálculo de fechas fiscales.

**Referencias y trazabilidad:**
- SAD: §18.6 — UX y roles de usuario
- SAD-Lite: §9.1 — Matriz de capacidades
- Developer Handbook: §8.2 — BFF Express contracts
- ADR: ADR-0001
- Tablas afectadas: users, user_preferences
- Flujo crítico SAD §10: §10.1 — Onboarding

#### HU-03.02 — Configuración de notificaciones y alertas por usuario

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.2, SAD §9.1
**Historia:** Como oficial de cumplimiento, quiero configurar qué alertas recibo por email y con qué frecuencia para no saturarme con notificaciones irrelevantes.

**Alcance:**
Backend BFF Express + Frontend React 19. Panel de preferencias de notificaciones. Tipos: alertas críticas, alertas PLD, cambios 69-B, reportes semanales, vencimiento de SLAs.

**Historia en formato Given/When/Then:**
- **Given** un ADMIN con 2FA activo
- **When** accede a "Preferencias de notificaciones"
- **Then** ve toggle switches para cada tipo de alerta con opción de frecuencia (inmediata, diaria, semanal)
- **And** puede configurar email alternativo para notificaciones críticas

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-03.01 (Mi Perfil)
- Regla de negocio: Alertas CRITICAL siempre se envían, sin excepción. Solo MEDIUM y LOW son configurables.

**Criterios de aceptación:**
1. Cambios en preferencias persisten inmediatamente (guardado en < 200ms).
2. Notificaciones críticas llegan en < 60 segundos desde la generación de la alerta.
3. Resumen diario se envía a las 08:00 AM hora local del tenant.

**Impactos y consideraciones:**
- Requiere integración con servicio de email transaccional (SendGrid/Mailgun).

**Referencias y trazabilidad:**
- SAD: §18.6 — UX roles
- SAD-Lite: §9.1 — Matriz de capacidades
- Developer Handbook: §8.2 — BFF Express
- ADR: ADR-0001
- Tablas afectadas: user_preferences, alerts
- Flujo crítico SAD §10: §10.8 — Atención de alertas

#### HU-03.03 — Portal del Oficial de Cumplimiento: visualizador de bitácoras WORM

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.5, SAD §9.8
**Historia:** Como oficial de cumplimiento del despacho, quiero un panel dedicado para visualizar las bitácoras inmutables de auditoría (WORM) y exportar reportes de cumplimiento para presentar ante autoridades fiscales.

**Alcance:**
Backend (Core Fiscal) + Frontend (React 19). Vista de solo lectura de audit_logs con filtros avanzados (fecha, usuario, acción, entidad). Exportación PDF/CSV con sello de integridad. Sin capacidad de modificación.

**Historia en formato Given/When/Then:**
- **Given** un ADMIN (Oficial de Cumplimiento) autenticado
- **When** accede al "Portal de Cumplimiento" desde el menú principal
- **Then** ve dashboard con conteo de eventos de auditoría (últimas 24h, 7d, 30d)
- **And** puede filtrar por tipo de evento (LOGIN, ALERT_UPDATE, CFDI_INGEST, 69B_CHANGE, EVIDENCE_UPLOAD)
- **And** puede exportar el reporte filtrado con sello criptográfico de integridad

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (Google OAuth), HU-04.04 (Políticas RLS). Nota: La Caja Negra WORM (HU-11.06) se habilita posteriormente; el portal funciona inicialmente con audit_logs básico.
- Regla de negocio: El portal es de solo lectura. Ningún rol puede modificar audit_logs (WORM).

**Criterios de aceptación:**
1. Consultas de auditoría con hasta 10,000 registros responden en < 3 segundos.
2. Exportación PDF incluye hash SHA-256 del contenido como sello de integridad.
3. Registro inmutable en audit_logs de cada acceso al portal de cumplimiento.

**Impactos y consideraciones:**
- Clave para auditorías regulatorias y defensa legal ante SAT/UIF.

**Referencias y trazabilidad:**
- SAD: §15 — Observabilidad y auditoría
- SAD-Lite: §9.1 — Matriz de capacidades y permisos
- Developer Handbook: §8.10 — Observabilidad
- ADR: ADR-0008
- Tablas afectadas: audit_logs, vault_files
- Flujo crítico SAD §10: §10.9 — Evidencia

#### HU-03.04 — Administración de usuarios y roles del tenant

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.2, SAD §9.9
**Historia:** Como OWNER del despacho, quiero invitar, gestionar roles (OWNER/ADMIN/ACCOUNTANT/VIEWER) y desactivar usuarios de mi tenant para controlar quién accede a los datos fiscales de mis clientes.

**Alcance:**
Backend BFF Express + Core. CRUD de tenant_users con asignación de roles. Invitación por email. Desactivación (soft delete, no eliminación). Validación RLS.

**Historia en formato Given/When/Then:**
- **Given** un OWNER autenticado
- **When** invita a un nuevo contador ingresando email corporativo y seleccionando rol ACCOUNTANT
- **Then** se envía email de invitación con link de registro
- **And** al aceptar, el usuario aparece en la lista de miembros del tenant con su rol asignado
- **And** el OWNER puede cambiar roles o desactivar miembros (el registro permanece en DB con disabled_at)

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-02.01 (Google OAuth)
- Regla de negocio: Solo OWNER puede asignar rol OWNER. No se puede eliminar el último OWNER activo. Desactivar NO elimina — solo marca disabled_at.

**Criterios de aceptación:**
1. Invitación se envía en < 5 segundos tras confirmación.
2. Cambio de rol se registra en audit_logs con diff (antes/después).
3. Usuario desactivado recibe 403 Forbidden en siguiente petición.
4. VIEWER no puede acceder al endpoint de administración de usuarios (HTTP 403).

**Impactos y consideraciones:**
- Gobernanza de acceso es responsabilidad del OWNER. Sentinel no audita decisiones de asignación de roles.

**Referencias y trazabilidad:**
- SAD: §13.5 — Autorización RBAC
- SAD-Lite: §9.1 — Matriz de capacidades
- Developer Handbook: §8.9 — Admin/FinOps
- ADR: ADR-0001
- Tablas afectadas: users, tenant_users, audit_logs
- Flujo crítico SAD §10: §10.1 — Onboarding

#### HU-03.05 — Configuración global del despacho (parámetros FinOps y PLD)

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.5, SAD §9.3
**Historia:** Como OWNER del despacho, quiero configurar parámetros globales del tenant como límites de cuota Belvo, umbrales PLD base, y datos fiscales del despacho para adaptar Sentinel a las necesidades de mi operación.

**Alcance:**
Backend Core FastAPI + Frontend. CRUD de configuración de tenant: razón social, RFC del despacho, umbrales PLD por defecto, límite de cuota Belvo mensual, zona horaria del tenant.

**Historia en formato Given/When/Then:**
- **Given** un OWNER en el panel de administración
- **When** modifica el umbral PLD de Aviso de 1,500 UMA a 2,000 UMA
- **Then** el cambio se registra en audit_logs con justificación obligatoria y requiere co-firma de otro ADMIN si está configurado (ADR-0009)
- **And** el nuevo umbral aplica a todas las nuevas evaluaciones PLD (no retroactivo)

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-03.04 (Admin usuarios)
- Regla de negocio: Cambios de umbrales requieren ADR interno y co-firma (ADR-0009). Cambios de RFC del despacho son irreversibles una vez que existe al menos una factura.

**Criterios de aceptación:**
1. Cambios de configuración se aplican en < 1 segundo.
2. Cada cambio genera entrada inmutable en audit_logs con usuario, timestamp, valor anterior y nuevo.
3. Umbrales modificados no afectan evaluaciones PLD ya realizadas (no retroactividad).

**Impactos y consideraciones:**
- Umbrales PLD muy bajos generan falsos positivos. Umbrales muy altos generan riesgo regulatorio.

**Referencias y trazabilidad:**
- SAD: §17.7 — Versionado de reglas PLD
- SAD-Lite: §9.1 — Matriz de capacidades
- Developer Handbook: §8.9 — Admin/FinOps
- ADR: ADR-0009
- Tablas afectadas: tenants, tax_profiles, audit_logs
- Flujo crítico SAD §10: §10.2 — Configuración

# GOLDEN TEMPLATES — HUs MAPEADAS (v3.1.1 → v3.2.0)
# Épicas EP-04, EP-06, EP-07, EP-09, EP-10, EP-11
# Sentinel Nexus 360 Enterprise — v3.2.0-MASTER
# Fecha: 2026-05-25

---
#### HU-03.06 — Gestión de tenancy multi-despacho para holdings con sub-tenants anidados

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.3 (Core Fiscal) — Lógica de tenancy jerárquico, SAD §9.2 (BFF Express) — API de administración
**Historia:** Como Administrador de un holding corporativo con múltiples despachos contables (ej. "Grupo Financiero México" con 5 despachos regionales), quiero gestionar una jerarquía de tenants donde un tenant padre (holding) pueda crear, visualizar y administrar sub-tenants (despachos), cada uno con sus propios usuarios, roles, facturas y configuraciones, heredando políticas del padre pero manteniendo aislamiento de datos vía RLS.

**Alcance:**
Modelo de tenancy jerárquico con herencia de configuración. API CRUD de sub-tenants. Asignación de administradores de sub-tenant. Herencia de políticas (contraseñas, FinOps, PLD) con sobrescritura opcional. Aislamiento RLS estricto entre sub-tenants. No cubre facturación consolidada del holding ni dashboards multi-tenant agregados (eso son HUs futuras de FinOps).

**Historia en formato Given/When/Then:**
- **Given** un holding "Grupo Financiero México" (tenant `A`) ya configurado en Sentinel con sus políticas de seguridad y parámetros FinOps, y un usuario con rol `HOLDING_ADMIN` autenticado.
- **When** el administrador crea un sub-tenant "Despacho Monterrey" (`POST /api/v1/tenants` con `parent_tenant_id = A`) asignando un administrador local y definiendo si hereda o sobrescribe las políticas del padre.
- **Then** el sistema debe crear el sub-tenant con su propio `tenant_id` UUID, heredar por defecto las políticas del padre (contraseñas NIST, rotación, umbrales PLD, cobertura FinOps), y crear el esquema lógico de aislamiento RLS donde las filas del sub-tenant son accesibles solo por usuarios de ese sub-tenant o del tenant padre (con rol `HOLDING_ADMIN`).
- **And** el administrador local debe recibir una notificación de activación del sub-tenant y poder comenzar el onboarding de su despacho.
- **And** el tenant padre debe poder listar todos sus sub-tenants (`GET /api/v1/tenants?parent_tenant_id=A`) y ver métricas agregadas (usuarios activos, facturas procesadas, alertas abiertas por sub-tenant).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-03.04 (Administración de usuarios y roles del tenant con matriz RBAC granular), HU-03.05 (Configuración global del despacho: parámetros FinOps, PLD y calendario fiscal).
- Regla de negocio: La jerarquía de tenants soporta 3 niveles máximo (Holding → Despacho Regional → Sucursal). Las políticas heredables incluyen: política de contraseñas (HU-02.04), umbrales PLD por UMAs, parámetros FinOps, y calendario fiscal. Un sub-tenant puede sobrescribir cualquier política excepto los parámetros de cumplimiento legal (69-B, OFAC/ONU screening) que son obligatorios a nivel holding.
- El aislamiento RLS se implementa con `tenant_id` y `parent_tenant_id` en PostgreSQL 17; un usuario del holding con `HOLDING_ADMIN` puede ver datos de todos sus sub-tenants; un usuario de sub-tenant solo ve los de su `tenant_id`.

**Criterios de aceptación:**
1. El endpoint `POST /api/v1/tenants` crea un sub-tenant en ≤2 segundos, incluyendo la copia heredada de todas las políticas del padre (confirmado consultando `tenant_config` del sub-tenant).
2. Un usuario del sub-tenant "Despacho Monterrey" no puede acceder a facturas, alertas o datos del sub-tenant "Despacho Guadalajara" (verificado con `test_rls_isolation.py`).
3. Un usuario con rol `HOLDING_ADMIN` del tenant padre puede ver y administrar los datos de todos los sub-tenants (verificado con test de RLS para jerarquía).
4. Un sub-tenant puede sobrescribir su política de contraseñas (ej. pasar de 90 a 60 días de rotación) sin afectar la política de otros sub-tenants ni del padre.
5. Los tests automatizados validan al menos 3 niveles de jerarquía (Holding → Despacho → Sucursal) con verificación de herencia, sobrescritura y aislamiento RLS.

**Impactos y consideraciones:**
- Habilita el modelo de negocio multi-despacho que es el diferenciador principal de Sentinel en el mercado de software fiscal mexicano: un holding puede gestionar todos sus despachos desde una sola instancia, reduciendo costos de TI y centralizando el cumplimiento.
- La complejidad de RLS jerárquico aumenta el riesgo de fuga de datos entre sub-tenants si el modelo de herencia no está correctamente implementado. Requiere tests exhaustivos de aislamiento.

**Referencias y trazabilidad:**
- SAD: §11.6 — RLS y aislamiento real por tenant_id, §13.5 — Autorización y RBAC/ABAC
- SAD-Lite: §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §4.1 — Gestión de Tenancy Multi-D despacho Jerárquico
- ADR: ADR-0001 — Elección de PostgreSQL 17 + pgvector local como motor unificado, ADR-0002 — Estrategia de RLS dinámico con inyección contextual
- Tablas afectadas: `tenants`, `sub_tenants`, `tenant_config`, `users`, `audit_logs`
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---

#### HU-03.07 — Dashboard de auditoría RBAC con matriz de permisos interactiva y simulación

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.3 (Core Fiscal) — API de RBAC, SAD §9.2 (BFF Express) — Middleware, SAD §9.1 (Frontend SPA) — Dashboard interactivo, SAD §9.10 (Observabilidad)
**Historia:** Como Administrador del tenant / Oficial de Cumplimiento, quiero visualizar un dashboard interactivo con la matriz completa de roles y permisos del sistema —qué rol puede hacer qué en cada módulo— y poder simular cambios ("¿qué pasaría si al rol 'Analista Junior' le quito el permiso de exportar reportes?") antes de aplicarlos, para tomar decisiones informadas de gobernanza de accesos sin romper flujos operativos accidentalmente.

**Alcance:**
Dashboard interactivo (React 19, Vanilla CSS Liquid Glass) con matriz de roles vs permisos. API de consulta y simulación (`GET /api/v1/rbac/matrix`, `POST /api/v1/rbac/simulate`). Visualización de impacto de cambios propuestos (usuarios afectados, flujos interrumpidos). Historial de cambios de RBAC con auditoría. No cubre creación de nuevos roles o permisos en esta HU (eso es HU-03.04 mapped).

**Historia en formato Given/When/Then:**
- **Given** un administrador del tenant con rol `ADMIN` accede al dashboard de auditoría RBAC desde el panel de administración.
- **When** el dashboard carga la matriz de permisos (`GET /api/v1/rbac/matrix?tenant_id=X`), renderizando una tabla interactiva donde las filas son roles (`OWNER`, `ADMIN`, `ACCOUNTANT`, `ANALYST`, `VIEWER`) y las columnas son permisos agrupados por módulo (Facturas, Alertas, Reportes, Administración, Vault, Configuración).
- **Then** cada celda de la matriz debe mostrar un toggle ON/OFF indicando si el rol tiene ese permiso actualmente, con diferenciación visual para permisos heredados (del tenant padre en jerarquías multi-tenant).
- **And** al modificar un toggle (en modo simulación), el dashboard debe llamar `POST /api/v1/rbac/simulate` y mostrar en tiempo real: (a) número de usuarios afectados por el cambio, (b) flujos operativos que se interrumpirían (ej. "3 analistas en Despacho Monterrey perderían acceso a exportación de reportes PLD"), y (c) si el cambio viola alguna regla de mínimos (ej. "OWNER no puede perder permiso de administración de usuarios").
- **And** al confirmar la aplicación de los cambios simulados, debe ejecutar la actualización en `role_permissions` y registrar el cambio en `admin_audit_logs` con detalles del usuario administrador, timestamp y diff de permisos modificados.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-03.04 (Administración de usuarios y roles del tenant con matriz RBAC granular).
- Regla de negocio: Existen permisos base ("core permissions") que no pueden ser revocados de ciertos roles (ej. `OWNER` siempre puede administrar usuarios; `ACCOUNTANT` siempre puede ver facturas de su tenant). La simulación es no-destructiva y no modifica la base de datos hasta que el administrador confirma explícitamente. Los cambios de permisos se registran con diff (array de JSON con `{permission, from, to}`).
- La matriz debe cargarse en ≤1 segundo para tenants con hasta 10 roles y 50 permisos (complejidad O(R×P)).

**Criterios de aceptación:**
1. La matriz de permisos renderiza correctamente todos los roles y permisos del tenant, con celdas interactivas toggle que muestran el estado actual (verde = ON, rojo = OFF, gris = heredado del padre).
2. La simulación al desactivar un permiso muestra en ≤500ms: lista de usuarios afectados, permisos heredados que se romperían, y advertencia si se viola alguna regla de permisos base.
3. El administrador no puede desactivar permisos "core" de `OWNER`; el sistema muestra un mensaje de bloqueo y no permite la simulación sobre ese permiso.
4. Al confirmar la aplicación, la tabla `role_permissions` se actualiza transaccionalmente y el diff se registra en `admin_audit_logs` con el formato canónico de auditoría (HU-03.09).
5. El dashboard cumple con los estándares Liquid Glass (Vanilla CSS, responsive ≥1024px, animaciones de transición suave en toggles).

**Impactos y consideraciones:**
- Empodera al administrador del despacho para ajustar la gobernanza de accesos sin depender del equipo técnico de Sentinel. Reduce el riesgo de cambios de RBAC mal planificados que bloqueen a usuarios en medio de operaciones fiscales críticas.
- La simulación requiere mantener una vista materializada de usuarios por rol/permiso para responder en tiempo real; debe actualizarse automáticamente al cambiar asignaciones de rol.

**Referencias y trazabilidad:**
- SAD: §13.5 — Autorización y RBAC/ABAC, §18.2 — Visualización y dashboards operacionales
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §4.2 — Dashboard de Auditoría RBAC y Simulación de Permisos
- ADR: ADR-0001 — Elección de PostgreSQL 17 + pgvector local, ADR-0001 (RBAC Matrix Dashboard)
- Tablas afectadas: `roles`, `permissions`, `role_permissions`, `user_roles`, `admin_audit_logs`
- Flujo crítico SAD §10: §10.8 — Gestión de alertas (depende de asignación correcta de roles)

---

#### HU-03.08 — API keys y gestión de tokens de servicio para integraciones externas (M2M)

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.3 (Core Fiscal) — Servicio de API keys, SAD §9.2 (BFF Express) — Middleware de autenticación M2M
**Historia:** Como Administrador Técnico del tenant / Desarrollador de integraciones, quiero generar y gestionar API keys con alcance limitado por permisos específicos (scopes) para que sistemas externos del despacho (ERP, CRM, sistemas de facturación legacy) puedan integrarse con Sentinel mediante autenticación machine-to-machine (M2M) sin usar credenciales de usuario humano y con auditoría completa de su uso.

**Alcance:**
Sistema de API keys con scopes granulares. CRUD de API keys en panel de administración. Autenticación M2M vía header `X-Sentinel-API-Key` y secreto. Rate limiting por API key. Rotación y revocación de keys. Auditoría de uso (endpoints accedidos, timestamps, IPs). No cubre OAuth 2.0 Client Credentials flow (posible evolución futura) ni marketplace público de APIs.

**Historia en formato Given/When/Then:**
- **Given** que el administrador técnico del despacho necesita integrar el ERP interno "SAP Business One" para que envíe facturas automáticamente a Sentinel cuando se generan en el ERP.
- **When** el administrador crea una nueva API key desde el panel de administración (`POST /api/v1/api-keys`) especificando: nombre descriptivo "ERP SAP - Producción", scopes `["invoices:write", "invoices:read"]`, y expiración a 365 días.
- **Then** el sistema debe generar un `api_key_id` (UUID público) y un `api_secret` (solo visible al momento de la creación, almacenado como hash SHA-256 en BD) y mostrar el secreto una única vez.
- **And** el sistema externo puede autenticarse enviando el header `X-Sentinel-API-Key: <api_key_id>` y `X-Sentinel-API-Secret: <api_secret>` en cada petición.
- **And** el middleware de autenticación M2M en el BFF Express debe validar el secreto usando timingSafeEqual, verificar que la key no esté expirada ni revocada, y otorgar acceso únicamente a los endpoints dentro de los scopes autorizados.
- **And** cada uso de la API key debe registrarse en `m2m_access_logs` con: `api_key_id`, endpoint accedido, timestamp, IP, si fue autorizado o denegado, y latencia de la petición.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-03.04 (Administración de usuarios y roles del tenant con matriz RBAC granular).
- Regla de negocio: Los scopes de API key son un subconjunto de los permisos definidos en el sistema RBAC. Una API key no puede tener scopes que excedan los permisos del rol del administrador que la crea. Los secretos se almacenan como hash SHA-256 (nunca en texto plano) y solo son visibles al momento de la creación. Las API keys expiradas o revocadas no pueden reactivarse; debe crearse una nueva.
- La autenticación M2M omite el flujo de cookies JWT y sesiones de usuario, pero mantiene el contexto RLS: cada API key está asociada a un `tenant_id` y hereda el aislamiento multi-tenant.

**Criterios de aceptación:**
1. La creación de API key genera un par `api_key_id` + `api_secret`; el secreto se muestra una sola vez en la UI y luego solo es recuperable por hash (nunca re-expuesto).
2. Una petición autenticada con API key válida y scope autorizado accede correctamente al endpoint; con scope insuficiente devuelve `403 Forbidden`; con secreto inválido devuelve `401 Unauthorized` usando timingSafeEqual para prevenir timing attacks.
3. La revocación de una API key (`DELETE /api/v1/api-keys/{key_id}`) invalida inmediatamente todas las peticiones futuras con esa key (verificación contra lista de revocación en Redis).
4. La tabla `m2m_access_logs` registra al menos 10,000 entradas/segundo en pruebas de carga sin degradación >10% en la latencia de los endpoints.
5. El panel de administración muestra para cada API key: nombre, scopes, fecha de creación, fecha de expiración, último uso (timestamp, IP), y contador total de peticiones.

**Impactos y consideraciones:**
- Habilita integraciones enterprise que son críticas para la adopción de Sentinel en despachos grandes: los ERPs existentes pueden automatizar el envío de facturas sin intervención humana, reduciendo errores y latencia operativa.
- La gestión de secretos visibles una sola vez requiere un diseño UI claro (modal con botón de copiar y advertencia de almacenamiento seguro) para evitar que el administrador pierda el secreto y deba rotar la key.

**Referencias y trazabilidad:**
- SAD: §13.5 — Autorización y RBAC/ABAC, §13.8 — Seguridad ofensiva y defensiva
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §4.3 — Gestión de API Keys y Autenticación Machine-to-Machine
- ADR: ADR-0001 — Elección de PostgreSQL 17, ADR-0001 (API Keys M2M)
- Tablas afectadas: `api_keys`, `m2m_access_logs`, `audit_logs`
- Flujo crítico SAD §10: §10.2 (Sincronización de facturas vía API/LENS)

---

#### HU-03.09 — Log de actividad administrativa inmutable para cambios de roles, permisos y config

**Épica:** EP-03 — RBAC, Tenancy y Administración
**Módulo(s):** SAD §9.3 (Core Fiscal) — Servicio de auditoría administrativa, SAD §9.10 (Observabilidad) — Trazabilidad
**Historia:** Como Oficial de Cumplimiento / Auditor externo del SAT o INAI, quiero que todo cambio administrativo en el sistema —modificación de roles, asignación de permisos, cambios en la configuración del tenant, creación o revocación de API keys— quede registrado en un log inmutable estilo WORM con detalles completos de quién hizo qué, cuándo, desde qué IP y cuál era el estado anterior, para garantizar trazabilidad forense completa de las acciones administrativas y cumplir con los requisitos de auditoría de sistemas fiscales digitales en México.

**Alcance:**
Trigger automático (nivel aplicación, no base de datos) que intercepta mutaciones en tablas administrativas: `users.role`, `role_permissions`, `tenant_config`, `api_keys`, `sso_configs`. Registro inmutable en `admin_audit_logs` con: `user_id`, `action_type`, `table_affected`, `record_id`, `old_state` (JSON), `new_state` (JSON), `ip_address`, `user_agent`, `timestamp`. Visualizador en panel de administración (solo roles `ADMIN`/`OWNER`). No cubre logs operativos de facturas o alertas (eso es `audit_logs` estándar).

**Historia en formato Given/When/Then:**
- **Given** un administrador del tenant con rol `ADMIN` modifica el rol de un usuario de `ACCOUNTANT` a `ANALYST` a través del panel de administración (`PUT /api/v1/admin/users/{user_id}/role`).
- **When** la mutación se ejecuta exitosamente en la base de datos (tabla `users` o `user_roles`).
- **Then** un hook de auditoría en la capa de servicio del Core Fiscal debe interceptar el cambio y automáticamente insertar un registro en `admin_audit_logs` con: `user_id` del administrador que ejecutó el cambio, `action_type = "ROLE_CHANGE"`, `table_affected = "user_roles"`, `record_id` del usuario modificado, `old_state = {"role": "ACCOUNTANT"}`, `new_state = {"role": "ANALYST"}`, `ip_address` y `user_agent` del administrador, timestamp en ISO 8601.
- **And** las filas en `admin_audit_logs` deben tener triggers de base de datos (PostgreSQL 17) que impidan `UPDATE` y `DELETE` sobre ellas (WORM a nivel DB).
- **And** el panel de administración debe tener una vista "Bitácora Administrativa" accesible solo para roles `ADMIN` y `OWNER` que permita filtrar por `user_id`, `action_type`, rango de fechas y exportar a PDF/CSV firmado digitalmente.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-03.04 (Administración de usuarios y roles del tenant con matriz RBAC granular).
- Regla de negocio: Todo cambio en configuración administrativa es trazado de forma inmutable. Los registros de `admin_audit_logs` no pueden ser modificados ni eliminados por ningún usuario, ni siquiera `OWNER` — esto se garantiza con triggers `BEFORE UPDATE ... RAISE EXCEPTION` y `BEFORE DELETE ... RAISE EXCEPTION` en PostgreSQL 17. La consulta de logs es de solo lectura.
- Las columnas `old_state` y `new_state` se almacenan como `JSONB` para permitir búsquedas estructuradas (ej. "todas las veces que se cambió el rol a ADMIN").

**Criterios de aceptación:**
1. Al cambiar el rol de un usuario, la tabla `admin_audit_logs` contiene automáticamente el registro con `old_state` y `new_state` correctos, sin intervención explícita del desarrollador en el código de la mutación (el hook de auditoría es declarativo/automático).
2. Intentos de ejecutar `UPDATE` o `DELETE` sobre `admin_audit_logs` directamente en la base de datos fallan con error de privilegios (trigger WORM) incluso para el usuario `postgres` admin de la DB (verificado con test `test_admin_audit_log_immutability.py`).
3. El visualizador de bitácora administrativa en el panel de administración carga los logs paginados (50 registros/página) en ≤1 segundo y permite filtros combinados (usuario, acción, fecha) con respuesta en ≤2 segundos.
4. La exportación de logs genera un PDF con firma SHA-256 que garantiza no repudio del archivo exportado; cada exportación queda registrada como un evento `ADMIN_LOG_EXPORT` en `audit_logs`.
5. La cobertura de tests del hook de auditoría alcanza el 100% de los tipos de acción definidos (ROLE_CHANGE, PERMISSION_CHANGE, TENANT_CONFIG_CHANGE, API_KEY_CREATED, API_KEY_REVOKED, SSO_CONFIG_CHANGE).

**Impactos y consideraciones:**
- Cumple con el requisito legal del CFF (Código Fiscal de la Federación) y LFPIORPI sobre trazabilidad de sistemas fiscales digitales: toda acción administrativa debe ser auditable con no repudio. Es un habilitador crítico para certificaciones de cumplimiento (ISO 27001, SOC 2) que los holdings corporativos exigen.
- El crecimiento de `admin_audit_logs` es lineal con la actividad administrativa (estimado: ~1000 registros/tenant/año); se recomienda particionar por año fiscal (consistente con HU-04.08 para invoices).

**Referencias y trazabilidad:**
- SAD: §11.8 — Inmutabilidad y WORM (Caja Negra de Auditoría), §13.5 — Autorización y RBAC/ABAC
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo, §8 — Escenarios Críticos de Operación
- Developer Handbook: §4.4 — Log de Actividad Administrativa Inmutable (WORM)
- ADR: ADR-0008 — Inmutabilidad de Bitácoras de Auditoría y Desactivación de Borrados Físicos
- Tablas afectadas: `admin_audit_logs`, `audit_logs`, `users`, `role_permissions`, `tenant_config`, `api_keys`
- Flujo crítico SAD §10: §10.1 (Precondiciones fundacionales — trazabilidad administrativa)

---

---

### 5.4 EP-04 — Persistencia, RLS y Migraciones

#### HU-04.01 — Esquema físico DDL completo en PostgreSQL 17 Docker

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — Definición del modelo de datos físico, SAD §11.2 (Modelo de Datos) — Esquema relacional canónico
**Historia:** Como arquitecto de datos de Sentinel, quiero disponer de un esquema físico DDL completo y versionado para PostgreSQL 17 ejecutándose en Docker, que incluya todas las tablas del sistema (tenants, users, tax_profiles, invoices, alerts, audit_logs, vault_files, sat_69b_list, pld_checks, risk_scores, webhook_events y todas las tablas operativas restantes) con sus constraints, índices, claves foráneas, tipos de datos canónicos, y extensiones habilitadas (pgvector, pgcrypto, uuid-ossp), para que todos los servicios del ecosistema Sentinel compartan una única fuente de verdad estructural y el despliegue local de desarrollo sea reproducible y determinista.

**Alcance:**
Definición completa del archivo DDL maestro (`schema.sql`) que cubre las 20+ tablas del modelo de datos canónico (18 definidas en Handbook §1 más tablas auxiliares planificadas) de Sentinel v3.2.0. Contenedor Docker Compose con PostgreSQL 17, healthcheck, inicialización automática del schema vía `docker-entrypoint-initdb.d`, y volúmenes persistentes para datos y logs. No cubre migraciones incrementales (Alembic/Flyway en HU-04.05), ni seeding de datos de prueba (HU-04.10), ni particionamiento horizontal (HU-04.08).

**Historia en formato Given/When/Then:**
- **Given** que un desarrollador clona el repositorio de Sentinel en su máquina local y ejecuta `docker compose up postgres` por primera vez, sin ninguna base de datos preexistente en el volumen de Docker.
- **When** el contenedor de PostgreSQL 17 arranca y ejecuta el script `001_sentinel_schema.sql` desde `docker-entrypoint-initdb.d/`, que contiene la definición DDL completa de todas las tablas del sistema con sus columnas, tipos de datos (usando los tipos canónicos: `UUID` para identificadores, `TIMESTAMPTZ` para timestamps con zona horaria, `NUMERIC(18,6)` para montos fiscales, `JSONB` para metadatos flexibles, `VECTOR(1536)` para embeddings), constraints (`PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`), e índices (incluyendo índices compuestos para queries frecuentes y restricciones de unicidad multi-columna).
- **Then** el esquema debe crearse exitosamente en la base de datos `sentinel` con las extensiones `pgvector`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, y `btree_gin` verificables mediante `\dx` en psql. Todas las tablas deben ser consultables con `\dt sentinel.*` y sus estructuras deben coincidir con el modelo de datos documentado en SAD §11.2.
- **And** un script de validación (`test_ddl_migrations.py`) debe conectarse a la base de datos, verificar la existencia de cada tabla y columna definida en el modelo canónico, comprobar que los tipos de datos son correctos (ej. `invoice_total` debe ser `NUMERIC(18,6)`, no `DOUBLE PRECISION`), validar que las FK referencian tablas existentes, y verificar que los índices declarados están realmente creados y son utilizables (`EXPLAIN` sobre queries representativas).
- **And** el contenedor debe reportar `healthy` en el healthcheck de Docker (`pg_isready -U sentinel -d sentinel`) en ≤10 segundos desde el arranque en frío.

**Prerrequisitos y reglas de negocio:**
- Requiere: Ninguno (H0 fundacional de todo el sistema).
- Regla de negocio: El esquema físico es la fuente canónica de verdad estructural del sistema. Cualquier modificación al schema debe pasar por un ADR y actualizar este archivo DDL maestro. El DDL es inmutable hacia atrás: las migraciones incrementales (HU-04.05) solo pueden agregar columnas/tablas, nunca eliminar o renombrar columnas existentes en producción sin un plan de migración con periodo de gracia. Los identificadores primarios usan `UUID v4` generados por la aplicación (no `SERIAL` ni `BIGSERIAL`) para permitir escalabilidad horizontal futura. Los montos fiscales se almacenan como `NUMERIC(18,6)` con precisión arbitraria para evitar errores de redondeo de punto flotante que podrían causar discrepancias en cálculos de UMAs y PLD. Los timestamps usan `TIMESTAMPTZ` para almacenamiento en UTC con preservación de zona horaria original.

**Criterios de aceptación:**
1. El `docker compose up postgres` inicializa exitosamente PostgreSQL 17 con el schema completo, todas las extensiones habilitadas, y el healthcheck reporta `healthy` en ≤10 segundos en hardware de desarrollo estándar (MacBook Pro M1/M2/M3, 16 GB RAM).
2. El script `test_ddl_migrations.py` ejecuta una validación exhaustiva que compara el schema real contra el modelo canónico (20+ tablas del modelo de datos canónico (18 definidas en Handbook §1 más tablas auxiliares planificadas), 200+ columnas, 50+ índices) y reporta cero discrepancias en un entorno limpio.
3. Una transacción que inserta datos en `invoices` con `invoice_total = 1234567.891234` y los recupera con `SELECT` devuelve exactamente `1234567.891234` sin pérdida de precisión (verificación de tipo `NUMERIC(18,6)`).
4. NFR: El schema debe cumplir con las reglas de nomenclatura canónica: snake_case para tablas y columnas, prefijo `fk_` para foreign keys, prefijo `idx_` para índices, prefijo `uq_` para constraints unique, prefijo `ck_` para check constraints.

**Impactos y consideraciones:**
- Es la decisión técnica más vinculante del proyecto: todo el ecosistema Sentinel (FastAPI Core, Express BFF, workers Celery, migraciones, backups, réplicas) se construye sobre esta definición de schema. Un error aquí (tipo de dato incorrecto, índice faltante, constraint mal definido) se propaga a todas las capas superiores y es extremadamente costoso de corregir en producción. La elección de `NUMERIC(18,6)` para montos fiscales vs `DOUBLE PRECISION` tiene implicaciones de rendimiento (NUMERIC es más lento en agregaciones masivas) pero garantiza precisión para cálculos regulatorios donde un centavo de diferencia puede invalidar un reporte ante la UIF.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal FastAPI y Modelo de Datos, §11.2 — Modelo de Datos Relacional y Esquema Físico
- SAD-Lite: §4 — Arquitectura de Datos y Persistencia Multi-Tenant
- Developer Handbook: §5.1 — Esquema Físico DDL y Convenciones de Modelado
- ADR: ADR-0001 — Elección de PostgreSQL 17 + pgvector como motor unificado de persistencia
- Tablas afectadas: todas (tenants, users, user_preferences, user_notifications, sessions, tax_profiles, invoices, invoice_items, invoice_metadata, alerts, alert_assignments, alert_locks, audit_logs, admin_audit_logs, vault_files, vault_cases, webhook_events, sat_69b_list, pld_checks, risk_scores, risk_rules, pld_rules, screening_results, tenant_config, role_permissions, api_keys, notification_log, belvo_connections, belvo_sync_log, ai_prompt_log, ai_contradiction_log)
- Flujo crítico SAD §10: §10.1 (Onboarding y configuración del despacho contable)

---

#### HU-04.02 — Inyector de contexto RLS en SQLAlchemy 2.0 (FastAPI Core, Python 3.12)

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — Capa de acceso a datos con RLS, SAD §11.6 (Aislamiento Multi-Tenant y RLS) — Inyección de contexto de tenant
**Historia:** Como desarrollador del Core Fiscal de Sentinel en Python 3.12 con FastAPI, quiero disponer de un mecanismo automático y transparente de inyección de contexto de seguridad a nivel de sesión de SQLAlchemy 2.0 que establezca las variables de sesión de PostgreSQL (`sentinel.current_tenant_id`, `sentinel.current_user_id`, `sentinel.current_role`) antes de cada operación de base de datos, para que todas las consultas y mutaciones queden automáticamente filtradas por las políticas RLS de PostgreSQL 17 sin que los desarrolladores de servicios tengan que añadir manualmente cláusulas `WHERE tenant_id = ?` en cada query.

**Alcance:**
Implementación de un middleware ASGI para FastAPI que extrae `tenant_id`, `user_id` y `role` del JWT validado en el BFF (pasado como header `X-Sentinel-Context` firmado) e inyecta estas variables en cada sesión de SQLAlchemy 2.0 mediante un event listener `do_orm_execute` y `SET LOCAL` para variables de runtime de PostgreSQL. Propagación de contexto RLS a tareas asíncronas vía `contextvars`. No cubre la definición de las políticas RLS en PostgreSQL (HU-04.04), ni el RLS en el BFF Express (HU-04.03), ni la propagación del contexto desde el frontend.

**Historia en formato Given/When/Then:**
- **Given** que el BFF Express ha validado un JWT de sesión para un contador del tenant `T-001` con `user_id = 'U-042'` y `role = 'ACCOUNTANT'`, y envía una petición al Core Fiscal FastAPI con el header `X-Sentinel-Context` conteniendo un token JWT interno firmado con `{ tenant_id: 'T-001', user_id: 'U-042', role: 'ACCOUNTANT' }`.
- **When** el middleware RLS de FastAPI (`SentinelContextMiddleware`) intercepta la petición entrante, verifica la firma HMAC-SHA256 del header `X-Sentinel-Context` contra un secreto compartido, extrae los claims del contexto, y almacena el contexto en `contextvars.ContextVar('sentinel_context')` para hacerlo disponible a lo largo de todo el ciclo de vida de la petición.
- **Then** antes de cada operación de base de datos en el scope de esa petición, el event listener `set_rls_context` de SQLAlchemy 2.0 debe ejecutar automáticamente `SET LOCAL sentinel.current_tenant_id = 'T-001'`, `SET LOCAL sentinel.current_user_id = 'U-042'` y `SET LOCAL sentinel.current_role = 'ACCOUNTANT'` sobre la conexión de base de datos utilizada.
- **And** si una operación de base de datos se ejecuta en una tarea asíncrona desacoplada (ej. un `BackgroundTask` de FastAPI), el contexto RLS debe propagarse automáticamente vía `contextvars.copy_context()` sin requerir que el desarrollador pase manualmente estos parámetros.
- **And** si el header `X-Sentinel-Context` está ausente, tiene firma inválida, o el token ha expirado, el middleware debe rechazar la petición con `401 Unauthorized` y registrar el evento en `audit_logs` con `event_type = 'RLS_CONTEXT_INVALID'`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo en PostgreSQL 17 Docker).
- Regla de negocio: Ninguna operación de base de datos desde el Core Fiscal puede ejecutarse sin un contexto RLS válido. El middleware debe fallar cerrado (denegar por defecto). El secreto compartido para firmar `X-Sentinel-Context` debe rotarse periódicamente (cada 90 días) y almacenarse cifrado (AES-256-GCM) en `tenant_config.internal_secrets`. El Core Fiscal debe tolerar hasta 2 secretos simultáneos durante ventanas de rotación (zero-downtime rotation). El rol `SYSTEM` (usado para workers nocturnos) tiene `tenant_id = NULL` y `user_id = NULL` con bypass de RLS para operaciones cross-tenant, autenticado mediante API key interna con IP allowlist.

**Criterios de aceptación:**
1. Una petición al Core Fiscal con `X-Sentinel-Context` válido ejecuta una query `SELECT * FROM invoices` y solo retorna las filas del tenant `T-001`, verificable mediante conteo de resultados e inspección de `current_setting('sentinel.current_tenant_id')` en los logs de PostgreSQL.
2. Una petición sin el header `X-Sentinel-Context` recibe `401 Unauthorized` y no ejecuta ninguna operación de base de datos.
3. Una petición con `X-Sentinel-Context` firmado con secreto inválido o expirado recibe `401 Unauthorized` y el evento se registra en `audit_logs` con `event_type = 'RLS_CONTEXT_INVALID'`.
4. Una tarea asíncrona (`BackgroundTask`) lanzada desde un endpoint de FastAPI ejecuta correctamente una operación de DB con el contexto RLS del request original, sin necesidad de pasar `tenant_id` explícitamente.
5. Los tests (`test_rls_injector.py`, `test_rls_isolation.py`) cubren ≥90% de los escenarios: contexto válido aplicado, contexto ausente rechazado, firma inválida, token expirado, propagación a tareas asíncronas, rotación de secretos, rol SYSTEM con bypass, y medición de latencia del middleware (≤2 ms de overhead en p95).

**Impactos y consideraciones:**
- Es el guardián del aislamiento multi-tenant: un fallo en el inyector RLS expondría datos de todos los despachos a cualquier petición autenticada, causando una violación catastrófica de confidencialidad con implicaciones legales bajo la LFPDPPP y el secreto fiscal del CFF. El overhead de latencia del middleware debe ser mínimo (≤2 ms p95) para no impactar la experiencia del HUD Liquid Glass.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal FastAPI y Capa de Acceso a Datos, §11.6 — Aislamiento Multi-Tenant y Row-Level Security
- SAD-Lite: §6 — Aislamiento Multi-Tenant y Seguridad de Datos
- Developer Handbook: §5.2 — Inyector de Contexto RLS en SQLAlchemy 2.0 para FastAPI Core
- ADR: ADR-0002 — Estrategia Apertura-Cierre de Conexiones con RLS en SQLAlchemy 2.0
- Tablas afectadas: todas (a nivel de sesión de PostgreSQL)
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---

#### HU-04.03 — Extensión Prisma Client + AsyncLocalStorage (Express BFF)

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** SAD §9.2 (BFF Express) — Capa de acceso a datos con RLS en Node.js, SAD §11.6 (Aislamiento Multi-Tenant y RLS) — Inyección de contexto con AsyncLocalStorage
**Historia:** Como desarrollador del BFF Express de Sentinel en TypeScript, quiero extender Prisma Client con un wrapper que utilice `AsyncLocalStorage` de Node.js para transportar el contexto de tenant (`tenant_id`) y usuario (`user_id`) a través de todas las operaciones asíncronas del request, y que inyecte automáticamente `SET LOCAL sentinel.current_tenant_id` y `SET LOCAL sentinel.current_user_id` en cada transacción de base de datos, para garantizar el aislamiento RLS en el BFF con el mismo nivel de seguridad que el Core Fiscal, sin que los desarrolladores de rutas Express tengan que preocuparse por pasar manualmente el tenant_id.

**Alcance:**
Implementación de un `SentinelPrismaClient` que sobrescribe los métodos `$transaction`, `$queryRaw` y `$executeRaw` para inyectar `SET LOCAL` al inicio de cada operación. Middleware de Express (`rlsContextMiddleware`) que almacena `tenant_id` y `user_id` en un `AsyncLocalStorage` al inicio del request. Prisma middleware (`$extends`) que lee el contexto del `AsyncLocalStorage` e inyecta los parámetros RLS antes de cada query. No cubre la definición de políticas RLS en PostgreSQL (HU-04.04) ni la firma del header `X-Sentinel-Context`.

**Historia en formato Given/When/Then:**
- **Given** que un contador del tenant `T-001` ha iniciado sesión exitosamente (HU-02.01) y el BFF Express ha validado su JWT de sesión, extrayendo los claims `{ sub: 'U-042', tenant_id: 'T-001', role: 'ACCOUNTANT' }`.
- **When** el contador solicita `GET /api/v1/invoices?tax_profile_id=TP-007` desde la SPA React, y la ruta Express utiliza Prisma Client para ejecutar `prisma.invoice.findMany({ where: { taxProfileId: 'TP-007' } })`.
- **Then** el middleware `rlsContextMiddleware` ya ha almacenado `{ tenant_id: 'T-001', user_id: 'U-042', role: 'ACCOUNTANT' }` en el `AsyncLocalStorage`, y el `SentinelPrismaClient` extendido, antes de ejecutar la query, inyecta automáticamente `SET LOCAL sentinel.current_tenant_id = 'T-001'` en la sesión de PostgreSQL.
- **And** si la ruta Express realiza múltiples queries secuenciales, el contexto RLS debe mantenerse consistente a lo largo de todas las operaciones del request sin necesidad de reinyectarlo manualmente, y liberarse automáticamente al finalizar el request.
- **And** si una ruta Express lanza una operación asíncrona con `Promise.all`, el `AsyncLocalStorage` debe propagar correctamente el contexto a través de la cadena de ejecución asíncrona.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo en PostgreSQL 17 Docker).
- Regla de negocio: El BFF Express nunca debe ejecutar una query de base de datos sin contexto RLS. El `SentinelPrismaClient` debe lanzar excepción `RLSContextError` si se intenta ejecutar una query fuera del contexto de un request HTTP. Las variables `SET LOCAL` no persisten entre transacciones; el SentinelPrismaClient debe ejecutar `SET LOCAL` antes de cada statement individual o al inicio de una transacción explícita con `$transaction`. El overhead de rendimiento del `AsyncLocalStorage` se mitiga cacheando el `tenant_id` por request.

**Criterios de aceptación:**
1. Una query `prisma.invoice.findMany()` ejecutada desde una ruta Express retorna solo facturas del tenant extraído del JWT de sesión.
2. Un intento de ejecutar `prisma.invoice.findMany()` fuera del contexto de un request HTTP lanza `RLSContextError` con mensaje descriptivo y no ejecuta la query.
3. Un request que involucra 5 queries secuenciales a Prisma mantiene el mismo contexto RLS en todas ellas sin intervención manual.
4. El overhead de latencia del `SentinelPrismaClient` extendido es ≤5 ms (p95) adicional en un benchmark de 10,000 queries.
5. Los tests (`test_prisma_rls.ts`) cubren ≥90% de los escenarios: query con contexto, query sin contexto rechazada, múltiples queries secuenciales, transacciones `$transaction` con RLS, propagación en `Promise.all`, limpieza de contexto al finalizar request, y concurrencia de requests con tenants diferentes sin interferencia.

**Impactos y consideraciones:**
- Complementa el RLS del Core Fiscal con el mismo nivel de seguridad en la capa BFF. En conjunto con HU-04.02 y HU-04.04, forma la triple barrera de aislamiento: middleware BFF → middleware FastAPI → políticas PostgreSQL. El `AsyncLocalStorage` es un patrón moderno de Node.js que reemplaza `cls-hooked` con mejor rendimiento y soporte nativo (requiere Node.js ≥16.4, Sentinel usa Node.js 20 LTS).

**Referencias y trazabilidad:**
- SAD: §9.2 — BFF Express y Capa de Acceso a Datos, §11.6 — Aislamiento Multi-Tenant y RLS
- SAD-Lite: §6 — Aislamiento Multi-Tenant y Seguridad de Datos
- Developer Handbook: §5.3 — Extensión Prisma Client con AsyncLocalStorage para Express BFF
- ADR: ADR-0003 — Extensión Prisma Client + AsyncLocalStorage para inyección de contexto RLS en BFF
- Tablas afectadas: todas (a nivel de sesión de PostgreSQL vía Prisma)
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

---

#### HU-04.04 — Políticas RLS y constraints de rendimiento en PostgreSQL 17

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — Consumo de políticas RLS, SAD §11.6 (Aislamiento Multi-Tenant y RLS) — Definición y optimización de políticas
**Historia:** Como DBA de Sentinel, quiero definir las políticas de Row-Level Security (RLS) en PostgreSQL 17 sobre todas las tablas operativas del sistema, configuradas para filtrar automáticamente por `tenant_id` y controlar visibilidad según `sentinel.current_role`, con índices B-Tree compuestos optimizados para que las queries filtradas por RLS tengan un rendimiento equivalente al de queries con `WHERE tenant_id = ?` explícito, garantizando que el aislamiento multi-tenant sea aplicado a nivel de motor de base de datos.

**Alcance:**
Script SQL (`rls_policies.sql`) que define políticas RLS sobre las 20+ tablas del modelo de datos canónico (18 definidas en Handbook §1 más tablas auxiliares planificadas). Habilitación de RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) en cada tabla. Políticas por operación: `SELECT` (visibilidad por tenant_id + filtro por rol), `INSERT` (force tenant_id = current_setting), `UPDATE` (solo filas del tenant y restricción por rol), `DELETE` (prohibido en tablas WORM). Creación de índices B-Tree compuestos `(tenant_id, ...)`. No cubre column-level security ni validación de firma de filas (HU-11.06).

**Historia en formato Given/When/Then:**
- **Given** que el esquema físico DDL está desplegado (HU-04.01) y los inyectores RLS (HU-04.02, HU-04.03) establecen correctamente `sentinel.current_tenant_id` y `sentinel.current_role` en cada sesión.
- **When** un contador del tenant `T-001` con rol `ACCOUNTANT` ejecuta `SELECT * FROM invoices WHERE tax_profile_id = 'TP-007'` sin incluir explícitamente `WHERE tenant_id = 'T-001'`.
- **Then** la política RLS `invoices_tenant_isolation` debe aplicarse transparentemente, y PostgreSQL debe añadir automáticamente las condiciones de filtrado al plan de ejecución, retornando exclusivamente facturas del tenant `T-001` y solo aquellas cuyo `tax_profile_id` esté autorizado para el rol `ACCOUNTANT`.
- **And** el `EXPLAIN ANALYZE` para la query debe mostrar `Bitmap Index Scan` sobre el índice compuesto `idx_invoices_tenant_tax_profile (tenant_id, tax_profile_id)` en lugar de `Seq Scan`, demostrando que el planificador optimiza correctamente las queries con RLS.
- **And** para tablas WORM (`audit_logs`, `admin_audit_logs`, `vault_files`), la política de `DELETE` y `UPDATE` debe ser `USING (false)` (siempre rechazada), registrando cualquier intento como `WORM_VIOLATION_ATTEMPT`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo en PostgreSQL 17 Docker).
- Regla de negocio: Las políticas RLS son la última línea de defensa del aislamiento multi-tenant. Si un bug omite inyectar el contexto, las políticas deben fallar cerrado porque `current_setting` devolverá `NULL` y `tenant_id = NULL` siempre evalúa a `false`. Los índices compuestos `(tenant_id, ...)` son obligatorios para evitar degradación: sin ellos, PostgreSQL realizaría `Seq Scan` con impacto 10x-100x en latencia. La función `sentinel.can_view_invoice(role, tax_profile_id)` implementa autorización SQL: `OWNER`/`ADMIN` ven todo; `ACCOUNTANT` ve lo asignado; `VIEWER` solo `coverage_level = 'PUBLIC'`.

**Criterios de aceptación:**
1. Una query `SELECT * FROM invoices` ejecutada con `SET sentinel.current_tenant_id = 'T-001'` retorna exclusivamente facturas del tenant `T-001` sin cláusula `WHERE tenant_id` explícita.
2. El tiempo de ejecución (p95) de la query sobre 1 millón de facturas (100k por tenant, 10 tenants) con y sin RLS habilitado difiere en ≤5%.
3. Un INSERT con `tenant_id` explícito diferente al `current_setting` es rechazado con `ERROR: new row violates row-level security policy`.
4. Un DELETE sobre `audit_logs` es rechazado con `ERROR` (política `USING (false)`), incluso con `SET sentinel.current_role = 'OWNER'`.
5. Los tests (`test_rls_policies.sql`, batería de 30+ escenarios) cubren ≥95%: SELECT cross-tenant, INSERT con tenant_id forzado y manipulado, UPDATE cross-tenant, DELETE bloqueado en WORM, role bypass, SECURITY DEFINER bypass, performance, y verificación de fallo cerrado con `current_setting` NULL.

**Impactos y consideraciones:**
- Es la implementación física del principio de seguridad más importante del sistema: el aislamiento multi-tenant. Sin RLS a nivel PostgreSQL, Sentinel sería vulnerable a fugas de datos entre despachos. RLS introduce overhead en el planificador; con índices compuestos este overhead es mínimo (≤5%). Las políticas deben revisarse cada vez que se agrega una nueva tabla al schema.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal FastAPI y Consumo de RLS, §11.6 — Aislamiento Multi-Tenant y Políticas RLS
- SAD-Lite: §6 — Aislamiento Multi-Tenant y Seguridad de Datos
- Developer Handbook: §5.4 — Políticas RLS y Constraints de Rendimiento en PostgreSQL 17
- ADR: ADR-0004 — Índices B-Tree y Políticas RLS para Aislamiento Multi-Tenant
- Tablas afectadas: todas las operativas (invoices, alerts, tax_profiles, vault_files, audit_logs, admin_audit_logs, webhook_events, sat_69b_list, pld_checks, risk_scores, screening_results, belvo_connections, belvo_sync_log, user_notifications, notification_log, ai_prompt_log, ai_contradiction_log, vault_cases, alert_assignments, alert_locks, invoice_items, invoice_metadata, api_keys, role_permissions)
- Flujo crítico SAD §10: §10.1 (Onboarding y autenticación del despacho contable)

#### HU-04.05 — Sistema de Migraciones Flyway/Alembic con Rollback Automático y Validación Pre-flight

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** Base de Datos, Core Backend
**Historia:** Como DBA / Líder Técnico de Infraestructura, quiero un sistema de migraciones versionadas con Flyway para DDL estructural y Alembic para datos semilla, con rollback automático ante fallos y validación pre-flight de integridad, para garantizar que los despliegues de esquema sean reproducibles, trazables y reversibles en todos los entornos sin intervención manual.

**Alcance:** Backend (Core FastAPI + Base de Datos PostgreSQL 17). Cubre la orquestación de migraciones DDL/DML, validación pre-vuelo de constraints, rollback transaccional y generación de historial de cambios de esquema.

**Historia en formato Given/When/Then:**
- **Given** existe una nueva versión del esquema físico Sentinel con cambios en tablas, índices o políticas RLS, y el pipeline CI/CD inicia el despliegue.
- **When** se ejecuta el comando de migración (`flyway migrate` para DDL o `alembic upgrade head` para datos).
- **Then** el sistema valida en modo pre-flight que todas las constraints, llaves foráneas y políticas RLS son consistentes antes de aplicar cualquier cambio.
- **And** si una migración falla a mitad de ejecución, el sistema ejecuta rollback automático de todas las migraciones del lote, restaurando el esquema al estado anterior.
- **And** se registra un historial inmutable de migraciones en `schema_migrations` con versión, timestamp, checksum y estado (APPLIED, FAILED, ROLLED_BACK).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo en Docker con PostgreSQL 17 y pgvector).
- Flyway gestiona migraciones DDL estructurales (CREATE/ALTER TABLE, índices, políticas RLS, extensiones). Alembic gestiona migraciones de datos semilla, defaults y transformaciones DML.
- Toda migración debe incluir un script `V{version}__{descripcion}.sql` con checksum SHA-256 verificable.
- El rollback debe ser transaccional: si cualquiera de las N migraciones del lote falla, se ejecuta ROLLBACK de todas las aplicadas en el mismo lote.
- La validación pre-flight debe verificar: integridad referencial, existencia de extensiones requeridas (`uuid-ossp`, `pgvector`), compatibilidad de tipos de dato y no-regresión de índices existentes.
- Las migraciones se ejecutan dentro de una transacción PostgreSQL con `SET LOCAL app.current_tenant_id` para compatibilidad RLS.

**Criterios de aceptación:**
1. El pipeline ejecuta `flyway validate` antes de cada despliegue y rechaza el deploy si el checksum de alguna migración aplicada no coincide con el historial.
2. Una migración con error sintáctico (e.g., columna duplicada) dispara rollback automático y deja la base de datos en el estado exacto previo al despliegue, verificable mediante `flyway info`.
3. El historial de migraciones en `schema_migrations` registra cada intento con timestamp UTC, version, checksum y estado final, y es consultable vía endpoint administrativo protegido por RBAC.
4. Pruebas automatizadas (`test_migrations_flyway.py`, `test_migration_rollback.py`) cubren al menos 3 escenarios: migración exitosa, fallo intermedio con rollback, y conflicto de checksum detectado por validate.
5. La latencia de validación pre-flight no supera los 30 segundos para un lote de hasta 10 migraciones simultáneas.

**Impactos y consideraciones para negocio:**
- Elimina el riesgo de despliegues de esquema inconsistentes entre entornos (dev, staging, producción), causa raíz de incidentes de corrupción de datos multi-tenant.
- El rollback automático reduce el MTTR (Mean Time to Recovery) en fallos de migración de horas a segundos.
- La validación pre-flight cumple con requisitos de auditabilidad SOC 2 y permite demostrar trazabilidad de cambios de esquema ante auditorías externas.

**Referencias y trazabilidad:**
- SAD: §11.2 — Entidades canónicas y SQL DDL del esquema 3.1.0, §11.6 — RLS y aislamiento real
- SAD-Lite: §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §1.4 — Sistema de migraciones Flyway/Alembic
- ADR: ADR-0004 — Gobernanza de índices de base de datos e inmutabilidad bajo políticas RLS, ADR-0001 — Elección de PostgreSQL 17 + pgvector local como motor unificado, ADR-0001
- Tablas afectadas: `schema_migrations` (nueva), todas las tablas operativas (DDL versionado)
- Flujo crítico SAD §10: §10.12 — Modos degradados y recuperación ante fallos

---

#### HU-04.06 — Backups Automatizados con Point-in-Time Recovery (PITR) y Retención Configurable

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** Base de Datos, Core Backend
**Historia:** Como DBA / Oficial de Cumplimiento, quiero un sistema de backups automatizados con point-in-time recovery (PITR) y políticas de retención configurables por tenant, para garantizar la continuidad de negocio, cumplir con los requisitos legales de conservación de datos fiscales (mínimo 5 años según CFF) y poder restaurar la base de datos a cualquier punto en el tiempo dentro de la ventana de retención.

**Alcance:** Backend (Core FastAPI + PostgreSQL 17). Cubre backups completos diarios con WAL archiving continuo, restauración PITR a timestamp arbitrario, validación periódica de integridad de backups, y políticas de retención configurables con borrado seguro de backups expirados.

**Historia en formato Given/When/Then:**
- **Given** el sistema Sentinel opera en producción con datos fiscales multi-tenant sujetos a retención legal mínima de 5 años (CFF Art. 30) y existe una política de retención configurada de 90 días de PITR y 7 años de backups completos.
- **When** se detecta un incidente de corrupción de datos o se requiere restaurar el estado de la base de datos a una fecha y hora específica.
- **Then** el administrador puede ejecutar `sentinel-db restore --pitr "2026-05-15 14:30:00"` y el sistema restaura automáticamente el backup completo más cercano anterior a esa fecha y aplica los WAL archives hasta el timestamp solicitado.
- **And** los backups diarios se generan automáticamente mediante un cron job con compresión y cifrado AES-256-GCM antes de almacenarse en el bucket S3 del tenant.
- **And** los backups expirados según la política de retención se eliminan de forma segura (sobrescritura criptográfica) con registro en `audit_logs`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo), HU-04.05 (Sistema de migraciones Flyway/Alembic).
- PostgreSQL 17 configurado con `wal_level = replica` y `archive_mode = on` para WAL archiving continuo.
- Backups completos diarios mediante `pg_basebackup` o herramienta equivalente con compresión zstd nivel 3.
- Cifrado de backups con AES-256-GCM antes de transmisión a S3, usando claves gestionadas por KMS del proveedor cloud.
- Validación periódica de integridad: restauración de prueba automatizada semanal en entorno aislado (sandbox) con verificación de checksums.
- Política de retención mínima: 5 años para datos fiscales (CFF Art. 30), 7 años recomendados. PITR configurable por tenant entre 7 y 90 días.
- El borrado de backups expirados debe ser irreversible (sobrescritura con datos aleatorios + eliminación lógica con registro de auditoría).

**Criterios de aceptación:**
1. Los backups completos diarios se ejecutan automáticamente a las 02:00 UTC sin afectar el rendimiento de consultas en producción (ventana de baja carga).
2. Una restauración PITR a un timestamp arbitrario dentro de la ventana de retención se completa exitosamente y pasa la verificación de integridad `pg_verifybackup` en un entorno sandbox.
3. La política de retención se configura por tenant desde el panel de administración y los backups que exceden el periodo se eliminan automáticamente con registro de auditoría.
4. Pruebas automatizadas (`test_backup_pitr.py`, `test_restore_validation.py`) validan el ciclo completo: backup → corrupción simulada → restauración PITR → verificación de integridad → consistencia de datos RLS.
5. El RTO (Recovery Time Objective) para restauración PITR no supera los 30 minutos para bases de datos de hasta 500 GB.

**Impactos y consideraciones para negocio:**
- Cumplimiento directo con CFF Art. 30 (conservación de contabilidad por 5 años) y requisitos de auditabilidad SOC 2.
- Reduce el riesgo de pérdida de datos fiscales irrecuperables ante fallos de infraestructura, ataques de ransomware o errores humanos.
- La restauración de prueba semanal en sandbox demuestra proactivamente la capacidad de recuperación ante auditores externos.

**Referencias y trazabilidad:**
- SAD: §11.2 — Entidades canónicas y SQL DDL, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §1.5 — Estrategia de backups y PITR
- ADR: ADR-0001 — Elección de PostgreSQL 17 + pgvector local como motor unificado, ADR-0001
- Tablas afectadas: `backup_policies` (nueva), `audit_logs`
- Flujo crítico SAD §10: §10.12 — Modos degradados y recuperación ante fallos

---

#### HU-04.07 — Índices de Rendimiento y Optimización de Consultas Analíticas para el HUD

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** Base de Datos, Core Backend
**Historia:** Como DBA / Desarrollador Backend, quiero disponer de índices B-Tree compuestos optimizados y materialización parcial de agregados analíticos, para que las consultas del Tactical HUD (heatmaps, scores de riesgo, conteos de alertas por criticidad, series temporales) respondan en menos de 500 ms incluso con más de 1,000,000 de facturas por tenant.

**Alcance:** Backend (Base de Datos PostgreSQL 17 + Core FastAPI). Cubre diseño e implementación de índices B-Tree compuestos sobre tablas críticas, índices parciales con condiciones WHERE para queries frecuentes del HUD, estadísticas de planner actualizadas (`ANALYZE`), y materialización de agregados en tablas de resumen con refresco programado.

**Historia en formato Given/When/Then:**
- **Given** un tenant con más de 500,000 facturas y 10,000 alertas accede al Tactical HUD para visualizar heatmaps de riesgo, distribución de facturas por estatus 69-B y tendencias temporales de PLD.
- **When** el frontend solicita datos agregados al endpoint `/api/hud/heatmap?period=2026-Q1`.
- **Then** la consulta resultante utiliza índices B-Tree compuestos sobre `invoices(tax_profile_id, fiscal_year, status_69b)` y `alerts(tax_profile_id, criticality, created_at)` para completar en menos de 350 ms.
- **And** si la consulta involucra agregación sobre más de 100,000 registros, el sistema utiliza una vista materializada pre-calculada (`mv_hud_daily_summary`) con refresco incremental cada 15 minutos.
- **And** el plan de ejecución (`EXPLAIN ANALYZE`) de toda consulta del HUD demuestra el uso de Index Scan o Bitmap Index Scan, nunca Sequential Scan sobre tablas de más de 10,000 filas.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.04 (Políticas RLS y constraints de rendimiento en PostgreSQL 17).
- Índices B-Tree compuestos obligatorios: `invoices(tax_profile_id, fiscal_year, status_69b, issued_at)`, `alerts(tax_profile_id, status, criticality, created_at)`, `risk_events(tax_profile_id, event_type, calculated_at)`, `pld_checks(tax_profile_id, period_start, alert_triggered)`.
- Índices parciales para queries frecuentes: `WHERE status_69b = 'LISTED'` en invoices, `WHERE status = 'OPEN'` en alerts.
- Las vistas materializadas siguen el modelo RLS: cada vista incluye `tax_profile_id` y las políticas RLS se aplican sobre la vista materializada.
- Refresco de vistas materializadas: `REFRESH MATERIALIZED VIEW CONCURRENTLY` programado vía Celery Beat cada 15 minutos en horario hábil (6:00–22:00 CST) y cada hora en horario no hábil.
- El planner de PostgreSQL debe ejecutar `ANALYZE` automático tras cada migración o carga masiva de datos (>10,000 registros nuevos).

**Criterios de aceptación:**
1. Toda consulta del HUD contra tablas con más de 10,000 registros utiliza exclusivamente Index Scan o Bitmap Index Scan, verificado con `auto_explain` en entorno de staging con datos realistas.
2. La latencia p95 de las 10 consultas más frecuentes del HUD (heatmap, risk timeline, alert distribution, tax profile summary) es inferior a 500 ms bajo carga simulada de 50 usuarios concurrentes.
3. Las vistas materializadas se refrescan sin bloquear lecturas concurrentes (`CONCURRENTLY`) y los datos del HUD reflejan cambios con un desfase máximo de 15 minutos.
4. Pruebas de rendimiento (`test_query_performance.py`) comparan tiempos de ejecución antes y después de la creación de índices, demostrando una mejora de al menos 10x en consultas de agregación sobre invoices.
5. El sistema emite una alerta de monitoreo si alguna consulta del HUD ejecuta Sequential Scan sobre tablas con más de 10,000 registros (detectado vía `pg_stat_statements`).

**Impactos y consideraciones para negocio:**
- Un HUD que responde en tiempo real (<500 ms) es crítico para la experiencia del analista fiscal: latencias superiores a 2 segundos generan abandono de la herramienta y riesgos operacionales por alertas no atendidas.
- Índices mal diseñados pueden degradar el rendimiento de escritura (INSERT/UPDATE) en la ingesta de facturas Belvo/LENS; se debe balancear read vs write performance.
- El costo de almacenamiento de índices adicionales se estima en un 15-25% del tamaño total de la base de datos, aceptable según los SLAs de infraestructura.

**Referencias y trazabilidad:**
- SAD: §11.6 — RLS y aislamiento real, rendimiento de consultas multi-tenant, §11.2 — Entidades canónicas y SQL DDL
- SAD-Lite: §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §1.2 — Índices B-Tree de rendimiento, §1.6 — Vistas materializadas para el HUD
- ADR: ADR-0004 — Gobernanza de índices de base de datos e inmutabilidad bajo políticas RLS, ADR-0001 — Elección de PostgreSQL 17 + pgvector local como motor unificado
- Tablas afectadas: `invoices`, `alerts`, `risk_events`, `pld_checks`, `mv_hud_daily_summary` (nueva)
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas (vía HUD)

---

#### HU-04.08 — Particionamiento Horizontal de Invoices por Año Fiscal con Pruning Automático

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** Base de Datos, Core Backend
**Historia:** Como DBA / Arquitecto de Datos, quiero implementar particionamiento horizontal de la tabla `invoices` por año fiscal (`fiscal_year`) mediante particiones declarativas nativas de PostgreSQL 17 con pruning automático en consultas, para mantener el rendimiento de consultas y la manejabilidad operativa cuando un solo tenant acumula más de 5 millones de facturas, permitiendo además archivado y purga eficiente de periodos fiscales antiguos.

**Alcance:** Backend (Base de Datos PostgreSQL 17 + Core FastAPI). Cubre creación de tabla particionada `invoices` por `RANGE (fiscal_year)`, particiones anuales con naming canónico (`invoices_y2024`, `invoices_y2025`, ...), creación automática de particiones futuras al inicio de cada año fiscal, pruning de particiones en queries con filtro por `fiscal_year`, y política de archivado/purga de particiones de años fuera de la ventana de retención activa.

**Historia en formato Given/When/Then:**
- **Given** la tabla `invoices` contiene más de 8 millones de registros para un tenant que opera desde 2020, y se ejecuta una consulta del HUD filtrando por `fiscal_year = 2026`.
- **When** PostgreSQL 17 planifica la consulta.
- **Then** el optimizador aplica partition pruning automático, escaneando exclusivamente la partición `invoices_y2026` e ignorando todas las demás particiones.
- **And** el `EXPLAIN ANALYZE` de la consulta muestra que solo la partición relevante aparece en el plan de ejecución, sin escaneo secuencial de otras particiones.
- **And** al inicio de cada año fiscal (1 de enero), el sistema crea automáticamente la partición `invoices_y{YYYY}` mediante una migración programada o trigger `BEFORE INSERT` que enruta a la partición correcta.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo), HU-04.05 (Sistema de migraciones Flyway/Alembic).
- La tabla `invoices` se convierte en tabla particionada maestra con `PARTITION BY RANGE (fiscal_year)`, manteniendo todas las constraints, llaves foráneas y políticas RLS existentes.
- Cada partición hereda los índices B-Tree de la tabla maestra y puede incluir índices locales adicionales si el patrón de acceso lo justifica.
- Política de retención activa: particiones de los últimos 5 años fiscales se mantienen en el tablespace principal (SSD). Años anteriores (6+ años) se mueven a tablespace de archivado (HDD o S3 con `pg_tier`/FDW) con acceso de solo lectura.
- La migración a tabla particionada debe ser no disruptiva: se ejecuta como parte de una migración Flyway con ventana de mantenimiento planificada.
- Pruning automático: si una query no incluye filtro por `fiscal_year`, PostgreSQL escanea todas las particiones, lo cual es aceptable solo para queries administrativas (no para queries del HUD). El API Backend debe exigir `fiscal_year` como parámetro obligatorio en endpoints de consulta de invoices.

**Criterios de aceptación:**
1. La tabla `invoices` está particionada por `RANGE (fiscal_year)` con particiones anuales desde el año de inicio de operación del sistema, y las políticas RLS se aplican correctamente en todas las particiones (`\d+ invoices` en psql lo confirma).
2. Una consulta `SELECT COUNT(*) FROM invoices WHERE tax_profile_id = $1 AND fiscal_year = 2026` muestra en `EXPLAIN ANALYZE` que solo la partición `invoices_y2026` es escaneada (partition pruning confirmado).
3. Al iniciar un nuevo año fiscal, el sistema (vía cron o trigger de migración) crea automáticamente la partición del nuevo año sin intervención manual, verificable en el historial de migraciones.
4. Pruebas automatizadas (`test_partitioning.py`, `test_partition_pruning.py`) validan: (a) pruning en consultas con filtro de año, (b) comportamiento sin filtro de año, (c) inserción en partición correcta según `fiscal_year`, (d) restauración de backup PITR con esquema particionado.
5. El tiempo de respuesta para consultas con partition pruning es al menos 5x menor que el equivalente sin particionamiento para tablas con más de 1 millón de registros por partición.

**Impactos y consideraciones para negocio:**
- Sin particionamiento, consultas sobre la tabla `invoices` con millones de registros degradan linealmente el rendimiento del HUD y los reportes fiscales, incumpliendo SLAs de respuesta.
- El archivado de años fiscales antiguos reduce costos de almacenamiento en SSD y simplifica backups (particiones de solo lectura no necesitan backup diario).
- La creación automática de particiones futuras elimina el riesgo operacional de que el sistema falle al inicio de un año fiscal por falta de partición.

**Referencias y trazabilidad:**
- SAD: §11.2 — Entidades canónicas y SQL DDL del esquema 3.1.0, §11.6 — RLS y aislamiento real
- SAD-Lite: §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §1.7 — Particionamiento horizontal de invoices y pruning
- ADR: ADR-0004 — Gobernanza de índices de base de datos e inmutabilidad bajo políticas RLS, ADR-0001 — Elección de PostgreSQL 17 + pgvector local como motor unificado, ADR-0001
- Tablas afectadas: `invoices` (conversión a tabla particionada), particiones `invoices_y{YYYY}`
- Flujo crítico SAD §10: §10.4 — Deduplicación y reconciliación de facturas

---

#### HU-04.09 — Health Checks de Base de Datos con Métricas de Conexiones, Locks y Replicación

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** Base de Datos, Core Backend
**Historia:** Como SRE / DevOps, quiero un endpoint de health check profundo que exponga métricas vitales de la base de datos —conexiones activas vs pool máximo, locks pendientes, estado de replicación (lag), uso de WAL, y latencia de respuesta— para integrar con el sistema de monitoreo (Prometheus/Grafana) y detectar proactivamente condiciones de degradación antes de que afecten a los usuarios finales.

**Alcance:** Backend (Core FastAPI + Base de Datos PostgreSQL 17 + PgBouncer). Cubre endpoint `/health/db` con métricas detalladas, integración con Prometheus metrics endpoint, alertas configurables por umbral, dashboard de monitoreo en Grafana, y health check de pooling PgBouncer.

**Historia en formato Given/When/Then:**
- **Given** el sistema Sentinel opera en producción con PgBouncer en modo transaction pooling frente a PostgreSQL 17, y el sistema de monitoreo Prometheus sondea el endpoint `/metrics` cada 15 segundos.
- **When** el número de conexiones activas en el pool de PgBouncer supera el 80% del máximo configurado (`default_pool_size = 25`), o existe un lock exclusivo pendiente por más de 30 segundos, o el lag de replicación supera los 5 segundos.
- **Then** el endpoint `/health/db` reporta `status: "degraded"` con las métricas detalladas, y Prometheus dispara una alerta al canal de Slack #sentinel-ops y al PagerDuty del SRE de guardia.
- **And** el panel de Grafana "DB Health Overview" muestra en tiempo real: (a) conexiones activas/totales por pool, (b) locks grant/wait, (c) WAL generation rate, (d) replication lag en segundos, (e) latencia p50/p95/p99 de queries, (f) cache hit ratio.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo).
- Configuración de PgBouncer con `stats_users` para exponer métricas vía `SHOW POOLS`, `SHOW STATS`, `SHOW CLIENTS`.
- Consultas a vistas del sistema PostgreSQL: `pg_stat_activity` (conexiones y locks), `pg_stat_replication` (replicación y lag), `pg_stat_database` (cache hit ratio, transacciones), `pg_locks` (locks grant/wait).
- El endpoint `/health/db` debe responder en menos de 200 ms y cachear consultas al catálogo del sistema por 5 segundos para evitar sobrecarga.
- Umbrales de alerta configurables por tenant: conexiones >80% pool, locks exclusivos >30s, replication lag >5s, cache hit ratio <90%, latencia p95 >500 ms.
- El health check debe ejecutarse con un rol de base de datos de solo lectura (`sentinel_health`) con permisos limitados a vistas del sistema, sin acceso a datos de tenant.

**Criterios de aceptación:**
1. El endpoint `GET /health/db` devuelve un JSON con todas las métricas especificadas y un campo `status` agregado: `healthy`, `degraded` o `critical`, en menos de 200 ms.
2. Prometheus scrapea el endpoint `/metrics` (formato OpenMetrics) y las métricas `sentinel_db_connections_active`, `sentinel_db_locks_waiting`, `sentinel_db_replication_lag_seconds`, `sentinel_db_query_latency_p95` están disponibles en Grafana.
3. Una condición de lock exclusivo >30 segundos (simulado) dispara una alerta a Slack #sentinel-ops en menos de 60 segundos desde su detección.
4. Pruebas automatizadas (`test_db_health.py`) validan: (a) respuesta correcta con DB sana, (b) detección de condiciones degradadas, (c) permisos del rol `sentinel_health`, (d) ausencia de fuga de datos de tenant en las métricas expuestas.
5. El dashboard de Grafana "DB Health Overview" incluye todos los paneles especificados y está disponible como JSON exportable en `documentacion/grafana/db-health.json`.

**Impactos y consideraciones para negocio:**
- La detección proactiva de degradación de base de datos previene incidentes de indisponibilidad del HUD y de la ingesta de facturas, que impactan directamente la capacidad de los analistas fiscales para atender alertas dentro de SLA.
- La exposición de métricas de PgBouncer permite detectar agotamiento de pool de conexiones, causa raíz de errores 5xx en el BFF bajo alta carga de onboarding concurrente.
- Las métricas de replicación lag permiten tomar decisiones informadas sobre failover en escenarios de disaster recovery.

**Referencias y trazabilidad:**
- SAD: §11.2 — Entidades canónicas y SQL DDL, §9.10 — Core Fiscal, Alertas y Notificaciones (monitoreo operacional)
- SAD-Lite: §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §1.8 — Health checks y monitoreo de base de datos, §1.9 — Configuración de pooling PgBouncer
- ADR: ADR-0001 — Elección de PostgreSQL 17 + pgvector local como motor unificado, ADR-0001
- Tablas afectadas: Vistas del sistema PostgreSQL (solo lectura), `pg_stat_activity`, `pg_stat_replication`, `pg_stat_database`, `pg_locks`
- Flujo crítico SAD §10: §10.12 — Modos degradados y recuperación ante fallos

---

#### HU-04.10 — Estrategia de Seeding de Datos de Prueba con Anonimización de PII y Fixtures

**Épica:** EP-04 — Persistencia, RLS y Migraciones
**Módulo(s):** Base de Datos, Core Backend
**Historia:** Como Desarrollador / QA Engineer, quiero disponer de un conjunto de fixtures y seeders que generen datos de prueba realistas con PII anonimizada —incluyendo múltiples tenants, facturas, alertas y perfiles fiscales— para poder desarrollar y probar funcionalidades en entornos locales y de CI sin riesgo de exponer datos reales de clientes, cumpliendo con las políticas de protección de datos y facilitando el onboarding de nuevos desarrolladores.

**Alcance:** Backend (Core FastAPI + Base de Datos PostgreSQL 17). Cubre scripts de seeding con factories para todas las entidades principales, anonimización de datos personales (RFCs, razones sociales, correos), fixtures deterministas para tests automatizados, y reset rápido de base de datos de desarrollo. No cubre datos de producción ni réplicas anonimizadas de producción (eso es scope de HU-04.06 PITR).

**Historia en formato Given/When/Then:**
- **Given** un desarrollador clona el repositorio de Sentinel por primera vez y ejecuta `make dev-setup`.
- **When** se ejecuta el comando `sentinel-seed --scenario full` (o `--scenario minimal` para CI rápido).
- **Then** la base de datos local se puebla con: (a) 3 tenants simulados (despachos contables), (b) 10 usuarios con roles RBAC variados por tenant, (c) 500 facturas con CFDIs sintéticos pero estructuralmente válidos distribuidas entre los tenants, (d) 50 alertas con diferentes estados y criticidades, (e) 20 perfiles fiscales con coverage_levels variados.
- **And** todos los datos personales están anonimizados: RFCs usan formato válido pero con homoclave generada aleatoriamente (no corresponden a contribuyentes reales), razones sociales son "Despacho Demo N", correos son `usuario_X@sentinel-test.local`.
- **And** los fixtures son deterministas: con la misma semilla (`SEED=42`), el dataset generado es idéntico en cualquier entorno.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo en Docker con PostgreSQL 17 y pgvector).
- Uso de factories (Factory Boy para Python / Fishery para TypeScript) con generación determinista basada en semilla.
- Prohibición estricta de usar datos reales de clientes como fixtures: Gitleaks configurado para detectar RFCs reales, CURPs, correos de dominio real y cualquier PII en archivos de fixtures.
- Los fixtures deben respetar las políticas RLS: cada registro incluye `tax_profile_id` correcto, los tenants están correctamente aislados, y las pruebas de RLS (`test_rls_isolation.py`) deben pasar sobre la base de datos seeded.
- Escenarios de seeding configurables: `minimal` (100 facturas, 2 tenants, CI rápido), `full` (500 facturas, 3 tenants, desarrollo), `stress` (50,000 facturas particionadas, pruebas de rendimiento).
- El comando `sentinel-seed --reset` debe hacer TRUNCATE CASCADE de todas las tablas y re-ejecutar el seeding en menos de 30 segundos para el escenario `minimal`.

**Criterios de aceptación:**
1. `make dev-setup` completa el seeding de escenario `full` en menos de 60 segundos y la base de datos queda lista para desarrollo con todos los tenants, usuarios y facturas accesibles vía API.
2. Gitleaks configurado en pre-commit no detecta PII real en ningún archivo de fixtures/seeders; una verificación manual confirma que todos los RFCs, correos y razones sociales son sintéticos.
3. Los fixtures generan exactamente el mismo dataset con la misma semilla (`SEED=42`) en macOS, Linux y CI (GitHub Actions), verificado por checksum SHA-256 del dump resultante.
4. Las pruebas de RLS (`test_rls_isolation.py`) pasan sobre la base de datos seeded, confirmando que los datos sintéticos respetan el modelo de aislamiento multi-tenant.
5. Pruebas automatizadas (`test_seed_data.py`, `test_anon_fixtures.py`) validan: (a) integridad referencial de los datos generados, (b) no existencia de PII real, (c) determinismo con semilla fija, (d) todos los escenarios de seeding (`minimal`, `full`, `stress`) se completan sin errores.

**Impactos y consideraciones para negocio:**
- Reduce el tiempo de onboarding de nuevos desarrolladores de 2-3 días (configuración manual de datos de prueba) a 5 minutos (`make dev-setup`).
- Elimina el riesgo legal de que desarrolladores o QA usen datos reales de clientes en entornos locales no seguros.
- Facilita la reproducibilidad de bugs: cualquier desarrollador puede recrear el estado exacto de la base de datos con una semilla conocida.

**Referencias y trazabilidad:**
- SAD: §11.2 — Entidades canónicas y SQL DDL del esquema 3.1.0, §24 — Backlog de Producto y Épicas Técnicas
- SAD-Lite: §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §7 — Guías de desarrollo, testing y contribución, §1.10 — Estrategia de seeding y fixtures
- ADR: ADR-0001 — Elección de PostgreSQL 17 + pgvector local como motor unificado, ADR-0001
- Tablas afectadas: Todas (15 tablas operativas — seeding de datos sintéticos)
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes (datos de prueba para validar flujo)

---

---

### 5.5 EP-05 — Onboarding y Tax Profiles

#### HU-05.01 — Wizard de Onboarding Guiado Paso a Paso para Nuevos Despachos Contables

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Frontend SPA, Core Backend
**Historia:** Como Administrador de un despacho contable nuevo, quiero seguir un wizard de onboarding guiado paso a paso que me lleve desde el registro inicial hasta la configuración completa de mi despacho —creación de tenant, vinculación de credenciales SAT, configuración de parámetros FinOps, y alta de mi primer perfil fiscal— para estar operativo en Sentinel en menos de 15 minutos sin necesidad de soporte técnico.

**Alcance:** Frontend SPA (React 19 + Vanilla CSS Liquid Glass) + Backend (Core FastAPI + Express BFF). Cubre el wizard multi-paso con 6 etapas secuenciales, validación progresiva de datos, persistencia parcial (borrador), indicador visual de progreso, y redirección al dashboard al completar. No cubre las integraciones específicas (Belvo, validación RFC, importación legacy) que son HUs independientes dentro de EP-05.

**Historia en formato Given/When/Then:**
- **Given** un nuevo despacho contable accede a la URL de registro de Sentinel y crea una cuenta inicial con correo corporativo y contraseña robusta (según política NIST 800-63B).
- **When** completa el primer paso del wizard (datos del despacho: razón social, RFC del despacho, dirección fiscal, datos del representante legal).
- **Then** el sistema valida en tiempo real los campos obligatorios y guarda el progreso como borrador en el backend, permitiendo continuar más tarde desde el último paso completado.
- **And** el wizard avanza por 6 pasos secuenciales: (1) Datos del despacho, (2) Vinculación SAT/Belvo, (3) Configuración fiscal (calendario, régimen), (4) Parámetros FinOps y PLD, (5) Alta de primer tax_profile, (6) Resumen y confirmación.
- **And** al completar todos los pasos, el sistema crea el tenant, asigna el rol de `tenant_admin` al usuario, configura el `tax_profile` inicial y redirige al Tactical HUD.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo), HU-04.02 (Inyector RLS SQLAlchemy 2.0), HU-03.01 (Mi Perfil: gestión de datos personales).
- El wizard debe guardar estado de progreso en el backend (Redis con TTL de 7 días para borradores) para permitir continuar desde cualquier dispositivo.
- Validación progresiva: cada paso se valida de forma independiente antes de permitir avanzar al siguiente.
- Paso 1 (datos del despacho): validación de RFC del despacho contra formato SAT, verificación de dominio de correo corporativo (MX record check), geocodificación de dirección fiscal.
- El tenant no se crea en base de datos hasta que se completa el paso 6 (confirmación final), evitando tenants huérfanos.
- Toda la información del onboarding se transmite sobre HTTPS con TLS 1.3.
- El wizard debe ser responsive (mobile-first) y cumplir con WCAG 2.1 AA (navegación por teclado, roles ARIA, contraste de color).

**Criterios de aceptación:**
1. Un usuario nuevo completa el wizard de 6 pasos en menos de 15 minutos y al finalizar tiene su tenant, perfil de administrador y primer tax_profile funcional, verificable mediante login y acceso al HUD.
2. El progreso del wizard se guarda automáticamente al completar cada paso; si el usuario cierra el navegador y vuelve a ingresar en las siguientes 24 horas, retoma exactamente en el paso donde se quedó.
3. El indicador visual de progreso (stepper) muestra claramente los pasos completados, el paso actual y los pendientes, con animaciones de transición entre pasos (Liquid Glass design system).
4. El backend rechaza la creación del tenant si el RFC del despacho no cumple con el formato oficial del SAT (validación de estructura: 3-4 letras, 6 dígitos de fecha, 3 de homoclave).
5. Pruebas automatizadas (`test_onboarding_wizard.tsx`, `test_onboarding_flow.py`) cubren el flujo completo E2E: registro → wizard 6 pasos → tenant creado → acceso al HUD.

**Impactos y consideraciones para negocio:**
- Reduce el tiempo de activación de nuevos clientes (time-to-value) de 3-5 días con soporte manual a 15 minutos autoservicio, acelerando el growth del SaaS.
- Un wizard intuitivo reduce la tasa de abandono durante el onboarding (<20% abandono en paso 3+), métrica crítica para la conversión de leads a clientes activos.
- El guardado de borrador elimina la fricción de "empezar de cero" si el administrador del despacho necesita recopilar información (RFC, CIEC, documentos) entre pasos.

**Referencias y trazabilidad:**
- SAD: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes, §9.5 — Frontend SPA / Onboarding UI, §18.2 — Componentes del Tactical HUD y sistema de diseño Liquid Glass
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS), §7 — Ciclo de Vida del Cliente y Procesos Operativos
- Developer Handbook: §3.1 — Wizard de Onboarding (Frontend React 19 + Vanilla CSS), §3.2 — API de Onboarding (FastAPI Core)
- ADR: ADR-020
- Tablas afectadas: `tenants`, `users`, `user_preferences`, `tax_profiles`
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes

---

#### HU-05.02 — Integración Belvo Widget para Vinculación de Credenciales SAT en el Onboarding

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Frontend SPA, Core Backend
**Historia:** Como Administrador de un despacho contable en proceso de onboarding, quiero vincular mis credenciales del SAT (RFC + CIEC o e.firma) mediante el Belvo Hosted Widget integrado en el paso 2 del wizard, para que Sentinel pueda acceder a mis facturas fiscales históricas y recurrentes sin que mis credenciales sensibles del SAT transiten por los servidores de Sentinel.

**Alcance:** Frontend SPA (React 19) + Backend (Core FastAPI). Cubre la integración del Belvo Hosted Widget vía Belvo SDK JavaScript, la creación de `links` Belvo desde el backend, el manejo de callbacks de éxito/error del widget, la asociación del `link_id` al `tax_profile`, y el almacenamiento seguro del token de acceso Belvo (nunca las credenciales SAT directas). No cubre la ingesta de facturas (EP-06).

**Historia en formato Given/When/Then:**
- **Given** el administrador del despacho está en el paso 2 del wizard de onboarding ("Vinculación SAT") y ha proporcionado el RFC del despacho en el paso 1.
- **When** el administrador hace clic en "Conectar con el SAT" y se abre el Belvo Hosted Widget en un iframe o ventana modal.
- **Then** el widget de Belvo guía al usuario para ingresar su CIEC o e.firma directamente en los servidores de Belvo (sin pasar por Sentinel), y al completar exitosamente la vinculación, Belvo notifica a Sentinel mediante callback con el `link_id` y `institution` (SAT).
- **And** el backend de Sentinel almacena el `belvo_link_id` y `belvo_institution_token` cifrados (AES-256-GCM) asociados al `tax_profile`, listos para iniciar la ingesta de facturas.
- **And** si la vinculación falla (CIEC incorrecta, SAT no disponible), el widget muestra el error al usuario y el wizard permite reintentar sin perder el progreso de otros pasos.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.01 (Wizard de onboarding guiado paso a paso).
- Integración con Belvo Widget: uso del SDK JavaScript oficial de Belvo (`belvo-js`) con modo `widget` para hosted widget.
- El backend de Sentinel nunca recibe, almacena ni procesa las credenciales del SAT (CIEC o e.firma). Solo recibe el `link_id` y `access_token` de Belvo tras la vinculación exitosa.
- El `belvo_link_id` y `belvo_access_token` se almacenan cifrados con AES-256-GCM usando una clave de cifrado de tenant (`tenant_encryption_key`) derivada de KMS.
- Belvo callback: el backend expone un endpoint `POST /api/onboarding/belvo/callback` que recibe el `link_id` y verifica la autenticidad del callback mediante API Key de Belvo.
- Timeout de vinculación: si el usuario cierra el widget sin completar, el wizard permite continuar con el onboarding y vincular el SAT más tarde desde la sección de configuración del tax_profile.
- Rate limiting en reintentos de vinculación: máximo 5 intentos en 24 horas por tenant para prevenir abuso.

**Criterios de aceptación:**
1. El Belvo Hosted Widget se abre correctamente en el paso 2 del wizard de onboarding y permite al usuario ingresar credenciales SAT sin salir de la experiencia de onboarding de Sentinel.
2. Al completar exitosamente la vinculación, Sentinel recibe el callback con `link_id` y crea el registro `belvo_links` asociado al `tax_profile`, con el token cifrado y sin credenciales SAT en logs ni base de datos.
3. Si la vinculación falla, el widget Belvo muestra el error específico (credenciales inválidas, SAT no disponible, timeout) y el wizard permite reintentar o saltar el paso para configurarlo más tarde.
4. Pruebas automatizadas (`test_belvo_widget.tsx`, `test_belvo_link.py`) validan: (a) renderizado del widget, (b) callback exitoso, (c) manejo de error de vinculación, (d) ausencia de credenciales SAT en logs/DB, (e) reintentos dentro del límite configurado.
5. La latencia de apertura del widget Belvo no supera los 3 segundos y el callback se procesa en menos de 1 segundo.

**Impactos y consideraciones para negocio:**
- El Belvo Hosted Widget elimina la necesidad de que Sentinel implemente y mantenga su propia integración directa con el SAT (compleja, sujeta a cambios frecuentes y con requisitos de certificación de seguridad).
- Al no manejar credenciales SAT, Sentinel reduce drásticamente su superficie de ataque y su responsabilidad legal en caso de brecha de seguridad (las credenciales nunca tocan la infraestructura de Sentinel).
- La experiencia embebida (sin salir de Sentinel) mantiene la tasa de finalización del onboarding alta, evitando fricción de "abrir otra pestaña y copiar tokens".

**Referencias y trazabilidad:**
- SAD: §10.2 — Sincronización manual LENS y vinculación SAT/Belvo, §12.1 — Integración API Belvo (Fiscal API, Widget), §9.5 — Frontend SPA / Onboarding UI
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS)
- Developer Handbook: §3.3 — Integración Belvo Hosted Widget (SDK JS + FastAPI callback)
- ADR: ADR-0009 — Arquitectura de ingesta Belvo y modelo de datos, ADR-020
- Tablas afectadas: `tax_profiles`, `belvo_links` (nueva), `audit_logs`
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes, §10.3 — Ingesta histórica y recurrente Belvo Fiscal API

---

#### HU-05.03 — Validación de RFC en Onboarding: Estructura, Homoclave y Vigencia contra SAT

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Core Backend, Frontend SPA
**Historia:** Como Administrador de un despacho contable en proceso de onboarding, quiero que el sistema valide en tiempo real que los RFCs que ingreso (del despacho, del representante legal y de los contribuyentes) cumplen con la estructura oficial del SAT, tienen una homoclave válida y están registrados como activos en el padrón del SAT, para evitar errores de captura que resulten en facturas no deducibles o problemas de cumplimiento fiscal posteriores.

**Alcance:** Backend (Core FastAPI) + Frontend SPA (React 19). Cubre validación de formato RFC (estructura regex según especificación SAT), validación de homoclave (dígito verificador), consulta de vigencia contra el SAT (servicio de validación masiva o consulta individual), y feedback visual en tiempo real en los campos del wizard. No cubre la verificación de identidad del representante legal (HU-05.06).

**Historia en formato Given/When/Then:**
- **Given** el administrador del despacho está completando el paso 1 del wizard de onboarding e ingresa el RFC del despacho, del representante legal y de los contribuyentes asociados.
- **When** el campo de RFC pierde el foco (`onBlur`) o el administrador hace clic en "Validar RFC".
- **Then** el sistema ejecuta tres niveles de validación en cascada: (1) Validación sintáctica: el RFC cumple con la regex oficial del SAT (4 letras para persona moral / 4 letras para persona física + 6 dígitos de fecha + 3 de homoclave). (2) Validación de homoclave: el dígito verificador de la homoclave es correcto según el algoritmo del SAT. (3) Validación de vigencia: consulta al servicio del SAT que confirma que el RFC existe y está activo (no suspendido, no cancelado).
- **And** el resultado se muestra visualmente: check verde para RFC válido y activo, warning amarillo para RFC con estructura correcta pero no verificado contra SAT (servicio SAT no disponible), y error rojo para RFC con estructura inválida o RFC suspendido/cancelado.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.01 (Wizard de onboarding guiado paso a paso).
- Formato RFC persona moral: 3 letras + 6 dígitos fecha + 3 homoclave (12 caracteres). Persona física: 4 letras + 6 dígitos fecha + 3 homoclave (13 caracteres).
- Algoritmo de homoclave: validación del dígito verificador basado en la tabla de asignación del SAT (Anexo 1 de la RMF vigente).
- Consulta de vigencia SAT: integración con el servicio de validación masiva de RFCs del SAT o, como fallback, consulta individual vía el endpoint público del SAT con rate limiting (máximo 100 consultas por hora).
- Modo offline: si el servicio del SAT no está disponible (degradación), se aplica validación sintáctica + homoclave y se muestra warning amarillo con el mensaje: "RFC validado estructuralmente. Verificación de vigencia SAT pendiente — se reintentará automáticamente."
- Los RFCs validados exitosamente se cachean en Redis por 24 horas para evitar consultas repetidas al SAT para el mismo RFC.
- No se permite avanzar al paso 3 del wizard si el RFC del despacho tiene validación fallida (error rojo). RFCs de contribuyentes con warning amarillo pueden proceder con advertencia explícita.

**Criterios de aceptación:**
1. Un RFC de persona moral con estructura y homoclave correctas (e.g., `ABC860101XXX`) pasa la validación sintáctica y de homoclave, y la consulta de vigencia SAT confirma el estatus activo, mostrando check verde en menos de 3 segundos.
2. Un RFC con caracteres inválidos o longitud incorrecta (e.g., `ABC123`) es rechazado inmediatamente con error rojo y mensaje descriptivo, sin consultar al SAT.
3. Si el servicio del SAT no responde en 5 segundos, el sistema aplica fallback a warning amarillo, registra el evento en logs, y programa reintento automático en 1 hora.
4. Pruebas automatizadas (`test_rfc_validator.py`, `test_rfc_onboarding.tsx`) validan: (a) casos positivos de RFCs válidos, (b) casos negativos de RFCs inválidos por estructura, (c) casos negativos por homoclave incorrecta, (d) manejo de timeout del SAT, (e) cacheo de resultados en Redis.
5. El wizard no permite avanzar al paso 3 si el RFC del despacho está en estado de error rojo, y muestra un resumen de validación de todos los RFCs ingresados en el paso de confirmación (paso 6).

**Impactos y consideraciones para negocio:**
- RFCs mal capturados durante el onboarding generan facturas no deducibles, rechazos del SAT y retrabajo correctivo costoso para los analistas fiscales (cada factura mal asociada puede costar entre $500-$5,000 MXN en multas).
- La validación en tiempo real durante el onboarding elimina la fricción de "descubrir el error días después cuando falla la ingesta de facturas", mejorando la experiencia del cliente y reduciendo tickets de soporte.
- La dependencia del servicio SAT introduce un punto de fallo externo; el modo offline con warning amarillo y reintento automático garantiza que el onboarding no se bloquee indefinidamente.

**Referencias y trazabilidad:**
- SAD: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes, §9.5 — Frontend SPA / Onboarding UI
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §7 — Ciclo de Vida del Cliente y Procesos Operativos
- Developer Handbook: §3.4 — Validador de RFC (estructura, homoclave y vigencia SAT)
- ADR: ADR-020
- Tablas afectadas: `tenants` (validación de RFC del despacho), `tax_profiles` (validación de RFC del contribuyente), `rfc_validation_cache` (Redis)
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes

---

#### HU-05.04 — Creación y Configuración de Tax Profile con Niveles de Cobertura y Criticidad

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Core Backend, Frontend SPA
**Historia:** Como Administrador de un despacho contable en proceso de onboarding, quiero crear y configurar tax_profiles para cada uno de mis clientes contribuyentes —asignando niveles de cobertura (Básico, Profesional, Enterprise), criticidad (LOW, MEDIUM, HIGH, CRITICAL) y parámetros de monitoreo— para que Sentinel adapte automáticamente la intensidad de escaneo PLD, frecuencia de ingesta Belvo, umbrales de alerta y SLAs de respuesta según el perfil de riesgo y el plan contratado de cada contribuyente.

**Alcance:** Backend (Core FastAPI) + Frontend SPA (React 19). Cubre CRUD de tax_profiles desde el wizard de onboarding y el panel de administración, configuración de coverage_level y criticality, asignación de parámetros FinOps por defecto según coverage_level, y vinculación con el Belvo link creado en HU-05.02. No cubre la importación masiva de tax_profiles desde sistemas legacy (HU-05.05) ni la configuración avanzada de parámetros FinOps (HU-05.07).

**Historia en formato Given/When/Then:**
- **Given** el administrador del despacho ha completado los pasos 1-3 del wizard (datos del despacho, vinculación SAT, validación RFC) y se encuentra en el paso 5 "Alta de perfiles fiscales".
- **When** el administrador crea un nuevo tax_profile ingresando RFC del contribuyente, razón social, régimen fiscal, y selecciona un coverage_level (Básico, Profesional, Enterprise) y una criticidad (LOW, MEDIUM, HIGH, CRITICAL).
- **Then** el sistema crea el registro `tax_profiles` con un UUID único, lo asocia al `tenant_id` del despacho, vincula el `belvo_link_id` del paso 2, y configura automáticamente: (a) frecuencia de ingesta Belvo según coverage_level (Básico=mensual, Profesional=semanal, Enterprise=diario), (b) umbrales PLD según criticidad, (c) SLAs de respuesta para alertas, (d) parámetros FinOps por defecto.
- **And** el tax_profile aparece en el resumen del paso 6 del wizard con todos sus parámetros configurables antes de la confirmación final.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.01 (Wizard de onboarding), HU-05.03 (Validación de RFC en onboarding).
- Niveles de coverage_level canónicos: `BASIC` (monitoreo básico PLD, 1 sincronización/mes, 5 alertas/mes incluidas), `PROFESSIONAL` (monitoreo avanzado PLD + 69-B, sincronización semanal, 50 alertas/mes), `ENTERPRISE` (monitoreo completo + OFAC/ONU/PEPs, sincronización diaria, alertas ilimitadas, SLAs 4h).
- Niveles de criticality: `LOW` (contribuyente de bajo riesgo, umbrales PLD altos), `MEDIUM` (riesgo estándar, umbrales PLD por defecto), `HIGH` (riesgo elevado, umbrales PLD reducidos, escaneo OFAC/PEPs obligatorio), `CRITICAL` (máximo escrutinio, SLAs 1h, notificación prioritaria al oficial de cumplimiento).
- Un tax_profile solo puede tener un coverage_level activo y está sujeto al plan contratado por el tenant (despacho).
- La criticidad asignada determina qué módulos de riesgo se activan: LOW solo activa PLD básico; MEDIUM activa PLD + 69-B; HIGH activa PLD + 69-B + OFAC/ONU; CRITICAL activa todo lo anterior + screening PEPs avanzado.
- El tax_profile debe crearse con estado `ACTIVE`, `PENDING_REVIEW` (si la validación SAT está en warning) o `INACTIVE` (si el administrador decide activarlo más tarde).
- Todo cambio de coverage_level o criticality debe registrarse en `audit_logs` con el motivo del cambio y el usuario que lo realizó.

**Criterios de aceptación:**
1. El administrador puede crear un tax_profile desde el wizard de onboarding (paso 5) con todos los campos requeridos, y el sistema lo persiste correctamente con el `tenant_id` inyectado vía RLS y los parámetros por defecto según coverage_level.
2. Al seleccionar coverage_level `ENTERPRISE`, el sistema configura automáticamente sincronización diaria y thresholds PLD enterprise; al cambiar a `BASIC`, los thresholds se ajustan correspondientemente y las funcionalidades no incluidas se desactivan.
3. Un tax_profile creado con RFC validado (check verde) se crea con estado `ACTIVE`; un tax_profile con RFC en warning amarillo se crea con estado `PENDING_REVIEW` y el administrador recibe una notificación para completar la validación.
4. Pruebas automatizadas (`test_tax_profile_crud.py`, `test_tax_profile_setup.tsx`) validan: (a) CRUD completo con RLS (aislamiento entre tenants), (b) configuración automática de parámetros según coverage_level, (c) transiciones de estado válidas, (d) registro en audit_logs de cambios de criticidad.
5. La creación de un tax_profile desde el wizard toma menos de 2 segundos (incluyendo validación de RFC cacheada) y el tax_profile es inmediatamente consultable vía API.

**Impactos y consideraciones para negocio:**
- La configuración automática de parámetros según coverage_level y criticality elimina la necesidad de que el administrador del despacho configure manualmente docenas de thresholds, reduciendo errores de configuración y tiempo de onboarding.
- La granularidad de coverage_level permite a Sentinel ofrecer un modelo de precios escalonado (Básico/Profesional/Enterprise) que se refleja directamente en las capacidades técnicas del sistema.
- Un tax_profile mal configurado (criticidad incorrecta) puede resultar en falsos negativos (alertas no disparadas para contribuyentes de alto riesgo) o falsos positivos (exceso de alertas para contribuyentes de bajo riesgo, generando fatiga del analista).

**Referencias y trazabilidad:**
- SAD: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes, §17.5 — Configuración de criticidad, coverage_level y SLAs por tax_profile, §9.5 — Frontend SPA / Onboarding UI
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS), §7 — Ciclo de Vida del Cliente y Procesos Operativos
- Developer Handbook: §3.5 — CRUD de tax_profiles y configuración de coverage_levels
- ADR: ADR-0009 — Arquitectura de ingesta Belvo y modelo de datos
- Tablas afectadas: `tax_profiles`, `belvo_links`, `audit_logs`
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes

---

#### HU-05.05 — Migración de Datos Fiscales Históricos desde Sistemas Legacy (CSV/Excel/ZIP)

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Core Backend, Frontend SPA
**Historia:** Como Administrador de un despacho contable que migra a Sentinel desde un sistema legacy (contabilidad anterior, ERP, Excel), quiero importar mis datos fiscales históricos —catálogo de contribuyentes, facturas en XML/PDF dentro de ZIP, y parámetros de configuración en CSV/Excel— a través de una herramienta de migración guiada integrada en el wizard de onboarding, para no perder el historial fiscal de mis clientes y comenzar a operar en Sentinel con todos mis datos previos disponibles.

**Alcance:** Backend (Core FastAPI + Workers Celery) + Frontend SPA (React 19). Cubre importación de archivos CSV/Excel con catálogo de tax_profiles, importación de archivos ZIP con facturas XML/PDF, parser de formatos legacy comunes (CONTPAQi, SAP, Aspel, Excel genérico), validación de integridad de datos migrados, y reporte de resultados de migración. No cubre la ingesta de facturas vía Belvo (EP-06) ni la migración de configuraciones PLD avanzadas (HU-05.07).

**Historia en formato Given/When/Then:**
- **Given** el administrador del despacho ha completado la creación de su primer tax_profile manualmente y desea importar el resto de sus 200 clientes contribuyentes desde un archivo Excel que contiene RFC, razón social, régimen fiscal y notas.
- **When** el administrador accede a la sección "Importar datos" (accesible desde el paso 5 del wizard o desde el panel de administración post-onboarding), selecciona el archivo Excel/CSV/ZIP, y confirma la importación.
- **Then** el backend parsea el archivo, valida cada registro contra las reglas de negocio de Sentinel (formato RFC, estructura de factura XML, integridad referencial), y presenta un preview de los datos a importar con indicadores de registros válidos, registros con advertencias y registros rechazados.
- **And** tras la confirmación del administrador, el sistema importa los datos en segundo plano (workers Celery) con una barra de progreso en tiempo real vía SSE, y al finalizar presenta un reporte detallado: total importados, total con advertencias, total rechazados, y enlace para descargar el log de errores.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.04 (Creación y configuración de tax_profile).
- Formatos de importación soportados: CSV (UTF-8, delimitado por comas o punto y coma), Excel (.xlsx/.xls), ZIP con archivos XML/PDF de facturas.
- Parsers específicos para formatos legacy comunes: CONTPAQi (CSV con columnas predefinidas), SAP Business One (exportación estándar), Aspel COI/NOI (formato propietario interpretado), y formato genérico (mapeo manual de columnas por el usuario).
- Validación de datos importados: cada RFC se valida con el mismo motor de HU-05.03; cada factura XML se valida estructuralmente (XSD CFDI 4.0) y se verifica que el UUID no esté duplicado en la base de datos de Sentinel; cada tax_profile se valida contra duplicados por RFC dentro del mismo tenant.
- Límites de importación: máximo 10,000 registros por lote en el wizard de onboarding (archivos >10,000 registros requieren contacto con soporte para migración asistida). Tamaño máximo de archivo: 500 MB para ZIP, 50 MB para CSV/Excel.
- La importación se ejecuta en workers Celery con cola dedicada `migration` para no competir con la ingesta Belvo en producción.
- Los registros rechazados se devuelven en un archivo CSV descargable con la columna de motivo de rechazo, permitiendo al administrador corregir y reintentar.
- Los datos importados heredan el `tax_profile_id` y `tenant_id` correctos según el contexto RLS del administrador que ejecuta la importación.

**Criterios de aceptación:**
1. Un archivo Excel con 200 tax_profiles correctamente formateados se importa en menos de 3 minutos; el reporte final muestra 200 importados, 0 con advertencias y 0 rechazados, y los tax_profiles son consultables vía API inmediatamente.
2. Un archivo Excel con 10 RFCs inválidos y 5 RFCs duplicados muestra en el preview: 185 válidos, 10 rechazados (RFC inválido) y 5 rechazados (RFC duplicado), y al confirmar solo se importan los 185 válidos.
3. Un archivo ZIP con 500 facturas XML (mezcla de válidas, corruptas y duplicadas) se procesa y el reporte clasifica correctamente cada categoría; las facturas válidas aparecen en el HUD del contribuyente correspondiente.
4. Pruebas automatizadas (`test_legacy_migration.py`, `test_legacy_parser.py`) validan: (a) parseo correcto de formatos CSV, Excel y ZIP, (b) validación de RFCs durante importación, (c) detección de duplicados por UUID de factura, (d) asignación correcta de RLS a datos importados, (e) reintento de lotes fallidos.
5. La barra de progreso SSE refleja el avance real de la importación con granularidad de 5% y se actualiza cada 2 segundos sin bloquear la UI del wizard.

**Impactos y consideraciones para negocio:**
- La falta de una herramienta de migración es la principal barrera de adopción para despachos contables establecidos con años de datos en sistemas legacy. Esta HU elimina esa barrera.
- La importación autoservicio reduce el costo de adquisición de clientes (CAC) al eliminar la necesidad de un equipo de implementación dedicado para migrar datos de cada nuevo despacho.
- El preview pre-importación da confianza al administrador del despacho de que sus datos se migrarán correctamente, reduciendo la ansiedad del cambio de sistema.

**Referencias y trazabilidad:**
- SAD: §10.2 — Sincronización manual LENS y migración de datos legacy, §9.5 — Frontend SPA / Onboarding UI
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §7 — Ciclo de Vida del Cliente y Procesos Operativos
- Developer Handbook: §3.6 — Importación de datos legacy (CSV/Excel/ZIP)
- ADR: ADR-020 — Estrategia de deduplicación y reconciliación de facturas, ADR-020
- Tablas afectadas: `tax_profiles`, `invoices`, `migration_jobs` (nueva), `migration_errors` (nueva)
- Flujo crítico SAD §10: §10.2 — Sincronización manual LENS y migración de datos legacy

---

#### HU-05.06 — Verificación de Identidad del Representante Legal con e.firma/CIEC ante SAT

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Core Backend, Frontend SPA
**Historia:** Como Oficial de Cumplimiento / Administrador del despacho, quiero que Sentinel verifique la identidad del representante legal del despacho —validando su e.firma o CIEC contra el SAT y contrastando sus datos con el acta constitutiva y el poder notarial— durante el proceso de onboarding, para garantizar que solo personas legalmente autorizadas activen y configuren el tenant del despacho, cumpliendo con los requisitos de debida diligencia KYC/AML y prevención de suplantación de identidad.

**Alcance:** Backend (Core FastAPI) + Frontend SPA (React 19). Cubre la validación criptográfica de e.firma (certificado digital .cer, llave privada .key), verificación de CIEC contra el SAT, comparación de datos del representante legal contra el RFC del despacho, y bloqueo del onboarding si la verificación de identidad falla. No cubre la verificación de identidad de los contribuyentes (clientes del despacho).

**Historia en formato Given/When/Then:**
- **Given** el administrador del despacho ha ingresado los datos del representante legal en el paso 1 del wizard (nombre completo, CURP, RFC, correo) y debe verificar su identidad en el paso 2 como requisito para vincular las credenciales SAT del despacho.
- **When** el representante legal sube su archivo de e.firma (.cer) y firma un desafío criptográfico (nonce de 256 bits generado por Sentinel) con su llave privada, o alternativamente ingresa su CIEC y el sistema la verifica contra el SAT.
- **Then** Sentinel valida: (a) que el certificado .cer es válido, está vigente y fue emitido por el SAT, (b) que la firma del desafío corresponde a la llave privada del certificado, (c) que el RFC en el certificado coincide con el RFC del representante legal ingresado en el paso 1, (d) que el RFC del representante legal está asociado al RFC del despacho como representante legal según el padrón del SAT.
- **And** si todas las verificaciones son exitosas, el sistema marca la identidad como `VERIFIED` y habilita la vinculación SAT (HU-05.02). Si alguna verificación falla, el onboarding se bloquea con instrucciones claras de corrección.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.02 (Integración Belvo Widget), HU-05.03 (Validación de RFC en onboarding).
- Flujo primario con e.firma (recomendado): el representante legal sube su archivo .cer; Sentinel genera un nonce aleatorio de 256 bits; el representante firma el nonce con su llave privada usando la herramienta de firma proporcionada por Sentinel (JavaScript en navegador, sin enviar la llave privada al servidor); Sentinel verifica la firma contra el certificado usando criptografía asimétrica (RSA-SHA256 o ECDSA según el certificado).
- Flujo alternativo con CIEC: el representante ingresa su CIEC; Sentinel la envía al SAT vía el servicio de verificación de identidad; el SAT devuelve confirmación o rechazo; la CIEC no se almacena en Sentinel bajo ninguna circunstancia.
- La llave privada (.key) nunca debe salir del navegador del representante legal. La firma del nonce se realiza en el cliente (Web Crypto API) y solo la firma resultante se envía al backend.
- El certificado .cer se verifica contra la cadena de confianza del SAT (CA raíz del SAT) para asegurar autenticidad.
- Si la verificación falla 3 veces consecutivas, el onboarding del tenant se bloquea por 24 horas y se notifica al equipo de compliance de Sentinel para revisión manual (posible intento de suplantación).
- Los datos del representante legal verificados se almacenan en `legal_representatives` con estado `VERIFIED`, `PENDING` o `REJECTED`.

**Criterios de aceptación:**
1. Un representante legal con e.firma vigente y válida completa la verificación de identidad en menos de 60 segundos; el certificado se valida contra la CA del SAT, la firma del nonce se verifica correctamente, y el estado del representante legal pasa a `VERIFIED`.
2. Un certificado expirado o emitido por una CA no reconocida es rechazado con mensaje de error específico y el onboarding se bloquea hasta que se proporcione un certificado válido.
3. La CIEC se envía al SAT para verificación, y si el SAT confirma la identidad, el estado se marca como `VERIFIED`; si el SAT rechaza o no responde, se muestra mensaje de error y se ofrece reintento.
4. La llave privada nunca se transmite al servidor (verificable por ausencia del archivo .key en los logs de red y en el payload de la request), y la firma se realiza exclusivamente en el navegador con Web Crypto API.
5. Pruebas automatizadas (`test_identity_verification.py`) validan: (a) verificación exitosa con certificado SAT válido, (b) rechazo de certificado expirado, (c) rechazo de firma inválida, (d) bloqueo tras 3 intentos fallidos, (e) no transmisión de llave privada al servidor.

**Impactos y consideraciones para negocio:**
- La verificación de identidad del representante legal es un requisito legal en México para la prestación de servicios fiscales digitales (LFPIORPI, disposiciones del SAT sobre proveedores de certificación).
- La suplantación de identidad de un despacho contable podría permitir a un actor malicioso acceder a los datos fiscales de todos los clientes del despacho, un riesgo catastrófico que esta HU mitiga.
- El uso de Web Crypto API para firma local elimina la responsabilidad de Sentinel de custodiar llaves privadas, reduciendo la superficie de ataque y el alcance de auditorías de seguridad.

**Referencias y trazabilidad:**
- SAD: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes, §12.2 — Verificación de identidad y estatus fiscal SAT, §9.5 — Frontend SPA / Onboarding UI
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §7 — Ciclo de Vida del Cliente y Procesos Operativos
- Developer Handbook: §3.7 — Verificación de identidad del representante legal (e.firma/CIEC)
- ADR: ADR-0009 — Arquitectura de ingesta Belvo y modelo de datos, ADR-020
- Tablas afectadas: `tenants`, `legal_representatives` (nueva), `audit_logs`
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes

---

#### HU-05.07 — Configuración Asistida de Parámetros FinOps y Umbrales PLD por Tipo de Contribuyente

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Core Backend, Frontend SPA
**Historia:** Como Administrador de un despacho contable, quiero que Sentinel me asista en la configuración de parámetros FinOps —calendario fiscal, periodicidad de obligaciones, umbrales de montos para alertas PLD, sensibilidad de detección de outliers— mediante plantillas predefinidas por tipo de contribuyente (persona física con actividad empresarial, persona moral régimen general, RESICO, etc.) y un asistente contextual que explique cada parámetro en lenguaje no técnico, para asegurar que la configuración de riesgo de cada tax_profile sea la adecuada sin necesidad de ser experto en PLD o FinOps.

**Alcance:** Backend (Core FastAPI) + Frontend SPA (React 19). Cubre plantillas FinOps por régimen fiscal, asistente contextual con tooltips y sugerencias, establecimiento de umbrales PLD por UMA, configuración de periodicidad de revisión fiscal, y validación de coherencia entre parámetros. No cubre la parametrización avanzada de motores de riesgo (EP-08) ni la ejecución de escaneos PLD (EP-09).

**Historia en formato Given/When/Then:**
- **Given** el administrador del despacho ha creado un tax_profile para un contribuyente persona moral régimen general y debe configurar sus parámetros FinOps y PLD en el paso 5 o desde el panel de administración.
- **When** el administrador selecciona la plantilla "Persona Moral — Régimen General" y el sistema precarga los parámetros recomendados: umbral PLD de 15,000 UMA (operaciones relevantes), periodicidad de ingesta Belvo diaria, sensibilidad de outliers IQR estándar, y calendario fiscal mensual con obligaciones del 17 de cada mes.
- **Then** el sistema muestra un tooltip contextual para cada parámetro, explicando en lenguaje claro: qué significa, cómo afecta a las alertas, y cuál es el valor recomendado para este tipo de contribuyente según la regulación vigente (LFPIORPI, CFF, RMF).
- **And** el administrador puede ajustar manualmente cualquier parámetro, y el sistema valida en tiempo real que los valores estén dentro de rangos permitidos y sean coherentes entre sí (ej., si el umbral PLD es muy bajo para un contribuyente de bajo riesgo, se muestra una advertencia de posibles falsos positivos excesivos).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.04 (Creación y configuración de tax_profile).
- Plantillas FinOps predefinidas por régimen fiscal: Persona Física con Actividad Empresarial, Persona Física Servicios Profesionales, Persona Moral Régimen General, RESICO (PF y PM), Sociedades, Asociaciones Civiles, Gobierno y Organismos Públicos.
- Umbrales PLD expresados en UMAs (Unidad de Medida y Actualización) con conversión automática a pesos mexicanos usando el valor UMA vigente (actualizable anualmente vía migración de datos).
- Parámetros configurables por tax_profile: `pld_threshold_umas` (UMA), `outlier_sensitivity` (escala 1-10), `ingestion_frequency` (diario/semanal/mensual), `fiscal_calendar_type` (mensual/bimestral/trimestral/semestral/anual), `calendar_obligation_day` (día del mes), `min_transaction_amount_mxn`, `max_transaction_amount_mxn`.
- Validaciones de coherencia: el `pld_threshold_umas` no puede ser menor a 1,000 UMA para personas físicas ni menor a 5,000 UMA para personas morales (según criticidad); el `min_transaction_amount_mxn` no puede ser mayor que el `max_transaction_amount_mxn`; la `ingestion_frequency` diaria requiere coverage_level PROFESSIONAL o ENTERPRISE.
- El asistente contextual usa tooltips en la UI con íconos de información (i) que despliegan texto explicativo sin abandonar la página.
- Todo cambio de parámetros FinOps/PLD queda registrado en `audit_logs` con el valor anterior, el nuevo valor, el usuario que lo modificó y el timestamp.

**Criterios de aceptación:**
1. Al seleccionar la plantilla "Persona Moral — Régimen General" para un tax_profile nuevo, el sistema precarga todos los parámetros FinOps recomendados, y el administrador puede aceptarlos con un solo clic ("Usar valores recomendados") sin ajustar ningún parámetro manualmente.
2. Cada parámetro FinOps en la UI tiene un tooltip (i) que muestra una explicación en español claro y no técnico; el texto tiene una extensión máxima de 150 palabras y está aprobado por el equipo de compliance fiscal.
3. Si el administrador ajusta manualmente el umbral PLD a un valor inferior al mínimo recomendado para el régimen del contribuyente, el sistema muestra un warning amarillo con el mensaje: "Este umbral está por debajo del mínimo recomendado para [régimen]. Podrías recibir hasta N alertas adicionales por semana. ¿Deseas continuar?"
4. Pruebas automatizadas (`test_finops_setup.py`, `test_finops_templates.tsx`) validan: (a) precarga correcta de plantillas por régimen fiscal, (b) validación de rangos permitidos, (c) detección de incoherencias entre parámetros, (d) registro de cambios en audit_logs, (e) tooltips visibles y correctos para cada parámetro.
5. Los umbrales de UMA se actualizan automáticamente cada año fiscal (1 de febrero) mediante una migración programada que ajusta los valores absolutos en pesos manteniendo las UMAs configuradas por el administrador.

**Impactos y consideraciones para negocio:**
- Despachos contables pequeños y medianos (80% del mercado objetivo) no cuentan con oficiales de cumplimiento expertos en PLD. Las plantillas y el asistente contextual democratizan el acceso a configuraciones de riesgo adecuadas.
- Una mala configuración de umbrales PLD puede tener consecuencias legales graves: umbrales demasiado altos resultan en omisión de reportes UIF (delito LFPIORPI); umbrales demasiado bajos saturan al despacho con falsos positivos y generan fatiga del analista.
- El asistente contextual reduce la necesidad de capacitación presencial y disminuye el tiempo de activación de nuevos clientes.

**Referencias y trazabilidad:**
- SAD: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes, §17.5 — Configuración de criticidad, coverage_level y SLAs por tax_profile, §9.5 — Frontend SPA / Onboarding UI
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §7 — Ciclo de Vida del Cliente y Procesos Operativos
- Developer Handbook: §3.8 — Configuración asistida de parámetros FinOps y umbrales PLD
- ADR: ADR-0009 — Arquitectura de ingesta Belvo y modelo de datos, ADR-020 — Configuración paramétrica de screening PLD por UMAs, ADR-020
- Tablas afectadas: `tax_profiles`, `finops_configs` (nueva), `pld_thresholds` (nueva), `audit_logs`
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes

---

#### HU-05.08 — Dashboard de Estado de Onboarding con Indicadores de Completitud y Checklist

**Épica:** EP-05 — Onboarding y Tax Profiles
**Módulo(s):** Frontend SPA, Core Backend
**Historia:** Como Administrador de un despacho contable y como Customer Success Manager de Sentinel, quiero un dashboard de estado de onboarding que muestre el progreso de activación de cada nuevo despacho —porcentaje de completitud del wizard, pasos pendientes, tax_profiles creados, credenciales SAT vinculadas, datos migrados— con indicadores visuales y una checklist accionable, para que el administrador sepa exactamente qué le falta para completar la activación y el CSM pueda dar seguimiento proactivo a cuentas con onboarding estancado.

**Alcance:** Frontend SPA (React 19 + Vanilla CSS Liquid Glass) + Backend (Express BFF + Core FastAPI). Cubre dashboard de completitud con indicadores de progreso por paso, checklist accionable, notificaciones de pasos pendientes, vista para el administrador del despacho (autoservicio) y vista agregada para el CSM de Sentinel (multi-tenant). No cubre el wizard en sí (HU-05.01) ni los pasos individuales del onboarding.

**Historia en formato Given/When/Then:**
- **Given** un administrador de despacho ha iniciado el wizard de onboarding pero solo ha completado 3 de los 6 pasos, y han pasado 48 horas desde su último avance.
- **When** el administrador inicia sesión en Sentinel.
- **Then** en lugar de ser redirigido al HUD (que requiere onboarding completo), es redirigido al "Dashboard de Onboarding" que muestra: (a) barra de progreso global con "50% completado", (b) checklist de los 6 pasos con íconos de completado/pendiente, (c) el paso actual resaltado con un botón "Continuar", (d) tiempo estimado restante para completar el onboarding ("~8 minutos"), (e) enlace a recursos de ayuda contextual.
- **And** el CSM de Sentinel, desde su panel multi-tenant, ve un dashboard agregado con todos los despachos en proceso de onboarding, segmentados por: completados (<24h), en progreso (avance 50-90%), estancados (>7 días sin avance), y no iniciados (cuenta creada sin empezar wizard), con capacidad de filtrar y contactar proactivamente.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.01 (Wizard de onboarding guiado).
- El dashboard de onboarding se muestra automáticamente si `tenant.status = 'ONBOARDING'` y el usuario tiene rol `tenant_admin`, redirigiendo al wizard en el paso donde se quedó.
- Indicadores de completitud: barra de progreso lineal (Liquid Glass con animación de gradiente), checklist interactiva (clic en un paso completado muestra resumen de lo configurado, clic en paso pendiente abre el wizard en ese paso).
- Checklist de pasos del onboarding: (1) Datos del despacho, (2) Verificación de identidad RL, (3) Vinculación SAT/Belvo, (4) Configuración fiscal y FinOps, (5) Alta de tax_profiles, (6) Migración de datos legacy (opcional), (7) Revisión y activación.
- Métricas para CSM: tiempo promedio de onboarding (por tamaño de despacho), tasa de abandono por paso, cuellos de botella (pasos donde los usuarios pasan más tiempo).
- Notificaciones automáticas: si un despacho lleva más de 7 días sin completar el onboarding, se envía una notificación al CSM asignado y un correo recordatorio al administrador del despacho.
- El dashboard debe ser responsive y funcionar en móvil (administradores de despachos pequeños frecuentemente usan tablet o smartphone).

**Criterios de aceptación:**
1. Un administrador con onboarding al 50% inicia sesión y es redirigido al Dashboard de Onboarding (no al HUD), viendo claramente la barra de progreso, los 3 pasos completados en verde y los 3 pendientes en gris con un botón "Continuar" en el paso actual.
2. Al hacer clic en "Continuar", el wizard se abre exactamente en el paso 4 (donde se quedó), con todos los datos de los pasos 1-3 precargados y validados.
3. El CSM de Sentinel ve en su dashboard agregado una lista de despachos en onboarding con indicadores visuales (verde=completado, amarillo=en progreso, rojo=estancado, gris=no iniciado) y puede hacer clic en cualquier despacho para ver el detalle de su checklist.
4. Si un despacho lleva 7 días sin avance, el sistema envía automáticamente un correo recordatorio al administrador del despacho (plantilla aprobada por marketing) y una notificación al CSM asignado en el panel.
5. Pruebas automatizadas (`test_onboarding_dashboard.tsx`) validan: (a) redirección correcta según estado del tenant, (b) progreso reflejado fielmente, (c) checklist interactiva funcional, (d) vista CSM multi-tenant con datos correctos, (e) funcionamiento responsive en viewport móvil.

**Impactos y consideraciones para negocio:**
- Un dashboard de onboarding claro reduce la tasa de abandono durante la activación (principal punto de fuga en SaaS B2B) al eliminar la incertidumbre de "cuánto falta".
- La vista de CSM permite un seguimiento proactivo y basado en datos, permitiendo a Sentinel escalar su operación de customer success sin necesidad de un ejército de CSMs.
- La detección de cuellos de botella (pasos donde los usuarios consistentemente pasan más tiempo) alimenta la mejora continua del wizard en iteraciones posteriores.

**Referencias y trazabilidad:**
- SAD: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes, §18.2 — Componentes del Tactical HUD y sistema de diseño Liquid Glass, §9.5 — Frontend SPA / Onboarding UI
- SAD-Lite: §5 — Flujo de Onboarding y Activación de Clientes, §6 — Aislamiento Multi-Tenant y el Principio de Row-Level Security (RLS), §7 — Ciclo de Vida del Cliente y Procesos Operativos
- Developer Handbook: §3.9 — Dashboard de estado de onboarding y checklist
- ADR: ADR-020
- Tablas afectadas: `tenants`, `onboarding_progress` (nueva), `user_preferences`
- Flujo crítico SAD §10: §10.1 — Onboarding guiado de nuevos despachos y contribuyentes

---

## Resumen de HUs Redactadas

| EP | HU | Título | Prioridad | SP | Dependencias | Estado |
|:---:|:---|:---|:---|:---:|:---|:---:|
| 04 | HU-04.05 | Sistema de Migraciones Flyway/Alembic con Rollback Automático | CRITICAL | 8 | HU-04.01 | NEW |
| 04 | HU-04.06 | Backups Automatizados con PITR y Retención Configurable | CRITICAL | 8 | HU-04.01, HU-04.05 | NEW |
| 04 | HU-04.07 | Índices de Rendimiento y Optimización de Consultas Analíticas HUD | HIGH | 5 | HU-04.04 | NEW |
| 04 | HU-04.08 | Particionamiento Horizontal de Invoices por Año Fiscal | HIGH | 8 | HU-04.01, HU-04.05 | NEW |
| 04 | HU-04.09 | Health Checks de Base de Datos con Métricas y Monitoreo | HIGH | 5 | HU-04.01 | NEW |
| 04 | HU-04.10 | Estrategia de Seeding de Datos de Prueba con Anonimización PII | MEDIUM | 5 | HU-04.01 | NEW |
| 05 | HU-05.01 | Wizard de Onboarding Guiado Paso a Paso | CRITICAL | 8 | HU-04.01, HU-04.02, HU-03.01 | NEW |
| 05 | HU-05.02 | Integración Belvo Widget para Vinculación Credenciales SAT | CRITICAL | 8 | HU-05.01 | NEW |
| 05 | HU-05.03 | Validación de RFC en Onboarding: Estructura, Homoclave y Vigencia SAT | HIGH | 5 | HU-05.01 | NEW |
| 05 | HU-05.04 | Creación y Configuración de Tax Profile con Coverage Levels | HIGH | 5 | HU-05.01, HU-05.03 | NEW |
| 05 | HU-05.05 | Migración de Datos Fiscales Históricos desde Legacy (CSV/Excel/ZIP) | MEDIUM | 5 | HU-05.04 | NEW |
| 05 | HU-05.06 | Verificación de Identidad Representante Legal con e.firma/CIEC ante SAT | HIGH | 5 | HU-05.02, HU-05.03 | NEW |
| 05 | HU-05.07 | Configuración Asistida de Parámetros FinOps y Umbrales PLD | MEDIUM | 5 | HU-05.04 | NEW |
| 05 | HU-05.08 | Dashboard de Estado de Onboarding con Checklist y Completitud | MEDIUM | 3 | HU-05.01 | NEW |

**Total: 14 HUs | EP-04: 6 HUs (36 SP) | EP-05: 8 HUs (44 SP) | Combinado: 80 SP**

---

### 5.6 EP-06 — Ingesta Belvo y Reconciliación

#### HU-06.01 — Ingesta histórica y recurrente Belvo Fiscal API

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — Workers Celery y adaptador Belvo, SAD §9.7 (LENS) — Normalización de facturas, SAD §12.1 (Integración Belvo) — Fiscal API
**Historia:** Como contador de un despacho mexicano, quiero conectar Sentinel al portal del SAT de mis clientes a través de la integración con Belvo Fiscal API, para que el sistema ingeste automáticamente todas las facturas CFDI emitidas y recibidas (históricas de los últimos 5 ejercicios fiscales y recurrentes cada 12 horas), las normalice al formato canónico de Sentinel con `invoice_hash` SHA-256 y `uuid` del CFDI, y las almacene en la tabla `invoices` bajo el tenant correspondiente, eliminando la necesidad de descargar y procesar manualmente miles de XMLs desde el portal del SAT.

**Alcance:**
Implementación del adaptador Belvo (`BelvoFiscalAdapter`) como worker Celery en Python 3.12. Flujo de ingesta histórica (backfill de hasta 5 años, disparado manualmente por el administrador). Flujo de ingesta recurrente (cada 12 horas vía Celery Beat, configurable por tenant). Transformación de la respuesta JSON de Belvo al esquema canónico de `invoices`. Manejo de rate limits de Belvo (30 req/min) con backpressure y cola priorizada. No cubre reconciliación difusa (HU-06.04), delta sync (HU-06.07), ni deduplicación con LENS (HU-07.02).

**Historia en formato Given/When/Then:**
- **Given** que el despacho "López & Asociados" ha completado el onboarding (HU-05.01), vinculado sus credenciales SAT vía Belvo Widget (HU-05.02), y creado el `tax_profile` del cliente con RFC `ABC123456XXX`. El administrador solicita una ingesta histórica de 3 ejercicios fiscales (2024-2026).
- **When** el endpoint `POST /api/v1/belvo/ingest/historical` recibe la solicitud, crea un registro en `belvo_sync_log` con estado `IN_PROGRESS` y despacha una tarea Celery que itera sobre periodos fiscales mensuales usando `BelvoFiscalAPI.retrieve_invoices(link_id, date_from, date_to)`.
- **Then** para cada factura retornada por Belvo, el adaptador debe: (a) validar la estructura de la respuesta, (b) generar `invoice_hash = SHA-256(uuid || rfc_issuer || rfc_receiver || total || date_issued)`, (c) mapear campos al esquema `invoices` de Sentinel con catálogos estandarizados, (d) verificar si la factura ya existe por `uuid` para evitar duplicados, (e) insertar en lotes de 100 vía `bulk_insert` con `ON CONFLICT (uuid) DO NOTHING`.
- **And** si Belvo retorna `429 Too Many Requests`, el worker debe aplicar backoff exponencial con jitter (1s, 2s, 4s, 8s, 16s, máximo 60s) y reintentar hasta 3 veces antes de marcar el periodo como `PARTIAL`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.04 (Políticas RLS y constraints de rendimiento en PostgreSQL 17).
- Regla de negocio: Las credenciales de Belvo (`link_id`, `api_key`) se almacenan cifradas (AES-256-GCM) en `belvo_connections.encrypted_credentials`. El `link_id` debe renovarse cada 90 días. El `invoice_hash` usa `SHA-256` determinista con formato `sha256("{uuid}|{rfc_issuer}|{rfc_receiver}|{total}|{date_issued}")`. La ingesta recurrente usa Celery Beat con schedule `crontab(minute=0, hour='*/12')`; cada `tax_profile` puede configurar su frecuencia (mínimo 6h, máximo 24h).

**Criterios de aceptación:**
1. Ingesta histórica de 3 años (~15,000 CFDI) se completa en ≤15 minutos bajo rate limits de Belvo, con ≥99.5% de facturas insertadas correctamente.
2. Una factura con `uuid` ya existente no se duplica: `ON CONFLICT (uuid) DO NOTHING` previene duplicados y `duplicates_skipped` se incrementa en `belvo_sync_log`.
3. Ante `429` de Belvo, el worker aplica backoff exponencial y reintenta sin perder facturas ni corromper la integridad.
4. El `invoice_hash` de 10 facturas de muestra coincide bit a bit con hash calculado externamente con `sha256sum`.
5. Los tests (`test_belvo_adapter.py`) cubren ≥85%: ingesta exitosa, idempotencia, rate limit (429), timeout API, factura con campos faltantes, fecha inválida, error de autenticación (401), link expirado, progreso en sync_log, y cancelación por timeout de worker.

**Impactos y consideraciones:**
- La ingesta es el flujo de datos más volumétrico del sistema (500,000+ facturas anuales para un despacho grande). Diseño de lotes con `bulk_insert` de 100 y `ON CONFLICT DO NOTHING` minimiza round-trips a PostgreSQL. Belvo Fiscal API es un servicio externo crítico; se implementa circuit breaker (HU-06.05) para evitar saturar Belvo con reintentos.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal FastAPI y Workers Celery, §9.7 — LENS y Normalización de Facturas, §12.1 — Integración Belvo Fiscal API
- SAD-Lite: §5 — Modelo de Gobernanza y Ciclo de Vida del Contribuyente
- Developer Handbook: §6.1 — Ingesta Histórica y Recurrente Belvo Fiscal API con Workers Celery
- ADR: ADR-011 — Estrategia de Ingesta Belvo: Workers Celery y Rate Limiting
- Tablas afectadas: `invoices`, `tax_profiles`, `belvo_connections`, `belvo_sync_log`
- Flujo crítico SAD §10: §10.3 (Inicio de operaciones — Ingesta de datos desde SAT vía Belvo)

---

#### HU-06.02 — Verificación de webhooks Belvo (Bearer token + IP allowlist, ADR-0008)

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.2 (BFF Express) — Endpoint de webhook y verificación, SAD §9.3 (Core Fiscal) — Procesamiento del evento, SAD §13.8 (Seguridad de Webhooks) — Validación de origen y autenticidad, SAD §12.1 — Webhooks Belvo
**Historia:** Como Oficial de Seguridad de Sentinel, quiero que todos los webhooks entrantes de Belvo sean rigurosamente verificados —validando el Bearer token mediante `timingSafeEqual` para prevenir ataques de timing, verificando que la IP de origen pertenezca a la allowlist oficial de Belvo, y validando la integridad del payload— para prevenir inyección de eventos falsos que podrían corromper la integridad de los datos fiscales de mis despachos clientes.

**Alcance:**
Endpoint `POST /api/v1/webhooks/belvo` en Express BFF. Middleware de verificación de Bearer token con `crypto.timingSafeEqual()`. Validación de IP contra allowlist oficial de Belvo. Rate limiting (máximo 100 webhooks/minuto por tenant). Procesamiento asíncrono vía Redis pub/sub. No cubre idempotencia de procesamiento (HU-06.06). Según ADR-0008, Belvo NO usa HMAC, usa Bearer token.

**Historia en formato Given/When/Then:**
- **Given** que Belvo ha completado una sincronización y envía un webhook a Sentinel con header `Authorization: Bearer sk_live_xxxxx` y payload `{ event: "invoices.completed", link_id: "lnk_xxx", data: { count: 42 } }` desde IP autorizada.
- **When** el BFF recibe la petición, el middleware `belvoWebhookGuard` ejecuta: (1) compara el Bearer token byte a byte con el secreto almacenado usando `crypto.timingSafeEqual()`, (2) verifica `req.ip` contra la allowlist de IPs de Belvo, (3) valida `Content-Type: application/json` y que el body sea JSON parseable.
- **Then** si las tres verificaciones pasan, el BFF registra en `webhook_events` con estado `RECEIVED`, publica en Redis, y retorna `200 OK` en ≤500 ms. Si falla: token inválido → `401`, IP no autorizada → `403`, body malformado → `400`, con registro en `webhook_events` como `REJECTED`.
- **And** el worker Celery escucha Redis y dispara ingesta inmediata para el `tax_profile` asociado al `link_id`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.01 (Ingesta histórica y recurrente Belvo Fiscal API).
- Regla de negocio: Sigue estrictamente ADR-0008: Bearer token (NO HMAC). Validación con `timingSafeEqual` previene timing attacks. Allowlist de IPs se actualiza automáticamente vía worker semanal. El `belvo_webhook_secret` es único por tenant y se rota cada 90 días con grace period de 24h. Webhooks rechazados con `INVALID_TOKEN` repetidos (>5 en 10 min) disparan alerta `WEBHOOK_ATTACK_SUSPECTED`.

**Criterios de aceptación:**
1. Webhook con token válido, IP autorizada y JSON correcto es aceptado con `200 OK`, registrado como `RECEIVED`, y publicado en Redis.
2. Webhook con token inválido (1 byte diferente) es rechazado con `401` y tiempo de respuesta no difiere significativamente (≤5% variación en p95) de tokens inválidos de igual longitud.
3. Webhook con IP fuera de allowlist recibe `403`; ≥5 repeticiones en 10 min dispara alerta `WEBHOOK_ATTACK_SUSPECTED`.
4. Webhook con payload no JSON recibe `400` y `rejection_reason = 'INVALID_CONTENT_TYPE'`.
5. Los tests (`test_webhook_bearer.py`) cubren ≥90%: webhook válido, token inválido, IP no autorizada, payload no JSON, rate limiting, timing constante, rotación de secretos con dos secretos simultáneos.

**Impactos y consideraciones:**
- Es la puerta de entrada desde Internet a procesamiento de datos fiscales. Un webhook falsificado podría inyectar eventos que corrompan datos o suplanten notificaciones. La triple verificación (token + IP + formato) sigue defensa en profundidad. `timingSafeEqual` es esencial: comparación naive `===` expone a timing attacks donde el atacante deduce el token midiendo microsegundos de diferencia en tiempo de respuesta.

**Referencias y trazabilidad:**
- SAD: §9.2 — BFF Express y Endpoint de Webhooks, §9.3 — Core Fiscal y Workers, §13.8 — Seguridad de Webhooks, §12.1 — Integración Belvo
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §6.2 — Verificación de Webhooks Belvo con Bearer Token y timingSafeEqual
- ADR: ADR-0008 — Mandato de Inmutabilidad de Bitácoras y Verificación de Webhooks con Bearer Token (NO HMAC)
- Tablas afectadas: `webhook_events`, `invoices`, `tenant_config`, `belvo_sync_log`, `audit_logs`
- Flujo crítico SAD §10: §10.4 (Recepción de eventos y notificaciones — Webhooks y procesamiento asíncrono)

---

#### HU-06.03 — Monitoreo de estado de ingesta y progress UI

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — API de estado de sincronización, SAD §9.7 (LENS) — Métricas de calidad de ingesta, SAD §9.1 (Frontend SPA) — Barra de progreso y UI de monitoreo
**Historia:** Como contador o administrador de un despacho, quiero ver el progreso en tiempo real de la ingesta de facturas desde Belvo/SAT —con una barra de progreso que muestre porcentaje completado, facturas procesadas, nuevas vs duplicadas, errores y tiempo estimado restante— para saber exactamente en qué estado se encuentra la sincronización fiscal de cada cliente sin revisar logs técnicos de servidor.

**Alcance:**
API de estado (`GET /api/v1/belvo/sync/status/{tax_profile_id}`). Publicación de eventos desde workers vía Redis pub/sub. Endpoint SSE (`GET /api/v1/belvo/sync/stream/{tax_profile_id}`) en BFF Express. Componente React 19 `SyncProgressBar` con barra animada Liquid Glass. No cubre dashboard de salud de conexiones Belvo (HU-06.09).

**Historia en formato Given/When/Then:**
- **Given** que el administrador ha iniciado una ingesta histórica para el `tax_profile` `ABC123456XXX` y el worker está procesando (1,245/15,000 facturas).
- **When** el administrador navega a "Estado de Sincronización" y el frontend establece conexión SSE con `GET /api/v1/belvo/sync/stream/TP-007`.
- **Then** el BFF se suscribe a Redis `belvo:sync:progress:TP-007` y retransmite eventos SSE (`event: progress`) al frontend con métricas en tiempo real.
- **And** el componente `SyncProgressBar` renderiza: barra con gradiente Liquid Glass, contador numérico, indicadores de colores (verde/amarillo/rojo), periodo fiscal actual, y estimación de tiempo restante (EMA, α=0.3).
- **And** al completar, se envía evento `completed` y la barra muestra 100% con animación de completitud.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.01 (Ingesta histórica y recurrente Belvo Fiscal API).
- Regla de negocio: Monitoreo de ingesta es transparencia operativa crítica. Eventos en Redis tienen TTL de 24h. Estado canónico en `belvo_sync_log` (PostgreSQL); Redis transporta eventos efímeros. Conexión SSE con heartbeat cada 15s y timeout de 30 min. Si el frontend pierde la conexión, al reconectar consulta `belvo_sync_log` y reanuda streaming.

**Criterios de aceptación:**
1. Ingesta simulada de 5,000 facturas muestra actualizaciones en tiempo real (latencia ≤2s) con porcentaje y throughput correctos.
2. Al finalizar, barra muestra 100%, animación de completitud, y SSE cierra limpiamente.
3. Panel de errores expandible con agrupación por tipo y botón "Reintentar" funcional.
4. Reconexión SSE recupera estado desde `belvo_sync_log` sin reiniciar barra desde 0%.
5. Los tests (`test_sync_status.py`) cubren ≥85%: conexión SSE, eventos de progreso, cálculo de porcentaje/throughput, completitud, reconexión, purga de eventos Redis.

**Impactos y consideraciones:**
- El patrón SSE/Redis para progreso en tiempo real se reutiliza en monitoreo de SLA (HU-10.05), exportación WORM (HU-11.04), y ETL 69-B (HU-09.01). La infraestructura Redis pub/sub + SSE es una inversión arquitectónica para todas las HUs de monitoreo.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal y Workers de Monitoreo, §9.7 — LENS y Métricas, §9.1 — Frontend SPA y UX de Monitoreo
- SAD-Lite: §5 — Modelo de Gobernanza
- Developer Handbook: §6.3 — Monitoreo de Estado de Ingesta y Barra de Progreso
- ADR: ADR-011 — Sistema de Monitoreo en Tiempo Real vía SSE y Redis pub/sub
- Tablas afectadas: `belvo_sync_log`, `tax_profiles`, `invoices`
- Flujo crítico SAD §10: §10.4 (Recepción de eventos — Monitoreo de sincronización)

#### HU-06.04 — Reconciliación automática de facturas Belvo vs datos internos con matching difuso

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.6 (Ingesta), SAD §10.4 (Reconciliación)
**Historia:** Como Contador Fiscal, quiero que el sistema reconcilie automáticamente las facturas recibidas desde Belvo contra los registros internos de la base de datos, utilizando matching difuso sobre invoice_hash, uuid, RFC emisor/receptor y montos, para detectar discrepancias, omisiones y duplicados sin intervención manual.

**Alcance:**
Worker Celery que compara facturas provenientes de Belvo (Fiscal API) contra la tabla `invoices` en PostgreSQL 17. Aplica matching sobre: invoice_hash (SHA-256 del XML fiscal), uuid del CFDI, RFC emisor/receptor, subtotal, total, y timestamps de emisión/certificación. Se soporta matching difuso con tolerancia configurable en montos (±2% por defecto) y fuzzy string matching sobre RFCs con Jaro-Winkler para corregir errores tipográficos leves. El resultado de la reconciliación genera eventos de: MATCH, MISMATCH, MISSING_BELVO, MISSING_DB, y DUPLICATE almacenados en la tabla `reconciliation_log`. Cubre tanto ingesta histórica masiva como ingesta recurrente.

**Historia en formato Given/When/Then:**
- **Given** que existe al menos una conexión Belvo activa por tax_profile (HU-06.01) y la tabla `invoices` contiene registros con invoice_hash y uuid poblados.
- **When** se ejecuta el worker de reconciliación (programado o bajo demanda) para un tax_profile y un rango de fechas fiscales.
- **Then** cada factura de Belvo se empareja con su correspondiente en `invoices` por invoice_hash (match exacto) o, en su defecto, por uuid y montos con tolerancia configurable; los resultados se registran en `reconciliation_log` con tipo de evento y score de confianza del matching.
- **And** las discrepancias detectadas (misma factura con montos distintos entre Belvo y DB) se marcan con flag `reconciled=false` en `invoices` y generan una alerta de nivel WARNING para el Oficial de Cumplimiento.
- **And** las facturas presentes en Belvo pero ausentes en `invoices` disparan una ingesta automática con Celery, respetando el throttling activo (HU-06.08).
- **And** las facturas presentes en `invoices` pero ausentes en Belvo (posible eliminación del SAT) se marcan con flag `orphan_in_db` para revisión manual.
- **And** el proceso de reconciliación completa es trazable en `audit_logs` con identificador de lote (reconciliation_batch_id).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.01 (Ingesta histórica y recurrente Belvo), HU-04.01 (Esquema DDL), HU-04.02 (RLS injector Core)
- Regla de negocio: RN-006 — Toda factura en `invoices` debe ser trazable a una fuente de ingesta (Belvo, LENS, migración manual). El invoice_hash es el campo canónico de deduplicación.
- La tolerancia de matching en montos es configurable a nivel tenant en `tenant_config.finops_params` (default ±0.02).
- Matching difuso sobre RFCs utiliza Jaro-Winkler con d_jw ≥ 0.95 para considerar coincidencia tipográfica.

**Criterios de aceptación:**
1. El worker de reconciliación procesa 10,000 facturas en ≤ 5 minutos con PostgreSQL 17, utilizando batch queries de 500 registros con índices B-Tree sobre `(tax_profile_id, invoice_hash, emisor_rfc, fecha_emision)`.
2. El matching difuso detecta correctamente discrepancias en montos con tolerancia configurable y errores tipográficos leves en RFCs (p.ej., "ABC1234567XYZ" vs "ABC1234567XY2"), con registro trazable del score de confianza.
3. Cada lote de reconciliación registra entrada inmutable en `audit_logs` con reconciliation_batch_id, tax_profile_id, total_facturas_procesadas, y conteo por tipo de evento (MATCH, MISMATCH, MISSING_BELVO, MISSING_DB, DUPLICATE).
4. NFR: El worker de reconciliación debe operar bajo RLS, garantizando que un tenant solo reconcilia facturas de sus propios tax_profiles; cobertura de prueba ≥ 75% con `pytest-cov`.

**Impactos y consideraciones para negocio:**
- Elimina la necesidad de conciliación manual de facturas entre Belvo y el sistema interno, reduciendo el riesgo de omisiones fiscales y errores en reportes pre-UIF.
- Las alertas generadas por discrepancias (MISMATCH, MISSING_DB) alimentan el flujo de atención de alertas (EP-10) y pueden escalar según criticidad del tax_profile.
- El consumo de API Belvo no se incrementa: la reconciliación opera sobre datos ya ingeridos, salvo en el caso MISSING_BELVO donde se dispara re-ingesta bajo demanda.

**Referencias y trazabilidad:**
- SAD: §10.4 — Reconciliación Belvo vs datos internos
- SAD-Lite: §10 — Flujos de ingesta y procesamiento fiscal
- Developer Handbook: §12.1 — Integración Belvo API
- ADR: ADR-011 (Estrategia de deduplicación), ADR-011
- Tablas afectadas: `invoices`, `reconciliation_log`, `audit_logs`, `belvo_links`
- Flujo crítico SAD §10: §10.3 — Ingesta desde Belvo
- Stack canónico: Python 3.12, Celery con Redis, PostgreSQL 17, SQLAlchemy 2.0

---

#### HU-06.05 — Reintentos con backoff exponencial y circuit breaker para API Belvo

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.6 (Ingesta), SAD §12.1 (Integración Belvo)
**Historia:** Como Ingeniero de Plataforma, quiero que las llamadas a la API de Belvo implementen reintentos automáticos con backoff exponencial y un circuit breaker que proteja el sistema ante fallos recurrentes, para garantizar resiliencia operativa sin saturar la API externa ni degradar el servicio.

**Alcance:**
Capa de resiliencia HTTP en el adaptador Belvo (`BelvoAdapter`) de Python 3.12 que envuelve toda llamada saliente a la Fiscal API de Belvo. Implementa: reintentos con backoff exponencial (jitter ±25%, máximo 5 intentos, delay inicial 1s), circuit breaker con tres estados (CLOSED → OPEN tras 5 fallos en ventana de 60s → HALF_OPEN tras 30s de cooldown) usando Redis como almacén de estado compartido entre workers Celery. El circuit breaker es por link_id de Belvo (no global). Se registra cada transición de estado y cada fallo en `belvo_api_metrics`. Los errores 4xx (salvo 429 que maneja HU-06.08) no activan reintentos; los 5xx y errores de red sí.

**Historia en formato Given/When/Then:**
- **Given** que el BelvoAdapter está configurado con credenciales Bearer token válidas (ADR-0008) y existe un link_id activo para el tax_profile.
- **When** una llamada a Belvo Fiscal API falla con error 5xx o timeout de red.
- **Then** el sistema reintenta automáticamente hasta 5 veces con backoff exponencial (1s, 2s, 4s, 8s, 16s) y jitter aleatorio del 25% para evitar thundering herd.
- **And** si 5 fallos ocurren dentro de una ventana de 60 segundos para el mismo link_id, el circuit breaker transiciona a OPEN y rechaza inmediatamente nuevas llamadas (fail-fast) durante 30 segundos.
- **And** tras 30 segundos en OPEN, el breaker transiciona a HALF_OPEN y permite una única llamada de prueba; si falla, vuelve a OPEN; si tiene éxito, transiciona a CLOSED.
- **And** todas las transiciones de estado del circuit breaker se registran en `belvo_api_metrics` con timestamp, link_id, estado anterior, estado nuevo, y motivo del fallo.
- **And** los errores 4xx (HTTP 400, 401, 403, 404) no activan reintentos: se registran directamente como fallo permanente y notifican al canal de alertas operativas (EP-10).
- **And** mientras el circuit breaker está OPEN, las tareas Celery pendientes para ese link_id se reencolan con prioridad reducida (baja) y se reintentan cuando el breaker transicione a HALF_OPEN.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.01 (Ingesta histórica y recurrente Belvo), HU-04.01 (Redis disponible)
- Regla de negocio: RN-007 — El sistema nunca debe exceder 3 intentos de reintento por minuto por link_id para no violar rate limits de Belvo. El backoff exponencial garantiza este comportamiento.
- El estado del circuit breaker es por link_id y no global; un link fallando no debe bloquear la ingesta de otros tax_profiles.

**Criterios de aceptación:**
1. Las pruebas unitarias (`test_belvo_retries.py`) verifican el backoff exponencial con mock de respuestas HTTP: 3 fallos 502 seguidos de un 200 exitoso; el delay acumulado entre intentos es 1s + 2s + 4s = 7s (±25% jitter).
2. El circuit breaker (`test_circuit_breaker.py`) demuestra la transición CLOSED → OPEN tras 5 fallos en ≤60s, el rechazo inmediato de llamadas en OPEN, y la recuperación HALF_OPEN → CLOSED tras una llamada exitosa.
3. NFR: El overhead del circuit breaker (consulta Redis) es ≤ 5ms en P95; la memoria Redis consumida para estado de breakers es ≤ 1KB por link_id activo.

**Impactos y consideraciones para negocio:**
- Evita cascadas de fallos que degraden el servicio completo: si Belvo está caído, los workers no saturan recursos reintentando indefinidamente.
- La notificación temprana de circuit breaker OPEN permite al equipo de operaciones activar el modo offline de contingencia (HU-07.03) proactivamente.
- Las métricas de fallos por link_id alimentan el dashboard de salud Belvo (HU-06.09).

**Referencias y trazabilidad:**
- SAD: §10.3 — Ingesta desde Belvo; §12.1 — Integración Belvo API
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §12.1.3 — Estrategia de resiliencia HTTP
- ADR: ADR-011 (Estrategia de contingencia operativa), ADR-0008 (Bearer token Belvo), ADR-011
- Tablas afectadas: `belvo_api_metrics`, `belvo_links`
- Flujo crítico SAD §10: §10.3 — Ingesta recurrente Belvo con reintentos y circuit breaker
- Stack canónico: Python 3.12, Celery con Redis, PostgreSQL 17, httpx/tenacity

---

#### HU-06.06 — Idempotencia en procesamiento de webhooks con deduplicación de eventos

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.6 (Ingesta), SAD §12.1 (Integración Belvo)
**Historia:** Como Ingeniero de Plataforma, quiero que el endpoint de webhooks de Belvo sea idempotente mediante deduplicación por event_id con constraint UNIQUE en base de datos, para garantizar que un mismo evento fiscal no se procese múltiples veces incluso si Belvo lo reenvía por timeout o error de red.

**Alcance:**
Endpoint FastAPI en Core (`POST /api/v1/webhooks/belvo`) que recibe eventos de la Fiscal API de Belvo. Implementa idempotencia basada en `event_id` único generado por Belvo. Al recibir un webhook, el sistema: (1) verifica Bearer token con timingSafeEqual (HU-06.02), (2) extrae event_id del payload, (3) consulta la tabla `webhook_events` con constraint UNIQUE(event_id) — si ya existe, devuelve HTTP 200 OK sin re-procesar, (4) si no existe, inserta registro en `webhook_events` y encola tarea Celery de procesamiento. La inserción y el encolado son atómicos dentro de una transacción PostgreSQL con nivel SERIALIZABLE. Se contemplan escenarios de reenvío legítimo de Belvo (timeout en la confirmación HTTP original) y escenarios de ataques de replay maliciosos.

**Historia en formato Given/When/Then:**
- **Given** que el webhook de Belvo está configurado con Bearer token verificado exitosamente (HU-06.02, ADR-0008) y el endpoint `/api/v1/webhooks/belvo` recibe tráfico HTTPS.
- **When** Belvo envía un evento fiscal con event_id="evt_abc123" y el sistema lo procesa correctamente (inserción en `webhook_events` + encolado Celery + respuesta HTTP 200 en ≤ 500ms).
- **Then** si Belvo reenvía el mismo event_id="evt_abc123" (por timeout en la confirmación original), el sistema detecta la existencia del event_id mediante la constraint UNIQUE en `webhook_events`, omite el re-procesamiento, y responde HTTP 200 OK (idempotente).
- **And** la respuesta HTTP 200 para eventos duplicados es indistinguible de la respuesta para eventos nuevos, evitando fugas de información sobre el estado interno del sistema.
- **And** si dos webhooks con el mismo event_id llegan simultáneamente (condición de carrera), PostgreSQL 17 con nivel de aislamiento SERIALIZABLE garantiza que solo una transacción tiene éxito; la otra recibe error de constraint UNIQUE y responde HTTP 200.
- **And** todo webhook procesado (nuevo o duplicado) registra entrada inmutable en `audit_logs` con event_id, timestamp de recepción, y acción tomada (PROCESSED o IDEMPOTENT_IGNORE).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.02 (Verificación de Bearer token y timingSafeEqual en webhooks), HU-04.01 (Esquema DDL)
- Regla de negocio: RN-008 — Ningún evento fiscal de Belvo puede procesarse más de una vez. La constraint UNIQUE(event_id) es la defensa de último recurso; la validación previa en aplicación es defensa en profundidad.
- La tabla `webhook_events` almacena: event_id (UNIQUE), received_at (timestamp), processed_at (timestamp nullable), status (PENDING/PROCESSED/FAILED), event_type, payload_hash, celery_task_id.
- El garbage collection de eventos procesados (status=PROCESSED con antigüedad > 90 días) se ejecuta semanalmente para mantener el tamaño de la tabla controlado.

**Criterios de aceptación:**
1. La prueba `test_webhook_idempotency.py` envía 100 webhooks con el mismo event_id de forma concurrente (multithreading); solo uno debe generar tarea Celery y los otros 99 deben devolver HTTP 200 con estado IDEMPOTENT_IGNORE en audit_logs.
2. La constraint UNIQUE(event_id) en `webhook_events` rechaza inserciones duplicadas con error de integridad; el endpoint captura `IntegrityError` y responde HTTP 200, no 500.
3. NFR: El endpoint de webhook procesa una solicitud (nueva o duplicada) en ≤ 200ms P95, incluyendo verificación de Bearer token, consulta de event_id, y escritura en audit_logs. El throughput mínimo es 100 webhooks/segundo por instancia de Core.

**Impactos y consideraciones para negocio:**
- Elimina el riesgo de facturas duplicadas en `invoices` por reenvíos de webhooks, que causarían sobreestimación de ingresos/egresos en RiskGauge (EP-08) y falsos positivos en PLD (EP-09).
- La inmutabilidad de `webhook_events` + `audit_logs` proporciona trazabilidad forense para auditorías SAT/UIF sobre el origen de cada factura.
- Compatible con el futuro requisito de resellado criptográfico NOM-151 (EP-11), ya que cada factura tiene exactamente un origen de ingesta trazable.

**Referencias y trazabilidad:**
- SAD: §10.3 — Ingesta desde Belvo; §12.1 — Integración Belvo API; §13.8 — Seguridad de webhooks
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §12.1.4 — Idempotencia de webhooks
- ADR: ADR-0008 (Bearer token Belvo, timingSafeEqual), ADR-011
- Tablas afectadas: `webhook_events`, `audit_logs`, `invoices`, `belvo_links`
- Flujo crítico SAD §10: §10.3 — Recepción de webhooks Belvo con deduplicación
- Stack canónico: Python 3.12, FastAPI, PostgreSQL 17, Celery con Redis

---

#### HU-06.07 — Sincronización delta incremental Belvo: solo cambios desde última sincronización

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.6 (Ingesta), SAD §10.3 (Ingesta desde Belvo)
**Historia:** Como Contador Fiscal, quiero que la ingesta recurrente desde Belvo solo descargue los cambios incrementales (deltas) desde la última sincronización exitosa, utilizando los parámetros `date_from`/`date_to` y el cursor de paginación de la Fiscal API de Belvo, para reducir el tiempo de sincronización diaria y minimizar el consumo de rate limits.

**Alcance:**
Worker Celery programado (cron diario a las 02:00 UTC, configurable por tenant) que ejecuta sincronización delta contra la Fiscal API de Belvo. Para cada link_id activo, consulta el `last_sync_timestamp` almacenado en `belvo_sync_state` (por tax_profile y tipo de recurso: invoices, credit_notes, debit_notes) y utiliza el parámetro `date_from` de Belvo para obtener solo documentos con fecha de emisión ≥ last_sync_timestamp. El cursor de paginación de Belvo se almacena en Redis para sincronizaciones que requieran múltiples páginas. Al completar exitosamente, se actualiza `last_sync_timestamp` al timestamp del documento más reciente procesado. Si la sincronización falla a mitad, el `last_sync_timestamp` no se actualiza, garantizando que la próxima ejecución recupere los documentos faltantes. Soporta también sincronización "full refresh" bajo demanda para forzar re-descarga completa del período fiscal.

**Historia en formato Given/When/Then:**
- **Given** que existe un link_id Belvo activo con `belvo_sync_state.last_sync_timestamp = 2026-05-24T02:00:00Z` para el recurso `invoices`.
- **When** se ejecuta la sincronización delta programada a las 02:00 UTC del 2026-05-25.
- **Then** la llamada a Belvo Fiscal API incluye `date_from=2026-05-24T02:00:00Z` y solo retorna facturas emitidas desde esa fecha/hora hasta el momento actual.
- **And** si la respuesta de Belvo está paginada, el sistema itera todas las páginas usando el cursor de paginación (`next_page` token), almacenando el progreso en Redis para tolerancia a fallos.
- **And** al finalizar exitosamente el procesamiento de todas las páginas, `belvo_sync_state.last_sync_timestamp` se actualiza al timestamp del documento más reciente contenido en la respuesta.
- **And** si la sincronización falla (error 5xx, timeout, circuit breaker OPEN), el `last_sync_timestamp` no se modifica y la tarea se reencola para reintento con backoff exponencial (HU-06.05).
- **And** el sistema registra en `belvo_sync_log` cada ejecución con: tax_profile_id, link_id, recurso, timestamp inicio, timestamp fin, documentos descargados, documentos procesados, estado (SUCCESS/PARTIAL/FAILED), y error si aplica.
- **And** la métrica `belvo_delta_sync_duration_seconds` se expone en Prometheus para monitoreo operativo.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.01 (Ingesta histórica y recurrente Belvo), HU-04.01 (Redis disponible)
- Regla de negocio: RN-009 — La sincronización delta diaria (02:00 UTC) no debe exceder 15 minutos por tax_profile con volumen ≤ 5,000 facturas/día. Si excede, se debe fragmentar por semanas dentro del worker.
- La primera sincronización para un tax_profile nuevo (sin `belvo_sync_state`) se comporta como "full refresh" retrospectivo desde la fecha de inicio fiscal del tenant (`tenant_config.fiscal_year_start`).
- El `last_sync_timestamp` se almacena con precisión de microsegundos para evitar gaps temporales entre sincronizaciones.

**Criterios de aceptación:**
1. La prueba `test_belvo_delta_sync.py` simula dos ejecuciones consecutivas: la primera descarga 200 facturas (full, sin last_sync_timestamp previo), actualiza el timestamp; la segunda (delta) solo recibe las 5 facturas nuevas emitidas después de la primera sincronización.
2. Si la sincronización delta falla en la página 3 de 5, el last_sync_timestamp permanece inalterado y la siguiente ejecución recupera todas las facturas desde el timestamp original (incluyendo las páginas 1-3 ya ingeridas, que son deduplicadas por invoice_hash en HU-07.02).
3. NFR: La sincronización delta para un tax_profile con ≤ 500 facturas nuevas completa en ≤ 60 segundos (excluyendo latencia de Belvo API).

**Impactos y consideraciones para negocio:**
- Reduce el tiempo de ventana de ingesta diaria de horas (full refresh) a minutos (delta), permitiendo que los workers de PLD (EP-09) y RiskGauge (EP-08) arranquen más temprano con datos frescos.
- Minimiza el consumo de rate limits de Belvo (HU-06.08), reduciendo riesgo de HTTP 429 en horas pico.
- El mecanismo de "no actualizar timestamp en fallo" garantiza que no se pierdan facturas en escenarios de error parcial.

**Referencias y trazabilidad:**
- SAD: §10.3 — Ingesta desde Belvo (modo delta)
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §12.1.2 — Paginación y cursores Belvo API
- ADR: ADR-0009 (Estrategia de ingesta), ADR-011
- Tablas afectadas: `belvo_sync_state`, `belvo_sync_log`, `invoices`, `belvo_links`
- Flujo crítico SAD §10: §10.3 — Sincronización delta programada Belvo
- Stack canónico: Python 3.12, Celery Beat, Redis, PostgreSQL 17

---

#### HU-06.08 — Manejo de rate limits y throttling inteligente de API Belvo con cola priorizada

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.6 (Ingesta), SAD §12.1 (Integración Belvo)
**Historia:** Como Ingeniero de Plataforma, quiero que el sistema gestione los rate limits de la API Belvo (HTTP 429) con throttling adaptativo y una cola de tareas Celery priorizada, para maximizar el throughput de ingesta sin exceder los límites contractuales del proveedor ni provocar bloqueos temporales.

**Alcance:**
Middleware de rate limiting en el `BelvoAdapter` que interpreta los headers de respuesta de Belvo: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, y `Retry-After`. Ante HTTP 429, el sistema: (1) extrae `Retry-After` (segundos), (2) pausa todas las llamadas a Belvo para ese link_id durante `Retry-After + 5s` (margen de seguridad), (3) reencola las tareas afectadas en cola priorizada (`belvo_low` si es ingesta histórica, `belvo_high` si es ingesta recurrente programada). Implementa throttling preventivo: cuando `X-RateLimit-Remaining` ≤ 10%, el worker reduce voluntariamente su tasa de llamadas (delay de 500ms entre requests). La cola `belvo_high` tiene prelación sobre `belvo_low` en los workers Celery. Las métricas de rate limiting se exponen en Prometheus (`belvo_rate_limit_hits_total`, `belvo_throttle_active`) y se registran en `belvo_api_metrics`.

**Historia en formato Given/When/Then:**
- **Given** que el BelvoAdapter está ejecutando sincronización delta (HU-06.07) para 3 tax_profiles simultáneamente contra la Fiscal API de Belvo.
- **When** Belvo responde HTTP 429 con header `Retry-After: 30` para el link_id "lnk_abc".
- **Then** el sistema detiene inmediatamente todas las llamadas salientes para "lnk_abc" durante 35 segundos (30 + 5 de margen) y registra la incidencia en `belvo_api_metrics` con event_type=RATE_LIMIT_HIT.
- **And** las tareas Celery pendientes para "lnk_abc" se reencolan en la cola `belvo_low` con ETA = now + 35s, manteniendo su orden original (FIFO dentro de la cola).
- **And** mientras "lnk_abc" está pausado, los workers continúan procesando otros link_id no afectados ("lnk_def", "lnk_ghi"), maximizando el throughput global.
- **And** cuando `X-RateLimit-Remaining` cae por debajo del 10% del límite (umbral configurable), el throttling preventivo introduce un delay de 500ms entre requests consecutivas al mismo link_id, evitando llegar al 429.
- **And** la cola priorizada `belvo_high` (ingesta recurrente programada) siempre drena antes que `belvo_low` (ingesta histórica o bajo demanda), garantizando que los datos fiscales del día se ingieran primero.
- **And** el contador `belvo_rate_limit_hits_total` se incrementa y dispara una alerta en Prometheus/AlertManager si supera 5 hits en 10 minutos para un mismo link_id.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.01 (Ingesta histórica y recurrente Belvo), HU-06.05 (Reintentos y circuit breaker)
- Regla de negocio: RN-010 — El sistema nunca debe ignorar un `Retry-After` de Belvo; hacerlo resultaría en bloqueo temporal o permanente de la API key del tenant.
- Los límites de rate de Belvo son por API key; si múltiples tax_profiles comparten API key (modo holding), el throttling es global a la key, no por link_id.
- El throttling preventivo (≤ 10% remaining) es configurable por tenant en `tenant_config.belvo_throttle_threshold`.

**Criterios de aceptación:**
1. La prueba `test_rate_limiting.py` simula una respuesta HTTP 429 con `Retry-After: 10` y verifica que el adaptador pausa llamadas por 15 segundos, reencola las tareas con ETA correcta, y no bloquea otros link_id.
2. La prueba `test_throttling.py` simula respuestas sucesivas con `X-RateLimit-Remaining` decreciente: al llegar al umbral del 10%, el adaptador introduce delay de 500ms entre requests; al recibir 200 OK sin rate limit, reanuda ritmo normal.
3. NFR: El overhead del middleware de rate limiting (lectura de headers HTTP, consulta Redis) es ≤ 2ms P99 por request; el retardo adicional por throttling preventivo no degrada el SLA de ingesta diaria (todas las facturas del día ingeridas antes de las 04:00 UTC).

**Impactos y consideraciones para negocio:**
- Protege la relación contractual con Belvo evitando bloqueos de API key por exceder rate limits.
- La priorización de colas garantiza que la ingesta del día (crítica para PLD y RiskGauge) no sea bloqueada por ingesta histórica masiva.
- Las métricas de rate limiting correlacionadas con `belvo_health_dashboard` (HU-06.09) permiten al equipo de operaciones anticipar necesidades de escalado de API key.

**Referencias y trazabilidad:**
- SAD: §10.3 — Ingesta desde Belvo; §12.1 — Integración Belvo API (rate limits)
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §12.1.5 — Manejo de rate limits Belvo
- ADR: ADR-0008 (Bearer token Belvo), ADR-011
- Tablas afectadas: `belvo_api_metrics`, `belvo_links`, `tenant_config`
- Flujo crítico SAD §10: §10.3 — Throttling y rate limiting en ingesta Belvo
- Stack canónico: Python 3.12, Celery con Redis (colas priorizadas), PostgreSQL 17

---

#### HU-06.09 — Dashboard de salud de conexiones Belvo por tax_profile con historial de estado

**Épica:** EP-06 — Ingesta Belvo y Reconciliación
**Módulo(s):** SAD §9.6 (Ingesta), SAD §9.10 (Alertas y Monitoreo)
**Historia:** Como Oficial de Cumplimiento, quiero visualizar un dashboard con el estado de salud de todas las conexiones Belvo de mis tax_profiles, incluyendo historial de sincronizaciones, estado de circuit breakers, rate limits consumidos, y última ingesta exitosa, para supervisar proactivamente la integridad de los datos fiscales entrantes y detectar contingencias operativas.

**Alcance:**
Vista en el frontend React 19 (dentro del HUD Liquid Glass, SAD §18.2) que consume un endpoint FastAPI Core (`GET /api/v1/belvo/health/{tax_profile_id}` y `GET /api/v1/belvo/health/summary`). Muestra para cada tax_profile: (1) estado del link Belvo (ACTIVE, EXPIRED, ERROR, DISCONNECTED) con color semáforo, (2) timestamp de última sincronización exitosa y duración, (3) estado del circuit breaker (CLOSED/OPEN/HALF_OPEN), (4) rate limits consumidos vs disponibles (gráfico de barras del período actual), (5) conteo de facturas ingeridas hoy/ayer/este mes, (6) historial de últimos 10 errores con timestamps, y (7) gráfica de tendencia de sincronización (últimos 30 días). Los datos provienen de `belvo_links`, `belvo_sync_state`, `belvo_sync_log`, `belvo_api_metrics`, y `belvo_health_snapshot` (materialización horaria para rendimiento). El dashboard soporta filtrado por tax_profile, por estado de link, y por rango de fechas. Actualización en tiempo real vía SSE para estados críticos (link EXPIRED, circuit breaker OPEN).

**Historia en formato Given/When/Then:**
- **Given** que el Oficial de Cumplimiento ha iniciado sesión con rol de tenant_admin y existe al menos un tax_profile con conexión Belvo configurada (HU-05.02).
- **When** accede al Dashboard de Salud Belvo desde el HUD (sección "Ingesta").
- **Then** visualiza una tarjeta por cada tax_profile con semáforo de estado, última sincronización, y un indicador de alerta si el circuit breaker está OPEN o el link está EXPIRED.
- **And** al hacer clic en una tarjeta, se despliega el detalle con historial de sincronizaciones (gráfico de barras con conteo diario de facturas ingeridas, últimos 30 días), estado del circuit breaker, rate limits consumidos, y log de errores recientes.
- **And** si un link Belvo cambia a estado ERROR o circuit breaker OPEN, el dashboard recibe una notificación SSE en tiempo real y la tarjeta afectada parpadea en rojo sin requerir refresco manual de página.
- **And** el dashboard ofrece un botón "Reconectar" que inicia el flujo de re-autenticación Belvo Widget (HU-05.02) para links EXPIRED o DISCONNECTED, con confirmación de seguridad 2FA (HU-02.02).
- **And** los datos del dashboard se sirven desde `belvo_health_snapshot` (materialización horaria con Redis cache TTL 60s) para garantizar carga ≤ 2 segundos incluso con 50+ tax_profiles.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-06.01 (Ingesta histórica y recurrente Belvo), HU-06.05 (Reintentos y circuit breaker)
- Regla de negocio: RN-011 — Un tax_profile con estado DISCONNECTED por más de 72 horas debe generar una alerta de nivel CRITICAL para el Oficial de Cumplimiento, ya que implica pérdida de cobertura fiscal.
- El endpoint `GET /api/v1/belvo/health/summary` debe respetar RLS (solo retorna tax_profiles del tenant autenticado) y cachear respuestas en Redis por 30 segundos.
- La materialización `belvo_health_snapshot` se genera cada hora mediante un worker Celery Beat que consolida `belvo_sync_log` + `belvo_api_metrics` + `belvo_links`.

**Criterios de aceptación:**
1. El dashboard (`test_belvo_health_dashboard.tsx`) renderiza correctamente tarjetas de estado para 20 tax_profiles con estados mixtos (ACTIVE, ERROR, EXPIRED) en ≤ 2 segundos; los colores de semáforo son verificados por test de snapshot.
2. La notificación SSE se dispara en ≤ 5 segundos tras un cambio de estado de link (simulado mediante actualización directa en `belvo_links` via API de prueba).
3. NFR: La consulta `GET /api/v1/belvo/health/summary` responde en ≤ 500ms P95 para hasta 50 tax_profiles, sirviendo datos desde Redis cache; el endpoint cumple WCAG 2.1 AA (accesibilidad) verificado con Axe DevTools.

**Impactos y consideraciones para negocio:**
- Empodera al Oficial de Cumplimiento para detectar y resolver desconexiones de Belvo antes de que impacten reportes PLD (EP-09) o RiskGauge (EP-08).
- La capacidad de reconexión directa desde el dashboard reduce el tiempo de resolución de incidencias de horas (abrir ticket de soporte) a minutos (self-service).
- El historial de sincronización sirve como evidencia de cobertura fiscal continua para auditorías SAT/UIF.

**Referencias y trazabilidad:**
- SAD: §10.3 — Ingesta desde Belvo; §10.4 — Reconciliación; §18.2 — Dashboard HUD
- SAD-Lite: §10 — Flujos de ingesta; §18 — UX Monitoreo
- Developer Handbook: §12.1.6 — Monitoreo y health checks Belvo
- ADR: ADR-0008 (Bearer token Belvo), ADR-011
- Tablas afectadas: `belvo_links`, `belvo_sync_state`, `belvo_sync_log`, `belvo_api_metrics`, `belvo_health_snapshot`
- Flujo crítico SAD §10: §10.3 — Monitoreo de salud de conexiones Belvo
- Stack canónico: Python 3.12, FastAPI, React 19, Redis (cache + SSE), PostgreSQL 17, Celery Beat

---

---

### 5.7 EP-07 — LENS, Parsing y Calidad CFDI

#### HU-07.01 — Ingesta y calidad de CFDI en LENS: validación estructural y RFC

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — Servicio LENS de ingesta y validación, SAD §9.7 (LENS) — Motor de calidad y parsing de CFDI, SAD §10.2 (Flujo de Ingesta) — Procesamiento de archivos XML/ZIP
**Historia:** Como contador de un despacho, quiero cargar archivos XML de CFDI y archivos ZIP con múltiples facturas directamente en Sentinel a través del módulo LENS, para que el sistema valide la estructura del XML conforme al estándar CFDI 4.0 del SAT, extraiga los metadatos fiscales clave (UUID, RFC emisor, RFC receptor, total, fecha, tipo de comprobante, método de pago, uso del CFDI), verifique que los RFCs tengan formato válido según la normativa del SAT (persona moral: 3 letras + 6 dígitos + homoclave, persona física: 4 letras + 6 dígitos + homoclave), y asigne flags de calidad (válido, advertencia, error) a cada factura procesada.

**Alcance:**
Endpoint `POST /api/v1/lens/ingest` en Core Fiscal. Parser CFDI 4.0 con extracción de namespace `cfdi:Comprobante`, validación de estructura XML (well-formedness, namespaces, atributos obligatorios: `Version="4.0"`, `TipoDeComprobante`, `LugarExpedicion`, `RegimenFiscal`). Validación de RFC vía regex y dígito verificador. Generación de `invoice_hash` y `quality_flags` JSONB. Inserción con `data_source = 'LENS'`. No cubre validación XSD (HU-07.05), parser ZIP paralelo (HU-07.04), ni deduplicación con Belvo (HU-07.02).

**Historia en formato Given/When/Then:**
- **Given** que un contador ha recibido un ZIP con 50 CFDI XMLs de mayo 2026 que no aparecen en el portal del SAT por rezago, y necesita procesarlas para el cierre de declaración mensual.
- **When** arrastra el ZIP a la drop-zone de LENS (`POST /api/v1/lens/ingest` con `multipart/form-data` y `tax_profile_id = 'TP-007'`), y el Core Fiscal descomprime e itera sobre cada XML.
- **Then** para cada XML, el parser: (a) verifica well-formedness (`xml.etree.ElementTree`), (b) valida namespace CFDI 4.0, (c) extrae metadatos obligatorios (UUID, RFC Emisor/Receptor, Total como `NUMERIC(18,6)`, Fecha como `TIMESTAMPTZ`, TipoDeComprobante, MetodoPago, UsoCFDI, RegimenFiscal), (d) genera `invoice_hash = SHA-256(UUID || RFC_Emisor || RFC_Receptor || Total || Fecha)`.
- **And** el validador de RFC verifica: longitud (12 persona moral, 13 persona física), regex `^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$`, y dígito verificador según algoritmo SAT. RFCs inválidos se marcan como `WARNING` en `quality_flags` pero no se rechaza la factura.
- **And** al finalizar, retorna resumen `{ processed: 50, valid: 48, warnings: 2, errors: 0 }` y las facturas se insertan en `invoices` con `data_source = 'LENS'`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01 (Esquema físico DDL completo en PostgreSQL 17 Docker).
- Regla de negocio: LENS es la vía de ingesta manual/alternativa, complementaria a Belvo. Facturas con `data_source = 'LENS'` pasan por pipeline de calidad antes de PLD y RiskGauge. Validación de RFC estricta pero no bloqueante: solo UUID ausente o Total no parseable rechazan la factura. Archivos XML pueden contener PII; el parser solo extrae campos del esquema canónico de `invoices`. Directorio temporal `/tmp/sentinel/lens/...` se limpia tras 5 minutos del procesamiento.

**Criterios de aceptación:**
1. ZIP con 50 XMLs CFDI 4.0 válidos procesado en ≤10s, 50 facturas insertadas con `data_source = 'LENS'`.
2. XML con RFC Emisor `ABC123456` (sin homoclave) se procesa marcado con `rfc_emitter_valid = false` y `quality_level = 'WARNING'`.
3. XML con UUID ausente se rechaza, error `MISSING_UUID` registrado en detalle de respuesta.
4. Archivo ZIP corrupto rechazado con `400 Bad Request: invalid_zip_format` (atomicidad de lote: todo o nada).
5. Tests (`test_cfdi_parser.py`) cubren ≥85%: XML válido, XML sin UUID, RFC inválido, Total no numérico, namespace incorrecto (3.3), XML malformado, ZIP con 50 XMLs, ZIP corrupto, ZIP vacío, dígito verificador RFC, limpieza de directorio temporal.

**Impactos y consideraciones:**
- LENS es crítico para resiliencia operativa: cuando el portal del SAT está caído o Belvo tiene degradación, LENS permite procesar facturas desde archivos locales. Junto con HU-07.03 (modo de contingencia offline), asegura continuidad del negocio fiscal. El algoritmo de validación de RFC debe auditarse internamente. La columna `quality_flags` (JSONB) es extensible para futuros flags sin migraciones.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal FastAPI y Servicio LENS, §9.7 — LENS y Motor de Calidad, §10.2 — Flujo de Ingesta y Validación de CFDI
- SAD-Lite: §5 — Modelo de Gobernanza y Ciclo de Vida del Contribuyente
- Developer Handbook: §7.1 — Ingesta y Calidad de CFDI en LENS: Validación Estructural y de RFC
- ADR: ADR-011 — Estrategia de Ingesta LENS y Validación de Calidad de CFDI
- Tablas afectadas: `invoices`
- Flujo crítico SAD §10: §10.5 (Validación y aseguramiento de calidad — LENS Ingesta y Parsing de CFDI)

---
#### HU-07.02 — Deduplicación CFDI en Caliente con SHA-256 entre Belvo y LENS

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.7, SAD §10.4
**Historia:** Como motor de ingesta fiscal de Sentinel, quiero que cada CFDI entrante —ya sea proveniente de la API Belvo o del parser LENS— sea sometido a deduplicación criptográfica en caliente mediante su hash SHA-256 sobre los campos canónicos `invoice_hash` y `uuid`, para garantizar que ninguna factura se registre más de una vez en el sistema, preservando la integridad del universo de datos fiscales del contribuyente y evitando inflación artificial de métricas de riesgo y PLD.

**Alcance:**
Backend (Core FastAPI + Workers Celery). Cubre el cálculo de hash SHA-256 sobre campos canónicos del CFDI (UUID, RFC emisor, RFC receptor, total, fecha, tipo de comprobante), la verificación contra índices existentes en `invoices` antes de INSERT, la resolución de conflictos entre fuentes (Belvo gana en metadatos de enriquecimiento, LENS gana en datos crudos del XML), y la notificación de colisiones al analista.

**Historia en formato Given/When/Then:**
- **Given** una factura con UUID `a1b2c3d4-...` llega vía webhook Belvo y ya fue previamente ingerida por el parser ZIP de LENS con el mismo UUID, existiendo un registro en `invoices` con `source = 'lens'` y `invoice_hash = 'abc123...'`.
- **When** el worker de ingesta Belvo calcula el `invoice_hash` SHA-256 de la factura entrante y ejecuta `SELECT ... WHERE invoice_hash = 'abc123...' OR uuid = 'a1b2c3d4-...'` contra la tabla `invoices`.
- **Then** el sistema detecta la colisión, no inserta un nuevo registro, y en su lugar actualiza el registro existente con los metadatos enriquecidos de Belvo (timestamps de emisión/certificación SAT, estado de cancelación) manteniendo el `source` original como `'lens+belvo'`.
- **And** se registra un evento de deduplicación en `audit_logs` con `event_type = 'cfdi_dedup'`, `action = 'merge'`, UUID, ambos hashes, fuentes en conflicto, y timestamp de resolución.
- **And** si la factura entrante no coincide con ningún registro existente, se inserta normalmente con `source` según su origen y el `invoice_hash` calculado.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.01 (Ingesta y calidad de CFDIs en LENS: validación estructural y de RFCs), HU-06.01 (Ingesta histórica y recurrente Belvo Fiscal API con workers Celery).
- El hash SHA-256 se calcula concatenando en orden canónico: `uuid || rfc_emisor || rfc_receptor || total || fecha_emision || tipo_comprobante`. El resultado es un hash hexadecimal de 64 caracteres almacenado en `invoices.invoice_hash` con índice único.
- La columna `invoices.uuid` mantiene un índice único adicional (UNIQUE constraint) como respaldo para facturas que lleguen con campos parciales.
- Regla de resolución de conflictos: Belvo es fuente autoritativa para metadatos de enriquecimiento SAT (fecha de certificación, estado de cancelación, método de pago, forma de pago). LENS es fuente autoritativa para el contenido crudo del XML (impuestos desglosados, conceptos, complementos). En colisión, se fusionan ambos manteniendo la procedencia.
- El sistema debe tolerar variaciones de formato entre ambas fuentes (e.g., diferencias de whitespace en RFCs, precisión de decimales en totales) normalizando antes del hash.
- La deduplicación ocurre en el hot path de ingesta, por lo que debe completarse en menos de 50 ms por factura (índices B-Tree en `invoice_hash` y `uuid`).
- El worker de Belvo y el worker de LENS comparten el mismo lock advisory de PostgreSQL (`pg_advisory_xact_lock`) sobre el UUID para evitar race conditions en ingesta concurrente.

**Criterios de aceptación:**
1. Una factura con UUID duplicado entre Belvo y LENS se detecta antes del INSERT, se fusionan los metadatos de ambas fuentes, y el registro final tiene `source = 'lens+belvo'` y `invoice_hash` único.
2. La tabla `audit_logs` registra cada evento de deduplicación con `event_type = 'cfdi_dedup'`, incluyendo UUID, hashes de ambas fuentes, timestamp UTC y tenant_id.
3. La operación de deduplicación completa (cálculo de hash + búsqueda en índice + decisión INSERT vs UPDATE) se ejecuta en ≤ 50 ms p95 bajo carga de 1,000 facturas/minuto concurrentes.
4. Dos workers concurrentes (Belvo + LENS) que reciben la misma factura en el mismo instante no generan registros duplicados gracias al lock advisory por UUID.
5. Pruebas automatizadas (`test_cfdi_dedup.py`, `test_lens_belvo_dedup.py`) cubren: deduplicación feliz con merge de metadatos, colisión con hash idéntico, colisión con UUID idéntico pero campos distintos (factura cancelada y re-emitida), y concurrencia simulada con locks.

**Impactos y consideraciones para negocio:**
- Elimina el riesgo de que una misma factura se contabilice dos veces en los cálculos de PLD por UMAs, lo que podría generar falsos positivos de alertamiento y reportes pre-UIF erróneos.
- La fusión inteligente Belvo+LENS maximiza la completitud de datos fiscales: Belvo aporta la trazabilidad oficial SAT y LENS aporta la granularidad del XML crudo.
- Cumplimiento con el principio de integridad de datos del CFF: cada factura debe ser única e íntegra en los libros contables electrónicos.

**Referencias y trazabilidad:**
- SAD: §9.7 — LENS, parsing y calidad de datos CFDI, §10.4 — Reconciliación automática de facturas y deduplicación
- SAD-Lite: §4 — Motor de Ingesta Multi-Fuente (Belvo + LENS)
- Developer Handbook: §3.2 — Modelo canónico de CFDI y cálculo de invoice_hash
- ADR: ADR-011 — Estrategia de reconciliación y matching difuso entre fuentes de datos Belvo y LENS
- Tablas afectadas: `invoices`, `audit_logs`
- Flujo crítico SAD §10: §10.4 — Reconciliación automática de facturas Belvo vs datos internos con matching difuso

---

#### HU-07.03 — Contingencia Operativa ante Degradación y Caída del SAT/Belvo con Modo Offline

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.7, SAD §10.12
**Historia:** Como Oficial de Cumplimiento y despacho contable multi-cliente, quiero que el sistema Sentinel degrade su funcionamiento de forma controlada cuando los servicios externos SAT o Belvo presenten intermitencia o indisponibilidad total, activando un modo offline que permita continuar con las operaciones críticas de consulta de datos ya ingeridos, recepción de facturas vía LENS (carga manual/API), y encolamiento de tareas diferidas (consultas SAT pendientes, sincronización Belvo) para su ejecución automática cuando los servicios se recuperen, garantizando la continuidad operativa del despacho incluso durante los cortes programados del SAT en periodos de alta demanda fiscal.

**Alcance:**
Backend (Core FastAPI + Workers Celery + Redis). Cubre la detección proactiva de degradación mediante health checks al SAT (SOAP/API) y Belvo (API REST), la activación/desactivación automática del modo degradado con su correspondiente bandera en `tax_profiles.degraded_mode`, el encolamiento de tareas pendientes en Redis con reintentos post-recuperación, y la notificación multinivel a los usuarios del tenant (banners en UI + email + Slack). No afecta la ingesta vía LENS ni las consultas a datos históricos ya persistidos.

**Historia en formato Given/When/Then:**
- **Given** el servicio SOAP del SAT para verificación de RFCs presenta latencias superiores a 15 segundos durante más de 3 intentos consecutivos, y el health check programado de Sentinel (`/api/health/sat`) lo detecta.
- **When** el Circuit Breaker de SAT alcanza el umbral de fallos configurado (3 fallos en ventana de 60 segundos).
- **Then** el sistema activa automáticamente el modo degradado para SAT, establece `tax_profiles.degraded_mode = 'sat_partial'`, y notifica a todos los usuarios del tenant con un banner en el HUD: "Servicio SAT en modo degradado — Las validaciones de RFC en tiempo real están suspendidas. Los datos históricos permanecen disponibles."
- **And** las operaciones que requieren SAT (verificación de RFC en onboarding, consulta de estado de facturas, descarga de listados 69-B) se encolan en Redis con prioridad baja y un TTL de 24 horas, y el worker `sat_retry` las reintenta automáticamente cada 5 minutos hasta que SAT se recupere.
- **And** cuando el health check detecta que SAT responde normalmente (latencia < 5 segundos, tasa de éxito > 95%), el sistema desactiva el modo degradado, procesa las tareas encoladas en orden FIFO, y notifica la recuperación.
- **And** si la degradación es total (SAT + Belvo caídos simultáneamente por más de 30 minutos), se activa `degraded_mode = 'full_offline'` y se envía una notificación urgente al Oficial de Cumplimiento del tenant vía email y Slack.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.01 (Ingesta y calidad de CFDIs en LENS: validación estructural y de RFCs).
- Health checks independientes para SAT y Belvo con diferentes umbrales de sensibilidad: SAT tolera latencias de hasta 10s (servicio notoriamente lento en periodos fiscales), Belvo tolera hasta 5s y 3 reintentos por endpoint.
- Circuit Breaker con tres estados: CLOSED (operación normal), OPEN (servicio caído, rechazo inmediato de nuevas peticiones), HALF_OPEN (prueba de recuperación con tráfico limitado).
- El modo `sat_partial` permite continuar ingesta LENS, consultas de datos históricos, generación de reportes y consultas de RiskGauge. Suspende únicamente validaciones contra SAT y sincronización Belvo.
- El modo `full_offline` permite únicamente consultas de datos históricos e ingesta manual LENS. Suspende toda operación que requiera APIs externas.
- Las tareas encoladas en Redis durante la degradación deben mantener el orden cronológico de llegada y preservar el contexto RLS del tenant.
- Al recuperarse los servicios, el procesamiento del backlog debe respetar rate limits y throttling de las APIs externas para no saturarlas con tráfico acumulado.
- Cada transición de modo degradado se registra en `audit_logs` con `event_type = 'degraded_mode_change'`, detallando servicio afectado, timestamp, modo previo, modo nuevo, y métricas del health check.

**Criterios de aceptación:**
1. La detección de degradación de SAT se activa en menos de 90 segundos desde el inicio de la intermitencia y activa el modo `sat_partial` sin intervención manual.
2. Durante el modo `sat_partial`, las facturas se siguen recibiendo vía LENS sin degradación de servicio, y las consultas de datos históricos y métricas de RiskGauge responden con normalidad.
3. Las tareas encoladas durante la degradación (verificación de RFCs, descarga 69-B, sincronización Belvo) se procesan automáticamente en orden FIFO al recuperarse el servicio, con reintentos limitados a 5 por tarea y backoff exponencial.
4. Pruebas automatizadas (`test_degraded_mode.py`) cubren: activación automática de `sat_partial` por fallos consecutivos, activación manual de `full_offline` por el Oficial de Cumplimiento, recuperación automática y procesamiento del backlog, y notificaciones multinivel en cada transición.
5. La latencia de consultas a datos históricos no se degrada más allá del 5% durante el modo offline (sin llamadas externas, solo queries locales a PostgreSQL).

**Impactos y consideraciones para negocio:**
- Mitiga el riesgo operativo de los cortes programados del SAT (frecuentes en cierres bimestrales y declaraciones anuales), permitiendo que los despachos sigan trabajando con los datos ya ingeridos.
- El encolamiento automático de tareas pendientes elimina la necesidad de que los analistas reintenten manualmente operaciones fallidas tras cada caída del SAT.
- La notificación proactiva al Oficial de Cumplimiento asegura trazabilidad regulatoria: el despacho puede documentar ante auditorías que la indisponibilidad fue externa y no por negligencia operativa.
- Cumple con el requisito de continuidad de negocio del SAD §10.12: el sistema debe operar en modo degradado pero nunca quedar completamente inoperativo.

**Referencias y trazabilidad:**
- SAD: §9.7 — LENS, parsing y calidad de datos CFDI, §10.12 — Modos degradados y recuperación ante fallos
- SAD-Lite: §4 — Motor de Ingesta Multi-Fuente (Belvo + LENS)
- Developer Handbook: §5.8 — Manejo de modos degradados SAT/Belvo y estrategia de Circuit Breaker
- ADR: ADR-011 — Estrategia de resiliencia con Circuit Breaker y reintentos con backoff exponencial
- Tablas afectadas: `tax_profiles`, `invoices`, `audit_logs`
- Flujo crítico SAD §10: §10.12 — Modos degradados y recuperación ante fallos

---

#### HU-07.04 — Parser ZIP multi-factura con procesamiento paralelo y detección de archivos anidados

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.7 (LENS), SAD §10.2 (Carga LENS/XML)
**Historia:** Como Contador Fiscal, quiero poder subir archivos ZIP conteniendo múltiples CFDIs (XML) y que el sistema los procese en paralelo, detectando automáticamente archivos anidados y extrayendo cada CFDI individual, para agilizar la carga masiva de facturas desde el Portal del SAT o traspasos de despachos legacy.

**Alcance:**
Worker Celery en Python 3.12 que recibe un archivo ZIP subido por el usuario (vía endpoint `POST /api/v1/lens/upload/zip` en Core FastAPI) o mediante carga S3 desde migración legacy (HU-05.05). El parser: (1) valida integridad del ZIP (CRC-32, estructura de archivos, tamaño máximo 500 MB por archivo), (2) escanea recursivamente detectando archivos anidados (ZIP dentro de ZIP, hasta profundidad configurable de 3 niveles), (3) extrae en memoria cada archivo XML y lo somete a validación de estructura CFDI (namespace cfdi:Comprobante, versión 3.3 o 4.0), (4) distribuye el procesamiento de CFDis individuales en tareas Celery paralelas (batch de 50 por worker), (5) registra progreso en Redis para la barra de estado SSE (estilo HU-06.03). Archivos no-XML dentro del ZIP se ignoran con advertencia en log. Archivos XML que no cumplen namespace CFDI se rechazan con motivo documentado. Se soporta parallelismo configurable vía `CELERY_CONCURRENCY` por worker.

**Historia en formato Given/When/Then:**
- **Given** que el Contador Fiscal ha subido un ZIP "facturas-mayo-2026.zip" (250 MB, 1,200 archivos XML + 3 PDFs + 1 ZIP interno con 50 XML adicionales) mediante el endpoint de carga LENS.
- **When** se encola la tarea Celery `parse_zip_bundle` para este archivo vinculado al tax_profile.
- **Then** el parser abre el ZIP, identifica 1,250 archivos XML válidos (1,200 raíz + 50 del ZIP anidado, profundidad 2), ignora 3 PDFs con warning, y encola 25 sub-tareas Celery (50 XML cada una) para procesamiento paralelo.
- **And** la barra de progreso SSE muestra el avance en porcentaje basado en XML procesados / total detectados, actualizada desde Redis por cada sub-tarea completada.
- **And** si un archivo dentro del ZIP está corrupto o no es CFDI válido (sin namespace `cfdi:Comprobante`), se registra en `lens_upload_errors` con nombre de archivo, motivo del rechazo, y el archivo se ignora sin interrumpir el procesamiento del resto.
- **And** los XML extraídos exitosamente pasan al pipeline de validación XSD (HU-07.05) y extracción de metadatos (HU-07.06) antes de insertarse en `invoices`.
- **And** al finalizar el procesamiento completo, se genera un resumen en `lens_upload_log`: total de archivos en ZIP, CFDIs detectados, procesados exitosamente, rechazados (con breakdown por motivo), e invoice_hash de cada CFDI insertado.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.01 (Ingesta y calidad de CFDIs en LENS), HU-04.01 (Esquema DDL), Redis para tracking de progreso
- Regla de negocio: RN-012 — Ningún CFDI puede insertarse en `invoices` sin haber pasado validación de namespace y estructura mínima. El parser ZIP es la puerta de entrada; el pipeline de calidad (HU-07.05, HU-07.06, HU-07.07) es obligatorio downstream.
- Tamaño máximo de ZIP: 500 MB. Archivos individuales dentro del ZIP: 10 MB máximo. Profundidad de anidamiento máxima: 3 niveles.
- Los archivos ZIP se almacenan temporalmente en S3 con prefijo `lens-ingest/{tenant_id}/{tax_profile_id}/{upload_batch_id}/` y se eliminan tras 7 días de procesamiento exitoso.

**Criterios de aceptación:**
1. La prueba `test_zip_parser.py` verifica el procesamiento de un ZIP con 500 XML (incluyendo 1 anidado), 5 PDFs, y 2 XML corruptos; se extraen 500 CFDIs, los PDFs se ignoran con log, y los XML corruptos se reportan en `lens_upload_errors`.
2. Con `CELERY_CONCURRENCY=4`, el procesamiento de 2,000 CFDis en ZIP completa en ≤ 3 minutos (midiendo desde encolado hasta último invoice_hash insertado).
3. NFR: La extracción de un ZIP de 500 MB no debe consumir más de 2 GB de RAM del worker (procesamiento en streaming, sin cargar el ZIP completo en memoria); el endpoint de upload acepta multipart/form-data con streaming y devuelve `upload_batch_id` en ≤ 1 segundo.

**Impactos y consideraciones para negocio:**
- Permite la migración acelerada de despachos legacy que almacenan facturas en ZIPs descargados del Portal del SAT, reduciendo el tiempo de onboarding de semanas a horas.
- La detección de ZIPs anidados cubre el caso común de descargas masivas del SAT que empaquetan facturas en múltiples niveles de compresión.
- El resumen de carga alimenta el dashboard de ingesta LENS para trazabilidad del Contador Fiscal.

**Referencias y trazabilidad:**
- SAD: §10.2 — Carga LENS y procesamiento de XML; §10.5 — Carga masiva LENS (ZIP)
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §11.2.1 — Parser ZIP y XML pipeline
- ADR: ADR-011
- Tablas afectadas: `invoices`, `lens_upload_log`, `lens_upload_errors`, `audit_logs`
- Flujo crítico SAD §10: §10.5 — Carga masiva ZIP en LENS con procesamiento paralelo
- Stack canónico: Python 3.12, Celery con Redis, PostgreSQL 17, S3 (Object Lock)

---

#### HU-07.05 — Validación estructural XSD contra esquemas oficiales CFDI 4.0 del SAT

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.7 (LENS), SAD §10.2 (Carga LENS/XML)
**Historia:** Como Contador Fiscal, quiero que cada CFDI (XML) ingerido por LENS sea validado estructuralmente contra los esquemas XSD oficiales del SAT (CFDI 4.0, complementos de pago 2.0, y carta porte 3.1), para garantizar que solo facturas estructuralmente válidas ingresen al sistema y sean consideradas en los cálculos de riesgo y PLD.

**Alcance:**
Validador XSD en Python 3.12 integrado en el pipeline de ingesta LENS (HU-07.01). Utiliza `lxml` con los esquemas XSD oficiales del SAT almacenados localmente en `documentacion/xsd/cfdi40/` (versionados y con hash de integridad SHA-256). Para cada CFDI ingresado: (1) valida contra el XSD base `cfdv40.xsd`, (2) si el XML declara complementos (`cfdi:Complemento`), valida recursivamente contra los XSD de complementos aplicables según namespace (p.ej., `pago20.xsd`, `cartaporte31.xsd`, `nomina12.xsd`), (3) registra el resultado en `cfdi_validation_results` con: invoice_hash, is_xsd_valid (boolean), schema_version_validated, errores (lista de mensajes XSD), y timestamp de validación. Un CFDI que falla validación XSD se inserta en `invoices` con flag `xml_valid = false` pero NO se rechaza (el Contador decide si es error de emisor o archivo corrupto). Los esquemas XSD se actualizan automáticamente cada 30 días desde el portal del SAT con verificación de checksum y registro en `xsd_version_log`.

**Historia en formato Given/When/Then:**
- **Given** que LENS recibe un XML fiscal con namespace `cfdi:Comprobante` versión 4.0, declarando complemento de pago 2.0 (`pago20`).
- **When** el pipeline de validación XSD procesa este CFDI.
- **Then** el sistema valida el XML contra `cfdv40.xsd`: el documento raíz cumple estructura (Total, SubTotal, Emisor, Receptor, Conceptos), resultado `is_xsd_valid = true`.
- **And** el sistema detecta el nodo `cfdi:Complemento > pago20:Pagos` y valida recursivamente contra `pago20.xsd`: la estructura de pagos es correcta, resultado OK.
- **And** ambos resultados de validación se registran en `cfdi_validation_results` con invoice_hash, schema_version_validated = "cfdv40+pago20", y lista de errores vacía.
- **And** si el XML tiene un error estructural (p.ej., `Total` no coincide con suma de `Conceptos` según restricción XSD), el sistema registra `is_xsd_valid = false`, captura el mensaje de error XSD (p.ej., "cvc-complex-type.2.4.b: The content of element 'cfdi:Comprobante' is not complete"), y propaga el flag `xml_valid = false` a `invoices`.
- **And** los CFDis con `xml_valid = false` son visibles en el motor de calidad (HU-07.07) con el motivo específico de fallo para que el Contador determine si requiere corrección o reclamo al emisor.
- **And** los esquemas XSD locales se verifican semanalmente contra el repositorio oficial del SAT; si hay nueva versión, se descarga, valida checksum SHA-256, y registra en `xsd_version_log` con fecha de activación.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.01 (Ingesta y calidad de CFDIs en LENS), HU-04.01 (Esquema DDL)
- Regla de negocio: RN-013 — Todo CFDI insertado en `invoices` debe tener un registro correspondiente en `cfdi_validation_results`. La ausencia de registro de validación es un error de integridad de datos.
- Los esquemas XSD del SAT son normativos y de uso obligatorio para CFDI 4.0 según el Anexo 20 de la RMF vigente.
- La validación XSD es sincrónica dentro del pipeline de ingesta; no se delega a worker asíncrono porque el resultado condiciona flags downstream (HU-07.07).

**Criterios de aceptación:**
1. La prueba `test_xsd_validator.py` incluye fixtures de 10 XMLs: 7 válidos (CFDI 4.0 base, con pago20, con carta porte, con nómina, con deducciones, con IEPS, con comercio exterior) y 3 inválidos (Total incorrecto, nodo obligatorio faltante, namespace incorrecto). Los 7 válidos reportan `is_xsd_valid = true`, los 3 inválidos reportan `false` con mensajes de error XSD descriptivos.
2. La actualización automática de esquemas XSD se prueba con mock del portal SAT: descarga, validación SHA-256, y registro en `xsd_version_log`; si el checksum no coincide, la actualización se aborta y se dispara alerta de seguridad.
3. NFR: La validación XSD de un CFDI individual (300 KB promedio) completa en ≤ 150ms P95; la carga de esquemas XSD desde disco se cachea en memoria del worker (lru_cache con TTL de 1 hora) para no re-leer archivos en cada validación.

**Impactos y consideraciones para negocio:**
- Garantiza que los datos en `invoices` cumplen la estructura oficial del SAT, reduciendo rechazos en auditorías y mejorando la precisión del motor de calidad (HU-07.07).
- La no-rejección de facturas inválidas (solo marcado) permite que el Contador Fiscal gestione excepciones sin perder trazabilidad del documento original.
- La actualización automática de XSD asegura compliance continuo con cambios normativos del SAT sin intervención manual.

**Referencias y trazabilidad:**
- SAD: §10.2 — Carga LENS y procesamiento XML; §11.2 — DDL invoices (flags de calidad)
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §11.2.2 — Validación XSD de CFDI
- ADR: ADR-011
- Tablas afectadas: `invoices`, `cfdi_validation_results`, `xsd_version_log`
- Flujo crítico SAD §10: §10.2 — Validación estructural XSD de CFDI en LENS
- Stack canónico: Python 3.12, lxml, PostgreSQL 17
- Referencia normativa: Anexo 20 RMF vigente, CFDI 4.0 SAT

---

#### HU-07.06 — Extracción y normalización de metadatos de CFDIs (UUID, RFC, montos, métodos de pago)

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.7 (LENS), SAD §10.2 (Carga LENS/XML)
**Historia:** Como Analista Fiscal, quiero que el sistema extraiga y normalice automáticamente los metadatos clave de cada CFDI —UUID, RFC emisor, RFC receptor, nombre emisor, nombre receptor, subtotal, total, método de pago, forma de pago, moneda, tipo de comprobante, fecha de emisión, fecha de certificación— para que el HUD y los motores de riesgo puedan consultar y filtrar facturas sin necesidad de parsear el XML original.

**Alcance:**
Extractor de metadatos en Python 3.12 integrado en el pipeline de ingesta LENS (posterior a validación XSD, HU-07.05). Utiliza `lxml` con XPath para extraer del XML fiscal los campos canónicos del CFDI y normalizarlos a la estructura de la tabla `invoices` en PostgreSQL 17. Campos extraídos y su normalización: (1) `uuid` — del nodo `tfd:Digital@UUID`, uppercase, sin guiones, (2) `invoice_hash` — SHA-256 del XML original completo (canónico para deduplicación), (3) `emisor_rfc` — uppercase, sin espacios, (4) `receptor_rfc` — uppercase, sin espacios, (5) `emisor_nombre` — trim, capitalización de nombres propios, (6) `receptor_nombre` — trim, capitalización, (7) `subtotal` — Decimal(16,2), (8) `total` — Decimal(16,2), (9) `metodo_pago` — PUE, PPD, o transferencia bancaria (normalizado a código SAT), (10) `forma_pago` — código SAT de 2 dígitos, (11) `moneda` — MXN, USD, etc. (normalizado a ISO 4217), (12) `tipo_comprobante` — I, E, T, N, P (catálogo SAT), (13) `fecha_emision` — timezone-aware datetime UTC, (14) `fecha_certificacion` — timezone-aware datetime UTC. Los metadatos se persisten en la tabla `invoices` con el flag `metadata_extracted = true`. Si algún campo obligatorio (uuid, emisor_rfc, receptor_rfc, total) no puede extraerse, el CFDI se marca con `metadata_complete = false` y los campos faltantes quedan NULL, con registro detallado en `lens_upload_errors`.

**Historia en formato Given/When/Then:**
- **Given** que un CFDI válido XSD (HU-07.05) ha sido procesado y su XML original está disponible en memoria.
- **When** el extractor de metadatos procesa el XML.
- **Then** el sistema extrae los 14 campos canónicos mediante XPath y los normaliza: UUID en uppercase sin guiones, RFCs en uppercase, nombres trim y capitalizados, montos como Decimal(16,2), códigos SAT normalizados, y fechas en UTC.
- **And** el `invoice_hash` se calcula como SHA-256 del contenido completo del XML (bytes) y se almacena como campo UNIQUE en `invoices` para deduplicación.
- **And** los metadatos extraídos se persisten en `invoices` con `metadata_extracted = true` y `metadata_complete = true` (si todos los campos obligatorios están presentes).
- **And** si el UUID está ausente del XML (factura sin timbrado), el sistema asigna `metadata_complete = false`, `uuid = NULL`, registra el incidente en `lens_upload_errors` con severidad WARNING, y continúa el pipeline.
- **And** si el RFC emisor o receptor están ausentes, el CFDI se rechaza completamente (no se inserta en `invoices`) y se registra error CRITICAL en `lens_upload_errors`, ya que sin RFC la factura no es atribuible a ninguna entidad fiscal.
- **And** el campo `forma_pago` se normaliza contra el catálogo oficial del SAT (`c_FormaPago`) almacenado en la tabla de referencia `sat_catalogos`; códigos no reconocidos generan alerta de actualización de catálogo.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.01 (Ingesta y calidad de CFDIs en LENS), HU-04.01 (Esquema DDL con columna invoice_hash UNIQUE)
- Regla de negocio: RN-014 — El `invoice_hash` (SHA-256 del XML original) es el identificador canónico de singularidad de un CFDI en todo el sistema. El `uuid` es secundario y puede repetirse en casos de cancelación y re-emisión.
- La tabla `sat_catalogos` debe mantenerse actualizada con los catálogos oficiales del SAT (c_FormaPago, c_MetodoPago, c_TipoDeComprobante, c_Moneda, c_UsoCFDI). La actualización se realiza vía worker programado mensual.
- La extracción es sincrónica dentro del pipeline; el overhead de parsing XPath es bajo (~10ms por XML de 300 KB).

**Criterios de aceptación:**
1. La prueba `test_metadata_extraction.py` procesa 15 XMLs de prueba cubriendo todos los tipos de comprobante (I, E, T, N, P), métodos de pago (PUE, PPD), y monedas (MXN, USD); verifica que los 14 campos se extraen y normalizan correctamente contra los valores esperados.
2. XMLs con UUID ausente se marcan `metadata_complete = false` pero se insertan en `invoices`; XMLs sin RFC emisor se rechazan completamente y se registra error en `lens_upload_errors`.
3. NFR: La extracción de metadatos para un CFDI de 500 KB completa en ≤ 50ms P95; el procesamiento batch de 1,000 CFDis completa en ≤ 30 segundos con concurrencia de 4 workers.

**Impactos y consideraciones para negocio:**
- Los metadatos normalizados permiten búsquedas, filtros y agregaciones eficientes en el HUD (EP-13) sin parsear XMLs en cada consulta.
- El `invoice_hash` como identificador canónico garantiza que los motores de riesgo (EP-08) y PLD (EP-09) operen sobre un conjunto de facturas sin duplicados.
- La normalización de códigos SAT (forma de pago, método de pago) permite validaciones cruzadas automáticas en el motor de calidad (HU-07.07).

**Referencias y trazabilidad:**
- SAD: §10.2 — Carga LENS y normalización de metadatos; §11.2 — DDL invoices (columnas canónicas)
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §11.2.3 — Extracción y normalización de metadatos CFDI
- ADR: ADR-011 (Estrategia de deduplicación por invoice_hash), ADR-011
- Tablas afectadas: `invoices`, `lens_upload_errors`, `sat_catalogos`
- Flujo crítico SAD §10: §10.2 — Extracción de metadatos CFDI en pipeline LENS
- Stack canónico: Python 3.12, lxml, PostgreSQL 17, SQLAlchemy 2.0
- Referencia normativa: Anexo 20 RMF, catálogos c_Factura SAT

---

#### HU-07.07 — Motor de calidad de datos CFDI con flags dinámicos y scoring de integridad fiscal

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.7 (LENS), SAD §11.2 (DDL invoices)
**Historia:** Como Analista Fiscal, quiero que el sistema asigne automáticamente flags de calidad a cada CFDI —xml_valid, amount_match, rfc_match, metadata_complete, duplicate_detected— y calcule un score de integridad fiscal (0-100) basado en estos flags, para identificar facturas problemáticas que requieren revisión manual antes de ser consideradas en los cálculos de riesgo y PLD.

**Alcance:**
Motor de calidad en Python 3.12 que se ejecuta como último paso del pipeline de ingesta LENS (posterior a extracción de metadatos, HU-07.06) para cada CFDI individual. Calcula flags booleanos en la tabla `invoices`: (1) `xml_valid` — heredado de validación XSD (HU-07.05), (2) `amount_match` — verifica que subtotal + impuestos = total (con tolerancia de ±1 centavo), y que los montos extraídos son numéricamente consistentes, (3) `rfc_match` — verifica que emisor_rfc y receptor_rfc existen en `tax_profiles` del tenant actual (si no, flag=false indicando RFC externo no monitoreado), (4) `metadata_complete` — heredado de extracción (HU-07.06), (5) `duplicate_detected` — verifica contra `invoices` existentes por invoice_hash (UNIQUE) y uuid (con lógica de cancelación: si mismo uuid pero distinto invoice_hash, es cancelación/re-emisión, no duplicado). Además calcula `integrity_score` (0-100) como promedio ponderado de los flags: xml_valid (30%), amount_match (25%), rfc_match (20%), metadata_complete (15%), !duplicate_detected (10%). Las facturas con `integrity_score < 60` generan una alerta de calidad (severidad WARNING) para revisión del Analista Fiscal. Los flags y scores son recalculables bajo demanda (`POST /api/v1/lens/recalculate-quality/{invoice_hash}`).

**Historia en formato Given/When/Then:**
- **Given** que un CFDI ha pasado validación XSD (xml_valid=true), extracción de metadatos (metadata_complete=true, emisor_rfc pertenece a tax_profile del tenant, total=1000.00), y no existe otro CFDI con el mismo invoice_hash en `invoices`.
- **When** el motor de calidad procesa este CFDI.
- **Then** el sistema verifica amount_match: subtotal + impuestos_trasladados - impuestos_retenidos = total con tolerancia de ±0.01; si la suma cuadra, flag=true.
- **And** verifica rfc_match: emisor_rfc y receptor_rfc existen en `tax_profiles` del tenant (RLS); si al menos uno coincide (factura vinculada al tenant), flag=true.
- **And** verifica duplicate_detected: consulta por invoice_hash (UNIQUE, siempre false en inserción nueva) y por uuid con lógica de cancelación; si no hay conflicto, flag=false (no duplicado).
- **And** calcula integrity_score: 30 + 25 + 20 + 15 + 10 = 100. El score se persiste en `invoices.integrity_score` y los flags en sus respectivas columnas booleanas.
- **And** si integrity_score < 60, se dispara evento de alerta de calidad en `alert_log` con tipo=QUALITY_FLAG, severity=WARNING, invoice_hash, y breakdown de flags fallidos para revisión del Analista.
- **And** el endpoint `POST /api/v1/lens/recalculate-quality/{invoice_hash}` permite recalcular flags y score bajo demanda (útil tras corrección manual de metadatos o tras actualización de tax_profiles que afecte rfc_match).
- **And** el motor registra en `cfdi_quality_log` cada ejecución con: invoice_hash, flags aplicados, score anterior (si recalculación), score nuevo, y timestamp.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.01 (Ingesta y calidad CFDIs LENS), HU-07.06 (Extracción de metadatos), HU-04.01 (DDL invoices con columnas de flags y score)
- Regla de negocio: RN-015 — Las facturas con integrity_score < 60 se excluyen automáticamente de los cálculos de RiskGauge (EP-08) y PLD (EP-09) hasta que sean revisadas y aprobadas por un Analista Fiscal (transición manual flag_approved = true).
- Los pesos de los flags en el integrity_score son configurables a nivel tenant en `tenant_config.quality_weights` (JSON). La modificación requiere permiso de tenant_admin y se audita.
- La detección de cancelación/re-emisión (mismo uuid, distinto invoice_hash) no es un flag de calidad negativo; se registra en `cfdi_version_chain` para trazabilidad del ciclo de vida del CFDI.

**Criterios de aceptación:**
1. La prueba `test_quality_flags.py` procesa 8 CFDis con combinaciones variadas de flags: 2 con score 100, 2 con score 85 (rfc_match=false), 2 con score 55 (amount_match=false + rfc_match=false), y 2 con score 30 (xml_valid=false + metadata_complete=false). Todos los flags y scores se calculan correctamente según pesos configurados.
2. La prueba `test_quality_scoring.py` modifica los pesos vía `tenant_config` y recalcula un CFDI con `POST /api/v1/lens/recalculate-quality/{invoice_hash}`; verifica que el score cambia acorde a los nuevos pesos y el cambio se audita.
3. NFR: El cálculo de calidad para un CFDI completa en ≤ 30ms P95; el endpoint de recalculación responde en ≤ 200ms. Las facturas con score < 60 generan alerta en ≤ 5 segundos tras la ingesta (vía Celery callback).

**Impactos y consideraciones para negocio:**
- Automatiza la clasificación de calidad de CFDIs, permitiendo al Analista Fiscal enfocarse solo en las facturas problemáticas (score < 60) en lugar de revisar el 100% de las ingestiones.
- La exclusión automática de facturas de baja calidad de RiskGauge y PLD previene falsos positivos y distorsiones en los scores de riesgo que podrían desencadenar reportes pre-UIF innecesarios.
- La recalculación bajo demanda permite refinamiento iterativo de los pesos de calidad por despacho según su perfil de riesgo y tipos de facturación más comunes.

**Referencias y trazabilidad:**
- SAD: §10.2 — Carga LENS y calidad CFDI; §11.2 — DDL invoices (flags y score)
- SAD-Lite: §10 — Flujos de ingesta
- Developer Handbook: §11.2.4 — Motor de calidad CFDI
- ADR: ADR-011 (Estrategia de deduplicación), ADR-011
- Tablas afectadas: `invoices` (columnas xml_valid, amount_match, rfc_match, metadata_complete, duplicate_detected, integrity_score, flag_approved), `cfdi_quality_log`, `alert_log`, `tenant_config`, `tax_profiles`
- Flujo crítico SAD §10: §10.2 — Scoring de calidad CFDI en pipeline LENS
- Stack canónico: Python 3.12, PostgreSQL 17, Celery

---

#### HU-07.08 — Merge inteligente Belvo + LENS sin duplicados con resolución de conflictos por timestamp

**Épica:** EP-07 — LENS, Parsing y Calidad CFDI
**Módulo(s):** SAD §9.7 (LENS), SAD §10.4 (Reconciliación)
**Historia:** Como Contador Fiscal, quiero que el sistema unifique automáticamente las facturas provenientes de Belvo y LENS en una sola vista consolidada por tax_profile, resolviendo duplicados con un merge inteligente que preserve los metadatos más completos y recientes de cada fuente, para tener una única fuente de verdad fiscal sin inconsistencias ni duplicados.

**Alcance:**
Worker Celery en Python 3.12 que ejecuta el merge Belvo+LENS para un tax_profile bajo demanda, al finalizar una sincronización delta de Belvo (HU-06.07), o al completar una carga masiva LENS (HU-07.04). El algoritmo: (1) consulta todas las facturas del tax_profile en `invoices` agrupadas por invoice_hash (índice UNIQUE), identificando aquellas con múltiples orígenes (source=belvo y source=lens para mismo invoice_hash), (2) para cada factura duplicada, aplica estrategia de resolución: selecciona la versión con mayor integrity_score (HU-07.07); a igual score, selecciona la más reciente por `fecha_certificacion` o `ingested_at`; (3) fusiona metadatos complementarios: si Belvo tiene `forma_pago` y LENS no, se copia el valor al registro ganador; (4) la versión perdedora se marca como `merged_into = {invoice_hash_ganador}` y `is_merged = true`; (5) el registro ganador actualiza `merged_from = [lista de invoice_hash absorbidos]` y `source = merged`; (6) se registra cada merge en `merge_log` con: invoice_hash_ganador, invoice_hash_perdedor, criterio de resolución, timestamp, y usuario/worker que ejecutó el merge. El merge respeta RLS (solo facturas del tenant). El endpoint `POST /api/v1/lens/merge/{tax_profile_id}` ejecuta el merge bajo demanda con opción `dry_run=true` para previsualizar resultados sin aplicar cambios.

**Historia en formato Given/When/Then:**
- **Given** que Belvo ha entregado la factura "inv_hash_A" (source=belvo, integrity_score=95, forma_pago="01", fecha_certificacion=2026-05-20T10:00:00Z) y LENS ha procesado la misma factura "inv_hash_A" (source=lens, integrity_score=85, forma_pago=NULL, fecha_certificacion=2026-05-20T09:00:00Z).
- **When** se ejecuta el merge Belvo+LENS para el tax_profile.
- **Then** el sistema detecta que "inv_hash_A" existe dos veces, compara integrity_score (95 > 85), y selecciona la versión de Belvo como ganadora.
- **And** la versión de LENS se marca como `is_merged = true`, `merged_into = "inv_hash_A"` (perdedora), y la versión de Belvo (ganadora) actualiza `merged_from = ["inv_hash_A_lens"]` y `source = "merged"`.
- **And** el campo `forma_pago="01"` de Belvo se preserva en el registro ganador; si LENS tuviera un campo que Belvo no tiene (p.ej., `metodo_pago="PUE"`), se fusiona también.
- **And** si ambas versiones tienen el mismo integrity_score (p.ej., 100 ambas), el criterio de desempate es `fecha_certificacion` más reciente; si aún hay empate, gana Belvo por precedencia (fuente oficial SAT vs carga manual).
- **And** se registra el merge en `merge_log` con ambos invoice_hash, criterio aplicado ("integrity_score"), timestamp, y resultado.
- **And** el modo `dry_run=true` del endpoint devuelve la lista de merges que se aplicarían sin modificar la base de datos, permitiendo al Contador revisar y aprobar antes de ejecutar.
- **And** tras el merge, los queries al HUD y motores de riesgo solo ven el registro ganador (filtro `WHERE is_merged = false` en todas las queries RLS), garantizando una única fuente de verdad.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.02 (Deduplicación CFDI en caliente Belvo-LENS), HU-06.01 (Ingesta Belvo), HU-07.01 (Ingesta LENS), HU-07.07 (Motor de calidad)
- Regla de negocio: RN-016 — Toda factura en `invoices` con `is_merged = false` debe ser única por invoice_hash. El merge es la última línea de defensa contra duplicados tras la deduplicación en caliente (HU-07.02).
- El merge es idempotente: ejecutarlo dos veces seguidas sin cambios en los datos produce el mismo resultado (segunda ejecución no encuentra nuevos duplicados).
- Las facturas con `is_merged = true` no se eliminan físicamente (WORM compliance); permanecen en `invoices` para trazabilidad forense y auditoría.
- Los criterios de resolución son configurables a nivel tenant en `tenant_config.merge_strategy` (JSON): orden de precedencia de fuentes, pesos de desempate.

**Criterios de aceptación:**
1. La prueba `test_merge_belvo_lens.py` crea 10 facturas duplicadas (mismo invoice_hash, distinto source) con diferentes integrity_scores, fechas de certificación, y combinaciones de metadatos; ejecuta el merge y verifica que: (a) el ganador tiene integrity_score más alto o fecha más reciente, (b) metadatos complementarios se fusionan correctamente, (c) perdedores se marcan is_merged=true, (d) merge_log contiene 10 entradas con criterios correctos.
2. El modo dry_run devuelve exactamente los mismos merges propuestos que luego aplica el modo real, sin modificar datos.
3. NFR: El merge de 50,000 facturas con 2% de duplicados (1,000 merges) completa en ≤ 30 segundos con índices sobre `(tax_profile_id, invoice_hash, is_merged)`; el endpoint de previsualización dry_run responde en ≤ 10 segundos.

**Impactos y consideraciones para negocio:**
- Consolida Belvo y LENS en una única fuente de verdad fiscal, eliminando inconsistencias que podrían causar doble contabilización en RiskGauge y falsos positivos en PLD.
- La preservación de registros perdedores (soft-delete lógico) cumple con los requisitos WORM de auditoría (EP-11), manteniendo trazabilidad completa del ciclo de vida del dato.
- La capacidad de dry_run permite al Contador Fiscal validar el merge antes de aplicarlo, reduciendo riesgos operativos en merges masivos.

**Referencias y trazabilidad:**
- SAD: §10.4 — Reconciliación y merge Belvo-LENS; §11.2 — DDL invoices (columnas is_merged, merged_into, merged_from, source)
- SAD-Lite: §10 — Flujos de ingesta y reconciliación
- Developer Handbook: §11.2.5 — Merge inteligente multi-fuente
- ADR: ADR-011 (Estrategia de deduplicación y merge), ADR-011
- Tablas afectadas: `invoices`, `merge_log`, `tenant_config`, `audit_logs`
- Flujo crítico SAD §10: §10.4 — Merge multi-fuente Belvo + LENS sin duplicados
- Stack canónico: Python 3.12, Celery con Redis, PostgreSQL 17, SQLAlchemy 2.0

---

### 5.8 EP-08 — Riesgo Matemático y Versionado

#### HU-08.01 — RiskGauge por Perfil Fiscal: Score Consolidado 0-100 con HHI, Alertas y PLD

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** SAD §9.4, SAD §17.3
**Historia:** Como Oficial de Cumplimiento de un despacho contable, quiero disponer de un score de riesgo fiscal consolidado de 0 a 100 para cada tax_profile bajo mi gestión, calculado matemáticamente combinando el índice de concentración HHI (Herfindahl-Hirschman) de proveedores, la detección de outliers en montos de facturación mediante IQR y Z-Score compuesto, y la densidad de alertas PLD y 69-B activas, para priorizar mis recursos de auditoría hacia los contribuyentes con mayor exposición fiscal y anticipar contingencias antes de que el SAT las detecte.

**Alcance:**
Backend (Core FastAPI + Workers Celery para recálculo programado + Redis para caching). Cubre el cálculo del score RiskGauge con pesos configurables por tenant, la agregación de sub-scores (HHI, IQR, Z-Score, densidad PLD, severidad 69-B), la persistencia del score en `risk_scores` con timestamp y versión de reglas, y la exposición vía API REST con filtros por tax_profile, periodo fiscal y criticidad.

**Historia en formato Given/When/Then:**
- **Given** el perfil fiscal del RFC `ABC123456XYZ` tiene 500 facturas en el periodo 2026-Q1, con un HHI de proveedores de 0.35 (concentración moderada), un Z-Score de 2.8 en los montos de las últimas 30 facturas respecto a su media histórica (outlier moderado), y 2 alertas PLD activas por operaciones relevantes cercanas al umbral de 1,500 UMA.
- **When** se ejecuta el recálculo programado de RiskGauge (`celery beat` cada 6 horas) o se invoca manualmente vía `POST /api/riskgauge/calculate/{tax_profile_id}`.
- **Then** el sistema calcula el score consolidado como la suma ponderada de sub-scores: `RiskGauge = w1*HHI_norm + w2*IQR_outlier + w3*Z_Score_norm + w4*PLD_density + w5*69B_severity`, normalizando cada componente a [0, 100] y aplicando los pesos por defecto del tenant (configurables vía HU-10.01).
- **And** el score resultante (ej: 68/100 — riesgo alto) se persiste en `risk_scores` con versión de reglas, timestamp de cálculo, y los sub-scores individuales para trazabilidad.
- **And** si el score supera el umbral de criticidad A configurado para el tenant (>= 75), se genera automáticamente una alerta de tipo `risk_score_critical` vinculada al tax_profile.
- **And** el score se expone en el endpoint `GET /api/riskgauge/{tax_profile_id}?period=2026-Q1` con desglose completo de sub-scores y comparativa MoM y YoY.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.02 (Deduplicación CFDI en caliente con SHA-256 entre Belvo y LENS), HU-07.08 (Merge inteligente Belvo + LENS sin duplicados con resolución de conflictos por timestamp).
- El cálculo de HHI (Herfindahl-Hirschman Index) se realiza sobre los montos totales por RFC proveedor en el periodo fiscal: `HHI = sum(s_i)^2` donde s_i es la participación porcentual del proveedor i sobre el total facturado. Un HHI > 0.25 indica concentración alta.
- La detección de outliers IQR usa el rango intercuartílico de los montos de factura del periodo: un monto es outlier si está fuera de [Q1 - 1.5*IQR, Q3 + 1.5*IQR]. El sub-score IQR mide la proporción de facturas outlier sobre el total.
- El Z-Score compuesto usa la media y desviación estándar de los montos en ventana móvil de 12 meses: `Z = (monto_actual - mu_12m) / sigma_12m`. Se considera significativo si |Z| > 2.
- La densidad PLD mide el número de alertas PLD activas en el periodo normalizado por el total de facturas.
- Los pesos por defecto son: w1=0.25, w2=0.20, w3=0.20, w4=0.20, w5=0.15. Configurables por tenant desde HU-10.01.
- El recálculo se ejecuta automáticamente cada 6 horas y también bajo demanda. Se cachea en Redis con TTL de 1 hora.
- Si un perfil fiscal tiene menos de 10 facturas en el periodo, se aplica un factor de incertidumbre que reduce la confianza del score (se marca como `confidence = 'low'`).

**Criterios de aceptación:**
1. El score RiskGauge se calcula correctamente para un perfil fiscal con 500+ facturas, mostrando desglose de HHI, IQR, Z-Score, densidad PLD y severidad 69-B con precisión decimal de 2 posiciones.
2. Una variación artificial del 200% en los montos de las últimas 5 facturas de un perfil dispara un incremento del Z-Score y se refleja en el score consolidado, generando una alerta si supera el umbral de criticidad A.
3. La API de RiskGauge responde en menos de 300 ms para perfiles con hasta 10,000 facturas gracias al caching en Redis y los índices B-Tree en `invoices`.
4. Pruebas automatizadas (`test_riskgauge.py`, `test_risk_analysis.py`) cubren: cálculo feliz con datos sintéticos conocidos, perfil sin facturas suficientes (confidence low), verificación de pesos configurables, y generación de alerta por score crítico.
5. El motor de recálculo programado procesa 500 perfiles fiscales en menos de 10 minutos sin saturar la base de datos.

**Impactos y consideraciones para negocio:**
- Permite al Oficial de Cumplimiento priorizar proactivamente los RFCs de mayor riesgo en lugar de revisar manualmente cientos de contribuyentes.
- La combinación de múltiples métricas matemáticas (HHI + IQR + Z-Score) produce un score más robusto que cualquier métrica individual, reduciendo falsos positivos.
- La alerta automática por score crítico asegura que ningún perfil de alto riesgo pase desapercibido entre recálculos manuales.
- Facilita la defensa fiscal activa: un score bajo y estable es evidencia de cumplimiento que el despacho puede presentar ante el SAT en caso de auditoría.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático y Versionado, §17.3 — Modelo de scoring de riesgo fiscal RiskGauge
- SAD-Lite: §5 — Motor Analítico de Riesgo Fiscal (RiskGauge)
- Developer Handbook: §4.1 — Algoritmo de cálculo RiskGauge: HHI, IQR, Z-Score y pesos dinámicos
- ADR: ADR-013
- Tablas afectadas: `risk_scores`, `invoices`, `tax_profiles`, `alerts`
- Flujo crítico SAD §10: §10.5 — Cálculo y consulta de riesgo fiscal RiskGauge por perfil

---

#### HU-08.02 — Configuración del Calendario Fiscal y Ajustes IQR Estacionales por Periodo

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** SAD §9.4, SAD §17.3
**Historia:** Como Oficial de Cumplimiento, quiero que el motor RiskGauge ajuste automáticamente la sensibilidad de sus umbrales de detección de outliers (IQR y Z-Score) según el calendario fiscal oficial del SAT y la estacionalidad histórica de cada tax_profile, para evitar falsos positivos masivos durante periodos de alta actividad fiscal legítima (cierres bimestrales, declaraciones anuales, periodos de aguinaldos) donde los volúmenes y montos de facturación se disparan por razones estacionales predecibles y no por actividad sospechosa.

**Alcance:**
Backend (Core FastAPI + Workers Celery). Cubre la definición y carga del calendario fiscal SAT (periodos de declaración, cierres, puentes fiscales) en la tabla `fiscal_calendar`, el cálculo de factores IQR estacionales por tax_profile basado en su historial de 3 años, la aplicación de multiplicadores de sensibilidad durante el recálculo de RiskGauge, y la API de configuración y consulta del calendario fiscal.

**Historia en formato Given/When/Then:**
- **Given** el calendario fiscal 2026 está cargado en `fiscal_calendar` con los periodos de cierre bimestral (enero-febrero declaración en marzo), declaración anual (abril), y periodos de aguinaldo (diciembre), y el tax_profile del RFC `XYZ789` tiene un factor IQR estacional de 2.5x para el mes de abril basado en su historial de 2023-2025.
- **When** se ejecuta el recálculo de RiskGauge para el periodo abril 2026 y el sistema detecta que la fecha actual cae dentro de un `fiscal_event_type = 'declaracion_anual'` en el calendario.
- **Then** el motor multiplica el umbral IQR estándar (1.5) por el factor estacional del tax_profile (2.5x), resultando en un umbral efectivo de 3.75, y multiplica el umbral Z-Score (2.0) por el mismo factor, resultando en 5.0.
- **And** facturas que en un mes normal serían outliers quedan dentro del rango ajustado, reduciendo la generación de falsos positivos de riesgo durante la temporada fiscal alta.
- **And** el score RiskGauge se calcula normalmente con los umbrales ajustados, y los sub-scores IQR y Z-Score reflejan explícitamente que se aplicaron factores estacionales (campo `seasonal_adjustment_applied = true` en `risk_scores`).
- **And** un administrador puede consultar y modificar el calendario fiscal vía `GET/PUT /api/fiscal-calendar/{tenant_id}`, y los factores estacionales se recalculan automáticamente cada año con los datos del año fiscal cerrado.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge por perfil fiscal: score consolidado 0-100 con HHI, alertas y PLD).
- El calendario fiscal se carga desde una definición estática compartida para todos los tenants (eventos SAT universales) con posibilidad de extender con eventos específicos del tenant (ej: periodos de auditoría interna, cierres contables internos).
- Tipos de eventos fiscales: `declaracion_bimestral`, `declaracion_anual`, `aguinaldo`, `cierre_fiscal`, `puente_fiscal`, `custom_tenant_event`.
- El factor IQR estacional por tax_profile se calcula como: `factor_mes = mediana(montos_mes) / mediana(montos_anual)`, usando 3 años de historial, con un floor de 1.0 y un cap de 5.0 para evitar ajustes extremos.
- Si un tax_profile no tiene historial suficiente para calcular factores estacionales (menos de 2 años), se aplica un factor poblacional basado en el sector económico (cargado desde tabla `sector_seasonality`).
- Los umbrales ajustados nunca pueden ser más estrictos que los valores base (el factor estacional solo relaja, no endurece).
- La aplicación de ajustes estacionales es optativa por tenant (`tax_profiles.use_seasonal_adjustment`), activada por defecto.

**Criterios de aceptación:**
1. Durante el periodo de declaración anual de abril, un tax_profile con factor estacional 2.5x reduce sus alertas de riesgo por outliers en al menos un 60% respecto al cálculo sin ajuste estacional, sin perder detección de anomalías reales (facturas 5x por encima del umbral ajustado).
2. El campo `seasonal_adjustment_applied` en `risk_scores` permite auditar qué cálculos usaron factores estacionales y con qué multiplicador.
3. La API de calendario fiscal permite CRUD completo de eventos con validación de fechas (no solapamiento de eventos del mismo tipo) y los cambios se reflejan en el siguiente recálculo de RiskGauge.
4. Pruebas automatizadas (`test_calendar_iqr.py`, `test_seasonal_sensitivity.py`) cubren: cálculo con ajuste estacional activo vs inactivo, perfil sin historial suficiente usando factor sectorial, evento fiscal solapado rechazado, y regresión: un outlier real (monto 10x la mediana) sigue siendo detectado incluso con ajuste estacional.
5. El recálculo de factores estacionales anual para 500 tax_profiles se completa en menos de 5 minutos.

**Impactos y consideraciones para negocio:**
- Reduce drásticamente la fatiga de alertas del Oficial de Cumplimiento durante temporadas fiscales altas, donde sin ajuste estacional el sistema generaría cientos de falsos positivos por el incremento natural de facturación.
- La calibración automática por tax_profile evita que el despacho tenga que ajustar manualmente umbrales para cada cliente antes de cada cierre fiscal.
- La trazabilidad del ajuste estacional en `risk_scores` demuestra ante una auditoría que el sistema aplica criterios objetivos y no arbitrarios para la relajación de umbrales.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático y Versionado, §17.3 — Modelo de scoring de riesgo fiscal RiskGauge
- SAD-Lite: §5 — Motor Analítico de Riesgo Fiscal (RiskGauge)
- Developer Handbook: §4.2 — Calendario fiscal y ajustes estacionales de sensibilidad IQR/Z-Score
- ADR: ADR-013
- Tablas afectadas: `fiscal_calendar`, `risk_scores`, `tax_profiles`
- Flujo crítico SAD §10: §10.5 — Cálculo y consulta de riesgo fiscal RiskGauge por perfil

---

#### HU-08.03 — Versionado de risk_rules y pld_rules con Auditoría de Cambios y Rollback

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** SAD §9.4, SAD §17.3, SAD §17.5
**Historia:** Como Oficial de Cumplimiento y administrador de riesgo del despacho, quiero que cada modificación a las reglas de cálculo de riesgo fiscal (`risk_rules`) y a las reglas de detección PLD (`pld_rules`) quede versionada con un historial completo de quién cambió qué, cuándo y por qué, con la capacidad de restaurar cualquier versión anterior (rollback), para garantizar la auditabilidad regulatoria de los criterios de riesgo aplicados a cada contribuyente y poder demostrar ante el SAT o la UIF que los umbrales de alertamiento no fueron alterados retroactivamente para ocultar operaciones sospechosas.

**Alcance:**
Backend (Core FastAPI). Cubre el modelo de versionado semántico de reglas con número de versión autoincremental, la persistencia del historial completo de cambios en las tablas `risk_rules` y `pld_rules` con campo `version` y `active_from`/`active_until`, la API de consulta de historial con diff entre versiones, y el mecanismo de rollback administrativo protegido por co-firma (doble autorización).

**Historia en formato Given/When/Then:**
- **Given** las reglas de riesgo están en la versión `v3` con umbral HHI = 0.25, IQR = 1.5, Z-Score = 2.0, y pesos [0.25, 0.20, 0.20, 0.20, 0.15], y el Oficial de Cumplimiento decide endurecer los criterios tras una auditoría interna, cambiando el umbral HHI a 0.20 y Z-Score a 1.8.
- **When** el Oficial de Cumplimiento modifica las reglas vía `PUT /api/rules/risk` con el nuevo payload y una justificación obligatoria ("Endurecimiento post-auditoría Q1-2026").
- **Then** el sistema crea una nueva versión `v4` de `risk_rules` con `active_from = NOW()`, desactiva la versión `v3` estableciendo `active_until = NOW()`, y registra en `audit_logs` el cambio con `event_type = 'risk_rule_versioned'`, detallando `version_old`, `version_new`, `changed_fields`, `justification` y `user_id`.
- **And** todos los recálculos de RiskGauge a partir de este momento usan la versión `v4`, y los scores calculados previamente conservan su referencia a la versión de reglas con la que fueron generados (`risk_scores.rule_version`).
- **And** si 48 horas después se detecta un exceso de falsos positivos, el Oficial de Cumplimiento y un segundo analista con rol `compliance_officer` pueden co-firmar un rollback a `v3` vía `POST /api/rules/risk/rollback`, restaurando los umbrales anteriores y creando la versión `v5` (que es una copia de `v3` con timestamp actualizado).
- **And** el endpoint `GET /api/rules/risk/history` devuelve el historial completo de versiones con diff resaltado entre versiones consecutivas.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge por perfil fiscal: score consolidado 0-100 con HHI, alertas y PLD).
- Versionado semántico de reglas: `{major}.{minor}` donde major cambia con modificaciones de umbrales o pesos, minor con ajustes de parámetros no estructurales. El sistema autoincrementa según la magnitud del cambio.
- Toda modificación de reglas requiere justificación obligatoria (mínimo 20 caracteres) que se almacena en el registro de versión.
- El rollback requiere co-firma de dos usuarios con rol `compliance_officer` o superior (doble autenticación), registrando ambas identidades en `audit_logs`.
- Las reglas activas son siempre la versión con `active_from` más reciente y `active_until IS NULL`. Solo puede haber una versión activa por tenant en un momento dado.
- Los scores históricos en `risk_scores` conservan `rule_version` para trazabilidad: una consulta de auditoría puede determinar exactamente qué reglas produjeron cada score.
- Las reglas PLD (`pld_rules`) siguen el mismo mecanismo de versionado pero con su propio linaje independiente.
- No se permite eliminar versiones de reglas (soft delete o hard delete). El historial es inmutable.

**Criterios de aceptación:**
1. Una modificación de umbral HHI de 0.25 a 0.20 genera una nueva versión `v4`, desactiva `v3`, y el siguiente recálculo de RiskGauge usa `v4` y lo registra en `risk_scores.rule_version`.
2. El endpoint `GET /api/rules/risk/history` devuelve todas las versiones con timestamp, autor, justificación, campos modificados y diff en formato JSON Patch (RFC 6902).
3. Un rollback a `v3` requiere co-firma de dos compliance officers y crea `v5` como copia restaurada con nuevo timestamp; el intento de rollback con un solo firmante es rechazado con HTTP 403.
4. Pruebas automatizadas (`test_rules_version.py`, `test_version_audit.py`) cubren: creación de nueva versión con justificación, rollback con co-firma exitoso, rollback rechazado por falta de segundo firmante, consulta de historial con diff, e integridad referencial: scores antiguos referencian su `rule_version` original aunque la regla ya no esté activa.
5. La latencia de consulta del historial de versiones para un tenant con hasta 200 versiones de reglas no supera los 500 ms.

**Impactos y consideraciones para negocio:**
- Cumplimiento regulatorio directo con LFPIORPI y disposiciones de la UIF: los criterios de detección de operaciones sospechosas deben ser auditables y no modificables retroactivamente.
- Ante una auditoría del SAT o la UIF, el despacho puede demostrar con trazabilidad completa qué reglas de riesgo estaban vigentes en cada fecha y quién las modificó.
- El mecanismo de co-firma previene que un solo usuario malintencionado relaje los umbrales de detección para ocultar operaciones sospechosas de un cliente específico.
- La inmutabilidad del historial de reglas cumple con el principio WORM del SAD §11.8.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático y Versionado, §17.3 — Modelo de scoring de riesgo fiscal RiskGauge, §17.5 — Reglas PLD y parámetros de riesgo configurables
- SAD-Lite: §5 — Motor Analítico de Riesgo Fiscal (RiskGauge)
- Developer Handbook: §4.3 — Versionado de risk_rules y pld_rules con auditoría
- ADR: ADR-0009 — Gobernanza de parámetros FinOps, PLD y calendario fiscal por tenant, ADR-013
- Tablas afectadas: `risk_rules`, `pld_rules`, `risk_scores`, `audit_logs`
- Flujo crítico SAD §10: §10.5 — Cálculo y consulta de riesgo fiscal RiskGauge por perfil

---

#### HU-08.04 — Cálculo de HHI (Herfindahl-Hirschman) con Segmentación por Proveedor y Sector

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** Motor de Riesgo Matemático (SAD §9.4, SAD §17.3)
**Historia:** Como Oficial de Cumplimiento, quiero calcular el índice HHI de concentración económica por proveedor y sector para detectar dependencia excesiva de un solo contribuyente o giro comercial que pueda constituir riesgo de lavado de dinero o evasión fiscal.

**Alcance:** Backend Core Fiscal (Python 3.12), cálculo matemático sobre datos de `invoices` y `tax_profiles`.

**Historia en formato Given/When/Then:**
- **Given** un tax_profile tiene facturas registradas en el sistema con proveedores y sectores económicos clasificados.
- **When** se invoca el cálculo de HHI para un perfil fiscal y un periodo determinado.
- **Then** el motor debe calcular el índice HHI = Σ(market_share_i²) × 10,000 para cada segmento (proveedor y sector).
- **And** debe clasificar automáticamente el resultado: HHI < 1,500 (baja concentración), 1,500–2,500 (concentración moderada), > 2,500 (alta concentración).
- **And** debe persistir el score en `risk_events` con desglose por segmento y timestamp de cálculo.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge base), HU-07.02 (deduplicación), HU-07.08 (merge Belvo+LENS).
- El cálculo se segmenta obligatoriamente por proveedor (RFC emisor) y sector (código SCIAN/NAICS configurado en `tax_profiles`).
- La fórmula canónica es el índice Herfindahl-Hirschman normalizado: HHI = Σ(s_i²) × 10,000, donde s_i es la participación porcentual del proveedor/sector sobre el total de facturación del periodo.
- El motor debe soportar ventanas de cálculo configurables: mensual, trimestral, anual.
- Los resultados se almacenan en la tabla `risk_events` con tipo `hhi_provider` y `hhi_sector`.

**Criterios de aceptación:**
1. El cálculo de HHI para un perfil con 4 proveedores de participación 40%, 30%, 20%, 10% devuelve HHI = 3,000 (concentración alta) con precisión de ±1 punto.
2. El sistema clasifica correctamente al menos 100 perfiles de prueba con HHI conocido en menos de 30 segundos.
3. Los resultados de HHI quedan registrados en `audit_logs` con trazabilidad de los insumos (periodo, facturas consideradas, fecha de cálculo).
4. Cobertura de pruebas unitarias ≥ 75% para el módulo `hhi_calculator.py`.

**Impactos y consideraciones:**
- Permite al Oficial de Cumplimiento identificar concentraciones de riesgo que podrían ameritar debida diligencia ampliada según la LFPIORPI.
- El HHI elevado en un solo proveedor puede disparar automáticamente alertas PLD si se combina con otros indicadores (HU-08.05).

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático, §10.7 — Reportes de riesgo y exportación, §17.3 — RiskGauge y scoring compuesto
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §7.3 — Algoritmos de riesgo matemático
- ADR: ADR-0002 — Desacoplamiento de módulos de riesgo y PLD
- Tablas afectadas: `risk_events`, `invoices`, `tax_profiles`
- Flujo crítico SAD §10: §10.7 — Reportes y análisis de riesgo

---

#### HU-08.05 — Detección de Outliers Combinado: IQR + Z-Score con Pesos Dinámicos por Sector

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** Motor de Riesgo Matemático (SAD §9.4, SAD §17.3)
**Historia:** Como Analista de Cumplimiento, quiero que el sistema combine detección de outliers vía IQR estacional y Z-Score financiero con pesos ajustables por sector económico para identificar operaciones atípicas que escapen a un solo método estadístico y reduzcan falsos positivos.

**Alcance:** Backend Core Fiscal (Python 3.12), cálculo estadístico sobre serie histórica de facturación.

**Historia en formato Given/When/Then:**
- **Given** un tax_profile tiene historial de facturación mensual de al menos 6 periodos y el calendario fiscal IQR está configurado (HU-08.02).
- **When** se ejecuta la detección combinada de outliers para un periodo fiscal.
- **Then** el motor calcula el Z-Score = (X - μ) / σ para el monto total del periodo y el IQR estacional = |X - Q2| / (Q3 - Q1) ajustado por estacionalidad.
- **And** combina ambos scores con pesos configurables: score_combinado = w_z × |Z-Score_normalizado| + w_iqr × |IQR_normalizado|.
- **And** emite una alerta cuando el score combinado supera el umbral configurado por sector (default 2.5σ equivalente).
- **And** pondera dinámicamente los pesos por sector: sectores de alto riesgo (ej. construcción, comercio exterior) reciben w_iqr mayor; sectores estables (ej. servicios profesionales) reciben w_z mayor.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge), HU-08.02 (calendario fiscal IQR).
- El Z-Score utiliza media (μ) y desviación estándar (σ) calculadas sobre ventana móvil de 12 meses.
- El IQR estacional ajusta los cuartiles según el periodo fiscal (cierre anual, declaraciones bimestrales).
- Los pesos dinámicos por sector se configuran en `pld_rules` con versionado (HU-08.03).
- El umbral de alerta es configurable por `coverage_level` del `tax_profile`.
- Detección de outliers debe ejecutarse tanto en batch nocturno como on-demand por perfil.

**Criterios de aceptación:**
1. Una facturación 4σ por encima de la media del sector "construcción" dispara alerta con score combinado > umbral configurado en menos de 2 segundos de cómputo por perfil.
2. El sistema no genera alerta para una variación de 0.8σ en sector "servicios profesionales" con pesos default.
3. Los pesos por sector son configurables vía API y se versionan con auditoría de cambios.
4. El módulo `iqr_zscore_detector.py` tiene cobertura de pruebas ≥ 75% incluyendo casos borde (ventanas con menos de 6 periodos, sectores sin datos).

**Impactos y consideraciones:**
- Reduce la tasa de falsos positivos respecto al uso aislado de Z-Score o IQR al combinar ambos métodos con ponderación contextual.
- Requiere calibración inicial de pesos por sector, que debe ser revisada trimestralmente por el Oficial de Cumplimiento.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático, §17.3 — RiskGauge y scoring compuesto, §10.7 — Reportes de riesgo
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §7.3 — Algoritmos de riesgo matemático, §7.4 — Calendario fiscal e IQR estacional
- ADR: ADR-0002 — Desacoplamiento de módulos de riesgo y PLD
- Tablas afectadas: `risk_events`, `invoices`, `pld_rules`, `alerts`
- Flujo crítico SAD §10: §10.7 — Reportes y análisis de riesgo

---

#### HU-08.06 — Análisis de Tendencia Temporal de Riesgo con Series de Tiempo y Forecasting

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** Motor de Riesgo Matemático (SAD §9.4, SAD §17.3)
**Historia:** Como Oficial de Cumplimiento, quiero visualizar la tendencia temporal del riesgo fiscal de un contribuyente en ventanas de 6 y 12 meses con proyección (forecasting) para anticipar deterioros en el perfil de riesgo antes de que se materialicen en incumplimientos.

**Alcance:** Backend Core Fiscal + Frontend SPA (React 19, Vanilla CSS Liquid Glass).

**Historia en formato Given/When/Then:**
- **Given** un tax_profile cuenta con al menos 12 meses de datos de RiskGauge consolidados.
- **When** el analista solicita el análisis de tendencia temporal desde el HUD.
- **Then** el sistema calcula regresión lineal sobre los scores RiskGauge de los últimos 6 y 12 meses.
- **And** proyecta el score a 3 y 6 meses futuros usando el modelo de tendencia (forecasting simple).
- **And** renderiza un gráfico de línea temporal con banda de confianza al 95% y marcadores de eventos de riesgo (alertas disparadas, cambios de estatus 69-B).
- **And** clasifica la tendencia como "mejorando", "estable" o "deteriorándose" según la pendiente de la regresión.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge base con scores históricos).
- La ventana mínima para análisis de tendencia es de 6 periodos mensuales consecutivos.
- El forecasting utiliza regresión lineal simple; no se requieren modelos ARIMA/ML complejos en esta HU.
- La banda de confianza del 95% se calcula con el error estándar de la regresión.
- Los datos se sirven desde el endpoint `GET /api/v1/risk/{tax_profile_id}/trend` con parámetros `window=6|12` y `forecast=true|false`.
- La visualización en frontend usa Vanilla CSS Liquid Glass con gráficos SVG nativos (sin dependencia de librerías de charting pesadas).

**Criterios de aceptación:**
1. El endpoint de tendencia responde en menos de 1 segundo para perfiles con hasta 36 periodos de historial.
2. El gráfico de tendencia muestra correctamente la línea de regresión, banda de confianza y marcadores de eventos.
3. La clasificación de tendencia ("mejorando"/"estable"/"deteriorándose") coincide con el signo de la pendiente con p < 0.05.
4. Las pruebas del módulo `trend_analyzer.py` cubren ≥ 75% incluyendo perfiles con datos incompletos o lagunas.

**Impactos y consideraciones:**
- Permite al despacho contable anticipar problemas de cumplimiento y tomar acciones preventivas.
- La proyección forecasting es indicativa y no vinculante; debe mostrarse con el disclaimer legal correspondiente en la UI.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático, §17.3 — RiskGauge y scoring compuesto, §18.2 — Dashboard Tactical HUD
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §7.5 — Análisis de tendencia temporal
- ADR: ADR-0002 — Desacoplamiento de módulos de riesgo y PLD
- Tablas afectadas: `risk_events`, `alerts`, `invoices`
- Flujo crítico SAD §10: §10.7 — Reportes y análisis de riesgo

---

#### HU-08.07 — Simulación de Escenarios Fiscales: What-if Analysis con Parámetros Ajustables

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** Motor de Riesgo Matemático (SAD §9.4, SAD §17.3)
**Historia:** Como Oficial de Cumplimiento, quiero ejecutar simulaciones what-if modificando parámetros de riesgo (incremento de facturación, cambio de proveedores, variación de sector) para evaluar el impacto potencial sobre el RiskGauge y anticipar escenarios de riesgo antes de que ocurran.

**Alcance:** Backend Core Fiscal (Python 3.12), Frontend SPA con formulario de parámetros.

**Historia en formato Given/When/Then:**
- **Given** un tax_profile con RiskGauge calculado y datos históricos completos.
- **When** el analista configura un escenario con parámetros ajustables (ej. +30% facturación, +2 proveedores nuevos en sector "construcción", eliminación del proveedor principal).
- **Then** el sistema recalcula el RiskGauge, HHI, Z-Score e IQR sobre los datos simulados sin afectar los valores reales.
- **And** presenta una comparativa lado a lado: escenario actual vs. escenario simulado con delta numérico y semáforo (verde/amarillo/rojo).
- **And** guarda el escenario como "what-if scenario" con nombre, descripción y timestamp para consulta futura.
- **And** permite exportar la comparativa en PDF.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge), HU-08.05 (IQR+Z-Score combinado).
- Los escenarios se calculan en una transacción aislada; nunca modifican datos reales.
- Cada escenario se persiste en `risk_events` con tipo `whatif_scenario` vinculado al `tax_profile_id`.
- Parámetros ajustables mínimos: (a) % variación de facturación total, (b) adición/eliminación de proveedores, (c) cambio de sector de proveedor, (d) variación de frecuencia de operaciones.
- El usuario puede nombrar y describir cada escenario para trazabilidad.
- Límite de 20 escenarios guardados por perfil; los más antiguos se rotan automáticamente.
- El endpoint `POST /api/v1/risk/{tax_profile_id}/simulate` acepta el payload de parámetros y devuelve el delta comparativo.

**Criterios de aceptación:**
1. Una simulación con +50% de facturación en sector "comercio exterior" recalcula HHI, Z-Score y RiskGauge en menos de 5 segundos.
2. Los escenarios guardados son recuperables vía `GET /api/v1/risk/{tax_profile_id}/scenarios` con todos los parámetros y resultados.
3. La UI muestra la comparativa actual vs. simulado con diferencias numéricas y codificación de color correcta.
4. El módulo `scenario_simulator.py` tiene cobertura ≥ 75% y prueba de aislamiento (datos reales no modificados tras simulación).

**Impactos y consideraciones:**
- Herramienta de alto valor para el Oficial de Cumplimiento en la toma de decisiones estratégicas y defensa ante auditorías.
- Puede ser computacionalmente costosa; se recomienda ejecutar simulaciones bajo demanda, no en batch.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático, §17.3 — RiskGauge y scoring compuesto, §10.7 — Reportes de riesgo
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §7.6 — Simulación de escenarios fiscales
- ADR: ADR-0002 — Desacoplamiento de módulos de riesgo y PLD
- Tablas afectadas: `risk_events`, `tax_profiles`, `invoices`
- Flujo crítico SAD §10: §10.7 — Reportes y análisis de riesgo

---

#### HU-08.08 — Exportación de Reportes de Riesgo en PDF/Excel con Branding del Despacho

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** Motor de Riesgo Matemático (SAD §9.4), Vault y Exportación (SAD §11.8)
**Historia:** Como Oficial de Cumplimiento, quiero exportar reportes completos de riesgo fiscal (RiskGauge, HHI, outliers, tendencias) en formatos PDF y Excel con el logotipo y branding del despacho para presentar evidencia documental a autoridades regulatorias y comités internos.

**Alcance:** Backend Core Fiscal (Python 3.12, generación de documentos), Frontend SPA con previsualización.

**Historia en formato Given/When/Then:**
- **Given** un tax_profile tiene RiskGauge calculado y datos de riesgo consolidados (HHI, Z-Score, IQR, tendencias).
- **When** el analista solicita la exportación de reporte de riesgo desde el HUD.
- **Then** el sistema genera un documento PDF con: portada con branding del despacho, resumen ejecutivo con semáforo RiskGauge, sección de concentración HHI, sección de outliers detectados, gráfico de tendencia temporal, y disclaimer legal.
- **And** genera un archivo Excel complementario con los datos tabulares crudos (facturas atípicas, scores por periodo, detalle de proveedores).
- **And** registra la exportación en `audit_logs` con usuario, timestamp, perfil exportado y hash SHA-256 del documento generado.
- **And** permite descarga directa o envío por correo electrónico (integrado con HU-10.03).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge), HU-08.04 (HHI), HU-08.05 (outliers), HU-08.06 (tendencia).
- El PDF se genera con ReportLab (Python 3.12) usando plantilla estandarizada con slots para logotipo del despacho (configurado en `tenant_config`).
- El Excel se genera con openpyxl, con pestañas separadas por sección del reporte.
- El branding (logotipo, colores corporativos, nombre del despacho) se toma de la configuración del tenant (HU-03.05).
- La exportación debe completarse en menos de 30 segundos para perfiles con hasta 10,000 facturas.
- Cada exportación queda registrada en `audit_logs` con tipo `risk_report_export` y hash criptográfico del archivo.

**Criterios de aceptación:**
1. El PDF generado contiene todas las secciones obligatorias (portada, resumen, HHI, outliers, tendencia, disclaimer) con formato profesional.
2. El Excel contiene los datos crudos correctos y consistentes con el PDF resumen.
3. El logotipo del despacho aparece correctamente en la portada del PDF tomado de la configuración del tenant.
4. La exportación de un perfil con 5,000 facturas se completa en menos de 20 segundos.

**Impactos y consideraciones:**
- Facilita la rendición de cuentas ante auditorías del SAT, UIF y comités de compliance corporativo.
- El branding por despacho requiere que la configuración de tenant esté completa antes de esta HU.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático, §10.7 — Reportes de riesgo y exportación, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §7.7 — Exportación de reportes PDF/Excel
- ADR: ADR-0002 — Desacoplamiento de módulos de riesgo y PLD, ADR-0008 — Trazabilidad y no repudio
- Tablas afectadas: `risk_events`, `audit_logs`, `tenant_config`
- Flujo crítico SAD §10: §10.7 — Reportes y análisis de riesgo

---

#### HU-08.09 — Caching Inteligente de Scores de Riesgo en Redis con Invalidación Reactiva

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** Motor de Riesgo Matemático (SAD §9.4, SAD §17.3)
**Historia:** Como Arquitecto de Plataforma, quiero implementar una capa de caché en Redis para los scores de riesgo (RiskGauge, HHI, Z-Score) con invalidación reactiva cuando ingresan nuevas facturas o se modifican reglas, para reducir la latencia de consulta en el HUD de menos de 200ms sin comprometer la frescura de los datos de riesgo.

**Alcance:** Backend Core Fiscal (Python 3.12, Redis 7.x como cache layer).

**Historia en formato Given/When/Then:**
- **Given** un tax_profile tiene scores de riesgo precalculados y almacenados en PostgreSQL.
- **When** el HUD solicita los scores de riesgo vía API.
- **Then** el sistema verifica primero Redis; si existe entrada vigente (TTL no expirado), la retorna directamente sin tocar PostgreSQL.
- **And** si no existe en caché o expiró, calcula/recalcula desde PostgreSQL, almacena en Redis con TTL de 1 hora, y retorna.
- **And** cuando se ingieren nuevas facturas (HU-06.01/HU-07.01) o se versionan reglas (HU-08.03), se publica un evento de invalidación que elimina selectivamente las claves de caché del perfil afectado.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge operativo).
- Estructura de clave en Redis: `risk:{tenant_id}:{tax_profile_id}:{score_type}` (ej. `risk:uuid1:uuid2:riskgauge`).
- TTL default de 1 hora para scores de riesgo; configurable por tenant en `tenant_config`.
- Invalidación reactiva vía Redis Pub/Sub: el worker de ingesta emite evento `risk:invalidate:{tax_profile_id}` al procesar nuevas facturas.
- El worker de versionado de reglas emite `risk:invalidate:all` cuando se activa una nueva versión de `risk_rules` o `pld_rules`.
- Implementación de cache-aside (lazy loading): el que consulta es responsable de poblar la caché en caso de miss.
- La caché es opcional; si Redis no está disponible, el sistema degrada gracefulmente a consulta directa contra PostgreSQL.

**Criterios de aceptación:**
1. Una consulta de RiskGauge cacheada responde en menos de 50ms (Redis hit) vs. 200-500ms sin caché (PostgreSQL).
2. Tras ingerir 100 facturas nuevas para un perfil, la siguiente consulta de RiskGauge devuelve el score recalculado (no el valor cacheado obsoleto).
3. Si Redis está caído, el endpoint de riesgo responde correctamente desde PostgreSQL sin errores 5xx.
4. Las pruebas de integración `test_risk_cache.py` validan hits, misses, invalidación reactiva y degradación graceful.

**Impactos y consideraciones:**
- Reduce la carga sobre PostgreSQL en horarios pico de consulta del HUD (múltiples analistas simultáneos).
- La invalidación reactiva es crítica: un score obsoleto podría ocultar un riesgo real durante hasta 1 hora si no se invalida correctamente.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático, §17.3 — RiskGauge y scoring compuesto
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §7.8 — Caching de scores con Redis
- ADR: ADR-0002 — Desacoplamiento de módulos de riesgo y PLD
- Tablas afectadas: `risk_events` (lectura), Redis (cache keys)
- Flujo crítico SAD §10: §10.7 — Reportes y análisis de riesgo

---

#### HU-08.10 — Comparativa de Riesgo entre Periodos Fiscales: MoM, QoQ, YoY con Visualización

**Épica:** EP-08 — Riesgo Matemático y Versionado
**Módulo(s):** Motor de Riesgo Matemático (SAD §9.4), Frontend SPA (SAD §18.2)
**Historia:** Como Analista de Cumplimiento, quiero comparar los indicadores de riesgo (RiskGauge, HHI, outliers) entre periodos consecutivos (mes a mes, trimestre a trimestre, año a año) con visualización de variaciones para identificar rápidamente cambios significativos en el perfil de riesgo de un contribuyente.

**Alcance:** Backend Core Fiscal (API de comparativa) + Frontend SPA (React 19, Vanilla CSS Liquid Glass).

**Historia en formato Given/When/Then:**
- **Given** un tax_profile tiene RiskGauge calculado para al menos 2 periodos comparables (mes, trimestre o año).
- **When** el analista selecciona modo de comparación (MoM/QoQ/YoY) desde el HUD.
- **Then** el sistema calcula las variaciones porcentuales de cada indicador de riesgo entre el periodo actual y el periodo anterior.
- **And** presenta una tabla comparativa con columnas: indicador, valor periodo actual, valor periodo anterior, variación %, indicador de tendencia (▲ deterioro, ▼ mejora, — estable).
- **And** renderiza un gráfico de barras comparativas lado a lado para los indicadores principales.
- **And** destaca en rojo las variaciones que superen el umbral de alerta configurado (>20% de deterioro en RiskGauge, >500 puntos en HHI).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge), HU-08.06 (análisis de tendencia temporal).
- Modos de comparación: MoM (mes actual vs. mes anterior), QoQ (trimestre actual vs. mismo trimestre año anterior), YoY (año fiscal actual vs. anterior).
- Los umbrales de alerta por variación son configurables en `pld_rules`.
- El endpoint `GET /api/v1/risk/{tax_profile_id}/comparative?mode=MoM|QoQ|YoY` devuelve el payload comparativo.
- La visualización debe ser responsive y accesible (WCAG 2.1 AA), con Vanilla CSS Liquid Glass.

**Criterios de aceptación:**
1. La comparativa MoM para un perfil con datos de 2 meses consecutivos muestra variaciones correctas con precisión de ±0.1%.
2. Una variación de RiskGauge de -25% dispara el indicador de alerta en rojo en la UI.
3. El gráfico de barras comparativas se renderiza correctamente en viewport móvil (responsive).
4. El módulo `risk_comparative.py` tiene cobertura ≥ 75% incluyendo casos con datos faltantes en algún periodo.

**Impactos y consideraciones:**
- Proporciona al analista una visión rápida de la evolución del riesgo sin necesidad de revisar cada indicador manualmente.
- La comparativa trimestral (QoQ) es particularmente relevante para cumplimiento de obligaciones fiscales periódicas.

**Referencias y trazabilidad:**
- SAD: §9.4 — Motor de Riesgo Matemático, §17.3 — RiskGauge y scoring compuesto, §18.2 — Dashboard Tactical HUD
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §7.9 — Comparativa de riesgo entre periodos
- ADR: ADR-0002 — Desacoplamiento de módulos de riesgo y PLD
- Tablas afectadas: `risk_events`, `invoices`
- Flujo crítico SAD §10: §10.7 — Reportes y análisis de riesgo

---

---

### 5.9 EP-09 — PLD, OFAC/ONU/PEPs y 69-B

#### HU-09.01 — ETL Nocturno 69-B: Descarga de Listado SAT, Marcaje de Facturas y Alertas

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** SAD §9.5, SAD §10.6, SAD §12.2
**Historia:** Como motor de cumplimiento PLD de Sentinel, quiero que un proceso ETL nocturno descargue automáticamente el listado oficial de contribuyentes con operaciones presuntamente inexistentes publicado por el SAT (Art. 69-B CFF), compare los RFCs listados contra la base de facturas de cada tenant, marque las facturas asociadas a proveedores en el listado, y genere alertas para los analistas, para que el despacho pueda identificar proactivamente operaciones con proveedores sancionados y tomar acciones correctivas (ajuste de deducciones, cartas de inconformidad) antes de que el SAT notifique oficialmente al contribuyente.

**Alcance:**
Backend (Workers Celery con cron nocturno). Cubre la descarga del listado 69-B desde el portal SAT (CSV/XML), el parsing y normalización de RFCs, la carga/actualización de la tabla `sat_69b_list` con control de cambios (altas, bajas, reingresos), el marcaje masivo de facturas en `invoices` cuyo `rfc_emisor` coincida con el listado, la generación de alertas de tipo `69b_match` para facturas de los últimos 5 años, y la notificación al Oficial de Cumplimiento del tenant.

**Historia en formato Given/When/Then:**
- **Given** el SAT publica una actualización del listado 69-B el viernes a las 23:00 hrs con 15 nuevos RFCs (entre ellos `XYZ123456ABC`) y 3 RFCs que salen del listado (regularizados), y el cron job de Sentinel está programado para ejecutarse a las 02:00 hrs del sábado.
- **When** el worker `etl_69b` despierta, descarga el archivo oficial desde el portal SAT vía SOAP/descarga HTTP autenticada, lo parsea, y compara contra el estado anterior en `sat_69b_list`.
- **Then** el sistema detecta 15 RFCs nuevos, los inserta en `sat_69b_list` con `status = 'active'` y `first_seen = NOW()`, 3 RFCs regularizados se actualizan con `status = 'regularized'` y `removed_date = NOW()`, y se ejecuta un UPDATE en lote sobre `invoices` para marcar con `status_69b = 'listed'` todas las facturas de los últimos 5 años cuyo `rfc_emisor` esté en `sat_69b_list.status = 'active'`.
- **And** para cada factura recién marcada, se verifica si ya tiene una alerta `69b_match` activa; si no, se genera una nueva alerta con criticidad A (crítica) vinculada al `tax_profile_id` del receptor, incluyendo los totales facturados con ese proveedor.
- **And** si se detecta que un RFC previamente regularizado (`status = 'regularized'`) ha reingresado al listado (`definitive_revision` o nueva presunción), se genera una alerta de tipo `69b_reentry` con criticidad máxima.
- **And** se envía una notificación resumen al Oficial de Cumplimiento: "ETL 69-B completado: 15 RFCs nuevos, 3 regularizados. 1,247 facturas marcadas. Ver panel de alertas."

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.02 (Deduplicación CFDI en caliente con SHA-256 entre Belvo y LENS), HU-07.08 (Merge inteligente Belvo + LENS sin duplicados con resolución de conflictos por timestamp).
- El SAT publica el listado 69-B de forma irregular (sin periodicidad fija, generalmente quincenal). El ETL debe ejecutarse diariamente y detectar si hubo cambios respecto al día anterior.
- La descarga del listado debe manejar autenticación con e.firma/CIEC del despacho o mediante descarga pública del portal SAT (DOF).
- Normalización de RFCs: trimming de espacios, uppercase, validación de formato (persona moral 12 chars, persona física 13 chars) antes del matching.
- El marcaje de facturas se hace en lote mediante UPDATE con batch size configurable (default: 10,000 facturas por lote) para no saturar la DB.
- Las facturas de proveedores en 69-B se marcan con `status_69b` en: `'listed'` (proveedor activo en el listado), `'regularized'` (proveedor salió del listado), `'clean'` (nunca listado).
- Ventana de análisis retroactivo: 5 años fiscales hacia atrás (requisito CFF para revisión de deducciones).
- Cada ejecución del ETL se registra en `audit_logs` con `event_type = 'etl_69b_executed'` incluyendo conteo de RFCs procesados, altas, bajas y facturas marcadas.
- Si el archivo del SAT no está disponible (error HTTP 5xx, timeout), el ETL reintenta hasta 3 veces con backoff exponencial (10 min, 30 min, 2 hrs). Si tras los 3 reintentos sigue fallando, escala al Oficial de Cumplimiento vía email y Slack.

**Criterios de aceptación:**
1. El ETL nocturno descarga y procesa el listado 69-B real o simulado, detecta correctamente 15 altas, 3 bajas y 2 reingresos, y marca 1,247 facturas asociadas en menos de 20 minutos para un tenant con 500,000 facturas.
2. Las facturas marcadas como `status_69b = 'listed'` generan alertas individuales con la criticidad correcta (A para montos > $500,000 MXN, B para resto), y las alertas se vinculan al tax_profile receptor.
3. La tabla `sat_69b_list` mantiene historial completo de cambios de estado de cada RFC (active -> regularized -> reentry -> active) con fechas de cada transición.
4. Pruebas automatizadas (`test_69b_etl.py`, `test_69b_workflow.py`) cubren: ETL feliz con archivo de prueba, RFC nuevo (alta), RFC regularizado (baja), RFC reingresado (reentry), archivo SAT no disponible con reintentos y escalación, y lote de marcaje con batch processing.
5. El marcaje masivo de facturas no genera locks de tabla que bloqueen consultas concurrentes desde el HUD (usa `UPDATE ... WHERE ... LIMIT` en lotes con pausas de 100ms entre lotes).

**Impactos y consideraciones para negocio:**
- Cumplimiento directo con Art. 69-B CFF: los contribuyentes que deduzcan operaciones con proveedores listados pierden la deducción y pueden ser sujetos a auditoría y sanciones.
- La detección proactiva permite al despacho notificar a sus clientes y preparar la documentación de defensa (materialidad de las operaciones) antes de recibir la notificación oficial del SAT.
- El marcaje automático elimina la necesidad de que los analistas crucen manualmente sus facturas contra el listado 69-B publicado en el DOF, un proceso que manualmente toma días.
- La trazabilidad de transiciones (altas/bajas/reingresos) permite al despacho demostrar que monitoreó activamente el estatus de sus proveedores.

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §10.6 — ETL nocturno y screening batch unificado, §12.2 — Integración SAT 69-B
- SAD-Lite: §5 — Motor Analítico de Riesgo Fiscal (RiskGauge)
- Developer Handbook: §5.1 — Proceso ETL 69-B: descarga, normalización, marcaje y alertamiento
- ADR: ADR-014
- Tablas afectadas: `sat_69b_list`, `invoices`, `alerts`, `audit_logs`
- Flujo crítico SAD §10: §10.6 — ETL nocturno: 69-B + OFAC/ONU + PLD en lote secuencial

---

#### HU-09.02 — Motor PLD: Cálculo Dinámico por UMAs con Ventana Móvil de 30 Días

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** SAD §9.5, SAD §17.3, SAD §17.5
**Historia:** Como motor de cumplimiento PLD de Sentinel, quiero calcular automáticamente si las operaciones de cada tax_profile rebasan los umbrales de operaciones relevantes e inusuales definidos por la LFPIORPI en UMAs (Unidad de Medida y Actualización), utilizando una ventana móvil de 30 días calendario sobre las facturas ingeridas, para generar alertas PLD precisas y oportunas que permitan al Oficial de Cumplimiento identificar operaciones que deben ser reportadas a la UIF antes de que venza el plazo legal de 30 días.

**Alcance:**
Backend (Workers Celery + Core FastAPI). Cubre el cálculo diario de operaciones acumuladas por tipo (efectivo, transferencia, cheque, tarjeta, mixto) en ventanas móviles de 30 días, la comparación contra umbrales en UMA ($113.14 MXN diarios en 2026), la detección de operaciones inusuales (desviación significativa del perfil transaccional del contribuyente), la generación y actualización de alertas PLD, y la persistencia del historial de chequeos en `pld_checks`.

**Historia en formato Given/When/Then:**
- **Given** el valor diario de la UMA para 2026 es $113.14 MXN, y el umbral de operación relevante (Art. 17 LFPIORPI) es 1,500 UMA = $169,710 MXN acumulados en 30 días, y el tax_profile del RFC `ABC123456XYZ` ha recibido facturas por un total de $180,000 MXN en efectivo en los últimos 28 días provenientes de 12 operaciones.
- **When** se ejecuta el worker `pld_daily_check` a las 06:00 hrs y calcula la suma de montos agrupados por `metodo_pago` para los últimos 30 días calendario del tax_profile.
- **Then** el sistema detecta que el total acumulado en efectivo ($180,000) supera el umbral de 1,500 UMA ($169,710), marca el `pld_check` como `status = 'threshold_exceeded'` para ese tax_profile y periodo, y genera una alerta de tipo `pld_operacion_relevante` con criticidad A, detallando el monto acumulado, número de operaciones, periodo exacto (YYYY-MM-DD a YYYY-MM-DD), y tipo de operación (efectivo).
- **And** si al día siguiente el total acumulado en la ventana móvil desciende por debajo del umbral (porque la operación más antigua sale de la ventana de 30 días), la alerta se actualiza automáticamente a `status = 'resolved'` con nota "ventana móvil — operaciones fuera del periodo de 30 días".
- **And** adicionalmente, si la distribución de montos en los últimos 30 días muestra una desviación > 3 sigma respecto a la media de los últimos 12 meses del tax_profile, se genera una alerta complementaria de tipo `pld_operacion_inusual` con criticidad B.
- **And** todos los chequeos PLD se persisten en `pld_checks` con `check_date`, `window_start`, `window_end`, `total_amount`, `uma_value`, `threshold_umas`, y `status`, permitiendo trazabilidad completa de cada evaluación diaria.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.02 (Deduplicación CFDI en caliente con SHA-256 entre Belvo y LENS).
- Valor de UMA actualizado anualmente (publicado por INEGI). El sistema debe consultar el valor vigente desde la tabla `uma_values` con `effective_date`.
- Umbrales LFPIORPI configurables por tenant: operación relevante (default 1,500 UMA), operación inusual (default 3,000 UMA o detección estadística), transferencias internacionales (default 500 UMA).
- Ventana móvil estricta: se considera el periodo [today - 30 days, today], ambos inclusive. No se usan meses calendario porque la UIF evalúa días exactos.
- Agrupación por `metodo_pago`: efectivo, cheque, transferencia, tarjeta de crédito/débito, mixto (varios métodos en una misma operación). Cada método se evalúa independientemente contra sus propios umbrales.
- Deduplicación de alertas: si ya existe una alerta PLD activa para el mismo tax_profile, tipo de operación y periodo solapado, no se duplica; se actualiza el monto acumulado y se mantiene el historial de cambios.
- El cálculo debe completarse en batch para todos los tax_profiles del tenant en menos de 30 minutos para tenants con hasta 500 perfiles.
- El sistema debe respetar el RLS: solo se evalúan facturas del tenant y tax_profile correspondiente.

**Criterios de aceptación:**
1. Un tax_profile que acumula $200,000 MXN en efectivo en 30 días (> 1,768 UMA) genera correctamente una alerta `pld_operacion_relevante` con los detalles de monto, número de operaciones y periodo exacto.
2. La misma alerta se resuelve automáticamente cuando la ventana móvil avanza y el total acumulado cae por debajo del umbral, con registro de la transición en `audit_logs`.
3. El cálculo de operaciones inusuales detecta correctamente una desviación > 3 sigma en los montos de un tax_profile y genera una alerta complementaria `pld_operacion_inusual`.
4. Pruebas automatizadas (`test_pld_umas.py`, `test_pld_alerting.py`) cubren: superación de umbral de operación relevante, no superación por debajo del umbral, resolución por ventana móvil, detección de operación inusual por Z-Score > 3, y deduplicación de alertas en periodos solapados.
5. El worker `pld_daily_check` procesa 500 tax_profiles en menos de 30 minutos con p95 de latencia por perfil < 3 segundos.

**Impactos y consideraciones para negocio:**
- Cumplimiento directo con LFPIORPI: la ley obliga a los sujetos obligados (despachos contables que manejan operaciones de clientes) a identificar y reportar operaciones relevantes e inusuales en plazos perentorios.
- La ventana móvil de 30 días replica exactamente el criterio de la UIF, evitando falsos negativos que ocurrirían con cortes de mes calendario que no coinciden con la fecha de evaluación de la autoridad.
- La automatización del cálculo elimina el riesgo de error humano en la suma manual de operaciones y permite al despacho escalar su operación PLD a cientos de contribuyentes sin contratar más analistas.
- La trazabilidad en `pld_checks` demuestra ante la UIF que el sujeto obligado monitoreó activamente y en tiempo real las operaciones de sus clientes.

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §17.3 — Modelo de scoring de riesgo fiscal RiskGauge, §17.5 — Reglas PLD y parámetros de riesgo configurables
- SAD-Lite: §5 — Motor Analítico de Riesgo Fiscal (RiskGauge)
- Developer Handbook: §5.2 — Motor PLD: cálculo por UMAs, ventana móvil y umbrales LFPIORPI
- ADR: ADR-014 — Integración y cálculo PLD con UMAs para cumplimiento LFPIORPI
- Tablas afectadas: `pld_checks`, `invoices`, `alerts`, `tax_profiles`, `audit_logs`
- Flujo crítico SAD §10: §10.6 — ETL nocturno: 69-B + OFAC/ONU + PLD en lote secuencial

---

#### HU-09.03 — Screening de Listas OFAC/ONU/PEPs con Jaro-Winkler d_jw >= 0.92

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** SAD §9.5, SAD §17.5
**Historia:** Como motor de cumplimiento PLD de Sentinel, quiero ejecutar un screening automatizado de todos los RFCs emisores y receptores en las facturas de cada tenant contra las listas sancionadoras internacionales OFAC SDN, sanciones ONU y listas de Personas Políticamente Expuestas (PEPs), utilizando el algoritmo de similitud Jaro-Winkler con un umbral de distancia mínima d_jw >= 0.92 para detectar coincidencias aproximadas (errores tipográficos, transliteraciones, inversión de nombres/apellidos), para que el despacho pueda identificar operaciones con personas o entidades sancionadas incluso cuando los nombres en las facturas no coinciden exactamente con los nombres en las listas oficiales.

**Alcance:**
Backend (Workers Celery + Core FastAPI). Cubre la descarga y actualización semanal de listas OFAC/ONU/PEPs, el pre-procesamiento y normalización de nombres (limpieza de títulos, transliteración, tokenización), el cálculo de distancia Jaro-Winkler entre cada nombre en facturas y cada entrada en las listas, la generación de alertas por coincidencia con d_jw >= 0.92, y la API de consulta de resultados de screening con detalle de la coincidencia.

**Historia en formato Given/When/Then:**
- **Given** la lista OFAC SDN contiene la entrada "GARCIA LUNA, GENARO" (narcotics trafficking) y en las facturas del tenant aparece un emisor con razón social "GENARO GARCIA LUNA CONSTRUCCIONES SA DE CV" que emitió facturas por $2,500,000 MXN en los últimos 12 meses.
- **When** el worker `ofac_screening` procesa el batch nocturno, normaliza ambos nombres (elimina títulos SA, DE, CV; ordena tokens; convierte a uppercase; elimina acentos), y calcula la distancia Jaro-Winkler entre los nombres normalizados.
- **Then** el sistema obtiene d_jw = 0.94 (>= 0.92) entre "GENARO GARCIA LUNA" y "GARCIA LUNA GENARO", genera una alerta de tipo `ofac_match` con criticidad A, vinculada al tax_profile receptor de las facturas, detallando el nombre en la factura, el nombre en la lista, el score Jaro-Winkler exacto, la lista de origen (OFAC SDN), la categoría de sanción (narcotics), y el monto total facturado.
- **And** si la distancia es d_jw = 0.88 (entre 0.85 y 0.92), se genera una alerta de tipo `ofac_near_match` con criticidad B para revisión manual del analista, sin bloqueo automático de operaciones.
- **And** si la distancia es d_jw < 0.85, no se genera alerta.
- **And** las coincidencias contra listas PEPs reciben un scoring adicional de afinidad: si el PEP es de nacionalidad mexicana y tiene cargo vigente, la criticidad se eleva un nivel (B -> A). Las coincidencias contra PEPs extranjeros o con cargo vencido (> 2 años) mantienen criticidad B.
- **And** todos los resultados de screening se persisten en `pld_checks` con tipo `ofac_screening` u `onu_screening` o `pep_screening`, incluyendo el score Jaro-Winkler, los nombres comparados normalizados, y la lista de origen con fecha de vigencia.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.02 (Deduplicación CFDI en caliente con SHA-256 entre Belvo y LENS).
- Distancia Jaro-Winkler con parámetros estándar: boost threshold = 0.7, scaling factor = 0.1 para prefijos comunes de hasta 4 caracteres.
- Normalización de nombres antes del cálculo: eliminación de títulos legales (SA, CV, SAPI, S de RL, SC, SPR, AC, ABP, IAP, IBP), trimming de espacios múltiples, uppercase, eliminación de acentos y caracteres especiales, tokenización y ordenamiento alfabético de tokens.
- Las listas OFAC/ONU se descargan semanalmente desde fuentes oficiales (OFAC SDN XML, UN Consolidated Sanctions List XML). Las listas PEPs se obtienen de proveedores especializados o de la propia UIF para PEPs mexicanos.
- El screening se ejecuta sobre todos los RFC emisores y receptores de los últimos 5 años de facturas, con re-screening completo cada vez que se actualiza una lista (pueden aparecer nuevas entradas que afecten facturas antiguas).
- Umbrales de alertamiento configurables por tenant: `jw_match_threshold` (default 0.92), `jw_near_match_threshold` (default 0.85).
- Las coincidencias exactas (d_jw = 1.0 con nombres idénticos) generan alerta de criticidad máxima y se notifican inmediatamente (no esperan al batch nocturno).
- El algoritmo Jaro-Winkler se implementa en Python puro (sin dependencias externas) o con `jellyfish` para cálculos de alta precisión.

**Criterios de aceptación:**
1. Una comparación entre "GENARO GARCIA LUNA CONSTRUCCIONES SA DE CV" y "GARCIA LUNA, GENARO" produce d_jw >= 0.92 y genera alerta `ofac_match` con los detalles correctos de la coincidencia.
2. Una comparación con d_jw = 0.88 genera alerta `ofac_near_match` para revisión manual, y una con d_jw = 0.72 no genera alerta alguna.
3. Un PEP mexicano con cargo vigente eleva la criticidad de la alerta de B a A, mientras que un PEP extranjero con cargo vencido mantiene criticidad B.
4. Pruebas automatizadas (`test_jaro_winkler.py`, `test_screening_ofac.py`) cubren: coincidencia exacta (d_jw = 1.0), coincidencia aproximada con inversión de nombres (d_jw >= 0.92), near miss (0.85 <= d_jw < 0.92), no coincidencia (d_jw < 0.85), normalización de títulos legales, y scoring de afinidad PEP.
5. El screening batch de 100,000 nombres de facturas contra 50,000 entradas de listas completa en menos de 4 horas usando paralelización por chunks en workers Celery.

**Impactos y consideraciones para negocio:**
- Cumplimiento directo con el régimen internacional de sanciones: México está obligado a acatar las listas ONU y el despacho no puede procesar operaciones de personas/entidades sancionadas sin incurrir en responsabilidad penal.
- El algoritmo Jaro-Winkler con umbral 0.92 es el estándar de la industria para screening de sanciones (usado por Refinitiv World-Check, LexisNexis Bridger) y reduce el riesgo de falsos negativos por errores tipográficos o variaciones de transliteración.
- La diferenciación entre match (>= 0.92) y near match (0.85-0.92) permite al despacho priorizar recursos: los matches requieren acción inmediata, los near matches pueden revisarse con menor urgencia.
- El scoring de afinidad PEP adapta la criticidad al contexto mexicano: un PEP mexicano con cargo vigente representa mayor riesgo que un PEP extranjero.

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §17.5 — Reglas PLD y parámetros de riesgo configurables
- SAD-Lite: §5 — Motor Analítico de Riesgo Fiscal (RiskGauge)
- Developer Handbook: §5.3 — Screening OFAC/ONU/PEPs con Jaro-Winkler y normalización de nombres
- ADR: ADR-014 — Integración de listas OFAC/ONU y screening automatizado con Jaro-Winkler
- Tablas afectadas: `pld_checks`, `alerts`, `audit_logs`
- Flujo crítico SAD §10: §10.6 — ETL nocturno: 69-B + OFAC/ONU + PLD en lote secuencial

---

#### HU-09.04 — Pruebas automatizadas de transición 69-B, PLD y RiskGauge

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** SAD §9.10 (Observabilidad y Notificaciones) — Framework de pruebas de cumplimiento, SAD §17.3 (Motor de Riesgo) — Validación de RiskGauge, SAD §17.5 (PLD, OFAC, PEPs) — Validación de motor PLD y screening
**Historia:** Como QA Engineer y Oficial de Cumplimiento de Sentinel, quiero disponer de una suite de pruebas automatizadas de extremo a extremo que validen exhaustivamente las transiciones de estado del marcaje 69-B (desde descarga del listado SAT hasta generación de alertas), el cálculo correcto de PLD por UMAs con ventana móvil de 30 días, y la integración de RiskGauge consolidando riesgos 69-B + PLD + OFAC/ONU/PEPs, para garantizar que cualquier cambio en los motores de riesgo no introduzca regresiones que resulten en falsos negativos (no detectar operación reportable a la UIF) o falsos positivos (sobrecarga que entierre las alertas críticas).

**Alcance:**
Suite de tests Python 3.12 con pytest (`test_69b_mock_data.py`, `test_pld_mock_flow.py`) con fixtures de datos mock del listado 69-B del SAT, facturas que cruzan umbrales PLD en UMAs, y proveedores con nombres que activan screening OFAC/ONU vía Jaro-Winkler ≥0.92. Tests de transición de estados 69-B (CLEAN → WATCHED → ALERTED → RESOLVED). Tests de integración PLD + 69-B + RiskGauge. No cubre implementaciones de motores (HU-09.01, HU-09.02, HU-09.03) ni screening batch unificado (HU-09.05).

**Historia en formato Given/When/Then:**
- **Given** que el ETL nocturno 69-B (HU-09.01) ha marcado 3 facturas vinculadas a contribuyentes en artículo 69-B, el motor PLD (HU-09.02) ha detectado superación de 5,000 UMAs en ventana de 30 días, y el screening OFAC/ONU (HU-09.03) ha identificado coincidencia Jaro-Winkler ≥0.92 con lista OFAC SDN.
- **When** se ejecuta `pytest tests/compliance/test_69b_mock_data.py tests/compliance/test_pld_mock_flow.py -v --cov=sentinel.services.compliance`.
- **Then** `test_69b_full_transition_flow` verifica: (a) facturas de emisores listados transicionan a `WATCHED` con registros en `sat_69b_list`, (b) nueva publicación SAT con emisor `DEFINITIVE` provoca transición a `ALERTED` con alertas `CRITICAL`, (c) emisores limpios permanecen `CLEAN`.
- **And** `test_pld_uma_calculation_and_window` verifica: (a) detección de cruce de umbral de operaciones inusuales (10,000 UMAs) con alerta `PLD_UNUSUAL_OPERATIONS`, (b) exclusión de facturas fuera de ventana de 30 días, (c) recálculo correcto al cambiar UMA value.
- **And** `test_riskgauge_consolidated_score` verifica: (a) score consolidado entre 70-100 con pesos por defecto (69-B=0.40, PLD=0.30, OFAC/ONU=0.25), (b) `risk_level` correcto (`HIGH`/`CRITICAL`), (c) `alert_ids[]` referenciando todas las alertas contribuyentes.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.01 (ETL nocturno 69-B), HU-09.03 (Screening OFAC/ONU/PEPs con Jaro-Winkler d_jw ≥ 0.92).
- Regla de negocio: La suite de tests de cumplimiento es un artefacto de validación regulatoria. Debe ejecutarse en CI/CD con cobertura ≥90%. Datos mock con `faker` y `factory_boy` usando RFCs correctos y montos realistas; nunca datos reales. Transiciones 69-B: `CLEAN → WATCHED → ALERTED → RESOLVED` (no hay salto directo CLEAN→ALERTED). Fórmula RiskGauge: `risk_score = MIN(SUM(w_i * s_i), 100)` con pesos configurables por tenant vía `risk_rules`.

**Criterios de aceptación:**
1. Suite ejecuta completa en ≤120s con ≥90% cobertura en `sentinel.services.compliance.etl_69b`, `pld_motor`, y `riskgauge`.
2. Test de transición 69-B verifica los 4 estados del ciclo con alertas `69B_WATCHED` y `69B_DEFINITIVE` de severidad correcta.
3. Test PLD verifica cruce de umbrales (5,000 relevantes, 10,000 inusuales) con alertas correctas y exclusión de facturas fuera de ventana.
4. Test RiskGauge verifica score consolidado con pesos por defecto y `alert_ids[]` correcto.
5. NFR: Suite ejecutable en CI/CD sin dependencias externas (Belvo, SAT, OFAC), usando solo fixtures locales. Todos los tests deterministas.

**Impactos y consideraciones:**
- Las pruebas automatizadas de cumplimiento son simultáneamente herramienta de QA y artefacto de evidencia regulatoria. En auditoría, Sentinel puede presentar resultados firmados digitalmente como demostración de funcionamiento correcto. Datos mock deben revisarse periódicamente contra cambios regulatorios (umbrales LFPIORPI, formato listado 69-B).

**Referencias y trazabilidad:**
- SAD: §9.10 — Observabilidad, Notificaciones y Framework de Pruebas de Cumplimiento, §17.3 — Motor de Riesgo y RiskGauge, §17.5 — PLD, OFAC, PEPs
- SAD-Lite: §7 — Cumplimiento PLD, OFAC y 69-B
- Developer Handbook: §9.1 — Suite de Pruebas Automatizadas de Transición 69-B, PLD y RiskGauge
- ADR: ADR-014 — Estrategia de Pruebas Automatizadas para Motores de Cumplimiento PLD
- Tablas afectadas: `sat_69b_list`, `pld_checks`, `risk_scores`, `alerts`
- Flujo crítico SAD §10: §10.6 (Procesamiento nocturno batch — ETL 69-B y validación automatizada)

#### HU-09.05 — Screening Batch Nocturno Unificado: 69-B + OFAC/ONU + PLD en Lote Secuencial

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** Motor PLD y Listas Negras (SAD §9.5, SAD §10.6)
**Historia:** Como Oficial de Cumplimiento, quiero que el sistema ejecute un proceso batch nocturno unificado que ejecute secuencialmente el screening de 69-B, listas OFAC/ONU y reglas PLD sobre todas las facturas del día para consolidar en una sola ventana de procesamiento todas las verificaciones de cumplimiento y generar alertas consolidadas antes del inicio de operaciones del día siguiente.

**Alcance:** Backend Core Fiscal (Python 3.12, Celery workers con Redis como broker).

**Historia en formato Given/When/Then:**
- **Given** existen facturas nuevas ingresadas durante el día (vía Belvo, LENS o carga manual) y los tres motores de screening (69-B, OFAC/ONU, PLD) están operativos.
- **When** se dispara el batch nocturno unificado (programado a las 02:00 AM hora del tenant).
- **Then** el orquestador ejecuta secuencialmente: (1) ETL 69-B → marcaje de facturas de proveedores listados, (2) Screening OFAC/ONU con Jaro-Winkler ≥ 0.92 sobre nombres de emisores/receptores, (3) Motor PLD por UMAs con ventana móvil de 30 días.
- **And** consolida los resultados de los tres screenings en un solo job batch con trazabilidad individual por factura.
- **And** emite alertas unificadas cuando una factura activa dos o más marcajes simultáneamente (ej. proveedor 69-B + coincidencia OFAC).
- **And** registra el resultado del batch en `pld_checks` con estatus `completed`, `partial` o `failed` y bitácora detallada.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.01 (ETL 69-B), HU-09.02 (Motor PLD UMAs), HU-09.03 (Screening OFAC/ONU).
- El orden de ejecución es fijo: primero 69-B (depende de listado SAT), luego OFAC/ONU (depende de listas internacionales), finalmente PLD (depende de montos acumulados).
- El batch debe ejecutarse en una ventana máxima de 4 horas para procesar hasta 100,000 facturas diarias.
- Tolerancia a fallos: si un screening falla, los demás continúan; el batch se marca como `partial`.
- Implementado con Celery Canvas (chain) para garantizar secuencialidad: `chain(etl_69b.s(), screening_ofac.s(), motor_pld.s())`.
- Los resultados se persisten en `pld_checks` con columnas: `check_type` (69b/ofac/pld), `batch_id`, `invoice_id`, `result`, `triggered`.

**Criterios de aceptación:**
1. El batch unificado procesa 10,000 facturas en menos de 30 minutos en entorno de pruebas con workers Celery.
2. Una factura de un proveedor listado en 69-B que además coincide con lista OFAC genera una alerta unificada con ambos marcajes.
3. Si el ETL 69-B falla por caída del SAT, el batch continúa con OFAC y PLD y se marca como `partial` con bitácora del error.
4. El módulo `unified_screening.py` tiene cobertura ≥ 75% y pruebas de integración con Celery Canvas.

**Impactos y consideraciones:**
- Centraliza en una sola operación nocturna todo el cumplimiento PLD, reduciendo la carga operativa diurna y evitando múltiples barridos sobre los mismos datos.
- Si el batch no termina antes de las 06:00 AM, las alertas del día anterior podrían no estar disponibles; se requiere monitoreo con alertas de infraestructura (HU-14.03).

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §10.6 — Screening 69-B, OFAC y PLD, §17.3 — RiskGauge y scoring compuesto, §17.5 — Configuración de reglas PLD
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §8.1 — Batch de screening unificado
- ADR: ADR-0007 — Estrategia de screening nocturno unificado
- Tablas afectadas: `pld_checks`, `invoices`, `alerts`, `audit_logs`
- Flujo crítico SAD §10: §10.6 — Screening 69-B y PLD

---

#### HU-09.06 — Actualización Semanal Automatizada de Listas OFAC/ONU con Verificación de Integridad

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** Motor PLD y Listas Negras (SAD §9.5, SAD §12.3)
**Historia:** Como Oficial de Cumplimiento, quiero que el sistema descargue y actualice automáticamente cada semana las listas OFAC SDN, ONU y PEPs desde sus fuentes oficiales, verificando la integridad del archivo descargado y almacenándolo en Redis para consulta rápida, garantizando que el screening siempre opere contra las listas más recientes sin intervención manual.

**Alcance:** Backend Core Fiscal (Python 3.12, Celery Beat scheduler, Redis cache).

**Historia en formato Given/When/Then:**
- **Given** el scheduler Celery Beat está configurado para ejecutar la tarea de actualización cada lunes a las 00:00 UTC.
- **When** se dispara la tarea programada de actualización semanal.
- **Then** el sistema descarga los archivos de las fuentes oficiales: OFAC SDN (XML), ONU Consolidated List (XML), y listas PEPs de proveedores homologados.
- **And** verifica la integridad de cada archivo mediante hash SHA-256 contra el checksum publicado por la fuente (cuando está disponible) o validación de estructura XML.
- **And** parsea y normaliza los registros (nombres, alias, identificadores) a un formato canónico interno.
- **And** carga los registros en Redis como conjunto de datos estructurados (JSON) con TTL de 8 días para consulta rápida durante el screening.
- **And** persiste una copia WORM en `audit_logs` del archivo original descargado y su hash para trazabilidad regulatoria.
- **And** emite una alerta al Oficial de Cumplimiento si la actualización falla o si la lista no se ha renovado en más de 9 días.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.03 (Screening OFAC/ONU con Jaro-Winkler).
- Las URLs de descarga de listas OFAC/ONU son configurables en `tenant_config` (con valores default oficiales).
- La verificación de integridad incluye: (a) validación de firma PGP donde la fuente la provea, (b) hash SHA-256 contra checksum, (c) validación de estructura XML contra schema conocido.
- El almacenamiento en Redis utiliza la estructura `ofac:entries`, `onu:entries`, `pep:entries` como conjuntos de strings normalizados para búsqueda rápida.
- En caso de fallo en la descarga, se reintenta hasta 3 veces con backoff exponencial (5min, 15min, 45min).
- El archivo original descargado se almacena en S3 WORM con política de retención de 5 años (requiere HU-11.01 para S3).

**Criterios de aceptación:**
1. La tarea de actualización semanal descarga, verifica y carga en Redis la lista OFAC SDN completa en menos de 10 minutos.
2. Si el hash SHA-256 no coincide con el checksum oficial, el sistema rechaza la actualización, persiste el incidente en `audit_logs` y notifica al Oficial de Cumplimiento.
3. Una consulta de screening 2 horas después de la actualización semanal utiliza los nuevos registros (Redis actualizado).
4. El módulo `ofac_sync.py` tiene cobertura ≥ 75% y mock de descargas OFAC/ONU para testing offline.

**Impactos y consideraciones:**
- Elimina el riesgo operativo de screening con listas desactualizadas, lo cual es un hallazgo frecuente en auditorías de cumplimiento.
- La dependencia de fuentes externas (OFAC, ONU) requiere tolerancia a caídas y monitoreo de disponibilidad.

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §12.3 — Actualización de listas OFAC/ONU, §17.5 — Configuración de reglas PLD
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §8.2 — Sincronización de listas OFAC/ONU
- ADR: ADR-014 — Screening con Jaro-Winkler y fuente OFAC/ONU
- Tablas afectadas: `audit_logs`, `tenant_config`; Redis: `ofac:entries`, `onu:entries`, `pep:entries`
- Flujo crítico SAD §10: §10.6 — Screening 69-B y PLD

---

#### HU-09.07 — Detección Avanzada de PEPs y Familiares con Scoring de Afinidad y Red de Vínculos

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** Motor PLD y Listas Negras (SAD §9.5, SAD §17.5)
**Historia:** Como Oficial de Cumplimiento, quiero que el motor PLD no solo detecte coincidencias exactas contra listas PEPs, sino que calcule un scoring de afinidad para familiares y relacionados (cónyuges, socios comerciales, beneficiarios controladores) construyendo una red de vínculos, para identificar exposición indirecta a Personas Políticamente Expuestas que de otra forma pasarían desapercibidas en un screening simple.

**Alcance:** Backend Core Fiscal (Python 3.12), motor de grafos de vínculos.

**Historia en formato Given/When/Then:**
- **Given** un tax_profile tiene relación comercial con un contribuyente que no es PEP pero cuyo cónyuge o socio controlador sí aparece en listas PEP.
- **When** se ejecuta el screening de afinidad PEP durante el batch nocturno.
- **Then** el motor consulta los datos de vínculos disponibles (representante legal, socios registrados en `tax_profiles`, direcciones fiscales compartidas).
- **And** calcula un score de afinidad PEP basado en: parentesco directo (cónyuge/hijo = +40 puntos), relación comercial estrecha (mismo domicilio fiscal = +20 puntos), coincidencia de representante legal (+15 puntos), coincidencia de accionista controlador (+25 puntos).
- **And** clasifica el score: 0-30 (baja afinidad), 31-60 (afinidad media — requiere revisión), 61-100 (alta afinidad — alerta inmediata).
- **And** emite una alerta PLD tipo `pep_affinity` cuando el score supera 60 puntos, incluyendo el grafo de vínculos que justifica el score.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.03 (Screening OFAC/ONU/PEPs base).
- La red de vínculos se construye a partir de los datos disponibles en `tax_profiles` (representante legal, dirección fiscal) y los metadatos de facturas (relaciones emisor-receptor recurrentes).
- El scoring de afinidad es configurable en `pld_rules` y versionable (HU-08.03).
- La detección se ejecuta en el batch unificado (HU-09.05) después del screening OFAC/ONU.
- Los vínculos detectados se almacenan en una tabla `pep_affinity_links` con columnas: `tax_profile_id`, `linked_pep_id`, `affinity_score`, `link_type`, `evidence`.
- La alerta incluye trazabilidad completa: qué vínculos se detectaron, qué score parcial aportó cada uno, y umbral de decisión.

**Criterios de aceptación:**
1. Un tax_profile cuyo representante legal es cónyuge de un PEP listado obtiene score de afinidad ≥ 40 y genera alerta si se combina con otro vínculo.
2. Un tax_profile sin vínculos detectables con PEPs obtiene score 0 y no genera alerta.
3. El cálculo de afinidad para 1,000 perfiles se completa en menos de 5 minutos.
4. El módulo `pep_affinity.py` tiene cobertura ≥ 75% con fixtures de redes de vínculos predefinidas.

**Impactos y consideraciones:**
- Eleva la calidad del screening PLD al detectar exposición indirecta a PEPs, cubriendo un punto ciego común en soluciones de cumplimiento básicas.
- Puede generar falsos positivos si los datos de vínculos están desactualizados; se requiere validación periódica de los datos de `tax_profiles`.

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §17.5 — Configuración de reglas PLD, §10.6 — Screening 69-B y PLD
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §8.3 — Detección avanzada de PEPs y red de afinidad
- ADR: ADR-014 — Screening con Jaro-Winkler y fuente OFAC/ONU
- Tablas afectadas: `pep_affinity_links`, `pld_checks`, `alerts`, `tax_profiles`
- Flujo crítico SAD §10: §10.6 — Screening 69-B y PLD

---

#### HU-09.08 — Generación de Reportes Pre-UIF con Formato Oficial LFPIORPI y Exportación PDF/XML

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** Motor PLD y Listas Negras (SAD §9.5), Vault y Exportación (SAD §10.7, SAD §11.8)
**Historia:** Como Oficial de Cumplimiento, quiero generar reportes pre-UIF en el formato oficial establecido por la LFPIORPI para operaciones inusuales y relevantes, con exportación a PDF y XML firmados, para cumplir con la obligación legal de reportar a la UIF dentro de los plazos establecidos sin necesidad de retrabajo manual de formato.

**Alcance:** Backend Core Fiscal (Python 3.12), generación de documentos XML según esquema UIF, exportación PDF.

**Historia en formato Given/When/Then:**
- **Given** existen alertas PLD confirmadas como "operación inusual" o "operación relevante" por el analista tras investigación.
- **When** el Oficial de Cumplimiento solicita generar el reporte pre-UIF desde el portal de cumplimiento.
- **Then** el sistema compila los datos de la alerta (contribuyente, montos, fechas, tipología, descripción de la operación) en el formato oficial XML requerido por la UIF (LFPIORPI).
- **And** genera una vista previa en PDF con el contenido del reporte, membrete del despacho y disclaimer legal.
- **And** permite al Oficial revisar, editar notas y aprobar el reporte antes de la generación final.
- **And** registra el reporte en `audit_logs` como WORM con hash SHA-256 y timestamp de generación.
- **And** permite descargar el XML (para envío a la UIF) y el PDF (para archivo interno del despacho).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.02 (Motor PLD por UMAs con alertas generadas).
- El formato XML debe cumplir estrictamente con el esquema oficial de la UIF vigente para reportes de operaciones inusuales (LFPIORPI, artículo 18).
- Los campos obligatorios mínimos del reporte incluyen: datos del sujeto obligado (despacho), datos del contribuyente reportado (RFC, nombre, domicilio), descripción de la operación, monto, fecha, tipología, y justificación de la inusualidad.
- El reporte pasa por flujo de aprobación: generación → revisión del analista → aprobación del Oficial de Cumplimiento → sellado.
- Una vez sellado, el reporte no puede modificarse; las correcciones generan una nueva versión con trazabilidad.
- La exportación debe completarse en menos de 15 segundos por reporte.

**Criterios de aceptación:**
1. El XML generado valida correctamente contra el esquema XSD oficial de la UIF sin errores de estructura.
2. El PDF de vista previa incluye todos los campos obligatorios con formato profesional y branding del despacho.
3. El flujo de aprobación (generar → revisar → aprobar) queda registrado íntegramente en `audit_logs`.
4. Un reporte sellado no puede editarse; el endpoint `PUT /api/v1/pld/reports/{id}` retorna 409 Conflict si el reporte ya está aprobado.

**Impactos y consideraciones:**
- Crítico para cumplimiento regulatorio: la UIF puede sancionar al despacho por reportes con formato incorrecto o fuera de plazo.
- El esquema XSD de la UIF puede cambiar; se requiere versionado de plantillas de reporte y actualización ágil ante cambios normativos.

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §10.7 — Reportes de riesgo y exportación, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §8.4 — Generación de reportes pre-UIF
- ADR: ADR-013 — Cálculo de PLD por UMAs y reporteo, ADR-0008 — Trazabilidad y no repudio
- Tablas afectadas: `pld_checks`, `alerts`, `audit_logs`, `tax_profiles`
- Flujo crítico SAD §10: §10.6 — Screening 69-B y PLD

---

#### HU-09.09 — Bitácora Inmutable de Screening con Trazabilidad de Fuentes, Versiones y Decisiones

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** Motor PLD y Listas Negras (SAD §9.5), WORM y Auditoría (SAD §11.8)
**Historia:** Como Auditor Externo / Oficial de Cumplimiento, quiero que cada ejecución de screening (69-B, OFAC, PLD, PEPs) quede registrada en una bitácora inmutable con trazabilidad de la versión de listas utilizadas, fecha/hora de ejecución, resultados obtenidos y decisión tomada (alertar/no alertar), para demostrar ante la UIF y auditores que el despacho ejecutó la debida diligencia en cada periodo.

**Alcance:** Backend Core Fiscal (Python 3.12), tabla `screening_audit_log` con triggers anti-UPDATE/DELETE.

**Historia en formato Given/When/Then:**
- **Given** se ejecuta cualquier screening (69-B, OFAC/ONU, PLD, PEPs) ya sea en batch nocturno o bajo demanda.
- **When** el motor de screening emite un resultado para una factura o tax_profile.
- **Then** el sistema registra automáticamente una entrada en `screening_audit_log` que incluye: tipo de screening, fuente de listas utilizada (URL, versión, fecha de descarga), timestamp de ejecución, entidad evaluada (RFC/UUID), score obtenido, umbral aplicado, decisión (alert/no_alert), y referencia a la alerta generada si aplica.
- **And** la bitácora es inmutable: la tabla `screening_audit_log` tiene triggers `BEFORE UPDATE/DELETE` que rechazan cualquier modificación o borrado.
- **And** permite consulta por periodo, tipo de screening, tax_profile_id, y estado de alerta para auditoría.
- **And** exporta la bitácora completa a PDF/Excel para entrega a auditores externos.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.05 (batch screening unificado operativo).
- La tabla `screening_audit_log` debe implementar inmutabilidad a nivel de base de datos con triggers `BEFORE UPDATE OR DELETE ... RAISE EXCEPTION`.
- Los campos obligatorios de la bitácora: `id`, `screening_type` (69b/ofac/pld/pep), `source_version` (hash de la lista utilizada), `source_timestamp`, `execution_timestamp`, `entity_rfc`, `score`, `threshold`, `decision`, `alert_id` (FK nullable), `tenant_id` (RLS).
- La consulta de bitácora debe respetar RLS: cada tenant solo ve sus registros.
- La exportación para auditoría debe mantener la integridad de los datos; cada exportación genera un hash SHA-256 registrado en `audit_logs`.
- Retención mínima de 5 años en la bitácora (requerimiento LFPIORPI).

**Criterios de aceptación:**
1. Cada ejecución de screening batch genera exactamente una entrada por factura evaluada en `screening_audit_log` con todos los campos obligatorios poblados.
2. Una sentencia `UPDATE` o `DELETE` sobre `screening_audit_log` es rechazada con error por el trigger de inmutabilidad.
3. La consulta de bitácora filtrada por `screening_type='ofac'` y `decision='alert'` retorna solo los registros que dispararon alerta OFAC en el periodo solicitado.
4. El módulo `screening_audit.py` tiene cobertura ≥ 75% y prueba de inmutabilidad (intento de UPDATE/DELETE).

**Impactos y consideraciones:**
- Satisface la exigencia de la UIF de demostrar que el sujeto obligado ejecutó screening en cada periodo; sin esta bitácora, el despacho no puede evidenciar cumplimiento.
- La inmutabilidad de la bitácora es críticmente importante: cualquier indicio de manipulación invalida la defensa legal ante la autoridad.

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §11.8 — Inmutabilidad y WORM (Caja Negra de Auditoría), §17.5 — Configuración de reglas PLD
- SAD-Lite: §10 — Motor de Riesgo y PLD, §6 — Aislamiento Multi-Tenant y RLS
- Developer Handbook: §8.5 — Bitácora inmutable de screening
- ADR: ADR-0008 — Trazabilidad forense y no repudio (Caja Negra WORM)
- Tablas afectadas: `screening_audit_log` (nueva), `audit_logs`, `alerts`
- Flujo crítico SAD §10: §10.6 — Screening 69-B y PLD

---

#### HU-09.10 — Simulación de Impacto 69-B: Análisis Predictivo de Riesgo si un Proveedor es Listado

**Épica:** EP-09 — PLD, OFAC/ONU/PEPs y 69-B
**Módulo(s):** Motor PLD y Listas Negras (SAD §9.5, SAD §17.3)
**Historia:** Como Oficial de Cumplimiento, quiero simular el impacto que tendría sobre el RiskGauge y las alertas PLD si un proveedor actualmente no listado fuera incluido en el listado 69-B del SAT, para anticipar la exposición del despacho y tomar acciones preventivas de mitigación de riesgo con los clientes potencialmente afectados.

**Alcance:** Backend Core Fiscal (Python 3.12), simulación sobre datos reales sin efecto colateral.

**Historia en formato Given/When/Then:**
- **Given** un tax_profile tiene facturas de un proveedor X que no está en el listado 69-B actual.
- **When** el analista ejecuta la simulación de impacto 69-B marcando al proveedor X como hipotéticamente listado.
- **Then** el sistema recalcula temporalmente: (a) el marcaje 69-B sobre todas las facturas del proveedor X, (b) el impacto en RiskGauge del tax_profile, (c) la activación de reglas PLD por monto acumulado del proveedor listado, (d) el número de clientes del despacho afectados.
- **And** presenta un reporte de impacto con: total de facturas que se marcarían, monto total expuesto, número de tax_profiles afectados, variación estimada del RiskGauge por perfil, y semáforo de criticidad.
- **And** permite al Oficial generar una lista de clientes afectados para comunicación proactiva.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.01 (ETL 69-B operativo).
- La simulación es puramente analítica y no modifica ningún dato real (transacción aislada o en memoria).
- El proveedor a simular se identifica por RFC; debe existir en `invoices` del despacho.
- El reporte de impacto incluye métricas agregadas a nivel despacho y desglosadas por tax_profile.
- Los resultados de simulación se pueden guardar como escenario temporal (TTL 30 días) en `risk_events` con tipo `69b_simulation`.
- La simulación para un proveedor con presencia en hasta 500 tax_profiles debe completarse en menos de 60 segundos.

**Criterios de aceptación:**
1. Simular el listado de un proveedor con 1,000 facturas en 50 tax_profiles calcula correctamente el número de facturas marcadas y clientes afectados.
2. El reporte de impacto muestra el delta de RiskGauge antes/después de la simulación para cada tax_profile afectado.
3. Los datos reales en `invoices` y `risk_events` no se modifican tras ejecutar la simulación.
4. El módulo `simulate_69b_impact.py` tiene cobertura ≥ 75% y prueba de no-efecto-colateral.

**Impactos y consideraciones:**
- Herramienta estratégica para el despacho: permite anticipar crisis de cumplimiento cuando un proveedor grande está bajo investigación y podría ser listado en el siguiente corte del SAT.
- La precisión de la simulación depende de que los datos de facturación estén actualizados (sincronización reciente con Belvo/LENS).

**Referencias y trazabilidad:**
- SAD: §9.5 — Motor PLD y Listas Negras, §10.6 — Screening 69-B y PLD, §17.3 — RiskGauge y scoring compuesto
- SAD-Lite: §10 — Motor de Riesgo y PLD
- Developer Handbook: §8.6 — Simulación de impacto 69-B
- ADR: ADR-0007 — Estrategia de screening nocturno unificado
- Tablas afectadas: `invoices` (lectura), `risk_events`, `tax_profiles`
- Flujo crítico SAD §10: §10.6 — Screening 69-B y PLD

---

---

### 5.10 EP-10 — Alertas, Locking y SLA

#### HU-10.01 — Configuración de criticidad (A/B/C), coverage_level y SLAs

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — API de configuración de criticidad y SLAs, SAD §9.4 (FinOps y SLAs) — Gestión de Acuerdos de Nivel de Servicio, SAD §17.5 (PLD, OFAC, PEPs) — Umbrales de criticidad
**Historia:** Como Administrador de un despacho contable, quiero configurar reglas de criticidad para cada `tax_profile` de mis clientes —asignando niveles A (crítico: respuesta en ≤4 horas), B (alto: ≤24 horas) y C (medio: ≤72 horas) según el riesgo fiscal y la exposición financiera— junto con umbrales de cobertura (`coverage_level`: BASIC, STANDARD, PREMIUM) que determinen qué módulos de Sentinel se aplican, y SLAs medibles con temporizadores, para que Sentinel priorice automáticamente las alertas y asigne tiempos de respuesta acordes a la criticidad real de cada contribuyente.

**Alcance:**
Panel de configuración en React 19 dentro de cada `tax_profile`. API REST (`GET/PATCH /api/v1/tax-profiles/{profile_id}/criticality`). Definición de niveles A/B/C con SLA configurables. `coverage_level` que activa módulos según plan. Relación con parámetros FinOps y PLD del tenant (HU-03.05). Persistencia en `tax_profiles`. No cubre ejecución del SLA timer ni escalación (HU-10.05), ni routing por especialidad (HU-10.04).

**Historia en formato Given/When/Then:**
- **Given** que el Administrador gestiona 50 clientes desde PYMEs de bajo riesgo hasta importadores multinacionales de alto riesgo PLD.
- **When** accede a la ficha del `tax_profile` del importador (`ABC123456XXX`) en "Criticidad y Cobertura". El sistema carga: `criticality = 'A'`, `coverage_level = 'PREMIUM'`, SLAs: crítica 4h, alta 24h, media 72h.
- **Then** el administrador puede modificar: (a) nivel A/B/C activando/desactivando módulos, (b) `coverage_level`: BASIC solo ingesta y 69-B, STANDARD añade PLD y riesgo, PREMIUM añade OFAC/ONU, Vault y NOM-151, (c) SLA timers personalizados que sobrescriben los del tenant.
- **And** al guardar, el Core Fiscal valida que `coverage_level` esté dentro del plan de suscripción del tenant, registra en `admin_audit_logs`, recalcula RiskGauge si se activaron/desactivaron módulos, y notifica a contadores asignados.
- **And** desde ese momento, todas las alertas para `ABC123456XXX` heredan criticidad A y el SLA timer comienza según tiempos configurados.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge por perfil fiscal: score consolidado 0-100 con HHI, alertas y PLD).
- Regla de negocio: La criticidad no es estática; Sentinel sugiere cambios basados en RiskGauge (scores >70 por 3 meses → sugerir subir; scores <30 por 6 meses → sugerir bajar). SLAs del tenant son mínimos: un tax_profile solo puede tener SLAs más estrictos, nunca más laxos. Cambios ascendentes se aplican inmediatamente; descendentes tienen grace period de 72h para alertas ya generadas. Relación coverage_level: BASIC = [Belvo, LENS, 69-B, Alertas], STANDARD = [BASIC + PLD, RiskGauge, HUD], PREMIUM = [STANDARD + OFAC/ONU/PEPs, Vault, NOM-151, Export WORM, AI Proxy].

**Criterios de aceptación:**
1. Panel carga valores actuales en ≤400 ms y permite modificar criticality, coverage_level y sla_timers con validación en tiempo real.
2. Al cambiar coverage_level de STANDARD a PREMIUM, módulos OFAC/ONU, Vault y NOM-151 se activan y HUD muestra nuevas secciones en ≤5s.
3. Asignar PREMIUM en tenant con plan STANDARD es rechazado con `422: coverage_level exceeds tenant subscription plan`.
4. Cambiar criticality de B a A: alertas existentes mantienen B; solo nuevas heredan A con SLA 4h.
5. Tests (`test_criticality_api.py`) cubren ≥85%: carga, actualización, validación plan vs coverage, sugerencia automática, SLA timers, registro admin_audit_logs, notificación, recálculo RiskGauge.

**Impactos y consideraciones:**
- La criticidad y cobertura son el "volumen" de Sentinel: determinan cuántos recursos recibe cada tax_profile. Un cliente PREMIUM con criticidad A genera más alertas, análisis, consumo de IA y storage. La dependencia HU-08.01 refleja que no se puede configurar criticidad sin medición objetiva del riesgo.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal y Configuración de Criticidad, §9.4 — FinOps y SLAs, §17.5 — PLD, OFAC, PEPs
- SAD-Lite: §5 — Modelo de Gobernanza y Ciclo de Vida
- Developer Handbook: §10.1 — Configuración de Criticidad (A/B/C), Coverage Level y SLAs por Tax Profile
- ADR: ADR-0009 — Estrategia de Onboarding Multi-Nivel y Perfiles Fiscales
- Tablas afectadas: `tax_profiles`, `tenants`, `alerts`, `admin_audit_logs`
- Flujo crítico SAD §10: §10.8 (Gestión de alertas, criticidad y cumplimiento de SLAs)

---

#### HU-10.02 — Bloqueo concurrente de alertas (Alert Locking) con expiración

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** SAD §9.3 (Core Fiscal FastAPI) — API de bloqueo de alertas, SAD §10.8 (Gestión de Alertas) — Mecanismo de locking concurrente
**Historia:** Como contador de un despacho que trabaja en equipo con otros 4 contadores, quiero que cuando abro una alerta para revisarla, esta se bloquee automáticamente para los demás durante 30 minutos (o hasta que yo la libere), evitando que dos contadores trabajen simultáneamente sobre la misma alerta y generen acciones contradictorias (uno archivando la factura como válida mientras otro la reporta como sospechosa), con expiración automática que libere el bloqueo si me ausento sin liberarlo manualmente.

**Alcance:**
API (`POST/DELETE/GET /api/v1/alerts/{alert_id}/lock`). Bloqueo a nivel de aplicación en tabla `alert_locks`. Expiración automática vía worker Celery (`alert_lock_expiry`) cada 60s. Indicador visual en HUD (candado, avatar, temporizador). Renovación (`PATCH` extender TTL) y transferencia (`POST .../transfer`). No cubre ciclo de vida completo (HU-10.09) ni co-firma digital (HU-10.06).

**Historia en formato Given/When/Then:**
- **Given** que el sistema ha generado alerta PLD crítica `AL-0042` para el `tax_profile` `ABC123456XXX`, visible para 5 contadores en la bandeja de alertas.
- **When** el contador Carlos hace clic en la alerta y el frontend envía `POST /api/v1/alerts/AL-0042/lock`.
- **Then** el Core Fiscal verifica que no exista lock activo, inserta en `alert_locks` con `{ alert_id, user_id, locked_at, ttl_seconds: 1800 }`, y retorna `201 Created`. Si ya existe lock de otro usuario, retorna `409 Conflict` con detalles del lock actual.
- **And** el HUD muestra candado con avatar de Carlos y tooltip "Bloqueado por Carlos López — expira en 28:15". Para otros contadores, botón "En revisión por Carlos" (deshabilitado). Intentos de modificar reciben `423 Locked`.
- **And** Carlos puede liberar (`DELETE`), renovar (`PATCH`), o transferir a otro contador (`POST`). Si no libera, worker expira automáticamente tras 1800s. ADMIN/OWNER puede forzar liberación con registro `ALERT_LOCK_FORCE_RELEASE`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.02 (Motor PLD: cálculo dinámico por UMAs con ventana móvil de 30 días).
- Regla de negocio: Alert Locking es coordinación de equipo, no seguridad. TTL por defecto 30 min (configurable por tenant, 15-120 min). No más de un lock simultáneo por alerta (UNIQUE condicional). Worker expira cada 60s con `SKIP LOCKED`. `lock_version` para optimistic concurrency en renovación y transferencia.

**Criterios de aceptación:**
1. Contador bloquea alerta exitosamente, recibe `201`, HUD de demás muestra candado en ≤1s.
2. Segundo contador intentando bloquear misma alerta recibe `409 Conflict` con detalles.
3. Worker expira lock con `ttl_seconds = 5` (test) correctamente; alerta vuelve a estar disponible.
4. ADMIN fuerza liberación (`?force=true`), contador original recibe notificación, evento en `audit_logs`.
5. Tests (`test_alert_locking.py`) cubren ≥90%: bloqueo exitoso, conflicto 409, liberación por dueño, liberación forzada, expiración automática, renovación, transferencia, modificación bloqueada (423), concurrencia de 5 contadores simultáneos.

**Impactos y consideraciones:**
- Alert Locking resuelve un problema real: múltiples contadores duplicando trabajo o tomando acciones contradictorias. TTL de 30 min equilibra productividad y disponibilidad. La dependencia HU-09.02 es lógica (se necesitan alertas reales), pero el locking puede desarrollarse con alertas mockeadas.

**Referencias y trazabilidad:**
- SAD: §9.3 — Core Fiscal y API de Bloqueo de Alertas, §10.8 — Gestión de Alertas, Locking y Workflow
- SAD-Lite: §8 — Escenarios Críticos de Operación
- Developer Handbook: §10.2 — Bloqueo Concurrente de Alertas con Expiración Automática a 30 Minutos
- ADR: ADR-014 — Estrategia de Locking Concurrente para Alertas
- Tablas afectadas: `alerts`, `alert_locks`, `audit_logs`, `user_notifications`
- Flujo crítico SAD §10: §10.8 (Gestión de alertas, criticidad y cumplimiento de SLAs)

#### HU-10.03 — Canal Multi-Notificaciones: Email, Slack, Microsoft Teams y Webhooks Personalizados

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** Alertas (SAD §9.10), Seguridad Defensiva (SAD §13.8)
**Historia:** Como Analista de Cumplimiento, quiero recibir notificaciones de alertas por múltiples canales (email, Slack, Microsoft Teams) según mis preferencias de configuración y la criticidad de la alerta, para no depender de un solo medio y garantizar que las alertas críticas sean atendidas oportunamente incluso fuera del horario laboral.

**Alcance:** Backend Core Fiscal (Python 3.12, dispatcher de notificaciones), integración con APIs externas.

**Historia en formato Given/When/Then:**
- **Given** una alerta se genera en el sistema (PLD, 69-B, OFAC, riesgo) y el tax_profile tiene configurados niveles de criticidad y preferencias de notificación.
- **When** el dispatcher de notificaciones procesa la alerta generada.
- **Then** el sistema consulta las preferencias de notificación del usuario/rol asignado y la criticidad de la alerta.
- **And** envía la notificación por los canales configurados: email (SMTP/API), Slack (webhook API), Microsoft Teams (webhook API).
- **And** para alertas CRITICAL, envía por todos los canales configurados simultáneamente; para HIGH, email + un canal de chat; para MEDIUM, solo email.
- **And** registra el resultado de cada envío (success/failure) en `notification_log` con timestamp, canal y error si hubo fallo.
- **And** soporta webhooks personalizados (URL configurable por tenant) para integración con sistemas externos del despacho.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.01 (configuración de criticidad y SLAs).
- Los canales y credenciales se configuran en `tenant_config`: SMTP server/credentials, Slack webhook URL, Teams webhook URL.
- Las preferencias de notificación por usuario se gestionan en `user_preferences` (HU-03.02): canales habilitados, horario de notificación, quiet hours.
- El dispatcher de notificaciones es asíncrono (Celery task) para no bloquear la generación de alertas.
- Formato de mensaje estandarizado: título de la alerta, criticidad, tax_profile afectado, descripción breve, link directo a la alerta en el HUD.
- Rate limiting: máximo 50 notificaciones por hora por usuario para evitar saturación.
- En caso de fallo en un canal, se reintenta una vez; si falla de nuevo, se registra en `notification_log` y se continúa con los demás canales.

**Criterios de aceptación:**
1. Una alerta CRITICAL genera notificaciones por email, Slack y Teams en menos de 30 segundos desde su creación.
2. Si Slack está caído, las notificaciones por email y Teams se entregan correctamente y el fallo de Slack queda registrado.
3. Un usuario con preferencia "solo email" no recibe notificaciones por Slack/Teams aunque la alerta sea CRITICAL.
4. El módulo `notification_dispatcher.py` tiene cobertura ≥ 75% con mocks de APIs externas.

**Impactos y consideraciones:**
- Mejora significativamente el tiempo de respuesta a alertas críticas al permitir notificaciones en tiempo real por canales que el analista ya monitorea.
- Requiere configuración inicial por tenant; sin credenciales configuradas, el sistema debe funcionar en modo degradado (solo notificaciones in-app).

**Referencias y trazabilidad:**
- SAD: §9.10 — Alertas y gestión de SLA, §10.8 — Apertura, atención, locking y cierre de alertas, §13.8 — Seguridad defensiva (timingSafeEqual, rate limiting)
- SAD-Lite: §7 — Cumplimiento y alertas
- Developer Handbook: §9.1 — Sistema de notificaciones multi-canal
- ADR: ADR-0001 — Row-Level Security (RLS) como base de aislamiento multi-tenant
- Tablas afectadas: `alerts`, `notification_log`, `user_preferences`, `tenant_config`
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas

---

#### HU-10.04 — Routing Inteligente de Alertas por Criticidad y Especialidad del Analista Asignado

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** Alertas (SAD §9.10), Core Fiscal (SAD §10.8)
**Historia:** Como Administrador del Despacho, quiero que las alertas se asignen automáticamente al analista más adecuado según la criticidad de la alerta y la especialidad del analista (PLD, fiscal, 69-B, OFAC), para optimizar la carga de trabajo y asegurar que cada alerta sea atendida por quien tiene el conocimiento específico para resolverla.

**Alcance:** Backend Core Fiscal (Python 3.12, motor de routing), configuración de especialidades en RBAC.

**Historia en formato Given/When/Then:**
- **Given** se genera una alerta de tipo PLD con criticidad HIGH y existen 3 analistas en el tenant con diferentes especialidades y carga de trabajo actual.
- **When** el motor de routing procesa la alerta recién creada.
- **Then** el sistema filtra los analistas disponibles cuya especialidad coincide con el tipo de alerta (PLD → analistas con rol `pld_analyst`).
- **And** entre los candidatos, selecciona al que tenga menor carga de trabajo activa (alertas en estado OPEN/IN_PROGRESS).
- **And** para alertas CRITICAL, ignora la carga de trabajo y asigna al analista senior disponible con la especialidad correspondiente.
- **And** si no hay analistas con la especialidad requerida disponibles, escala automáticamente al Oficial de Cumplimiento.
- **And** notifica al analista asignado por los canales configurados (HU-10.03).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.01 (configuración de criticidad), HU-03.04 (gestión de roles RBAC).
- Especialidades de analista definidas como roles en RBAC: `pld_analyst`, `fiscal_analyst`, `69b_analyst`, `ofac_analyst`, `senior_analyst`.
- La carga de trabajo se calcula como: count(alertas asignadas con estado OPEN o IN_PROGRESS).
- El algoritmo de selección es: (1) filtrar por especialidad, (2) ordenar por carga ascendente, (3) seleccionar el primero.
- Si el tenant tiene menos de 3 analistas, se omite la optimización por carga y se usa round-robin simple.
- La asignación automática puede ser sobreescrita manualmente por el Administrador o el Oficial de Cumplimiento.
- Registro de asignación en `alert_assignment_log` con timestamp, analista asignado, criterio utilizado y usuario que hizo la asignación (sistema o manual).

**Criterios de aceptación:**
1. Una alerta PLD se asigna al analista con rol `pld_analyst` que tenga menos alertas activas entre los disponibles.
2. Si no hay analistas PLD disponibles, la alerta se asigna al Oficial de Cumplimiento con registro de escalación.
3. La asignación automática se completa en menos de 5 segundos desde la creación de la alerta.
4. El módulo `alert_router.py` tiene cobertura ≥ 75% con pruebas de balance de carga y escasez de analistas.

**Impactos y consideraciones:**
- Evita el "efecto cuello de botella" donde un solo analista acumula todas las alertas mientras otros están subutilizados.
- La efectividad del routing depende de que los roles RBAC estén correctamente asignados y actualizados.

**Referencias y trazabilidad:**
- SAD: §9.10 — Alertas y gestión de SLA, §10.8 — Apertura, atención, locking y cierre de alertas
- SAD-Lite: §7 — Cumplimiento y alertas
- Developer Handbook: §9.2 — Routing inteligente de alertas
- ADR: ADR-0001 — Row-Level Security como base de aislamiento multi-tenant
- Tablas afectadas: `alerts`, `alert_assignment_log`, `users`, `user_roles`
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas

---

#### HU-10.05 — SLA Timer con Escalación Automática L1→L2→L3→Oficial de Cumplimiento

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** Alertas (SAD §9.10), Core Fiscal (SAD §10.8)
**Historia:** Como Oficial de Cumplimiento, quiero que el sistema monitoree el tiempo de atención de cada alerta y escale automáticamente al siguiente nivel jerárquico cuando se superen los umbrales de SLA (24h/48h/72h), para garantizar que ninguna alerta quede sin atender más allá del plazo regulatorio permitido y se cumpla con los tiempos de respuesta comprometidos con el cliente.

**Alcance:** Backend Core Fiscal (Python 3.12, Celery Beat scheduler para monitoreo periódico).

**Historia en formato Given/When/Then:**
- **Given** una alerta ha sido creada y permanece en estado OPEN sin ser tomada por ningún analista.
- **When** el SLA timer (Celery Beat cada 15 minutos) evalúa las alertas activas y sus tiempos transcurridos.
- **Then** a las 24h en OPEN: escala automáticamente al nivel L2 (analista senior), notificando al asignado original y al nuevo.
- **And** a las 48h en OPEN o IN_PROGRESS sin resolución: escala a L3 (Oficial de Cumplimiento), notificando a toda la cadena.
- **And** a las 72h sin resolución: escala a notificación urgente a todos los roles administrativos del tenant con marca de "SLA vencido" y cambio de criticidad a CRITICAL.
- **And** registra cada evento de escalación en `alert_escalation_log` con timestamp, nivel escalado, motivo y usuarios notificados.
- **And** recalcula el MTTR (Mean Time to Resolution) del despacho tras cada cierre de alerta.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.01 (configuración de criticidad y SLAs), HU-10.04 (routing inteligente).
- Los umbrales de escalación (24h/48h/72h) son defaults configurables por tenant en `tenant_config`.
- El SLA corre en horas hábiles (lunes a viernes, 9:00-18:00 hora del tenant); fines de semana y festivos no cuentan para el timer (basado en `fiscal_calendar` de HU-08.02).
- Niveles de escalación: L1 = analista asignado, L2 = analista senior/líder, L3 = Oficial de Cumplimiento, L4 = administrador del tenant (solo para 72h+).
- La escalación no desasigna al analista original; este mantiene la responsabilidad primaria.
- Si la alerta es CRITICAL, la ventana de escalación se reduce a la mitad (12h/24h/36h).
- Celery Beat ejecuta el chequeo de SLA cada 15 minutos para detectar alertas que cruzan umbrales.

**Criterios de aceptación:**
1. Una alerta HIGH que permanece 24h en OPEN recibe escalación a L2 con notificación a ambos niveles.
2. Una alerta CRITICAL que permanece 12h en OPEN recibe escalación a L2 (ventana reducida al 50%).
3. Los fines de semana no cuentan para el cómputo de horas del SLA timer.
4. El módulo `sla_timer.py` tiene cobertura ≥ 75% con pruebas de todos los niveles de escalación y ventanas reducidas.

**Impactos y consideraciones:**
- Esencial para cumplimiento regulatorio: la UIF puede sancionar al despacho por omisión de atención de alertas en plazos razonables.
- La definición de horas hábiles depende del calendario fiscal; requiere coordinación con HU-08.02 para precisión en los cómputos.

**Referencias y trazabilidad:**
- SAD: §9.10 — Alertas y gestión de SLA, §10.8 — Apertura, atención, locking y cierre de alertas, §17.5 — Configuración de criticidad y SLAs
- SAD-Lite: §7 — Cumplimiento y alertas
- Developer Handbook: §9.3 — SLA timer y escalación automática
- ADR: ADR-0001 — Row-Level Security como base de aislamiento multi-tenant
- Tablas afectadas: `alerts`, `alert_escalation_log`, `alert_assignment_log`, `tenant_config`
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas

---

#### HU-10.06 — Cierre de Alertas con Co-Firma Digital: Doble Validación Analista + Oficial

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** Alertas (SAD §9.10), Core Fiscal (SAD §10.8), WORM y Auditoría (SAD §11.8)
**Historia:** Como Oficial de Cumplimiento, quiero que el cierre de una alerta requiera obligatoriamente la co-firma digital de dos roles (analista que investigó + Oficial de Cumplimiento que revisa), registrando ambas firmas con timestamp, comentario y hash criptográfico en bitácora WORM, para asegurar la segregación de funciones, prevenir cierres unilaterales y mantener trazabilidad forense completa ante auditorías regulatorias.

**Alcance:** Backend Core Fiscal (Python 3.12), Frontend SPA con flujo de doble validación.

**Historia en formato Given/When/Then:**
- **Given** un analista ha completado la investigación de una alerta, documentado hallazgos y la transiciona a estado RESOLVED.
- **When** el analista solicita el cierre definitivo de la alerta.
- **Then** el sistema transiciona la alerta a estado PENDING_CLOSURE y notifica al Oficial de Cumplimiento que tiene una alerta pendiente de co-firma.
- **And** el Oficial de Cumplimiento revisa la investigación, hallazgos y conclusión del analista desde el portal de cumplimiento (HU-03.03).
- **And** el Oficial puede: (a) aprobar el cierre → la alerta transiciona a CLOSED con doble firma registrada, o (b) rechazar → la alerta regresa a IN_PROGRESS con comentario de rechazo.
- **And** ambas firmas se registran en `alert_closure_log` con: `alert_id`, `analyst_id`, `analyst_signature` (hash), `officer_id`, `officer_signature` (hash), `closure_timestamp`, `conclusion`, `rejection_reason` (si aplica).
- **And** la tabla `alert_closure_log` es WORM: triggers anti-UPDATE/DELETE garantizan inmutabilidad del registro de co-firma.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.02 (Alert Locking operativo).
- El flujo de cierre es: OPEN → IN_PROGRESS → RESOLVED (por analista) → PENDING_CLOSURE → CLOSED (por Oficial).
- No se puede cerrar una alerta sin co-firma: el endpoint `POST /api/v1/alerts/{id}/close` requiere que el usuario tenga rol `compliance_officer` y que la alerta esté en estado PENDING_CLOSURE.
- El analista que investigó no puede ser el mismo que aprueba el cierre (segregación de funciones).
- La firma digital consiste en un hash SHA-256 compuesto por: `alert_id + user_id + timestamp + action + conclusion`.
- El registro de co-firma en `alert_closure_log` es inmutable (triggers anti-UPDATE/DELETE).
- Si el Oficial rechaza el cierre, la alerta vuelve al analista con el motivo de rechazo visible.

**Criterios de aceptación:**
1. Una alerta en PENDING_CLOSURE solo puede ser cerrada por un usuario con rol `compliance_officer` distinto del analista asignado.
2. El intento de cierre por el mismo analista que investigó es rechazado con HTTP 403 y mensaje de segregación de funciones.
3. El registro en `alert_closure_log` contiene ambas firmas con hash verificable y no puede ser modificado tras su creación.
4. El módulo `alert_co_sign.py` tiene cobertura ≥ 75% con pruebas de flujo completo (aprobar y rechazar).

**Impactos y consideraciones:**
- Satisface requisitos de control interno y segregación de funciones exigidos por reguladores financieros y de PLD.
- Requiere que el despacho tenga al menos un Oficial de Cumplimiento registrado; sin este rol, el cierre de alertas queda bloqueado.

**Referencias y trazabilidad:**
- SAD: §9.10 — Alertas y gestión de SLA, §10.8 — Apertura, atención, locking y cierre de alertas, §11.8 — Inmutabilidad y WORM (Caja Negra de Auditoría)
- SAD-Lite: §7 — Cumplimiento y alertas
- Developer Handbook: §9.4 — Flujo de co-firma para cierre de alertas
- ADR: ADR-0008 — Trazabilidad forense y no repudio (Caja Negra WORM)
- Tablas afectadas: `alerts`, `alert_closure_log` (nueva, WORM), `audit_logs`, `users`
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas

---

#### HU-10.07 — Dashboard de Alertas Vencidas con Métricas de Tiempo Medio de Resolución (MTTR)

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** Alertas (SAD §9.10), Frontend SPA (SAD §18.2)
**Historia:** Como Administrador del Despacho / Oficial de Cumplimiento, quiero un dashboard dedicado que muestre las alertas vencidas (SLA expirado), el tiempo medio de resolución (MTTR) del equipo y tendencias de cumplimiento de SLA, para identificar cuellos de botella operativos, evaluar el desempeño del equipo de analistas y demostrar ante auditorías que el despacho mantiene control sobre sus tiempos de respuesta.

**Alcance:** Backend Core Fiscal (API de métricas) + Frontend SPA (React 19, Vanilla CSS Liquid Glass).

**Historia en formato Given/When/Then:**
- **Given** el despacho tiene múltiples alertas en distintos estados con diferentes tiempos de resolución históricos.
- **When** el Administrador accede al dashboard de alertas vencidas desde el HUD.
- **Then** el sistema presenta un panel con: (a) contador de alertas vencidas clasificadas por criticidad, (b) tabla de alertas vencidas con tax_profile, tipo, tiempo transcurrido y analista asignado, (c) gráfico de MTTR diario/semanal/mensual, (d) porcentaje de alertas resueltas dentro del SLA.
- **And** permite filtrar por periodo, tipo de alerta (PLD/69-B/OFAC/riesgo), criticidad y analista asignado.
- **And** muestra tendencia de MTTR: si está mejorando (↓) o deteriorándose (↑) respecto al periodo anterior.
- **And** permite exportar el dashboard a PDF para reportes de gestión.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.05 (SLA timer y escalación automática operativo).
- MTTR se calcula como: Σ(tiempo_resolución) / count(alertas cerradas) en el periodo, donde tiempo_resolución = `closed_at - created_at` en horas hábiles.
- SLA cumplido se define como: alerta cerrada antes de que transcurra el umbral de SLA configurado para su criticidad.
- Los datos se obtienen del endpoint `GET /api/v1/alerts/sla-metrics?period=7d|30d|90d&group_by=day|week|month`.
- El dashboard debe ser responsive y cumplir con WCAG 2.1 AA.
- El frontend utiliza Vanilla CSS con diseño Liquid Glass consistente con el HUD (HU-13.01).

**Criterios de aceptación:**
1. El dashboard muestra correctamente el número de alertas vencidas y su distribución por criticidad para el periodo seleccionado.
2. El MTTR calculado para los últimos 30 días coincide con el promedio manual de tiempos de resolución de las alertas cerradas en ese periodo.
3. El gráfico de tendencia de MTTR refleja correctamente mejoras o deterioros respecto al periodo anterior.
4. Las pruebas del componente `sla_dashboard.tsx` cubren ≥ 75% y validan filtros, exportación y responsividad.

**Impactos y consideraciones:**
- Proporciona visibilidad operativa al despacho sobre la efectividad del equipo de cumplimiento, permitiendo ajustes de personal o procesos.
- Un MTTR consistentemente alto puede indicar necesidad de más analistas o automatización de procesos de investigación.

**Referencias y trazabilidad:**
- SAD: §9.10 — Alertas y gestión de SLA, §10.8 — Apertura, atención, locking y cierre de alertas, §18.2 — Dashboard Tactical HUD
- SAD-Lite: §7 — Cumplimiento y alertas
- Developer Handbook: §9.5 — Dashboard de métricas de SLA
- ADR: ADR-0001 — Row-Level Security como base de aislamiento multi-tenant
- Tablas afectadas: `alerts`, `alert_closure_log`, `alert_escalation_log`
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas

---

#### HU-10.08 — Plantillas de Respuesta Estandarizadas para Tipos de Alerta Recurrentes

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** Alertas (SAD §9.10), Core Fiscal (SAD §10.8)
**Historia:** Como Analista de Cumplimiento, quiero disponer de plantillas de respuesta predefinidas para los tipos de alerta más recurrentes (ej. "proveedor listado 69-B", "coincidencia OFAC baja", "operación inusual monto bajo"), para agilizar la documentación de hallazgos, asegurar consistencia en las conclusiones del equipo y reducir el tiempo de investigación en casos rutinarios.

**Alcance:** Backend Core Fiscal (Python 3.12, CRUD de plantillas), Frontend SPA con editor de plantillas.

**Historia en formato Given/When/Then:**
- **Given** un analista ha investigado una alerta de tipo "proveedor listado 69-B" con resultado "falso positivo — proveedor dado de baja del listado en corte posterior".
- **When** el analista documenta la conclusión de la alerta.
- **Then** el sistema ofrece una lista de plantillas de respuesta filtradas por tipo de alerta.
- **And** el analista selecciona la plantilla "69-B — baja posterior", que pre-rellena el campo de conclusión con texto estandarizado y slots para completar (RFC del proveedor, fecha de baja, evidencia).
- **And** el analista puede personalizar el texto antes de guardar.
- **And** el Administrador puede crear, editar y desactivar plantillas desde el panel de configuración.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.01 (configuración base operativa).
- Las plantillas se gestionan vía CRUD en `response_templates` con campos: `id`, `tenant_id`, `alert_type` (PLD/69B/OFAC/RISK), `title`, `body` (con placeholders {{variable}}), `is_active`.
- Placeholders soportados: `{{rfc}}`, `{{razon_social}}`, `{{monto}}`, `{{fecha_deteccion}}`, `{{tipo_alerta}}`, `{{analista}}`.
- Las plantillas se filtran por `alert_type` para mostrar solo las relevantes al tipo de alerta que se está cerrando.
- El Administrador del tenant puede gestionar plantillas (crear, editar, desactivar); no se permite borrado físico (soft-delete con `is_active=false`).
- Las plantillas heredan RLS: cada tenant gestiona sus propias plantillas.

**Criterios de aceptación:**
1. Al documentar una alerta 69-B, el sistema muestra solo plantillas de tipo `69B`.
2. Seleccionar una plantilla rellena el campo de conclusión con el texto base y placeholders sustituidos por los datos reales de la alerta.
3. Un administrador puede crear una nueva plantilla y está disponible inmediatamente para todos los analistas del tenant.
4. El módulo `response_templates.py` tiene cobertura ≥ 75% y pruebas de sustitución de placeholders.

**Impactos y consideraciones:**
- Reduce el tiempo de cierre de alertas rutinarias en hasta un 40%, permitiendo a los analistas enfocarse en casos complejos.
- La calidad de las plantillas depende del conocimiento del dominio; se recomienda una revisión inicial por el Oficial de Cumplimiento.

**Referencias y trazabilidad:**
- SAD: §9.10 — Alertas y gestión de SLA, §10.8 — Apertura, atención, locking y cierre de alertas
- SAD-Lite: §7 — Cumplimiento y alertas
- Developer Handbook: §9.6 — Plantillas de respuesta a alertas
- ADR: ADR-0001 — Row-Level Security como base de aislamiento multi-tenant
- Tablas afectadas: `response_templates` (nueva), `alerts`
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas

---

#### HU-10.09 — Workflow Completo de Ciclo de Vida de Alerta: OPEN → IN_PROGRESS → RESOLVED → CLOSED

**Épica:** EP-10 — Alertas, Locking y Gestión de SLA
**Módulo(s):** Alertas (SAD §9.10), Core Fiscal (SAD §10.8)
**Historia:** Como Analista de Cumplimiento, quiero que el sistema gestione el ciclo de vida completo de una alerta con estados formales (OPEN → IN_PROGRESS → RESOLVED → CLOSED) y transiciones controladas, donde cada cambio de estado quede registrado en bitácora con condiciones de guarda (no se puede resolver sin investigación, no se puede cerrar sin co-firma), para asegurar la integridad del proceso de atención de alertas y su trazabilidad completa.

**Alcance:** Backend Core Fiscal (Python 3.12, máquina de estados), Frontend SPA con visualización de workflow.

**Historia en formato Given/When/Then:**
- **Given** una alerta ha sido creada por el motor PLD en estado OPEN.
- **When** un analista toma la alerta (locking, HU-10.02).
- **Then** la alerta transiciona automáticamente a IN_PROGRESS.
- **And** el analista investiga, documenta hallazgos en el campo `investigation_notes` y adjunta evidencia si es necesario.
- **And** cuando concluye la investigación, transiciona manualmente a RESOLVED con una conclusión obligatoria.
- **And** la alerta pasa a PENDING_CLOSURE y requiere co-firma del Oficial de Cumplimiento (HU-10.06).
- **And** al recibir la co-firma, transiciona a CLOSED de forma definitiva e inmutable.
- **And** cada transición de estado queda registrada en `alert_state_log` con: `alert_id`, `from_state`, `to_state`, `user_id`, `timestamp`, `comment`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.02 (Alert Locking), HU-10.06 (co-firma).
- Máquina de estados definida formalmente:
  - `OPEN`: estado inicial al crearse la alerta.
  - `IN_PROGRESS`: un analista ha hecho lock de la alerta (transición automática).
  - `RESOLVED`: el analista ha concluido la investigación y documentado hallazgos.
  - `PENDING_CLOSURE`: el analista solicita cierre; requiere co-firma del Oficial.
  - `CLOSED`: estado final inmutable; no admite más transiciones.
  - `REOPENED` (excepción): solo el Oficial puede reabrir una alerta CLOSED si surge nueva evidencia.
- Condiciones de guarda (state guards):
  - OPEN → IN_PROGRESS: requiere lock exitoso y usuario con rol `analyst`.
  - IN_PROGRESS → RESOLVED: requiere `investigation_notes` no vacío y al menos un hallazgo documentado.
  - RESOLVED → PENDING_CLOSURE: requiere que el usuario solicitante sea el analista asignado (lock owner).
  - PENDING_CLOSURE → CLOSED: requiere co-firma de Oficial de Cumplimiento (HU-10.06).
  - CLOSED → REOPENED: solo Oficial de Cumplimiento; genera nuevo registro de auditoría.
- Transiciones no permitidas (ej. OPEN → CLOSED directo) deben ser rechazadas con HTTP 422 y mensaje descriptivo.
- El campo `investigation_notes` es JSONB que incluye: hallazgos (texto), evidencia adjunta (referencias a `vault_files`), conclusión (texto obligatorio para RESOLVED).
- El endpoint `POST /api/v1/alerts/{id}/transition` acepta `{ "to_state": "...", "comment": "..." }` y aplica las guardas.

**Criterios de aceptación:**
1. Intentar transicionar una alerta de OPEN a CLOSED directamente es rechazado con HTTP 422 y mensaje de transición no permitida.
2. Intentar transicionar de IN_PROGRESS a RESOLVED sin `investigation_notes` poblado es rechazado.
3. El historial completo de transiciones de una alerta se recupera vía `GET /api/v1/alerts/{id}/history` en orden cronológico.
4. El módulo `alert_workflow.py` tiene cobertura ≥ 75% con pruebas de todas las transiciones válidas e inválidas.

**Impactos y consideraciones:**
- Formaliza el proceso de atención de alertas, eliminando ambigüedades sobre quién hizo qué y cuándo, lo cual es crítico en auditorías de cumplimiento.
- El estado REOPENED debe usarse con criterio restringido; cada reapertura debe justificarse con evidencia nueva registrada en bitácora.

**Referencias y trazabilidad:**
- SAD: §9.10 — Alertas y gestión de SLA, §10.8 — Apertura, atención, locking y cierre de alertas, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §7 — Cumplimiento y alertas
- Developer Handbook: §9.7 — Workflow y ciclo de vida de alertas
- ADR: ADR-0007 — Estrategia de Alert Locking con Redis, ADR-0001 — Row-Level Security como base de aislamiento multi-tenant
- Tablas afectadas: `alerts`, `alert_state_log` (nueva), `alert_closure_log`, `audit_logs`
- Flujo crítico SAD §10: §10.8 — Apertura, atención, locking y cierre de alertas

---

## Resumen de HUs Redactadas

| Épica | NEW HUs | Total HUs en JSON | Pendientes (MAPPED ya existentes) |
|:---|:---:|:---:|:---|
| EP-08 — Riesgo Matemático y Versionado | 7 | 10 | 3 |
| EP-09 — PLD, OFAC/ONU/PEPs y 69-B | 6 | 10 | 4 |
| EP-10 — Alertas, Locking y Gestión de SLA | 7 | 9 | 2 |
| **Total** | **20** | **29** | **9** |

---

*Documento generado conforme al Golden Template canónico de Sentinel Nexus 360 Enterprise v3.1.1-MASTER.*
*Canonical: Jaro-Winkler ≥ 0.92, IA contradiction < 90%, PostgreSQL 17, Python 3.12.*
*Referencias: `documentacion/` no `docs/`.*

---

### 5.11 EP-11 — Vault, NOM-151 y Exportación

#### HU-11.01 — Crear caso de evidencia vinculado a alerta o perfil fiscal

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** SAD §9.8 (Vault) — API de gestión de casos de evidencia, SAD §11.8 (Inmutabilidad y WORM) — Registro inmutable de creación de caso, SAD §10.9 (Exportación de Evidencia) — Flujo de gestión de evidencia fiscal
**Historia:** Como contador de un despacho que está revisando una alerta fiscal, quiero crear un caso de evidencia vinculado a esa alerta (o directamente a un `tax_profile`) donde pueda agrupar todos los documentos, capturas de pantalla, XMLs de CFDI, acuses del SAT, y notas de revisión que justifiquen mi decisión sobre la alerta, para construir un expediente de defensa fiscal trazable, inmutable y listo para ser presentado ante el SAT o la UIF en caso de auditoría, con garantía de cadena de custodia desde el primer documento.

**Alcance:**
API de Vault (`POST/GET/PATCH /api/v1/vault/cases`). Creación en `vault_cases` vinculado a `alert_id` y/o `tax_profile_id`. Vinculación de documentos existentes. Dashboard en HUD Liquid Glass. No cubre subida de documentos (HU-11.02), sellado NOM-151 (HU-11.02), ni exportación de expediente (HU-11.04).

**Historia en formato Given/When/Then:**
- **Given** que el contador Carlos está revisando la alerta PLD `AL-0042` y ha determinado que es procedente: las 4 facturas del proveedor XYZ SA de CV por $2M MXN en 30 días constituyen operaciones inusuales reportables a la UIF.
- **When** Carlos pulsa "Crear Caso de Evidencia", completa el formulario con `linked_alert_id = 'AL-0042'`, `linked_tax_profile_id = 'TP-007'`, y envía `POST /api/v1/vault/cases`.
- **Then** el Core Fiscal crea registro en `vault_cases` con `case_id` UUID v4, estado `OPEN`, `created_by = 'U-CARLOS'`, y registra `VAULT_CASE_CREATED` en `audit_logs`.
- **And** el caso aparece en el HUD como sección expandible en la alerta `AL-0042` y en la vista del `tax_profile`, con título, estado, contador de documentos, y botón "Abrir Caso".
- **And** las facturas que dispararon la alerta se vinculan automáticamente al caso, creando referencias bidireccionales. Un caso también puede crearse sin `alert_id` (vinculado solo a `tax_profile_id`) para documentación preventiva.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-09.02 (Motor PLD: cálculo dinámico por UMAs con ventana móvil de 30 días).
- Regla de negocio: Un caso es el contenedor organizativo de la defensa fiscal. Puede vincularse a una o más alertas y tax_profiles. Inmutable en contenido transaccional una vez cerrado (`CLOSED`): no se pueden añadir/eliminar documentos. Borrado solo posible en estado `OPEN` y sin documentos vinculados. Trazabilidad: fecha de creación, creador, historial de cambios de estado, lista de documentos con SHA-256, timestamps. El caso no es el expediente exportable (HU-11.04): el caso es el contenedor vivo; el expediente es la exportación congelada y firmada.

**Criterios de aceptación:**
1. Contador crea caso vinculado a `AL-0042` y `TP-007`, recibe `201` con `case_id`, aparece en vistas de alerta y tax_profile.
2. Caso sin `alert_id` (solo `tax_profile_id`) se crea con `linked_alert_id = NULL`.
3. Caso `CLOSED` rechaza modificaciones con `422: case is closed — cannot modify`.
4. Historial de cambios registrado en `audit_logs` con `old_state` y `new_state`.
5. Tests (`test_vault_case.py`) cubren ≥85%: creación vinculada a alerta, a tax_profile, a ambos, cambios OPEN→CLOSED→ARCHIVED, modificar caso cerrado, borrar caso con documentos, consulta y listados, verificación audit_logs.

**Impactos y consideraciones:**
- El Vault transforma a Sentinel de sistema de detección a sistema de defensa fiscal completo. Sin evidencia documentada, una alerta es solo una señal; con el caso, se convierte en argumento de defensa. La dependencia HU-09.02 es de negocio, no técnica (el equipo de Vault puede desarrollar con alertas mockeadas).

**Referencias y trazabilidad:**
- SAD: §9.8 — Vault y Gestión de Casos de Evidencia, §11.8 — Inmutabilidad y WORM, §10.9 — Exportación de Evidencia Fiscal
- SAD-Lite: §8 — Escenarios Críticos de Operación
- Developer Handbook: §11.1 — Creación de Casos de Evidencia Vinculados a Alertas y Perfiles Fiscales
- ADR: ADR-015 — Estrategia de Vault y Casos de Evidencia para Defensa Fiscal
- Tablas afectadas: `vault_cases`, `vault_files`, `alerts`, `tax_profiles`, `audit_logs`
- Flujo crítico SAD §10: §10.9 (Exportación de evidencia para defensa fiscal — Creación de casos Vault)

---

#### HU-11.02 — Subir documentos a Vault y generar sello NOM-151

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** SAD §9.8 (Vault) — API de subida de documentos y sellado NOM-151, SAD §11.8 (Inmutabilidad y WORM) — Almacenamiento inmutable en S3 con Object Lock
**Historia:** Como contador que está documentando un caso de evidencia, quiero subir archivos (PDFs de facturas, XMLs de CFDI, capturas de pantalla del portal del SAT, documentos de identificación, acuses de declaraciones, contratos) al Vault de Sentinel, donde cada archivo se almacene de forma inmutable en S3 con Object Lock, reciba automáticamente un sello criptográfico NOM-151-SCFI-2016 a través de un Proveedor de Servicios de Certificación (PSC) autorizado por la Secretaría de Economía, y se registre en la bitácora del caso con su hash SHA-256, timestamp certificado y cadena de custodia, garantizando admisibilidad legal como evidencia digital con presunción de integridad.

**Alcance:**
API de subida (`POST /api/v1/vault/cases/{case_id}/documents` con `multipart/form-data`). Almacenamiento en S3 con Object Lock en modo GOVERNANCE. Integración con PSC autorizado para sello NOM-151. Cálculo de SHA-256 antes y después del sellado. Registro en `vault_files`. No cubre verificación periódica de integridad (HU-11.07) ni configuración granular de Object Lock (HU-11.10).

**Historia en formato Given/When/Then:**
- **Given** que Carlos tiene el caso `VC-0192` abierto y necesita subir 4 PDFs y 2 capturas de pantalla del SAT.
- **When** arrastra los 6 archivos a la drop-zone del caso y el frontend envía `POST /api/v1/vault/cases/VC-0192/documents`.
- **Then** para cada archivo: (a) valida tipo MIME (PDF, XML, PNG, JPG, DOCX; máximo 50 MB), (b) calcula SHA-256 del contenido, (c) sube a S3 con Object Lock modo GOVERNANCE (retención mínima 5 años), (d) invoca PSC para sello NOM-151 sobre el hash SHA-256, (e) crea registro en `vault_files`.
- **And** los archivos aparecen en la línea de tiempo del caso con nombre, tipo, tamaño, hash truncado, badge "Sello NOM-151 verificado", y botones de descarga/verificación.
- **And** si la API del PSC no está disponible, el archivo se sube con estado `PENDING_SEAL` y worker reintenta cada 30 min hasta 24h.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.01 (Crear caso de evidencia vinculado a alerta o perfil fiscal).
- Regla de negocio: El sellado NOM-151-SCFI-2016 es requisito legal para valor probatorio pleno en México. El sello certifica existencia en fecha cierta, integridad (hash), e identidad del solicitante. Tipos permitidos: PDF, XML, PNG, JPG, JPEG, DOCX, XLSX, ZIP. Máximo 50 MB por archivo. Documentos subidos son inmediatamente inmutables (no modificar ni eliminar; solo marcado `LEGAL_HOLD` o sujeto a política de retención en HU-11.05). Costo por sello ($5-50 MXN según volumen) se traslada al modelo FinOps.

**Criterios de aceptación:**
1. Seis archivos (4 PDF + 2 PNG) subidos simultáneamente, almacenados en S3 con Object Lock, sellados con NOM-151, visibles en timeline en ≤30s.
2. SHA-256 de cada archivo coincide bit a bit con hash calculado localmente antes de la subida.
3. Archivo con MIME no permitido (.exe) rechazado con `422: file type not allowed` antes de subida a S3.
4. Si API PSC falla, archivo se almacena con `PENDING_SEAL` y worker completa sellado en siguiente ciclo.
5. Tests (`test_nom151_seal.py`) cubren ≥85%: subida exitosa PDF/XML/PNG, validación MIME, validación tamaño, cálculo SHA-256, generación sello NOM-151, fallo PSC con reintento, S3 Object Lock, protección WORM (no eliminar).

**Impactos y consideraciones:**
- El Vault con NOM-151 es el diferenciador legal más potente de Sentinel. Sin sello, los documentos digitales son impugnables (la contraparte alega alteración). Con el sello, la carga de la prueba se invierte. Object Lock en modo GOVERNANCE permite a un rol autorizado modificar la retención pero no eliminar el objeto.

**Referencias y trazabilidad:**
- SAD: §9.8 — Vault y Subida de Documentos, §11.8 — Inmutabilidad, WORM y S3 Object Lock
- SAD-Lite: §8 — Escenarios Críticos de Operación y Evidencia Legal
- Developer Handbook: §11.2 — Subida de Documentos a Vault y Sellado NOM-151 vía PSC
- ADR: ADR-015 — Estrategia de Sellado NOM-151 y Almacenamiento Inmutable en Vault
- Tablas afectadas: `vault_files`, `vault_cases`, `audit_logs`
- Flujo crítico SAD §10: §10.9 (Exportación de evidencia — Subida y sellado de documentos)

---

#### HU-11.03 — Consultar historial de evidencia por alerta/perfil fiscal

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** SAD §9.8 (Vault) — API de consulta de historial, SAD §9.1 (Frontend SPA) — Visualizador de historial, SAD §11.8 (Inmutabilidad y WORM) — Bitácora de acceso a evidencia
**Historia:** Como contador u Oficial de Cumplimiento, quiero consultar el historial completo de evidencia asociado a una alerta específica o a un perfil fiscal —viendo todos los casos de evidencia, documentos, sellos NOM-151, fechas, autores, y cadena de custodia— para tener una visión integral de la documentación de defensa fiscal acumulada y presentarla de forma estructurada durante una auditoría del SAT o revisión interna de cumplimiento.

**Alcance:**
API (`GET /api/v1/vault/cases?alert_id=X`, `GET /api/v1/vault/cases?tax_profile_id=Y`, `GET /api/v1/vault/cases/{case_id}/timeline`). Bitácora de acceso: cada consulta registrada con `VAULT_HISTORY_ACCESSED` en `audit_logs`. Vista de línea de tiempo cronológica. No cubre gráfico interactivo de cadena de custodia (HU-11.08).

**Historia en formato Given/When/Then:**
- **Given** que el Oficial de Cumplimiento necesita preparar documentación del `tax_profile` `ABC123456XXX` para auditoría del SAT. Durante 6 meses se crearon 3 casos (VC-0192, VC-0215, VC-0301) con 28 documentos sellados.
- **When** accede a "Historial de Evidencia" del tax_profile y el frontend solicita `GET /api/v1/vault/cases?tax_profile_id=TP-007&status=ALL&sort=-created_at`.
- **Then** el Core Fiscal retorna lista paginada de casos con `case_id`, `title`, `status`, `created_by`, `document_count`, `last_activity_at`, y resumen de tipos de documentos (ej. "4 PDFs, 2 XMLs, 1 PNG"). Consulta en ≤500 ms.
- **And** al hacer clic en un caso, la línea de tiempo (`GET .../timeline`) muestra cronológicamente: creación, cada subida de documento (nombre, tipo, tamaño, hash truncado, badge NOM-151), cambios de estado, y accesos registrados.
- **And** cada acceso al historial se registra en `audit_logs` con `event_type = 'VAULT_HISTORY_ACCESSED'`, `user_id`, `target_type`, `target_id`, y `query_params`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.01 (Crear caso de evidencia vinculado a alerta o perfil fiscal).
- Regla de negocio: Acceso gobernado por RBAC: OWNER/ADMIN ven todos los casos; ACCOUNTANT solo de tax_profiles asignados; VIEWER solo `coverage_level = 'PUBLIC'`. Bitácora `VAULT_HISTORY_ACCESSED` auditada trimestralmente para detectar accesos inusuales. Línea de tiempo inmutable: muestra todos los eventos desde creación.

**Criterios de aceptación:**
1. `GET /api/v1/vault/cases?tax_profile_id=TP-007` retorna 3 casos en ≤500 ms con paginación y metadatos completos.
2. `GET /api/v1/vault/cases/VC-0192/timeline` retorna todos los eventos en orden cronológico.
3. ACCOUNTANT consultando casos de tax_profile no asignado recibe `403 Forbidden`.
4. Cada consulta registra `VAULT_HISTORY_ACCESSED` en `audit_logs` con parámetros de consulta.
5. Tests (`test_vault_query.py`) cubren ≥85%: consulta por alert_id, por tax_profile_id, combinada, timeline vacío y con 10+ eventos, verificación RBAC, registro de acceso, paginación.

**Impactos y consideraciones:**
- Cierra el ciclo de transparencia: no solo se documenta la defensa fiscal, sino que se audita quién accedió a qué evidencia. La bitácora `VAULT_HISTORY_ACCESSED` complementa la Caja Negra WORM de HU-11.06.

**Referencias y trazabilidad:**
- SAD: §9.8 — Vault y Consulta de Historial, §9.1 — Frontend y Visualizador de Evidencia, §11.8 — Inmutabilidad, WORM
- SAD-Lite: §8 — Escenarios Críticos de Operación
- Developer Handbook: §11.3 — Consulta de Historial de Evidencia por Alerta/Perfil Fiscal
- ADR: ADR-0008 — Mandato de Inmutabilidad de Bitácoras de Auditoría
- Tablas afectadas: `vault_files`, `vault_cases`, `audit_logs`
- Flujo crítico SAD §10: §10.9 (Exportación de evidencia — Consulta de historial Vault)

---

#### HU-11.04 — Exportar expediente de evidencia para auditoría (WORM)

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** SAD §9.8 (Vault) — API de exportación de expedientes WORM, SAD §11.8 (Inmutabilidad y WORM) — Firma digital y empaquetado de expediente
**Historia:** Como Oficial de Cumplimiento que debe responder a una auditoría del SAT, quiero exportar un caso de evidencia completo como expediente WORM firmado digitalmente —un ZIP con todos los documentos del caso, índice firmado SHA-256, sellos NOM-151, manifiesto de cadena de custodia con timestamps verificables, y declaración de integridad— para entregar a la autoridad fiscal un paquete de evidencia autoverificable, inviolable y que cumpla con requisitos del CFF para documentación digital en procedimientos de auditoría.

**Alcance:**
API (`POST /api/v1/vault/cases/{case_id}/export`). Worker Celery genera expediente ZIP con estructura canónica: `index.json`, `documents/`, `nom151_seals/`, `manifest.json`, `SHA256SUMS`, `verify.sh`. Firma digital con clave del despacho. Registro `VAULT_EXPORT_CREATED`. No cubre exportación masiva con filtros (HU-11.09).

**Historia en formato Given/When/Then:**
- **Given** que el Oficial ha completado la investigación del caso `VC-0192` (28 documentos sellados, estado `CLOSED`) y el SAT solicita documentación de respaldo para las facturas del proveedor XYZ.
- **When** pulsa "Exportar Expediente", selecciona opciones (línea de tiempo completa, sellos NOM-151, formato ZIP), y confirma.
- **Then** el worker `vault_export`: (a) recopila documentos desde S3, (b) genera `index.json` con metadatos, (c) copia originales a `documents/` y sellos a `nom151_seals/`, (d) genera `manifest.json` con cadena de custodia, (e) calcula `SHA256SUMS`, (f) firma digitalmente el ZIP con clave del despacho, (g) almacena en S3 con Object Lock, (h) notifica con enlace de descarga (válido 7 días).
- **And** el expediente es autoverificable: `verify.sh` ejecuta `sha256sum -c SHA256SUMS` y verifica firma digital con `openssl`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.02 (Subir documentos a Vault y generar sello NOM-151).
- Regla de negocio: La exportación WORM "congela" un caso para entrega externa. El expediente es un snapshot inmutable; cambios posteriores no se reflejan. Solo permitida para casos `CLOSED`. La estructura sigue guías del SAT para documentación fiscal digital. Clave privada del despacho cifrada; su uso requiere confirmación 2FA del Oficial. Enlace de descarga expira en 7 días.

**Criterios de aceptación:**
1. Exportación de caso con 28 documentos (~50 MB) en ≤3 min, ZIP firmado, Oficial notificado con enlace.
2. ZIP descomprimido contiene estructura canónica completa.
3. `sha256sum -c SHA256SUMS` verifica integridad de todos los archivos.
4. `openssl verify` confirma firma digital del despacho correcto sin alteración.
5. Tests (`test_worm_export.py`) cubren ≥85%: exportación exitosa, estructura canónica, integridad SHA256SUMS, firma digital, intento exportar caso OPEN (422), documentos sin sello NOM-151 (advertencia en manifiesto), cadena de custodia en manifest.json, expiración de enlace.

**Impactos y consideraciones:**
- La exportación WORM es la culminación del flujo de defensa fiscal. Un expediente bien construido puede ser la diferencia entre una multa y un dictamen favorable. Worker debe manejar casos con cientos de documentos y GB de tamaño; se recomienda streaming S3→ZIP sin cargar todo en memoria.

**Referencias y trazabilidad:**
- SAD: §9.8 — Vault y Exportación de Expedientes WORM, §11.8 — Inmutabilidad, WORM y Firma Digital
- SAD-Lite: §8 — Escenarios Críticos de Operación
- Developer Handbook: §11.4 — Exportación de Expediente de Evidencia WORM Firmado para Auditoría
- ADR: ADR-0005 — Arquitectura de cookies HttpOnly y Firma Digital de Expedientes de Evidencia
- Tablas afectadas: `vault_files`, `vault_cases`, `audit_logs`, `tenant_config`
- Flujo crítico SAD §10: §10.9 (Exportación de evidencia para defensa fiscal — Exportación WORM)

---

#### HU-11.05 — Políticas de retención y borrado controlado legalmente permitido

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** SAD §9.8 (Vault) — API de políticas de retención y borrado, SAD §11.8 (Inmutabilidad y WORM) — Ejecución de políticas de ciclo de vida
**Historia:** Como Oficial de Cumplimiento y administrador del despacho, quiero configurar políticas de retención documental —definiendo periodos según tipo de documento y regulación (5 años fiscal general CFF, 10 años PLD LFPIORPI, permanente para resoluciones)— y ejecutar borrados controlados legalmente permitidos al vencimiento, con flujo de aprobación dual (contador responsable + Oficial de Cumplimiento) que garantice que ningún documento se destruye antes del plazo legal y todo borrado queda registrado inmutablemente en la Caja Negra de Auditoría.

**Alcance:**
API (`POST/GET/PATCH/DELETE /api/v1/admin/retention-policies`). Worker `retention_enforcer` (diario). Flujo de borrado: aviso 30 días antes del vencimiento, confirmación dual, registro `VAULT_DOCUMENT_PURGED` en `audit_logs`. Eliminación física de S3 (bypass Object Lock con credenciales governance). Marcado `status = 'PURGED'` en `vault_files`. No cubre verificación periódica de integridad WORM (HU-11.07).

**Historia en formato Given/When/Then:**
- **Given** que el despacho ha acumulado 5,000+ documentos en 7 años y documentos del ejercicio 2019 superan los 5 años de retención CFF. El Oficial configuró política: `retention_period = 5 años` para `document_type = 'FISCAL_GENERAL'`.
- **When** el worker `retention_enforcer` detecta 42 documentos vencidos y notifica al Oficial con la lista.
- **Then** el Oficial revisa en el panel "Retención Documental" y puede: (a) extender retención (+2 años por litigio activo), (b) marcar `LEGAL_HOLD` (indefinido por orden judicial), o (c) iniciar flujo de borrado con co-firma del contador responsable.
- **And** al confirmar borrado dual, el Core Fiscal: (a) verifica ambos autorizadores (ADMIN + ACCOUNTANT del caso), (b) registra `VAULT_DOCUMENT_PURGED` en `audit_logs` con SHA-256, (c) elimina archivo de S3, (d) marca `status = 'PURGED'` en `vault_files`, (e) notifica completitud.
- **And** si documento tiene `LEGAL_HOLD`, cualquier intento de borrado se rechaza con `422: document is under LEGAL_HOLD`.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.02 (Subir documentos a Vault y generar sello NOM-151).
- Regla de negocio: Periodos por defecto: `FISCAL_GENERAL = 5 años` (CFF art. 30), `PLD = 10 años` (LFPIORPI), `LEGAL_RESOLUTION = permanente`, `AUDIT_LOG = permanente`. Pueden extenderse pero nunca reducirse por debajo de mínimos legales. Borrado requiere doble autorización: ADMIN/OWNER + ACCOUNTANT. Registro en `audit_logs` permanente con SHA-256 del documento borrado. Registro en `vault_files` permanece con `status = 'PURGED'`. `LEGAL_HOLD` impide cualquier borrado; solo removible por Oficial de Cumplimiento con justificación.

**Criterios de aceptación:**
1. Worker detecta 42 documentos vencidos y notifica al Oficial con lista detallada.
2. Borrado con doble autorización completo: S3 eliminado, registro marcado PURGED, evento VAULT_DOCUMENT_PURGED registrado.
3. Intento de borrado con una sola autorización rechazado con `422: dual authorization required`.
4. Intento de borrar documento con LEGAL_HOLD rechazado con `422: document is under LEGAL_HOLD`.
5. Tests (`test_retention_policy.py`) cubren ≥85%: detección de vencidos, borrado dual exitoso, borrado simple rechazado, LEGAL_HOLD, extensión de retención, políticas personalizadas por tipo, registro audit_logs con SHA-256, permanencia de registro vault_files tras borrado físico.

**Impactos y consideraciones:**
- Cierra el ciclo de vida completo del documento en Vault: creación → sellado → uso → vencimiento → borrado legal. Sin este mecanismo, el Vault crecería indefinidamente con costos crecientes y riesgo de conservar documentos más allá del periodo legal. La doble autorización sigue el principio "four eyes" requerido por regulación financiera mexicana.

**Referencias y trazabilidad:**
- SAD: §9.8 — Vault y Políticas de Retención, §11.8 — Inmutabilidad, WORM y Ciclo de Vida
- SAD-Lite: §8 — Escenarios Críticos de Operación
- Developer Handbook: §11.5 — Políticas de Retención y Borrado Controlado Legalmente Permitido
- ADR: ADR-0005 — Arquitectura de cookies HttpOnly y Firmado Digital de Evidencia
- Tablas afectadas: `vault_files`, `vault_cases`, `audit_logs`
- Flujo crítico SAD §10: §10.9 (Exportación de evidencia — Retención y borrado controlado)

---

#### HU-11.06 — Caja Negra de Auditoría WORM en audit_logs

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** SAD §9.8 (Vault) — API de consulta de bitácoras WORM, SAD §11.8 (Inmutabilidad y WORM) — Triggers anti-UPDATE/DELETE y cadena de hash, SAD §9.10 (Observabilidad) — Monitoreo de integridad WORM
**Historia:** Como Oficial de Cumplimiento y arquitecto de seguridad de Sentinel, quiero garantizar que la tabla `audit_logs` funcione como una verdadera Caja Negra de Auditoría WORM —con triggers PostgreSQL 17 que impidan físicamente cualquier UPDATE o DELETE, una cadena de hash SHA-256 encadenada entre registros consecutivos que permita verificar la integridad de toda la secuencia, y monitoreo continuo de intentos de violación— para asegurar que ninguna entidad, ni siquiera un DBA con acceso directo a PostgreSQL, pueda modificar o eliminar el rastro de auditoría sin ser detectado, cumpliendo con los requisitos de inmutabilidad del CFF y la LFPIORPI.

**Alcance:**
Triggers PostgreSQL (`BEFORE UPDATE/DELETE ... RAISE EXCEPTION`) en `audit_logs` y `admin_audit_logs`. Función `generate_audit_hash()`: `row_hash = SHA-256(row_data || prev_hash)`. Worker `worm_audit_checker` (diario). Dashboard de estado WORM en Portal de Cumplimiento (HU-03.03) con badge de integridad. No cubre visualizador WORM (HU-03.03) ni políticas RLS (HU-04.04).

**Historia en formato Given/When/Then:**
- **Given** que Sentinel está en producción con 2M+ registros en `audit_logs` encadenados con hash. Un atacante con acceso superuser a PostgreSQL intenta modificar un registro para ocultar evidencia.
- **When** el atacante ejecuta `UPDATE audit_logs SET event_data = ... WHERE audit_log_id = ...` directamente en psql.
- **Then** el trigger `trg_audit_logs_worm_protection` ejecuta `RAISE EXCEPTION 'WORM_VIOLATION: audit_logs is an immutable audit trail.'`, impidiendo la operación incluso para superuser.
- **And** el intento se registra en `audit_logs_violations` con timestamp, `session_user`, IP origen, query text, y tipo de violación.
- **And** el worker `worm_audit_checker` recorre la cadena diariamente recalculando `row_hash`; si detecta ruptura, genera alerta `WORM_CHAIN_BROKEN` (CRITICAL) y notifica al Oficial.
- **And** el dashboard WORM muestra: badge "Cadena WORM verificada" (verde) o "Cadena WORM rota" (rojo), timestamp del último chequeo, contador de registros, violaciones detectadas, y gráfico de verificaciones diarias.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.04 (Políticas RLS y constraints de rendimiento en PostgreSQL 17).
- Regla de negocio: La Caja Negra WORM es el mecanismo de defensa más extremo contra manipulación de evidencia. Tres capas: (1) triggers PostgreSQL que impiden UPDATE/DELETE, (2) cadena de hash que detecta manipulación que burle triggers (ej. manipulación directa de archivos de datos), (3) monitoreo continuo con alertas. `audit_logs_violations` registra intentos y está protegida con triggers WORM (solo INSERT). Primer registro de cada tenant tiene `prev_hash = NULL` (bloque génesis). Verificación diaria a las 03:00 AM UTC; resultado registrado como `WORM_INTEGRITY_CHECK` en `audit_logs`.

**Criterios de aceptación:**
1. UPDATE sobre `audit_logs` ejecutado por superuser en psql rechazado con `ERROR: WORM_VIOLATION`; intento registrado en `audit_logs_violations`.
2. DELETE igualmente rechazado y registrado.
3. Worker recorre 100,000 registros, recalcula cadena de hash, reporta `PASSED` en ≤30s.
4. Simulando ruptura de cadena (row_hash modificado en test), worker detecta ruptura, genera alerta `WORM_CHAIN_BROKEN` CRITICAL, dashboard muestra badge rojo.
5. Tests (`test_worm_audit.py`) cubren ≥90%: UPDATE/DELETE rechazados y registrados, INSERT permitido con hash correcto, cadena de 1,000 registros verificada, ruptura detectada, cálculo row_hash, bloque génesis, triggers no deshabilitables sin registro.

**Impactos y consideraciones:**
- La Caja Negra WORM es requisito no negociable para admisibilidad legal de evidencia digital. Sin ella, un abogado de la contraparte alegaría manipulación de bitácoras. Con triggers + cadena de hash + monitoreo, Sentinel demuestra afirmativamente inmutabilidad. `audit_logs` debe particionarse por año fiscal (HU-04.08) para mantener rendimiento del worker con volúmenes crecientes.

**Referencias y trazabilidad:**
- SAD: §9.8 — Vault y Caja Negra de Auditoría WORM, §11.8 — Inmutabilidad, WORM y Triggers Anti-Manipulación, §9.10 — Observabilidad y Monitoreo de Integridad
- SAD-Lite: §3 — Seguridad y Cumplimiento Normativo
- Developer Handbook: §11.6 — Caja Negra de Auditoría WORM en audit_logs con Triggers y Cadena de Hash
- ADR: ADR-0008 — Mandato de Inmutabilidad de Bitácoras de Auditoría y Desactivación de Borrados Físicos
- Tablas afectadas: `audit_logs`, `admin_audit_logs`, `audit_logs_violations`
- Flujo crítico SAD §10: §10.9 (Exportación de evidencia para defensa fiscal — Trazabilidad inmutable WORM)

#### HU-11.07 — Verificación Periódica de Integridad WORM en S3

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** Vault de Evidencia / Integridad WORM (SAD §9.8), Inmutabilidad y WORM (SAD §11.8)
**Historia:** Como Oficial de Cumplimiento del despacho, quiero que el sistema ejecute una verificación periódica y automatizada de la integridad de todos los expedientes resguardados en S3 WORM mediante comparación de hash SHA-256 para detectar cualquier corrupción, alteración o pérdida de archivos y generar alertas tempranas ante fallos de integridad que comprometan la validez legal de la evidencia.

**Alcance:** Backend / Workers Celery + Integración S3 + Sistema de alertas

**Historia en formato Given/When/Then:**
- **Given** existen expedientes de evidencia almacenados en el bucket S3 con Object Lock activo y sus hashes SHA-256 registrados en la tabla `vault_files`.
- **When** se ejecuta la tarea programada de verificación de integridad WORM según la frecuencia configurada por tenant (diaria, semanal, mensual).
- **Then** el worker Celery debe descargar cada archivo desde S3, recalcular su hash SHA-256 en local y compararlo contra el hash registrado en `vault_files`.
- **And** debe registrar el resultado de cada verificación en la tabla `vault_integrity_checks` con timestamp, hash esperado, hash calculado y estado (OK/FAIL/MISSING).
- **And** debe generar una alerta automática de criticidad HIGH si se detecta discrepancia de hash o archivo faltante, notificando al Oficial de Cumplimiento por los canales configurados.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.01, HU-11.02
- El hash de referencia es el SHA-256 almacenado en `vault_files` al momento de la carga del expediente y su sellado NOM-151.
- La verificación debe ejecutarse con backoff exponencial y circuit breaker en caso de errores transitorios de conectividad con S3.
- La frecuencia de verificación debe ser configurable por tenant desde el panel de administración del Vault.
- Los archivos cuyo estado en `vault_files` sea `DELETED` o `EXPIRED` por política de retención se excluyen automáticamente de la verificación.
- El job debe registrar métricas de ejecución: tiempo total, archivos verificados, archivos fallidos, bytes procesados.

**Criterios de aceptación:**
1. La verificación programada recorre todos los archivos activos en `vault_files` y recalcula sus hashes desde S3 con concurrencia controlada (máximo 10 descargas simultáneas).
2. Un archivo cuyo hash no coincide genera un registro `VAULT_INTEGRITY_FAIL` en `audit_logs` y una alerta en la tabla `alerts` con tipo `WORM_INTEGRITY_BREACH`.
3. La tarea registra métricas de duración y cantidad de archivos verificados en cada ejecución para el dashboard de salud del Vault.
4. La latencia de verificación por archivo es menor a 500ms en condiciones normales de red (excluyendo tiempo de descarga de archivos >100 MB).
5. Tests unitarios validan la detección de al menos 3 tipos de corrupción: bit flip en el contenido, archivo truncado, y archivo eliminado de S3 sin registro en `vault_files`.
6. Si un archivo no existe en S3 pero sí en `vault_files` con estado `STORED`, se genera alerta de tipo `MISSING` con criticidad CRITICAL.

**Impactos y consideraciones para negocio:**
- Proporciona evidencia continua de integridad ante auditorías regulatorias, reforzando la cadena de custodia WORM y la validez legal de los expedientes.
- El costo de operaciones S3 GET/HEAD debe considerarse en la planificación de capacidad para tenants con grandes volúmenes de evidencia (miles de archivos).

**Referencias y trazabilidad:**
- SAD: §10.9 — Construcción del expediente de evidencia, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §8 — Escenarios Críticos de Operación (Scenario Boxes)
- Developer Handbook: §3.4 — Pipelines de logging forense
- ADR: ADR-015 — Resguardo de Evidencias en Almacenamiento S3 WORM en modo Compliance, ADR-015
- Tablas afectadas: `vault_files`, `vault_integrity_checks`, `audit_logs`, `alerts`
- Flujo crítico SAD §10: §10.9 — Construcción del expediente de evidencia

---

#### HU-11.08 — Cadena de Custodia Interactiva con Trazabilidad Verificable

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** Vault de Evidencia / Cadena de Custodia (SAD §9.8), Inmutabilidad y WORM (SAD §11.8), Tactical HUD (SAD §18.2)
**Historia:** Como Auditor Externo o Autoridad Fiscal, quiero visualizar una cadena de custodia interactiva con gráfico de trazabilidad cronológica que muestre todos los accesos, manipulaciones y sellados de un expediente de evidencia, con timestamps verificables criptográficamente, para validar la integridad procesal del manejo de pruebas documentales sin requerir intervención del personal del despacho.

**Alcance:** Frontend + Backend / Visualización interactiva de trazabilidad + Exportación PDF

**Historia en formato Given/When/Then:**
- **Given** un expediente de evidencia tiene registros de auditoría en `audit_logs` que documentan accesos, descargas, sellados NOM-151, verificaciones de integridad y exportaciones previas.
- **When** un usuario autorizado accede al panel de cadena de custodia desde la vista de detalle del expediente en el Vault.
- **Then** el sistema debe renderizar un gráfico de línea de tiempo interactivo en React 19 mostrando cada evento con su timestamp UTC y local, identificador del usuario, dirección IP, tipo de acción y metadatos relevantes.
- **And** cada nodo del gráfico debe ser verificable criptográficamente mostrando el hash SHA-256 del registro de auditoría correspondiente.
- **And** debe permitir exportar la cadena de custodia completa en formato PDF con firma digital del sistema y código QR de verificación.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.03
- Todo acceso al expediente debe estar registrado previamente en `audit_logs` con acción `EVIDENCE_ACCESS` y metadatos completos (HU-11.03).
- La cadena de custodia debe incluir todos los eventos desde la creación del caso (`CASE_CREATED`) hasta el momento actual sin saltos temporales ni eventos omitidos.
- Los timestamps deben mostrarse en UTC y en la zona horaria del tenant, ambos verificables contra el registro inmutable.
- El gráfico de trazabilidad debe cumplir con accesibilidad WCAG 2.1 AA, incluyendo navegación por teclado y roles ARIA.
- La exportación PDF de cadena de custodia debe incluir un hash SHA-256 del documento generado y una firma digital del sistema.

**Criterios de aceptación:**
1. El gráfico de línea de tiempo muestra todos los eventos del expediente ordenados cronológicamente con iconografía diferenciada por tipo de acción: creación, acceso, descarga, sellado NOM-151, verificación de integridad, exportación, borrado.
2. Al hacer clic en un nodo del gráfico, se despliega el detalle completo del evento incluyendo hash del registro de auditoría, IP, user agent y timestamp con precisión de milisegundos.
3. La exportación PDF de cadena de custodia incluye todos los eventos, firma digital del sistema, código QR verificable y hash SHA-256 del documento.
4. La visualización de la cadena de custodia carga en menos de 2 segundos para expedientes con hasta 500 eventos de trazabilidad.
5. Tests Cypress E2E validan la interactividad del gráfico (expansión de nodos, filtrado por tipo de evento) y la exportación PDF con contenido verificable.
6. El acceso al panel de cadena de custodia genera un registro `CUSTODY_CHAIN_VIEWED` en `audit_logs` garantizando trazabilidad incluso de la consulta de trazabilidad.

**Impactos y consideraciones para negocio:**
- Fortalece la posición legal del despacho ante auditorías del SAT y procedimientos judiciales al demostrar control procesal estricto y no repudio sobre las pruebas documentales.
- Reduce el tiempo y costo de respuesta ante requerimientos de autoridad al tener la cadena de custodia auto-documentada y exportable en formato oficial.

**Referencias y trazabilidad:**
- SAD: §10.9 — Construcción del expediente de evidencia, §11.8 — Inmutabilidad y WORM, §18.2 — Tactical HUD
- SAD-Lite: §8 — Escenarios Críticos de Operación (Scenario Boxes)
- Developer Handbook: §3.4 — Pipelines de logging forense
- ADR: ADR-0008 — Inmutabilidad de Bitácoras de Auditoría y Desactivación de Borrados Físicos, ADR-015
- Tablas afectadas: `audit_logs`, `vault_files`
- Flujo crítico SAD §10: §10.9 — Construcción del expediente de evidencia

---

#### HU-11.09 — Exportación Masiva de Expedientes con Índice para Auditorías Externas

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** Vault de Evidencia / Exportación Masiva (SAD §9.8), Inmutabilidad y WORM (SAD §11.8)
**Historia:** Como Oficial de Cumplimiento o Auditor Externo, quiero exportar masivamente múltiples expedientes de evidencia en un archivo ZIP consolidado con índice de contenidos, hashes verificables y constancias NOM-151 incluidas para facilitar la entrega de documentación a autoridades fiscales en auditorías que requieren decenas o cientos de expedientes simultáneamente.

**Alcance:** Backend / Workers Celery + Generación asíncrona de archivos ZIP + API de descarga

**Historia en formato Given/When/Then:**
- **Given** un conjunto de expedientes de evidencia ha sido seleccionado mediante filtros avanzados en el panel de Vault (por rango de fechas, tax_profile, nivel de criticidad, tipo de alerta, estado del sello NOM-151).
- **When** el usuario solicita la exportación masiva desde el panel de Vault y confirma los parámetros de la operación.
- **Then** el sistema debe encolar una tarea asíncrona en Celery que recopile todos los expedientes seleccionados desde S3.
- **And** debe generar un archivo ZIP consolidado que contenga cada expediente con su constancia NOM-151 (.tsa) y un archivo `MANIFEST.json` con el índice de contenidos, hashes SHA-256, fechas de sellado y metadatos de cada archivo.
- **And** debe notificar al usuario solicitante por email y notificación en plataforma cuando el ZIP esté listo para descarga, proporcionando un enlace presigned URL con TTL de 1 hora.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.04
- La exportación masiva se procesa de forma asíncrona mediante workers Celery para no bloquear la UI ni exceder timeouts HTTP.
- El archivo `MANIFEST.json` debe contener para cada expediente: nombre de archivo, ruta dentro del ZIP, hash SHA-256, fecha de creación del caso, fecha de sellado NOM-151, estado de integridad de la última verificación, y URI original en S3.
- El tamaño máximo del ZIP se configura por tenant (por defecto 5 GB); si la selección excede este límite, el sistema debe advertir al usuario y sugerir dividir la exportación en lotes.
- La exportación debe respetar estrictamente RLS: solo se exportan expedientes pertenecientes al tenant del usuario solicitante.
- La operación de exportación masiva se registra en `audit_logs` con acción `MASS_EXPORT`, incluyendo hash SHA-256 del ZIP generado, cantidad de expedientes, usuario solicitante y filtros aplicados.

**Criterios de aceptación:**
1. La exportación masiva genera un ZIP con todos los expedientes seleccionados y un `MANIFEST.json` verificable que incluye la información completa de cada archivo.
2. El ZIP y sus contenidos mantienen la integridad verificable: el hash SHA-256 de cada archivo extraído coincide con el registrado en `vault_files` y en el manifiesto.
3. El sistema notifica al usuario cuando la exportación está lista mediante email y notificación en plataforma, con un enlace de descarga presigned URL que expira en 1 hora.
4. La operación se registra en `audit_logs` con acción `MASS_EXPORT`, el hash del ZIP y los filtros aplicados, garantizando trazabilidad completa de la entrega de documentación.
5. Tests unitarios validan la exportación de hasta 100 expedientes simultáneos (con archivos mock de 1 MB cada uno) en menos de 5 minutos.
6. Si el bucket S3 es inaccesible durante la generación del ZIP, la tarea reintenta con backoff exponencial y notifica el fallo al usuario sin perder el registro de auditoría.

**Impactos y consideraciones para negocio:**
- Agiliza significativamente auditorías fiscales masivas donde el SAT requiere múltiples expedientes simultáneamente, reduciendo días de trabajo manual a minutos de procesamiento automatizado.
- El costo de almacenamiento temporal del ZIP generado y el tráfico de salida de S3 deben monitorearse para evitar sobrecostos en la infraestructura cloud.

**Referencias y trazabilidad:**
- SAD: §10.9 — Construcción del expediente de evidencia, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §8 — Escenarios Críticos de Operación (Scenario Boxes)
- Developer Handbook: §3.4 — Pipelines de logging forense
- ADR: ADR-0008 — Inmutabilidad de Bitácoras de Auditoría y Desactivación de Borrados Físicos, ADR-015
- Tablas afectadas: `vault_files`, `audit_logs`
- Flujo crítico SAD §10: §10.9 — Construcción del expediente de evidencia

---

#### HU-11.10 — Configuración de Object Lock S3 con Políticas Granulares de Retención

**Épica:** EP-11 — Vault, NOM-151 y Exportación
**Módulo(s):** Vault de Evidencia / Configuración S3 y Políticas de Retención (SAD §9.8), Inmutabilidad y WORM (SAD §11.8)
**Historia:** Como Administrador de Infraestructura del despacho, quiero configurar políticas granulares de Object Lock en S3 por clase de documento y tipo de evidencia para aplicar distintos periodos de retención inmutable según la naturaleza legal de cada expediente, optimizando costos de almacenamiento sin comprometer el cumplimiento normativo diferenciado.

**Alcance:** Backend / Configuración S3 + Interfaz de administración + Validación de cumplimiento normativo

**Historia en formato Given/When/Then:**
- **Given** el bucket S3 del Vault está configurado con Object Lock habilitado a nivel de bucket y el tenant ha definido clases de documento con distintos requisitos legales de retención.
- **When** el administrador configura las políticas de retención por clase de documento (fiscal general, contractual, NOM-151, respaldo operativo) desde el panel de administración del Vault.
- **Then** el sistema debe aplicar automáticamente el periodo de retención y modo de lock (Governance o Compliance) correspondiente al crear nuevos objetos en S3 según la clase de documento del expediente.
- **And** debe validar en tiempo real que los periodos de retención configurados cumplen con los mínimos legales establecidos: 5 años para documentación fiscal general (CFF), 10 años para documentación con sello NOM-151.
- **And** debe registrar todo cambio de configuración de políticas de retención en `audit_logs` con detalle del valor anterior, valor nuevo, usuario y timestamp.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-11.01
- El bucket S3 debe tener Object Lock habilitado con modo Compliance como opción predeterminada para clases de documento con requisito legal.
- Los modos de retención disponibles son: Governance (modificable con permisos especiales de administrador) y Compliance (inmutable absoluto, ni el root account de AWS puede eliminar).
- Los periodos mínimos legales no pueden reducirse por debajo de: 5 años para evidencia fiscal general (art. 30 CFF), 10 años para documentación con sello NOM-151-SCFI-2016.
- La configuración es por tenant; cada tenant puede definir sus propias clases de documento, periodos y modos de lock, respetando los mínimos legales.
- El sistema debe impedir la reducción de periodos de retención ya aplicados a objetos existentes; los cambios solo afectan a nuevos objetos creados después del cambio de configuración.
- Las clases de documento predefinidas del sistema (fiscal, NOM-151, contractual, operativo) no pueden ser eliminadas, solo personalizadas en sus periodos.

**Criterios de aceptación:**
1. El panel de administración permite crear, editar y deshabilitar clases de documento con periodos de retención personalizados en días, meses o años.
2. Al crear un nuevo expediente en el Vault, el objeto S3 recibe automáticamente el Object Lock con el periodo de retención y modo (Governance/Compliance) correspondiente a su clase de documento.
3. Un intento de configurar un periodo menor al mínimo legal para una clase regulada (ej. NOM-151 a 3 años) es rechazado con mensaje de validación específico citando la normativa aplicable.
4. Cada cambio en la configuración de políticas de retención queda registrado en `audit_logs` con acción `RETENTION_POLICY_UPDATED`, detallando valor anterior, valor nuevo, clase de documento afectada y usuario.
5. Tests de integración validan que objetos S3 creados bajo diferentes clases de documento reciben el Object Lock correcto verificado mediante la API de S3 (GetObjectRetention).
6. Un intento de reducción de periodo sobre objetos existentes es rechazado a nivel de lógica de negocio con mensaje de error descriptivo.

**Impactos y consideraciones para negocio:**
- Permite optimizar costos de almacenamiento S3 al no aplicar retención excesiva (10+ años) a documentos de menor criticidad legal que solo requieren 5 años.
- Asegura cumplimiento normativo diferenciado según el tipo de evidencia, demostrable ante auditorías del SAT y certificaciones ISO 27001.
- La distinción entre modos Governance y Compliance permite flexibilidad operativa para documentos internos sin comprometer la inmutabilidad de la evidencia fiscal crítica.

**Referencias y trazabilidad:**
- SAD: §10.9 — Construcción del expediente de evidencia, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §8 — Escenarios Críticos de Operación (Scenario Boxes)
- Developer Handbook: §1.1 — Script SQL (tabla vault_files, vault_retention_policies)
- ADR: ADR-015 — Resguardo de Evidencias en Almacenamiento S3 WORM en modo Compliance, ADR-015
- Tablas afectadas: `vault_files`, `vault_retention_policies`, `audit_logs`
- Flujo crítico SAD §10: §10.9 — Construcción del expediente de evidencia

---

---

### 5.12 EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit

#### HU-12.01 — AI Proxy con Enmascaramiento Local de PII en Payloads XML antes de Envío a Gemini

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy (SAD §9.6), Pipeline de Scrubbing PII (SAD §16.4)
**Historia:** Como Oficial de Cumplimiento del despacho, quiero que toda consulta al modelo Gemini 2.5 Flash Lite pase a través de un AI Proxy que realice enmascaramiento local de datos personales identificables (PII) en los payloads XML de facturas antes de ser enviados a la API de Google para garantizar que ningún RFC, razón social, domicilio fiscal o dato sensible del contribuyente abandone la infraestructura del despacho, cumpliendo con la LFPDPPP y el deber de secrecía fiscal del art. 69 CFF.

**Alcance:** Backend / AI Proxy middleware en FastAPI Core + Motor de enmascaramiento PII local + Integración con Gemini API vía SDK oficial

**Historia en formato Given/When/Then:**
- **Given** un analista contable ha activado el Copiloto Fiscal desde la vista de perfil fiscal de un contribuyente y el sistema ha preparado un payload XML con los metadatos fiscales (RFC emisor, RFC receptor, montos, UUID, régimen fiscal) para ser analizado por Gemini.
- **When** el AI Proxy intercepta la solicitud antes de enviarla a la API de Gemini 2.5 Flash Lite.
- **Then** el motor de enmascaramiento PII local debe ejecutar un pipeline de regex de alta precisión que detecte y reemplace todos los campos PII del payload XML: RFC con formato estándar (4 letras + 6 dígitos + homoclave), razón social, nombres de persona física, CURP, domicilio fiscal, número de certificado SAT y UUID de factura.
- **And** cada campo PII debe ser sustituido por un token sintético no reversible del tipo `[PII_RFC_EMISOR_001]` que preserve la estructura semántica del payload (longitud, posición, cardinalidad) para que Gemini pueda razonar sobre las relaciones entre entidades sin conocer las identidades reales.
- **And** el payload enmascarado debe ser el único contenido que abandone la infraestructura local hacia la API de Gemini; el mapeo tokens ↔ datos reales permanece exclusivamente en memoria del servidor (nunca persistido en disco) y se usa solo para reensamblar la respuesta en el frontend.
- **And** toda solicitud procesada por el AI Proxy debe registrar un evento `AI_PROXY_REQUEST` en `ai_audit_logs` con el payload original (hash SHA-256), payload enmascarado enviado, modelo de Gemini invocado, timestamp y tenant_id.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.04 (Políticas RLS y constraints de rendimiento en PostgreSQL 17)
- El enmascaramiento PII debe ejecutarse 100% localmente en el servidor FastAPI Core. No se permite delegar el scrubbing a ningún servicio externo ni a la propia API de Gemini.
- El conjunto mínimo de campos PII a enmascarar incluye: RFC (emisor y receptor), razón social, nombre de persona física, CURP, régimen fiscal, domicilio fiscal (calle, número, colonia, CP, municipio, estado), número de certificado SAT y UUID de factura.
- Los tokens sintéticos deben ser no reversibles fuera del contexto de la sesión activa del servidor y deben expirar junto con la sesión de consulta (no se persisten en base de datos, Redis ni logs).
- El AI Proxy debe soportar rate limiting por tenant y por usuario para prevenir abusos o usos desproporcionados de la API Gemini (configuración delegada a HU-12.12).
- La latencia introducida por el pipeline de enmascaramiento no debe exceder 200ms en el p95 para payloads XML de hasta 10 MB.

**Criterios de aceptación:**
1. Un payload XML con 15 CFDI que contiene RFCs, razones sociales y domicilios reales de contribuyentes mexicanos es procesado por el AI Proxy y todos los campos PII son reemplazados por tokens sintéticos. Una inspección del payload enviado a Gemini (vía mock de API) no contiene ningún dato personal en texto claro.
2. El mapeo tokens ↔ datos reales se mantiene exclusivamente en memoria del servidor durante la vida de la consulta y es inaccesible desde cualquier endpoint de API o consulta de base de datos.
3. Dos solicitudes consecutivas para el mismo contribuyente generan tokens sintéticos diferentes (no hay reutilización de tokens entre sesiones), verificable mediante captura de tráfico simulado.
4. El evento `AI_PROXY_REQUEST` se registra en `ai_audit_logs` con todos los campos requeridos: hash SHA-256 del payload original, hash del payload enmascarado, modelo Gemini invocado, timestamp UTC, tenant_id y user_id.
5. NFR: La latencia p95 del pipeline de enmascaramiento es <200ms para payloads de hasta 10 MB bajo carga concurrente de 50 solicitudes simultáneas.
6. Tests unitarios (`test_ai_riskgauge.py`) validan el enmascaramiento de cada tipo de campo PII con al menos 20 variantes de RFC válidos y 10 formatos de domicilio fiscal según el estándar del SAT.

**Impactos y consideraciones para negocio:**
- Elimina el riesgo de fuga de datos personales de contribuyentes hacia Google Cloud, condición indispensable para la adopción de IA generativa en despachos contables regulados por la LFPDPPP y el secreto fiscal.
- El costo de operación de Gemini API se acota al consumo de tokens sobre payloads enmascarados, sin impacto en la calidad del razonamiento fiscal (Gemini opera sobre estructura, no sobre identidades).

**Referencias y trazabilidad:**
- SAD: §9.6 — AI Proxy, §16.4 — Pipeline de Scrubbing PII y Enmascaramiento Local
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.1 — AI Proxy middleware y Gemini SDK
- ADR: ADR-017 — Enmascaramiento Local de PII antes de Envío a APIs Externas de IA Generativa
- Tablas afectadas: `ai_audit_logs`, `invoices`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.02 — Copiloto de Compliance Fiscal mediante Gemini 2.5 Flash Lite y RAG Contextual

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Copiloto Fiscal (SAD §9.6), Objetivo de la IA en Sentinel (SAD §16.1), Copiloto de Cumplimiento Fiscal (SAD §16.2)
**Historia:** Como Analista Contable del despacho, quiero interactuar con un Copiloto de Compliance Fiscal impulsado por Gemini 2.5 Flash Lite que, mediante recuperación aumentada por generación (RAG) con contexto normativo mexicano (CFF, RMF, LISR, LIVA, criterios SAT), me proporcione explicaciones fundamentadas y accionables sobre alertas fiscales, transiciones de riesgo, presunciones 69-B y obligaciones PLD para reducir el tiempo de análisis de cada alerta y disminuir la dependencia de consultas externas a especialistas fiscales.

**Alcance:** Backend / Motor RAG + Orquestador de consultas Gemini + Integración con AI Proxy + Base de conocimiento fiscal vectorizada

**Historia en formato Given/When/Then:**
- **Given** un analista con rol ACCOUNTANT ha recibido una alerta de criticidad HIGH por presunción 69-B sobre un proveedor con $2,400,000 MXN en facturas acumuladas en ventana de 30 días y el RiskGauge del contribuyente ha escalado de 45 a 78 puntos.
- **When** el analista hace clic en "Explicar con IA" desde el panel de detalle de la alerta.
- **Then** el AI Proxy debe preparar el contexto RAG recuperando los fragmentos normativos más relevantes desde `knowledge_base_vectors` (art. 69-B CFF, reglas RMF aplicables, criterios SAT de presunción de inexistencia de operaciones) mediante búsqueda semántica vectorial en pgvector.
- **And** debe construir un prompt estructurado para Gemini 2.5 Flash Lite que incluya: el contexto normativo recuperado, los datos fiscales cuantitativos del caso (montos, periodo, proveedor tokenizado), el score de riesgo matemático (RiskGauge = 78, HHI = 0.34, estado 69-B = presunto) y una instrucción de sistema que fuerce a Gemini a citar los artículos y fracciones específicos en su respuesta.
- **And** Gemini debe generar una respuesta en español que contenga: (a) explicación del fundamento legal aplicable con cita exacta de artículo y fracción, (b) análisis del caso concreto vinculando los datos fiscales con los criterios normativos, (c) recomendación de acción para el analista (revisar documentación, solicitar comprobantes, preparar reporte UIF), y (d) nivel de confianza de la IA en su propia respuesta (0-100%).
- **And** la respuesta completa debe registrarse en `ai_audit_logs` con el prompt enviado, la respuesta recibida, los fragmentos normativos utilizados, el score de confianza, los tokens consumidos y el timestamp UTC.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.01 (AI Proxy con enmascaramiento PII)
- El Copiloto solo puede ser invocado desde contextos donde el payload ya ha sido enmascarado por el AI Proxy (HU-12.01). No se permite invocación directa a Gemini sin pasar por el proxy.
- Gemini 2.5 Flash Lite es el modelo designado para todas las consultas del Copiloto Fiscal. El cambio de modelo requiere un nuevo ADR y actualización de configuración centralizada.
- La respuesta de Gemini debe incluir obligatoriamente un campo `confidence_score` (0-100) auto-reportado por el modelo. Scores ≤70% activan automáticamente el fallback a reglas deterministas (HU-12.10).
- Los fragmentos normativos recuperados para RAG deben filtrarse por vigencia (solo fragmentos cuya fecha de última reforma sea ≤ 5 años desde la fecha actual, salvo CFF y leyes fundacionales que aplican independientemente de su fecha).
- La latencia total de la consulta (RAG retrieval + llamada Gemini + post-procesamiento) no debe exceder 5 segundos en el p95.

**Criterios de aceptación:**
1. Una consulta de prueba sobre "¿Cuándo se configura la presunción 69-B?" recibe una respuesta de Gemini que cita explícitamente el art. 69-B del CFF y las fracciones pertinentes, con fragmentos normativos recuperados desde `knowledge_base_vectors` verificables por sus identificadores en `ai_audit_logs`.
2. La respuesta incluye un `confidence_score` numérico entre 0 y 100. Una respuesta con score ≤70% registra el campo `fallback_triggered = true` en `ai_audit_logs`.
3. La consulta no contiene ningún dato PII en texto claro en el prompt enviado a Gemini (verificable por inspección del campo `masked_prompt` en `ai_audit_logs`).
4. El tiempo total de respuesta (end-to-end desde clic del analista hasta renderizado de la explicación) es ≤5 segundos en p95 bajo carga de 10 consultas concurrentes.
5. NFR: Toda consulta al Copiloto Fiscal se registra en `ai_audit_logs` con trazabilidad completa: prompt enmascarado, respuesta, confidence_score, fragmentos RAG utilizados (IDs y scores de similitud), tokens de entrada/salida, modelo, versión de prompt, timestamp UTC y tenant_id.
6. Tests unitarios (`test_ai_alert_explain.py`) validan que para 5 tipos de alerta (69-B, PLD, OFAC, HHI atípico, outlier IQR) el Copiloto construye el prompt correcto con los fragmentos normativos esperados y parsea la respuesta de Gemini extrayendo el confidence_score.

**Impactos y consideraciones para negocio:**
- Reduce el tiempo medio de análisis por alerta de ~45 minutos (consulta manual de normativa + análisis) a ~3 minutos (lectura de explicación fundamentada + verificación), liberando capacidad del equipo contable para tareas de mayor valor.
- El costo por consulta de Gemini 2.5 Flash Lite (~$0.00002 USD por 1K tokens) es marginal comparado con el costo-hora de un analista contable senior, con un ROI proyectado positivo desde el primer mes de operación.

**Referencias y trazabilidad:**
- SAD: §9.6 — AI Proxy, §16.1 — Objetivo de la IA en Sentinel, §16.2 — Copiloto de Cumplimiento Fiscal con Gemini Flash
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.2 — Gemini SDK RLS y Post-procesamiento de respuestas
- ADR: ADR-017 — Implementación de RAG Local con pgvector para Aislamiento de Base de Conocimientos Corporativa
- Tablas afectadas: `ai_audit_logs`, `knowledge_base`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.03 — Filtro de Detección de Contradicción Semántica entre Inferencia IA y RiskGauge Matemático

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Motor de Contradicción (SAD §9.6), Detección de Contradicción y Score (SAD §16.8)
**Historia:** Como Director de Compliance del despacho, quiero que el sistema compare automáticamente la inferencia cualitativa generada por Gemini (ej. "riesgo bajo, operación regular") contra el score cuantitativo calculado por el motor de riesgo matemático RiskGauge para detectar contradicciones semánticas antes de que la recomendación de IA sea presentada al analista, evitando que una alucinación o sesgo del modelo generativo induzca a error en la toma de decisiones fiscales con consecuencias legales y financieras para el contribuyente.

**Alcance:** Backend / Motor de comparación semántica IA vs Matemático + Integración con AI Proxy y Contradiction Engine

**Historia en formato Given/When/Then:**
- **Given** el Copiloto Fiscal (HU-12.02) ha generado una respuesta cualitativa para una alerta de PLD por UMAs excedidas donde Gemini califica el riesgo como "BAJO — operación dentro de parámetros normales de industria", pero el RiskGauge matemático ha calculado un score de 91/100 (CRÍTICO) con 4 indicadores en rojo: HHI = 0.82, monto acumulado 30d = 18,500 UMAs, coincidencia Jaro-Winkler 0.94 con lista OFAC y el contribuyente tiene marcaje 69-B activo.
- **When** el Contradiction Engine (HU-12.05) procesa la respuesta de Gemini y la compara con los valores del RiskGauge.
- **Then** el filtro de detección semántica debe extraer la categoría de riesgo inferida por Gemini ("BAJO") mediante parsing estructurado de la respuesta y compararla contra la categoría del RiskGauge ("CRÍTICO").
- **And** debe verificar si la discrepancia es de ≥2 niveles en la escala ordinal de riesgo (BAJO → MEDIO → ALTO → CRÍTICO) entre la inferencia IA y el cálculo matemático.
- **And** si la discrepancia cumple el criterio de ≥2 niveles, debe marcar la respuesta de Gemini como `contradiction_detected = true` con `contradiction_levels = 3` (BAJO vs CRÍTICO) y activar el proceso de resolución de contradicción.
- **And** debe registrar el evento de contradicción en `ai_audit_logs` con los valores comparados: categoría IA, categoría RiskGauge, score matemático (91), indicadores activos (HHI, UMAs, Jaro-Winkler, 69-B), niveles de discrepancia, y timestamp.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.02 (Copiloto de Compliance Fiscal con Gemini 2.5 Flash Lite)
- La categorización de riesgo inferida por Gemini debe ser extraída mediante parsing de una etiqueta estructurada que el prompt del sistema obliga a Gemini a incluir en su respuesta (campo `risk_category` con valores controlados: BAJO, MEDIO, ALTO, CRÍTICO).
- La escala ordinal de riesgo es fija y no configurable: BAJO (score 0-25), MEDIO (26-50), ALTO (51-75), CRÍTICO (76-100).
- Se considera contradicción cuando la diferencia entre la categoría IA y la categoría RiskGauge es de ≥2 niveles en la escala ordinal.
- El filtro de detección semántica debe ejecutarse en cada consulta del Copiloto Fiscal sin excepción, incluso si el analista no ha solicitado explícitamente verificación de contradicción.
- Si Gemini no incluye el campo `risk_category` en su respuesta (fallo de formato), se considera automáticamente como `contradiction_detected = true` por incapacidad de evaluación.
- La detección de contradicción no bloquea la respuesta; la decisión de mostrar, ocultar o degradar la respuesta de Gemini compete al Contradiction Engine (HU-12.05).

**Criterios de aceptación:**
1. Un caso de prueba donde Gemini responde "BAJO" y RiskGauge calcula "CRÍTICO" (score 88) activa correctamente `contradiction_detected = true` con `contradiction_levels = 3`.
2. Un caso donde Gemini responde "ALTO" y RiskGauge calcula "ALTO" (score 68, misma categoría) resulta en `contradiction_detected = false`.
3. Un caso límite donde Gemini responde "BAJO" y RiskGauge calcula "MEDIO" (score 48, diferencia de 1 nivel) resulta en `contradiction_detected = false` (no alcanza el umbral de ≥2 niveles).
4. Un caso donde Gemini no incluye el campo `risk_category` en su respuesta (JSON mal formado) activa `contradiction_detected = true` con motivo `MISSING_RISK_CATEGORY`.
5. El evento de contradicción se registra en `ai_audit_logs` con todos los campos de comparación poblados y verificables mediante consulta SQL directa.
6. Tests unitarios (`test_ai_draft.py`) cubren al menos 10 combinaciones de categorías IA vs RiskGauge incluyendo casos borde en los límites de cada categoría (score 25, 26, 50, 51, 75, 76).

**Impactos y consideraciones para negocio:**
- Actúa como salvaguarda crítica contra el riesgo de que una IA generativa minimice incorrectamente un riesgo fiscal real, previniendo decisiones erróneas que podrían derivar en sanciones del SAT, responsabilidad penal del contador o daño reputacional al despacho.
- Establece la supremacía del motor matemático sobre el modelo cognitivo en el ciclo de decisión, alineado con el principio de gobernanza de IA híbrida definido en ADR-017.

**Referencias y trazabilidad:**
- SAD: §9.6 — AI Proxy, §16.8 — Detección de Contradicción, Score e Integridad
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.3 — Motor de Contradicción Técnica (evaluate_ai_contradiction)
- ADR: ADR-017 — Arquitectura Dual Engine y Regla de Supremacía del Motor Estadístico sobre Modelos Cognitivos
- Tablas afectadas: `ai_audit_logs`, `risk_scores`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.04 — Pipeline de Scrubbing PII Local con Regex de Alta Precisión antes de Llamadas a Gemini API

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Motor de Scrubbing PII (SAD §9.6), Pipeline de Scrubbing PII (SAD §16.4)
**Historia:** Como Ingeniero de Seguridad del equipo Sentinel, quiero un pipeline de scrubbing de datos personales con patrones regex de alta precisión calibrados específicamente para documentos fiscales mexicanos (CFDI 4.0, constancias de situación fiscal, opiniones de cumplimiento) que opere de forma local e independiente antes de cada llamada a Gemini API para garantizar que ningún dato identificable —RFC, CURP, razón social, domicilio, número de certificado— escape de la infraestructura controlada del despacho hacia servicios externos de IA generativa, cumpliendo con los requisitos de confidencialidad del art. 69 CFF y la LFPDPPP.

**Alcance:** Backend / Motor de regex PII + Configuración de patrones + Integración con AI Proxy middleware

**Historia en formato Given/When/Then:**
- **Given** el AI Proxy ha interceptado una solicitud del Copiloto Fiscal que incluye un payload con datos fiscales extraídos de facturas CFDI 4.0, constancias del SAT y perfiles de contribuyentes almacenados en `tax_profiles`.
- **When** el pipeline de scrubbing PII procesa el payload textual antes de la llamada a Gemini 2.5 Flash Lite.
- **Then** debe aplicar secuencialmente los siguientes patrones regex de alta precisión: (a) detección de RFC (patrón: 4 letras mayúsculas + 6 dígitos + 2 caracteres alfanuméricos de homoclave), (b) detección de CURP (18 caracteres alfanuméricos con checksum), (c) detección de razón social (entidades nombradas con mayúsculas sostenidas en contexto de emisor/receptor), (d) detección de domicilio fiscal (calle, número exterior/interior, colonia, código postal de 5 dígitos, municipio, estado), (e) detección de número de certificado SAT (20 dígitos), (f) detección de UUID de factura (formato GUID estándar 8-4-4-4-12).
- **And** cada coincidencia debe ser reemplazada por un token con formato `[PII_<TIPO>_<HASH_TRUNCADO_8>]` donde el hash truncado se deriva del valor original usando SHA-256 (primeros 8 caracteres hexadecimales) para garantizar no reversibilidad.
- **And** el pipeline debe generar un diccionario de sustitución en memoria (`{token: valor_original}`) que se inyecta en el contexto de la solicitud para que el AI Proxy pueda reconstruir la respuesta de Gemini con los valores reales antes de entregarla al frontend.
- **And** debe registrar métricas de scrubbing en `ai_audit_logs`: cantidad de campos PII detectados, tipos de PII encontrados, tiempo de procesamiento del pipeline y hash SHA-256 del payload limpio resultante.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.01 (AI Proxy con enmascaramiento local de PII)
- El pipeline de scrubbing debe ejecutarse como un paso obligatorio e in-bloqueable dentro del AI Proxy. No existe modo "bypass" del scrubbing, ni siquiera para administradores del sistema.
- Los patrones regex deben ser configurables mediante un archivo de configuración versionado (`pii_patterns_v2.yaml`) que permita agregar nuevos tipos de PII sin modificar el código del pipeline.
- La precisión de detección (recall) debe ser ≥99% para RFCs y ≥95% para razones sociales y domicilios fiscales, medida sobre un corpus de 10,000 CFDI reales anonimizados.
- La tasa de falsos positivos (falsos RFCs o CURPs detectados en texto que no es PII) debe ser ≤0.1%.
- El diccionario de sustitución en memoria debe ser inaccesible desde cualquier endpoint API, log de aplicación, o sistema de monitoreo. Cualquier intento de serialización o logging del diccionario debe ser bloqueado a nivel de middleware.
- El pipeline debe emitir métricas de desempeño a Prometheus: `pii_fields_detected_total`, `pii_scrub_duration_seconds`, `pii_false_positive_count`.

**Criterios de aceptación:**
1. Un payload con 50 CFDI que contienen RFCs válidos, CURPs, razones sociales y domicilios es procesado y el 100% de los RFCs son detectados y reemplazados con tokens no reversibles (verificable por ausencia del RFC original en el payload de salida).
2. Un texto fiscal en español que contiene la palabra "RFC" en contexto explicativo (no como identificador) no genera un falso positivo de detección de RFC.
3. El diccionario de sustitución existe exclusivamente en el objeto `request.state` de FastAPI y no es accesible desde ninguna ruta de API, endpoint de health check, o handler de errores (verificable con tests de penetración).
4. La latencia del pipeline de scrubbing es ≤50ms para payloads de hasta 1 MB con hasta 500 campos PII detectados (p95 bajo carga de 50 solicitudes concurrentes).
5. Tests unitarios (`test_pii_scrubber.py`) validan cada patrón regex con al menos 50 variantes de RFC (incluyendo RFC genérico XAXX010101000), 20 variantes de CURP, 30 formatos de domicilio fiscal de diferentes estados de la república, y UUIDs en formatos con y sin guiones.
6. El archivo `pii_patterns_v2.yaml` permite agregar un nuevo patrón de PII sin modificar código y el pipeline lo incorpora en la siguiente solicitud sin reinicio del servicio.

**Impactos y consideraciones para negocio:**
- Constituye la barrera técnica de protección de datos que hace viable legal y contractualmente el uso de Gemini API en un despacho contable regulado, sin requerir un acuerdo de procesamiento de datos con Google Cloud que podría ser jurídicamente complejo o inviable bajo la legislación mexicana.
- La latencia agregada del scrubbing (<50ms) es imperceptible para el usuario final comparada con la latencia de la llamada a Gemini API (2-4 segundos), por lo que no degrada la experiencia de uso del Copiloto Fiscal.

**Referencias y trazabilidad:**
- SAD: §9.6 — AI Proxy, §16.4 — Pipeline de Scrubbing PII y Enmascaramiento Local
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.1 — AI Proxy middleware y Gemini SDK
- ADR: ADR-017 — Enmascaramiento Local de PII antes de Envío a APIs Externas de IA Generativa
- Tablas afectadas: `ai_audit_logs`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.05 — Motor de Contradicción IA vs Riesgo Matemático con Umbral <90% y ≥2 Niveles de Discrepancia

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Motor de Contradicción (SAD §9.6), Detección de Contradicción y Score (SAD §16.8)
**Historia:** Como Oficial de Cumplimiento del despacho, quiero que cuando el filtro de detección semántica (HU-12.03) identifique una contradicción de ≥2 niveles entre la inferencia de Gemini y el cálculo del RiskGauge matemático, el motor de contradicción resuelva automáticamente el conflicto otorgando supremacía al motor matemático, descarte la respuesta cualitativa de Gemini cuando la confianza del modelo sea inferior al 90% y presente al analista únicamente la conclusión basada en datos duros con un aviso explícito de "IA no concluyente — prevalece el análisis cuantitativo" para eliminar el riesgo de que una alucinación de IA generativa induzca una decisión fiscal errónea con consecuencias legales.

**Alcance:** Backend / Contradiction Engine + Integración con AI Proxy + Sistema de badges y notificaciones en frontend

**Historia en formato Given/When/Then:**
- **Given** el filtro de detección semántica (HU-12.03) ha marcado `contradiction_detected = true` con `contradiction_levels = 2` (Gemini responde "MEDIO", RiskGauge calcula "CRÍTICO" con score 88) para una alerta de HHI atípico con concentración de proveedores del 82%.
- **When** el Contradiction Engine procesa el veredicto del filtro y evalúa la confianza auto-reportada por Gemini.
- **Then** debe verificar si `gemini_confidence_score < 90`. Si es true, debe descartar completamente la respuesta cualitativa de Gemini y generar una conclusión basada exclusivamente en los valores del RiskGauge: score numérico (88), categoría de riesgo (CRÍTICO), indicadores activos (HHI = 0.82, concentración de proveedores 82%), y regla de negocio aplicable.
- **And** si `gemini_confidence_score ≥ 90` pero aún existe contradicción, debe presentar ambas conclusiones en paralelo con badges diferenciados: "IA: Riesgo MEDIO (confianza 92%)" y "RiskGauge: CRÍTICO (score 88/100)", con una advertencia visual de discrepancia y la recomendación explícita de privilegiar el análisis cuantitativo.
- **And** si `gemini_confidence_score < 90` y hay contradicción, debe registrar el evento con `contradiction_resolution = IA_DISCARDED_MATH_SUPREMACY` en `ai_audit_logs` y presentar al analista el badge "Análisis cuantitativo — IA descartada por contradicción con score matemático".
- **And** en cualquier caso de contradicción, el motor debe generar una alerta interna de tipo `AI_CONTRADICTION` de criticidad MEDIUM en la tabla `alerts` para que el equipo de ML/IA pueda revisar el caso y ajustar los prompts o el modelo.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.03 (Filtro de detección de contradicción semántica), HU-12.04 (Pipeline de scrubbing PII)
- El umbral de confianza para prevalencia de IA es 90%. Si Gemini reporta confianza <90%, el motor matemático prevalece automáticamente sin intervención humana.
- La regla de supremacía es inmutable: en cualquier escenario de contradicción entre IA generativa y motor matemático, el motor matemático tiene la última palabra en la recomendación presentada al analista. La IA puede complementar pero nunca contradecir sin advertencia explícita.
- La escala de discrepancia es: 0 niveles = sin contradicción (IA confiable), 1 nivel = discrepancia menor (IA presentada con caveat), ≥2 niveles = contradicción significativa (IA descartada si confianza <90%, presentada en paralelo con advertencia si confianza ≥90%).
- Los badges visuales deben ser cromáticamente diferenciados: verde para IA coincidente con RiskGauge, amarillo para discrepancia de 1 nivel, rojo para contradicción ≥2 niveles con IA descartada, naranja para contradicción ≥2 niveles con IA mostrada en paralelo.
- El motor de contradicción debe operar con una latencia máxima de 10ms adicionales sobre el pipeline de respuesta del AI Proxy, para no introducir demora perceptible al usuario final.

**Criterios de aceptación:**
1. Caso A: Gemini confianza 85%, contradicción 2 niveles. Resultado: respuesta de Gemini descartada, analista ve solo conclusión del RiskGauge con badge "Análisis cuantitativo — IA descartada por contradicción" en rojo.
2. Caso B: Gemini confianza 94%, contradicción 2 niveles. Resultado: ambas conclusiones mostradas en paralelo con badge naranja de advertencia "Discrepancia IA vs RiskGauge — prevalece el análisis cuantitativo".
3. Caso C: Gemini confianza 88%, contradicción 1 nivel. Resultado: respuesta de IA mostrada con badge amarillo "IA: discrepancia menor con score matemático — verificar", pero no descartada.
4. Caso D: Gemini confianza 95%, sin contradicción (misma categoría). Resultado: respuesta de IA mostrada normalmente con badge verde "IA coincide con análisis cuantitativo".
5. Cada caso de contradicción genera un registro en `ai_audit_logs` con el campo `contradiction_resolution` poblado correctamente y una alerta en la tabla `alerts` de tipo `AI_CONTRADICTION`.
6. Tests unitarios (`test_contradiction.py`) cubren las 4 combinaciones de confianza (≥90%, <90%) × nivel de discrepancia (1 nivel, ≥2 niveles) más casos borde (confianza exactamente 90%, sin respuesta de Gemini, RiskGauge no disponible).

**Impactos y consideraciones para negocio:**
- Establece un mecanismo de defensa automatizado contra alucinaciones de IA generativa en un dominio de alto riesgo legal, donde una recomendación errónea podría traducirse en sanciones fiscales multimillonarias o responsabilidad penal para el contador y el despacho.
- Genera un ciclo de mejora continua: cada contradicción detectada alimenta el backlog de ajuste de prompts (HU-12.07) y el dashboard de métricas de calidad IA (HU-12.11), reduciendo sistemáticamente la tasa de contradicción en producción.

**Referencias y trazabilidad:**
- SAD: §9.6 — AI Proxy, §16.8 — Detección de Contradicción, Score e Integridad
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.3 — Motor de Contradicción Técnica (evaluate_ai_contradiction)
- ADR: ADR-017 — Arquitectura Dual Engine y Regla de Supremacía del Motor Estadístico sobre Modelos Cognitivos
- Tablas afectadas: `ai_audit_logs`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.06 — Trazabilidad de Consultas IA con Auditoría Inmutable de Prompts, Respuestas y Scores

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Auditoría y Trazabilidad IA (SAD §9.6), Inmutabilidad y WORM (SAD §11.8)
**Historia:** Como Oficial de Cumplimiento y Auditor Externo del despacho, quiero que cada consulta realizada al Copiloto Fiscal —incluyendo el prompt completo (enmascarado), la respuesta de Gemini, el score de confianza, los fragmentos normativos RAG recuperados, el veredicto del Contradiction Engine, los tokens consumidos y el costo estimado en USD— quede registrada en una bitácora inmutable `ai_audit_logs` con protección WORM para garantizar trazabilidad forense completa de todas las interacciones con IA generativa, permitiendo auditorías regulatorias, revisión de decisiones asistidas por IA y cumplimiento con los requisitos de transparencia algorítmica de la Ley Fintech y criterios ASF.

**Alcance:** Backend / Esquema de tabla `ai_audit_logs` + Triggers WORM + API de consulta de bitácora IA + Integración con AI Proxy

**Historia en formato Given/When/Then:**
- **Given** el AI Proxy ha completado un ciclo completo de consulta al Copiloto Fiscal: enmascaramiento PII, construcción de prompt, llamada a Gemini 2.5 Flash Lite, recepción de respuesta, detección de contradicción (HU-12.03) y resolución por el Contradiction Engine (HU-12.05).
- **When** el ciclo de consulta finaliza (exitoso o con error).
- **Then** el sistema debe insertar un registro inmutable en `ai_audit_logs` que contenga: (a) `audit_id` UUID v7, (b) `tenant_id` y `user_id` del solicitante, (c) `timestamp_utc` con precisión de microsegundos, (d) `prompt_hash` SHA-256 del prompt original antes de enmascarar, (e) `masked_prompt` completo enviado a Gemini, (f) `gemini_response` completa recibida, (g) `gemini_model` (ej. gemini-2.5-flash-lite), (h) `gemini_confidence_score` reportado por el modelo, (i) `rag_fragments` array JSON con IDs y scores de similitud de los fragmentos normativos recuperados, (j) `contradiction_detected` (boolean), (k) `contradiction_levels` (integer), (l) `contradiction_resolution` (enum), (m) `input_tokens`, `output_tokens`, `total_tokens`, (n) `estimated_cost_usd` calculado con la tarifa configurada, (o) `latency_ms` total de la consulta, (p) `error_code` y `error_message` si la consulta falló.
- **And** la tabla `ai_audit_logs` debe tener triggers anti-UPDATE y anti-DELETE a nivel de base de datos PostgreSQL 17 que rechacen cualquier operación de modificación o eliminación con código SQLSTATE `42501` (INSUFFICIENT_PRIVILEGE), garantizando inmutabilidad WORM a nivel de storage.
- **And** debe existir un endpoint de API `GET /api/v1/ai-audit` protegido por RBAC (solo ADMIN y rol Oficial de Cumplimiento) que permita consultar, filtrar por tenant_id, rango de fechas, user_id, contradiction_status y exportar la bitácora en formato CSV/JSON firmado digitalmente para auditorías externas.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.04 (Pipeline de scrubbing PII)
- La inmutabilidad de `ai_audit_logs` se implementa en dos capas: triggers PostgreSQL `BEFORE UPDATE OR DELETE` que rechazan la operación, y políticas de storage WORM si la tabla se replica a almacenamiento externo (S3/Object Lock).
- El `masked_prompt` debe almacenarse completo en la bitácora. Bajo ninguna circunstancia se almacena el prompt con PII sin enmascarar en `ai_audit_logs` ni en ningún otro sistema de logging.
- El `prompt_hash` (SHA-256 del prompt original pre-enmascaramiento) permite verificar que el payload enmascarado corresponde al caso fiscal correcto sin exponer los datos reales en la bitácora.
- Los registros en `ai_audit_logs` deben cumplir con el periodo de retención mínimo de 5 años (art. 30 CFF) y ser exportables ante requerimiento de autoridad fiscal o auditoría externa.
- El endpoint de consulta de bitácora IA debe registrar a su vez un evento `AI_AUDIT_LOG_ACCESSED` en `audit_logs` (bitácora general) garantizando trazabilidad incluso del acceso a la trazabilidad (meta-auditoría).
- La latencia de inserción del registro en `ai_audit_logs` no debe impactar el tiempo de respuesta al usuario; la escritura es asíncrona vía worker Celery o buffer en Redis con flush síncrono de respaldo.

**Criterios de aceptación:**
1. Una consulta completa al Copiloto Fiscal genera un registro en `ai_audit_logs` con los 20 campos especificados poblados. Una consulta SQL `SELECT * FROM ai_audit_logs WHERE audit_id = '<uuid>'` retorna el registro completo y verificable.
2. Un intento de `UPDATE ai_audit_logs SET gemini_response = 'modificado' WHERE audit_id = '<uuid>'` es rechazado con error SQLSTATE `42501` por el trigger WORM.
3. Un intento de `DELETE FROM ai_audit_logs WHERE audit_id = '<uuid>'` es rechazado con error SQLSTATE `42501` por el trigger WORM.
4. El endpoint `GET /api/v1/ai-audit?tenant_id=X&from=2025-01-01&to=2025-01-31` retorna todos los registros del periodo en formato JSON paginado. Un usuario con rol ACCOUNTANT recibe HTTP 403.
5. La exportación CSV del endpoint incluye todos los campos excepto `masked_prompt` (que se reemplaza por `[REDACTED — SOLO ACCESIBLE POR OFICIAL DE CUMPLIMIENTO]`) para roles que no sean ADMIN o Compliance Officer.
6. Tests unitarios (`test_ai_audit.py`) validan la integridad de los 20 campos en el registro, la inmutabilidad WORM (triggers), el control de acceso RBAC al endpoint, y la correcta redacción del `masked_prompt` en exportaciones para roles no autorizados.

**Impactos y consideraciones para negocio:**
- Proporciona la base de evidencia forense requerida para demostrar ante el SAT, la ASF o un juez que las decisiones fiscales asistidas por IA fueron revisadas por un analista humano con pleno conocimiento del nivel de confianza de la IA, las contradicciones detectadas y los datos cuantitativos subyacentes.
- La inmutabilidad WORM de la bitácora de IA es un requisito no negociable para la defensa legal en procedimientos donde la autoridad cuestione el uso de IA en la determinación de obligaciones fiscales.

**Referencias y trazabilidad:**
- SAD: §9.6 — AI Proxy, §11.8 — Inmutabilidad y WORM
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.4 — Métricas y monitoreo IA, §3.4 — Pipelines de logging forense
- ADR: ADR-017 — Enmascaramiento Local de PII antes de Envío a APIs Externas de IA Generativa, ADR-0008 — Inmutabilidad de Bitácoras de Auditoría y Desactivación de Borrados Físicos
- Tablas afectadas: `ai_audit_logs`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.07 — Versionado de Prompts del Sistema con A/B Testing y Métricas de Efectividad

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Gestión de Prompts (SAD §9.6), Gobernanza de IA (SAD §16.6)
**Historia:** Como Ingeniero de ML/IA del equipo Sentinel, quiero versionar las plantillas de prompt del sistema Gemini con control de cambios semántico (MAJOR.MINOR), A/B testing configurable y métricas comparativas de efectividad para iterar sobre la calidad de las respuestas del Copiloto Fiscal sin exponer a los analistas a prompts no probados en producción.

**Alcance:** Backend / Sistema de versionado de prompts + API de administración + Integración con AI Proxy

**Historia en formato Given/When/Then:**
- **Given** existe una plantilla de prompt activa en producción (v1.0) para el Copiloto Fiscal y el equipo de ML ha desarrollado una nueva versión candidata (v1.1) con mejoras en el contexto normativo y estructura de respuesta.
- **When** el ingeniero de ML registra la versión v1.1 en el sistema de versionado, documenta el changelog y configura un A/B test con distribución 80% tráfico a v1.0 y 20% a v1.1.
- **Then** el AI Proxy debe enrutar las consultas del Copiloto Fiscal según los porcentajes configurados, registrando para cada consulta qué versión de prompt se utilizó.
- **And** debe registrar métricas comparativas por versión: tasa de contradicción, confianza media reportada por Gemini, latencia p95, tokens promedio consumidos y tasa de fallback a reglas deterministas.
- **And** debe permitir al ingeniero de ML promover la versión candidata a producción (100% tráfico) o descartarla, con confirmación explícita y registro de auditoría.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.02
- Cada versión de prompt debe tener un identificador semántico MAJOR.MINOR, un changelog obligatorio describiendo los cambios, y un estado: DRAFT, CANDIDATE, ACTIVE, DEPRECATED, ARCHIVED.
- El A/B testing debe permitir configurar el porcentaje de tráfico en incrementos de 5% y solo entre versiones con estado CANDIDATE y ACTIVE.
- Las métricas de comparación deben estar disponibles en tiempo cuasi-real durante el periodo de prueba, con un mínimo de 100 consultas por variante antes de permitir conclusiones estadísticas.
- No se puede eliminar físicamente una versión de prompt que haya sido usada en al menos una consulta de producción; solo se permite soft delete (ARCHIVED).
- La promoción de una versión a ACTIVE debe requerir confirmación de un segundo revisor (principio de doble validación).

**Criterios de aceptación:**
1. El sistema permite registrar nuevas versiones de prompt con changelog estructurado y activarlas en modo CANDIDATE para A/B test.
2. Las consultas del Copiloto Fiscal se distribuyen según los porcentajes configurados entre versiones activas, con una desviación máxima de ±3% sobre el tráfico real medido tras 1000 consultas.
3. Las métricas comparativas por versión de prompt son accesibles desde el dashboard de calidad IA (HU-12.11) con filtro por versión y rango de fechas.
4. La promoción de una versión a producción requiere confirmación explícita de un segundo revisor y queda registrada en `audit_logs` con acción `PROMPT_VERSION_PROMOTED`.
5. Una versión con estado ARCHIVED no puede ser re-activada; debe crearse una nueva versión basada en ella.
6. Tests unitarios validan el enrutamiento correcto del tráfico según configuración de A/B test con semilla determinista para reproducibilidad.

**Impactos y consideraciones para negocio:**
- Permite mejora continua del Copiloto Fiscal sin riesgo operativo, reduciendo sistemáticamente la tasa de alucinaciones y contradicciones mediante iteración controlada sobre los prompts.
- Requiere coordinación con el equipo legal para validar que las nuevas versiones de prompt no introduzcan sesgos regulatorios o interpretaciones fiscales incorrectas.

**Referencias y trazabilidad:**
- SAD: §16.6 — Gobernanza y versionado de prompts, §16.7 — Métricas de calidad, monitoreo y costos
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.2 — Gemini SDK RLS
- ADR: ADR-017
- Tablas afectadas: `ai_prompt_versions`, `ai_audit_logs`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.08 — Indexación de Base de Conocimiento Fiscal en pgvector para RAG

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Base de Conocimiento RAG (SAD §9.6), Indexación Vectorial (SAD §16.3)
**Historia:** Como Ingeniero de Datos del equipo Sentinel, quiero indexar el corpus de conocimiento fiscal normativo mexicano (CFF, RMF, LISR, LIVA, criterios SAT, jurisprudencia) en pgvector mediante embeddings locales para habilitar la búsqueda semántica contextual en el Copiloto Fiscal RAG, garantizando que las respuestas de Gemini estén fundamentadas en fragmentos normativos reales y vigentes.

**Alcance:** Backend / Pipeline ETL de indexación + pgvector + Almacenamiento de corpus

**Historia en formato Given/When/Then:**
- **Given** se ha curado un corpus de documentos fiscales normativos en texto plano con metadatos estructurados de fuente, fecha de publicación, fecha de última reforma y jerarquía normativa.
- **When** se ejecuta el pipeline de indexación (inicial completo o incremental) sobre el corpus documental.
- **Then** el sistema debe segmentar cada documento en fragmentos (chunks) de 512 tokens con solapamiento de 64 tokens para preservar contexto semántico entre fragmentos adyacentes.
- **And** debe generar embeddings vectoriales para cada fragmento utilizando un modelo de embeddings ejecutado localmente sin enviar texto normativo a APIs externas.
- **And** debe almacenar los embeddings en la tabla `knowledge_base_vectors` en pgvector junto con el texto original del fragmento, los metadatos normativos y el hash SHA-256 del contenido.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-04.01
- El motor de embeddings debe ejecutarse 100% localmente. No se permite el envío de texto normativo a APIs externas de embeddings (Google, OpenAI, etc.) por razones de confidencialidad y soberanía de datos.
- El chunking debe usar ventanas de 512 tokens con solapamiento de 64 tokens para preservar contexto semántico en los límites de fragmento.
- Los metadatos obligatorios por fragmento incluyen: fuente normativa (CFF, RMF, LISR, etc.), identificador del artículo, fecha de publicación, fecha de última reforma, jerarquía normativa (1=Constitución, 2=Ley, 3=Reglamento, 4=RMF, 5=Criterio SAT) y hash SHA-256 del contenido del fragmento.
- La indexación debe ser incremental: solo se re-procesan fragmentos cuyo contenido (detectado por cambio en SHA-256) o vigencia (fecha de reforma) haya cambiado desde la última indexación.
- El pipeline debe registrar cada ejecución en `audit_logs` con estadísticas: fragmentos totales, nuevos, actualizados, eliminados, y duración.

**Criterios de aceptación:**
1. El pipeline procesa el corpus normativo completo (mínimo 500 documentos de prueba) y almacena embeddings en `knowledge_base_vectors` con todos los metadatos íntegros y verificables.
2. Una búsqueda de similitud coseno en pgvector (`<=>`) retorna los top-20 fragmentos más relevantes para una consulta fiscal de prueba en menos de 100ms.
3. La indexación incremental solo actualiza fragmentos cuyo contenido o vigencia haya cambiado, sin re-procesar fragmentos no modificados (verificable por conteo de embeddings regenerados).
4. Los metadatos de cada fragmento incluyen trazabilidad completa a la fuente normativa exacta (ley, artículo, fracción, fecha de reforma).
5. Tests unitarios validan la calidad de los embeddings midiendo recall@5 ≥ 0.80 sobre un conjunto de 50 consultas fiscales de referencia con respuestas conocidas.
6. El pipeline no realiza llamadas de red salientes durante la generación de embeddings (verificable por mock de red en tests).

**Impactos y consideraciones para negocio:**
- Aumenta drásticamente la precisión del Copiloto Fiscal al fundamentar sus respuestas en fragmentos normativos reales con trazabilidad verificable, reduciendo alucinaciones legales.
- El costo computacional de generación de embeddings (CPU/GPU) debe considerarse en la planificación de infraestructura; se recomienda ejecutar en horario de baja carga operativa.

**Referencias y trazabilidad:**
- SAD: §16.3 — Indexación y búsqueda semántica en pgvector, §16.1 — Objetivo de la IA en Sentinel
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.2 — Gemini SDK RLS
- ADR: ADR-017 — Implementación de RAG Local con pgvector para Aislamiento de Base de Conocimientos Corporativa, ADR-017
- Tablas afectadas: `knowledge_base_vectors`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.09 — Búsqueda Semántica Vectorial con Cross-Encoder Re-Ranking y Filtrado RLS

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Motor de Búsqueda Semántica (SAD §9.6), RAG y Recuperación de Contexto (SAD §16.3)
**Historia:** Como Analista Contable del despacho, quiero que el Copiloto Fiscal recupere los fragmentos normativos más relevantes mediante búsqueda semántica vectorial en dos etapas —recuperación inicial por similitud coseno en pgvector seguida de re-ranking con cross-encoder— para obtener los 5 fragmentos óptimos como contexto inyectado en Gemini, maximizando la precisión fiscal de las respuestas.

**Alcance:** Backend / Motor de búsqueda semántica en dos etapas + Integración con AI Proxy

**Historia en formato Given/When/Then:**
- **Given** la base de conocimiento fiscal está indexada en `knowledge_base_vectors` en pgvector y un analista realiza una consulta en lenguaje natural al Copiloto Fiscal.
- **When** el AI Proxy recibe la consulta y activa el pipeline de recuperación de contexto RAG.
- **Then** debe ejecutar una búsqueda inicial por similitud coseno en pgvector utilizando el operador `<=>` sobre el embedding de la consulta, recuperando los top-20 fragmentos candidatos.
- **And** debe aplicar un modelo cross-encoder local de re-ranking sobre los 20 candidatos para re-ordenarlos por relevancia semántica real (no solo similitud vectorial).
- **And** debe seleccionar los top-5 fragmentos re-ordenados, aplicar filtrado RLS para excluir fragmentos que no correspondan al tenant, e inyectarlos como contexto estructurado en el prompt de Gemini.
- **And** debe registrar en `ai_audit_logs` los identificadores y scores de relevancia de los fragmentos seleccionados para trazabilidad.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.08
- La búsqueda inicial en pgvector debe usar el operador `<=>` (cosine distance) sobre un índice IVFFlat configurado para la dimensionalidad del embedding.
- El modelo cross-encoder debe ejecutarse localmente, optimizado para texto legal en español, sin enviar datos a servicios externos.
- La latencia total del pipeline de recuperación (embedding de consulta + búsqueda pgvector + re-ranking) no debe exceder 500ms en condiciones normales de carga.
- El umbral mínimo de relevancia para inclusión de un fragmento tras re-ranking es 0.7 en score del cross-encoder; fragmentos por debajo se descartan.
- El filtrado RLS debe garantizar que fragmentos asociados a tenants diferentes sean excluidos, incluso si son semánticamente relevantes.

**Criterios de aceptación:**
1. Una consulta de prueba sobre "deducciones no autorizadas según 69-B CFF" retorna en el top-5 fragmentos de los artículos 69-B del CFF y criterios SAT relacionados, verificable por inspección de contenido.
2. El re-ranking con cross-encoder mejora el recall@5 en al menos 15% respecto a la búsqueda por similitud coseno pura, medido sobre un benchmark de 50 consultas fiscales de referencia.
3. Fragmentos de otros tenants (normativa interna de otro despacho) son excluidos automáticamente por el filtro RLS, incluso si tienen alto score de similitud.
4. La latencia total del pipeline de recuperación (end-to-end) es inferior a 500ms bajo carga normal con un corpus de 10,000 fragmentos.
5. Tests unitarios miden la precisión (precision@5) y recall@5 sobre el benchmark de referencia, documentando la mejora atribuible al cross-encoder.
6. Los fragmentos seleccionados y sus scores se registran en `ai_audit_logs` para cada consulta, permitiendo auditoría de la calidad de recuperación.

**Impactos y consideraciones para negocio:**
- Incrementa la calidad y confiabilidad de las respuestas del Copiloto Fiscal al reducir drásticamente la inyección de contexto normativo irrelevante o tangencial.
- El cross-encoder consume recursos computacionales adicionales (CPU/GPU) que deben dimensionarse para cargas pico de consultas concurrentes.

**Referencias y trazabilidad:**
- SAD: §16.3 — Indexación y búsqueda semántica en pgvector, §16.1 — Objetivo de la IA en Sentinel
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.2 — Gemini SDK RLS
- ADR: ADR-017 — Implementación de RAG Local con pgvector para Aislamiento de Base de Conocimientos Corporativa, ADR-017
- Tablas afectadas: `knowledge_base_vectors`, `ai_audit_logs`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.10 — Fallback a Explicación Basada en Reglas Deterministas ante IA No Concluyente

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Motor de Fallback Determinista (SAD §9.6), Detección de Contradicción y Score (SAD §16.8)
**Historia:** Como Director de Compliance del despacho, quiero que cuando Gemini no alcance un umbral de confianza mínima del 70% o su respuesta sea contradictoria con el RiskGauge matemático, el sistema aplique un fallback automático a explicación basada en reglas deterministas predefinidas para garantizar que el analista siempre reciba una orientación fiscal accionable, confiable y fundamentada en datos duros, sin depender de una IA no concluyente.

**Alcance:** Backend / Motor de reglas deterministas + Integración con Contradiction Engine + AI Proxy

**Historia en formato Given/When/Then:**
- **Given** el Contradiction Engine (HU-12.05) ha detectado una discrepancia ≥2 niveles entre la inferencia de Gemini y el RiskGauge matemático, o bien Gemini reporta una confianza ≤70% en su respuesta.
- **When** el AI Proxy recibe la señal de fallback desde el Contradiction Engine o desde el validador de confianza.
- **Then** debe descartar completamente la respuesta cualitativa de Gemini y activar el motor de reglas deterministas locales.
- **And** el motor de reglas debe generar una explicación estructurada basada exclusivamente en los datos matemáticos locales (RiskGauge, HHI, IQR, UMAs, marcaje 69-B, screening OFAC/PEPs) y las reglas de negocio predefinidas para cada tipo de alerta.
- **And** debe presentar la explicación determinista en el panel del analista con un badge visible "Explicación basada en reglas — IA no concluyente" y los valores matemáticos de referencia.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.03, HU-12.05
- El umbral de confianza mínima para aceptar una respuesta de Gemini es 70%. Valores ≤70% activan automáticamente el fallback determinista, independientemente de si hay o no contradicción con el RiskGauge.
- Las reglas deterministas deben cubrir los 5 tipos de alerta principales: PLD por UMAs excedidas, presunción 69-B, coincidencia OFAC/ONU/PEPs con Jaro-Winkler ≥0.92, HHI atípico por concentración de proveedores, y outliers IQR+Z-Score combinados.
- La explicación determinista debe incluir obligatoriamente: tipo de alerta, valores cuantitativos de referencia, umbrales excedidos, base legal aplicable (artículo específico), y acción recomendada (revisar, documentar, reportar).
- El evento de fallback debe registrarse en `audit_logs` con acción `IA_FALLBACK`, detallando el motivo (baja confianza o contradicción), la regla determinista aplicada y el score de confianza reportado por Gemini.
- La explicación determinista nunca debe ser presentada como proveniente de IA; el badge debe ser inequívocamente distinto al badge de respuesta de Gemini.

**Criterios de aceptación:**
1. Una respuesta de Gemini con confianza reportada de 65% activa correctamente el motor de reglas deterministas y presenta explicación alternativa sin mostrar la respuesta de Gemini.
2. Una contradicción IA vs RiskGauge de ≥2 niveles (ej. Gemini sugiere "Bajo", RiskGauge calcula "Crítico") activa el fallback y muestra la explicación basada en reglas con los valores matemáticos reales.
3. El badge "Explicación basada en reglas — IA no concluyente" es visible en el panel del analista con un color y posición que lo distinguen claramente del badge de respuesta normal de IA.
4. El evento de fallback queda registrado en `audit_logs` con trazabilidad completa: motivo, regla aplicada, confianza de Gemini, valores de RiskGauge, y timestamp.
5. Tests unitarios validan cada una de las 5 reglas deterministas con al menos 3 casos de prueba documentados por regla (caso positivo, caso límite, caso negativo).
6. La latencia del motor de reglas deterministas es inferior a 10ms, garantizando que el fallback no introduce demora perceptible respecto a una respuesta normal de IA.

**Impactos y consideraciones para negocio:**
- Garantiza que el analista siempre tenga una orientación accionable, eliminando el escenario de "IA sin respuesta útil" que generaría frustración operativa y desconfianza en el sistema.
- Refuerza la arquitectura de gobernanza de IA híbrida donde la matemática y las reglas de negocio prevalecen sobre modelos generativos, alineado con ADR-017.

**Referencias y trazabilidad:**
- SAD: §16.8 — Detección de contradicción, Score e integridad, §10.10 — Consulta IA, validación y contradicción
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.3 — Motor de Contradicción Técnica (evaluate_ai_contradiction)
- ADR: ADR-017 — Arquitectura Dual Engine y Regla de Supremacía del Motor Estadístico sobre Modelos Cognitivos, ADR-017
- Tablas afectadas: `ai_audit_logs`, `alerts`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.11 — Dashboard de Métricas de Calidad IA: Confianza, Precisión, Latencia y Costo

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Observabilidad IA (SAD §9.6), Métricas de Calidad (SAD §16.7), Tactical HUD (SAD §18.2)
**Historia:** Como Oficial de Cumplimiento o Engineering Manager del despacho, quiero visualizar un dashboard integral de métricas de calidad de IA con indicadores de confianza promedio, tasa de contradicción, tasa de fallback, latencia p50/p95/p99, tokens consumidos y costo acumulado estimado para monitorear la salud operativa del Copiloto Fiscal, detectar degradaciones tempranas y tomar decisiones presupuestarias basadas en datos reales de uso.

**Alcance:** Frontend + Backend / Dashboard analítico de métricas IA con gráficos interactivos

**Historia en formato Given/When/Then:**
- **Given** el AI Proxy registra métricas detalladas de cada consulta en `ai_audit_logs` (confianza, latencia, tokens de entrada/salida, modelo usado, versión de prompt, contradicción detectada, fallback activado).
- **When** un usuario con rol de Oficial de Cumplimiento o Administrador accede al dashboard de métricas de calidad IA desde el menú principal.
- **Then** el sistema debe renderizar gráficos de series de tiempo interactivos mostrando: tasa de no-contradicción (precisión percibida), tasa de fallback a reglas, latencia p50/p95/p99, tokens promedio por consulta, y confianza media reportada por Gemini.
- **And** debe mostrar un panel de costo acumulado estimado en USD basado en el pricing oficial de Gemini 2.5 Flash Lite (input/output tokens), con proyección a fin de mes.
- **And** debe permitir filtrar por tenant, rango de fechas, modelo de Gemini y versión de prompt, actualizando todos los gráficos en menos de 2 segundos.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.06
- Las métricas deben calcularse desde `ai_audit_logs` con un rezago máximo de 5 minutos respecto al tiempo real.
- El cálculo de costo debe usar la tarifa oficial publicada por Google Cloud para Gemini 2.5 Flash Lite (USD por 1M tokens de input y output), configurable en parámetros del tenant.
- La tasa de contradicción se define como (consultas donde el Contradiction Engine detectó discrepancia ≥2 niveles) / (total de consultas con respuesta de Gemini) × 100.
- La tasa de fallback se define como (consultas donde se activó fallback a reglas deterministas) / (total de consultas) × 100.
- El dashboard debe cumplir con el estándar visual Liquid Glass (Vanilla CSS, React 19) y ser accesible según WCAG 2.1 AA.
- Solo roles de Oficial de Cumplimiento y Administrador del tenant pueden acceder a este dashboard; los analistas estándar no tienen visibilidad de costos.

**Criterios de aceptación:**
1. El dashboard muestra gráficos interactivos de series de tiempo para las 5 métricas principales: precisión, fallback, latencia, tokens, confianza, con granularidad diaria y semanal.
2. Los filtros de tenant, fecha, modelo y versión de prompt actualizan todos los gráficos simultáneamente en menos de 2 segundos.
3. El panel de costo muestra el gasto acumulado del periodo con una precisión de ±5% respecto al billing real de Google Cloud Console, verificado en pruebas de integración.
4. La tasa de contradicción y la tasa de fallback se calculan correctamente sobre los datos de `ai_audit_logs`, verificable mediante queries SQL directas de control.
5. Un analista estándar que intenta acceder al dashboard recibe HTTP 403 y no ve la opción en el menú de navegación.
6. Tests de frontend (Cypress) validan la renderización correcta de todos los gráficos con datos mock representativos y la interactividad de los filtros.

**Impactos y consideraciones para negocio:**
- Permite justificar el ROI del Copiloto Fiscal ante la dirección del despacho con métricas de uso, calidad y costo reales, transparentes y auditables.
- Facilita la detección temprana de degradación en la calidad de respuestas de Gemini (ej. aumento de tasa de contradicción o fallback) y la optimización de presupuesto de API.

**Referencias y trazabilidad:**
- SAD: §16.7 — Métricas de calidad, monitoreo y costos, §18.2 — Tactical HUD
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.4 — Métricas y monitoreo IA
- ADR: ADR-017
- Tablas afectadas: `ai_audit_logs`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

#### HU-12.12 — Rate Limiting y Cuotas de Uso de Gemini por Tenant y Usuario

**Épica:** EP-12 — AI Proxy, Scrubbing, Contradicción y AI Audit
**Módulo(s):** AI Proxy / Control de Consumo y Rate Limiting (SAD §9.6), Gobernanza de Uso IA (SAD §16.7)
**Historia:** Como Administrador del despacho, quiero configurar límites de rate limiting y cuotas de consumo de la API Gemini por tenant y por usuario (consultas/día, tokens/mes, presupuesto máximo mensual) para controlar el gasto en servicios de IA, prevenir abusos o usos desproporcionados, y garantizar disponibilidad equitativa del Copiloto Fiscal entre todos los analistas del despacho.

**Alcance:** Backend / Middleware de rate limiting + Panel de configuración + Notificaciones de umbral

**Historia en formato Given/When/Then:**
- **Given** el AI Proxy está operativo con múltiples analistas realizando consultas concurrentes al Copiloto Fiscal y el administrador ha configurado cuotas por tenant (ej. 10,000 consultas/día, 5M tokens/mes, $500 USD/mes) y por usuario (ej. 500 consultas/día).
- **When** un tenant o usuario individual excede su cuota configurada.
- **Then** el AI Proxy debe rechazar las solicitudes excedentes con HTTP 429 (Too Many Requests), incluyendo headers `Retry-After` con el tiempo restante para el reinicio y `X-RateLimit-Remaining` con el contador actual.
- **And** debe notificar al administrador del tenant por email y notificación en plataforma cuando el consumo alcance el 80% y el 100% de cada cuota configurada.
- **And** debe permitir al administrador visualizar el estado actual de consumo y ajustar las cuotas desde el panel de administración, con registro de auditoría de cada cambio.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-12.01, HU-12.06
- El rate limiting opera en dos niveles independientes: tenant (cuota agregada de todos los usuarios del despacho) y usuario individual. Ambas cuotas se verifican en cada solicitud.
- Las cuotas configurables son: consultas por día natural, tokens totales por mes calendario, y presupuesto máximo mensual en USD.
- El contador de tokens debe basarse en los valores reales de `input_tokens` y `output_tokens` reportados por Gemini en cada respuesta, no en estimaciones pre-llamada.
- El estado de cuotas debe persistir en Redis para acceso rápido con respaldo en base de datos (`ai_usage_quotas`) para sobrevivir reinicios del servidor Redis.
- El contador se reinicia automáticamente al inicio de cada periodo (00:00 UTC para cuota diaria, día 1 del mes para cuota mensual).
- Las notificaciones de umbral (80%, 100%) deben enviarse una sola vez por periodo para evitar spam de notificaciones.

**Criterios de aceptación:**
1. Una ráfaga de consultas que excede el límite diario configurado para un usuario (500 consultas/día) retorna HTTP 429 con header `Retry-After` calculado correctamente hasta las 00:00 UTC.
2. Al alcanzar el 80% de la cuota mensual de tokens del tenant, se dispara una notificación única al administrador por los canales configurados (email y notificación en plataforma).
3. Al alcanzar el 100% de cualquier cuota, las consultas adicionales son rechazadas con HTTP 429 hasta el siguiente periodo, independientemente de si otras cuotas tienen saldo disponible.
4. El panel de administración permite configurar cuotas con granularidad de 100 consultas/día y $10 USD/mes, y muestra el consumo actual en tiempo real.
5. Los cambios en la configuración de cuotas quedan registrados en `audit_logs` con acción `USAGE_QUOTA_UPDATED`, detallando el tipo de cuota, valor anterior, valor nuevo y usuario administrador.
6. Tests de integración validan el comportamiento correcto del reset de cuotas diarias y mensuales en los límites de periodo (23:59:59 → 00:00:00 UTC, último día del mes → día 1).

**Impactos y consideraciones para negocio:**
- Previene facturas inesperadas de Google Cloud por uso descontrolado o malicioso del Copiloto Fiscal, acotando el riesgo financiero del servicio de IA.
- Permite al despacho planificar y asignar presupuesto de IA por analista, por cliente o por área de práctica, alineado con el modelo de negocio.

**Referencias y trazabilidad:**
- SAD: §16.7 — Métricas de calidad, monitoreo y costos, §13.8 — Rate limiting y seguridad
- SAD-Lite: §7 — Inteligencia Artificial y la Política de RAG Seguro
- Developer Handbook: §4.4 — Métricas y monitoreo IA
- ADR: ADR-017
- Tablas afectadas: `ai_usage_quotas`, `ai_audit_logs`
- Flujo crítico SAD §10: §10.10 — Consulta IA, validación y contradicción

---

### 5.13 EP-13 — HUD, UX Operativa y Accesibilidad

#### HU-13.01 — Dashboard Tactical HUD Liquid Glass en React 19 con Heatmap, RiskGauge y Badges

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** HUD y UX Operativa (SAD §9.1), Diseño Visual Liquid Glass (SAD §18.1), Tactical HUD (SAD §18.2)
**Historia:** Como OWNER o ADMIN de un despacho contable multi-tenant, quiero un Dashboard Táctico HUD (Heads-Up Display) que al iniciar sesión me presente de forma inmediata un heatmap de riesgo de todos los perfiles fiscales del despacho, el RiskGauge consolidado por contribuyente, badges de criticidad con semáforo de colores, contadores de alertas activas por nivel de criticidad y un resumen ejecutivo del estado de cumplimiento fiscal global para tomar decisiones de asignación de recursos del equipo contable en los primeros 30 segundos de interacción con la plataforma, sin necesidad de navegar a vistas detalladas.

**Alcance:** Frontend React 19 / Dashboard SPA con Vanilla CSS Liquid Glass + Backend API de agregación de métricas HUD + Redis caching

**Historia en formato Given/When/Then:**
- **Given** un despacho contable con 50 perfiles fiscales activos (tax_profiles) distribuidos en diferentes niveles de criticidad (10 CRÍTICO, 15 ALTO, 20 MEDIO, 5 BAJO), con 23 alertas activas y 5 alertas SLA vencidas.
- **When** el OWNER del despacho inicia sesión en Sentinel Nexus 360 y el frontend React 19 carga el Dashboard Táctico HUD.
- **Then** el HUD debe renderizar en el viewport principal, sin scroll, un heatmap matricial donde cada celda representa un perfil fiscal con coloración de criticidad: rojo (score ≥76), naranja (51-75), amarillo (26-50), verde (0-25), con tooltip al hover que muestre RFC tokenizado, score RiskGauge, cantidad de alertas activas y días desde último análisis.
- **And** debe mostrar un panel lateral de badges de criticidad con contadores en tiempo real: badges rojos con número de perfiles CRÍTICOS, badges naranjas para ALTO, badges amarillos para MEDIO, badges verdes para BAJO, cada uno clickable para filtrar el heatmap.
- **And** debe incluir un componente RiskGauge radial por contribuyente (visible al hacer clic en una celda del heatmap) que muestre el score 0-100 con aguja, bandas de color graduadas, valor numérico central y mini-indicadores de los 4 sub-scores: PLD, 69-B, OFAC/PEPs, HHI.
- **And** debe mostrar un banner superior de resumen ejecutivo: "23 alertas activas — 5 con SLA vencido — 2 contribuyentes en zona de riesgo crítica — Último análisis: hace 2 horas" con actualización vía WebSocket/SSE cada 60 segundos.
- **And** todo el dashboard debe cumplir con el sistema de diseño Liquid Glass: fondo con efecto vidrio esmerilado (backdrop-filter: blur), bordes translúcidos, animaciones de transición suaves con CSS transition, y tipografía Inter variable con pesos diferenciados para jerarquía visual.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-08.01 (RiskGauge por perfil fiscal), HU-10.01 (Configuración de criticidad, coverage_level y SLAs)
- El HUD es la pantalla de aterrizaje post-login para roles OWNER, ADMIN y ACCOUNTANT. El rol VIEWER ve una versión simplificada sin heatmap (solo resumen ejecutivo y contadores).
- Los datos del HUD deben servirse desde un endpoint de API agregado (`GET /api/v1/hud/dashboard`) que consolide información de `risk_scores`, `alerts`, `tax_profiles` y `audit_logs` en una sola respuesta con caché Redis de 30 segundos (TTL) para garantizar tiempo de carga <1 segundo.
- El heatmap debe renderizar eficientemente hasta 500 celdas (perfiles fiscales) sin degradación de rendimiento (FPS ≥30 durante interacciones de hover/zoom).
- El sistema de diseño Liquid Glass es obligatorio: Vanilla CSS (no Tailwind, no Bootstrap), React 19 con Server Components donde aplique, animaciones con CSS transition/animation (no librerías externas), y diseño responsive mobile-first.
- Los datos de RFC en el heatmap deben mostrarse tokenizados (últimos 4 caracteres visibles, resto con asteriscos) para evitar exposición de datos personales en pantalla compartida.

**Criterios de aceptación:**
1. El HUD carga en ≤1 segundo (p95) con 50 perfiles fiscales y 23 alertas activas, medido con Lighthouse Performance Score ≥90 en desktop.
2. El heatmap renderiza 50 celdas con coloración correcta según los scores de `risk_scores`. Una celda con score 85 se muestra en rojo; una celda con score 40 en amarillo; una celda sin score calculado se muestra en gris con badge "PENDIENTE".
3. Al hacer clic en un badge de criticidad "CRÍTICO (10)", el heatmap se filtra mostrando únicamente las 10 celdas de perfiles con score ≥76 y las demás celdas se atenúan con opacidad 0.2.
4. El componente RiskGauge radial se renderiza correctamente con el score numérico, la aguja apuntando al valor correcto (±2 grados de precisión angular), y los 4 sub-scores visibles en mini-indicadores.
5. NFR: El dashboard cumple con la estética Liquid Glass verificable visualmente: efecto backdrop-filter blur en los paneles, bordes con gradiente translúcido rgba(255,255,255,0.15), y animaciones de entrada con fade-in y scale de 200ms.
6. Tests de frontend (`test_hud_components.tsx`) validan: renderizado del heatmap con datos mock, interactividad de filtrado por criticidad, renderizado del RiskGauge con props controlados, y actualización del banner de resumen vía mock de SSE.

**Impactos y consideraciones para negocio:**
- Reduce el tiempo de orientación situacional del director del despacho de ~15 minutos (navegar perfil por perfil) a <1 minuto (vista consolidada HUD), permitiendo reacción temprana ante contribuyentes que escalan a zona de riesgo crítica.
- El diseño Liquid Glass transmite una percepción de producto premium y tecnológicamente avanzado, diferenciando a Sentinel en el mercado de software contable mexicano dominado por interfaces legacy.

**Referencias y trazabilidad:**
- SAD: §9.1 — Frontend SPA (React 19), §18.1 — Diseño Visual Liquid Glass, §18.2 — Tactical HUD
- SAD-Lite: §9 — Experiencia de Usuario y HUD (Scenario Boxes)
- Developer Handbook: §5.1 — Sistema de diseño Liquid Glass y componentes React
- ADR: ADR-019 — Sistema de Diseño Liquid Glass con Vanilla CSS y React 19
- Tablas afectadas: `risk_scores`, `alerts`, `tax_profiles`
- Flujo crítico SAD §10: §10.11 — Dashboard HUD y navegación táctica

---

#### HU-13.02 — Vista de Perfil Fiscal: Detalle Completo de un RFC con Métricas y Gráficos

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** HUD y UX Operativa (SAD §9.1), Tactical HUD (SAD §18.2)
**Historia:** Como Analista Contable del despacho, quiero acceder a una vista de detalle de perfil fiscal de un contribuyente (RFC) que consolide en una sola pantalla toda la información relevante para la defensa fiscal: datos del tax_profile, RiskGauge con tendencia histórica (serie de tiempo 12 meses), listado de facturas con filtros por periodo y tipo, alertas activas asociadas a ese RFC, historial de screenings PLD/69-B/OFAC, y acceso rápido al Copiloto Fiscal IA para generar una explicación contextualizada de la situación del contribuyente sin tener que navegar entre múltiples pantallas o módulos del sistema.

**Alcance:** Frontend React 19 / Vista de perfil fiscal SPA + Backend API de agregación por RFC + Gráficos de tendencia con Vanilla CSS/SVG

**Historia en formato Given/When/Then:**
- **Given** un analista contable ha identificado un perfil fiscal con score RiskGauge 78 (ALTO) en el heatmap del HUD y hace clic en la celda correspondiente.
- **When** el sistema navega a la vista de detalle de perfil fiscal `GET /tax-profile/{rfc_tokenizado}` y carga los datos agregados del contribuyente desde las tablas `tax_profiles`, `invoices`, `risk_scores`, `alerts` y `ai_audit_logs`.
- **Then** la vista debe renderizar un layout de dos columnas: columna izquierda (60% ancho) con el gráfico de tendencia histórica del RiskGauge (últimos 12 meses) como gráfico de área SVG con banda de confianza, tooltip interactivo mostrando score, fecha y eventos de alerta asociados a cada punto; columna derecha (40% ancho) con el panel de métricas actuales: score RiskGauge actual, HHI, UMAs acumuladas 30d, estado 69-B (presunto/no presunto/desconocido), coincidencias OFAC/PEPs, y nivel de criticidad configurado.
- **And** debajo del layout principal, debe renderizar una tabla de facturas paginada (20 por página) con columnas: fecha de emisión, folio fiscal (UUID truncado), RFC emisor/receptor, monto total, tipo de comprobante (ingreso/egreso/nómina), y badges de calidad de dato (flags de integridad CFDI). La tabla debe soportar filtros por rango de fechas, tipo de comprobante y monto mínimo/máximo.
- **And** debe incluir una sección plegable de "Alertas de este RFC" que liste las alertas activas asociadas al tax_profile con su estado, criticidad, fecha de creación y botón de acción rápida "Explicar con IA" que invoque al Copiloto Fiscal (HU-12.02) contextualizado con el RFC actual.
- **And** debe mostrar un panel inferior de "Historial de Screening" con una línea de tiempo cronológica inversa de los screenings PLD, 69-B y OFAC/PEPs realizados sobre este contribuyente, con el resultado de cada screening y enlace al detalle de la alerta generada si aplica.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-13.01 (Dashboard Táctico HUD)
- La vista de perfil fiscal solo es accesible para usuarios del tenant al que pertenece el RFC (refuerzo RLS en backend). Un usuario de otro tenant que intente acceder por ID directo recibe HTTP 404 (no 403, para no revelar existencia del perfil).
- Los RFCs se muestran siempre tokenizados en el frontend: los primeros 8 caracteres se reemplazan con asteriscos, mostrando solo los últimos 4 caracteres de la homoclave (ej. `********ABCD`). El RFC completo solo es visible para roles ADMIN y OWNER, y queda registrado en `audit_logs` con acción `RFC_FULL_VIEWED`.
- El gráfico de tendencia histórica debe construirse a partir de los registros en `risk_scores` con la granularidad más fina disponible (mínimo mensual). Si no hay 12 meses de historial (contribuyente nuevo), se muestra el periodo disponible con un mensaje "Datos históricos limitados — mínimo 3 meses para análisis de tendencia".
- La tabla de facturas debe soportar ordenamiento por cualquier columna y exportación a CSV de la vista actual (con las mismas reglas de tokenización de RFCs que la vista en pantalla).
- El botón "Explicar con IA" solo aparece si el tenant tiene configurado y activo el módulo de Copiloto Fiscal (feature flag `ai_copilot_enabled` en configuración del tenant).

**Criterios de aceptación:**
1. La vista de perfil fiscal carga en ≤2 segundos (p95) con un contribuyente que tiene 500 facturas, 24 registros de risk_scores (2 años de historial) y 5 alertas activas.
2. El gráfico de tendencia muestra correctamente los 12 puntos de score mensual con tooltips que incluyen score, fecha y un indicador de si hubo alerta generada en ese mes (punto con borde rojo).
3. La tabla de facturas soporta filtrado combinado: rango de fechas "2025-01-01 a 2025-06-30" + tipo "ingreso" + monto > $10,000 MXN, retornando solo las facturas que cumplen los tres criterios simultáneamente.
4. El botón "Explicar con IA" inicia una consulta al Copiloto Fiscal con el contexto del RFC actual. La respuesta se renderiza en un panel modal con el badge de confianza/contradicción correspondiente (verde, amarillo, naranja o rojo según HU-12.05).
5. Un usuario con rol VIEWER de otro tenant que intente acceder a `GET /tax-profile/{rfc_id}` de un contribuyente que no pertenece a su tenant recibe HTTP 404 y el intento se registra en `audit_logs` con acción `UNAUTHORIZED_PROFILE_ACCESS`.
6. Tests de frontend (`test_profile_view.tsx`) validan: renderizado de gráfico de tendencia con datos mock, filtrado y ordenamiento de tabla de facturas, interacción del botón "Explicar con IA", y que los RFCs se muestran tokenizados en la UI.

**Impactos y consideraciones para negocio:**
- Consolida en una sola pantalla lo que actualmente requiere que un analista consulte 3-4 sistemas diferentes (portal SAT, sistema contable, expedientes fiscales), reduciendo el tiempo de análisis por contribuyente de ~30 minutos a ~5 minutos.
- La tokenización de RFCs en pantalla permite que el analista trabaje en espacios compartidos o en videollamadas con clientes sin exponer datos personales a terceros no autorizados.

**Referencias y trazabilidad:**
- SAD: §9.1 — Frontend SPA (React 19), §18.2 — Tactical HUD
- SAD-Lite: §9 — Experiencia de Usuario y HUD (Scenario Boxes)
- Developer Handbook: §5.2 — Vistas de detalle y gráficos de tendencia
- ADR: ADR-019 — Sistema de Diseño Liquid Glass con Vanilla CSS y React 19
- Tablas afectadas: `tax_profiles`, `invoices`, `risk_scores`, `alerts`
- Flujo crítico SAD §10: §10.11 — Dashboard HUD y navegación táctica

---

#### HU-13.03 — Vista de Alertas con Lista, Filtros Avanzados, Locking Visual y Estados

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** HUD y UX Operativa (SAD §9.1), Gestión de Alertas (SAD §10.8), Tactical HUD (SAD §18.2)
**Historia:** Como Analista Contable del despacho, quiero una vista dedicada de gestión de alertas que me permita visualizar la lista completa de alertas del tenant con filtros avanzados (por criticidad, estado, RFC, tipo de alerta, rango de fechas y analista asignado), ver en tiempo real qué alertas están bloqueadas por otro analista (locking visual con avatar y temporizador de expiración), identificar el estado de cada alerta en el workflow (OPEN, IN_PROGRESS, RESOLVED, CLOSED) mediante badges de color estandarizados, y ordenar por prioridad compuesta (criticidad × tiempo restante de SLA) para maximizar la eficiencia del equipo en la atención de alertas urgentes.

**Alcance:** Frontend React 19 / Vista de alertas SPA + Backend API de consulta y filtrado + WebSocket para actualización de locking en tiempo real

**Historia en formato Given/When/Then:**
- **Given** el tenant tiene 47 alertas activas en distintos estados y niveles de criticidad: 8 CRÍTICAS (2 bloqueadas por Analista A, 6 sin asignar), 15 ALTAS (5 en IN_PROGRESS, 10 OPEN), 20 MEDIAS y 4 BAJAS.
- **When** un analista con rol ACCOUNTANT accede a la vista de alertas desde la navegación principal.
- **Then** la vista debe renderizar una tabla de alertas con columnas: criticidad (badge de color), tipo de alerta (PLD, 69-B, OFAC/PEPs, HHI, IQR), RFC tokenizado del contribuyente, estado (badge: OPEN=gris, IN_PROGRESS=azul, RESOLVED=verde, CLOSED=verde oscuro), fecha de creación, tiempo restante de SLA (formato "2h 15m" con indicador visual de proximidad al vencimiento), analista asignado (avatar + nombre), y estado de locking (icono de candado + "Bloqueado por Ana L. — expira en 18 min" o "Disponible").
- **And** debe incluir una barra de filtros avanzados en la parte superior con: (a) multi-select de criticidad (CRÍTICA, ALTA, MEDIA, BAJA), (b) dropdown de tipo de alerta, (c) buscador de RFC tokenizado con autocompletado, (d) selector de rango de fechas (creación), (e) dropdown de analista asignado, (f) toggle "Solo alertas no asignadas", (g) toggle "Solo alertas con SLA vencido". Los filtros deben ser combinables y aplicarse con debounce de 300ms en el buscador de texto.
- **And** debe mostrar indicadores visuales de locking en tiempo real vía WebSocket: cuando otro analista toma una alerta (HU-10.02), la fila correspondiente se actualiza automáticamente con el icono de candado, el nombre del analista y el contador regresivo de expiración (30 minutos). Cuando el lock expira o el analista libera la alerta, la fila vuelve a estado "Disponible" sin necesidad de refrescar la página.
- **And** cada fila de alerta debe tener un botón de acción contextual dependiendo del estado: "Tomar alerta" (si OPEN y no bloqueada), "Continuar análisis" (si IN_PROGRESS y bloqueada por el usuario actual), "Ver detalle" (siempre disponible), y "Explicar con IA" (si el módulo Copiloto Fiscal está habilitado).

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-10.02 (Bloqueo concurrente de alertas con expiración automática a 30 minutos)
- El ordenamiento predeterminado de la lista es por "prioridad compuesta" calculada como: (criticidad_numérica × peso_60%) + (urgencia_SLA × peso_40%), donde criticidad_numérica es CRÍTICA=4, ALTA=3, MEDIA=2, BAJA=1 y urgencia_SLA es una función del tiempo restante normalizado (menos tiempo = más urgencia).
- Un analista solo puede tomar una alerta si no está bloqueada por otro analista (verificación de locking en backend con `SELECT ... FOR UPDATE SKIP LOCKED` en PostgreSQL).
- El WebSocket de locking debe usar el mismo canal Redis pub/sub que el backend de locking (HU-10.02) para garantizar consistencia entre el estado real en base de datos y lo que ve el frontend.
- La lista de alertas debe cumplir con el estándar visual Liquid Glass: filas con efecto hover de glass morphism, bordes de fila translúcidos, animación de entrada stagger (50ms de retraso por fila).
- Los avatares de analistas se generan a partir de las iniciales del usuario usando el componente Avatar de Liquid Glass (círculo con gradiente de color derivado del hash del nombre).

**Criterios de aceptación:**
1. La tabla de alertas renderiza 47 filas con ordenamiento por prioridad compuesta correcto: alertas CRÍTICAS con SLA próximo a vencer aparecen primero, seguidas de CRÍTICAS con más margen, luego ALTAS, etc.
2. Al aplicar filtro "criticidad = CRÍTICA + ALTA" y "Solo no asignadas", la tabla se reduce a las filas que cumplen ambos criterios en <500ms con datos de hasta 200 alertas.
3. Cuando el Analista B toma una alerta desde otra sesión, la fila correspondiente en la vista del Analista A se actualiza vía WebSocket en <1 segundo mostrando el candado, nombre de Analista B y contador regresivo desde 30:00 minutos.
4. Al hacer clic en "Tomar alerta" sobre una alerta OPEN no bloqueada, el botón cambia a "Continuar análisis" y la fila muestra el candado con el nombre del usuario actual. Un intento concurrente de otro analista sobre la misma alerta muestra un toast de error "Alerta bloqueada por [nombre] — disponible en [tiempo]".
5. NFR: La vista de alertas carga la lista inicial (primeras 25 filas) en <1.5 segundos con 200 alertas en base de datos y scroll infinito que carga las siguientes 25 en <500ms.
6. Tests de frontend (`test_alert_list.tsx`) validan: renderizado con datos mock de 50 alertas, combinación de filtros, actualización de locking vía WebSocket mock, ordenamiento por prioridad compuesta, y transiciones de estado de botones de acción.

**Impactos y consideraciones para negocio:**
- Elimina el problema de "doble trabajo" donde dos analistas investigan la misma alerta simultáneamente sin saberlo, optimizando la capacidad del equipo contable y reduciendo el tiempo medio de resolución (MTTR) de alertas.
- La priorización compuesta automática asegura que las alertas con mayor riesgo fiscal y menor margen de tiempo sean atendidas primero, reduciendo el riesgo de incumplimientos de SLA con consecuencias regulatorias.

**Referencias y trazabilidad:**
- SAD: §9.1 — Frontend SPA (React 19), §10.8 — Gestión de Alertas, Locking y SLA, §18.2 — Tactical HUD
- SAD-Lite: §9 — Experiencia de Usuario y HUD (Scenario Boxes)
- Developer Handbook: §5.3 — Vistas de alertas y sistema de locking visual
- ADR: ADR-0001 — Política de Control de Acceso Basado en Roles (RBAC) con PostgreSQL RLS, ADR-0007 — Bloqueo Concurrente de Alertas con Exclusión Mutua en PostgreSQL
- Tablas afectadas: `alerts`, `audit_logs`
- Flujo crítico SAD §10: §10.8 — Atención de alertas y gestión de SLA

---

#### HU-13.04 — Quick Setup UX y Bypass Banner de Cobertura Limitada con Liquid Glass

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** HUD y UX Operativa (SAD §9.1), LENS, Parsing y Calidad CFDI (SAD §10.2), Tactical HUD (SAD §18.2)
**Historia:** Como ADMIN de un despacho contable en fase de adopción temprana de Sentinel, quiero disponer de un flujo de configuración rápida (Quick Setup) que me permita poner en marcha la cobertura básica de un contribuyente —crear tax_profile, establecer nivel de criticidad inicial, definir cobertura limitada y lanzar primera sincronización— en menos de 5 minutos, con un banner visible permanentemente que indique "Cobertura Limitada" y las funcionalidades no disponibles hasta completar la verificación completa (Belvo vinculado, screening OFAC/PLD habilitado, historial migrado), para que el despacho pueda empezar a obtener valor de la plataforma desde el día 1 sin esperar a la configuración completa de todos los módulos.

**Alcance:** Frontend React 19 / Wizard de Quick Setup + Bypass Banner + Backend API de configuración rápida

**Historia en formato Given/When/Then:**
- **Given** un despacho contable ha completado el onboarding básico del tenant (HU-05.01) y ha creado un tax_profile para un contribuyente con RFC validado (HU-05.03), pero no ha vinculado la cuenta SAT vía Belvo (HU-05.02), no ha configurado parámetros PLD (HU-05.07) y no ha migrado datos históricos (HU-05.05).
- **When** el ADMIN accede al Dashboard HUD por primera vez para este contribuyente.
- **Then** el sistema debe mostrar un banner persistente en la parte superior del HUD con el mensaje: "Cobertura Limitada — 3 de 5 módulos configurados. Sin vinculación SAT/Belvo, las alertas PLD y OFAC no están activas para este RFC. Complete la configuración para cobertura total." El banner debe incluir una barra de progreso (3/5 = 60%) y un botón "Completar configuración".
- **And** al hacer clic en "Completar configuración", debe desplegarse un wizard Quick Setup de 3 pasos: Paso 1 "Vincular cuenta SAT" (redirige al Belvo Widget de HU-05.02), Paso 2 "Configurar parámetros PLD" (formulario simplificado con umbrales predeterminados por tipo de contribuyente), Paso 3 "Migrar datos históricos" (upload de archivo CSV/Excel/ZIP o skip con opción "Lo haré después").
- **And** el banner de cobertura limitada debe permanecer visible en el HUD, la vista de perfil fiscal y la vista de alertas de ese RFC hasta que los 5 módulos estén completos. Una vez completos, el banner se reemplaza por un badge verde "Cobertura Completa" con checkmark.
- **And** las funcionalidades no disponibles por cobertura limitada (alertas PLD, screening OFAC/PEPs, Copiloto Fiscal contextualizado) deben mostrar un tooltip informativo "Funcionalidad requiere cobertura completa — complete configuración" en lugar de fallar con errores genéricos.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-05.04 (Creación y configuración de tax_profile con niveles de cobertura y criticidad)
- Los niveles de cobertura son: `LIMITED` (1-2 módulos), `PARTIAL` (3-4 módulos), `FULL` (5 módulos). El banner se muestra para `LIMITED` y `PARTIAL`. Solo `FULL` recibe el badge verde.
- Los 5 módulos de cobertura son: (1) RFC validado y tax_profile creado, (2) cuenta SAT vinculada vía Belvo, (3) parámetros PLD configurados, (4) screening OFAC/PEPs habilitado, (5) datos históricos migrados o marcados como "No aplica".
- El banner debe poder ser minimizado (no descartado permanentemente) por el usuario. Al minimizarse, se convierte en un indicador compacto en la barra de navegación superior: un ícono de escudo con barra de progreso y tooltip al hover.
- El Quick Setup wizard debe guardar el progreso parcial: si el usuario completa el Paso 1 (Belvo vinculado) y cierra el wizard, al reabrir comienza en el Paso 2.
- La configuración rápida debe respetar RLS: solo ADMIN y OWNER pueden modificar la configuración de cobertura. ACCOUNTANT y VIEWER solo ven el banner informativo sin botón de acción.

**Criterios de aceptación:**
1. Un tax_profile con 2 de 5 módulos completos muestra el banner "Cobertura Limitada" con barra de progreso 2/5 (40%) y los módulos faltantes listados. El banner se muestra en HUD, vista de perfil fiscal y vista de alertas de ese RFC.
2. Al hacer clic en "Completar configuración", el wizard Quick Setup se abre en el paso correspondiente al primer módulo faltante (Paso 2 si el Paso 1 ya está completo).
3. Al completar los 5 módulos, el banner se reemplaza automáticamente por el badge "Cobertura Completa" sin requerir refresh de página (actualización reactiva vía WebSocket/SSE).
4. Un ACCOUNTANT ve el banner informativo pero el botón "Completar configuración" está deshabilitado con tooltip "Requiere permisos de Administrador".
5. El wizard soporta el flujo "skip" en el Paso 3 (migración de datos) con la opción "Lo haré después", que no modifica el contador de módulos completos pero da por finalizado el wizard.
6. Tests de frontend (`test_quick_setup.tsx`) validan: renderizado del banner en estados LIMITED, PARTIAL y FULL, flujo del wizard de 3 pasos con navegación adelante/atrás, persistencia de progreso parcial, y restricciones de rol en el botón de acción.

**Impactos y consideraciones para negocio:**
- Acelera el time-to-value para despachos en fase de adopción: pueden obtener análisis de riesgo básico e ingesta de facturas en el primer día, mientras completan progresivamente la configuración avanzada (Belvo, PLD, OFAC) en días subsecuentes sin perder funcionalidad ya operativa.
- El banner de cobertura limitada actúa como un nudge conversional para que los despachos completen la configuración y accedan al valor completo de la plataforma, aumentando la retención y reduciendo el churn de early adopters.

**Referencias y trazabilidad:**
- SAD: §9.1 — Frontend SPA (React 19), §10.2 — LENS, Parsing y Calidad CFDI, §18.2 — Tactical HUD
- SAD-Lite: §9 — Experiencia de Usuario y HUD (Scenario Boxes)
- Developer Handbook: §5.4 — Wizards de configuración y banners de estado
- ADR: ADR-019 — Sistema de Diseño Liquid Glass con Vanilla CSS y React 19
- Tablas afectadas: `tax_profiles`, `tenants`
- Flujo crítico SAD §10: §10.1 — Onboarding y alta de contribuyentes

---

#### HU-13.05 — UX de Modos Degradados SAT/Belvo: Banners, Mensajes Contextuales y Restricciones UI

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** HUD y UX Operativa (SAD §9.1), Contingencia Operativa (SAD §10.12), Tactical HUD (SAD §18.2)
**Historia:** Como Analista Contable del despacho, quiero que cuando el SAT o Belvo presenten intermitencia, degradación o caída total de servicio, la interfaz de Sentinel me informe de forma clara, contextual y no intrusiva sobre la situación mediante banners de estado, mensajes en las funcionalidades afectadas y restricciones visuales en botones/acciones que dependen del servicio caído, para que pueda continuar trabajando con los datos ya disponibles en modo offline sin realizar intentos fallidos que generen frustración y sin interpretar la falta de respuesta del sistema como un error de Sentinel.

**Alcance:** Frontend React 19 / Sistema de banners de degradación + Indicadores de estado de servicios + Backend API de health check de dependencias externas

**Historia en formato Given/When/Then:**
- **Given** el servicio del SAT ha entrado en estado DEGRADED (latencia >10s, tasa de timeout >30%) según el health check del backend (HU-07.03) y el servicio Belvo opera con normalidad.
- **When** un analista accede al HUD y posteriormente intenta usar funcionalidades que dependen del SAT.
- **Then** el HUD debe mostrar un banner global en la parte superior con fondo ámbar y el mensaje: "Servicio SAT degradado — las consultas de validación de RFC y descarga de CFDIs pueden presentar demoras. Los datos locales ya sincronizados están disponibles sin interrupción." El banner debe incluir un indicador de semáforo (ámbar = DEGRADED, rojo = DOWN, verde = OPERATIONAL) para cada servicio externo: SAT, Belvo, Gemini API.
- **And** en la vista de perfil fiscal, el botón "Sincronizar facturas vía SAT" debe mostrarse deshabilitado con tooltip "Sincronización SAT no disponible — servicio degradado. Última sincronización exitosa: hace 3 horas." pero el resto de la vista (facturas ya sincronizadas, RiskGauge, alertas) debe funcionar con normalidad usando datos locales.
- **And** en la vista de alertas, las acciones que requieren consulta al SAT (validación de RFC en alerta 69-B, verificación de estatus de proveedor) deben mostrar un badge "Dato pendiente de verificación SAT" y posponer la acción hasta que el servicio se recupere, encolando la solicitud para procesamiento automático al restaurarse el servicio.
- **And** cuando el servicio SAT se recupera (health check detecta OPERATIONAL), el banner global debe actualizarse en tiempo real vía SSE reemplazando el banner ámbar por un toast de confirmación: "Servicio SAT restablecido — 3 solicitudes pendientes se están procesando." y los botones deshabilitados deben reactivarse automáticamente.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-07.03 (Contingencia operativa ante degradación y caída del SAT/Belvo con modo offline)
- Los estados de servicio externo monitoreados son: SAT (portal oficial y API de validación), Belvo (Fiscal API), y Gemini API. Cada uno tiene su propio indicador de semáforo independiente.
- Los estados posibles son: OPERATIONAL (verde, latencia normal), DEGRADED (ámbar, latencia >5s o tasa de error >10%), DOWN (rojo, inaccesible o tasa de error >50%), UNKNOWN (gris, health check no ha respondido en el último ciclo).
- La frecuencia de actualización del estado de servicios es cada 60 segundos vía polling del backend a los health checks de HU-07.03, con push al frontend vía SSE cuando el estado cambia (event-driven, no requiere esperar el ciclo de 60s para reflejar un cambio).
- En modo DEGRADED o DOWN, el sistema nunca debe bloquear el acceso a datos ya sincronizados localmente. Las restricciones aplican solo a operaciones que requieren comunicación con el servicio externo afectado.
- Las solicitudes pendientes durante una caída se encolan en una tabla `degraded_operation_queue` con reintento automático al restaurarse el servicio (backoff exponencial desde 30s hasta 15min).
- El banner de estado de servicios debe cumplir con accesibilidad WCAG 2.1 AA: el color no debe ser el único canal de información (se incluye texto e ícono), contraste mínimo 4.5:1 en el texto del banner.

**Criterios de aceptación:**
1. Con el servicio SAT en estado DEGRADED (simulado vía mock de health check), el HUD muestra el banner ámbar con semáforo (ámbar para SAT, verde para Belvo, verde para Gemini), y el botón "Sincronizar facturas vía SAT" aparece deshabilitado con tooltip informativo.
2. Con el servicio SAT en estado DOWN, el banner es rojo, el semáforo SAT está en rojo, y las acciones dependientes del SAT muestran badge "No disponible" con mensaje contextual específico de la funcionalidad.
3. Al restaurarse el servicio SAT (mock cambia a OPERATIONAL), el banner se actualiza a verde en ≤5 segundos vía SSE, las acciones pendientes se desencolan automáticamente y un toast notifica al usuario.
4. Un analista que trabaja en una vista de perfil fiscal con 200 facturas ya sincronizadas localmente puede navegar, filtrar y ordenar facturas con total normalidad durante una caída del SAT (verificable porque las consultas son solo contra base de datos local PostgreSQL).
5. NFR: El cambio de estado de servicio (DEGRADED → DOWN, DOWN → OPERATIONAL) se refleja en la UI en ≤5 segundos desde que el health check del backend detecta el cambio.
6. Tests de frontend (`test_degraded_banner.tsx`) validan: renderizado de banner en cada estado (OPERATIONAL, DEGRADED, DOWN, UNKNOWN) para los 3 servicios, deshabilitación correcta de acciones específicas por servicio caído, transición de estados vía SSE mock, y accesibilidad del banner (roles ARIA, texto alternativo al color).

**Impactos y consideraciones para negocio:**
- Reduce significativamente los tickets de soporte por "el sistema no funciona" durante caídas del SAT (frecuentes en temporada de declaraciones anuales y cierres fiscales), ya que el usuario entiende que el problema es externo y qué funcionalidades siguen disponibles.
- Mantiene la productividad del equipo contable durante contingencias del SAT, permitiendo trabajo offline con datos sincronizados y encolando automáticamente las operaciones pendientes sin intervención manual del analista.

**Referencias y trazabilidad:**
- SAD: §9.1 — Frontend SPA (React 19), §10.12 — Plan de Contingencia y Continuidad Operativa ante Caída del SAT, §18.2 — Tactical HUD
- SAD-Lite: §9 — Experiencia de Usuario y HUD (Scenario Boxes), §8 — Escenarios Críticos de Operación (Scenario Boxes)
- Developer Handbook: §5.5 — Indicadores de estado de servicios externos y banners de degradación
- ADR: ADR-019 — Estrategia de Reintentos, Circuit Breaker y Modo Degradado ante Fallos de Proveedores Externos Fiscales
- Tablas afectadas: `tax_profiles`
- Flujo crítico SAD §10: §10.12 — Contingencia operativa ante degradación del SAT/Belvo

---

#### HU-13.06 — Accesibilidad WCAG 2.1 AA: Teclado, Roles ARIA, Contraste y Lector de Pantalla

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** HUD y UX Operativa (SAD §9.1), Diseño Visual Liquid Glass (SAD §18.1)
**Historia:** Como Analista Contable con discapacidad visual que utiliza lector de pantalla (JAWS/NVDA/VoiceOver) o navegación exclusiva por teclado, quiero que todas las funcionalidades del Sentinel Nexus 360 —Dashboard HUD, vista de perfil fiscal, vista de alertas, wizard de Quick Setup y banners de estado— cumplan con el estándar WCAG 2.1 Nivel AA para poder desempeñar mis funciones de análisis y defensa fiscal con la misma eficacia que un usuario sin discapacidad, garantizando que el despacho contable cumpla con los requisitos de accesibilidad de la Ley General para la Inclusión de las Personas con Discapacidad y normativas laborales mexicanas (NOM-008-SCFI-2002).

**Alcance:** Frontend React 19 / Auditoría y adecuación de accesibilidad en todos los componentes + Tests automatizados de a11y

**Historia en formato Given/When/Then:**
- **Given** un analista con discapacidad visual utiliza el lector de pantalla VoiceOver en macOS y navega exclusivamente con teclado (sin mouse ni trackpad).
- **When** el analista inicia sesión y comienza a navegar por el Dashboard HUD utilizando la tecla Tab para moverse entre elementos interactivos y las teclas de flecha para explorar el heatmap.
- **Then** cada elemento interactivo debe ser focusable en un orden lógico de tabulación que siga el flujo visual de la página (banner de resumen → heatmap → badges de criticidad → panel de perfil rápido) y debe mostrar un anillo de foco visible (outline) con contraste ≥3:1 contra el fondo, respetando la preferencia del sistema `prefers-reduced-motion` para animaciones.
- **And** el heatmap debe ser navegable con teclas de flecha (←↑↓→) moviendo el foco entre celdas, con cada celda anunciando vía ARIA: "Perfil fiscal {RFC tokenizado}, score de riesgo {valor}, {criticidad}, {n} alertas activas". La celda con foco debe tener un indicador visual adicional (borde más grueso + glow) para usuarios con visión reducida que no usan lector de pantalla.
- **And** la tabla de alertas debe tener roles ARIA correctos: `<table role="grid">`, cada columna con `<columnheader>` y propiedad `aria-sort` cuando está ordenada, cada fila con `role="row"` y celdas con `role="gridcell"`, y el estado de locking debe anunciarse como "Alerta {ID}, bloqueada por {nombre}, expira en {tiempo}" al recibir foco.
- **And** el RiskGauge radial debe tener una alternativa textual accesible que anuncie el score numérico y la categoría: "Score de riesgo fiscal: 78 de 100, nivel alto. Sub-scores: PLD 65, 69-B 80, OFAC 42, HHI 90." El componente gráfico en sí puede ser decorativo (`aria-hidden="true"`) con un elemento de texto equivalente para lectores de pantalla.
- **And** todos los banners (cobertura limitada, modo degradado) deben usar `role="alert"` o `role="status"` según su naturaleza (alert para cambios que requieren atención inmediata, status para información persistente) para ser anunciados automáticamente por lectores de pantalla sin necesidad de foco.

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-13.01 (Dashboard Táctico HUD) — la accesibilidad se implementa sobre los componentes ya construidos.
- El estándar objetivo es WCAG 2.1 Nivel AA en todos los criterios aplicables a una aplicación web SPA: 1.1.1 Non-text Content, 1.3.1 Info and Relationships, 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast, 2.1.1 Keyboard, 2.4.3 Focus Order, 2.4.7 Focus Visible, 3.3.1 Error Identification, 4.1.2 Name, Role, Value, 4.1.3 Status Messages.
- Relación de contraste mínima: 4.5:1 para texto normal, 3:1 para texto grande (≥18px o ≥14px bold), 3:1 para componentes UI y objetos gráficos. Los colores del Liquid Glass deben verificarse contra estos ratios.
- Toda funcionalidad debe ser operable exclusivamente con teclado (sin mouse), sin trampas de foco (el foco no puede quedar atrapado en un elemento sin salida).
- Los mensajes de error de validación de formularios deben anunciarse automáticamente por lectores de pantalla usando `aria-live="polite"` o `role="alert"` y deben identificar el campo con error mediante texto (no solo color).
- El atributo `prefers-reduced-motion` del sistema operativo debe ser respetado: si el usuario tiene configurada la reducción de movimiento, todas las animaciones CSS (transiciones, fade-in, stagger) deben desactivarse o reducirse a 0ms.
- El cumplimiento WCAG 2.1 AA debe ser verificado con herramientas automatizadas (axe-core, Lighthouse) y con pruebas manuales usando lectores de pantalla reales (VoiceOver en macOS, NVDA en Windows).

**Criterios de aceptación:**
1. Un escaneo con axe-core sobre el Dashboard HUD reporta 0 violaciones críticas (critical) y 0 violaciones serias (serious) de WCAG 2.1 AA. Los hallazgos moderados (moderate) deben estar documentados y justificados.
2. Navegación completa del HUD con teclado: un usuario sin mouse puede recorrer todos los elementos interactivos (banner, heatmap, badges, panel de perfil, navegación principal) usando Tab y Shift+Tab en un orden lógico, y cada elemento muestra un anillo de foco visible con contraste ≥3:1.
3. El heatmap es operable con teclas de flecha: un usuario puede mover el foco entre celdas del heatmap con ←↑↓→ y cada celda anuncia correctamente su información vía ARIA (verificado con VoiceOver).
4. La tabla de alertas con 25 filas es navegable con teclado y lector de pantalla. VoiceOver anuncia correctamente encabezados de columna, valores de celda y estado de locking al navegar por las filas.
5. Todos los banners de estado (cobertura limitada, modo degradado) se anuncian automáticamente con `role="alert"` o `role="status"` según corresponda, sin requerir que el usuario mueva el foco al banner.
6. Tests automatizados (`test_a11y.tsx`) integran axe-core en el pipeline de testing de frontend para los 5 componentes principales (HUD, perfil fiscal, alertas, Quick Setup, banners de degradación) y fallan el build si se introducen violaciones WCAG 2.1 AA de nivel crítico o serio.

**Impactos y consideraciones para negocio:**
- Amplía el mercado direccionable de Sentinel Nexus 360 a despachos contables que emplean o son dirigidos por profesionales con discapacidad, un segmento estimado en ~5% de la fuerza laboral contable mexicana.
- Demuestra cumplimiento con normativas de inclusión laboral (Ley General para la Inclusión de las Personas con Discapacidad, NOM-008-SCFI-2002) y constituye un diferenciador competitivo frente a software contable legacy que típicamente no cumple con estándares de accesibilidad.
- La inversión en accesibilidad tiene efectos colaterales positivos en usabilidad general: mejor navegación por teclado, mejor contraste y etiquetado semántico benefician a todos los usuarios, no solo a aquellos con discapacidad.

**Referencias y trazabilidad:**
- SAD: §9.1 — Frontend SPA (React 19), §18.1 — Diseño Visual Liquid Glass
- SAD-Lite: §9 — Experiencia de Usuario y HUD (Scenario Boxes)
- Developer Handbook: §5.6 — Guía de accesibilidad WCAG 2.1 AA y componentes ARIA
- ADR: ADR-019 — Sistema de Diseño Liquid Glass con Vanilla CSS y React 19, ADR-019 (Accesibilidad)
- Tablas afectadas: ninguna (frontend-only)
- Flujo crítico SAD §10: §10.11 — Dashboard HUD y navegación táctica

#### HU-13.07 — Modo oscuro completo Liquid Glass con transición suave y respeto a preferencias OS

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** SAD §9.1, SAD §18.1
**Historia:** Como usuario operativo del dashboard Sentinel, quiero un tema oscuro completo con diseño Liquid Glass que respete la preferencia de sistema operativo (prefers-color-scheme) y permita cambio manual, para reducir la fatiga visual en sesiones prolongadas de monitoreo fiscal y cumplir con criterios de accesibilidad visual.

**Alcance:**
Implementación de un sistema de theming dual (light/dark) con transición CSS suave aplicado globalmente a todos los componentes del SPA React 19. El tema oscuro aplica la estética Liquid Glass (glassmorphism con backdrop-filter, bordes translúcidos, sombras sutiles) en todas las superficies: dashboard HUD, vistas de perfil fiscal, listas de alertas, formularios de configuración, modales y banners. Se detecta automáticamente la preferencia del SO vía media query `prefers-color-scheme: dark` y se persiste la selección manual del usuario en `localStorage` con fallback a la preferencia del sistema. La transición entre temas es animada (<300ms) mediante CSS custom properties intercambiadas a nivel `:root`. Todos los tokens de diseño (colores de superficie, texto, bordes, sombras, gradientes) se definen como variables CSS en una hoja de temas centralizada. Se respetan ratios de contraste WCAG 2.1 AA (4.5:1 para texto normal, 3:1 para texto grande) en ambos temas. Las visualizaciones de datos (Heatmap, RiskGauge, gráficos) se adaptan cromáticamente al tema activo sin pérdida de legibilidad.

**Historia en formato Given/When/Then:**
- **Given** un usuario con sesión activa en Sentinel cuyo sistema operativo tiene configurado el tema oscuro (`prefers-color-scheme: dark`)
- **When** el usuario carga la aplicación por primera vez
- **Then** la interfaz se renderiza en modo oscuro Liquid Glass automáticamente, con superficies glassmorphism, texto claro sobre fondo oscuro, y todos los componentes visuales adaptados al tema oscuro
- **And** el usuario puede alternar manualmente entre claro/oscuro mediante un toggle en la barra de navegación superior, con transición animada de ≤300ms
- **And** la selección manual se persiste en `localStorage` y prevalece sobre la preferencia del SO en visitas subsecuentes
- **And** los ratios de contraste en ambos temas cumplen WCAG 2.1 AA nivel AA (4.5:1 texto normal, 3:1 texto grande)
- **And** gráficos y visualizaciones de datos (Heatmap, RiskGauge) mantienen su legibilidad y diferenciación cromática en ambos temas

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-13.01 (Dashboard Tactical HUD Liquid Glass), ADR-019, ADR-019
- Regla de negocio: El tema oscuro debe preservar la identidad visual corporativa y la semántica de colores de riesgo (verde=bajo, ámbar=medio, rojo=alto) sin ambigüedad
- Restricción técnica: CSS custom properties exclusivamente; no se generan hojas de estilo duplicadas ni se usa CSS-in-JS con runtime cost

**Criterios de aceptación:**
1. La aplicación detecta `prefers-color-scheme: dark` y aplica el tema oscuro automáticamente en la primera carga sin configuración manual del usuario.
2. El toggle claro/oscuro en la barra de navegación cambia el tema en ≤300ms con transición animada y persiste la elección en `localStorage`; al recargar, la preferencia guardada prevalece sobre la del SO.
3. Auditoría con Axe DevTools: 0 violaciones de contraste de color en ambos temas (WCAG 2.1 AA). Todos los textos, íconos, badges de riesgo y gráficos son legibles en tema oscuro sin pérdida de información.
4. Todos los componentes Liquid Glass (paneles glassmorphism, modales, tarjetas, banners) renderizan correctamente en tema oscuro: superficies translúcidas con `backdrop-filter: blur()`, bordes sutiles con opacidad reducida, sombras adaptadas al fondo oscuro.
5. NFR: La transición de tema no causa layout shift (CLS < 0.1), no bloquea el thread principal por más de 50ms, y el bundle CSS de temas no excede 15KB comprimido (gzip).

**Impactos y consideraciones:**
- Mejora la ergonomía visual para usuarios que operan el dashboard en turnos nocturnos o entornos de bajo brillo (oficinas de cumplimiento, centros de monitoreo).
- Reduce la fatiga visual reportada por analistas fiscales en sesiones >4 horas continuas.
- Contribuye a la certificación WCAG 2.1 AA como criterio de accesibilidad sensorial.
- El toggle de tema debe ser accesible vía teclado (Tab + Enter) y lector de pantalla (rol ARIA `switch`, atributo `aria-checked`).

**Referencias y trazabilidad:**
- SAD: §18.1 — Diseño Visual y UX; §9.1 — Frontend SPA (React 19)
- SAD-Lite: §9 — Frontend SPA
- Developer Handbook: §7.3 — Guía de Componentes React
- ADR: ADR-0002 (Desacoplamiento BFF/Frontend), ADR-019 (Dashboard Tactical HUD)
- Tablas afectadas: N/A (cambios exclusivamente en frontend; consume endpoints existentes sin modificación de esquema)
- Flujo crítico SAD §10: §10.8 — Atención de alertas; §10.1 — Onboarding guiado

---

#### HU-13.08 — Diseño responsive mobile-first para tablets y smartphones con layout adaptativo

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** SAD §9.1, SAD §18.1
**Historia:** Como oficial de cumplimiento o analista fiscal, quiero acceder al dashboard Sentinel desde tablet o smartphone con una experiencia adaptada mobile-first para consultar alertas críticas, revisar scores de riesgo y responder notificaciones durante desplazamientos o fuera de la oficina.

**Alcance:**
Rediseño responsive mobile-first de la SPA React 19 completa, abarcando todos los breakpoints definidos: smartphone (320px–767px), tablet (768px–1023px), desktop (≥1024px). Se implementa layout adaptativo con CSS Grid y Flexbox, reorganizando componentes según viewport: menú de navegación colapsable (hamburger drawer en móvil, sidebar persistente en desktop), tablas de datos con scroll horizontal y columnas priorizadas (columnas esenciales visibles, secundarias colapsables), gráficos y visualizaciones redimensionables con viewBox escalable, formularios con campos apilados verticalmente en móvil. Los dashboards HUD se reorganizan en stacks verticales en móvil (Heatmap reducido, RiskGauge compacto, badges apilados). La vista de alertas prioriza criticidad y fecha en móvil, con acciones swipe (aceptar/rechazar con gesto táctil). El wizard de onboarding y la vista de perfil fiscal se adaptan a flujos step-by-step en pantallas pequeñas. Se implementan media queries con enfoque mobile-first (estilos base para móvil, sobreescritura progresiva para viewports mayores). Todos los targets táctiles cumplen WCAG 2.1 AA: tamaño mínimo 44x44px, espaciado entre targets ≥8px.

**Historia en formato Given/When/Then:**
- **Given** un oficial de cumplimiento que accede a Sentinel desde un smartphone (viewport 375px de ancho)
- **When** navega al dashboard HUD, la lista de alertas y el perfil fiscal de un RFC
- **Then** el layout se adapta automáticamente: navegación en drawer colapsable, componentes apilados verticalmente, tablas con scroll horizontal y columnas priorizadas, gráficos escalados proporcionalmente
- **And** todas las interacciones táctiles (toques, swipes, scroll) responden sin delay (>300ms) y los targets táctiles miden ≥44x44px con espaciado ≥8px
- **And** en tablet (768px–1023px) se muestra un layout híbrido con sidebar reducida y contenido en 2 columnas donde aplique
- **And** en desktop (≥1024px) se restaura el layout completo con sidebar persistente, dashboards multi-columna y todas las funcionalidades visibles simultáneamente

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-13.01 (Dashboard Tactical HUD Liquid Glass), ADR-019, ADR-019
- Regla de negocio: La funcionalidad crítica (consulta de alertas, visualización de RiskGauge, acceso a perfil fiscal) debe estar disponible en todos los breakpoints sin pérdida de información esencial
- Restricción técnica: Vanilla CSS con media queries mobile-first; sin dependencia de frameworks CSS (no Tailwind, no Bootstrap). React 19 con CSS Modules para encapsulamiento por componente.

**Criterios de aceptación:**
1. La aplicación renderiza correctamente en viewports de 320px a 2560px de ancho sin overflow horizontal no deseado, elementos cortados o solapamiento de componentes en ningún breakpoint definido (smartphone, tablet, desktop).
2. Pruebas con Lighthouse Mobile: puntuación de Performance ≥80, Best Practices ≥90, SEO ≥90 en dispositivo móvil simulado (Moto G4, 3G throttling).
3. Todos los targets táctiles (botones, enlaces, íconos interactivos, filas de tabla clickeables) cumplen tamaño mínimo 44x44px y espaciado ≥8px entre targets adyacentes, verificado con auditoría de Axe DevTools.
4. La navegación principal colapsa a un drawer tipo hamburger en viewports <768px, con animación de apertura/cierre, backdrop semitransparente y cierre al seleccionar un ítem o tocar fuera.
5. NFR: El tiempo de renderizado inicial (FCP) en móvil con 3G throttling no excede 2.5s. No se sirven assets de escritorio en viewports móviles (imágenes responsive con `srcset`, carga condicional de componentes pesados con `React.lazy` + `Suspense`).

**Impactos y consideraciones:**
- Habilita el uso operativo de Sentinel en campo: auditores en instalaciones de clientes, oficiales de cumplimiento en traslados, analistas en reuniones externas.
- Incrementa la adopción de la plataforma en despachos con fuerza de trabajo móvil o sin infraestructura de escritorio completa.
- El diseño mobile-first reduce el footprint de assets servidos en dispositivos con ancho de banda limitado.
- Requiere pruebas exhaustivas en dispositivos físicos reales (iPhone SE, iPhone 14, iPad, Samsung Galaxy S23, tablet Android 10") además de emuladores.

**Referencias y trazabilidad:**
- SAD: §18.1 — Diseño Visual y UX; §9.1 — Frontend SPA (React 19)
- SAD-Lite: §9 — Frontend SPA
- Developer Handbook: §7.3 — Guía de Componentes React; §7.5 — Testing
- ADR: ADR-0002 (Desacoplamiento BFF/Frontend), ADR-019 (Dashboard Tactical HUD)
- Tablas afectadas: N/A (cambios exclusivamente en frontend; consume endpoints existentes sin modificación de esquema)
- Flujo crítico SAD §10: §10.8 — Atención de alertas; §10.1 — Onboarding guiado

---

#### HU-13.09 — Internacionalización i18n español/inglés con detección automática de idioma

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** SAD §9.1, SAD §18.1
**Historia:** Como usuario de un despacho contable multinacional o con clientes extranjeros, quiero operar la plataforma Sentinel en español o inglés con cambio en caliente sin recargar la aplicación, y que el idioma se detecte automáticamente según preferencias del navegador, para trabajar en mi idioma nativo sin fricción.

**Alcance:**
Implementación de internacionalización (i18n) completa en el frontend React 19 SPA con soporte inicial para español (es-MX, primario) e inglés (en-US, secundario). Se utiliza una librería ligera de i18n (react-i18next o similar) con archivos de traducción JSON por locale, organizados por namespaces (common, dashboard, alerts, profile, onboarding, settings, errors). La detección automática usa el header `Accept-Language` del navegador, con fallback a español si el idioma no está soportado. El cambio de idioma es instantáneo (sin recarga de página) mediante el hook `useTranslation` de React. Las preferencias de idioma se persisten en `localStorage` y se sincronizan con el perfil de usuario en backend vía endpoint `PATCH /api/profile/locale`. Se traducen todos los textos visibles: etiquetas, mensajes, placeholders, tooltips, textos de ayuda, estados vacíos, mensajes de error y confirmación. Las fechas, números y monedas se formatean según la locale (`Intl.DateTimeFormat`, `Intl.NumberFormat`). Los gráficos y visualizaciones reciben títulos y etiquetas de ejes desde el sistema i18n. Las notificaciones del sistema (toasts, banners) también se traducen. Se excluye del scope la traducción de contenido dinámico generado por IA (se marca con badge `[AI-Generated | Original: ES]`). Los ADRs, bitácoras WORM y datos fiscales crudos se mantienen en su idioma original por requisito de inmutabilidad.

**Historia en formato Given/When/Then:**
- **Given** un usuario con navegador configurado en inglés (`Accept-Language: en-US`) que accede a Sentinel por primera vez
- **When** la aplicación carga
- **Then** la interfaz se renderiza completamente en inglés, incluyendo menús, etiquetas, botones, mensajes de ayuda, tooltips y fechas formateadas en formato `MM/DD/YYYY`
- **And** el usuario puede cambiar a español mediante un selector de idioma visible en la barra de navegación, y el cambio se aplica instantáneamente sin recarga de página
- **And** al recargar la aplicación, se mantiene el último idioma seleccionado desde `localStorage` y se sincroniza con el perfil del usuario en backend
- **And** números y monedas se formatean según la locale activa: `$1,234,567.89` (en-US) vs `$1.234.567,89` (es-MX)
- **And** las fechas se muestran en formato localizado: `05/25/2026` (en-US) vs `25/05/2026` (es-MX)

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-13.01 (Dashboard Tactical HUD Liquid Glass), ADR-019
- Regla de negocio: El contenido fiscal oficial (RFCs, razones sociales, montos en CFDIs, reportes pre-UIF) se presenta en su idioma original. Las traducciones aplican solo a la interfaz de usuario y mensajes del sistema.
- Restricción técnica: Las claves de traducción deben ser descriptivas y estables (snake_case jerárquico: `dashboard.riskgauge.title`). No se usan traducciones inline en JSX (prohibidos strings hardcodeados en componentes).

**Criterios de aceptación:**
1. La aplicación detecta automáticamente el locale desde `Accept-Language` del navegador y selecciona español (es-MX) o inglés (en-US); si el idioma no está soportado, muestra español como fallback por defecto.
2. El 100% del texto de interfaz visible al usuario está traducido en ambos idiomas: menús, etiquetas de formularios, placeholders, tooltips, mensajes de error, estados vacíos, botones, títulos de gráficos y columnas de tabla.
3. El cambio de idioma mediante el selector en la UI es instantáneo (sin recarga de página, sin parpadeo visible, sin pérdida de estado del componente activo) y se persiste entre sesiones.
4. Fechas, números y monedas se renderizan con `Intl.DateTimeFormat` e `Intl.NumberFormat` según la locale activa, incluyendo formato de separadores de miles, decimales y símbolo de moneda MXN/USD.
5. NFR: Los archivos de traducción JSON por locale no exceden 50KB comprimido (gzip) cada uno. La carga inicial incluye solo el namespace `common`; los namespaces restantes se cargan bajo demanda (lazy loading). No hay regresiones de rendimiento por la capa i18n: el tiempo de renderizado no aumenta más de un 10% respecto a la versión sin i18n.

**Impactos y consideraciones:**
- Habilita la comercialización de Sentinel en mercados angloparlantes (USA, UK, Canadá, corporativos multinacionales en México con equipos bilingües).
- La capa i18n debe ser extensible: la arquitectura de archivos JSON por locale permite agregar nuevos idiomas (pt-BR, fr-FR) sin cambios de código.
- Impacto en QA: todas las suites de pruebas E2E deben ejecutarse en ambos locales. Los snapshots de Jest deben incluir variantes i18n.
- Las notificaciones push, emails de alerta y reportes PDF quedan fuera de esta HU y corresponden a HU-10.03 (canal multi-notificaciones).

**Referencias y trazabilidad:**
- SAD: §18.1 — Diseño Visual y UX; §9.1 — Frontend SPA (React 19); §9.3 — Perfil de Usuario
- SAD-Lite: §9 — Frontend SPA
- Developer Handbook: §7.3 — Guía de Componentes React; §7.5 — Testing
- ADR: ADR-0002 (Desacoplamiento BFF/Frontend)
- Tablas afectadas: `user_profiles` (columna `locale`, nullable VARCHAR(10), default `es-MX`)
- Flujo crítico SAD §10: §10.1 — Onboarding guiado; §10.8 — Atención de alertas

---

#### HU-13.10 — Keyboard shortcuts y navegación avanzada para power users con cheat sheet

**Épica:** EP-13 — HUD, UX Operativa y Accesibilidad
**Módulo(s):** SAD §9.1, SAD §18.1
**Historia:** Como analista fiscal avanzado (power user) que procesa >50 alertas por jornada, quiero atajos de teclado globales y navegación completa sin mouse para gestionar alertas, revisar perfiles fiscales y archivar expedientes con máxima velocidad operativa y sin interrumpir el flujo de trabajo.

**Alcance:**
Implementación de un sistema de keyboard shortcuts global y contextual en la SPA React 19, cubriendo las operaciones más frecuentes del flujo de trabajo del analista fiscal. Se definen combinaciones de teclas mnemotécnicas evitando conflictos con atajos del navegador y del sistema operativo. Shortcuts globales: `?` para mostrar/ocultar la cheat sheet (hoja de referencia rápida), `Ctrl+Shift+F` para foco en búsqueda global, `Ctrl+Shift+H` para ir al dashboard HUD, `Ctrl+Shift+A` para ir a lista de alertas, `Ctrl+Shift+P` para búsqueda de perfil fiscal por RFC. Shortcuts contextuales en vista de alertas: `J`/`K` para navegar alerta siguiente/anterior, `Enter` para abrir detalle, `A` para aceptar (acknowledge), `R` para rechazar con motivo, `L` para lock/unlock de alerta, `E` para escalar, `C` para cerrar con co-firma. En vista de perfil fiscal: `Tab`/`Shift+Tab` para navegación secuencial entre secciones, `1`-`5` para saltar a pestañas. En formularios: `Ctrl+Enter` para enviar, `Esc` para cancelar/cerrar modal. El sistema verifica que el foco no esté en un campo de entrada de texto antes de ejecutar shortcuts de navegación para evitar conflictos. Se implementa un componente `CheatSheet` invocable con `?` que muestra todos los atajos organizados por contexto en un overlay modal con diseño responsivo, accesible vía teclado y lector de pantalla. Todos los elementos interactivos son focusables mediante `Tab`, con anillos de foco visibles (`outline: 2px solid`) y atributos ARIA para orientación de lectores de pantalla.

**Historia en formato Given/When/Then:**
- **Given** un analista fiscal con sesión activa en Sentinel que está en la vista de lista de alertas con 30 alertas pendientes
- **When** presiona `J` repetidamente para navegar hacia abajo y `K` para navegar hacia arriba en la lista, luego presiona `A` sobre una alerta seleccionada
- **Then** el foco se mueve secuencialmente entre las filas de alertas con indicador visual de selección, y al presionar `A` la alerta se marca como acknowledged
- **And** al presionar `?` en cualquier vista se despliega un modal overlay con la cheat sheet completa de atajos, organizada por contexto, navegable con teclado y cerrable con `Esc`
- **And** todos los elementos interactivos son alcanzables vía `Tab`/`Shift+Tab` con anillo de foco visible, y los lectores de pantalla anuncian correctamente roles, estados y atajos disponibles mediante `aria-keyshortcuts`
- **And** los shortcuts no se activan cuando el foco está dentro de un `<input>`, `<textarea>`, `<select>` o `contenteditable` (excepto combinaciones con `Ctrl`/`Cmd` explícitas)

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-13.06 (Accesibilidad WCAG 2.1 AA), ADR-019
- Regla de negocio: Los atajos de teclado no deben interferir con los atajos nativos del navegador (Ctrl+T, Ctrl+W, Ctrl+N, F5, etc.) ni con lectores de pantalla (tecla Insert, CapsLock+teclas).
- Restricción técnica: El hook `useKeyboardShortcuts` debe registrarse a nivel de aplicación y desmontarse limpiamente en cada cambio de ruta (React Router) para evitar memory leaks de event listeners.

**Criterios de aceptación:**
1. Todos los atajos globales y contextuales definidos en la cheat sheet funcionan correctamente en Chrome, Firefox, Edge y Safari (macOS y Windows), respetando diferencias entre `Ctrl` (Windows/Linux) y `Cmd` (macOS) donde aplique.
2. Los shortcuts de una sola tecla (`J`, `K`, `A`, `R`, `L`, `E`, `C`) no se activan cuando el foco está en campos de entrada de texto (`<input>`, `<textarea>`, `contenteditable`), verificando con pruebas automatizadas.
3. El modal de cheat sheet (`?`) lista todos los atajos organizados por contexto (Global, Alertas, Perfil Fiscal, Formularios, Navegación), con indicación de tecla modificadora (`Ctrl`/`Cmd`) según plataforma del usuario, y es navegable con `Tab`, cerrable con `Esc`, y accesible vía lector de pantalla.
4. Todos los elementos interactivos en todas las vistas son alcanzables mediante navegación secuencial con `Tab`/`Shift+Tab` sin trampas de foco (focus traps solo en modales, con escape vía `Esc`), y el anillo de foco es visible (contraste ≥3:1 contra el fondo) en todos los temas.
5. NFR: El tiempo de respuesta a eventos de teclado es <50ms (sin debounce). El listener global de shortcuts no causa degradación de rendimiento de renderizado (medido con React Profiler, sin renders innecesarios en componentes no afectados).

**Impactos y consideraciones:**
- Incrementa la productividad de power users: analistas que procesan altos volúmenes de alertas (50+/día) reducen el tiempo por alerta hasta un 40% al eliminar la dependencia del mouse.
- La cheat sheet impresa/consultable reduce la curva de aprendizaje para nuevos analistas en despachos con alta rotación.
- Cumple con el criterio WCAG 2.1 AA 2.1.1 (Keyboard): toda la funcionalidad es operable mediante teclado sin necesidad de mouse.
- Debe considerarse que `J`/`K` sigue el patrón de navegación estilo Vim, familiar para usuarios técnicos; se incluye alternativa con flechas (`↓`/`↑`) para usuarios sin experiencia en terminal.

**Referencias y trazabilidad:**
- SAD: §18.1 — Diseño Visual y UX; §9.1 — Frontend SPA (React 19)
- SAD-Lite: §9 — Frontend SPA
- Developer Handbook: §7.3 — Guía de Componentes React; §7.5 — Testing
- ADR: ADR-0002 (Desacoplamiento BFF/Frontend)
- Tablas afectadas: N/A (cambios exclusivamente en frontend)
- Flujo crítico SAD §10: §10.8 — Atención de alertas; §10.9 — Construcción de evidencia NOM-151

---

---

### 5.14 EP-14 — Observabilidad, QA, DevSecOps y Release

#### HU-14.01 — Instrumentación OpenTelemetry con tracing distribuido end-to-end en todos los servicios

**Épica:** EP-14 — Observabilidad, QA, DevSecOps y Release
**Módulo(s):** SAD §9.10, SAD §19
**Historia:** Como SRE/DevOps, quiero instrumentación OpenTelemetry con tracing distribuido end-to-end en todos los servicios del stack Sentinel (FastAPI Core, Express BFF, Celery Workers, Prisma Client) para diagnosticar fallos transaccionales, identificar cuellos de botella y reducir el MTTR de incidentes en producción.

**Alcance:**
Integración completa del SDK de OpenTelemetry (OTel) en todos los servicios del ecosistema Sentinel, generando spans y traces end-to-end desde el frontend (Web Vitals + fetch instrumentation) hasta la base de datos. Se instrumentan los siguientes componentes: (1) Frontend React 19 SPA: instrumentación de navegación (React Router), fetch/axios calls con propagación de contexto `traceparent` vía header W3C, y Core Web Vitals (LCP, FCP, CLS, INP) como spans raíz. (2) Express BFF (TypeScript): middleware OTel con auto-instrumentación de HTTP inbound/outbound, propagación de contexto a FastAPI Core vía header `traceparent`, spans para auth (JWT verify, session lookup) y queries Prisma. (3) FastAPI Core (Python 3.12): auto-instrumentación de FastAPI, SQLAlchemy 2.0, Redis, HTTPX outbound (Belvo API calls), con inyección de tenant_id y user_id como atributos de span. (4) Celery Workers (Python): instrumentación de task publish/receive/process con propagación de trace context entre productor (API) y consumidor (worker), incluyendo Belvo sync tasks, ETL 69-B y PLD batch. (5) Base de datos: instrumentación de pgvector queries y RLS enforcement con atributos de tenant. El backend de telemetría utiliza el OpenTelemetry Collector (modo gateway) desplegado como sidecar/daemonset, exportando a Jaeger (tracing) y Prometheus (metrics). Se configura sampling adaptativo: 100% de traces con error, 10% de traces exitosos, con rate limiting configurable por tenant. Se excluye de la instrumentación datos sensibles (PII, tokens, contraseñas, CFDI UUIDs completos) mediante redaction rules en el Collector (`transform` processor). Se exponen endpoints `/health` con readiness/liveness para cada servicio, reportando estado de la conexión OTel.

**Historia en formato Given/When/Then:**
- **Given** un usuario autenticado en Sentinel que solicita la vista de perfil fiscal de un RFC (request GET /api/profile/{rfc_id})
- **When** la solicitud atraviesa Express BFF → FastAPI Core → PostgreSQL (RLS) → Redis (cache) → Belvo API (sync check)
- **Then** se genera un trace completo en Jaeger que muestra todos los spans anidados: fetch desde frontend, middleware de auth en BFF, handler en FastAPI Core, query SQL con RLS enforcement, cache lookup en Redis, y health check a Belvo
- **And** cada span contiene atributos: `tenant_id`, `user_id`, `http.status_code`, `db.statement` (sanitizado), `cache.hit` (bool), `rls.policy_applied` (string), y duración en ms
- **And** los traces con errores (HTTP 4xx/5xx, timeouts Belvo, fallos RLS) se muestrean al 100%, marcados con `error=true` y `exception.message`
- **And** los traces se pueden consultar en Jaeger por `tenant_id`, `endpoint`, `http.status_code` y rango de tiempo, con visualización de waterfall de spans

**Prerrequisitos y reglas de negocio:**
- Requiere: Ninguno (HU fundacional de la capa de observabilidad, sin dependencias de otras HUs)
- ADR: ADR-018 (Instrumentación OTel)
- Regla de negocio: La instrumentación no debe introducir más de 5% de overhead en latencia p95 por request. En modo degradado (Collector inalcanzable), los servicios deben operar normalmente sin bloquear requests por fallos de telemetría (fail-open).
- Restricción técnica: Python 3.12 con `opentelemetry-api`, `opentelemetry-sdk`, `opentelemetry-instrumentation-fastapi`, `opentelemetry-instrumentation-sqlalchemy`, `opentelemetry-instrumentation-redis`, `opentelemetry-instrumentation-celery`. TypeScript con `@opentelemetry/api`, `@opentelemetry/sdk-node`, `@opentelemetry/instrumentation-express`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-prisma`. Collector en modo gateway, no sidecar por servicio.

**Criterios de aceptación:**
1. Todos los servicios del stack (Express BFF, FastAPI Core, Celery Workers) exportan spans a Jaeger vía OTel Collector, verificable mediante trace de smoke test end-to-end que recorre: SPA → BFF → Core → DB → Redis → Belvo.
2. La propagación de contexto de trace funciona correctamente con header W3C `traceparent` entre servicios heterogéneos (TS ↔ Python), confirmado con traza completa visible en Jaeger waterfall que muestra spans anidados de todos los servicios.
3. El sampling adaptativo funciona correctamente: 100% de errores capturados, 10% de éxito, sin pérdida de traces en ráfagas de tráfico (≥500 req/s). Configuración de sampling ajustable por variable de entorno sin redeploy.
4. No se filtran datos sensibles a los spans: PII (RFCs completos, nombres, emails), tokens JWT/Auth, UUIDs de CFDI, ni contraseñas. Verificado con auditoría automatizada de atributos de span en Jaeger tras ejecutar la suite de integración.
5. NFR: El overhead de latencia p95 introducido por la instrumentación OTel es ≤5% medido con pruebas de carga (k6, 500 req/s durante 5 minutos) comparando el mismo workload con y sin instrumentación. En caso de fallo del Collector, los servicios operan normalmente sin incremento de errores 5xx (fail-open verificado).

**Impactos y consideraciones:**
- Habilita la trazabilidad end-to-end requerida para auditorías de cumplimiento (cada transacción fiscal es trazable desde el usuario hasta la fuente de datos).
- Reduce el MTTR (Mean Time to Resolution) de incidentes al eliminar la necesidad de correlacionar logs manualmente entre servicios.
- El Collector OTel es un componente crítico de infraestructura que requiere monitoreo propio (métricas de throughput, memoria, CPU) y alta disponibilidad.
- La instrumentación es transversal a todas las épicas: debe implementarse temprano en el roadmap para que las HUs subsecuentes generen telemetría desde su primer deploy.

**Referencias y trazabilidad:**
- SAD: §19 — DevSecOps y Pipeline CI/CD; §15 — Observabilidad y Monitoreo
- SAD-Lite: §15 — Observabilidad
- Developer Handbook: §6.4 — Instrumentación de Servicios
- ADR: ADR-0003 (Redis como Backend de Caché y Sesión)
- Tablas afectadas: N/A (cambios de infraestructura; no modifica esquema de base de datos)
- Flujo crítico SAD §10: Transversal a todos los flujos (§10.1–§10.12)

---

#### HU-14.02 — Dashboard de métricas operacionales en Grafana: latencia, errores, throughput, RLS

**Épica:** EP-14 — Observabilidad, QA, DevSecOps y Release
**Módulo(s):** SAD §9.10, SAD §19
**Historia:** Como SRE/DevOps, quiero dashboards operacionales en Grafana con métricas de latencia p95, error rate, throughput, RLS violations, Belvo sync status y Celery queue depth para monitorear la salud de la plataforma en tiempo real, detectar anomalías proactivamente y generar reportes de SLA.

**Alcance:**
Diseño y despliegue de dashboards de monitoreo operacional en Grafana, provisionados como código (Grafana dashboards as code via JSON/Jsonnet, versionados en el repositorio). Se crean los siguientes dashboards: (1) **Dashboard General de Salud de Plataforma**: métricas agregadas de todos los servicios — request rate (req/s), latencia p50/p95/p99, error rate (4xx, 5xx), throughput (bytes/sec), tasa de éxito/fallo de autenticación JWT, sesiones activas. (2) **Dashboard de Backend Core**: métricas por endpoint FastAPI — latencia p95 agrupada por endpoint y método HTTP, tasa de errores con desglose por tipo (validation error 422, auth error 401/403, server error 500), RLS violations detectadas (accesos cross-tenant bloqueados), cache hit ratio Redis, pool de conexiones PostgreSQL (activas, idle, waiting), query duration p95. (3) **Dashboard de Integración Belvo**: sync status por tax_profile (success/failed/in_progress/stale), tasa de rate limits encontrados, latencia de API Belvo p95, webhook delivery rate, estado de circuit breaker por tenant. (4) **Dashboard de Workers Celery**: queue depth por cola (default, high_priority, belvo_sync, etl_nightly), task throughput (tasks/min), task failure rate, task duration p95, worker count activo, eventos de retry con backoff exponencial. (5) **Dashboard de CI/CD y Release**: métricas de pipeline (duración, tasa de éxito/fallo), frecuencia de despliegue, lead time for changes, change failure rate (métricas DORA). Las fuentes de datos son Prometheus (métricas scrapeadas del OTel Collector, Pushgateway para Celery, PostgreSQL Exporter para métricas de DB, Redis Exporter) y Loki (logs estructurados para correlación). Se configuran alertas en Grafana Alerting con notificación a canales Slack/email (#ops-critical). Todos los dashboards incluyen filtros por `tenant_id` (para despachos con SLA diferenciado), rango de tiempo dinámico (últimos 15 min, 1h, 6h, 24h, 7d, 30d) y auto-refresh configurable.

**Historia en formato Given/When/Then:**
- **Given** la plataforma Sentinel operando en producción con instrumentación OTel activa (HU-14.01) y métricas fluyendo a Prometheus
- **When** un SRE accede al Dashboard General de Salud de Plataforma en Grafana a las 10:00 AM de un día hábil
- **Then** ve en tiempo real: request rate (req/s) con línea de tendencia, latencia p95 con umbrales de advertencia (200ms/500ms), error rate (<1% verde, 1-5% ámbar, >5% rojo), y un mapa de calor de errores por endpoint
- **And** al filtrar por un `tenant_id` específico, todas las métricas se acotan a ese despacho, mostrando la vista de SLA contratado
- **And** el dashboard de Belvo muestra: 8 de 10 tax_profiles con sync exitoso (verde), 1 en progreso (azul con barra de progreso), 1 en fallo (rojo con mensaje de error y timestamp)
- **And** el dashboard de Workers Celery muestra la queue depth actual (342 tareas en cola default), tasa de procesamiento (45 tasks/min), y worker count (4/4 healthy)
- **And** al hacer clic en cualquier métrica anómala, se navega directamente al trace correspondiente en Jaeger para diagnóstico profundo

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-14.01 (Instrumentación OTel)
- ADR: ADR-018 (Grafana Dashboards), ADR-0003 (Redis)
- Regla de negocio: Los dashboards operacionales deben estar disponibles 24/7 con ≥99.9% de uptime. El refresh rate máximo es 10s para métricas en tiempo real; 1min para dashboards de tendencia histórica.
- Restricción técnica: Dashboards provisionados como código (Grafana dashboard JSON en `/infra/grafana/dashboards/`), desplegados automáticamente vía CI/CD (Grafana API o Helm chart `grafana.dashboardProviders`). No se permite creación manual de dashboards en producción.

**Criterios de aceptación:**
1. Los 5 dashboards definidos (Salud General, Backend Core, Integración Belvo, Workers Celery, CI/CD Release) están desplegados en Grafana, poblados con datos reales desde Prometheus, y verificables en entorno de staging con tráfico sintético.
2. Todas las métricas de latencia p95, error rate, throughput, RLS violations, Belvo sync status y Celery queue depth se actualizan en tiempo real (≤60s de delay desde la emisión de la métrica hasta su visualización en Grafana).
3. Los filtros de `tenant_id` y rango de tiempo funcionan correctamente en todos los dashboards, acotando todas las visualizaciones (gráficos, tablas, stat panels) al tenant y ventana temporal seleccionados.
4. Las alertas de Grafana Alerting se disparan correctamente para las condiciones definidas: (a) error rate >5% sostenido por 5 min, (b) latencia p95 >500ms por 5 min, (c) Belvo sync fallido por >30 min, (d) Celery queue depth >5000 pendientes, (e) RLS violation detectada (cualquier cantidad >0).
5. NFR: Los dashboards cargan en ≤3s con datos de la última hora. Las queries de Prometheus/PromQL están optimizadas (sin queries que excedan 30s de evaluación, usando recording rules para métricas agregadas de alta cardinalidad).

**Impactos y consideraciones:**
- Proporciona visibilidad operacional en tiempo real para el equipo SRE/DevOps, sustituyendo el monitoreo reactivo (esperar que un usuario reporte un fallo) por monitoreo proactivo basado en umbrales.
- Los dashboards de Belvo permiten al equipo de soporte identificar proactivamente fallos de sincronización antes de que el cliente los detecte, mejorando el SLA percibido.
- El dashboard de CI/CD permite medir y mejorar las métricas DORA (indicadores clave de madurez DevOps) exigidos en auditorías de compliance para software financiero.
- Requiere capacitación del equipo SRE en PromQL y Grafana para mantenimiento y extensión de dashboards.

**Referencias y trazabilidad:**
- SAD: §19 — DevSecOps y Pipeline CI/CD; §15 — Observabilidad y Monitoreo
- SAD-Lite: §15 — Observabilidad
- Developer Handbook: §6.4 — Instrumentación de Servicios; §6.5 — Dashboards Operacionales
- ADR: ADR-0003 (Redis como Backend de Caché y Sesión)
- Tablas afectadas: `audit_logs` (lectura para métricas de RLS violations y accesos cross-tenant)
- Flujo crítico SAD §10: Transversal a todos los flujos (§10.1–§10.12)

---

#### HU-14.03 — Sistema de alertas de infraestructura: CPU, memoria, disco, conexiones DB, Redis

**Épica:** EP-14 — Observabilidad, QA, DevSecOps y Release
**Módulo(s):** SAD §9.10, SAD §19
**Historia:** Como SRE/DevOps, quiero alertas automáticas de infraestructura con umbrales configurables para CPU, memoria, disco, conexiones de base de datos, pool de Redis y profundidad de cola Celery, para detectar y mitigar degradaciones de infraestructura antes de que causen interrupción del servicio al usuario final.

**Alcance:**
Configuración de un sistema completo de alertas de infraestructura usando Grafana Alerting + Alertmanager (opcional para enrutamiento avanzado), alimentado por métricas de Prometheus provenientes de Node Exporter (métricas de host: CPU, memoria, disco, red), PostgreSQL Exporter (conexiones activas/idle/waiting, locks, replication lag, deadlocks), Redis Exporter (connected clients, used memory, hit ratio, evicted keys, commands/sec), Celery Exporter (queue depth, worker status, task failure rate), y cAdvisor/Kubelet metrics si se despliega en Kubernetes (container CPU/mem limits). Se definen las siguientes reglas de alerta con severidades (warning/critical): (1) CPU: warning >70% por 10 min, critical >85% por 5 min. (2) Memoria: warning >80% por 10 min, critical >90% por 5 min. (3) Disco: warning >75% usage, critical >85%; predicción de llenado en <7 días. (4) PostgreSQL conexiones: warning >80% del pool (max_connections), critical >90%. (5) PostgreSQL locks: warning si hay locks no resueltos >30s, critical >5 min. (6) Redis memoria: warning >75% maxmemory, critical >85%; alerta si evicted_keys >0. (7) Redis conexiones: warning >80% maxclients. (8) Celery queue depth: warning >5000 en cualquier cola, critical >10000; alerta si worker count = 0 (todos los workers caídos). (9) Replicación PostgreSQL: warning lag >100MB, critical lag >500MB. Cada alerta incluye metadata: severidad, servicio afectado, runbook URL (enlace a la documentación de respuesta), y etiquetas para enrutamiento. Las notificaciones se enrutan a Slack #ops-alerts (warning), #ops-critical + PagerDuty/OpsGenie (critical). Se configura inhibición de alertas: si un nodo está en maintenance mode (drenado/marcado), se suprimen sus alertas. Se implementan silence rules temporales (ventanas de mantenimiento programado). Todas las reglas de alerta se versionan como código (PrometheusRule CRD o archivos YAML de Grafana Alerting) en el repositorio bajo `/infra/alerts/`.

**Historia en formato Given/When/Then:**
- **Given** la plataforma Sentinel operando con monitoreo de infraestructura activo (Node Exporter, PostgreSQL Exporter, Redis Exporter, Celery Exporter)
- **When** el uso de CPU del servidor de FastAPI Core supera el 85% sostenido por 5 minutos
- **Then** se dispara una alerta CRITICAL en Grafana Alerting que se envía al canal Slack #ops-critical y genera una página en PagerDuty
- **And** la alerta contiene: nombre del host, porcentaje de CPU actual, gráfico de tendencia (últimos 15 min), prioridad CRITICAL, runbook URL `https://wiki.sentinel.internal/runbooks/high-cpu`
- **And** si el servidor está en modo mantenimiento (label `maintenance=true`), la alerta se suprime automáticamente
- **And** cuando el uso de CPU desciende por debajo del 70% por 5 minutos, la alerta se resuelve automáticamente con notificación de recuperación

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-14.01 (Instrumentación OTel)
- ADR: ADR-018 (Sistema de Alertas de Infraestructura)
- Regla de negocio: Toda alerta CRITICAL debe tener tiempo de respuesta (acknowledge) <5 minutos en horario laboral (9:00–18:00 CST) y <15 minutos fuera de horario. Las alertas WARNING se atienden en la siguiente ventana laboral.
- Restricción técnica: Las reglas de alerta deben evaluarse en Prometheus (no en Grafana) para garantizar funcionamiento incluso si Grafana está caído, con respaldo de reglas en Grafana Alerting para dashboards integrados.

**Criterios de aceptación:**
1. Las 9 reglas de alerta definidas (CPU, memoria, disco, DB conexiones, DB locks, Redis memoria, Redis conexiones, Celery queue, replicación DB) están configuradas, versionadas en código, y se disparan correctamente en entorno de staging al inducir las condiciones de umbral con pruebas de carga (k6, stress-ng).
2. Las alertas CRITICAL se entregan a Slack #ops-critical en <60s desde que la condición se cumple; las WARNING a #ops-alerts en <120s. Verificado con inyección de fallos controlados (Chaos Engineering leve: saturación de CPU, llenado de disco con `fallocate`, consumo de conexiones DB con pool exhaustion simulado).
3. Las reglas de inhibición (maintenance mode) y silence rules (ventanas programadas) funcionan correctamente: alertas suprimidas durante mantenimiento y reactivadas automáticamente al finalizar.
4. Cada alerta incluye en su payload: `severity`, `service`, `instance`, `runbook_url`, `dashboard_url` (enlace directo al dashboard de Grafana relevante), y valores de métricas actuales vs umbrales.
5. NFR: La evaluación de reglas de alerta en Prometheus no incrementa el uso de CPU del servidor Prometheus en más del 5%. El tiempo de evaluación de todas las reglas es <30s (intervalo configurado en 30s). No se generan falsos positivos por spikes transitorios (las reglas usan `for: 5m` como mínimo).

**Impactos y consideraciones:**
- Reduce el MTTR de incidentes de infraestructura al eliminar la dependencia de monitoreo manual o reportes de usuarios.
- El sistema de alertas es la primera línea de defensa para cumplir con SLAs de disponibilidad (≥99.5% para tenants estándar, ≥99.9% para critical).
- Requiere definición clara de responsabilidades en el equipo SRE: rotación de guardias (on-call), procedimientos de escalación, y runbooks actualizados para cada tipo de alerta.
- Las alertas de disco deben incluir predicción de llenado (usando `predict_linear`) para actuar antes de que ocurra el outage.

**Referencias y trazabilidad:**
- SAD: §19 — DevSecOps y Pipeline CI/CD; §15 — Observabilidad y Monitoreo
- SAD-Lite: §15 — Observabilidad
- Developer Handbook: §6.4 — Instrumentación de Servicios; §6.6 — Runbooks
- ADR: ADR-0003 (Redis como Backend de Caché y Sesión)
- Tablas afectadas: N/A (infraestructura; no modifica esquema de base de datos)
- Flujo crítico SAD §10: Transversal a todos los flujos (§10.1–§10.12)

---

#### HU-14.04 — Hardening de CI/CD pipeline con stages de seguridad: SAST, DAST, SCA, secret scanning

**Épica:** EP-14 — Observabilidad, QA, DevSecOps y Release
**Módulo(s):** SAD §9.10, SAD §20, Developer Handbook §6
**Historia:** Como DevSecOps, quiero un pipeline CI/CD con stages obligatorios de seguridad (SAST Semgrep, Gitleaks secrets scanning, DAST OWASP ZAP, SCA pip-audit/npm audit, Trivy container scanning) ejecutados en cada push y PR, para garantizar que ningún código con vulnerabilidades, secretos expuestos o dependencias inseguras llegue al entorno de producción.

**Alcance:**
Hardening integral del pipeline de CI/CD (GitHub Actions o GitLab CI) mediante la incorporación de stages de seguridad automatizados como gates obligatorios. El pipeline se estructura en las siguientes etapas secuenciales: (1) **Pre-commit hooks** (opcional, local): pre-commit config con detect-secrets, trailing-whitespace, linting básico. (2) **SCA — Software Composition Analysis**: pip-audit (Python) y npm audit (TypeScript) escanean dependencias en busca de CVE conocidas. Se configura threshold: 0 vulnerabilidades críticas o altas sin parche. Vulnerabilidades moderadas con parche disponible generan warning pero no bloquean. Se integra Dependabot/Renovate para PRs automáticos de actualización. (3) **Secrets Scanning**: Gitleaks escanea todo el historial de commits y el working tree en busca de secretos (API keys, tokens, contraseñas, certificados, connection strings, AWS credentials). Se utiliza `.gitleaks.toml` con reglas personalizadas para patrones específicos del stack (JWT secrets, Belvo API keys, SAT credentials). Umbral: 0 hallazgos (cualquier secreto detectado bloquea el pipeline). (4) **SAST — Static Application Security Testing**: Semgrep con reglas específicas por lenguaje (Python: bandit-equivalent + reglas personalizadas; TypeScript: eslint-plugin-security + reglas personalizadas). Se ejecuta en modo CI (`semgrep ci`) con diff-aware scanning (solo archivos modificados en la PR). Umbral: 0 hallazgos de severidad CRITICAL o HIGH; hallazgos MEDIUM requieren aprobación de security review. (5) **Linting y Formateo**: ruff (Python), ESLint + Prettier (TypeScript). Code style no bloquea pero notifica. (6) **Unit + Integration Tests**: pytest + Jest con coverage threshold ≥75%. Si coverage baja, PR bloqueada. (7) **RLS Isolation Suite**: ejecuta `test_rls_isolation.py`. 0 fallos permitidos; cualquier violación RLS bloquea el merge. (8) **Container Image Scan**: Trivy escanea las imágenes Docker construidas (FastAPI, Celery Worker, Express BFF) en busca de vulnerabilidades en paquetes del sistema y dependencias. Umbral: 0 vulnerabilidades CRITICAL o HIGH. (9) **DAST — Dynamic Application Security Testing**: OWASP ZAP baseline scan contra el entorno de staging desplegado en el pipeline (solo para la rama `main` o `release/*`, no por PR para optimizar tiempo). Escanea OWASP Top 10 (XSS, SQLi, CSRF, misconfiguration, etc.). Reporte en GitHub Security tab. Umbral: 0 alertas HIGH; MEDIUM requiere revisión. (10) **Compliance Check**: verificación de que los archivos de documentación obligatorios existen y están actualizados: ADR docs, changelog, version bump si aplica.

**Historia en formato Given/When/Then:**
- **Given** un desarrollador que abre una Pull Request en GitHub desde `feature/HU-14.04-hardening-pipeline` hacia `main`
- **When** el pipeline de CI/CD se ejecuta automáticamente
- **Then** se ejecutan en paralelo: SCA (pip-audit + npm audit), Secrets Scanning (Gitleaks), SAST (Semgrep), Linting (ruff + ESLint), y Tests (pytest + Jest)
- **And** si Gitleaks detecta un secreto (ej. AWS_ACCESS_KEY_ID hardcodeado en un archivo .env.example), el pipeline falla inmediatamente con un mensaje claro: "Secret detected in config/settings.py: AWS_ACCESS_KEY_ID. Remove and use secrets manager."
- **And** si Semgrep encuentra una vulnerabilidad HIGH (ej. SQL injection en raw query sin parámetros), el pipeline falla con el link al finding en GitHub Security tab
- **And** si pip-audit encuentra una CVE crítica en dependencia `cryptography<42.0.0`, el pipeline falla indicando la versión vulnerable y la mínima con parche
- **And** si todos los gates de seguridad pasan, se ejecutan los stages subsecuentes: Container Scan (Trivy), DAST (ZAP, solo en main), y Compliance Check
- **And** el resultado de cada stage se reporta como GitHub Check con badge visual en la PR, y el merge se bloquea si cualquier gate obligatorio falla

**Prerrequisitos y reglas de negocio:**
- Requiere: Ninguno (HU fundacional de CI/CD; no depende de otras HUs)
- ADR: ADR-018 (Hardening CI/CD Pipeline)
- Regla de negocio: Ningún código puede ser mergeado a `main` o `release/*` sin pasar todos los gates de seguridad. Excepciones requieren aprobación explícita del Security Champion con justificación documentada y fecha de remediación acordada.
- Restricción técnica: El pipeline completo (incluyendo DAST) no debe exceder 20 minutos de duración para mantener la velocidad del equipo de desarrollo. Stages tempranos (SCA, secrets, SAST, linting) deben completar en <5 min.

**Criterios de aceptación:**
1. El pipeline de CI/CD ejecuta automáticamente los stages de seguridad (SCA, Secrets Scanning, SAST, Linting, Tests, RLS Suite) en cada push a cualquier rama y en cada PR, con resultados visibles como GitHub Checks.
2. Todos los gates de seguridad (SCA, Gitleaks, Semgrep, Trivy, RLS tests) bloquean el merge de la PR cuando se detectan hallazgos que superan el umbral definido (0 críticos/altos).
3. Gitleaks detecta y bloquea secretos en: código fuente, archivos de configuración, archivos de ejemplo/documentación, y en el historial completo de commits de la PR (no solo el diff de la PR).
4. El reporte de DAST (OWASP ZAP) se genera y se publica como artefacto del pipeline en la pestaña Security de GitHub, accesible para revisión del equipo de seguridad.
5. NFR: El pipeline completo (todos los stages) completa en ≤15 minutos para PRs (sin DAST) y ≤20 minutos para merges a `main` (con DAST). El tiempo de feedback de los gates de seguridad tempranos (SCA + Gitleaks + Semgrep) es ≤5 min desde que se abre/actualiza la PR.

**Impactos y consideraciones:**
- Transforma la seguridad de "revisión manual antes del release" a "gates automatizados en cada commit", eliminando el riesgo de despliegues con vulnerabilidades conocidas.
- Requiere inversión inicial en tuning de reglas de SAST para minimizar falsos positivos que erosionen la confianza del equipo en el pipeline.
- Los desarrolladores deben recibir capacitación en: interpretación de findings de Semgrep, gestión de secretos (uso de secrets manager/vault), y actualización proactiva de dependencias.
- Dependabot/Renovate debe configurarse para automatizar PRs de actualización de dependencias con parches de seguridad, reduciendo la fricción del gate SCA.

**Referencias y trazabilidad:**
- SAD: §20 — Pipeline CI/CD y Release Management; §19 — DevSecOps
- SAD-Lite: §15 — Observabilidad
- Developer Handbook: §6.1 — Pipeline CI/CD; §6.2 — Herramientas de Seguridad
- ADR: ADR-0003 (Redis como Backend de Caché y Sesión)
- Tablas afectadas: N/A (cambios de infraestructura CI/CD; no modifica esquema de base de datos)
- Flujo crítico SAD §10: Transversal (asegura calidad en todos los flujos)

---

#### HU-14.05 — Gates de calidad automatizados en PRs: coverage ≥75%, linting, SAST sin críticos

**Épica:** EP-14 — Observabilidad, QA, DevSecOps y Release
**Módulo(s):** SAD §9.10, SAD §20, Developer Handbook §6
**Historia:** Como tech lead, quiero gates pre-merge automatizados que bloqueen Pull Requests cuando la cobertura de pruebas sea inferior al 75%, SAST detecte hallazgos críticos/altos, RLS tests fallen o las dependencias tengan vulnerabilidades sin parche, para mantener la calidad del código de forma consistente sin depender de revisiones manuales.

**Alcance:**
Configuración de reglas de protección de rama (branch protection rules) y status checks requeridos en GitHub (o GitLab equivalent) para las ramas protegidas `main`, `develop`, y `release/*`. Se definen los siguientes gates de calidad como required status checks: (1) **Coverage Gate**: el check `test-coverage` reporta cobertura global y por archivo; si la cobertura total desciende por debajo del 75% o cualquier archivo nuevo/modificado tiene cobertura <50%, el check falla y bloquea el merge. Se utiliza pytest-cov (Python) y Jest --coverage (TypeScript) con reportes combinados vía `coverage.py` merge. (2) **SAST Gate**: el check `semgrep-sast` reporta findings por severidad; cualquier finding CRITICAL o HIGH bloquea; findings MEDIUM requieren comentario de security review con aprobación del Security Champion. (3) **RLS Gate**: el check `rls-isolation` ejecuta la suite `test_rls_isolation.py`; 0 fallos tolerados; cualquier violación de aislamiento cross-tenant bloquea inmediatamente. (4) **Dependencies Gate**: el check `sca-audit` (pip-audit + npm audit) verifica vulnerabilidades en dependencias; cualquier CVE con severidad CRITICAL o HIGH sin parche disponible bloquea; CVEs con parche generan warning con sugerencia de bump. (5) **Linting Gate**: ruff (Python) y ESLint (TypeScript) verifican style guide; errores bloquean, warnings no bloquean pero se reportan en la PR. (6) **Type Check Gate**: mypy (Python, strict mode en código nuevo) y tsc --noEmit (TypeScript) verifican tipos; errores de tipo bloquean. (7) **Build Gate**: verifica que la aplicación construye correctamente (Docker build sin errores, frontend `react-scripts build` exitoso). (8) **Migration Safety Gate**: si la PR incluye archivos de migración (Alembic/Flyway), se ejecuta `alembic check` o `flyway validate` contra un schema de staging para detectar conflictos de migración. Adicionalmente, se configura GitHub CODEOWNERS para requerir revisión de equipos específicos según el área modificada (backend → @sentinel/backend-team, frontend → @sentinel/frontend-team, database → @sentinel/data-team, security → @sentinel/security). Se implementa un bot/slack notification que resume los resultados de los gates en el canal #dev-status al abrir/actualizar PR. Las reglas se documentan en un archivo `QUALITY_GATES.md` en la raíz del repositorio como referencia para el equipo.

**Historia en formato Given/When/Then:**
- **Given** un desarrollador que ha completado el desarrollo de una feature (HU) con 65% de cobertura de pruebas
- **When** abre una Pull Request hacia `main`
- **Then** el pipeline CI/CD se ejecuta y el check `test-coverage` falla con mensaje: "Coverage 65% below required threshold 75%. Missing coverage in: src/services/risk_calculator.py (42%), src/api/alert_handler.py (58%). Please add tests."
- **And** el botón de merge en GitHub aparece bloqueado (gris) con la leyenda "Required status check 'test-coverage' is failing"
- **And** en el canal Slack #dev-status se publica un resumen: "PR #342 (HU-14.05) — 5/8 gates passed, 3 failing: coverage (65% < 75%), SAST (2 HIGH findings), RLS (1 violation)"
- **And** cuando el desarrollador agrega las pruebas faltantes y corrige los findings, los checks se re-ejecutan automáticamente; al pasar todos los gates, el botón de merge se habilita
- **And** si el Security Champion aprueba un finding MEDIUM de Semgrep (riesgo aceptado con justificación), el gate SAST permite el merge con una anotación de excepción documentada

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-14.04 (Hardening de CI/CD Pipeline)
- ADR: ADR-018 (Quality Gates)
- Regla de negocio: Las reglas de protección aplican a `main`, `develop`, y `release/*`. Ramas de feature (`feature/*`, `fix/*`, `hotfix/*`) no están protegidas para permitir iteración rápida, pero deben pasar los gates para ser mergeadas a `develop`.
- Regla de negocio: El coverage gate se evalúa sobre líneas modificadas (diff coverage). Si la PR añade 200 líneas y 190 están cubiertas (95%), el gate pasa incluso si la cobertura total baja de 75%. Si la diff coverage es <75%, el gate falla. La cobertura total se monitorea como tendencia (no bloqueante).

**Criterios de aceptación:**
1. Los 8 gates de calidad (coverage, SAST, RLS, dependencies, linting, type check, build, migration safety) están configurados como required status checks en las ramas protegidas `main`, `develop`, y `release/*`.
2. Una PR que no cumple cualquiera de los gates requeridos ve el botón de merge bloqueado en GitHub con indicación clara de qué check falló y por qué (mensaje descriptivo, no solo pass/fail).
3. La diff coverage funciona correctamente: PR que modifica solo líneas con tests cubiertos (diff coverage ≥75%) pasa el gate aunque la cobertura total del proyecto sea inferior al 75%.
4. El bot de Slack publica automáticamente un resumen de gates al abrir/actualizar una PR, con emoji de estado por cada gate y link directo al log del check fallido.
5. NFR: El tiempo total de evaluación de todos los gates (desde push hasta resultado final) es ≤12 minutos. El resultado se notifica al autor de la PR en ≤15 min desde el push.

**Impactos y consideraciones:**
- Estandariza la calidad del código en todo el equipo: elimina el sesgo de "revisé más rápido porque es viernes" o "confío en este dev, no necesito revisar tests".
- El enfoque en diff coverage (no coverage absoluta) evita el bloqueo de PRs que refactorizan código legacy con cobertura históricamente baja, manteniendo el incentive de mejorar cobertura incrementalmente.
- Requiere que el equipo de desarrollo internalice la cultura de calidad: escribir pruebas no es opcional, es un gate de merge.
- El document `QUALITY_GATES.md` debe ser parte del onboarding de nuevos desarrolladores.

**Referencias y trazabilidad:**
- SAD: §20 — Pipeline CI/CD y Release Management; §19 — DevSecOps
- SAD-Lite: §15 — Observabilidad
- Developer Handbook: §6.1 — Pipeline CI/CD; §6.3 — Quality Gates
- ADR: ADR-0003 (Redis como Backend de Caché y Sesión)
- Tablas afectadas: N/A (configuración de CI/CD; no modifica esquema de base de datos)
- Flujo crítico SAD §10: Transversal (asegura calidad en todos los flujos)

---

#### HU-14.06 — Gestión de releases con semantic versioning, changelogs automáticos y rollback canary

**Épica:** EP-14 — Observabilidad, QA, DevSecOps y Release
**Módulo(s):** SAD §9.10, SAD §20
**Historia:** Como release manager, quiero un sistema automatizado de gestión de releases con versionado semántico (MAJOR.MINOR.PATCH) derivado de conventional commits, generación automática de changelog con categorización de cambios, despliegue canary progresivo (10%→50%→100%) y rollback automático ante degradación de métricas, para realizar releases frecuentes, seguras y auditables con mínima intervención manual.

**Alcance:**
Implementación de un flujo completo de release management automatizado. (1) **Semantic Versioning automático**: se utiliza `semantic-release` (o equivalente) para determinar automáticamente la próxima versión basada en los conventional commits desde el último release: `fix:` o `hotfix:` → PATCH bump, `feat:` → MINOR bump, `BREAKING CHANGE:` en footer → MAJOR bump. La versión se calcula al mergear a `main` y se plasma en un tag Git (`vX.Y.Z`) y en los archivos `package.json`, `pyproject.toml`, y `CHANGELOG.md`. (2) **Changelog automático**: `semantic-release` genera `CHANGELOG.md` con entradas categorizadas por tipo (Features, Bug Fixes, Breaking Changes, Performance Improvements, Documentation, Security) extraídas de los conventional commits, con enlaces a las PRs y autores. (3) **Despliegue Canary Progresivo**: el despliegue a producción sigue una estrategia canary configurada en Kubernetes (Argo Rollouts) o en el load balancer: 10% del tráfico a la nueva versión durante 5 min → monitoreo de métricas (error rate, latencia p95) → si OK, 50% por 5 min → si OK, 100% (full rollout). Si en cualquier etapa las métricas se degradan (error rate >1%, latencia p95 aumenta >20%), se activa rollback automático retornando el 100% del tráfico a la versión estable anterior. (4) **Rollback automático**: integrado con Helm/ArgoCD para revertir al release anterior; verifica que el rollback no introduzca regresiones (smoke tests post-rollback). (5) **Release approval gate**: para releases MAJOR (breaking changes), se requiere aprobación manual del release manager en el pipeline. Releases MINOR y PATCH avanzan automáticamente si todos los gates de calidad pasan. (6) **Release notes publicables**: el changelog se publica como GitHub Release con assets adjuntos (Docker images tags, archivos de migración, instrucciones de upgrade). (7) **Audit trail de releases**: cada release registra en `audit_logs` (WORM): versión, timestamp, commit SHA, autor, gates superados, aprobaciones, y duración del despliegue. El versionado semántico sigue estrictamente la especificación SemVer 2.0.0.

**Historia en formato Given/When/Then:**
- **Given** la rama `main` con 5 commits desde el último release v1.3.2: `feat: add dark mode toggle`, `fix: alert locking race condition`, `fix: Belvo webhook idempotency`, `feat: keyboard shortcuts for power users`, `docs: update API reference`
- **When** un release manager mergea `develop` → `main` (o se completa un PR aprobado contra `main`)
- **Then** `semantic-release` analiza los commits, determina que corresponde MINOR bump (dos `feat:`), y crea automáticamente: tag Git `v1.4.0`, actualiza `package.json`/`pyproject.toml` a `1.4.0`, genera `CHANGELOG.md` con entradas categorizadas, y publica GitHub Release con release notes
- **And** el despliegue canary inicia: 10% del tráfico dirigido a pods con la nueva imagen Docker `v1.4.0`; métricas monitoreadas por 5 min; si error rate <1% y latencia p95 <20% de aumento, avanza a 50% por 5 min más
- **And** durante el canary al 50%, se detecta un aumento de error rate del 2.3% (umbral >1%); el sistema activa rollback automático: 100% del tráfico retorna a `v1.3.2` en <2 min
- **And** se notifica al canal Slack #ops-critical: "Canary v1.4.0 rolled back after 8 minutes — error rate exceeded threshold (2.3% > 1%). Full traffic restored to v1.3.2. See Grafana dashboard for details."
- **And** el evento de rollback queda registrado en `audit_logs` con todos los detalles para análisis post-mortem

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-14.04 (Hardening de CI/CD Pipeline)
- ADR: ADR-018 (Release Management)
- Regla de negocio: Todos los releases a producción deben ser inmutables (el mismo tag Docker no se reemplaza). Rollback crea un nuevo despliegue (no re-etiqueta imágenes). No se permite force push a ramas de release.
- Regla de negocio: Releases MAJOR requieren: (a) entry en CHANGELOG con guía de migración (breaking changes), (b) aprobación manual del release manager, (c) todos los tests E2E en entorno de staging con datos anonimizados.
- Restricción técnica: El repositorio usa conventional commits (enforced por `commitlint` en hooks de pre-commit/CI). Commits que no siguen el formato son rechazados en el push.

**Criterios de aceptación:**
1. `semantic-release` determina correctamente el bump de versión (PATCH/MINOR/MAJOR) basado en los conventional commits desde el último release, verificado con 5 escenarios de prueba: solo fixes (PATCH), features + fixes (MINOR), breaking change en footer (MAJOR), sin commits relevantes (no release), y mixed con `chore:` y `docs:` (no release si no hay feat/fix).
2. El changelog se genera automáticamente con entradas categorizadas, enlaces a PRs/authors, y se publica como GitHub Release con assets (Docker image tags). Verificar que el release está disponible en la página de Releases de GitHub.
3. El despliegue canary ejecuta las 3 etapas (10%→50%→100%) con monitoreo automático de métricas; ante degradación detectada en cualquier etapa, se activa rollback en <2 min con notificación a Slack y registro en `audit_logs`.
4. El rollback automático restaura el tráfico a la versión estable anterior sin intervención manual y ejecuta smoke tests post-rollback que confirman que todos los endpoints críticos responden HTTP 200 en <5s.
5. NFR: El tiempo desde merge a `main` hasta release publicado en GitHub (sin incluir tiempo de canary) es ≤10 min. El tiempo de canary completo (10%→100%) es ≤15 min si todas las métricas están saludables. El rollback se completa en ≤2 min desde la detección de la degradación.

**Impactos y consideraciones:**
- Habilita release continua (continuous delivery) con seguridad: el equipo puede desplegar múltiples veces al día con confianza gracias al canary + rollback automático.
- El versionado semántico automatizado elimina errores humanos (olvidar bump, bump incorrecto) y mantiene consistencia entre Git tags, package managers y changelogs.
- La estrategia canary reduce el blast radius de releases defectuosas: solo 10% de usuarios experimentan el fallo antes del rollback automático.
- Requiere que el equipo adopte conventional commits como estándar obligatorio (training + tooling: `commitizen`, `commitlint`).

**Referencias y trazabilidad:**
- SAD: §20 — Pipeline CI/CD y Release Management; §19 — DevSecOps
- SAD-Lite: §15 — Observabilidad
- Developer Handbook: §6.1 — Pipeline CI/CD; §6.7 — Release Management
- ADR: ADR-0003 (Redis como Backend de Caché y Sesión)
- Tablas afectadas: `audit_logs` (registro inmutable de eventos de release, rollback, y aprobaciones)
- Flujo crítico SAD §10: Transversal (afecta la disponibilidad de todos los flujos)

---

#### HU-14.07 — Health dashboard unificado de todos los servicios: API, Workers, DB, Redis, S3, Belvo

**Épica:** EP-14 — Observabilidad, QA, DevSecOps y Release
**Módulo(s):** SAD §9.10, SAD §19, SAD §18.2
**Historia:** Como SRE/DevOps, quiero un dashboard unificado de health checks que agregue el estado de todos los servicios del ecosistema Sentinel (API, Workers, DB, Redis, S3, Belvo) con readiness/liveness probes para Kubernetes/Docker, para detectar fallos de cualquier componente en una sola vista y reducir el tiempo de diagnóstico de incidentes.

**Alcance:**
Implementación de un sistema unificado de health checks y readiness/liveness probes para todos los servicios del stack Sentinel, con un dashboard agregado en Grafana. Se definen los siguientes endpoints de health: (1) **FastAPI Core `/health`**: liveness (process alive), readiness (DB conexión exitosa + Redis ping + S3 connectivity check + Belvo API health check). (2) **Express BFF `/health`**: liveness (process alive), readiness (DB vía Prisma + Redis ping + upstream FastAPI health check). (3) **Celery Workers**: health check vía Celery `ping` task y worker heartbeat en Redis; se expone métrica `celery_worker_up` a Prometheus vía Celery Exporter. (4) **PostgreSQL**: health verificado vía `pg_isready` y métricas de replicación lag. (5) **Redis**: health verificado vía `redis-cli ping` y métricas de memoria/latencia. (6) **S3/MinIO (WORM Vault)**: health check de conectividad y verificación de bucket existence/access. (7) **Belvo API**: health check de conectividad (API key válida, endpoint `/api/` responde 200) con timeout de 5s. El dashboard de Grafana (provisionado como código) muestra una vista de semáforo (green/yellow/red) con tarjetas por servicio, indicando: estado actual (UP/DEGRADED/DOWN), uptime (últimas 24h), última latencia de health check, y timestamp del último cambio de estado. Se incluye una vista de dependencias (dependency graph) que muestra cómo la caída de un servicio afecta a los demás (ej. Redis DOWN → BFF DEGRADED (sin caché) → Core DEGRADED (sin rate limiting)). Para Kubernetes, se configuran readiness probes en los Pod specs que apuntan a estos endpoints con `initialDelaySeconds`, `periodSeconds`, `failureThreshold`. Para Docker Compose (entornos de desarrollo/staging), se usa `depends_on` con `condition: service_healthy` y healthcheck en cada servicio. El dashboard también incluye un timeline de incidentes (estado del servicio hora por hora en las últimas 72h) y una sección de SLI (Service Level Indicators) con los SLAs definidos: disponibilidad ≥99.5% para tenants estándar, ≥99.9% para critical. Se configuran alertas en Grafana Alerting: notificación inmediata si cualquier servicio cambia a estado DOWN; notificación WARNING si DEGRADED >5 min.

**Historia en formato Given/When/Then:**
- **Given** la plataforma Sentinel operando en producción con todos los servicios instrumentados
- **When** un SRE accede al Health Dashboard Unificado en Grafana a las 03:00 AM durante una alerta de infraestructura
- **Then** ve una vista de semáforo: FastAPI Core (GREEN, UP 99.97%), Express BFF (GREEN, UP 99.95%), Celery Workers (YELLOW, DEGRADED — 2/4 workers down), PostgreSQL (GREEN), Redis (GREEN), S3 (GREEN), Belvo API (RED, DOWN — timeout 5s)
- **And** el dependency graph muestra: Belvo API DOWN → FastAPI Core DEGRADED (sync endpoint 503) → Express BFF DEGRADED (profile view sin data fresca)
- **And** el timeline de incidentes de las últimas 72h muestra: Belvo API DOWN desde las 02:55 AM (timestamp), intentos de reconexión cada 30s (24 attempts), notificación enviada a #ops-critical a las 03:00 AM
- **And** los SLIs muestran: disponibilidad general 99.89% (por debajo del SLA 99.9% para tenants críticos), con desglose de la ventana de indisponibilidad actual
- **And** en Kubernetes, los Pods de FastAPI Core que no pueden alcanzar Belvo muestran readiness probe como `failed` (pero liveness OK), por lo que Kubernetes los mantiene corriendo pero los retira del Service/balanceador para tráfico que depende de Belvo

**Prerrequisitos y reglas de negocio:**
- Requiere: HU-14.01 (Instrumentación OTel), HU-14.02 (Dashboard de Métricas Operacionales)
- ADR: ADR-018 (Health Dashboard Unificado)
- Regla de negocio: El health check de un servicio externo (Belvo, S3) no debe causar que la readiness probe del servicio propio falle. El servicio propio reporta DEGRADED si su dependencia externa falla, pero sigue sirviendo tráfico que no depende de ella.
- Restricción técnica: Los endpoints `/health/readiness` deben responder en <1s. Si la verificación de dependencia externa excede 1s, se reporta como timeout en el check pero no bloquea la respuesta. Kubernetes readiness probe debe configurarse con `timeoutSeconds: 3`.

**Criterios de aceptación:**
1. Todos los servicios del stack (FastAPI Core, Express BFF, Celery Workers, PostgreSQL, Redis, S3, Belvo) exponen endpoints de health con liveness (UP/DOWN) y readiness (incluye estado de dependencias), verificables con `curl -s http://<service>/health | jq .`.
2. El dashboard de Grafana renderiza correctamente la vista de semáforo con el estado en tiempo real de todos los servicios (≤30s de delay), el dependency graph con estados propagados, y el timeline de incidentes de 72h con granularidad de 1 minuto.
3. Las readiness probes de Kubernetes reflejan correctamente el estado: si PostgreSQL está DOWN, los Pods de FastAPI Core marcan readiness como `failed` y Kubernetes los retira del Service automáticamente; si Belvo está DOWN, los Pods marcan `degraded` pero readiness sigue OK (los Pods siguen sirviendo tráfico que no depende de Belvo).
4. Las alertas del Health Dashboard se disparan en <60s cuando cualquier servicio cambia a DOWN, y en <5 min cuando permanece DEGRADED. Notificación enviada a Slack #ops-critical con: servicio afectado, estado actual, timestamp, link al dashboard.
5. NFR: El endpoint `/health` de cada servicio responde en <200ms (liveness) y <1s (readiness). La carga de health checks en producción no consume más del 2% de recursos del servicio (CPU/memoria). El dashboard de Grafana carga en <2s con datos de la última hora.

**Impactos y consideraciones:**
- Proporciona una única fuente de verdad sobre el estado de la plataforma, eliminando la necesidad de verificar 7 dashboards diferentes durante un incidente.
- Los readiness probes en Kubernetes permiten que el orquestador tome decisiones automáticas (reiniciar pods unhealthy, retirar tráfico de pods degradados) sin intervención manual.
- El dependency graph ayuda al equipo de guardia (especialmente nuevos miembros) a entender rápidamente el impacto en cascada de una falla.
- Debe definirse claramente la diferencia entre DOWN (servicio inalcanzable o no responde), DEGRADED (funcional pero con dependencia caída o rendimiento sub-óptimo), y UP (100% operativo). Estas definiciones se documentan en el runbook correspondiente.

**Referencias y trazabilidad:**
- SAD: §19 — DevSecOps y Pipeline CI/CD; §15 — Observabilidad y Monitoreo; §18.2 — Componentes del HUD
- SAD-Lite: §15 — Observabilidad
- Developer Handbook: §6.4 — Instrumentación de Servicios; §6.6 — Runbooks
- ADR: ADR-0003 (Redis como Backend de Caché y Sesión)
- Tablas afectadas: N/A (infraestructura; no modifica esquema de base de datos)
- Flujo crítico SAD §10: Transversal a todos los flujos (§10.1–§10.12)

---

## 6. Matriz de Trazabilidad y Resumen

**Total HUs con Golden Template:** 126

| Épica | HU | Módulo(s) | Prueba(s) |
|:---|:---|:---|:---|
| EP-01 | HU-01.01 | SAD §2, SAD §23 | test_adr_template.py, test_adr_version.py |
| EP-01 | HU-01.02 | SAD §2, SAD §23.4 | test_doc_consistency.py |
| EP-01 | HU-01.03 | SAD §1, SAD §23 | test_sad_versioning.py, test_changelog.py |
| EP-01 | HU-01.04 | SAD §23.4, SAD §24.5 | test_compliance_checklist.py |
| EP-01 | HU-01.05 | SAD §2, SAD §23 | test_gov_change_request.py |
| EP-01 | HU-01.06 | SAD §2, Developer Handbook §1 | test_onboarding_docs.py |
| EP-02 | HU-02.01 | SAD §9.2, SAD §13.4 | test_auth_federated.ts, test_login_flow.ts |
| EP-02 | HU-02.02 | SAD §9.2, SAD §13.4 | test_jwt_cookies.ts, test_2fa_flow.ts |
| EP-02 | HU-02.03 | SAD §9.2, SAD §13.6 | test_session_mgmt.ts, test_session_revoke.ts |
| EP-02 | HU-02.04 | SAD §9.2, SAD §13.4 | test_password_policy.ts |
| EP-02 | HU-02.05 | SAD §9.2, SAD §13.4 | test_sso_saml.ts, test_sso_oidc.ts |
| EP-02 | HU-02.06 | SAD §9.2, SAD §13.8 | test_bruteforce_protection.ts |
| EP-02 | HU-02.07 | SAD §9.2, SAD §13.6 | test_anomaly_sessions.ts |
| EP-02 | HU-02.08 | SAD §9.2, SAD §13.4 | test_account_recovery.ts |
| EP-03 | HU-03.01 | SAD §9.3, SAD §13.5 | test_profile_api.ts, test_profile_update.ts |
| EP-03 | HU-03.02 | SAD §9.3, SAD §9.10 | test_prefs_api.ts, test_notif_config.ts |
| EP-03 | HU-03.03 | SAD §9.3, SAD §9.10 | test_worm_viewer.ts |
| EP-03 | HU-03.04 | SAD §9.3, SAD §13.5 | test_rbac_api.ts, test_user_mgmt.ts |
| EP-03 | HU-03.05 | SAD §9.3, SAD §9.4 | test_tenant_config.py, test_finops_params.py |
| EP-03 | HU-03.06 | SAD §9.3, SAD §11.6 | test_multitenant_holding.py, test_subtenant_isolation.py |
| EP-03 | HU-03.07 | SAD §9.3, SAD §13.5 | test_rbac_dashboard.tsx, test_permission_matrix.tsx |
| EP-03 | HU-03.08 | SAD §9.3, SAD §13.5 | test_api_keys.py, test_m2m_auth.py |
| EP-03 | HU-03.09 | SAD §9.3, SAD §11.8 | test_admin_audit_log.py |
| EP-04 | HU-04.01 | SAD §9.1, SAD §11.2 | test_ddl_migrations.py |
| EP-04 | HU-04.02 | SAD §9.1, SAD §11.6 | test_rls_injector.py, test_rls_isolation.py |
| EP-04 | HU-04.03 | SAD §9.1, SAD §11.6 | test_prisma_rls.ts |
| EP-04 | HU-04.04 | SAD §9.1, SAD §11.6 | test_rls_policies.sql |
| EP-04 | HU-04.05 | SAD §9.1, SAD §11.2 | test_migrations_flyway.py, test_migration_rollback.py |
| EP-04 | HU-04.06 | SAD §9.1, SAD §11.2 | test_backup_pitr.py, test_restore_validation.py |
| EP-04 | HU-04.07 | SAD §9.1, SAD §11.6 | test_query_performance.py |
| EP-04 | HU-04.08 | SAD §9.1, SAD §11.2 | test_partitioning.py, test_partition_pruning.py |
| EP-04 | HU-04.09 | SAD §9.1, SAD §9.10 | test_db_health.py |
| EP-04 | HU-04.10 | SAD §9.1, Developer Handbook §7 | test_seed_data.py, test_anon_fixtures.py |
| EP-05 | HU-05.01 | SAD §9.5, SAD §10.1 | test_onboarding_wizard.tsx, test_onboarding_flow.py |
| EP-05 | HU-05.02 | SAD §9.5, SAD §12.1 | test_belvo_widget.tsx, test_belvo_link.py |
| EP-05 | HU-05.03 | SAD §9.5, SAD §10.1 | test_rfc_validator.py, test_rfc_onboarding.tsx |
| EP-05 | HU-05.04 | SAD §9.5, SAD §10.1 | test_tax_profile_crud.py, test_tax_profile_setup.tsx |
| EP-05 | HU-05.05 | SAD §9.5, SAD §10.2 | test_legacy_migration.py, test_legacy_parser.py |
| EP-05 | HU-05.06 | SAD §9.5, SAD §12.2 | test_identity_verification.py |
| EP-05 | HU-05.07 | SAD §9.5, SAD §17.5 | test_finops_setup.py, test_finops_templates.tsx |
| EP-05 | HU-05.08 | SAD §9.5, SAD §18.2 | test_onboarding_dashboard.tsx |
| EP-06 | HU-06.01 | SAD §9.6, SAD §10.3 | test_belvo_adapter.py, test_belvo_ingest.py |
| EP-06 | HU-06.02 | SAD §9.6, SAD §12.1 | test_webhook_hmac.py, test_webhook_security.py |
| EP-06 | HU-06.03 | SAD §9.6, SAD §18.2 | test_sync_status.py, test_progress_ui.tsx |
| EP-06 | HU-06.04 | SAD §9.6, SAD §10.4 | test_belvo_reconciliation.py |
| EP-06 | HU-06.05 | SAD §9.6, SAD §12.1 | test_belvo_retries.py, test_circuit_breaker.py |
| EP-06 | HU-06.06 | SAD §9.6, SAD §12.1 | test_webhook_idempotency.py |
| EP-06 | HU-06.07 | SAD §9.6, SAD §10.3 | test_belvo_delta_sync.py |
| EP-06 | HU-06.08 | SAD §9.6, SAD §12.1 | test_rate_limiting.py, test_throttling.py |
| EP-06 | HU-06.09 | SAD §9.6, SAD §9.10 | test_belvo_health_dashboard.tsx |
| EP-07 | HU-07.01 | SAD §9.7, SAD §10.2 | test_cfdi_parser.py, test_lens_quality.py |
| EP-07 | HU-07.02 | SAD §9.7, SAD §10.4 | test_cfdi_dedup.py, test_lens_belvo_dedup.py |
| EP-07 | HU-07.03 | SAD §9.7, SAD §10.12 | test_degraded_mode.py |
| EP-07 | HU-07.04 | SAD §9.7, SAD §10.2 | test_zip_parser.py |
| EP-07 | HU-07.05 | SAD §9.7, SAD §10.2 | test_xsd_validator.py |
| EP-07 | HU-07.06 | SAD §9.7, SAD §10.2 | test_metadata_extraction.py |
| EP-07 | HU-07.07 | SAD §9.7, SAD §11.2 | test_quality_flags.py, test_quality_scoring.py |
| EP-07 | HU-07.08 | SAD §9.7, SAD §10.4 | test_merge_belvo_lens.py |
| EP-08 | HU-08.01 | SAD §9.4, SAD §17.3 | test_riskgauge.py, test_risk_analysis.py |
| EP-08 | HU-08.02 | SAD §9.4, SAD §17.3 | test_calendar_iqr.py, test_seasonal_sensitivity.py |
| EP-08 | HU-08.03 | SAD §9.4, SAD §17.3 | test_rules_version.py, test_version_audit.py |
| EP-08 | HU-08.04 | SAD §9.4, SAD §17.3 | test_hhi_calculation.py |
| EP-08 | HU-08.05 | SAD §9.4, SAD §17.3 | test_iqr_zscore.py |
| EP-08 | HU-08.06 | SAD §9.4, SAD §17.3 | test_trend_analysis.py |
| EP-08 | HU-08.07 | SAD §9.4, SAD §17.3 | test_scenario_simulation.py |
| EP-08 | HU-08.08 | SAD §9.4, SAD §11.8 | test_risk_export.py |
| EP-08 | HU-08.09 | SAD §9.4, SAD §17.3 | test_risk_cache.py |
| EP-08 | HU-08.10 | SAD §9.4, SAD §18.2 | test_risk_comparative.tsx |
| EP-09 | HU-09.01 | SAD §9.5, SAD §10.6 | test_69b_etl.py, test_69b_workflow.py |
| EP-09 | HU-09.02 | SAD §9.5, SAD §17.3 | test_pld_umas.py, test_pld_alerting.py |
| EP-09 | HU-09.03 | SAD §9.5, SAD §17.5 | test_jaro_winkler.py, test_screening_ofac.py |
| EP-09 | HU-09.04 | SAD §9.5, Developer Handbook §7 | test_69b_mock_data.py, test_pld_mock_flow.py |
| EP-09 | HU-09.05 | SAD §9.5, SAD §10.6 | test_unified_screening.py |
| EP-09 | HU-09.06 | SAD §9.5, SAD §12.3 | test_ofac_sync.py |
| EP-09 | HU-09.07 | SAD §9.5, SAD §17.5 | test_pep_detection.py, test_pep_affinity.py |
| EP-09 | HU-09.08 | SAD §9.5, SAD §10.7 | test_uif_report.py, test_uif_export.py |
| EP-09 | HU-09.09 | SAD §9.5, SAD §11.8 | test_screening_audit_log.py |
| EP-09 | HU-09.10 | SAD §9.5, SAD §17.3 | test_69b_simulation.py |
| EP-10 | HU-10.01 | SAD §9.10, SAD §17.5 | test_criticality_api.py, test_coverage_rules.py |
| EP-10 | HU-10.02 | SAD §9.10, SAD §10.8 | test_alert_locking.py, test_alert_locking_integ.py |
| EP-10 | HU-10.03 | SAD §9.10, SAD §13.8 | test_notif_channels.py, test_notif_delivery.py |
| EP-10 | HU-10.04 | SAD §9.10, SAD §10.8 | test_alert_routing.py |
| EP-10 | HU-10.05 | SAD §9.10, SAD §10.8 | test_sla_timer.py, test_escalation.py |
| EP-10 | HU-10.06 | SAD §9.10, SAD §10.8 | test_co_sign.py, test_dual_auth_close.py |
| EP-10 | HU-10.07 | SAD §9.10, SAD §18.2 | test_sla_dashboard.tsx, test_mttr_metrics.py |
| EP-10 | HU-10.08 | SAD §9.10, SAD §10.8 | test_response_templates.py |
| EP-10 | HU-10.09 | SAD §9.10, SAD §10.8 | test_alert_workflow.py, test_alert_states.tsx |
| EP-11 | HU-11.01 | SAD §9.8, SAD §10.9 | test_vault_case.py, test_evidence_link.py |
| EP-11 | HU-11.02 | SAD §9.8, SAD §10.9 | test_nom151_seal.py, test_vault_upload.py |
| EP-11 | HU-11.03 | SAD §9.8, SAD §11.8 | test_vault_query.py, test_evidence_history.py |
| EP-11 | HU-11.04 | SAD §9.8, SAD §11.8 | test_worm_export.py, test_evidence_export.py |
| EP-11 | HU-11.05 | SAD §9.8, SAD §11.8 | test_retention_policy.py, test_legal_purge.py |
| EP-11 | HU-11.06 | SAD §9.8, SAD §11.8 | test_audit_worm.py, test_audit_immutability.py |
| EP-11 | HU-11.07 | SAD §9.8, SAD §11.8 | test_worm_integrity.py |
| EP-11 | HU-11.08 | SAD §9.8, SAD §11.8 | test_custody_chain.tsx |
| EP-11 | HU-11.09 | SAD §9.8, SAD §11.8 | test_mass_export.py |
| EP-11 | HU-11.10 | SAD §9.8, SAD §11.8 | test_object_lock_config.py |
| EP-12 | HU-12.01 | SAD §9.6, SAD §16.4 | test_ai_riskgauge.py |
| EP-12 | HU-12.02 | SAD §9.6, SAD §16.1 | test_ai_alert_explain.py, test_ai_context.py |
| EP-12 | HU-12.03 | SAD §9.6, SAD §16.8 | test_ai_draft.py |
| EP-12 | HU-12.04 | SAD §9.6, SAD §16.4 | test_pii_scrubber.py, test_scrub_integration.py |
| EP-12 | HU-12.05 | SAD §9.6, SAD §16.8 | test_contradiction.py, test_ai_vs_math.py |
| EP-12 | HU-12.06 | SAD §9.6, SAD §11.8 | test_ai_audit.py, test_ai_trace.py |
| EP-12 | HU-12.07 | SAD §9.6, SAD §16.6 | test_prompt_versioning.py |
| EP-12 | HU-12.08 | SAD §9.6, SAD §16.3 | test_rag_indexing.py |
| EP-12 | HU-12.09 | SAD §9.6, SAD §16.3 | test_semantic_search.py |
| EP-12 | HU-12.10 | SAD §9.6, SAD §16.8 | test_ai_fallback.py |
| EP-12 | HU-12.11 | SAD §9.6, SAD §16.7 | test_ai_quality_dashboard.tsx |
| EP-12 | HU-12.12 | SAD §9.6, SAD §16.7 | test_token_usage.py, test_token_dashboard.tsx |
| EP-13 | HU-13.01 | SAD §9.1, SAD §18.1 | test_hud_components.tsx |
| EP-13 | HU-13.02 | SAD §9.1, SAD §18.2 | test_profile_view.tsx, test_profile_data.py |
| EP-13 | HU-13.03 | SAD §9.1, SAD §10.8 | test_alert_list.tsx |
| EP-13 | HU-13.04 | SAD §9.1, SAD §10.1 | test_quick_setup.tsx, test_onboarding_ux.ts |
| EP-13 | HU-13.05 | SAD §9.1, SAD §10.12 | test_degraded_banner.tsx, test_degraded_states.py |
| EP-13 | HU-13.06 | SAD §9.1, SAD §18.1 | test_a11y.tsx |
| EP-13 | HU-13.07 | SAD §9.1, SAD §18.1 | test_dark_mode.tsx, test_theme_switch.tsx |
| EP-13 | HU-13.08 | SAD §9.1, SAD §18.1 | test_responsive.tsx, test_mobile_layout.tsx |
| EP-13 | HU-13.09 | SAD §9.1, SAD §18.1 | test_i18n.tsx, test_locale_switch.tsx |
| EP-13 | HU-13.10 | SAD §9.1, SAD §18.1 | test_keyboard_shortcuts.tsx |
| EP-14 | HU-14.01 | SAD §9.10, SAD §19 | test_otel_tracing.py, test_otel_spans.ts |
| EP-14 | HU-14.02 | SAD §9.10, SAD §19 | test_grafana_dashboards.py |
| EP-14 | HU-14.03 | SAD §9.10, SAD §19 | test_infra_alerts.py |
| EP-14 | HU-14.04 | SAD §9.10, SAD §20 | test_cicd_pipeline.yml |
| EP-14 | HU-14.05 | SAD §9.10, SAD §20 | test_quality_gates.py |
| EP-14 | HU-14.06 | SAD §9.10, SAD §20 | test_release_mgmt.py |
| EP-14 | HU-14.07 | SAD §9.10, SAD §19 | test_service_health.py, test_health_dashboard.tsx |

---

## 7. Roadmap de Expansión Futura

El backlog v3.2.0-MASTER de 126 HUs en 14 épicas cubre el alcance completo planificado para Sentinel Nexus 360 Enterprise.

## 7.1 Fase v3.3.0 — Expansión LATAM y CFDI Activo

| Épica | Alcance | HUs estimadas |
|:---|:---|---:|
| EP-15 | Integración APIs fiscales Brasil (Receita Federal) | 8 |
| EP-16 | Integración APIs fiscales Colombia (DIAN) | 8 |
| EP-17 | Facturación electrónica activa CFDI 4.0 | 10 |
| EP-18 | Portal del contribuyente (self-service) | 8 |

## 7.2 Fase v3.4.0 — Ecosistema y Partners

| Épica | Alcance | HUs estimadas |
|:---|:---|---:|
| EP-19 | API pública para partners e ISVs | 10 |
| EP-20 | Marketplace de reglas PLD comunitarias | 6 |
| EP-21 | Soporte multi-idioma expandido (portugués) | 4 |
| EP-22 | Integración con ERPs contables (Contpaqi, SAP) | 8 |

## 7.3 Mejoras continuas (aplica a todas las fases)

- Optimización de rendimiento de queries RLS
- Expansión de cobertura de pruebas automatizadas (&gt;85%)
- Mejora de accesibilidad WCAG 2.1 AAA
- Dashboard de FinOps multi-cloud
