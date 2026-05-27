# Sentinel Nexus 360 Enterprise — Documentación de Arquitectura

**Versión:** 3.2.0-MASTER | **Fecha:** 2026-05-25

> **Nota de saneamiento (ADR-0010):** Esta versión incorpora las correcciones de la auditoría de coherencia documental de mayo 2026. Las HUs se han extraído a `BACKLOG-HU.md` como documento independiente.

---

## Los 6 archivos de esta carpeta

| # | Archivo | ¿Qué es? | ¿Para quién? |
|:---:|:---|:---|:---|
| 1 | **`SAD.md`** | Arquitectura completa: decisiones (20 ADRs), módulos, vistas C4, seguridad, NFRs, anexos. | Todos |
| 2 | **`SAD-Lite.md`** | Visión de negocio sin código. Regulación, escenarios, roles, UX. | C-Level, abogados, clientes |
| 3 | **`Developer-Handbook.md`** | Código de referencia: DDL, scripts RLS, PII scrubber, pipelines, module contracts. | Desarrolladores, DevOps |
| 4 | **`BACKLOG-HU.md`** | Historias de Usuario (126 HUs en 14 épicas, Golden Template, DoD, trazabilidad). | Producto, QA, Desarrollo |
| 5 | **`README.md`** | Este índice navegable. | Todos |
| 6 | **`GUIA_NOTEBOOKLM.md`** | Instrucciones para NotebookLM. | Nuevos integrantes |

---

## Cómo encontrar lo que buscas

| Si buscas... | Ve a... |
|:---|:---|
| **Decisiones de arquitectura** (ADRs) | [SAD §20](SAD.md#20-adrs-y-gobierno-de-decisiones) — 20 decisiones (ADR-0001 a ADR-0020) |
| **Módulos del sistema** y contratos | [SAD §9](SAD.md#9-descomposición-por-módulos) — 10 módulos descritos |
| **Diagramas C4** | [SAD §8](SAD.md#8-diagramas-c4-y-catálogo-visual-obligatorio) |
| **Historias de Usuario** (backlog completo) | [BACKLOG-HU.md](BACKLOG-HU.md) — 126 HUs (con Golden Template) |
| **Golden Template para escribir HUs** | [BACKLOG-HU.md §1](BACKLOG-HU.md#1-metodología-y-golden-template) |
| **Mapa de dependencias entre épicas** | [BACKLOG-HU.md §2.1](BACKLOG-HU.md#21-mapa-de-dependencias-entre-épicas) |
| **Requisitos de calidad** (NFRs) | [SAD §14](SAD.md#14-requisitos-no-funcionales-nfrs) |
| **Catálogo de eventos y logs** | [SAD §23.2](SAD.md#232-catálogo-de-eventos-y-logs) |
| **Matriz riesgo → control → evidencia** | [SAD §23.5](SAD.md#235-matriz-riesgo--control--evidencia) |
| **Runbooks de incidentes** | [SAD §23.8](SAD.md#238-runbooks-de-incidentes) |
| **Especificaciones técnicas por módulo** | [Developer Handbook §8](Developer-Handbook.md#8-module-contracts-especificaciones-por-módulo) |
| **DDL de base de datos** | [Developer Handbook §1](Developer-Handbook.md#1-esquema-físico-ddl-de-persistencia-postgresql-17) |

---

## Resumen del backlog

| Épica | Dominio | HUs |
|:---|:---|---:|
| EP-01 | Gobierno Documental y ADRs | 6 |
| EP-02 | Identidad, Sesión y 2FA | 8 |
| EP-03 | RBAC, Tenancy y Administración | 9 |
| EP-04 | Persistencia, RLS y Migraciones | 10 |
| EP-05 | Onboarding y Tax Profiles | 8 |
| EP-06 | Ingesta Belvo y Reconciliación | 9 |
| EP-07 | LENS, Parsing y Calidad CFDI | 8 |
| EP-08 | Riesgo Matemático y Versionado | 10 |
| EP-09 | PLD, OFAC/ONU/PEPs y 69-B | 10 |
| EP-10 | Alertas, Locking y SLA | 9 |
| EP-11 | Vault, NOM-151 y Exportación | 10 |
| EP-12 | AI Proxy, Contradicción y AI Audit | 12 |
| EP-13 | HUD, UX Operativa y Accesibilidad | 10 |
| EP-14 | Observabilidad, QA y DevSecOps | 7 |
| **Total** | | **126** |

Detalle completo en [BACKLOG-HU.md](BACKLOG-HU.md).

---

## Valores canónicos (v3.2.0)

| Parámetro | Valor | Decisión |
|:---|:---|:---|
| PostgreSQL | **17** + pgvector | Unificado en los 4 documentos |
| Python (Core + AI Proxy) | **3.12** | Unificado en los 4 documentos |
| Jaro-Winkler (PLD/OFAC) | umbral ≥ **0.92** | Unificado en los 4 documentos |
| Contradicción IA | descarte si confianza < **90%** | Unificado en los 4 documentos |
| Webhooks Belvo | **Bearer token + IP allowlist** (ADR-0008) | Belvo no ofrece HMAC |
| Roles RBAC | `OWNER`, `ADMIN`, `ACCOUNTANT`, `VIEWER` | Oficial de Cumplimiento = ADMIN |
| Columnas `invoices` | `invoice_hash`, `uuid` | Nombres canónicos |
| Stripe | **Excluido** (§4.2) | Pasarela de pago externa genérica |

---

## Reglas de oro

1. El **SAD.md** es la única fuente de verdad. Si algo no está ahí, no existe.
2. Los detalles de código viven en el **Developer Handbook**, no en las HUs.
3. Las HUs completas viven en **BACKLOG-HU.md**, no en el SAD.
4. Toda HU debe anclar a secciones del SAD y ADRs.
5. Prohibido tokens en localStorage — solo cookies HttpOnly.
6. Prohibido PII en logs — sin excepción (ADR-0004).
7. Toda decisión de arquitectura queda documentada como ADR — no en Slack, email o reunión.
