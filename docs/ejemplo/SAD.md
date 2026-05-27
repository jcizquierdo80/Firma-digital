# DOCUMENTO DE ARQUITECTURA DE SOFTWARE (SAD)
## Sentinel Nexus 360 Enterprise – Versión 3.2.0-MASTER
**Proactivo, Defensivo y Regulado**

---

# ÍNDICE GENERAL (TABLE OF CONTENTS)

*   [1. Portada, control documental y gobierno](#1-portada-control-documental-y-gobierno)
    *   [1.1 Identificación del documento](#11-identificación-del-documento)
    *   [1.2 Historial de cambios](#12-historial-de-cambios)
    *   [1.3 Estado de aprobación](#13-estado-de-aprobación)
    *   [1.4 Alcance documental y gobernanza](#14-alcance-documental-y-gobernanza)
*   [2. Introducción y contexto](#2-introducción-y-contexto)
    *   [2.1 Propósito del sistema](#21-propósito-del-sistema)
    *   [2.2 Problema que resuelve](#22-problema-que-resuelve)
    *   [2.3 Objetivos del sistema (KPIs y Criterios de Éxito)](#23-objetivos-del-sistema-kpis-y-criterios-de-éxito)
    *   [2.4 Audiencia del documento](#24-audiencia-del-documento)
    *   [2.5 Supuestos y restricciones iniciales](#25-supuestos-y-restricciones-iniciales)
*   [3. Visión de negocio, regulación y propuesta de valor](#3-visión-de-negocio-regulación-y-propuesta-de-valor)
    *   [3.1 Propuesta de valor](#31-propuesta-de-valor)
    *   [3.2 Segmentos objetivo](#32-segmentos-objetivo)
    *   [3.3 Casos de dolor prioritarios](#33-casos-de-dolor-prioritarios)
    *   [3.4 Drivers de negocio](#34-drivers-de-negocio)
    *   [3.5 Drivers regulatorios](#35-drivers-regulatorios)
*   [4. Alcance, límites y definición de versión](#4-alcance-límites-y-definición-de-versión)
    *   [4.1 Qué entra en v3.1.0 (Core actual)](#41-qué-entra-en-v310-core-actual)
    *   [4.2 Qué no entra en v3.1.0 (Exclusiones explícitas)](#42-qué-no-entra-en-v310-exclusiones-explícitas)
    *   [4.3 Decisiones de simplificación aceptadas](#43-decisiones-de-simplificación-aceptadas)
    *   [4.4 Riesgos de alcance y plan de control](#44-riesgos-de-alcance-y-plan-de-control)
*   [5. Stakeholders, actores y gobierno operativo](#5-stakeholders-actores-y-gobierno-operativo)
    *   [5.1 Stakeholders de negocio](#51-stakeholders-de-negocio)
    *   [5.2 Stakeholders técnicos](#52-stakeholders-técnicos)
    *   [5.3 Stakeholders regulatorios](#53-stakeholders-regulatorios)
    *   [5.4 Matriz RACI del sistema](#54-matriz-raci-del-sistema)
    *   [5.5 Gobierno de decisiones arquitectónicas y funcionales](#55-gobierno-de-decisiones-arquitectónicas-y-funcionales)
*   [6. Contexto funcional y mapa de capacidades](#6-contexto-funcional-y-mapa-de-capacidades)
    *   [6.1 Capacidades de negocio](#61-capacidades-de-negocio)
    *   [6.2 Dominios funcionales del sistema](#62-dominios-funcionales-del-sistema)
    *   [6.3 Relación capacidad → módulo → actor → KPI](#63-relación-capacidad--módulo--actor--kpi)
    *   [6.4 Dependencias y acoplamientos entre capacidades](#64-dependencias-y-acoplamientos-entre-capacidades)
*   [7. Vistas arquitectónicas (4+1)](#7-vistas-architectonicas-41)
    *   [7.1 Vista lógica](#71-vista-lógica)
    *   [7.2 Vista de desarrollo](#72-vista-de-desarrollo)
    *   [7.3 Vista de procesos (Sincronía, Asincronía, DLQ)](#73-vista-de-procesos-sincronía-asincronía-dlq)
    *   [7.4 Vista física / despliegue](#74-vista-física--despliegue)
    *   [7.5 Escenarios +1 (Flujos operacionales de extremo a extremo)](#75-escenarios-1-flujos-operacionales-de-extremo-a-extremo)
*   [8. Diagramas C4 y catálogo visual obligatorio](#8-diagramas-c4-y-catálogo-visual-obligatorio)
    *   [8.1 C4 nivel 1 – Contexto](#81-c4-nivel-1--contexto)
    *   [8.2 C4 nivel 2 – Contenedores](#82-c4-nivel-2--contenedores)
    *   [8.3 C4 nivel 3 – Componentes (FastAPI Core)](#83-c4-nivel-3--componentes-fastapi-core)
    *   [8.4 Diagramas de secuencia clave](#84-diagramas-de-secuencia-clave)
    *   [8.5 Diagrama de despliegue físico](#85-diagrama-de-despliegue-físico)
    *   [8.6 Diagrama de datos / ER conceptual ampliado](#86-diagrama-de-datos--er-conceptual-ampliado)
    *   [8.7 Diagrama de límites de confianza (Trust Boundaries)](#87-diagrama-de-límites-de-confianza-trust-boundaries)
*   [9. Descomposición por módulos](#9-descomposición-por-módulos)
    *   [9.1 Frontend SPA (React 19)](#91-frontend-spa-react-19)
    *   [9.2 BFF Node (Express 5 & Auth.js v5)](#92-bff-node-express-5--authjs-v5)
    *   [9.3 Core Fiscal (FastAPI)](#93-core-fiscal-fastapi)
    *   [9.4 Motor de Riesgo Matemático](#94-motor-de-riesgo-matemático)
    *   [9.5 Motor PLD y Listas Negras](#95-motor-pld-y-listas-negras)
    *   [9.6 AI Proxy](#96-ai-proxy)
    *   [9.7 Capa asíncrona Celery/Redis](#97-capa-asíncrona-celeryredis)
    *   [9.8 Vault / Expediente de evidencia](#98-vault--expediente-de-evidencia)
    *   [9.9 Administración y FinOps](#99-administración-y-finops)
    *   [9.10 Observabilidad y auditoría](#910-observabilidad-y-auditoría)
*   [10. Flujos críticos del sistema](#10-flujos-críticos-del-sistema)
    *   [10.1 Onboarding de un contribuyente](#101-onboarding-de-un-contribuyente)
    *   [10.2 Sincronización manual LENS](#102-sincronización-manual-lens)
    *   [10.3 Sincronización Belvo y webhooks](#103-sincronización-belvo-y-webhooks)
    *   [10.4 Deduplicación de CFDI](#104-deduplicación-de-cfdi)
    *   [10.5 Análisis mensual / por periodo](#105-análisis-mensual--por-periodo)
    *   [10.6 Screening 69-B nocturno y ETL](#106-screening-69-b-nocturno-y-etl)
    *   [10.7 Screening OFAC / ONU](#107-screening-ofac--onu)
    *   [10.8 Apertura, atención, locking y cierre de alertas](#108-apertura-atención-locking-y-cierre-de-alertas)
    *   [10.9 Construcción del expediente de evidencia](#109-construcción-del-expediente-de-evidencia)
    *   [10.10 Consulta IA, validación y contradicción](#1010-consulta-ia-validación-y-contradicción)
    *   [10.11 Modo degradado SAT caído](#1011-modo-degradado-sat-caído)
    *   [10.12 Modo degradado Belvo caído](#1012-modo-degradado-belvo-caído)
*   [11. Modelo de datos y gobierno de información](#11-modelo-de-datos-y-gobierno-de-información)
    *   [11.1 Principios de multi-tenancy](#111-principios-de-multi-tenancy)
    *   [11.2 Entidades canónicas y SQL DDL del esquema 3.1.0](#112-entidades-canónicas-y-sql-ddl-del-esquema-310)
    *   [11.3 Relaciones y cardinalidades](#113-relaciones-y-cardinalidades)
    *   [11.4 Claves, índices y constraints de rendimiento](#114-claves-índices-y-constraints-de-rendimiento)
    *   [11.5 Estrategia de particionamiento](#115-estrategia-de-particionamiento)
    *   [11.6 RLS y aislamiento real por tax_profile_id e inyección de contexto RLS](#116-rls-y-aislamiento-real-por-tax_profile_id-e-inyección-de-contexto-rls)
    *   [11.7 Políticas de retención de información](#117-políticas-de-retención-de-información)
    *   [11.8 Inmutabilidad y WORM](#118-inmutabilidad-y-worm)
    *   [11.9 Linaje y trazabilidad de datos](#119-linaje-y-trazabilidad-of-datos)
    *   [11.10 Diccionario de datos canónico ampliado](#1110-diccionario-de-datos-canónico-ampliado)
*   [12. Integraciones externas y contratos](#12-integraciones-externas-y-contratos)
    *   [12.1 Belvo (Open Finance API)](#121-belvo-open-finance-api)
    *   [12.2 SAT / DOF / listados 69-B](#122-sat--dof--listados-69-b)
    *   [12.3 Gemini / Proveedor LLM](#123-gemini--proveedor-llm)
    *   [12.4 Correo / Notificaciones](#124-correo--notificaciones)
    *   [12.5 Storage y firma / sellado criptográfico](#125-storage-y-firma--sellado-criptográfico)
*   [13. Seguridad y modelo de amenazas](#13-seguridad-y-modelo-de-amenazas)
    *   [13.1 Principios de seguridad (Zero-Trust)](#131-principios-de-seguridad-zero-trust)
    *   [13.2 Superficies de ataque identificadas](#132-superficies-de-ataque-identificadas)
    *   [13.3 STRIDE por componente](#133-stride-por-componente)
    *   [13.4 Autenticación federada](#134-autenticación-federada)
    *   [13.5 Autorización y RBAC/ABAC](#135-autorización-y-rbacabac)
    *   [13.6 Manejo de sesiones y cookies](#136-manejo-de-sesiones-y-cookies)
    *   [13.7 Seguridad API](#137-seguridad-api)
    *   [13.8 Seguridad de webhooks](#138-seguridad-de-webhooks)
    *   [13.9 Gestión de secretos (Vault)](#139-gestión-de-secretos-vault)
    *   [13.10 Cifrado en tránsito y reposo](#1310-cifrado-en-tránsito-y-reposo)
    *   [13.11 Seguridad de datos sensibles y PII (Scrubbing)](#1311-seguridad-de-datos-sensibles-y-pii-scrubbing)
    *   [13.12 Seguridad de prompts y AI proxy](#1312-seguridad-de-prompts-y-ai-proxy)
    *   [13.13 Auditoría y no repudio](#1313-auditoría-y-no-repudio)
    *   [13.14 Plan de hardening de contenedores](#1314-plan-de-hardening-de-contenedores)
*   [14. Requisitos no funcionales (NFRs)](#14-requisitos-no-funcionales-nfrs)
    *   [14.1 Rendimiento](#141-rendimiento)
    *   [14.2 Escalabilidad](#142-escalabilidad)
    *   [14.3 Disponibilidad](#143-disponibilidad)
    *   [14.4 Resiliencia](#144-resiliencia)
    *   [14.5 Seguridad](#145-seguridad)
    *   [14.6 Mantenibilidad](#146-mantenibilidad)
    *   [14.7 Observabilidad](#147-observabilidad)
    *   [14.8 Auditabilidad](#148-auditabilidad)
    *   [14.9 Cumplimiento](#149-cumplimiento)
    *   [14.10 UX operativa](#1410-ux-operativa)
*   [15. Observabilidad, soporte y operación](#15-observabilidad-soporte-y-operación)
    *   [15.1 Logging estructurado](#151-logging-estructurado)
    *   [15.2 Métricas operacionales](#152-métricas-operacionales)
    *   [15.3 Trazas distribuidas](#153-trazas-distribuidas)
    *   [15.4 Dashboards de monitoreo](#154-dashboards-de-monitoreo)
    *   [15.5 Alertas operativas](#155-alertas-operativas)
    *   [15.6 Runbooks de incidentes](#156-runbooks-de-incidentes)
    *   [15.7 SLOs / SLIs](#157-slos--slis)
    *   [15.8 Auditoría funcional](#158-auditoría-funcional)
*   [16. Arquitectura de IA y política de uso del LLM](#16-arquitectura-de-ia-y-política-de-uso-del-llm)
    *   [16.1 Objetivo de la IA en Sentinel](#161-objetivo-de-la-ia-en-sentinel)
    *   [16.2 Casos permitidos](#162-casos-permitidos)
    *   [16.3 Casos prohibidos](#163-casos-prohibidos)
    *   [16.4 Pipeline de scrubbing y minimización de contexto](#164-pipeline-de-scrubbing-y-minimización-de-contexto)
    *   [16.5 RAG jurídico/fiscal (pgvector)](#165-rag-jurídicofiscal-pgvector)
    *   [16.6 Caché semántica](#166-caché-semántica)
    *   [16.7 Fallback matemático](#167-fallback-matemático)
    *   [16.8 Detección de contradicción (Score e integridad)](#168-detección-de-contradicción-score-e-integridad)
    *   [16.9 Evaluación de calidad de inferencia](#169-evaluación-de-calidad-de-inferencia)
    *   [16.10 Trazabilidad y auditoría de IA](#1610-trazabilidad-y-auditoría-de-ia)
*   [17. Riesgo fiscal, PLD y motor de reglas](#17-riesgo-fiscal-pld-y-motor-de-reglas)
    *   [17.0 Scenario Box: Casos de Uso Críticos](#170-scenario-box-casos-de-uso-críticos-y-flujo-de-extremo-a-extremo)
    *   [17.1 Catálogo de riesgos fiscales](#171-catálogo-de-riesgos-fiscales)
    *   [17.2 Catálogo de riesgos PLD](#172-catálogo-de-riesgos-pld)
    *   [17.3 Reglas matemáticas base (HHI, IQR, Z-Score, RiskGauge)](#173-reglas-matemáticas-base-hhi-iqr-z-score-riskgauge)
    *   [17.4 Reglas de screening (Jaro-Winkler)](#174-reglas-de-screening-jaro-winkler)
    *   [17.5 Umbrales, severidades y criticidad por cliente](#175-umbrales-severidades-y-criticidad-por-cliente)
    *   [17.6 Dueños de reglas](#176-dueños-de-reglas)
    *   [17.7 Versionado de reglas](#177-versionado-de-reglas)
    *   [17.8 Proceso de cambio vía ADR](#178-proceso-de-cambio-vía-adr)
*   [18. UX, interfaz y lenguaje al usuario](#18-ux-interfaz-y-lenguaje-al-usuario)
    *   [18.1 Principios de UX (Liquid Glass)](#181-principios-de-ux-liquid-glass)
    *   [18.2 Tactical HUD / paneles principales (Heatmap y widgets)](#182-tactical-hud--paneles-principales-heatmap-y-widgets)
    *   [18.3 Estados vacíos, errores, Quick Setup y degradación](#183-estados-vacíos-errores-quick-setup-y-degradación)
    *   [18.4 Alertas y copywriting operacional](#184-alertas-y-copywriting-operacional)
    *   [18.5 Flujo de atención de alertas](#185-flujo-de-atención-de-alertas)
    *   [18.6 Evidencia, cierre de casos y preferencias de usuario](#186-evidencia-cierre-de-casos-y-preferencias-de-usuario)
    *   [18.7 Accesibilidad y usabilidad](#187-accesibilidad-y-usabilidad)
*   [19. DevSecOps, calidad y estrategia de pruebas](#19-devsecops-calidad-y-estrategia-de-pruebas)
    *   [19.1 Estrategia de ramas y PRs](#191-estrategia-de-ramas-y-prs)
    *   [19.2 CI/CD Pipeline](#192-cicd-pipeline)
    *   [19.3 Calidad de código (SonarQube)](#193-calidad-de-código-sonarqube)
    *   [19.4 Escaneo de seguridad estática (SAST y secretos)](#194-escaneo-de-seguridad-estática-sast-y-secretos)
    *   [19.5 Pruebas unitarias](#195-pruebas-unitarias)
    *   [19.6 Pruebas de integración](#196-pruebas-de-integración)
    *   [19.7 Pruebas de contrato](#197-pruebas-de-contrato)
    *   [19.8 Pruebas E2E (Cypress)](#198-pruebas-e2e-cypress)
    *   [19.9 Pruebas de carga](#199-pruebas-de-carga)
    *   [19.10 Pruebas de seguridad](#1910-pruebas-de-seguridad)
    *   [19.11 Pruebas de datos, reglas y transiciones 69-B](#1911-pruebas-de-datos-reglas-y-transiciones-69-b)
    *   [19.12 Criterios de liberación](#1912-criterios-de-liberación)
*   [20. 20 ADRs y gobierno de decisiones](#20-20-adrs-y-gobierno-de-decisiones)
    *   [20.1 Política ADR](#201-política-adr)
    *   [20.2 Índice de ADRs obligatorios iniciales](#202-índice-de-adrs-obligatorios-iniciales)
    *   [20.3 Flujo de propuesta, revisión y aceptación](#203-flujo-de-propuesta-revisión-y-aceptación)
    *   [20.4 Criterio de obsolescencia / superseded](#204-criterio-de-obsolescencia--superseded)
*   [21. Roadmap de evolución arquitectónica](#21-roadmap-de-evolución-arquitectónica)
    *   [21.1 Fase v3.1.0 (Core actual + apéndice normativo integrado)](#211-fase-v310-core-actual--apéndice-normativo-integrado)
    *   [21.2 Calendario de actualización normativa anual](#212-calendario-de-actualización-normativa-anual)
    *   [21.3 Fase Enterprise (Corporativo multiregión)](#213-fase-enterprise-corporativo-multiregión)
    *   [21.4 Criterios de activación](#214-criterios-de-activación)
    *   [21.5 Riesgos de evolución](#215-riesgos-de-evolución)
*   [22. Glosario, convenciones y referencias](#22-glosario-convenciones-y-referencias)
    *   [22.1 Glosario fiscal](#221-glosario-fiscal)
    *   [22.2 Glosario técnico](#222-glosario-técnico)
    *   [22.3 Convenciones de naming](#223-convenciones-de-naming)
    *   [22.4 Referencias normativas y técnicas](#224-referencias-normativas-y-técnicas)
*   [23. Anexos obligatorios](#23-anexos-obligatorios)
    *   [23.1 Diccionario de datos canónico ampliado](#231-diccionario-de-datos-canónico-ampliado)
    *   [23.2 Catálogo de eventos y logs](#232-catálogo-de-eventos-y-logs)
    *   [23.3 Payloads de ejemplo (Belvo, external authorize y chat IA)](#233-payloads-de-ejemplo-belvo-external-authorize-y-chat-ia)
    *   [23.4 Matriz requisito → módulo → prueba](#234-matriz-requisito--módulo--prueba)
    *   [23.5 Matriz riesgo → control → evidencia](#235-matriz-riesgo--control--evidencia)
    *   [23.6 Plantilla ADR estándar](#236-plantilla-adr-estándar)
    *   [23.7 Plantilla spec por módulo](#237-plantilla-spec-por-módulo)
    *   [23.8 Runbooks de incidentes SAT/Belvo](#238-runbooks-de-incidentes-satbelvo)
*   [24. Backlog de Producto y Épicas Técnicas (v3.2.0-MASTER — Post-Auditoría)](#24-backlog-de-producto-y-épicas-técnicas-v320-master----post-auditoría)
    *   [24.1 Estructura del Backlog de Producto](#241-estructura-del-backlog-de-producto)
    *   [24.2 Épicas de Ingeniería del Sistema](#242-épicas-de-ingeniería-del-sistema)
        *   [EP-01: Aislamiento RLS y Motor de Datos Transaccional](#ep-01-aislamiento-rls-y-motor-de-datos-transaccional)
        *   [EP-02: Identidad Corporativa y Seguridad Defensiva (Auth & 2FA)](#ep-02-identidad-corporativa-y-seguridad-defensiva-auth-2fa)
        *   [EP-03: Ingesta Resiliente (Belvo API y Carga LENS)](#ep-03-ingesta-resiliente-belvo-api-y-carga-lens)
        *   [EP-04: Motor de Riesgo Compuesto, PLD y Screening 69-B](#ep-04-motor-de-riesgo-compuesto-pld-y-screening-69-b)
        *   [EP-05: Vault e Inmutabilidad de Evidencia Legal (NOM-151)](#ep-05-vault-e-inmutabilidad-de-evidencia-legal-nom-151)
        *   [EP-06: Inteligencia Proactiva Resiliente (AI Proxy y Copiloto Fiscal)](#ep-06-inteligencia-proactiva-resiliente-ai-proxy-y-copiloto-fiscal)
        *   [EP-07: Tactical HUD y UI de Cumplimiento (Frontend Liquid Glass)](#ep-07-tactical-hud-y-ui-de-cumplimiento-frontend-liquid-glass)

---

# 1. Portada, control documental y gobierno

### 1.1 Identificación del documento
El presente **Documento de Arquitectura de Software (SAD)** define el diseño arquitectónico de **Sentinel Nexus 360 Enterprise (v3.2.0-MASTER)**. Sentinel es una plataforma de software de alta disponibilidad para la defensa fiscal activa, materialidad probatoria NOM-151, y cumplimiento normativo anti-lavado de dinero (PLD) para despachos contables y holdings corporativos de la República Mexicana.

*   **Aplicación:** Sentinel Nexus 360 Enterprise.
*   **Versión del SAD:** 3.2.0-MASTER.
*   **Fecha de Publicación:** 2026-05-20.
*   **Estado:** Aprobado para Implementación.
*   **Clasificación de Confidencialidad:** Estrictamente Confidencial – Uso Interno y de Auditoría Regulatoria.
*   **Ámbito de Aplicación:** Ecosistema completo Sentinel Nexus v3.1.0 Core (BFF, Core, Workers, DB).

### 1.2 Historial de cambios
El control de cambios del documento rector se expone a continuación:

| Versión | Fecha | Autor | Sección Afectada | Tipo de Cambio | Motivo del Cambio / Detalle |
|---|---|---|---|---|---|
| `1.0.0` | 2026-04-10 | Principal Arch. | Todo el sistema | Inicial | Creación del anteproyecto arquitectónico base de Sentinel. |
| `2.0.0` | 2026-04-26 | Consorcio Eng. | Sec. 11, 12, 20 | Integraciones | Reemplazo del motor SAT SOAP por la API de Open Finance de Belvo (V4.1.0/V5.0.0). |
| `3.0.0` | 2026-05-15 | Enterprise Arch.| Todo el SAD | Hardening | Se agregaron políticas RLS, validación estricta de webhooks, lógica de degradación local e integración externa HMAC. |
| `3.1.0` | 2026-05-20 | Enterprise Arch.| Secciones 1, 9, 10, 11, 12, 16, 17, 18, 19, 21, 23 | **UPGRADE MASTER** | Integración total del apéndice normativo avanzado: niveles de criticidad A/B/C, niveles de cobertura, tabla `fiscal_calendar`, ETL nocturno y estados de transición de listado 69-B, fórmulas detalladas de RiskGauge, Quick Setup, modelos SQL completos de usuarios y preferencias con RLS, rules_version, quality_flags de facturas y locking de alertas. |
| `3.1.1` | 2026-05-25 | Enterprise Arch.| Secciones 7, 9, 11, 16, 18, 20, 24; SAD-Lite §5, §8, §9; Handbook §5, §6 | **CORRECCIÓN POST-AUDITORÍA** | Normalización canónica (ADR-0010): PostgreSQL 17, Python 3.12, Jaro-Winkler ≥0.92, contradicción IA <90%, Belvo Bearer token, separación de backlog a BACKLOG-HU.md, corrección de 44+ referencias rotas y columnas fantasma. |
| `3.2.0` | 2026-05-25 | Enterprise Arch. | Secciones 1, 20, 24 | Expansión de ADRs y Backlog | ADR-011 a ADR-020 añadidos (10 nuevos), Backlog expandido a 126 HUs / 14 épicas, normalización completa post-auditoría. |

### 1.3 Estado de aprobación
*   **Aprobador Técnico:** CTO, Sentinel Nexus (Aprobado).
*   **Aprobador Ejecutivo:** CEO, Sentinel Enterprise (Aprobado).
*   **Oficial de Cumplimiento / Fiscal:** Especialista Fiscal Principal (Aprobado).
*   **Oficial de Seguridad Cloud:** CISO (Aprobado).

### 1.4 Alcance documental y gobernanza

Este **Master SAD (v3.2.0-MASTER)** es el mapa conceptual y la fuente única de verdad para el diseño de Sentinel Nexus 360 Enterprise. Ninguna funcionalidad, modelo de datos o integración externa entra a desarrollo sin previa cobertura en este documento.

Para mantener la integridad técnica sin sobrecargar las especificaciones, la arquitectura documental de Sentinel se organiza en un ecosistema de **3 Capas de Documentación**:

#### Matriz de Gobernanza de las 3 Capas Documentales:

| Capa Documental | Archivo | Rol Principal | Cubierta (Alcance) | No Cubre (Exclusiones) |
| :--- | :--- | :--- | :--- | :--- |
| **Capa de Dominio (Master SAD)** | [SAD.md](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/SAD.md) | Arquitectos de Software, Líderes Técnicos, Oficiales de Cumplimiento. | Decisiones conceptuales, principios de multi-tenancy y RLS, fórmulas matemáticas (RiskGauge, HHI, IQR), escenarios de negocio críticos, contratos de UX, 20 ADRs documentados, y el backlog técnico priorizado de Historias de Usuario (HUs). | **Cero DDLs físicos**, **cero código ORM**, **cero scripts de configuración**, ni detalles de infraestructura de bajo nivel. |
| **Capa de Aplicación (SAD-Lite)** | [SAD-Lite.md](SAD-Lite.md) | Analistas de Negocio, C-Level, Abogados Fiscalistas, Ingenieros de Onboarding. | Onboarding estratégico de negocio, justificación regulatoria (69-B, PLD, NOM-151), diagramas C4 conceptuales (Nivel 1 y 2), Scenario Boxes y el contrato UX/UI visual sin código. | **Cero código de programación**, **cero diagramas de componentes**, ni recetas técnicas de implementación. |
| **Capa de Infraestructura (Developer Handbook)** | [Developer-Handbook.md](Developer-Handbook.md) | Ingenieros de Software (BE/FE), DevOps / SecOps, Administradores de BD (DBAs). | Esquema DDL físico completo de PostgreSQL 17 (18 tablas), inyección de contexto RLS, interceptores SQLAlchemy y Prisma Client, middleware de tenancy, scripts del PII Scrubber y Contradiction Engine, HMAC webhook verification, pipelines CI/CD y QA suites de referencia. | Visión general del negocio, justificaciones comerciales del producto, ni control o backlog de Historias de Usuario. |

> [!IMPORTANT]
> **Política de Sincronización Estricta (No-Forking)**: 
> Toda modificación conceptual, cambio normativo, o actualización de reglas fiscales o del motor PLD debe realizarse primero en el **Master SAD (SAD.md)** y posteriormente propagarse y reflejarse en el **SAD-Lite** y en el **Developer Handbook** en la siguiente versión menor de control documental. Queda estrictamente prohibido realizar cambios técnicos ad-hoc o "forks conceptuales" de manera aislada en los documentos satélites.


---

# 2. Introducción y contexto

### 2.1 Propósito del sistema
**Sentinel Nexus 360** es un **guardián fiscal proactivo** y un vault de materialidad digital inmutable. Su propósito es consolidar en tiempo real todas las operaciones (facturación CFDI v4.0 y flujos bancarios de Open Finance) de un contribuyente, aplicando algoritmos de riesgo (IQR, HHI, Z-Score) y screening normativo automático contra listas del artículo 69-B del CFF y bases internacionales anti-lavado (OFAC/ONU), alertando preventivamente antes de que la autoridad (SAT/UIF) actúe.

### 2.2 Problema que resuelve
*   **Simulación de Operaciones (EFOS/EDOS):** La interacción con proveedores en listas negras del SAT inhabilita deducciones fiscales y tipifica delitos de defraudación si no se desvirtúa la materialidad a los 30 días.
*   **Incumplimiento de Ley LFPIORPI (Anti-Lavado):** Riesgo de multas por no controlar flujos de Actividades Vulnerables ni recabar expedientes del Beneficiario Controlador.
*   **Ausencia de Materialidad Real:** La contabilidad tradicional no prueba la existencia física de un servicio. Sentinel automatiza el expediente probatorio de defensa (contratos, fotos, entregables) blindado mediante inmutabilidad y sellos de tiempo.

### 2.3 Objetivos del sistema (KPIs y Criterios de Éxito)
*   **KPI 1:** Reducir a $0\%$ las facturas activas deducidas provenientes de proveedores EFOS clasificados de forma definitiva.
*   **KPI 2:** Tiempo de detección y alertamiento de una nueva publicación del DOF 69-B inferior a **24 horas**.
*   **KPI 3:** Mantener el aislamiento lógico de base de datos para tenants competidores con una tasa de fugas accidentales de datos del $0\%$.
*   **KPI 4:** Asegurar un costo operativo de API de IA menor a \$1.00 USD por tenant mensual, maximizando la caché de vectores y algoritmos estadísticos locales.

### 2.4 Audiencia del documento
Este documento está dirigido de manera diferenciada a directivos de producto, desarrolladores backend/data (Python FastAPI/Celery), ingenieros frontend (React SPA), especialistas fiscales/PLD, oficiales de seguridad cloud y auditores de compliance gubernamental.

### 2.5 Supuestos y restricciones iniciales
- **Conectividad:** Sentinel depende de la disponibilidad de la API de Belvo para extracción SAT/Banca. No implementa scraping local de credenciales SAT directas.
- **Monetización:** Bypass local absoluto de Stripe; Sentinel es independiente de pagos y recibe autorizaciones seguras mediante webhooks HMAC en la ruta `/internal/authorize`.
- **Aislamiento Multi-tenant:** Forzado a nivel base de datos por PostgreSQL RLS en base a claves `tenant_id` y `tax_profile_id`.

---

# 3. Visión de negocio, regulación y propuesta de valor

### 3.1 Propuesta de valor
SentinelNexus dota a los despachos contables de un **Escudo de Defensa Activa**. Convierte la contabilidad pasiva tradicional en auditoría predictiva instantánea apoyada por inteligencia artificial enmascarada y sellos NOM-151 con fuerza probatoria legal en México.

### 3.2 Segmentos objetivo
*   **Despachos Contables Medios:** 20 a 150 perfiles fiscales bajo monitoreo constante de 69-B.
*   **Holdings Corporativos / Grupos de Interés:** Holdings con volumetrías elevadas y transacciones intercompañías propensas a revisión por transferencia de precios.
*   **Actividades Vulnerables Reguladas:** Empresas inmobiliarias, constructoras, o de mutuo sujetas a la LFPIORPI.

### 3.3 Casos de dolor prioritarios
1.  **Proveedor EFOS en Staging:** Notificación y bloqueo preventivo de pagos en menos de 24 horas del cambio de estatus de un proveedor.
2.  **Operaciones Inconsistentes de Fin de Año:** El motor IQR local detecta desvíos de volumen de gasto diario mitigando la compra de facturas de último momento.
3.  **Defensa de Deducciones en Auditoría:** Generación instantánea de expediente WORM digital sellado bajo NOM-151 para desvirtuar presunciones del SAT.

### 3.4 Drivers de negocio
- Reducción del riesgo de responsabilidad penal y solidaria de socios del despacho.
- Ahorro de un $95\%$ del tiempo del personal contable dedicado a la conformación manual de materialidades.

### 3.5 Drivers regulatorios
La arquitectura de Sentinel está condicionada por los siguientes marcos regulatorios nacionales:
*   **Art. 69-B del CFF:** Dispara alertas de materialidad preventivas.
*   **Ley LFPIORPI (PLD):** Estipula el cálculo de umbrales anti-lavado en base a valores de la UMA.
*   **NOM-151-SCFI-2016:** Rige la firma de sellado de tiempo de los documentos en el Vault.
*   **Ley de Datos Personales (INAI):** Exige el enmascaramiento local estricto de PII vía el AI Proxy antes de salir a la red de Gemini.

---

# 4. Alcance, límites y definición de versión

### 4.1 Qué entra en v3.1.0 (Core actual)
*   **Ingesta Open Finance asíncrona:** Embebido del hosted widget de Belvo, flujos de reintentos y tokens MFA 428.
*   **Ingesta manual LENS:** Carga masiva en lotes ZIP de CFDIs deduplicados por hash SHA-256 local.
*   **Niveles de Prioridad y Cobertura (v3.1.0):** Clasificación de perfiles en criticidad A/B/C e impacto en SLAs y severidades; niveles de cobertura (`full`, `belvo_only`, `lens_only`, `manual_only`).
*   **Motor IQR, HHI y Z-Score:** Algoritmos estadísticos "Costo Cero" locales enriquecidos por ventanas críticas en la tabla `fiscal_calendar`.
*   **ETL de 69-B y Screening PLD:** Sincronización diaria del DOF a la tabla `sat_69b_list` y concordancia Jaro-Winkler contra bases OFAC/ONU.
*   **AI Proxy Gemini 2.5:** Chat interactivo RAG sobre legislación, enmascaramiento regex local de PII y caché semántica vectorial en Redis.
*   **Vault WORM NOM-151:** Carga e indexación de evidencias, inmutabilidad S3 y sellado de tiempo digital.
*   **Modelo de Datos Multi-sesión y Locking:** Bloqueo temporal de alertas en edición (`locked_by`, `locked_at`) y versionado de reglas analíticas.
*   **Bypass Billing HMAC:** API de subscripción externalizada `/internal/authorize`.

### 4.2 Qué no entra en v3.1.0 (Exclusiones explícitas)
*   **Timbrado de nómina o CFDI:** Sentinel no emite facturas activamente.
*   **Presentación directa ante UIF:** Notificación de alertas PLD pero sin envío directo del reporte al portal de la autoridad.
*   **Procesamiento local de tarjetas:** Exclusión absoluta de APIs de Stripe o similares.

### 4.3 Decisiones de simplificación aceptadas
- Redis 7 en rol dual como broker de mensajería asíncrona de Celery y canal Pub/Sub para notificaciones SSE en el BFF.
- Caché semántica en Redis basada en distancia de vectores coseno para respuestas de IA repetidas.

### 4.4 Riesgos de alcance y plan de control
*   **Riesgo:** Saturación de la base de datos PostgreSQL RLS por sincronización inicial de holdings históricos grandes ($>1,000,000$ facturas).
*   **Control:** Paginación de jobs Celery limitados a 10,000 registros e ingesta priorizada en base a criticidad A/B/C.

### 4.5 Declaración de alcance práctico y cobertura mínima
Sentinel define con total transparencia los compromisos técnicos adquiridos por el sistema, así como los límites legales y de responsabilidad que asume el despacho al utilizar la plataforma:

*   **Compromisos Explícitos de Sentinel:**
    *   **Screening Diario del Artículo 69-B:** Monitoreo automatizado con un SLA de detección de nuevas publicaciones en el Diario Oficial de la Federación (DOF) inferior a **24 horas**, siempre que existan datos fiscales actuales e ingesta continua en el sistema.
    *   **Historial y Evidencia de Cumplimiento:** Resguardo y conservación de alertas, bitácoras e informes de materialidad por un período mínimo de **5 años**, alineado con la NOM-151-SCFI-2016 y los estándares de cumplimiento PLD.
    *   **Cálculo de Indicadores Estadísticos:** Ejecución rigurosa de algoritmos de detección de anomalías (HHI, IQR, Z-Score) en cada cierre de periodo contable y de manera inmediata tras realizar grandes sincronizaciones de facturas.
    
*   **Límites de Responsabilidad (Exclusiones de Cobertura):**
    Sentinel **no garantiza** la defensa legal adecuada del contribuyente ni puede asegurar la atenuación de riesgos fiscales o penalidades en los siguientes escenarios:
    *   **Inexistencia de Ingesta Recurrente:** Cuando el perfil fiscal no cuenta con una integración activa y fluida de datos (es decir, cuando no se tiene conectado Belvo o no se cargan archivos ZIP mediante LENS sistemáticamente).
    *   **Desactivación de Alertas Críticas:** Cuando el usuario administrador o contador desactiva alertas del sistema categorizadas como `CRITICAL` o de naturaleza PLD.
    *   **Omisión de Alertas Emitidas:** Cuando el despacho o contribuyente ignora o deja en estado abierto alertas de nivel `CRITICAL` o de riesgo 69-B presunto/definitivo sin iniciar los flujos de materialidad en el Vault.

*   **UI Checklist de Cumplimiento Mínimo:**
    Para mitigar este riesgo, la interfaz gráfica del Tactical HUD muestra permanentemente un "Checklist de Cobertura Mínima" por cada perfil fiscal, auditando el estado de conexión de Belvo, la periodicidad de sincronización y el número de alertas críticas desatendidas.

---

# 5. Stakeholders, actores y gobierno operativo

### 5.1 Stakeholders de negocio
*   **Socios Contables del Despacho:** Exigen protección de su portafolio y automatización del DOF.
*   **CFOs de holdings corporativos:** Requieren auditoría y análisis intercompañías.

### 5.2 Stakeholders técnicos
*   **Arquitecto Enterprise:** Asegurar el aislamiento lógico, escalabilidad y mantenimiento de NFRs.
*   **Ingenieros DevSecOps:** Administración del pipeline CI/CD con gates de SonarQube y secretos en Vault.

### 5.3 Stakeholders regulatorios
*   **SAT e INFONAVIT / IMSS:** Autoridades fiscalizadoras que auditan deducciones comerciales y materialidad del contribuyente.
*   **Oficial de PLD (UIF):** Exige reportabilidad inmutable del linaje contable.

### 5.4 Matriz RACI del sistema

| Capacidad / Decisión | Arquitecto Principal | Tech Lead Backend | Tech Lead Frontend | Especialista Fiscal | DevOps / Sec |
|---|:---:|:---:|:---:|:---:|:---:|
| **Gobernanza de Umbrales PLD** | `C` | `C` | `I` | `A` / `R` | `I` |
| **Bypass de Billing externo** | `A` | `R` | `I` | `I` | `R` |
| **Hardening de RLS en DB** | `A` | `R` | `I` | `I` | `R` |
| **Validación de Webhooks Belvo**| `R` | `A` | `I` | `I` | `R` |
| **Políticas de Enmascarar PII** | `A` | `R` | `I` | `C` | `R` |

### 5.5 Gobierno de decisiones arquitectónicas y funcionales
Los cambios estructurales se coordinan mediante Architecture Decision Records (ADRs). La mesa redonda se reúne ante cambios normativos del SAT o la ley LFPIORPI para emitir un release formal del motor de reglas.

---

# 6. Contexto funcional y mapa de capacidades

### 6.1 Capacidades de negocio
Sentinel Nexus 360 se estructura en tres pilares de negocio:
1.  **Ingesta Inteligente:** Extracción transparente y dual (Belvo + LENS manual).
2.  **Motor Analítico Local:** Inferencia estadística local para detección de desvíos sin costo de tokens.
3.  **Bóveda de Defensa:** Archivo inmutable probatorio para blindar la materialidad.

### 6.2 Dominios funcionales del sistema
*   **Capa de Identidad y Borde (BFF):** Validación de sesión federada Google, roles del tenant, y seguridad.
*   **FastAPI Core Engine:** Control del motor matemático local y la base de conocimientos RAG.
*   **Workers asíncronos:** Ingesta por lotes, screening y consultas recurrentes a Belvo.

### 6.3 Relación capacidad → módulo → actor → KPI
Cada funcionalidad de Sentinel sirve a una métrica directa de negocio contable:

```
                       MAPA DE RELACIÓN DE CAPACIDADES
 ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
 │      CAPACIDAD       │   │    MÓDULO TÉCNICO    │   │      KPI META        │
 ├──────────────────────┤   ├──────────────────────┤   ├──────────────────────┤
 │ ∙ Ingesta Financiera │──>│ ∙ Belvo Ingest / Cel │──>│ ∙ Histórico < 10min  │
 │ ∙ Defensa Fiscal     │   │ ∙ Vault WORM / NOM151│   │ ∙ Integridad 100%    │
 │ ∙ Screening PLD      │   │ ∙ Jaro-Winkler Match │   │ ∙ Falsos Pos < 5%    │
 └──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

### 6.4 Dependencias y acoplamientos entre capacidades
La capacidad analítica de **RAG Legal (Nexus AI)** está acoplada al aislamiento multi-tenant: el AI Proxy no puede generar sugerencias sin contar con el contexto relacional previamente filtrado por las políticas de Row-Level Security en PostgreSQL.

---

# 7. Vistas arquitectónicas (4+1)

### 7.1 Vista lógica
El sistema implementa patrones de **Domain-Driven Design (DDD)** estructurado en micro-capas lógicas bien delimitadas:

```
+-----------------------------------------------------------------------------------+
|                            React 19 SPA (Liquid Glass)                            |
+-----------------------------------------------------------------------------------+
                                         | HTTPS / HttpOnly Session Secure Cookies
                                         v
+-----------------------------------------------------------------------------------+
|                        BFF Express 5 (Identity & Gate)                            |
|       - Auth.js v5 Validation     - CSRF/XSS Shield     - X-Project-Context       |
+-----------------------------------------------------------------------------------+
                                         | JWT Interno Autenticado + mTLS
                                         v
+-----------------------------------------------------------------------------------+
|                        FastAPI Core (Analítica e IA Proxy)                         |
|       - Risk Engine (IQR, HHI)    - Local PII Scrubber  - Connection Pooling      |
+-----------------------------------------------------------------------------------+
             | (Internal SSE Pub/Sub)                         | (RLS DB Query)
             v                                                v
+---------------------------+                   +-----------------------------------+
| Redis 7 SSE & Celery Bus  |                   | PostgreSQL 17 pgvector + RLS DB   |
+---------------------------+                   +-----------------------------------+
```

### 7.2 Vista de desarrollo
El código se organiza en un monorepo desacoplado con estricto aislamiento de responsabilidades:
*   `frontend/`: React 19 SPA (Vite)
*   `bff/`: Express 5 (Auth.js v5 y Prisma ORM)
*   `core/`: FastAPI Python (Celery Workers y Alembic)

### 7.3 Vista de procesos (Sincronía, Asincronía, DLQ)
Para evitar saturación de red o timeouts en llamadas complejas (como Belvo Sync o cargas de reportes grandes), Sentinel implementa un **Flujo Híbrido Asíncrono**:
1.  La solicitud del cliente web entra al BFF de Express.
2.  El BFF enruta al Core de FastAPI, el cual encola de forma inmediata la tarea en **Redis** y retorna un HTTP `202 Accepted` de vuelta al cliente.
3.  El **Celery Worker** procesa la tarea en background. Al finalizar, realiza un `PUBLISH` del resultado en el canal Redis Pub/Sub.
4.  El BFF de Express escucha la actualización y empuja de forma reactiva el resultado final a la SPA utilizando un flujo de **Server-Sent Events (SSE)**, evitando de esta forma el polling innecesario.
5.  Cualquier webhook o sincronización que falle más de 5 veces es redirigido de forma automática a una cola de mensajes de error **Dead-Letter Queue (DLQ)** para análisis del SRE.

### 7.4 Vista física / despliegue
El sistema se despliega en una red privada virtual (VPC) utilizando contenedores Distroless, multiplexando las conexiones de PostgreSQL mediante un proxy de conexión **PgBouncer** en modo de transacción para evitar saturación de hilos durante sincronizaciones masivas.

### 7.5 Escenarios +1 (Flujos operacionales de extremo a extremo)
*   **Escenario de Cierre Mensual:** El sistema consolida y procesa facturas acumuladas; calcula HHI/IQR y dispara eventos. La UI "Liquid Glass" actualiza el *RiskGauge* en tiempo real gracias al flujo SSE.

---

# 8. Diagramas C4 y catálogo visual obligatorio

### 8.1 C4 nivel 1 – Contexto
Define los boundaries del ecosistema y los usuarios y sistemas externos involucrados.

```mermaid
graph TD
    classDef sentinelStyle fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef actorStyle fill:#0f172a,stroke:#475569,stroke-width:1px,color:#fff;
    classDef externalStyle fill:#334155,stroke:#94a3b8,stroke-width:1px,color:#94a3b8;

    Contador([Contador / Oficial PLD]):::actorStyle -->|Audita alertas, materialidad| Sentinel[Sentinel Nexus 360 Enterprise Platform]:::sentinelStyle
    Billing([Pasarela Billing Externa]):::externalStyle -->|POST /internal/authorize con HMAC| Sentinel
    
    Sentinel -->|Autenticación Federada| GoogleOAuth[Google OAuth / Auth.js]:::externalStyle
    Sentinel -->|Extracción Fiscal SAT| BelvoAPI[Belvo Fiscal API]:::externalStyle
    Sentinel -->|Inferencia RAG Anonimizada| Gemini[Gemini 2.5 Flash Lite API]:::externalStyle
```

**Actores del contexto:**

| Actor | Tipo | Interacción principal | Tecnología |
|:---|:---:|:---|:---|
| Contador / Oficial PLD | Humano | Revisa alertas, RiskGauge, evidencia | React 19 SPA |
| Admin del Despacho | Humano | Gestiona tenants, usuarios, roles, FinOps | React 19 SPA |
| Fiscalista / Compliance | Humano | Revisa 69-B, firma umbrales PLD | React 19 SPA |
| Pasarela Billing Externa | Sistema | Autoriza/revoca suscripciones vía HMAC | POST /internal/authorize |
| Google OAuth | Sistema | Federated login empresarial | Auth.js v5 |
| Belvo Fiscal API | Sistema | Extracción SAT de CFDI, webhooks de sync | REST API |
| Gemini 2.5 Flash Lite | Sistema | IA: RAG fiscal, explicaciones, borradores | google-genai SDK |
| DOF / SAT | Sistema | Publicación de listas 69-B (EFOS/EDOS) | Descarga CSV/JSON |
| OFAC / ONU | Sistema | Listas de sanciones internacionales y PEPs | Descarga batch |
| TSA NOM-151 | Sistema | Sellado de tiempo criptográfico para evidencia | RFC 3161 |
| SRE / DevOps | Sistema | Monitoreo operativo, alertas de infraestructura | Grafana stack |

### 8.2 C4 nivel 2 – Contenedores
Muestra los contenedores lógicos que conforman la infraestructura de software de Sentinel.

```mermaid
graph TB
    classDef container fill:#1e293b,stroke:#0284c7,stroke-width:2px,color:#fff;
    classDef db fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff;

    SPA[React 19 SPA Web App]:::container -->|1. HTTPS requests / HttpOnly Cookies| BFF[BFF Express 5 Edge Container]:::container
    BFF -.->|6. SSE Updates| SPA
    
    BFF -->|2. Inyecta X-Project-Context / JWT Interno| Core[FastAPI Core Backend]:::container
    BFF -->|3. Lee/Escribe Sesiones| DB[(PostgreSQL 17 DB + RLS)]:::db
    
    Core -->|4. Encola tareas asíncronas| Redis[(Redis 7 Container)]:::db
    Redis --> Worker[Celery Worker Service]:::container
    
    Worker -->|5. Inserción en Lotes| DB
    Core -->|7. Query RAG pgvector| DB
    
    Core -->|8. HTTPS Enmascarado| AIProxy[AI Proxy / PII Scrubber]:::container
    AIProxy -->|9. Inferencia Segura| Gemini[Gemini 2.5 API]
```

**Inventario de contenedores:**

| # | Contenedor | Tecnología | Escala | Expuesto |
|:---:|:---|:---|:---|:---:|
| 1 | React 19 SPA | Vite + TypeScript + Vanilla CSS (Liquid Glass) | 1 build (CDN) | ✅ 80/443 |
| 2 | Express 5 BFF | Node.js + Auth.js v5 + Prisma | 2+ réplicas | ✅ 443 vía Kong |
| 3 | FastAPI Core | Python 3.12 + SQLAlchemy 2.0 | 3+ réplicas | ❌ VPC interna |
| 4 | AI Proxy | Python 3.12 + google-genai SDK | 2+ réplicas | ❌ VPC interna |
| 5 | PostgreSQL 17 | pgvector + uuid-ossp | 1 primario + 1 réplica | ❌ VPC interna |
| 6 | Redis 7 | Celery broker + Pub/Sub + cache | 1 + réplica | ❌ VPC interna |
| 7 | Celery Beat | Python Celery | 1 (scheduler) | ❌ VPC interna |
| 8 | Celery Worker Pool | Python Celery | 3+ workers | ❌ VPC interna |

**Comunicación entre contenedores:**

| Origen | Destino | Protocolo | Seguridad |
|:---|:---|:---|:---|
| SPA | BFF | HTTPS/TLS 1.3 | HttpOnly Cookies + SameSite=Strict |
| BFF | Core | HTTP/2 | mTLS + Internal JWT |
| BFF | PostgreSQL | TCP (Prisma) | TLS + RLS vía SET LOCAL |
| Core | AI Proxy | HTTP/2 (internal) | mTLS |
| Core | PostgreSQL | TCP (SQLAlchemy) | TLS + RLS vía SET LOCAL |
| Core/Celery | Belvo API | HTTPS | Basic Auth (Secret Manager) |
| AI Proxy | Gemini API | HTTPS | API Key (Secret Manager) + PII scrubbed |
| Celery Worker | DOF/SAT | HTTPS | Público |

### 8.3 C4 nivel 3 – Componentes (FastAPI Core)
Desglose interno de los subcomponentes de FastAPI Core.

```mermaid
graph TD
    classDef comp fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef db fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff;

    Router[FastAPI API Routers]:::comp -->|Intercepte y valide context| TenantCheck[Tenant Security & RLS Context Validator]:::comp
    TenantCheck -->|Acceso Autorizado| RiskController[Risk Engine Controller]:::comp
    TenantCheck -->|Acceso Autorizado| RAGController[RAG Legal Controller]:::comp
    
    RiskController -->|Ejecuta cálculos locales| MathCore[Math Engine: IQR, HHI, Z-Score]:::comp
    RAGController -->|Scrubbing de PII local| ScrubPipeline[PII Scrubber Pipeline]:::comp
    
    ScrubPipeline -->|Embeddings locales| Vectorizer[pgvector Embeddings Generator]:::comp
    Vectorizer -->|Busca Leyes| DB[(PostgreSQL 17 DB)]:::db
    
    MathCore -->|Guarda Resultados| DB
```

### 8.4 Diagramas de secuencia clave
Flujo de validación y screening nocturno de RFCs en segundo plano.

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Celery Beat
    participant Worker as Celery Worker
    participant SAT as SAT DOF Service
    participant DB as PostgreSQL 17
    participant BFF as Express BFF
    participant SPA as React SPA

    Cron->>Worker: Dispara "nightly_69b_screening" (02:00 AM)
    Worker->>SAT: GET Listado Oficial EFOS/EDOS
    SAT-->>Worker: CSV de Contribuyentes Listados
    Worker->>DB: SELECT DISTINCT rfc FROM tax_profiles WHERE active = true
    DB-->>Worker: RFCs Monitoreados
    Worker->>DB: UPDATE invoices SET status_69b = 'presunto' WHERE rfc_proveedor IN (...)
    Worker->>DB: INSERT INTO risk_events (severity, message) VALUES (...)
    Worker->>BFF: PUBLISH alert_event {tax_profile_id, severity: 'CRITICAL'}
    BFF-->>SPA: SSE Push: "Alerta Crítica: Proveedor en 69-B"
```

### 8.5 Diagrama de despliegue físico
Ilustra los límites de red de la VPC.

```
  DMZ (Public Subnet)                 Private Subnet (Internal Net)
┌───────────────────────┐           ┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  │  mTLS     │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │ Kong API Gateway │  │ ────────> │  │ Express 5 BFF    │  │ FastAPI Core     │  │ Redis     │  │
│  └─────────────────┘  │           │  └──────────────────┘  └──────────────────┘  └─────┬─────┘  │
└───────────────────────┘           └─────────────────────────────────────────────────────────────┘
                                                            │                          │
                                                            │ mTLS via PgBouncer       │ Celery Broker
                                                            ▼                          ▼
                                                        ┌──────────────────────┐  ┌───────────────────┐
                                                        │ PostgreSQL 17 + RLS  │  │ Celery Workers    │
                                                        └──────────────────────┘  └───────────────────┘
```

### 8.6 Diagrama de datos / ER conceptual ampliado
Diagrama entidad relación de base de datos ampliado de la versión 3.1.0-MASTER mostrando el linaje, la auditoría, perfiles con criticidad y calendarios.

```
  ┌──────────────────┐           ┌───────────────────┐           ┌──────────────────┐
  │     tenants      │           │       users       │           │  sat_69b_list    │
  ├──────────────────┤           ├───────────────────┤           ├──────────────────┤
  │ PK  tenant_id    │ 1 ──────* │ PK  user_id       │           │ PK  id           │
  │     name         │           │     email         │           │     rfc          │
  │   sub_status     │           └─────────┬─────────┘           │     status       │
  └────────┬─────────┘                     │                     └──────────────────┘
           │ 1                             │ 1
           │                               │
           │                               *
           │                     ┌───────────────────┐           ┌──────────────────┐
           │                     │   tenant_users    │           │    risk_rules    │
           │                     ├───────────────────┤           ├──────────────────┤
           │                     │ PK  tenant_id     │           │ PK  rule_id      │
           │                     │ PK  user_id       │           │     version      │
           │                     │     role          │           └──────────────────┘
           │                     └───────────────────┘
           *
  ┌──────────────────┐           ┌───────────────────┐           ┌──────────────────┐
  │   tax_profiles   │           │ user_preferences  │           │    pld_rules     │
  ├──────────────────┤           ├───────────────────┤           ├──────────────────┤
  │ PK tax_profile_id│ 1 ──────* │ PK  user_id       │           │ PK  rule_id      │
  │ FK tenant_id     │           │ FK  tenant_id     │           │     version      │
  │  criticality     │           └───────────────────┘           └──────────────────┘
  │  coverage        │
  └────────┬─────────┘
           │
           ├─────────────────────────────┬─────────────────────────────┐
           │ 1                           │ 1                           │ 1
           *                             *                             *
  ┌──────────────────┐          ┌───────────────────┐         ┌──────────────────┐
  │     invoices     │          │    risk_events    │         │    pld_checks    │
  ├──────────────────┤          ├───────────────────┤         ├──────────────────┤
  │ PK  invoice_id   │          │ PK  event_id      │         │ PK  check_id     │
  │ FK  tax_profile_id          │ FK  tax_profile_id│         │ FK  tax_profile_id
  │     quality_flag │          │     rules_version │         │     uma_amount   │
  └──────────────────┘          └─────────┬─────────┘         └──────────────────┘
                                          │ 1
                                          │
                                          *
                                ┌───────────────────┐
                                │      alerts       │
                                ├───────────────────┤
                                │ PK  alert_id      │
                                │ FK  tax_profile_id│
                                │     locked_by     │
                                │     locked_at     │
                                └───────────────────┘
```

### 8.7 Diagrama de límites de confianza (Trust Boundaries)
Define dónde cambian las asunciones de seguridad.

```
 [ Frontera Web: Untrusted ]      [ BFF Boundary: Trusted Border ]   [ Backend Core: Strictly Trusted ]
   Navegador Web / React SPA    ──>   BFF Node API Gateway         ──>   FastAPI Core Private App
                                    (JWT / HttpOnly Cookie Validation)   (Database PostgreSQL RLS Kernel)
```

---

# 9. Descomposición por módulos

### 9.1 Frontend SPA (React 19)

**Propósito:** Interfaz Liquid Glass para todos los roles del sistema. Único punto de interacción del usuario con Sentinel.

**Responsabilidades:**
- Renderizar Tactical HUD (RiskGauge, Heatmap, badges de criticidad A/B/C y cobertura).
- Consumir API del BFF vía `fetch` con `credentials: 'include'` (cookies HttpOnly).
- Recibir actualizaciones en tiempo real vía SSE (EventSource) desde el BFF.
- Implementar design system Liquid Glass (Framer Motion, cero colores hardcoded).
- Gestionar cambio de tenant (ProjectSwitcher con header `X-Project-Context`).
- Accesibilidad WCAG 2.1 AA (teclado, lectores de pantalla, roles ARIA, contraste).

**No es su responsabilidad:** Autenticar usuarios (BFF), ejecutar lógica de negocio (Core), persistir datos (DB), almacenar tokens en localStorage (prohibido).

**Dependencias:** BFF Express (único origen de datos), Framer Motion, Vite, TypeScript 5.2.

**NFRs clave:** LCP < 2.5s, Lighthouse > 90, 0 violaciones críticas en Axe DevTools.

---

### 9.2 BFF Node (Express 5 & Auth.js v5)

**Propósito:** Perímetro de seguridad y gobernanza de identidad. Único entry point desde internet.

**Responsabilidades:**
- Autenticación federada Google OAuth vía Auth.js v5.
- Emisión de cookies HttpOnly con JWT (`sentinel_jwt_session`) — flags Secure, SameSite=Strict.
- 2FA TOTP: enrolamiento (QR), verificación de código, backup codes de 8 dígitos.
- Refresh token rotation (Redis). Logout con purga de sesión.
- Inyección de `X-Project-Context` (tenant_id, tax_profile_id) hacia el Core.
- CSRF protection (SameSite cookies + token sincronizado).
- Rate limiting por endpoint (login 5/min, API 100/min).
- SSE relay: suscripción a Redis Pub/Sub y forward al frontend.
- CRUD administrativo de usuarios, roles, y preferencias.

**No es su responsabilidad:** Análisis fiscal (Core), ingesta de datos (Core + Celery), IA (AI Proxy), almacenamiento (Vault).

**Dependencias:** FastAPI Core (mTLS interno), PostgreSQL vía Prisma con RLS, Redis (sesiones, rate limiting, Pub/Sub), Auth.js v5, Google OAuth.

**NFRs clave:** Login < 1s p95; cookies HttpOnly inaccesibles por JS; refresh token rotation sin pérdida de sesión.

---

### 9.3 Core Fiscal (FastAPI)

**Propósito:** Motor transaccional y de negocio. Orquesta ingesta, riesgo, PLD, y flujos de datos.

**Responsabilidades:**
- CRUD de `tax_profiles` con validación de RFC (regex).
- Belvo: generación de widget token, recepción de webhooks (doble verificación Bearer token + IP allowlist).
- LENS: recepción de ZIP/XML, parseo inicial, encolado a Celery.
- Deduplicación de CFDI por SHA-256 en caliente.
- Validación estructural de CFDI 4.0 (schema XML, `quality_flag`).
- Inyección de contexto RLS vía SQLAlchemy `before_cursor_execute`.
- Publicación de eventos en Redis Pub/Sub para actualizar frontend vía SSE.
- Endpoint `/internal/authorize` con validación HMAC para gestión de suscripciones.

**No es su responsabilidad:** Procesamiento asíncrono (Celery Workers), IA (AI Proxy), autenticación de usuarios (BFF).

**Dependencias:** PostgreSQL (SQLAlchemy 2.0), Redis (encolado Celery + Pub/Sub), Belvo API, Celery Workers.

**NFRs clave:** Latencia API < 500ms p95; throughput 200 rps; HMAC validation < 10ms; SHA-256 dedup < 5ms.

---

### 9.4 Motor de Riesgo Matemático

**Propósito:** Análisis estadístico determinista sin dependencia de APIs externas.

**Responsabilidades:**
- Calcular HHI (concentración de clientes/proveedores): HHI > 2,500 → alerta.
- Detectar anomalías de volumen: IQR (Q1 - 1.5×IQR, Q3 + 1.5×IQR).
- Detectar anomalías de frecuencia: Z-Score > 3σ.
- Calcular RiskGauge compuesto (0-100) con pesos ponderados configurables.
- Ajustar sensibilidad según `fiscal_calendar` (ventanas de cierre +20%).
- Predecir probabilidad de auditoría SAT (base 2%, cap 80%).
- Versionar análisis con `rules_version`. Generar recomendaciones automáticas.

**No es su responsabilidad:** PLD (motor-pld), 69-B screening (Celery), IA explicativa (AI Proxy).

**Dependencias:** PostgreSQL (`invoices`, `fiscal_calendar`, `risk_events`, `risk_scores`), numpy, scikit-learn.

**NFRs clave:** Análisis < 2s por perfil (1000 facturas); batch > 100 perfiles/min; determinista (mismos inputs → mismo output).

---

### 9.5 Motor PLD y Listas Negras

**Propósito:** Cumplimiento anti-lavado (LFPIORPI) y screening de sanciones internacionales.

**Responsabilidades:**
- Clasificar operaciones como Actividades Vulnerables según catálogo LFPIORPI.
- Calcular montos acumulados en UMAs por actividad y período.
- Disparar alertas al superar umbrales de Identificación, Aviso o Conservación.
- Ejecutar matching Jaro-Winkler (umbral ≥ 0.92) contra listas OFAC, ONU y PEPs.
- Versionar reglas con `pld_rules_version`.

**No es su responsabilidad:** RiskGauge (motor-riesgo), ETL 69-B (Celery Workers), gestión de alertas (Alert Controller en Core).

**Dependencias:** PostgreSQL (`pld_checks`, `sat_69b_list`, `invoices`), Redis (caché de listas OFAC/ONU, renovación semanal).

**NFRs clave:** Jaro-Winkler < 50ms por comparación; falsos positivos < 5%; PLD check < 200ms.

---

### 9.6 AI Proxy

**Propósito:** Capa de inteligencia artificial segura. Intermediario entre Sentinel y Gemini.

**Responsabilidades:**
- Pipeline de scrubbing PII: RFC → `[RFC_ENMASCARADO]`, CURP → SHA-256, nombres → `[ENTIDAD]`, montos → rangos, correos → `[CORREO]`.
- Integración con Gemini 2.5 Flash Lite vía SDK `google-genai`.
- RAG sobre pgvector: embedding → búsqueda top-5 en `knowledge_base` → inyección de contexto legal.
- Motor de contradicción: comparar severidad IA vs matemática; descartar si discrepancia ≥2 niveles y AI confidence < 90%.
- Rate limiting por usuario (20 req/min, Redis counter).
- Auditoría completa en `ai_audit_logs` (tokens, costo, contradiction_status).

**No es su responsabilidad:** Cálculo de riesgo (motor-riesgo), PLD (motor-pld), decisiones de negocio.

**Dependencias:** Gemini API (google-genai SDK), PostgreSQL pgvector, Redis (caché semántica), Core Fiscal (contexto).

**NFRs clave:** Scrubbing < 50ms; latencia Gemini < 2s p95; costo < $1.00 USD/tenant/mes; rate limiting preciso.

---

### 9.7 Capa asíncrona Celery/Redis

**Propósito:** Procesamiento batch y tareas de larga duración fuera del ciclo request-response.

**Responsabilidades:**
- `sync_belvo_invoices`: descarga de facturas desde Belvo, mapeo a schema interno, persistencia en lotes.
- `process_lens_upload`: parseo ZIP/XML, validación estructural, deduplicación, persistencia.
- `nightly_69b_screening` (02:00 AM CST): descarga DOF, cruce RFCs, generación de alertas.
- `reconcile_belvo_syncs`: job de reconciliación diaria (04:00 AM).
- Publicar resultados en Redis Pub/Sub para SSE.
- Dead-Letter Queue: tareas con >5 reintentos van a DLQ para inspección SRE.

**No es su responsabilidad:** Exponer endpoints HTTP (Core), lógica de negocio (Core), IA (AI Proxy).

**Dependencias:** Redis (broker Celery + Pub/Sub), PostgreSQL, Belvo API, DOF/SAT.

**NFRs clave:** Job pickup < 500ms; Belvo sync < 5 min (1000 facturas); 69-B ETL < 10 min; reintentos máx. 5 con backoff exponencial.

---

### 9.8 Vault / Expediente de evidencia

**Propósito:** Repositorio inmutable de evidencia con fuerza probatoria legal (NOM-151).

**Responsabilidades:**
- Crear casos de evidencia vinculados a alertas o perfiles fiscales.
- Recibir documentos (PDF, JPG, PNG, WEBP, ZIP, XML) con límite 50MB.
- Almacenar en S3 con Object Lock en modo Compliance (WORM, mínimo 5 años).
- Solicitar sello NOM-151 a TSA externa (RFC 3161) automáticamente al subir.
- Exportar expediente completo (documentos + sellos .tsr + cadena de custodia + manifiesto SHA-256).
- Aplicar políticas de retención y borrado controlado con doble firma (>5 años).
- Triggers PostgreSQL bloquean UPDATE/DELETE en `vault_files` (incluyendo la columna `nom151_sealed`).

**No es su responsabilidad:** Generar alertas, validar contenido de documentos, emitir certificados NOM-151.

**Dependencias:** S3 (Object Lock Compliance), TSA NOM-151 externa, PostgreSQL.

**NFRs clave:** Sello NOM-151 < 2s por documento; retención mínima 5 años; WORM enforcement 100%.

---

### 9.9 Administración y FinOps

**Propósito:** Gestión operativa del tenant y control de costos de APIs externas.

**Responsabilidades:**
- CRUD de usuarios del tenant con RBAC (OWNER, ADMIN, ACCOUNTANT, VIEWER).
- Invitación/desactivación de usuarios (soft delete con `disabled_at`).
- Configuración de parámetros: `max_belvo_syncs_per_day`, `default_coverage_level`, `default_criticality`.
- Dashboard FinOps: consumo Belvo (requests/mes), consumo Gemini (tokens/costo USD).
- Validación HMAC del endpoint `/internal/authorize` (suscripciones).
- Rate limiting administrativo: 30 req/min por usuario.

**No es su responsabilidad:** Autenticación (BFF), procesamiento de pagos (sistema externo).

**Dependencias:** PostgreSQL (`tenants`, `users`, `tenant_users`, `audit_logs`), Redis (rate limiting).

**NFRs clave:** Operaciones admin < 200ms; FinOps dashboard < 5s; HMAC validation timing-safe.

---

### 9.10 Observabilidad y auditoría

**Propósito:** Trazabilidad, monitoreo y auditoría transversal de todo el sistema.

**Responsabilidades:**
- Instrumentar todos los endpoints HTTP con spans OpenTelemetry.
- Instrumentar llamadas a servicios externos (Belvo, Gemini, TSA) con timeouts y traces.
- Emitir logs estructurados JSON (nunca PII — ADR-0004).
- Exportar métricas a Prometheus (latencia, throughput, error rate, DB pool).
- Proveer dashboards Grafana: por módulo y ejecutivo.
- Configurar alertas SRE: Belvo caído (>60s), DB pool > 80%, error rate > 1%, DLQ acumulada.
- Garantizar inmutabilidad de `audit_logs` mediante triggers WORM.
- Retención diferenciada: `audit_logs` 5 años, `ai_audit_logs` 2 años, `webhook_events` 1 año, app logs 90 días.

**No es su responsabilidad:** Alertas de negocio (motor-riesgo/motor-pld), visualización de datos (frontend).

**Dependencias:** OpenTelemetry Collector, Prometheus, Grafana, PostgreSQL.

**NFRs clave:** Trace sampling 100% errores, 10% normal; log ingestion < 100ms; health check cada 30s.

---

# 10. Flujos críticos del sistema

### 10.1 Onboarding de un contribuyente
El usuario registra un RFC. El core inicializa `tax_profiles` con default `criticality_level = 'C'` y `coverage_level = 'manual_only'`, permitiendo el Quick Setup.

### 10.2 Sincronización manual LENS
El usuario carga un ZIP de XMLs. El Celery Worker desempaqueta las facturas, ejecuta las validaciones estructurales de calidad y las inserta.
```python
def validate_cfdi_quality(xml_content: str) -> dict:
    """
    Analiza la estructura del CFDI 4.0. Si detecta datos corruptos
    o inconsistencias de RFC, marca la factura como sospechosa.
    """
    if "UUID" not in xml_content or "rfc" not in xml_content:
        return {"flag": "invalid_structure", "notes": "Missing crucial fields"}
    # Lógica de RFC dummy o inválido
    if "RFC010101000" in xml_content:
         return {"flag": "suspicious", "notes": "Generic test RFC used in productionCFDI"}
    return {"flag": "valid", "notes": {}}
```

### 10.3 Sincronización Belvo y webhooks
El Hosted Widget de Belvo retorna un `link_id`. Belvo realiza la extracción asíncrona del histórico del SAT y notifica disponibilidad mediante webhooks con autenticación Bearer token procesados por el middleware del BFF Express (ADR-0008).

### 10.4 Deduplicación de CFDI
La tabla `invoices` tiene un UNIQUE constraint sobre el campo `invoice_hash`. Cualquier inserción colisionada ejecuta un `ON CONFLICT DO NOTHING`, evitando dobles deducciones.

### 10.5 Análisis mensual / por periodo
El motor matemático local se ejecuta automáticamente sobre la base de datos relacional filtrando por periodos y evaluando la incidencia de ventanas críticas de la tabla `fiscal_calendar` para escalar la severidad.

### 10.6 Screening 69-B nocturno y ETL
Celery Beat dispara diariamente a las 02:00 AM CST el ETL de actualización del listado de empresas con operaciones simuladas (Art. 69-B CFF). El flujo se desglosa en las siguientes etapas críticas:

1.  **`download_69b_list` (Celery Task 1):**
    *   Establece una conexión HTTPS segura con el portal de datos abiertos del SAT o el DOF.
    *   Descarga el archivo estructurado (CSV/XML) de contribuyentes catalogados (presuntos, definitivos y desvirtuados).
    *   Valida la integridad del archivo (formato y tamaño mínimo esperado $> 2$ MB) para prevenir truncamiento accidental de datos.
2.  **`load_69b_into_db` (Celery Task 2):**
    *   Determina la versión del ETL incrementando el último contador en la base de datos (`version_id = último + 1`).
    *   Inserta o actualiza en lotes (Bulk Upsert de 1,000 registros) a los contribuyentes en la tabla `sat_69b_list`.
    *   Registra en la tabla inmutable `audit_logs` la acción `69B_LIST_UPDATE` con el detalle: `{"version_id": X, "new_count": Y, "updated_count": Z}`.
3.  **Transición de Presuntos / Definitivos:**
    *   **Transición a Presunto:**
        *   Si un proveedor asociado a una o más facturas del tenant es catalogado como `presunto` en `sat_69b_list`:
        *   Para cada `tax_profile` expuesto, se genera automáticamente una alerta de nivel `HIGH` con el tipo `69B_PRESUNTO`.
        *   Se actualiza visualmente el estado del proveedor en el Tactical HUD marcándolo con el tag *"En presunto EFOS"*.
    *   **Transición a Definitivo:**
        *   Si un proveedor transiciona de `presunto` a `definitivo` o es publicado directamente en dicha categoría:
        *   Se ejecuta un barrido en lote actualizando `invoices.status_69b = 'definitivo'` para todas las facturas emitidas históricamente por dicho RFC.
        *   Se genera de manera mandatoria una alerta de nivel `CRITICAL` `69B_DEFINITIVO` por cada perfil fiscal impactado.
        *   Se dispara automáticamente el **Flujo de Materialidad Defensiva** en el Vault, abriendo un expediente con un checklist obligatorio de soporte probatorio:
            1.  `[ ]` Contrato de prestación de servicios debidamente firmado.
            2.  `[ ]` Entregables, reportes de servicio y documentación técnica.
            3.  `[ ]` Evidencia física (fotografías geolocalizadas, bitácoras de obra).
            4.  `[ ]` Comprobantes de flujo financiero (estados de cuenta con transferencias coincidentes).
            5.  `[ ]` Co-firma de validación gerencial (Owner/Admin).

### 10.7 Screening OFAC / ONU
La base de datos de Beneficiarios Controladores es escaneada usando la similitud Jaro-Winkler contra bases de sanciones del tesoro internacional.

### 10.8 Apertura, atención, locking y cierre de alertas
Sentinel implementa **Alert Locking** para prevenir la colisión de múltiples contadores operando de manera simultánea sobre el mismo expediente de alerta:
*   Al entrar a la vista de edición o atención de una alerta, el backend registra `locked_by = user_id` y `locked_at = NOW()`.
*   Si `locked_at` es menor a 30 minutos, la interfaz gráfica de otros usuarios muestra una advertencia destacada: *"Alerta bloqueada por el Contador [Nombre] desde las [Hora]"* y deshabilita temporalmente cualquier botón de guardado o cambio de estado.
*   **Manejo de Expiración:** El lock expira automáticamente si `locked_at` supera los 30 minutos. El backend calcula dinámicamente la validez del bloqueo comparando el tiempo actual contra `locked_at + INTERVAL '30 minutes'`.
*   **Bitácora de Auditoría:** Toda adquisición, liberación o expiración de un bloqueo en las alertas se registra de forma obligatoria en la tabla `audit_logs` bajo la acción `ALERT_LOCK_ACQUIRED` o `ALERT_LOCK_RELEASED` incluyendo el ID de usuario y el identificador de la alerta.

### 10.9 Construcción del expediente de evidencia
Carga de archivos PDF y XML de soporte en AWS S3 inmutable, generando firmas de sellado de tiempo y registros en `vault_files`.

### 10.10 Consulta IA, validación y contradicción
Nexus AI interactúa con Gemini forzando Strict JSON Mode. El AI Proxy implementa la **Regla de Contradicción Técnica** a nivel de aplicación para anular inferencias si se detectan divergencias atípicas entre el modelo y el motor matemático duro:
* Si el nivel de riesgo sugerido por la IA difiere en $\ge 2$ escalones del nivel matemático local y la confianza de inferencia es inferior al $90\%$, el sistema ejecuta el descarte preventivo automático del diagnóstico de la IA, reportando exclusivamente la métrica dura del Core Python.
* El algoritmo de validación y contradicción detallado se encuentra documentado en el [Developer Handbook §4.2 (Motor de Contradicción)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#42-motor-de-contradicción-técnica-evaluate_ai_contradiction).

### 10.11 Modo degradado SAT caído
Si los endpoints del SAT fallan o Belvo reporta contingencia, Sentinel entra en **Modo Degradado Local (SAT Offline)**. El frontend deshabilita la sincronización y muestra un banner informando la fecha del último estado fresco conocido. El sistema permanece operativo para consultas RAG y análisis históricos locales.

### 10.12 Modo degradado Belvo caído
Si Belvo se encuentra caído por mantenimiento, el sistema activa el **Modo Contingencia LENS**: desvía temporalmente al usuario a realizar cargas manuales a través de la ingesta de archivos ZIP de XMLs directamente, manteniendo el flujo del negocio sin interrupción contable.

---

# 11. Modelo de datos y gobierno de información

### 11.1 Principios de multi-tenancy
El aislamiento multi-tenant se implementa a nivel del kernel de la base de datos **PostgreSQL 17** mediante políticas de **Row-Level Security (RLS)**. Esto garantiza que un usuario de un Despacho A nunca pueda visualizar información fiscal del Despacho B, incluso ante fallas de codificación a nivel de la capa de aplicación.

### 11.2 Entidades canónicas y SQL DDL del esquema 3.1.0

> **Nota:** El DDL completo (18 tablas con constraints, índices, triggers WORM y políticas RLS) se encuentra en el [Developer Handbook §1](Developer-Handbook.md#1-esquema-físico-ddl-de-persistencia-postgresql-17). A continuación se muestran las entidades ampliadas con su semántica documental.

-- 14. Vault de archivos inmutables (WORM con NOM-151)
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

-- 15. Tabla inmutable de logs de auditoría (Caja Negra)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar Row Level Security en todas las tablas operativas
ALTER TABLE tax_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE alerts FORCE ROW LEVEL SECURITY;
ALTER TABLE vault_files FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE fiscal_calendar FORCE ROW LEVEL SECURITY;
ALTER TABLE tenant_users FORCE ROW LEVEL SECURITY;
ALTER TABLE user_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE pld_checks FORCE ROW LEVEL SECURITY;
ALTER TABLE risk_events FORCE ROW LEVEL SECURITY;

-- Crear políticas RLS basadas en la variable de sesión 'app.current_tenant_id'
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

### 11.3 Relaciones y cardinalidades
*   `tenants` (1) $\longleftrightarrow$ `tenant_users` ($N$)
*   `users` (1) $\longleftrightarrow$ `tenant_users` ($N$)
*   `tenants` (1) $\longleftrightarrow$ `tax_profiles` ($N$)
*   `tax_profiles` (1) $\longleftrightarrow$ `invoices` ($N$)
*   `tax_profiles` (1) $\longleftrightarrow$ `alerts` ($N$)
*   `alerts` (1) $\longleftrightarrow$ `vault_files` ($N$)
*   `tax_profiles` (1) $\longleftrightarrow$ `pld_checks` ($N$)
*   `tax_profiles` (1) $\longleftrightarrow$ `risk_events` ($N$)

### 11.4 Claves, índices y constraints de rendimiento
Se agregan índices B-Tree para optimizar consultas de screening y locks:
*   `CREATE INDEX idx_invoices_quality ON invoices(tax_profile_id, quality_flag);`
*   `CREATE INDEX idx_alerts_lock ON alerts(locked_by, locked_at) WHERE locked_by IS NOT NULL;`
*   `CREATE INDEX idx_pld_checks_profile ON pld_checks(tax_profile_id, activity_type);`
*   `CREATE INDEX idx_risk_events_metrics ON risk_events(tax_profile_id, metric_name);`

### 11.5 Estrategia de particionamiento
La tabla `invoices` está particionada por rangos basados en la fecha de emisión `created_at` para asegurar la escalabilidad del sistema.

### 11.6 RLS y aislamiento real por tax_profile_id e inyección de contexto RLS

El aislamiento multi-tenant en Sentinel se delega de forma estricta al motor de base de datos PostgreSQL mediante **Row-Level Security (RLS)**. Esto elimina el riesgo de fuga de datos ("tenant bleeding") causado por errores humanos u omisiones accidentales de filtros `WHERE` en las capas del ORM (tanto en FastAPI como en el BFF de Express).

> [!IMPORTANT]
> **El Paradigma de Seguridad Pasiva**: RLS actúa como una red de seguridad de infraestructura. Si un desarrollador escribe una consulta de selección o actualización sin filtrar por tenant, PostgreSQL intercepta la operación a nivel de kernel de base de datos y filtra los registros de forma invisible basándose exclusivamente en el contexto seguro inyectado.

---

#### 11.6.1 Ciclo de Vida de Variables de Transacción: `SET LOCAL` vs `SET` y el Peligro de PgBouncer

En Sentinel Enterprise, se implementa **PgBouncer** como multiplexor de conexiones de base de datos operando en modo **Transaction Pooling**. Esto introduce una restricción crítica en la gestión de variables de estado de sesión:

1. **El Problema con `SET` (Scope de Sesión)**:
   * Si ejecutamos `SET app.current_tenant_id = 'tenant-uuid-1';`, la variable persiste en la conexión física de PostgreSQL hasta que la sesión sea cerrada explícitamente.
   * En Transaction Pooling, una vez que termina una transacción, PgBouncer devuelve esa conexión física al pool y puede reasignarla inmediatamente a otro request que pertenezca a un **Tenant diferente** (por ejemplo, Tenant 2).
   * Si el nuevo request no redefine la variable, PostgreSQL ejecutará consultas para el Tenant 2 utilizando el `tenant-uuid-1` persistido en la conexión física. Esto resulta en una fuga masiva y catastrófica de información entre competidores.

2. **La Solución Mandatoria con `SET LOCAL` (Scope de Transacción)**:
   * Al utilizar `SET LOCAL app.current_tenant_id = 'tenant-uuid-1';` dentro de un bloque transaccional (`BEGIN ... COMMIT/ROLLBACK`), PostgreSQL limita el alcance de la variable al ciclo de vida exclusivo de la transacción actual.
   * En el instante en que la transacción realiza un `COMMIT` o `ROLLBACK`, PostgreSQL limpia y destruye la variable automáticamente.
   * Cuando PgBouncer recupera la conexión física del pool para el siguiente request, la variable `app.current_tenant_id` ya no existe, garantizando un aislamiento del 100% y neutralizando el efecto de contaminación del pool.

```mermaid
sequenceDiagram
    autonumber
    participant App as Aplicación (FastAPI/BFF)
    participant Bouncer as PgBouncer (Transaction Pool)
    participant DB as PostgreSQL Core
    
    App->>Bouncer: Checkout Conexión (Inicia Transacción)
    Bouncer->>DB: Asigna Conexión Física (ID: 42)
    App->>DB: BEGIN TRANSACTION;
    Note over App,DB: Paso Crítico: Inyección Inmediata de Contexto
    App->>DB: SET LOCAL app.current_tenant_id = 'tenant-A';
    App->>DB: SELECT * FROM tax_profiles;
    Note over DB: RLS Intercepta usando tenant-A
    DB-->>App: Retorna solo perfiles del Tenant A
    App->>DB: COMMIT;
    Note over DB: PostgreSQL purga automáticamente app.current_tenant_id
    Bouncer->>App: Libera Conexión Física (ID: 42 al Pool)
    
    Note over App,Bouncer: Siguiente petición de otro Tenant (Tenant B)
    App->>Bouncer: Checkout Conexión
    Bouncer->>DB: Asigna misma Conexión Física (ID: 42)
    App->>DB: BEGIN TRANSACTION;
    Note over DB: Conexión limpia. app.current_tenant_id es NULL
    App->>DB: SELECT * FROM tax_profiles;
    Note over DB: RLS deniega acceso (Retorna 0 registros)
```

> [!WARNING]
> **Parámetros no Inicializados**: En las políticas RLS especificadas en la [Sección 11.2](#112-entidades-canónicas-y-sql-ddl-del-esquema-310), se utiliza la función `current_setting('app.current_tenant_id', true)`. El segundo argumento `true` es de carácter obligatorio. Evita que PostgreSQL lance un error de ejecución en caso de que la variable no esté definida en la transacción actual, devolviendo en su lugar un valor `NULL` seguro que bloquea todo acceso.

---

#### 11.6.2 Inyección Automática de Contexto en ORMs

Para que las políticas RLS de PostgreSQL actúen de manera transparente e invisible para el equipo de desarrollo, la aplicación implementa interceptores automáticos de transacciones en ambas capas operativas del backend:

1. **FastAPI Core (SQLAlchemy 2.0)**:
   Se utiliza una `ContextVar` asíncrona segura para coroutines y multihilo para resguardar el `tenant_id` del usuario autenticado en cada petición. Mediante interceptores de eventos en el ciclo de vida de la base de datos (event listeners `after_transaction_create` y `before_cursor_execute` de una sola ejecución), SQLAlchemy inyecta atómicamente la sentencia SQL `SET LOCAL app.current_tenant_id = :tenant_id` al abrir cada transacción física.
   * La receta técnica detallada y obligatoria se encuentra en el [Developer Handbook §2 (SQLAlchemy RLS Injector)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#2-inyección-de-rls-en-sqlalchemy-20-fastapi-core-python).

2. **Express BFF (Prisma Client Extension)**:
   Dado que Prisma no soporta variables de sesión nativas en consultas de alto nivel, se implementa una **Prisma Client Extension** en conjunción con **AsyncLocalStorage** de Node.js. Esto intercepta todas las operaciones (`$allOperations`) de la base de datos y las envuelve en transacciones interactivas de corta duración que inyectan el contexto del tenant de forma garantizada y atómica.
   * La receta técnica detallada y obligatoria se encuentra en el [Developer Handbook §3 (Prisma RLS Extension)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#3-nodejs-prisma-extension--asynclocalstorage-express-bff).

#### 11.6.3 Flujo de Control y Gestión de Errores de Transacción

1. **Aislamiento a Nivel Transaccional Estricto**: 
   Cualquier operación de lectura o escritura en tablas protegidas bajo RLS **debe** realizarse de manera obligatoria dentro del contexto de una transacción explícita (`BEGIN ... COMMIT`).
2. **Mitigación de Timeouts y Restablecimiento Limpio**:
   El BFF y el Core fijan un límite estricto de timeout transaccional de **5 segundos**. Si una transacción se excede o falla, se ejecuta automáticamente un `ROLLBACK`. Al desechar la transacción, PostgreSQL purga la variable local de conexión, previniendo la fuga de datos (*tenant bleeding*) al retornar la conexión al pool compartido de PgBouncer.
3. **Bypass Fail-Safe por Defecto**:
   Si un desarrollador realiza una consulta directa de base de datos sin inicializar la variable `app.current_tenant_id`, PostgreSQL no arroja un error sintáctico, sino que devuelve de forma proactiva `0` filas, denegando el acceso por default y garantizando la seguridad pasiva de la plataforma.


### 11.7 Políticas de retención de información
Los datos fiscales y comprobantes XML se retienen de forma mandatoria por un período estricto de **5 años** en cumplimiento de regulaciones mexicanas.

### 11.8 Inmutabilidad y WORM
Se prohíbe el `DELETE` físico en la tabla `invoices` y `audit_logs`. Los archivos en S3 se configuran con retención de objetos estricta (WORM), de forma que ni el propio usuario o un atacante con credenciales de base de datos comprometidas pueda borrar la materialidad probatoria de años anteriores.

### 11.9 Linaje y trazabilidad de datos
Cada cálculo de alertas se vincula en cascada (`alert_id` $\rightarrow$ `vault_files` $\rightarrow$ `audit_logs`), permitiendo a un auditor reconstruir paso a paso la cadena de custodia y los criterios de desvirtuación.

### 11.10 Diccionario de datos canónico ampliado
Vea el [Anexo 23.1](#231-diccionario-de-datos-canónico-ampliado) para el desglose detallado de tipos, llaves y enumerados.

---

# 12. Integraciones externas y contratos

### 12.1 Belvo (Open Finance API)
Sentinel se conecta de forma directa a Belvo para la extracción histórica y recurrente de datos fiscales. El widget hosted de Belvo captura las credenciales SAT de forma encriptada, guardando únicamente el `belvo_link_id` inmutable en base de datos.
*   **Webhook Security Verification (Bearer Token):** El BFF Node.js valida de forma mandatoria el Bearer token del webhook, la IP de origen contra allowlist y la deduplicación por `event_id`; según ADR-0008, Belvo no ofrece firmas HMAC.

    *   La receta técnica detallada de este middleware se encuentra en el [Developer Handbook §5.1 (Verificador de Webhook con Bearer Token)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#51-verificador-de-webhook-con-bearer-token).

### 12.2 SAT / DOF / listados 69-B
*   **Contrato:** Recuperación del listado de RFCs catalogados en el 69-B del CFF.
*   **Formato:** CSV oficial SAT.
*   **Frecuencia:** Batch nocturno asíncrono diario (02:00 AM CST) vía Celery Beat.
*   **Fallback:** Uso de copia cached del catálogo local no mayor a 48 horas ante indisponibilidad del SAT.

### 12.3 Gemini / Proveedor LLM
*   **Contrato:** Google GenAI SDK v2.5 (`google-genai`).
*   **AI Proxy & PII Scrubbing:** Anonimización local obligatoria de RFCs, CURPs, Nombres, y Emails antes del envío a la API externa de Google.

    *   La lógica y expresión regular de anonimización local se detalla en el [Developer Handbook §4.1 (Enmascarador Local de PII)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#41-enmascarador-local-de-pii-scrub_pii).

### 12.4 Correo / Notificaciones
*   **Contrato:** Integración de envío transaccional SMTP seguro con SPF y DKIM habilitados de forma obligatoria.
*   **Uso:** Envío de reportes ejecutivos semanales de alertas y confirmaciones de desvirtuación.

### 12.5 Storage y firma / sellado criptográfico
*   **Storage:** AWS S3 configurado con Object Lock.
*   **Sellado de Tiempo NOM-151:** Integración asíncrona con PSC acreditado en México para estampar sellos de inmutabilidad digital en PDFs y XMLs de auditoría.

---

# 13. Seguridad y modelo de amenazas

### 13.1 Principios de seguridad (Zero-Trust)
Sentinel asume que la red privada interna puede ser comprometida. Por ende, toda comunicación este-oeste (entre BFF y Core) está cifrada con mTLS, y requiere tokens JWT firmados criptográficamente que inyectan el contexto del tenant en cada consulta.

### 13.2 Superficies de ataque identificadas
- API pública del BFF Node.js.
- Webhook expuesto de Belvo.
- Ruta secreta `/internal/authorize` para bypass de cobro.
- Conexión de API externa hacia la nube de Google Gemini.

### 13.3 STRIDE por componente

| Componente | Amenaza | Mitigación |
|---|---|---|
| **BFF API Gateway** | **S**poofing | Validación JWT en HttpOnly Cookies con SameSite=Strict. |
| **BFF Webhooks** | **T**ampering | Verificación Bearer token, allowlist de IPs y deduplicación por event_id (ADR-0008). |
| **FastAPI Core** | **I**nformation Disclosure | Row-Level Security (RLS) forzado en PostgreSQL a nivel de kernel. |
| **FastAPI Core** | **R**epudiation | Tabla inmutable `audit_logs` trazada por request_id sin permisos de edición/borrado. |
| **Celery Workers** | **D**enial of Service | Rate Limiting estricto por tenant con Redis-based rate limiting de 10 syncs Belvo mensuales. |
| **Gemini AI SDK** | **E**levation of Privilege | AI Proxy local para enmascaramiento PII y caché semántica restringida por tenant. |

### 13.4 Autenticación federada
Delegada a Google OAuth 2.0 mediante Auth.js v5. Cero contraseñas de usuario final se almacenan en las bases de datos de Sentinel.

### 13.5 Autorización y RBAC/ABAC
Matriz de permisos estricta validada por middleware del BFF en cada llamada:
*   `owner`: Control total del tenant, bypass de cuotas y desvirtuación con co-firma.
*   `admin`: Acceso administrativo. Puede invitar usuarios, configurar umbrales, y actuar como Oficial de Cumplimiento.
*   `accountant`: Operación diaria, carga manual LENS, adjuntar evidencias.
*   `viewer`: Acceso solo-lectura al Tactical HUD, sin capacidad de mutar estados.

### 13.6 Manejo de sesiones y cookies
Sesiones resguardadas mediante cookies con las banderas `HttpOnly; Secure; SameSite=Strict`. Los tokens tienen un tiempo de expiración corto de 15 minutos, requiriendo silent rotation mediante Refresh Tokens resguardados.

### 13.7 Seguridad API
Hardening del FastAPI core: deshabilitada la documentación interactiva Swagger (`docs_url=None`) en ambientes de producción para evitar la exposición de la estructura analítica interna.

### 13.8 Seguridad de webhooks
Doble validación criptográfica y de IP de origen detallada en la [Sección 12.1](#121-belvo-open-finance-api).

### 13.9 Gestión de secretos (Vault)
Las API keys de Belvo y Gemini se leen del Secrets Manager de infraestructura en tiempo de arranque. Cero archivos `.env` o credenciales quemadas se suben al control de versiones.

### 13.10 Cifrado en tránsito y reposo
*   **Tránsito:** HTTPS forzado con TLS 1.3. mTLS para comunicación este-oeste.
*   **Reposo:** Cifrado AES-256 en base de datos PostgreSQL y AWS S3 Bucket.

### 13.11 Seguridad de datos sensibles y PII (Scrubbing)
Filtro regex local de PII detallado en la [Sección 12.3](#123-gemini-proveedor-llm).

### 13.12 Seguridad de prompts y AI proxy
Prevención de ataques de inyección de prompts mediante la validación estricta del output de Gemini contra el esquema JSON forzado en el AI Proxy.

### 13.13 Auditoría y no repudio
Linaje e inmutabilidad garantizados por el sellado digital de firmas criptográficas en `audit_logs` y sellos NOM-151.

### 13.14 Plan de hardening de contenedores
Construcción de imágenes a partir de bases **Distroless** (sin bash, sin herramientas del sistema como curl/wget), minimizando drásticamente la superficie de ataque ante ejecución remota de código (RCE).

---

# 14. Requisitos no funcionales (NFRs)

### 14.1 Rendimiento
*   **SLI:** Tiempo de respuesta del TacticalHUD. *SLO: p95 < 1.5s para perfiles con 10,000 facturas.*
*   **SLI:** Tiempo de procesamiento ZIP LENS (500 facturas). *SLO: < 10 segundos.*

### 14.2 Escalabilidad
Soportar el escalado horizontal automático del FastAPI Core y Celery Workers mediante HPA de Kubernetes ante incrementos súbitos de carga en días de cierre mensual.

### 14.3 Disponibilidad
SLA operativo del **$99.9\%$** anual mediante despliegue multizona y base de datos con replicación activa redundante.

### 14.4 Resiliencia
Timeout estricto de 10 segundos para llamadas externas (Belvo/Gemini) integrado con patrones **Circuit Breaker** para evitar agotamiento del pool de conexiones.

### 14.5 Seguridad
Cumplimiento estricto del estándar OWASP Top 10. Escaneo automático libre de fallas críticas en SonarQube antes del despliegue en producción.

### 14.6 Mantenibilidad
Mantenimiento de una calificación de "Maintainability" de **Grado A** en SonarQube, requiriendo cobertura de pruebas unitarias $> 75\%$.

### 14.7 Observabilidad
Trazabilidad de extremo a extremo inyectando cabeceras `request_id` en Express, FastAPI, Celery y base de datos relacional.

### 14.8 Auditabilidad
Registro inmutable del $100\%$ de las mutaciones del sistema con retención rígida de 5 años.

### 14.9 Cumplimiento
Conformidad legal con las regulaciones mexicanas vigentes: Código Fiscal de la Federación (Art. 69-B), Ley anti-lavado (LFPIORPI) y NOM-151.

### 14.10 UX operativa
Optimización para mantener una puntuación superior a **90/100** en Google Lighthouse, LCP $< 2.5$ segundos y CLS $< 0.1$.

---

# 15. Observabilidad, soporte y operación

### 15.1 Logging estructurado
Logs emitidos exclusivamente a stdout en formato JSON estructurado inyectando `request_id` para correlación distribuida.

### 15.2 Métricas operacionales
Instrumentación con Prometheus exponiendo métricas clave:
*   `belvo_sync_duration_seconds`: Latencia de sincronización.
*   `gemini_tokens_consumed_total`: Consumo de tokens de IA por tenant.
*   `rls_violations_total`: Contabilización de intentos fallidos de bypass RLS.

### 15.3 Trazas distribuidas
Implementación de trazas distribuidas utilizando OpenTelemetry para diagnosticar cuellos de botella en tareas de Celery.

### 15.4 Dashboards de monitoreo
Panel en Grafana para el SRE monitoreando: salud de la base de datos (PgBouncer pool usage), saturación de colas en Redis y cuota consumida de APIs externas.

### 15.5 Alertas operativas
Notificación automática a Slack/PagerDuty ante disparos del DLQ de Celery o incremento de violaciones de integridad RLS.

### 15.6 Runbooks de incidentes
Procedimientos detallados en `SAD §23.8 (Runbooks de incidentes)` para failover de base de datos y recuperación de webhooks de Belvo atascados.

### 15.7 SLOs / SLIs
*   *SLI:* Proporción de llamadas analíticas exitosas. *SLO: > 99.9% mensual.*
*   *SLI:* Tiempo de detección nocturna 69-B. *SLO: < 5 minutos.*

### 15.8 Auditoría funcional
El panel de administración permite a los auditores revisar el linaje e historial inmutable de cualquier RFC monitoreado.

---

# 16. Arquitectura de IA y política de uso del LLM

### 16.1 Objetivo de la IA en Sentinel
Nexus AI actúa exclusivamente como un copiloto de materialidad y sintetizador fiscal. No realiza transacciones de forma autónoma.

### 16.2 Casos permitidos
*   Redacción de resúmenes de contradicción de riesgo.
*   Consultas RAG sobre legislación y normativas contables de México.
*   Análisis de suficiencia probatoria de archivos PDF del Vault.

### 16.3 Casos prohibidos
*   Manejo de passwords, CIEC o llaves del SAT.
*   Consultas directas a base de datos sin enmascaramiento previo PII.

### 16.4 Pipeline de scrubbing y minimización de contexto
El AI Proxy enmascara de forma obligatoria los datos (RFC, Nombres) antes de interactuar con Gemini, restituyendo la información en la capa cliente local.

### 16.5 RAG jurídico/fiscal (pgvector)
Realiza búsquedas semánticas sobre base de conocimientos de leyes federales y precedentes de tribunales fiscales mexicanos de forma aislada por tenant en base a políticas de RLS.

### 16.6 Caché semántica
Las consultas y respuestas del chat de IA son tokenizadas y almacenadas en un índice vectorial en Redis. Consultas con similitud de coseno $< 0.05$ se sirven desde la caché para reducir costos de tokens al $0$.

### 16.7 Fallback matemático
Si Gemini está fuera de línea, el backend descarta el flujo conversacional y presenta el análisis de riesgo numérico puro del Core de Python (IQR, HHI).

### 16.8 Detección de contradicción (Score e integridad)
El AI Proxy evalúa la respuesta en Strict JSON Mode:

```json
{
  "risk_level": "HIGH",
  "risk_score": 78,
  "main_factors": [
    "HHI alto por proveedor X",
    "Proveedores presuntos en 69-B"
  ],
  "recommendations": [
    "Revisar materialidad del proveedor X"
  ],
  "confidence_score": 0.82
}
```

Si `risk_level` difiere en $\ge 2$ escalones del motor matemático local y el `confidence_score` es inferior a `0.9`, se clasifica como contradicción. Sentinel descarta la inferencia del bot, genera una alerta y emite una traza en `audit_logs`:
`{"action": "IA_CONTRADICTION", "details": {"ai_risk_level": "LOW", "math_risk_level": "HIGH", "ai_confidence": 0.76}}`

### 16.9 Evaluación de calidad de inferencia
Evaluación periódica de respuestas utilizando métricas de fidelidad de contexto (Ragas framework) para monitorear alucinaciones.

### 16.10 Trazabilidad y auditoría de IA
Toda consulta al LLM guarda registro de prompts anonimizados, costo de tokens e identificador de linaje en la base de datos de auditoría.

### 16.11 Matriz de Integración de IA y Auditoría de Endpoints

Para blindar el uso de modelos de lenguaje, se establece un catálogo rígido de endpoints que consumen IA y su correspondiente matriz de auditoría:

| Endpoint | Caso de uso | Contexto visible | Campos enviados a LLM | Eventos en audit_logs | Retención | Enmascaramiento |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/ai/risk-explanation` | Explicar el desglose y factores de riesgo del RiskGauge en el Tactical HUD. | CFDI UUID, periodo fiscal analizado, valores matemáticos HHI/IQR/Z-Score. | Metadatos de transacciones agregadas (HHI, IQR), variables de criticidad, y periodos de calendario fiscal. | `IA_RISK_EXPLANATION` conteniendo costo estimado de tokens e inferencia del modelo. | 24 Meses en Caliente / 5 Años en Glacier. | Enmascaramiento local de RFCs y nombres de proveedores mediante el PII Scrubber. |
| `POST /api/v1/ai/legal-summary` | Resumir la suficiencia jurídica de evidencias de materialidad en el Vault. | ID de Alerta, metadatos de documentos cargados en AWS S3. | Resúmenes de texto de contratos, entregables digitalizados y dictámenes de auditoría. | `IA_LEGAL_SUMMARY` conteniendo IDs de archivos y score de suficiencia probatoria. | 24 Meses en Caliente / 5 Años en WORM Glacier. | Anonimización estricta de datos personales de socios y representantes legales. |
| `POST /api/v1/ai/copilot` | Copiloto fiscal interactivo para consultas sobre leyes contables/PLD en chat lateral. | Historial conversacional actual del usuario y bases jurídicas (pgvector). | Prompt original sanitizado enriquecido con vectores de leyes de RAG local. | `IA_COPILOT_QUERY` conteniendo similitud semántica y score de confianza. | 12 Meses en Caliente / 2 Años en Glacier. | Enmascaramiento reactivo de RFCs, CURPs, emails y nombres en el prompt del usuario. |

Toda llamada que falle el filtro de contradicción o sea clasificada como alucinación suspende la respuesta al frontend y es grabada de manera automática en `audit_logs` con la acción `IA_MALFUNCTION` (o `IA_CONTRADICTION`) para su análisis administrativo.

---


# 17. Riesgo fiscal, PLD y motor de reglas

### 17.0 Scenario Box: Casos de Uso Críticos y Flujo de Extremo a Extremo

Para garantizar la coherencia y comprensión por parte del equipo de ingeniería, se detallan los tres escenarios de operación crítica del sistema que integran bases de datos, lógica matemática, análisis de IA y evidencias regulatorias:

#### Escenario A: Ingesta EFOS Presunto $\rightarrow$ EFOS Definitivo $\rightarrow$ Alertas y Fallbacks de Materialidad
```mermaid
sequenceDiagram
    autonumber
    participant SAT as Listado SAT 69-B
    participant ETL as Celery ETL Beat (02:00 AM)
    participant DB as Postgres (invoices / alerts)
    participant VP as Vault (NOM-151 S3 WORM)
    participant UI as React 19 Frontend

    SAT->>ETL: Descarga de archivo CSV/XML nocturno
    ETL->>DB: Inserción en sat_69b_list (RFC, Estado 'Presunto')
    ETL->>DB: UPDATE invoices SET status_69b = 'presunto' WHERE rfc_proveedor = RFC
    DB->>DB: SQL Trigger evalúa cambio
    DB->>DB: Inserción automática de Alerta 'HIGH' en tabla alerts
    DB->>UI: Notificación en tiempo real vía SSE (Server-Sent Events)
    Note over UI,VP: Analista recibe alerta y sube archivos de materialidad (Contratos, Entregables)
    UI->>VP: Carga en AWS S3 WORM (MinIO local)
    VP->>DB: Registro de metadatos en vault_files
    VP->>VP: Solicitud de sello digital a PSC (NOM-151)
    VP->>DB: UPDATE vault_files SET nom151_sealing_data = SELLO
```
*   **Inputs**:
    *   Listado diario del SAT (URL DOF).
    *   `invoices.rfc_proveedor` de facturas de compra.
*   **Reglas de Operación / Fórmulas**:
    *   Coincidencia exacta de RFC en `sat_69b_list`.
    *   Si un proveedor en estado `presunto` transiciona a `definitivo`, el sistema calcula el monto total deducido del proveedor durante el periodo fiscal vigente:
        $$\text{Monto\_Deducido} = \sum (\text{invoices.amount}) \quad \text{donde rfc\_proveedor} = \text{RFC\_EFOS}$$
    *   Si $\text{Monto\_Deducido} > 0$, la severidad de la alerta en `alerts` se escala a `CRITICAL` con SLA de resolución de 24 horas.
*   **Outputs**:
    *   `sat_69b_list` actualizado.
    *   `invoices.status_69b` actualizado a `definitivo`.
    *   Registro de Alerta de tipo `EFOS_DANGER` con severidad `CRITICAL`.
*   **Evidencia Esperada**:
    *   Expediente digital en `vault_files` conteniendo XML de facturas, constancia de sello digital NOM-151 de los archivos PDF y dictamen firmado por el Oficial de Cumplimiento.

#### Escenario B: Actividad Vulnerable PLD cruza Umbrales de UMAs y emite Avisos a la UIF
```mermaid
graph TD
    A[Transacciones Egresos Contribuyente] --> B{¿Código de Actividad Vulnerable LFPIORPI?}
    B -- SÍ --> C[Agregar monto mensual acumulado en base a UMA]
    B -- NO --> D[Saltar validación PLD]
    C --> E{¿Supera Umbral Identificación?}
    E -- SÍ --> F[Registrar pld_checks: IDENTIFY + Alerta LOW]
    C --> G{¿Supera Umbral Aviso?}
    G -- SÍ --> H[Registrar pld_checks: REPORT + Alerta CRITICAL + Aviso UIF]
```
*   **Inputs**:
    *   Registros de egresos (`invoices` de salida / dirección = `outflow`).
    *   Catálogo de Actividades Vulnerables (`pld_rules`).
    *   Valor oficial de la UMA (Unidad de Medida y Actualización) vigente.
*   **Reglas de Operación / Fórmulas**:
    *   Suma acumulativa móvil mensual por emisor/receptor para actividades bajo ley antilavado:
        $$\text{Acumulado\_Actividad} = \sum (\text{invoices.amount}) \quad \text{en periodo de } 30 \text{ días}$$
    *   **Umbral de Identificación**: Si $\text{Acumulado\_Actividad} \ge \text{pld\_rules.threshold\_identify\_umas} \times \text{UMA}$, se marca `pld_checks.status = 'IDENTIFY'`.
    *   **Umbral de Aviso**: Si $\text{Acumulado\_Actividad} \ge \text{pld\_rules.threshold\_report\_umas} \times \text{UMA}$, se marca `pld_checks.status = 'REPORT'` y se bloquea el cierre manual de alertas sin autorización del Oficial de Cumplimiento.
*   **Outputs**:
    *   Registro en `pld_checks` enlazado al `tax_profile_id`.
    *   Alerta automática `HIGH` o `CRITICAL` según el nivel cruzado.
*   **Evidencia Esperada**:
    *   Acuse XML de la identificación del cliente, archivo con firma electrónica del analista y registro criptográfico en el vault WORM.

#### Escenario C: Estructura del Beneficiario Controlador, Screening OFAC/ONU y Trazabilidad de Cumplimiento
*   **Inputs**:
    *   Mapeo societario del perfil fiscal (`tax_profiles.shareholders` o tabla asociada).
    *   Listas oficiales de sanciones (OFAC SDN List, sanciones de la ONU).
*   **Reglas de Operación / Fórmulas**:
    *   Cálculo de similitud lexicográfica Jaro-Winkler sobre nombres completos de socios y beneficiarios controladores:
        $$\text{Score}_{\text{Jaro-Winkler}} \ge 0.92$$
    *   Si se supera el score, el sistema dispara automáticamente un `risk_event` con clasificación `SANCTION_LIST_MATCH` y bloquea inmediatamente el alta de nuevas operaciones del tenant.
*   **Outputs**:
    *   Registro de incidente crítico en `risk_events`.
    *   Alerta global inmutable en `alerts` asignada al Oficial de Cumplimiento.
*   **Evidencia Esperada**:
    *   Reporte de similitud generado por el motor, log de consultas a listas internacionales y acta de asamblea digitalizada sellada con NOM-151.

### 17.1 Catálogo de riesgos fiscales
*   Detección de simulación fiscal e intercompañías.
*   Validación nocturna contra lista 69-B del CFF.

### 17.2 Catálogo de riesgos PLD
*   Superación de límites legales de uso de efectivo en actividades vulnerables (LFPIORPI) valuados en base a la UMA.
*   Coincidencias en listas de bloqueos de la ONU/OFAC.

### 17.3 Reglas matemáticas base (HHI, IQR, Z-Score, RiskGauge)

#### Concentración HHI
$$HHI = \sum_{i=1}^{N} (s_i)^2$$
Donde $s_i$ es la participación del proveedor $i$ en los egresos totales del periodo ($0 \le HHI \le 10,000$).
*   `hhi_score` asignado al RiskGauge:
    *   $0 \le HHI \le 1500 \longrightarrow 0$ (Diversificación saludable)
    *   $1500 < HHI \le 2500 \longrightarrow 10$ (Concentración moderada)
    *   $2500 < HHI \le 3500 \longrightarrow 25$ (Concentración alta)
    *   $HHI > 3500 \longrightarrow 40$ (Dependencia crítica)

#### Desvíos de Gasto IQR (Rango Intercuartil)
$$IQR = Q_3 - Q_1$$
$$Limit_{Upper} = Q_3 + (\kappa \times IQR)$$
Donde $\kappa$ es el factor de tolerancia a desvíos. 
*   **En periodos normales:** $\kappa = 1.5$.
*   **En ventanas críticas de `fiscal_calendar` (ej. cierres de mes/año):** $\kappa = 1.2$ para incrementar la sensibilidad ante desvíos de facturación de fin de ciclo.

#### Detección de Anomalías Z-Score
Para evaluar desvíos de montos operacionales en base a la media móvil histórica:
$$Z = \frac{x - \mu}{\sigma}$$
Donde $x$ es el monto transaccionado en un día, $\mu$ es el promedio diario de egresos de los últimos 90 días, y $\sigma$ es la desviación estándar.
*   **Outlier Detectado:** Se genera una alerta de anomalía si:
    *   $|Z| > 3.0$ en periodos estándar.
    *   $|Z| > 2.25$ cuando la fecha actual cae dentro de un intervalo activo en `fiscal_calendar`.

#### Fórmula del RiskGauge por Perfil
La salud integral de un perfil fiscal se calcula en tiempo real consolidando variables estructurales, analíticas y de cumplimiento:
$$\text{risk\_score} = \min(100, \text{hhi\_score} + \text{alerts\_score} + \text{pld\_score})$$
*   `alerts_score`: Sumatoria acumulada por alertas abiertas del motor analítico:
    *   $10$ puntos por cada alerta `HIGH` abierta (tope máximo de 30 puntos).
    *   $20$ puntos por cada alerta `CRITICAL` abierta (tope máximo de 40 puntos).
*   `pld_score`: Impacto regulatorio directo:
    *   $20$ puntos fijos si hay al menos $1$ alerta activa PLD vinculada a los umbrales de la UMA (Actividades Vulnerables).

#### Monitoreo PLD por UMAs
Para el cumplimiento de la ley LFPIORPI, el sistema automatiza el conteo y la clasificación de transacciones de actividades vulnerables según su equivalencia en la Unidad de Medida y Actualización (UMA) vigente. Las reglas se consultan en `pld_rules` y las operaciones se registran en `pld_checks`.
*   **Query de Agregación para Visualización en Histograma (FastAPI/React):**
    ```sql
    SELECT 
        activity_type,
        CASE 
            WHEN uma_amount < 500 THEN '0-500 UMA (Bajo - Identificar)'
            WHEN uma_amount >= 500 AND uma_amount < 1500 THEN '500-1500 UMA (Medio - Avisar)'
            ELSE '>1500 UMA (Alto - Reportar y Conservar)'
        END AS uma_range,
        COUNT(*) AS operation_count,
        SUM(uma_amount) AS total_uma_volume
    FROM pld_checks
    WHERE tax_profile_id = :tax_profile_id
    GROUP BY activity_type, uma_range
    ORDER BY uma_range;
    ```
*   **Lógica de Alertamiento:** Si una transacción cruza el umbral definido en `pld_rules.uma_threshold` para un `activity_type` y un `obligation_type` determinado (ej. avisar a los 1,500 UMAs), el motor inserta de forma inmediata una alerta de nivel `HIGH` en la tabla `alerts` con la versión de la regla correspondiente.

### 17.4 Reglas de screening (Jaro-Winkler)
Métrica Jaro-Winkler con factor de prefijo $p=0.1$ y longitud $\ell$:
$$d_{jw} = d_j + \ell \, p \, (1 - d_j)$$
Gatilla coincidencias superiores a **0.92** en listas de sanción.

### 17.5 Umbrales, severidades y criticidad por cliente
La prioridad de las alertas se ajusta dinámicamente según la criticidad del cliente (`criticality_level`):
*   Un perfil clasificado como criticidad `A` (Cliente estratégico) escala de forma automática las alertas: **Una alerta `MEDIUM` en cliente `A` se re-categoriza y trata como `HIGH` en el Tactical HUD**.
*   **SLAs Operativos de Atención de Alertas:**
    *   **Criticidad A:** Alertas de nivel `CRITICAL` deben ser atendidas en **$< 24$ horas**.
    *   **Criticidad B:** Tiempo de respuesta inferior a **$< 48$ horas**.
    *   **Criticidad C:** Tiempo de respuesta inferior a **$< 72$ horas**.

### 17.6 Dueños de reglas
Las reglas analíticas y normativas son propiedad del Especialista Fiscal / Oficial PLD y no pueden ser modificadas en base de datos sin firma criptográfica autorizada.

### 17.7 Versionado de reglas
Toda alerta generada almacena de forma mandatoria la columna `rules_version` vinculando qué reglas exactas de las tablas `risk_rules` o `pld_rules` calcularon la alerta.

### 17.8 Proceso de cambio vía ADR
Toda modificación o adición de reglas de riesgo requiere el levantamiento de un ADR y la aprobación de la mesa redonda técnico-fiscal.

---

# 18. UX, interfaz y lenguaje al usuario

### 18.1 Principios de UX (Liquid Glass)
Estructura visual basada en paneles translúcidos con efecto de vidrio esmerilado y tipografías Outfit/Inter.

### 18.2 Tactical HUD / paneles principales (Heatmap y widgets)
El panel interactivo Tactical HUD de Sentinel se diseña bajo estrictos principios tácticos y de HUD operacional:
1.  **RiskGauge Widget:** Gráfico circular animado de aguja con degradados de color (Verde, Amarillo, Naranja, Rojo) que mapea en tiempo real el `risk_score` general del RFC contribuyente.
2.  **Badges de Criticidad y Cobertura:**
    *   **Badge de Criticidad:** Renderiza una etiqueta visualmente destacada (`A`/`B`/`C`) en base a `tax_profiles.criticality_level`. Permite filtrar de forma global la lista de perfiles y prioriza las alertas críticas (SLA $< 24$ horas para clientes `A`).
    *   **Badge de Cobertura:** Muestra el nivel actual (`full`, `belvo_only`, `lens_only`, `manual_only`). Si el nivel es `manual_only` o `lens_only`, la UI despliega un banner de advertencia: *"Cobertura Limitada"*.
3.  **Heatmap interactivo de Proveedores vs Tiempo:**
    *   **Eje X:** Meses del año fiscal activo.
    *   **Eje Y:** Proveedores ordenados por volumen financiero acumulado.
    *   **Color de Celda:** Codifica el riesgo combinado del proveedor en dicho mes:
        *   *LOW (Verde Esmeralda):* $HHI < 1500$, sin alertas abiertas y sin publicaciones en 69-B.
        *   *MEDIUM (Amarillo Ámbar):* $HHI$ entre $1500$ y $2500$ o presencia de alertas de nivel `MEDIUM`.
        *   *HIGH (Naranja Fuego):* $HHI$ entre $2500$ y $3500$, o alertas `HIGH`, o proveedor listado como 69-B `presunto`.
        *   *CRITICAL (Rojo Rubí):* $HHI > 3500$, o proveedor listado como 69-B `definitivo`, o presencia de alertas PLD altas.
4.  **Widget PLD por Rango UMA:** Histograma interactivo con las barras de operaciones clasificadas por rangos UMA, permitiendo al oficial de cumplimiento prever avisos regulatorios de forma gráfica.
5.  **Página de Detalle del Perfil Fiscal:**
    *   Muestra la marca de tiempo de la última sincronización (`belvo_last_sync_at`).
    *   Mapea visualmente el estado detallado de la conexión.
    *   **Recomendaciones para mejorar Cobertura:** Un bloque inteligente que sugiere acciones inmediatas (ej. *"Conecta tu SAT/Banca vía Belvo para transicionar a Cobertura Plena"*).

### 18.3 Estados vacíos, Quick Setup y degradación
Para acelerar el onboarding de nuevos despachos, Sentinel implementa un flujo guiado flexible:
*   **Quick Setup de Contribuyentes:** El sistema permite registrar un perfil contable únicamente capturando el RFC y la Razón Social de la empresa. En ese instante, el sistema inicializa `belvo_status = 'unlinked'` y `coverage_level = 'manual_only'`, permitiendo explorar el sistema de forma inmediata.
*   **Flujo de Conexión de Belvo:**
    *   El `belvo_status` transiciona de manera reactiva por los siguientes estados: `unlinked` $\rightarrow$ `linked` (éxito) $\rightarrow$ `error` o `mfa_required` (si el SAT exige contraseña dinámica o autenticación multifactor).
    *   Si se decide omitir Belvo durante el setup, la SPA renderiza el **Bypass Banner**: *"Sincronización automática no configurada. Cobertura limitada a carga manual LENS"*.
    *   El usuario puede reintentar o conectar la cuenta SAT/Banca en cualquier momento haciendo clic en el botón *“Conectar SAT/Banca”* dentro del menú de configuración del perfil.

### 18.4 Alertas y copywriting operacional
Las alertas indican qué ocurrió, por qué importa en base a la ley de México y qué acción defensiva tomar.

### 18.5 Flujo de atención de alertas
El analista puede transicionar una alerta adjuntando soporte en el vault. Cambios críticos exigen la co-firma del Gerente del Despacho.

### 18.6 Evidencia, cierre de casos y preferencias de usuario
*   **Mi Perfil (Configuración Personal de Usuario):**
    *   **Campos Editables:** Nombre completo (`users.full_name`) y teléfono (`users.phone_number`), zona horaria e idioma preferido.
    *   **Seguridad en Correo:** Si el usuario intenta cambiar su correo electrónico, el backend bloquea el cambio directo y envía de forma obligatoria un **vínculo de confirmación criptográfico** firmado a la cuenta original.
    *   **Visualización de Roles:** Muestra el despacho actual (`tenants.name`), el rol asignado (`OWNER`, `ADMIN`, `ACCOUNTANT`, `VIEWER`), y la lista de perfiles fiscales (`tax_profiles`) a los que tiene acceso bajo RLS (solo lectura).
    *   **Notificaciones:** Configuración de canales y tipos. Por regla estricta de cumplimiento, las alertas fiscales o de tipo PLD con severidad `CRITICAL` **nunca** podrán ser silenciadas de la bandeja de entrada in-app.
*   **Configuración del Despacho (OWNER/ADMIN):**
    *   Pantalla exclusiva para la administración del tenant:
        *   Configurar el límite de sincronizaciones automáticas de Belvo por periodo contable (ej. máximo de 3 sincronizaciones completas al mes).
        *   Forzar niveles de cobertura mínima para ciertos perfiles (ej. establecer que los perfiles clasificados como criticidad `A` requieren obligatoriamente cobertura `belvo_only` o `full`).
        *   Parámetros globales de cálculo PLD e idioma/zona horaria por defecto.

### 18.6.1 Configuración de Usuario y Tenancy desde UX (Contrato de Comportamiento)

Con el fin de asegurar la robustez y evitar brechas de seguridad o desconfiguraciones catastróficas, el comportamiento de la interfaz de usuario en las secciones de configuración sigue un contrato de comportamiento estricto:

1.  **Matriz de Capacidades por Rol Contable:**
    *   `OWNER`: Acceso total. Es el único que puede modificar configuraciones globales del tenant, habilitar o desactivar el "Quick Setup Bypass", aprovisionar claves de integraciones y cambiar la suscripción de facturación. **No puede autodemodarse de rol ni eliminarse** si no existe al menos otro usuario con rol `OWNER` activo en el tenant para evitar dejar cuentas huérfanas.
    *   `ADMIN`: Acceso administrativo. Puede invitar usuarios del despacho, configurar umbrales de riesgo por perfil y forzar la cobertura obligatoria de clientes. No tiene acceso a facturación o cambio de claves maestras.
     *   `ACCOUNTANT` (etiquetado en UX como "Analista"): Rol puramente operativo. Puede subir archivos XML/ZIP manuales mediante LENS, interactuar con el chatbot de IA, atender alertas y solicitar cierres de casos. Las opciones de configuración de tenant se renderizan deshabilitadas o están ausentes en el HUD lateral.
    *   `VIEWER`: Acceso de consulta. Vista de solo lectura. Todo elemento interactivo (botones de guardado, inputs, subida de archivos) se renderiza bloqueado.
2.  **Límites de Edición y Restricciones Absolutas (UX Validation):**
    *   **RFC de Contribuyente:** Una vez creado el `tax_profile` e ingresadas sus credenciales SAT/Belvo con éxito, el RFC queda **bloqueado de forma permanente** contra ediciones en el frontend. Si se cometió un error en el RFC, el perfil debe ser archivado de forma inmutable y crearse uno nuevo.
    *   **ID del Tenant Padre:** El identificador del holding o despacho (`tenant_id`) es completamente invisible e inalterable desde la UX, inyectado directamente por el backend a través del JWT autenticado.
3.  **Representación Visual de Badges en HUD:**
    *   **Badge de Criticidad (`criticality_level`):**
        *   `A`: Renderizado en color *Rojo Rubí* esmerilado con borde dinámico que pulsa en el HUD. Muestra una etiqueta de SLA prioritario (menos de 24 horas).
        *   `B`: Renderizado en color *Oro Ámbar* esmerilado. Representa clientes de riesgo y facturación moderada con SLA de 48 horas.
        *   `C`: Renderizado en color *Pizarra Metálica* esmerilado. Clientes de bajo riesgo o en estado inactivo.
    *   **Badge de Cobertura (`coverage_level`):**
        *   `full` (SAT + Bancario automatizado): Badge color *Verde Esmeralda* brillante con leyenda *"Cobertura Plena"*.
        *   `belvo_only` o `lens_only`: Badge color *Azul Cobalto* esmerilado con leyenda *"Cobertura Estándar"*.
        *   `manual_only`: Badge color *Naranja Fuego* con leyenda *"Cobertura Limitada"* y despliegue del **Bypass Banner** explicativo.

### 18.7 Accesibilidad y usabilidad
Cumplimiento estricto con pautas WCAG 2.1, soporte completo para lectores de pantalla mediante roles ARIA declarados y navegación por teclado fluida.

---

# 19. DevSecOps, calidad y estrategia de pruebas

### 19.1 Estrategia de ramas y PRs
Uso estricto de Gitflow. Commits hacia la rama `develop` requieren la aprobación de dos Tech Leads y la validación automática del pipeline CI/CD.

### 19.2 CI/CD Pipeline
Build e instrumentación segura automatizada. El pipeline corre sobre GitHub Actions e incluye validaciones automáticas de Semgrep, Gitleaks, y escaneos de SonarQube sobre contenedores Distroless multi-etapa.
*   La receta técnica y archivo YAML completo de integración continua se detallan en el [Developer Handbook §6 (Pipelines CI/CD)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#6-pipelines-cicd-y-hardening-devsecops).

### 19.3 Calidad de código (SonarQube)
Gate de SonarQube bloquea el pipeline si no se superan métricas de mantenibilidad Grado A y cobertura $> 75\%$.

### 19.4 Escaneo de seguridad estática (SAST y secretos)
Lints y escaneo estático contra secretos mediante Semgrep y Gitleaks en el pipeline.

### 19.5 Pruebas unitarias
Verificación aislada de algoritmos estadísticos e ingesta.

### 19.6 Pruebas de integración
Testeo de middlewares, inyección de contextos RLS y validación de tokens.

### 19.7 Pruebas de contrato
Validación de esquemas API mediante Dredd.

### 19.8 Pruebas E2E (Cypress)
Cypress automatizado por hito validando el flujo completo de sincronizaciones Belvo sandbox y carga ZIP manual.
*   El código base del test de integración de interfaz de usuario se encuentra documentado en el [Developer Handbook §7.2 (Test Cypress E2E)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#72-test-de-cypress-para-e2e-login--mfa-sandbox-flow).

### 19.9 Pruebas de carga
Simulaciones Locust de concurrencia de perfiles contables.

### 19.10 Pruebas de seguridad
Análisis dinámico de vulnerabilidades contra el top 10 OWASP.

### 19.11 Pruebas de datos, reglas y transiciones 69-B
Pruebas integrales de flujo de datos simulando un dataset de RFC de proveedor que transiciona de forma secuencial de `clean` $\rightarrow$ `presunto` $\rightarrow$ `definitivo`. Se valida automáticamente la generación exacta de alertas, su escalación a `CRITICAL` y la actualización histórica de facturas asociadas.
*   El código del script de pruebas unitarias de pytest para transiciones del 69-B se detalla en el [Developer Handbook §7.1 (Test Pytest 69-B)](file:///Users/juancarlosizquierdogonzalez/Documents/Sentinel/SENTINEL/sentinel/nexus-360-enterprise/documentacion/Developer-Handbook.md#71-test-unitario-pytest-para-transiciones-69-b-del-cff-test_69b_workflowpy).

### 19.12 Criterios de liberación
DoD: Cobertura de pruebas unitarias $> 75\%$, paso de gates SAST SonarQube, y aprobación exitosa del test Cypress en staging.

---

# 20. 20 ADRs y gobierno de decisiones

### 20.1 Política ADR
Sentinel se rige por Architecture Decision Records (ADRs) para toda modificación estructural o de reglas fiscales.

### 20.2 ADRs obligatorios

#### ADR-0001 — Aislamiento Multi-Tenant por PostgreSQL RLS

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** Sentinel es multi-tenant con despachos contables competidores compartiendo infraestructura. La fuga de datos entre tenants —incluso accidental— viola el INAI. Filtrar solo en capa de aplicación no es suficiente: un WHERE clause omitido expone datos de otro despacho. Se requiere aislamiento a nivel de base de datos.

**Decisión:** PostgreSQL Row-Level Security forzado con `FORCE ROW LEVEL SECURITY` en todas las tablas con scope de tenant. El contexto se inyecta vía `SET LOCAL app.current_tenant_id` desde SQLAlchemy (FastAPI) y Prisma client extension (Express BFF).

**Consecuencias positivas:** Zero fugas entre tenants; bypass imposible desde aplicación; auditable con `EXPLAIN ANALYZE`; cumple INAI.

**Consecuencias negativas:** Testing más complejo (cada test debe inyectar tenant); ~1-2% overhead en queries.

**Alternativas descartadas:** (a) Filtrado solo en app — rechazado por riesgo de fuga. (b) DB separada por tenant — rechazado por costo operativo (100+ tenants = 100+ DBs). (c) Schemas PostgreSQL — rechazado por complejidad de migraciones.

**Referencias:** §11.1, §11.6, Developer Handbook §2 (RLS SQLAlchemy) y §3 (RLS Prisma).

---

#### ADR-0002 — Desacoplamiento Express BFF y FastAPI Core

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** El frontend React no debe comunicarse directo con FastAPI Core — expondría endpoints de riesgo a la red pública. La autenticación federada (Google OAuth), sesiones HttpOnly y CSRF requieren una capa intermedia que no pertenece al motor analítico. Sin BFF, el JWT viviría en localStorage (vulnerable a XSS, NEXUS-AUTH-001).

**Decisión:** Express 5 como Backend-for-Frontend. Único punto de entrada desde el navegador. Gestiona Auth.js v5, cookies HttpOnly, CSRF, rate limiting. Forwardea a FastAPI Core por mTLS + JWT interno. Core nunca expuesto a internet.

**Consecuencias positivas:** Auth desacoplada; cookies HttpOnly desde día 1; zero endpoints de Core expuestos; CSRF/XSS shield en el borde.

**Consecuencias negativas:** Un hop adicional de red (~2-5ms); BFF es critical path (mitigado con 2+ réplicas); dos mecanismos de auth que mantener.

**Alternativas descartadas:** (a) FastAPI-only con OAuth — rechazado por mezcla de concerns y falta de madurez vs Auth.js v5. (b) API Gateway como BFF — rechazado para evitar vendor lock-in.

**Referencias:** §7.1, §9.2, §13.4, §13.6.

---

#### ADR-0003 — Redis como Broker Dual Celery + Pub/Sub SSE

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** Sentinel necesita (1) colas para tareas asíncronas (sync Belvo, ETL 69-B) y (2) notificaciones en tiempo real al frontend sin polling. Dos patrones de mensajería distintos que podrían requerir infraestructura separada (RabbitMQ + WebSockets).

**Decisión:** Una sola instancia de Redis 7 cubre ambos: Celery broker para workers asíncronos + Pub/Sub para SSE. Workers publican resultados en canales Redis; BFF se suscribe y forwardea al frontend vía Server-Sent Events. Kafka se reserva para cuando se superen 5,000 RFCs activos (§21.4).

**Consecuencias positivas:** Infraestructura mínima; SSE evita complejidad de WebSockets; sin polling; escalable a Redis Cluster.

**Consecuencias negativas:** Redis como single point of failure (mitigado con Sentinel + réplica); ~6 conexiones SSE por dominio en HTTP/1.1; sin garantía de entrega fuerte (mitigado con DLQ).

**Alternativas descartadas:** (a) RabbitMQ + Redis separados — rechazado por sobrecarga operativa. (b) Kafka desde día 1 — rechazado por overengineering al volumen actual.

**Referencias:** §7.3, §9.7, §21.4, Developer Handbook §8.7 (Celery Workers).

---

#### ADR-0004 — AI Proxy con Enmascaramiento Local de PII

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** Gemini 2.5 Flash Lite procesa análisis fiscal, pero los prompts pueden contener RFC, CURP, nombres y montos. Enviar PII a Google sin consentimiento viola la Ley de Protección de Datos (INAI) y lineamientos CNBV. No hay DPA que cubra legislación mexicana específica.

**Decisión:** Pipeline de scrubbing local en el AI Proxy que aplica transformaciones irreversibles antes de cada llamada a Gemini: RFC → `[RFC_ENMASCARADO]`, CURP → SHA-256, nombres → `[ENTIDAD]`, montos → rangos, correos → `[CORREO]`. El prompt original nunca sale de la VPC. El prompt scrubbed se audita en `ai_audit_logs`.

**Consecuencias positivas:** Cumplimiento INAI verificable; zero PII transferido a Google; suite `test_pii_scrubber.py` automatizada.

**Consecuencias negativas:** Falsos negativos en regex (mitigado con revisión trimestral); sobre-scrubbing puede degradar calidad de respuestas; ~5-50ms de latencia adicional.

**Alternativas descartadas:** (a) Sin IA — rechazado por pérdida de diferenciador. (b) LLM on-premise — rechazado por costo de GPU. (c) Enviar PII con DPA — rechazado porque INAI no reconoce DPAs automáticos.

**Referencias:** §16.4, §13.11, Developer Handbook §4.1 (PII Scrubber) y §4.2 (Motor de Contradicción); Gemini 2.5 Flash Lite SDK docs.

---

#### ADR-0005 — Vault Inmutable WORM con Sellado NOM-151

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** Ante una presunción del SAT (69-B), el contribuyente tiene 30 días para presentar materialidad probatoria. Sin preservación inmutable, la evidencia puede ser cuestionada como alterada. La NOM-151-SCFI-2016 exige almacenamiento WORM y sellos de tiempo de un PSC acreditado.

**Decisión:** Doble capa de inmutabilidad: (1) S3 con Object Lock en modo Compliance (WORM, mínimo 5 años). (2) PostgreSQL triggers que bloquean UPDATE/DELETE en `vault_files` (columna `nom151_sealed`). Cada documento recibe sello NOM-151 de TSA externa (RFC 3161) al ser subido.

**Consecuencias positivas:** Admisibilidad legal ante el SAT; inmutabilidad garantizada incluso contra admins; auditoría de cada acceso; cumplimiento NOM-151 verificable.

**Consecuencias negativas:** Imposibilidad de borrar errores (mitigado con flag `purged`); ~20% más costo de almacenamiento; ~1-2s de latencia por sello; dependencia del PSC.

**Alternativas descartadas:** (a) S3 sin Object Lock — rechazado por no cumplir NOM-151. (b) Blockchain — rechazado por costo e incertidumbre regulatoria en México.

**Referencias:** §9.8, §11.8, §10.9, Developer Handbook §1 (DDL vault_files + trigger WORM) y §8.8 (Vault de Evidencia), NOM-151-SCFI-2016.

---

#### ADR-0006 — Fallback Analítico Local ante Fallas del LLM

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** Gemini puede fallar (API caída, rate limiting) o alucinar (contradecir el resultado matemático). Las decisiones fiscales que afectan cumplimiento regulatorio no pueden depender de un modelo probabilístico externo. Deben ser deterministas y auditables.

**Decisión:** El RiskGauge y las anomalías se calculan siempre localmente primero (HHI, IQR, Z-Score). La IA solo añade explicación. Un Motor de Contradicción compara la respuesta de IA contra el resultado matemático: si la discrepancia es ≥2 niveles de severidad con AI confidence < 90%, la respuesta se descarta. Si Gemini no está disponible, el sistema responde con explicación basada en reglas.

**Consecuencias positivas:** Decisiones de riesgo nunca dependen de IA externa; sistema 100% operativo sin Gemini; auditable; control de costos.

**Consecuencias negativas:** Explicaciones menos pulidas en modo fallback; umbral de contradicción requiere tuning; posibles falsos positivos de contradicción.

**Alternativas descartadas:** (a) IA como fuente primaria de riesgo — rechazado por no determinista. (b) Sin IA — rechazado por pérdida de diferenciador. (c) Doble LLM para consenso — rechazado por doble costo y doble riesgo PII.

**Referencias:** §16.7, §16.8, §14.4, Developer Handbook §4.2 (Motor de Contradicción).

---

#### ADR-0007 — Screening 69-B Nocturno Asíncrono

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** El SAT publica en el DOF los RFCs de EFOS/EDOS (art. 69-B CFF). Sentinel debe detectar nuevas publicaciones en < 24h. Un sistema que dependa de consulta manual no cumple este SLA.

**Decisión:** ETL nocturno vía Celery Beat a las 02:00 AM CST. Descarga el listado, cruza RFCs contra `sat_69b_list`, detecta transiciones (clean→presunto: alerta HIGH; presunto→definitivo: alerta CRITICAL + bloqueo de pagos), versiona con `version_id`. Notifica por email + in-app.

**Consecuencias positivas:** SLA < 24h garantizado; procesamiento batch eficiente; historial versionado; cero carga en horario operativo.

**Consecuencias negativas:** Ventana de hasta 24h si el DOF publica justo antes del ciclo; fallo silencioso del ETL requiere alerta SRE; falsos positivos por homonimia (mitigado con verificación de nombre).

**Alternativas descartadas:** (a) Consulta bajo demanda — rechazado por falta de SLA. (b) Polling cada hora — rechazado por ineficiente (DOF publica ~1 vez/semana).

**Referencias:** §10.6, §17.1, Developer Handbook §7 (Suites de Prueba), CFF Art. 69-B.

---

#### ADR-0008 — Doble Verificación de Webhooks Belvo

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** Belvo notifica por webhook cuando los datos fiscales están listos. Estos webhooks alimentan RiskGauge, PLD y alertas 69-B. Si un atacante falsifica un webhook, puede inyectar facturas falsas. Belvo no ofrece firma HMAC — solo Bearer token + IP allowlist.

**Decisión:** Doble verificación en capas independientes: (1) Kong valida el Bearer token antes de llegar al backend. (2) FastAPI valida IP de origen contra whitelist documentada. (3) Deduplicación por `event_id` con constraint UNIQUE previene replay attacks. Si Belvo agrega HMAC en el futuro, se migra de inmediato.

**Consecuencias positivas:** Defensa en profundidad; deduplicación anti-replay; IP allowlist reduce superficie.

**Consecuencias negativas:** Sin no-repudio criptográfico (a diferencia de HMAC); IP allowlist requiere mantenimiento; Bearer token es secreto compartido.

**Alternativas descartadas:** (a) Solo Bearer — rechazado por insuficiente. (b) mTLS — rechazado porque Belvo no ofrece webhooks con certificados de cliente.

**Referencias:** §13.8, §12.1, Developer Handbook §5.1-5.2 (Webhooks Belvo).

---

#### ADR-0009 — Gobernanza y Co-Firma para Modificación de Umbrales

**Estado:** Aceptado | **Fecha:** 2026-04-15

**Contexto:** Los umbrales PLD (UMAs), severidades 69-B y pesos del RiskGauge tienen consecuencias legales directas. Un cambio mal calibrado genera falsos negativos (no detectar EFOS) o falsos positivos (paralizar operaciones legítimas). Modificaciones unilaterales por ingeniería sin aval del oficial de cumplimiento exponen a Sentinel.

**Decisión:** Proceso de gobernanza con co-firma obligatoria: (1) Todo cambio requiere ADR con justificación. (2) Doble firma: Arquitecto de Solución + Oficial de Cumplimiento/Fiscalista. (3) Versionado inmutable: cada cambio incrementa `rules_version`; eventos históricos mantienen su versión. (4) Cambios nunca retroactivos.

**Consecuencias positivas:** Trazabilidad regulatoria total; responsabilidad compartida; no retroactividad; iteración controlada.

**Consecuencias negativas:** Velocidad de iteración reducida (minutos → horas/días); dependencia del fiscalista; complejidad de mantener múltiples versiones de reglas.

**Alternativas descartadas:** (a) Cambios unilaterales por ingeniería — rechazado por riesgo regulatorio. (b) Hardcoded en código — rechazado porque cada cambio requiere deploy.

**Referencias:** §17.7, §17.8, §20.1, §20.3, Developer Handbook §8.9.

#### ADR-0010 — Normalización y Corrección del Corpus Documental v3.1.1

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** Una auditoría formal del corpus documental (SAD, SAD-Lite, Developer Handbook, README) de Sentinel Nexus 360 Enterprise v3.1.0-MASTER detectó inconsistencias significativas: divergencias en PostgreSQL (16 vs 17), Python (3.11 vs 3.12), umbrales de Jaro-Winkler (0.85/0.88/0.92), umbrales de contradicción IA (80% vs 90%), colisiones de identificadores de HUs (EP-02 y EP-07 con significados múltiples), contradicción Belvo HMAC (ADR-0008 vs Handbook), y referencias a Stripe excluido. El corpus no podía considerarse "fuente única de ejecución".

**Decisión:** Corrección inmediata de las inconsistencias canónicas y emisión de ADR-0010 como addendum de normalización documental:

1. **Versiones canónicas definitivas** (a mayo 2026):
   - PostgreSQL 17 (y pgvector 0.7+)
   - Python 3.12 para Core y AI Proxy
   - Jaro-Winkler: umbral ≥ 0.92 para listas OFAC/ONU/PEPs
   - Contradicción IA: descarte si confianza < 90% (antes era 80% en §9.6 y 90% en §16.8)
2. **Belvo webhooks:** ADR-0008 prevalece. Belvo no ofrece firma HMAC (confirmado mayo 2026). Estrategia: Bearer token + IP allowlist + deduplicación por event_id. El código HMAC del Handbook §5.1 se retira y se reemplaza por verificación Bearer.
3. **Stripe:** Confirmación de exclusión absoluta en v3.1.0-MASTER (§4.2). HU-07.05 generaliza a "pasarela de pago externa" sin implementación directa.
4. **Tailwind CSS:** Retirado de dependencias en §9.1; diseño Vanilla CSS coherente con HU-07.01.
5. **Roles RBAC:** El sistema reconoce 4 roles (OWNER, ADMIN, ACCOUNTANT, VIEWER). Funciones organizacionales como "Oficial de Cumplimiento" se ejercen mediante ADMIN; "Analista" mediante ACCOUNTANT. No se crean roles RBAC adicionales.
6. **Nombres de columnas canónicos:** `invoice_hash` y `uuid` (no `xmlsha256`/`satuuid`) en la tabla `invoices`.
7. **Separación del backlog:** Las HUs se extraen a `BACKLOG-HU.md` como documento independiente, dejando en SAD §24 solo trazabilidad resumida. El backlog se expande de 41 a 120+ HUs en 14 épicas.

**Consecuencias positivas:** Fuente única de verdad restaurada; todos los documentos alineados en versiones, umbrales, naming y decisiones de seguridad; backlog escalable e independiente de la arquitectura.

**Consecuencias negativas:** Esfuerzo de reescritura de secciones del Handbook y del SAD; retrabajo en HU-07.05 y HU-02.03/02.04; necesidad de reenumerar HUs al expandir épicas.

**Alternativas descartadas:** (a) No corregir — rechazado porque la deriva documental ya era riesgo de ejecución. (b) Corrección parcial — rechazado porque no resuelve la inconsistencia entre documentos. (c) Reescribir desde cero — rechazado porque la base conceptual es sólida.

**Referencias:** SAD §1.2, §4.2, §9.1, §9.5, §9.6, §11.1, §18.6; SAD-Lite §9.1; Developer Handbook §5.1-5.2; Auditoría Externa Mayo 2026.

#### ADR-011 — Estrategia de Ingesta Dual: Belvo API + Carga Manual LENS

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** Sentinel recibe datos fiscales por dos canales: (1) Belvo Fiscal API (automático, CFDI, declaraciones, opinión de cumplimiento), y (2) LENS (carga manual de ZIPs con XMLs por el contador). Belvo tiene cobertura plena pero es asíncrono y sujeto a rate limits. LENS es inmediato pero depende de la diligencia del usuario. Unificar ambos canales requiere deduplicación robusta y un modelo de datos que soporte ambas procedencias.

**Decisión:**
1. Ingesta dual unificada en la tabla `invoices` con columna `source` (BELVO | LENS).
2. Deduplicación por `invoice_hash` (SHA-256 del contenido binario CFDI) y `uuid` (folio fiscal SAT), no por timestamp.
3. LENS valida estructuralmente los XML (XSD) antes de insertar; los CFDI inválidos se rechazan con `quality_flag = 'invalid'`.
4. Belvo se usa para bootstrap masivo (histórico) + actualización delta diaria. LENS para cargas puntuales y contingencia.
5. El motor de riesgo opera sobre el dataset unificado, sin distinguir origen.

**Consecuencias positivas:** Cobertura híbrida; el usuario nunca se queda sin datos; la deduplicación por hash+uuid es robusta y no depende de timestamps; el modelo unificado simplifica RiskGauge y PLD.

**Consecuencias negativas:** La validación XSD añade latencia en carga LENS (~200ms por XML grande); Belvo rate limits (60 req/min) limitan throughput de bootstrap masivo; requiere monitoreo dual de ambos canales.

**Alternativas descartadas:** (a) Separar en tablas distintas Belvo y LENS — rechazado porque duplica lógica de riesgo. (b) Usar solo Belvo y eliminar LENS — rechazado porque deja al usuario sin opción offline. (c) Validación estructural delegada al frontend — rechazado por riesgo de inyección de CFDI malformados.

**Referencias:** §9.3 (Core Fiscal), §9.7 (Celery Workers), §10.3-§10.5, §11.2 (DDL invoices), Handbook §1.

#### ADR-012 — Estrategia de Contingencia: Modos Degradados ante Caída de SAT/Belvo

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** El SAT y Belvo pueden experimentar interrupciones (mantenimiento, fallos de API, rate limiting). Sentinel no puede depender de disponibilidad externa para sus funciones core de análisis fiscal y cumplimiento. Se requiere una estrategia de degradación con gracia que mantenga operativas las funciones de lectura, análisis histórico y alertas.

**Decisión:**
1. Tres modos de operación: Normal, SAT Degradado, IA Degradada, Degradación Total.
2. En SAT Degradado: se deshabilita sincronización Belvo y conexión de nuevos links. Se habilita LENS como canal alternativo. Banner amarillo persistente con timestamp del último sync exitoso.
3. En IA Degradada: se deshabilita el chatbot Nexus AI. El motor matemático de riesgo sigue operando. Banner azul informativo.
4. Monitoreo proactivo: Celery Beat verifica disponibilidad de Belvo cada 60s. Si 3 fallos consecutivos, se activa modo degradado automáticamente.
5. Recuperación automática: al detectar Belvo disponible de nuevo, se reanuda sincronización delta pendiente.

**Consecuencias positivas:** El sistema nunca se "cae" — siempre muestra datos históricos; el usuario mantiene acceso a RiskGauge, alertas y evidencia; LENS sirve como canal de contingencia siempre disponible.

**Consecuencias negativas:** La detección de caída tiene 3 minutos de latencia (3 checks de 60s); el modo degradado añade complejidad de estados en frontend; requiere pruebas exhaustivas de transiciones entre modos.

**Alternativas descartadas:** (a) Mostrar error genérico sin funcionalidad — rechazado por mala UX y riesgo de abandono. (b) Reintentar indefinidamente — rechazado por saturación de logs y recursos. (c) Delegar la decisión al usuario — rechazado porque el usuario no sabe si es fallo temporal o mantenimiento programado.

**Referencias:** §10.11-§10.12, §18.3 (UX degradados), §23.8.1 (Runbook INC-WEBHOOK), SAD-Lite §9.4.

#### ADR-013 — Versionado de Reglas PLD y RiskGauge con No-Retroactividad

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** Los umbrales PLD (UMAs), pesos del RiskGauge, y severidades 69-B tienen consecuencias legales. Un cambio en una regla puede convertir un perfil de "bajo riesgo" a "alto riesgo" instantáneamente. Si las reglas cambian sin versionado, se pierde trazabilidad y capacidad de auditoría. Si son retroactivas, se reinterpreta el pasado con reglas del presente.

**Decisión:**
1. Todo cambio en `risk_rules` o `pld_rules` incrementa `rules_version` (formato semántico: MAJOR.MINOR).
2. Eventos históricos (risk_events, pld_checks, alerts) mantienen inmutable su `rules_version` del momento de evaluación.
3. Cambios de reglas NO son retroactivos: solo aplican a nuevas evaluaciones.
4. Cada cambio requiere registro en `audit_logs` con: usuario, timestamp, `rules_version` anterior, `rules_version` nuevo, y justificación.
5. Consultas de riesgo siempre devuelven el score calculado con la versión de reglas vigente al momento de la consulta.

**Consecuencias positivas:** Trazabilidad regulatoria total; capacidad de explicar por qué un perfil se clasificó de cierta manera en una fecha específica; iteración controlada de reglas; defensa legal robusta.

**Consecuencias negativas:** Complejidad de mantener múltiples versiones de reglas en DB; queries históricas requieren JOIN con la versión correcta; el versionado semántico requiere disciplina del equipo.

**Alternativas descartadas:** (a) Hardcodear reglas en código — rechazado porque cada cambio requiere deploy. (b) No versionar — rechazado porque la auditoría fiscal exige trazabilidad de criterios. (c) Reglas retroactivas — rechazado por riesgo legal de reinterpretar el pasado.

**Referencias:** §17.7-§17.8, §20.1 (Gobernanza), ADR-0009 (Co-firma para umbrales), Handbook §1 (DDL risk_rules, pld_rules).

#### ADR-014 — Motor PLD: Cálculo por UMAs con Ventana Móvil de 30 Días

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** La LFPIORPI exige monitorear actividades vulnerables y reportar cuando los montos acumulados superan umbrales definidos en UMAs. El cálculo debe ser por actividad, por período, con precisión de centavos y ventanas móviles. No puede falsear positivos (paraliza operaciones legítimas) ni falsos negativos (riesgo regulatorio).

**Decisión:**
1. Ventana móvil de 30 días naturales para acumulación de UMAs por actividad vulnerable y por RFC.
2. Cálculo diario automatizado por Celery Beat (madrugada, 03:00 AM hora local del tenant).
3. Tres umbrales configurables por tenant: Identificación, Aviso, Conservación. Por defecto: Aviso = 1,500 UMA, según catálogo LFPIORPI.
4. Al superar umbral: `pld_checks.status = 'REPORT'`, alerta inmutable, notificación al Oficial de Cumplimiento.
5. Los umbrales son configurables por tenant vía `tenants` + `pld_rules` con co-firma obligatoria (ADR-0009).

**Consecuencias positivas:** Cumplimiento exacto con LFPIORPI; ventana móvil evita "reseteos" artificiales; umbrales configurables por despacho; alertas inmutables con trazabilidad.

**Consecuencias negativas:** Cálculo diario consume recursos en tenants con muchos RFCs; ventana de 30 días puede generar falsos positivos en industrias estacionales; requiere UMA actualizada (INEGI publica anualmente).

**Alternativas descartadas:** (a) Ventana fija mensual (día 1-30) — rechazado porque permite "jugar" con fechas. (b) Cálculo en tiempo real — rechazado por carga computacional. (c) Umbrales hardcodeados — rechazado porque diferentes despachos tienen diferente apetito de riesgo.

**Referencias:** §17.2-§17.3, §9.5 (Motor PLD), §10.8 (Atención de alertas), Handbook §8.5 (Motor PLD Contract).

#### ADR-015 — Cadena de Custodia WORM: Verificación de Integridad y No-Repudio en Vault

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** Los expedientes de evidencia en `vault_files` deben garantizar integridad, no-repudio y cadena de custodia para ser admisibles en procedimientos legales y auditorías fiscales. El bucket S3 con Object Lock (WORM) garantiza inmutabilidad, pero se necesita verificación periódica de que los archivos no han sido alterados o perdidos.

**Decisión:**
1. Verificación periódica de integridad (Celery Beat, semanal): recalcular SHA-256 de cada archivo en S3 y comparar con `file_hash_sha256` en DB.
2. Cualquier discrepancia genera alerta `CRITICAL` y entrada inmutable en `audit_logs` con WORM violation flag.
3. Cadena de custodia: toda lectura del vault (descarga, visualización) se registra en `audit_logs` con: usuario, timestamp, IP, archivo accedido, y propósito declarado.
4. Los archivos NOM-151 sellados incluyen metadatos de sellado (timestamp authority, hash del sello) en `nom151_sealing_data` (JSONB).
5. Exportación de expediente incluye índice firmado con SHA-256 del contenido total para verificación externa.

**Consecuencias positivas:** Defensa legal robusta; trazabilidad total de accesos; verificación proactiva de integridad; admisibilidad en procedimientos SAT/UIF.

**Consecuencias negativas:** Verificación semanal consume ancho de banda S3 (GET requests); el registro de cada acceso al vault genera volumen en audit_logs; requiere coordinación con políticas de retención S3.

**Alternativas descartadas:** (a) Confiar solo en Object Lock sin verificación — rechazado porque no detecta corrupción silenciosa. (b) Verificación bajo demanda — rechazado porque no es proactivo. (c) No registrar accesos de lectura — rechazado porque rompe cadena de custodia.

**Referencias:** §9.8 (Vault), §10.9 (Construcción de expediente), §11.8 (Inmutabilidad), ADR-0005 (Vault NOM-151), Handbook §8.8.

---

#### ADR-016 — Políticas de Retención Legal y Borrado Controlado de Evidencia

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** La NOM-151 y la LFPIORPI exigen retención de evidencia fiscal por mínimo 5 años. Sin embargo, retener indefinidamente todos los archivos genera costos de almacenamiento y riesgo de exposición de datos. Se necesita un equilibrio entre cumplimiento legal y gestión de costos.

**Decisión:**
1. Política de retención por defecto: 5 años desde la fecha de sellado NOM-151 para archivos de evidencia.
2. Borrado controlado: al cumplirse el período, el archivo se marca `retention_expired = true`. No se elimina automáticamente — requiere aprobación explícita del Oficial de Cumplimiento (co-firma).
3. Períodos de retención configurables por tenant para cumplir con requisitos específicos de cada despacho.
4. Los archivos en período de retención tienen Object Lock activo. Al expirar, el Object Lock se puede remover para permitir borrado.
5. Auditoría de borrado: registro inmutable en `audit_logs` con usuario, timestamp, archivo eliminado, y justificación legal.

**Consecuencias positivas:** Cumplimiento con NOM-151 y LFPIORPI; reducción de costos de almacenamiento a largo plazo; control explícito sobre eliminación; trazabilidad total.

**Consecuencias negativas:** La co-firma para borrado añade fricción operativa; riesgo de eliminación accidental si el Oficial de Cumplimiento no verifica adecuadamente; requiere coordinación con políticas S3 Lifecycle.

**Alternativas descartadas:** (a) Borrado automático al expirar — rechazado por riesgo de eliminar evidencia necesaria para litigios activos. (b) Retención indefinida — rechazado por costo de almacenamiento. (c) Sin política de retención — rechazado por incumplimiento regulatorio.

**Referencias:** §11.8 (Inmutabilidad y WORM), ADR-0005 (Vault NOM-151), ADR-0015 (Cadena de custodia), Handbook §1 (DDL vault_files).

---

#### ADR-017 — Indexación pgvector para RAG Fiscal: Embeddings y Búsqueda Semántica

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** El Copiloto Fiscal de Sentinel (Nexus AI) necesita responder consultas de usuarios usando conocimiento del marco legal fiscal mexicano (CFF, LFPIORPI, NOM-151, resoluciones SAT). Gemini 2.5 Flash Lite tiene conocimiento general pero no específico de regulación fiscal mexicana actualizada. Se requiere un pipeline RAG (Retrieval-Augmented Generation) con conocimiento local indexado.

**Decisión:**
1. Base de conocimiento fiscal almacenada en `knowledge_base` con pgvector (embeddings de 768 dimensiones).
2. Indexación semanal automatizada: Celery Beat descarga/procesa documentos legales (DOF, CFF, resoluciones), genera embeddings vía `text-embedding-004` y los almacena.
3. Búsqueda semántica top-5 (cosine similarity) + cross-encoder re-ranking para seleccionar los fragmentos más relevantes.
4. Los fragmentos recuperados se inyectan en el prompt de Gemini como contexto legal ("You are a Mexican fiscal compliance expert. Use the following legal context to answer...").
5. Caché semántica en Redis: si una consulta similar (cosine > 0.95) fue respondida en las últimas 24h, se devuelve respuesta cacheada sin llamar a Gemini.

**Consecuencias positivas:** Respuestas fiscalmente precisas y actualizadas; reducción de alucinaciones; menor costo de API Gemini (caché); conocimiento legal versionado y auditable.

**Consecuencias negativas:** Costo de embeddings (aunque menor que consultas frecuentes a Gemini); latencia añadida por búsqueda vectorial (~50ms); requiere mantenimiento de la base de conocimiento (nuevas leyes, reformas).

**Alternativas descartadas:** (a) Sin RAG — confiar solo en conocimiento de Gemini — rechazado por imprecisión en regulación mexicana. (b) Búsqueda por keywords — rechazado por baja precisión. (c) Embeddings en Redis — rechazado por falta de persistencia y capacidades de indexación de pgvector.

**Referencias:** §16.5-§16.6 (RAG pipeline), §9.6 (AI Proxy), §11.1 (pgvector), Handbook §4.2, ADR-0004 (PII scrubbing).

---

#### ADR-018 — Rate Limiting y Cuotas de Uso Gemini por Tenant

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** Gemini 2.5 Flash Lite tiene costos por token y rate limits. Un tenant con uso intensivo del Copiloto Fiscal podría exceder cuotas, degradar el servicio para otros tenants, o generar costos imprevistos. Se requiere un sistema de cuotas y rate limiting justo y predecible.

**Decisión:**
1. Rate limiting por usuario: 20 req/min al endpoint del AI Proxy (Redis counter con ventana deslizante).
2. Cuota mensual por tenant: límite configurable de tokens Gemini (por defecto: 1M tokens/mes para plan estándar).
3. Al alcanzar 85% de cuota: alerta preventiva al OWNER del tenant vía email.
4. Al alcanzar 100%: el AI Proxy rechaza consultas con HTTP 429 "Cuota excedida" hasta el siguiente ciclo de facturación. El motor matemático sigue operando.
5. Dashboard FinOps muestra consumo en tiempo real: tokens usados, costo estimado, proyección mensual.

**Consecuencias positivas:** Fairness entre tenants; previsibilidad de costos; protección contra abuso; transparencia para el cliente.

**Consecuencias negativas:** El límite de 20 req/min puede ser restrictivo para despachos grandes con múltiples contadores usando IA simultáneamente; requiere contador Redis preciso y atómico.

**Alternativas descartadas:** (a) Sin rate limiting — rechazado por riesgo de saturación y costos imprevistos. (b) Rate limiting global (no por tenant) — rechazado porque un tenant podría monopolizar el servicio. (c) Prepago — rechazado porque añade fricción de pagos (Stripe excluido en v3.1.0).

**Referencias:** §16.9 (Métricas de calidad IA), §9.6 (AI Proxy), §9.9 (Admin/FinOps), Handbook §8.6, ADR-0004.

---

#### ADR-019 — Diseño UX Liquid Glass: Vanilla CSS sin Frameworks de Estilos

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** El Tactical HUD de Sentinel debe ser rápido (LCP < 2.5s), accesible (WCAG 2.1 AA), y mantener una estética corporativa distintiva (Liquid Glass: glassmorphism con transiciones suaves). Frameworks como Tailwind CSS añaden peso, generan código verboso, y dificultan la personalización del diseño glassmorphism. Se decide un enfoque de CSS artesanal.

**Decisión:**
1. Vanilla CSS con CSS Custom Properties para el sistema de diseño Liquid Glass (colores, tipografía, espaciado, sombras, bordes, glassmorphism).
2. Glassmorphism implementado con `backdrop-filter: blur()`, fondos semitransparentes, y bordes sutiles.
3. Prohibido el uso de Tailwind CSS, Bootstrap, Material UI, o cualquier framework de estilos.
4. Framer Motion permitido exclusivamente para animaciones y transiciones (no para estilos).
5. Dos temas: Light y Dark (activación por `prefers-color-scheme` o toggle manual).
6. Diseño responsive mobile-first con breakpoints en 768px, 1024px, 1440px.

**Consecuencias positivas:** Control total sobre el diseño; rendimiento superior (sin CSS no utilizado); identidad visual única y distintiva; menor dependencia de librerías externas.

**Consecuencias negativas:** Mayor esfuerzo de desarrollo inicial (no hay utilidades predefinidas); requiere disciplina del equipo para mantener consistencia de tokens CSS; onboarding más lento para desarrolladores acostumbrados a Tailwind.

**Alternativas descartadas:** (a) Tailwind CSS — rechazado por ADR-0010 (conflicto con HU-07.01 y peso innecesario). (b) Styled Components / CSS-in-JS — rechazado por runtime cost. (c) Material UI — rechazado por estilo genérico no corporativo.

**Referencias:** §18 (UX e interfaz), §9.1 (Frontend SPA), ADR-0010 (Normalización), SAD-Lite §9, Handbook §8.1.

---

#### ADR-020 — Estrategia de Onboarding Multi-Paso con Validación RFC

**Estado:** Aceptado | **Fecha:** 2026-05-25

**Contexto:** El onboarding de nuevos despachos a Sentinel requiere múltiples pasos: creación del tenant, configuración del despacho, conexión al SAT vía Belvo Widget, validación de RFC, y asignación de cobertura. Un flujo mal diseñado genera abandono, errores de configuración, y soporte innecesario.

**Decisión:**
1. Onboarding en 5 pasos guiados por wizard:
   - Paso 1: Registro del despacho (razón social, RFC, email corporativo) + Google OAuth.
   - Paso 2: Configuración inicial (zona horaria, umbrales PLD por defecto, preferencias de notificación).
   - Paso 3: Conexión al SAT mediante Belvo Hosted Widget (el usuario autentica en el portal del SAT, Belvo retorna `link_id`).
   - Paso 4: Asignación de cobertura: `manual_only` (por defecto hasta confirmar Belvo), luego `full` al recibir primer webhook de Belvo.
   - Paso 5: Invitación de usuarios del despacho (OWNER invita ADMIN, ACCOUNTANT, VIEWER).
2. Validación de RFC: el RFC ingresado se valida contra el SAT vía Belvo API (no solo formato — validación de existencia real).
3. Quick Setup: si el usuario omite el wizard, el tenant se crea con valores por defecto y cobertura `manual_only`. Banner persistente invita a completar el onboarding.
4. Timeout de 30 minutos para recepción del primer webhook Belvo post-conexión. Si no llega, se muestra troubleshooting guide.

**Consecuencias positivas:** Onboarding guiado reduce errores y soporte; validación RFC real evita problemas posteriores; Quick Setup permite acceso inmediato sin bloquear al usuario; cobertura progresiva (manual → full).

**Consecuencias negativas:** Dependencia de disponibilidad de Belvo para validación RFC; el wizard de 5 pasos puede percibirse como largo; Quick Setup puede resultar en tenants sin datos si el usuario nunca completa el onboarding.

**Alternativas descartadas:** (a) Onboarding manual (soporte humano configura cada tenant) — rechazado por no escalable. (b) Sin validación RFC — rechazado porque RFCs inválidos rompen la ingesta Belvo. (c) Sin Quick Setup — rechazado porque bloquea el acceso a usuarios que quieren explorar la plataforma.

**Referencias:** §10.1-§10.2 (Onboarding), §18.3 (Quick Setup), §12.1 (Integración Belvo), SAD-Lite §5-§7, Handbook §8.2.

### 20.3 Flujo de propuesta, revisión y aceptación
Propuesta de cambio → Creación de borrador de ADR como nueva entrada en §20.2 → Mesa redonda técnica con CISO y Fiscalista → Aceptación firmada y actualización del SAD.

### 20.4 Criterio de obsolescencia / superseded
Cuando un ADR es modificado por decisiones posteriores, el documento original se marca explícitamente con estatus `SUPERSEDED` agregando un enlace hacia el nuevo ADR rector.

### 20.5 ADRs transversales (cross-cutting)

Los siguientes ADRs aplican a múltiples épicas del backlog y no están vinculados a una HU individual específica por su naturaleza transversal:

| ADR | Nombre | Aplica a épicas |
|:---|:---|---|
| ADR-012 | Contingencia operativa ante degradación de servicios externos | EP-06, EP-07, EP-13 |
| ADR-016 | Retención legal y políticas de conservación documental | EP-11 |

Estos ADRs definen comportamientos de sistema que afectan a todas las HUs dentro de las épicas listadas. Su trazabilidad debe verificarse en los criterios de aceptación y en la Definition of Done de cada HU perteneciente a dichas épicas.

---

# 21. Roadmap de evolución arquitectónica

### 21.1 Fase v3.1.0 (Core actual + apéndice normativo integrado)
Consolidación de ingesta Belvo, base de datos PostgreSQL RLS, motores estadísticos costo cero, resguardo de evidencias NOM-151 y Gemini Flash Lite con PII enmascarada.

### 21.2 Calendario de actualización normativa anual
*   **Revisión Anual UMA / PLD:** Actualización sistemática de la tabla `pld_rules` y parámetros de la LFPIORPI en base a las publicaciones oficiales de la UMA a inicio de año.
*   **Revisión de DOF 69-B:** Auditoría de robustez del ETL y versionado de la tabla `sat_69b_list`.
*   **Auditoría de Privacidad y NOM-151:** Revisión anual de políticas de minimización de datos en el AI Proxy y validación de las firmas de inmutabilidad del Vault.
*   **Proceso de Liberación:** Cada cambio normativo genera un ADR formal y un release específico etiquetado en el motor de reglas analíticas.

### 21.3 Fase Enterprise (Corporativo multiregión)
Webhooks salientes para ERPs y bus de mensajes en Kafka.

### 21.4 Criterios de activación
Activación de Kafka supeditada a un volumen de base de datos mayor a 5,000 RFCs activos.

### 21.5 Riesgos de evolución
El incremento del costo de la extensión vectorial de PostgreSQL en grandes nubes. Mitigado mediante la separación de la base de conocimientos vectoriales de la base de datos transaccional en producción.

---

# 22. Glosario, convenciones y referencias

### 22.1 Glosario fiscal
*   **CFDI:** Comprobante Fiscal Digital por Internet (XML oficial mexicano).
*   **EFOS:** Empresas que Facturan Operaciones Simuladas (Lista negra CFF 69-B).
*   **EDOS:** Empresas que Deducen Operaciones Simuladas (Compradores de facturas).
*   **Materialidad:** Evidencia probatoria que demuestra que una de transacción amparada por un XML ocurrió físicamente.
*   **LFPIORPI:** Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita.

### 22.2 Glosario técnico
*   **BFF:** Backend-for-Frontend (Capa Express 5).
*   **DLQ:** Dead-Letter Queue — Cola de mensajes fallidos para inspección SRE.
*   **HMAC:** Hash-based Message Authentication Code — Firma criptográfica para integridad de mensajes.
*   **Jaro-Winkler:** Algoritmo de similitud lexicográfica para comparación de cadenas (nombres, RFCs).
*   **mTLS:** Mutual TLS — Autenticación bidireccional con certificados en ambos extremos.
*   **PII:** Personally Identifiable Information — Datos personales sujetos a regulación.
*   **RAG:** Retrieval-Augmented Generation — Arquitectura de IA que combina búsqueda vectorial con generación LLM.
*   **RiskGauge:** Índice compuesto propietario de riesgo fiscal (0-100) calculado con HHI, IQR y Z-Score.
*   **RLS:** Row-Level Security (PostgreSQL).
*   **SSE:** Server-Sent Events (Notificaciones reactivas).
*   **UMA:** Unidad de Medida y Actualización — Referencia económica oficial mexicana.
*   **WORM:** Write Once Read Many (Almacenamiento inmutable).
*   **pgvector:** Extensión de base de datos relacional para guardar y consultar embeddings de vectores.

### 22.3 Convenciones de naming
*   Tablas en base de datos en minúsculas y plural (`invoices`, `tax_profiles`).
*   Campos utilizando snake_case (`tax_profile_id`).
*   Variables de entorno globales en mayúsculas (`BELVO_WEBHOOK_SECRET`).

### 22.4 Referencias normativas y técnicas
*   Código Fiscal de la Federación, Art. 69-B.
*   Secretaría de Economía, NOM-151-SCFI-2016.
*   Estándar de Diseño de Software IEEE 1016-2009.

---

# 23. Anexos obligatorios

### 23.1 Diccionario de datos canónico ampliado

#### Tabla: `sat_69b_list`
*   `id` (UUID, Primary Key): Identificador único del registro.
*   `rfc` (VARCHAR(13)): RFC del contribuyente catalogado.
*   `status` (VARCHAR(20)): Estatus legal (`presunto`, `definitivo`, `desvirtuado`).
*   `version_id` (INTEGER): Versión consecutiva del ETL nocturno.

#### Tabla: `user_preferences`
*   `user_id` (UUID, Primary Key): Identificador único del usuario (F.K. a `users`).
*   `tenant_id` (UUID): Tenant propietario de las preferencias (F.K. a `tenants`).
*   `notify_email` (BOOLEAN): Suscripción a alertas de correo electrónico.
*   `notify_in_app` (BOOLEAN): Suscripción a alertas dentro de la aplicación.
*   `notify_critical_only` (BOOLEAN): Suscripción exclusiva a alertas críticas.
*   `alert_types` (JSONB): Tipos de alertas a recibir.
*   `dashboard_default_view` (VARCHAR(50)): Vista por defecto del panel.
*   `ui_density` (VARCHAR(20)): Preferencia de densidad de pantalla (comfortable/compact).
*   `theme` (VARCHAR(20)): Preferencia de tema estético de interfaz (dark/light).

> **Nota:** El DDL completo de las 18 tablas canónicas con constraints, índices B-Tree compuestos, triggers WORM y políticas RLS se encuentra en el [Developer Handbook — §1. Esquema Físico DDL](Developer-Handbook.md#1-esquema-físico-ddl-de-persistencia-postgresql-17). Este anexo contiene la definición semántica de las entidades ampliadas no cubiertas en el glosario ni en el Handbook.

---

### 23.2 Catálogo de eventos y logs

Sentinel emite eventos estructurados en cada punto de observabilidad del sistema. La siguiente tabla documenta el catálogo canónico de eventos, su severidad y la audiencia operativa correspondiente.

| Código | Evento | Fuente | Severidad | Destino | Descripción |
|:---:|---|:---:|:---:|---|:---|
| `AUTH-001` | `user.login.success` | BFF Express | INFO | `audit_logs` | Inicio de sesión exitoso (federado o local) |
| `AUTH-002` | `user.login.failed` | BFF Express | WARNING | `audit_logs` | Intento fallido de autenticación |
| `AUTH-003` | `user.login.locked` | BFF Express | HIGH | `audit_logs` + Alerta | Cuenta bloqueada tras 5 intentos fallidos |
| `AUTH-004` | `user.2fa.enrolled` | BFF Express | INFO | `audit_logs` | Usuario registró dispositivo 2FA TOTP |
| `AUTH-005` | `user.2fa.challenged` | BFF Express | INFO | `audit_logs` | Solicitud de código 2FA en curso |
| `AUTH-006` | `user.session.expired` | BFF Express | INFO | `audit_logs` | Sesión expirada por inactividad o refresh vencido |
| `AUTH-007` | `user.role.changed` | BFF Express | HIGH | `audit_logs` + Alerta | Cambio de rol por un ADMIN/OWNER |
| `AUTH-008` | `user.invited` | BFF Express | INFO | `audit_logs` | Invitación a nuevo usuario del tenant |
| `BELVO-001` | `belvo.link.created` | Core FastAPI | INFO | `audit_logs` | Nuevo link de Belvo creado para un tax_profile |
| `BELVO-002` | `belvo.webhook.received` | Core FastAPI | INFO | `webhook_events` + `audit_logs` | Webhook de Belvo recibido y validado (Bearer token + IP) |
| `BELVO-003` | `belvo.webhook.rejected` | Core FastAPI | HIGH | `webhook_events` + Alerta | Webhook rechazado por firma inválida o IP no autorizada |
| `BELVO-004` | `belvo.sync.completed` | Celery Worker | INFO | `audit_logs` | Sincronización de invoices/tax_status completada |
| `BELVO-005` | `belvo.sync.failed` | Celery Worker | HIGH | `audit_logs` + Alerta | Sincronización fallida tras reintentos; va a DLQ |
| `BELVO-006` | `belvo.sync.degraded` | Celery/BFF | CRITICAL | `audit_logs` + Alerta + Banner UI | Belvo no disponible; sistema en modo degradado |
| `BELVO-007` | `belvo.mfa.required` | Core FastAPI | MEDIUM | `audit_logs` + Notificación | Belvo respondió 428; se requiere código MFA del SAT |
| `LENS-001` | `lens.upload.started` | Core FastAPI | INFO | `audit_logs` | Carga masiva de CFDI iniciada (ZIP o XML) |
| `LENS-002` | `lens.upload.completed` | Core FastAPI | INFO | `audit_logs` | Carga masiva completada con conteo de procesados/duplicados/rechazados |
| `LENS-003` | `lens.dedup.sha256` | Core FastAPI | INFO | `audit_logs` | CFDI duplicado detectado por hash SHA-256 (Belvo vs LENS) |
| `LENS-004` | `lens.quality.flag` | Core FastAPI | WARNING | `audit_logs` + `quality_notes` | CFDI con defecto estructural (schema inválido, RFC malformado) |
| `RISK-001` | `risk.analysis.started` | Celery Worker | INFO | `audit_logs` | Análisis de riesgo disparado para un tax_profile |
| `RISK-002` | `risk.analysis.completed` | Celery Worker | INFO | `audit_logs` | RiskGauge calculado; anomalías y recomendaciones generadas |
| `RISK-003` | `risk.gauge.changed` | Core FastAPI | MEDIUM/HIGH | `audit_logs` + SSE → HUD | Cambio significativo (>10 puntos) en RiskGauge |
| `RISK-004` | `risk.anomaly.detected` | Core FastAPI | Varies | `alerts` + SSE | Anomalía detectada (severidad variable según tipo) |
| `EOFB-001` | `etl.69b.started` | Celery Beat (02:00) | INFO | `audit_logs` | ETL nocturno de lista 69-B iniciado |
| `EOFB-002` | `etl.69b.completed` | Celery Beat | INFO | `audit_logs` | ETL completado con conteo de RFCs procesados |
| `EOFB-003` | `etl.69b.transition.clean_to_presunto` | Celery Worker | HIGH | `alerts` + `audit_logs` | RFC transitó de limpio a presunto → alerta HIGH |
| `EOFB-004` | `etl.69b.transition.presunto_to_definitivo` | Celery Worker | CRITICAL | `alerts` + `audit_logs` | RFC transitó a definitivo → alerta CRITICAL, bloqueo de pagos |
| `PLD-001` | `pld.check.executed` | Core FastAPI | INFO | `audit_logs` | Verificación PLD ejecutada sobre operación |
| `PLD-002` | `pld.threshold.crossed` | Core FastAPI | HIGH/CRITICAL | `alerts` + `audit_logs` | Umbral UMA de identificación o aviso superado |
| `PLD-003` | `pld.screening.match` | Core FastAPI | HIGH | `alerts` + `audit_logs` | Coincidencia Jaro-Winkler con lista OFAC/ONU/PEPs |
| `VAULT-001` | `vault.evidence.created` | Core FastAPI | INFO | `audit_logs` | Expediente de evidencia creado vinculado a alerta |
| `VAULT-002` | `vault.document.sealed` | Core FastAPI | INFO | `audit_logs` + `vault_files.nom151_sealed` | Documento sellado con NOM-151 |
| `VAULT-003` | `vault.evidence.exported` | Core FastAPI | HIGH | `audit_logs` | Expediente exportado para auditoría externa |
| `AI-001` | `ai.query.submitted` | AI Proxy | INFO | `ai_audit_logs` | Consulta enviada a Gemini tras scrubbing PII |
| `AI-002` | `ai.query.completed` | AI Proxy | INFO | `ai_audit_logs` | Respuesta recibida; tokens y costo registrados |
| `AI-003` | `ai.query.blocked` | AI Proxy | HIGH | `ai_audit_logs` + Alerta | Consulta bloqueada por contener PII no scrubbed o caso prohibido |
| `AI-004` | `ai.contradiction.detected` | AI Proxy | HIGH | `ai_audit_logs` + Alerta | Motor de contradicción descartó respuesta de IA (≥2 niveles de discrepancia) |
| `SYS-001` | `system.health.degraded` | Core FastAPI | CRITICAL | `audit_logs` + Alerta SRE | Dependencia externa caída (Belvo, Gemini, DB) |
| `SYS-002` | `system.health.restored` | Core FastAPI | INFO | `audit_logs` | Dependencia externa recuperada |
| `SYS-003` | `system.tenant.authorized` | Core FastAPI | INFO | `audit_logs` | POST /internal/authorize recibido; subscripción activada/revocada |

**Política de retención de eventos:**
- `audit_logs` (WORM): retención mínima de 5 años, alineada con NOM-151.
- `ai_audit_logs`: retención de 2 años para trazabilidad de costos y calidad de inferencia.
- `webhook_events`: retención de 1 año; rotación automática tras ETL de respaldo.
- Logs de aplicación (Cloud Logging): 90 días.

---

### 23.3 Payloads de ejemplo

#### 23.3.1 Webhook de Belvo — `invoices.updated`

```json
POST /webhooks/belvo
Authorization: Bearer whsec_mk8a7x9p2q5v1n4r6t3y0w8u
Content-Type: application/json
X-Belvo-Event-Id: evt_2mK9xR7pQ4vN1

{
  "event": "invoices.updated",
  "event_id": "evt_2mK9xR7pQ4vN1",
  "data": {
    "link": "lnk_8aW3fR6tY2pL9",
    "institution": "sat_mx_fiscal",
    "invoices_count": 342,
    "last_updated": "2026-05-19T14:22:10Z"
  },
  "webhook_id": "wh_3bZ7mP2kV5nR8",
  "created_at": "2026-05-19T14:22:11Z"
}
```

#### 23.3.2 Autorización externa — `/internal/authorize`

```json
POST /internal/authorize
Content-Type: application/json
X-HMAC-Signature: sha256=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08

{
  "tenant_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "plan": "enterprise",
  "action": "grant",
  "timestamp": "2026-05-19T14:25:00Z",
  "metadata": {
    "billing_reference": "INV-2026-0519-8842",
    "max_tax_profiles": 150
  }
}
```

**Validación HMAC en backend:**
```python
# Developer Handbook §4.1 — timingSafeEqual obligatorio
expected = hmac.new(SHARED_SECRET, raw_body, hashlib.sha256).hexdigest()
if not hmac.compare_digest(f"sha256={expected}", signature_header):
    raise HTTPException(status_code=401)
```

#### 23.3.3 Chat IA — Request/Response anonimizado

**Request (post-scrubbing, enviado a Gemini):**
```json
{
  "model": "gemini-2.5-flash-lite",
  "contents": [{
    "parts": [{
      "text": "Eres un asistente fiscal. CONTEXTO: [RFC_ENMASCARADO] tiene RiskGauge 78 con anomalía SINGLE_DEPENDENCY: 68% de ingresos de un solo cliente [RFC_CLIENTE_ENMASCARADO]. Pregunta: ¿qué implicaciones fiscales tiene esto?"
    }]
  }],
  "config": {
    "response_mime_type": "text/plain"
  }
}
```

**Response (pre-entrega al usuario):**
```json
{
  "answer": "Un nivel de concentración del 68% con un solo cliente es fiscalmente riesgoso. El SAT puede presumir operaciones simuladas bajo el artículo 69-B del CFF si no existe materialidad probatoria. Recomiendo: (1) diversificar cartera, (2) preparar expediente NOM-151 para cada transacción, (3) revisar el estatus 69-B del cliente mensualmente.",
  "model": "gemini-2.5-flash-lite",
  "tokens": { "prompt": 312, "candidates": 187 },
  "cost_estimate_usd": 0.00031,
  "contradiction_score": 0.12,
  "contradiction_status": "PASS"
}
```

---

### 23.4 Matriz requisito → módulo → prueba

Cada HU del backlog debe poder trazarse a un módulo técnico y una suite de pruebas mínima. Esta matriz es la referencia para el equipo de QA.

| HU | Módulo(s) | Tablas Afectadas | Prueba Unitaria | Prueba Integración | E2E (Cypress) |
|:---|:---|:---|:---:|:---:|:---:|
| HU-01.01 | Core Fiscal | `tenants`, `tax_profiles`, `users`, `tenant_users` | pytest: `test_ddl_migrations.py` | `test_db_init.py` | — |
| HU-01.02 | Core Fiscal | Todas (inyección RLS) | `test_rls_injector.py` | `test_rls_isolation.py` | — |
| HU-01.03 | BFF Express | — (Prisma middleware) | `test_prisma_rls.ts` | `test_bff_tenancy.ts` | — |
| HU-01.04 | PostgreSQL | Todas (políticas) | — | `test_rls_policies.sql` | — |
| HU-01.05 | Core Fiscal, LENS | `invoices`, `quality_notes` | `test_cfdi_parser.py` | `test_lens_quality.py` | `cy:lens-upload.spec.ts` |
| HU-02.01 | BFF Express | `users`, `tenant_users` | `test_auth_federated.ts` | `test_login_flow.ts` | `cy:login.spec.ts` |
| HU-02.02 | BFF Express | `users` (sesiones) | `test_jwt_cookies.ts` | `test_2fa_flow.ts` | `cy:2fa.spec.ts` |
| HU-02.03 | BFF Express, Frontend | `users`, `user_preferences` | `test_profile_api.ts` | `test_profile_update.ts` | `cy:profile.spec.ts` |
| HU-02.04 | BFF Express, Frontend | `user_preferences` | `test_prefs_api.ts` | `test_notif_config.ts` | `cy:preferences.spec.ts` |
| HU-02.05 | BFF Express | `users`, `tenant_users` | `test_rbac_api.ts` | `test_user_mgmt.ts` | `cy:admin-users.spec.ts` |
| HU-02.06 | BFF Express, Core | `tenants`, `fiscal_calendar` | `test_tenant_config.py` | `test_finops_params.py` | `cy:admin-config.spec.ts` |
| HU-03.01 | Core Fiscal, Celery | `tax_profiles`, `invoices`, `belvo_webhook_events` | `test_belvo_adapter.py` | `test_belvo_ingest.py` | `cy:belvo-widget.spec.ts` |
| HU-03.02 | Core Fiscal | `webhook_events` | `test_webhook_bearer.py` | `test_webhook_security.py` | — |
| HU-03.03 | Core Fiscal, Celery | `invoices` | `test_cfdi_dedup.py` | `test_lens_belvo_dedup.py` | `cy:dedup.spec.ts` |
| HU-03.04 | Core Fiscal, Frontend | — (modo degradado) | `test_degraded_mode.py` | `test_belvo_degraded.py` | `cy:degraded.spec.ts` |
| HU-03.05 | Core Fiscal, Frontend | `tax_profiles` (belvo_status) | `test_sync_status.py` | `test_progress_ui.py` | `cy:sync-progress.spec.ts` |
| HU-04.01 | Celery Worker, Core | `sat_69b_list`, `invoices`, `alerts` | `test_69b_etl.py` | `test_69b_workflow.py` | — |
| HU-04.02 | Core Fiscal | `risk_events`, `risk_scores` | `test_riskgauge.py` | `test_risk_analysis.py` | `cy:riskgauge.spec.ts` |
| HU-04.03 | Core Fiscal | `pld_checks`, `alerts` | `test_pld_umas.py` | `test_pld_alerting.py` | `cy:pld.spec.ts` |
| HU-04.04 | Core Fiscal | `pld_checks`, `vault_files` | `test_jaro_winkler.py` | `test_screening_ofac.py` | — |
| HU-04.05 | Core Fiscal | `fiscal_calendar`, `risk_events` | `test_calendar_iqr.py` | `test_seasonal_sensitivity.py` | — |
| HU-04.06 | BFF Express, Core | `tax_profiles` | `test_criticality_api.py` | `test_coverage_rules.py` | `cy:admin-tax-profile.spec.ts` |
| HU-04.07 | Core Fiscal | `risk_events`, `pld_checks`, `alerts` | `test_rules_version.py` | `test_version_audit.py` | — |
| HU-04.08 | QA Suite | Todas EP-04 | `test_69b_mock_data.py` | `test_pld_mock_flow.py` | `cy:risk-engine.spec.ts` |
| HU-05.01 | Core Fiscal | `vault_files`, `alerts` | `test_vault_case.py` | `test_evidence_link.py` | `cy:vault.spec.ts` |
| HU-05.02 | Core Fiscal, Celery | `vault_files` (col. `nom151_sealed`) | `test_nom151_seal.py` | `test_vault_upload.py` | — |
| HU-05.03 | Core Fiscal, Frontend | `vault_files` | `test_vault_query.py` | `test_evidence_history.py` | `cy:vault-history.spec.ts` |
| HU-05.04 | Core Fiscal | `vault_files`, `audit_logs` | `test_worm_export.py` | `test_evidence_export.py` | `cy:evidence-export.spec.ts` |
| HU-05.05 | Core Fiscal, Celery | `vault_files` (col. `nom151_sealed`) | `test_retention_policy.py` | `test_legal_purge.py` | — |
| HU-06.01 | AI Proxy, Frontend | `ai_audit_logs` | `test_ai_riskgauge.py` | `test_ai_explain.py` | `cy:nexus-ai.spec.ts` |
| HU-06.02 | AI Proxy, Frontend | `ai_audit_logs` | `test_ai_alert_explain.py` | `test_ai_context.py` | `cy:ai-alert.spec.ts` |
| HU-06.03 | AI Proxy | `ai_audit_logs`, `vault_files` | `test_ai_draft.py` | `test_ai_response_draft.py` | — |
| HU-06.04 | AI Proxy | — (pipeline scrubbing) | `test_pii_scrubber.py` | `test_scrub_integration.py` | — |
| HU-06.05 | AI Proxy | `ai_audit_logs` | `test_contradiction.py` | `test_ai_vs_math.py` | — |
| HU-06.06 | AI Proxy, Core | `ai_audit_logs` | `test_ai_audit.py` | `test_ai_trace.py` | — |
| HU-07.01 | Frontend SPA | — | `test_hud_components.tsx` | `test_hud_api.ts` | `cy:hud.spec.ts` |
| HU-07.02 | Frontend SPA, Core | `tax_profiles`, `risk_scores` | `test_profile_view.tsx` | `test_profile_data.py` | `cy:tax-profile.spec.ts` |
| HU-07.03 | Frontend SPA, Core | `alerts` | `test_alert_list.tsx` | `test_alert_locking.py` | `cy:alerts.spec.ts` |
| HU-07.04 | Frontend SPA | `tax_profiles` | `test_quick_setup.tsx` | `test_onboarding_ux.ts` | `cy:quick-setup.spec.ts` |
| HU-07.05 | Frontend SPA | — (banners UI) | `test_degraded_banner.tsx` | `test_degraded_states.py` | `cy:degraded-ui.spec.ts` |
| HU-07.06 | Frontend SPA | — (accesibilidad) | `test_a11y.tsx` | — | `cy:a11y.spec.ts` |

**Leyenda de herramientas de prueba:**
- `pytest` + `pytest-asyncio` + `pytest-cov` ≥ 75% cobertura.
- `Cypress` ≥ 3 flujos críticos por épica.
- `test_rls_isolation.py` y `test_rls_policies.sql` son **mandatorios** — sin excepción de coverage.

---

### 23.5 Matriz riesgo → control → evidencia

Mapeo de riesgos identificados en el SAD §4.2, §4.3, §12, §13 contra los controles implementados y la evidencia de cumplimiento requerida para auditoría regulatoria.

| ID Riesgo | Descripción | Severidad | Control(es) | HU(s) Responsable | Evidencia de Cumplimiento |
|:---:|---|:---:|---|:---:|---|
| R-001 | Fuga de datos entre tenants | CRITICAL | PostgreSQL RLS + inyección de contexto SQLAlchemy/Prisma | HU-01.02, HU-01.03, HU-01.04 | Suite `test_rls_isolation.py` con 100% pass; auditoría trimestral de logs RLS |
| R-002 | Robo de sesión por XSS (NEXUS-AUTH-001) | CRITICAL | Cookies HttpOnly; SameSite=Strict; Secure; sin localStorage | HU-02.01, HU-02.02 | Cypress: `cy:login.spec.ts` verifica `httpOnly: true`; Gitleaks sin hallazgos |
| R-003 | Suplantación de webhooks Belvo | HIGH | Doble verificación Bearer token + IP allowlist (ADR-0008) | HU-03.02 | Auditoría manual con `audit-code` skill; tasa de rechazo = 100% en test de spoofing |
| R-004 | Exposición de PII a Gemini | HIGH | Pipeline de scrubbing local (regex + reemplazo) antes de enviar al LLM | HU-06.04 | `test_pii_scrubber.py` con datasets de RFCs, CURPs, nombres reales; 0 fugas |
| R-005 | Proveedor EFOS definitivo no detectado | CRITICAL | ETL nocturno 69-B + transición automática de alertas | HU-04.01, HU-04.08 | SLA: detección < 24h post-publicación DOF; `test_69b_workflow.py` verifica severidades |
| R-006 | Operación PLD no alertada | HIGH | Cálculo por UMAs + `pld_checks` con umbrales acumulativos | HU-04.03, HU-04.08 | `test_pld_umas.py` con valores UMA vigentes; fiscalista firma umbrales anualmente |
| R-007 | Evidencia no válida en auditoría SAT | CRITICAL | Vault WORM + sellado NOM-151 + inmutabilidad por triggers | HU-05.02, HU-05.04 | `test_worm_export.py` verifica que UPDATE/DELETE son rechazados; firma NOM-151 verificable |
| R-008 | Alucinación de IA en recomendación fiscal | HIGH | Motor de contradicción (≥2 niveles de discrepancia → descarte) + fallback a métrica dura | HU-06.05 | `test_contradiction.py` con casos sintéticos; tasa de falsos positivos < 5% |
| R-009 | Indisponibilidad de Belvo | MEDIUM | Modo degradado con datos cacheados + banner UI + upload manual LENS como fallback | HU-03.04, HU-07.05 | `test_degraded_mode.py` verifica transición; runbook de incidente Belvo documentado (§23.8) |
| R-010 | Indisponibilidad de Gemini | MEDIUM | Fallback a motor matemático local (HHI, IQR, Z-Score); sin dependencia de IA para decisiones | HU-06.05 (fallback) | `test_ai_vs_math.py` verifica que RiskGauge se calcula sin IA; health check cada 30s |
| R-011 | Escalamiento no autorizado de privilegios | HIGH | RBAC con roles OWNER/ADMIN/ACCOUNTANT/VIEWER; matriz RACI en SAD-Lite §4 | HU-02.05 | `test_rbac_api.ts` con intentos de acceso forzado por rol |
| R-012 | Modificación no autorizada de SAD | MEDIUM | Branch protection + code review obligatorio + política de no-forking documental | Gobierno (§1.4) | Historial de commits; PR requiere aprobación de Arquitecto |
| R-013 | Filtración de SECRET_ID/SECRET_PASSWORD Belvo | HIGH | Secrets Manager con rotación automática; zero hardcode; zero en logs | HU-03.01 (config) | Gitleaks: 0 hallazgos; `audit-code` skill: no secrets en código |
| R-014 | Datos inconsistentes Belvo ↔ Sentinel tras caída | MEDIUM | Job de reconciliación diario + dead-letter queue para webhooks fallidos | HU-03.05 | `test_belvo_reconciliation.py`; runbook de reconciliación |
| R-015 | Deriva regulatoria (cambio en UMA, 69-B, PLD) | MEDIUM | Tabla `fiscal_calendar` + parámetros versionados en `pld_rules` + ADR obligatorio por cambio | HU-04.05, HU-04.07 | Revisión anual de cumplimiento; firma de fiscalista en ADR de actualización |

---

### 23.6 Plantilla ADR estándar

Todo Architecture Decision Record en Sentinel sigue este formato inmutable. Los ADRs son append-only: una vez aceptados, no se modifican. Si una decisión cambia, el ADR original se marca `SUPERSEDED` y se crea uno nuevo con referencia al anterior.

```markdown
# ADR-NNNN: [Título descriptivo en kebab-case]

**Estado:** [Propuesto | Aceptado | Rechazado | Deprecado | Superseded]
**Fecha:** YYYY-MM-DD
**Autor:** [Nombre y rol]
**Aprobador:** [Arquitecto de Solución | CISO | Oficial de Cumplimiento]
**Supersedes:** [ADR-NNNN si aplica]
**Superseded by:** [ADR-NNNN si aplica]

---

## 1. Contexto

[Descripción del problema, decisión a tomar, restricciones, stakeholders afectados.
Incluir referencias a secciones del SAD (§X.Y), SAD-Lite o Developer Handbook que enmarcan la decisión.]

## 2. Decisión

[Descripción precisa de qué se decidió. Usar lenguaje definitivo: "Se usará X para Y". 
No usar condicionales ni ambigüedades.]

## 3. Consecuencias positivas

- [Beneficio 1: cuantificable si es posible]
- [Beneficio 2]
- [...]

## 4. Consecuencias negativas / trade-offs

- [Costo, riesgo o complejidad introducida]
- [Lo que se sacrifica con esta decisión]
- [...]

## 5. Alternativas consideradas

| Alternativa | Pros | Contras | Motivo de descarte |
|:---|:---|:---|:---|
| [Opción A] | [...] | [...] | [Razón específica] |
| [Opción B] | [...] | [...] | [Razón específica] |

## 6. Referencias

- [SAD §X.Y — Nombre de la sección]
- [SAD-Lite §X — Nombre de la sección]
- [Developer Handbook §X.Y — Nombre de la sección]
- [HU-NN.NN — Título de la historia de usuario]
- [Enlace externo si aplica (documentación oficial, RFC, ley)]
```

**Registros de ADR:** Cada ADR se documenta como una entrada en el SAD §20.2 con su número secuencial, estado, fecha, contexto, decisión, consecuencias y alternativas consideradas. El número es secuencial (0001, 0002, ...) y nunca se reutiliza aunque el ADR sea superseded. Un ADR superseded se marca explícitamente y referencia al nuevo ADR que lo reemplaza.

---

### 23.7 Plantilla spec por módulo

Cada módulo del sistema definido en el SAD §9 debe tener su especificación funcional y técnica documentada. Las especificaciones detalladas de APIs, NFRs, dependencias y criterios de aceptación por módulo se encuentran en el [Developer Handbook — Module Contracts](Developer-Handbook.md). Esta plantilla es vinculante para todos los módulos.

```markdown
---
modulo: [nombre-del-modulo]
version: [X.Y]
sad_section: "§9.X — [Nombre de la sección en SAD]"
responsable: [Nombre del Tech Lead]
orion_lead_agent: [spec-engineer | code-builder]
epica_sad: "EP-NN — [Nombre de la épica]"
hus_relacionadas: [HU-NN.NN, HU-NN.NN, ...]
---

# Spec: [Nombre del Módulo]

## 1. Descripción funcional

[Qué hace este módulo en lenguaje de negocio. 2-3 párrafos.
Cualquier lector debe entender su propósito sin conocer detalles técnicos.]

## 2. Responsabilidades

### Lo que SÍ es responsabilidad de este módulo:
- [Responsabilidad 1]
- [Responsabilidad 2]
- [...]

### Lo que NO es responsabilidad de este módulo:
- [Lo que otro módulo maneja — con referencia a cuál]
- [...]

## 3. APIs e interfaces

### 3.1 Endpoints REST (si aplica)

| Método | Ruta | Descripción | Autenticación | Roles |
|:---|:---|:---|:---|:---|
| POST | `/api/v1/[recurso]` | [Descripción] | HttpOnly JWT | OWNER, ADMIN |
| GET | `/api/v1/[recurso]/{id}` | [Descripción] | HttpOnly JWT | OWNER, ADMIN, ACCOUNTANT |

### 3.2 Contratos de entrada/salida

```json
// POST /api/v1/ejemplo
// Request:
{
  "campo_obligatorio": "string",
  "campo_opcional": "string | null"
}

// Response 200:
{
  "id": "uuid",
  "status": "created",
  "created_at": "ISO 8601"
}

// Response 422:
{
  "detail": [
    { "loc": ["body", "campo_obligatorio"], "msg": "field required" }
  ]
}
```

### 3.3 Contratos con otros módulos internos

| Módulo consumidor | Interfaz | Contrato |
|:---|:---|:---|
| [Módulo A] | [Método/función] | [Descripción del contrato: qué recibe, qué devuelve] |
| [Módulo B] | [Tópico Redis Pub/Sub] | [Formato del mensaje] |

### 3.4 Dependencias externas

| Servicio | Tipo | SLA | Plan de fallback |
|:---|:---|:---|:---|
| [API externa] | REST/HTTPS | 99.5% | [Estrategia de degradación] |

## 4. Reglas de negocio

- **RN-001:** [Descripción de la regla. Referenciar ley/artículo si aplica.]
- **RN-002:** [Descripción]
- [...]

## 5. Requisitos de calidad específicos del módulo

| NFR | Métrica | Objetivo | Medición |
|:---|:---|:---|:---|
| Latencia | p95 | < X ms | OpenTelemetry trace |
| Throughput | rps | > X rps | k6 load test |
| Disponibilidad | SLA | 99.X% | Prometheus uptime |
| Seguridad | [Requisito] | [Especificación] | [Herramienta de verificación] |
| Trazabilidad | [Requisito] | [Especificación] | [Log / auditoría] |

## 6. Dependencias del módulo

### Módulos internos que consume:
- [Módulo X] — para [propósito]

### Servicios externos que consume:
- [Servicio Y] — para [propósito]

### Datos que produce:
- [Tabla o evento que este módulo escribe]

### Datos que consume:
- [Tabla o evento que este módulo lee]

## 7. Casos de prueba de alto nivel

### Escenario 1: [Nombre del escenario — flujo feliz]
- **Precondición:** [Estado inicial del sistema]
- **Acción:** [Lo que hace el usuario o el sistema]
- **Resultado esperado:** [Estado final, respuesta HTTP, datos persistidos]

### Escenario 2: [Nombre del escenario — error manejado]
- **Precondición:** [Estado inicial]
- **Acción:** [Lo que falla]
- **Resultado esperado:** [Manejo del error, respuesta, logs]

### Escenario 3: [Nombre del escenario — modo degradado]
- **Precondición:** [Dependencia externa no disponible]
- **Acción:** [Operación solicitada]
- **Resultado esperado:** [Respuesta degradada, sin crash]

## 8. Criterios de aceptación para Compliance-QA

- [ ] ¿El código usa solo el stack definido en SAD §7.1 (Stack tecnológico)?
- [ ] ¿Los endpoints HTTP emiten spans de OpenTelemetry con método, ruta, status, duración?
- [ ] ¿No hay PII en logs (ADR-0004)?
- [ ] ¿Las llamadas a servicios externos tienen timeout configurado?
- [ ] ¿El código incluye manejo de fallback donde el SAD §16.7 (Fallback IA) lo exige?
- [ ] ¿Los tests cubren los escenarios de la sección 7 de esta spec?
- [ ] ¿El PR referencia la HU y el módulo del SAD correspondientes?
- [ ] ¿Si hay nueva dependencia de npm/pip, hay ADR aprobado?
- [ ] ¿El código pasa Trivy sin CVEs críticos o altos?
- [ ] ¿Se respeta el aislamiento RLS en todas las queries a base de datos?
```

---

### 23.8 Runbooks de incidentes

#### 23.8.1 Runbook: Caída de Belvo Fiscal API

| Campo | Valor |
|:---|:---|
| **ID Incidente** | `INC-BELVO-001` |
| **Severidad** | Sev2 — Degradación de servicio |
| **Síntoma** | Health check `GET https://api.belvo.com/api/` retorna error o timeout > 5s. Webhooks dejan de llegar. |
| **Detección** | Prometheus: `belvo_api_up == 0` por > 2 muestras consecutivas (60s). Alerta en Grafana → Slack #sentinel-sre. |

**Procedimiento:**

1. **Verificar (2 min):**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://api.belvo.com/api/
   # Esperado: 200. Si no → confirmado.
   ```
   Consultar https://status.belvo.com para verificar si es incidente declarado.

2. **Activar modo degradado (inmediato):**
   ```python
   # Core FastAPI activa flag global:
   BELVO_DEGRADED = True  # Application state
   ```
   - Banner amarillo en UI: "SAT momentáneamente no disponible. Mostrando datos de última sincronización."
   - Bloquear creación de nuevos links Belvo (POST `/belvo/widget-token` → 503).
   - GET `/belvo/sync-status/{id}` → informa `degraded_since: <timestamp>`.

3. **Habilitar ingesta manual LENS como contingencia:**
   - Reactivar endpoint de upload ZIP/XML si estaba deshabilitado.
   - Banner indica: "Puedes cargar tus facturas manualmente mientras restablecemos la conexión."

4. **Monitorear recuperación (cada 5 min):**
   ```bash
   while true; do
     STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.belvo.com/api/)
     echo "$(date -Iseconds) Belvo status: $STATUS"
     sleep 300
   done
   ```

5. **Restaurar servicio:**
   - `BELVO_DEGRADED = False`.
   - Ejecutar job de reconciliación `reconcile_belvo_syncs` para todos los links afectados.
   - Verificar webhooks pendientes en dead-letter queue.

6. **Post-mortem (24h post-resolución):**
   - Documentar duración total, facturas perdidas (si las hubo), causa raíz.
   - Si duración > 4h, evaluar activación de plan de contingencia con carga manual masiva.

**Contactos:** Belvo support — support@belvo.com / Dashboard → Support.

---

#### 23.8.2 Runbook: Webhook de Belvo no recibido tras sincronización

| Campo | Valor |
|:---|:---|
| **ID Incidente** | `INC-WEBHOOK-001` |
| **Severidad** | Sev3 — Retraso en datos |
| **Síntoma** | Link creado hace > 30 min (`belvo_status = 'pending' AND belvo_last_sync_at IS NULL`). Usuario ve "Sincronizando..." sin progreso. |

**Procedimiento:**

1. **Verificar que el webhook está registrado en Belvo:**
   ```bash
   curl -s https://api.belvo.com/api/webhooks/ \
     -u "$BELVO_SECRET_ID:$BELVO_SECRET_PASSWORD" | jq '.results[] | select(.url | contains("sentinel"))'
   ```

2. **Reenviar webhook manualmente desde dashboard Belvo** (si disponible) o forzar sync:
   ```python
   # Forzar sincronización sin esperar webhook
   from backend.services.belvo_adapter import BelvoAdapter
   adapter = BelvoAdapter()
   await adapter.force_sync_invoices(link_id="lnk_xxx")
   ```

3. **Si el problema es recurrente (>3 ocurrencias en 24h):**
   - Verificar latencia del endpoint de webhook: `GET /webhooks/belvo` debe responder en < 1s.
   - Verificar IP allowlist: ¿la IP de Belvo cambió?
   - Escalar a Belvo support con `event_id` y `link_id`.

---

#### 23.8.3 Runbook: Transición masiva 69-B (múltiples RFCs → definitivo)

| Campo | Valor |
|:---|:---|
| **ID Incidente** | `INC-69B-001` |
| **Severidad** | Sev1 — Impacto regulatorio |
| **Síntoma** | ETL nocturno detecta > 10 RFCs en transición `presunto→definitivo` en una sola ejecución. Múltiples alertas CRITICAL disparadas. |

**Procedimiento:**

1. **Verificar la publicación del DOF:**
   ```bash
   curl -s "https://dof.gob.mx/[ruta_edicion]" | grep -c "69-B"
   ```

2. **Notificar a todos los tenants afectados (inmediato):**
   - Alertas en aplicación marcadas como CRITICAL con `requires_immediate_action: true`.
   - Email a OWNER/ADMIN de cada tenant con RFCs afectados.
   - Dashboard muestra badge rojo con conteo de RFCs en definitivo.

3. **Activar bloqueo de pagos:**
    - Para cada RFC en `definitivo`, marcar facturas asociadas en la tabla `invoices` con `review_required = true`.
    - API de transacciones rechaza nuevas operaciones hacia estos RFCs.

4. **Generar reporte de impacto:**
    ```sql
    SELECT t.tenant_id, t.name, COUNT(i.invoice_id) as facturas_afectadas,
           SUM(i.amount) as monto_total_riesgo
    FROM invoices i
    JOIN tax_profiles tp ON i.tax_profile_id = tp.tax_profile_id
    JOIN tenants t ON tp.tenant_id = t.tenant_id
    WHERE i.status_69b = 'definitivo'
    GROUP BY t.tenant_id, t.name;
    ```

5. **Post-mortem obligatorio (72h):**
   - Revisar si el ETL detectó la transición dentro del SLA de 24h.
   - Documentar tenant, RFCs, facturas y montos afectados.
    - Actualizar bitácora de cumplimiento para auditoría regulatoria.

---

# 24. Backlog de Producto y Épicas Técnicas (v3.2.0-MASTER — Post-Auditoría)

> **Nota de saneamiento (ADR-0010):** El backlog detallado de Historias de Usuario (redactadas, pendientes, renumeradas) se ha extraído a un documento independiente para evitar deriva documental y facilitar el trabajo concurrente de Producto, QA y Desarrollo sin contaminar el corazón arquitectónico del SAD.

**Documento canónico del backlog:** [BACKLOG-HU.md](BACKLOG-HU.md)

---

### 24.1 Metodología y Golden Template

El formato estándar de Historia de Usuario, la Definition of Done canónica y las reglas de construcción del backlog se documentan en [BACKLOG-HU.md §1](BACKLOG-HU.md#1-metodología-y-golden-template). Todo miembro del equipo —humano o agente IA— debe seguir este estándar.

Principios obligatorios:
1. **Anclaje documental estricto.** Toda HU referencia secciones del SAD, SAD-Lite y/o Developer Handbook + ADRs relevantes.
2. **No replicar detalles de implementación.** Las HUs son contratos funcionales. El Developer Handbook contiene DDL, código, YAML, regex.
3. **Granularidad de sprint.** Una HU debe poder implementarse en 1 sprint por un squad completo.
4. **Trazabilidad a flujos críticos.** Relación clara con SAD §10 (flujos críticos).

### 24.2 Mapa de dependencias entre épicas (orden de construcción)

```
EP-01 (Aislamiento RLS y Motor de Datos)
  └──► EP-02 (Identidad Corporativa y Seguridad Defensiva)
         └──► EP-03 (Ingesta Resiliente Belvo/LENS)
                └──► EP-04 (Motor de Riesgo, PLD y 69-B)
                       ├──► EP-05 (Vault e Inmutabilidad NOM-151)
                       ├──► EP-06 (AI Proxy y Copiloto Fiscal)
                       └──► EP-07 (Tactical HUD y UI de Cumplimiento)
```

**Reglas de dependencia:**
- EP-01 bloquea cualquier HU que lea/escriba datos multi-tenant.
- EP-02 bloquea cualquier HU que asuma roles, permisos o preferencias de usuario.
- EP-03 bloquea el motor de riesgo, PLD y HUD (se requieren datos).
- EP-04 bloquea Vault, IA y HUD para métricas y alertas.
- EP-05, EP-06 y EP-07 se construyen concurrentemente sobre la base de las anteriores.

### 24.3 Catálogo resumido de épicas (v3.1.1)

| Épica | Dominio | HUs actuales | Estado |
|:---|:---|:---:|:---|
| EP-01 | Aislamiento RLS y Motor de Datos Transaccional | 6 | 3 ✅ / 3 ⬜ |
| EP-02 | Identidad Corporativa y Seguridad Defensiva (Auth & 2FA) | 6 | 5 ✅ / 1 ⬜ |
| EP-03 | Ingesta Resiliente (Belvo API y Carga LENS) | 6 | 4 ✅ / 2 ⬜ |
| EP-04 | Motor de Riesgo Compuesto, PLD y Screening 69-B | 9 | 4 ✅ / 5 ⬜ |
| EP-05 | Vault e Inmutabilidad de Evidencia Legal (NOM-151) | 6 | 3 ✅ / 3 ⬜ |
| EP-06 | Inteligencia Proactiva Resiliente (AI Proxy y Copiloto Fiscal) | 6 | 4 ✅ / 2 ⬜ |
| EP-07 | Tactical HUD y UI de Cumplimiento (Frontend Liquid Glass) | 6 | 2 ✅ / 4 ⬜ |
| **Total** | | **45 HUs** | **25 redactadas ✅ + 20 pendientes ⬜** |

> **Nota:** 4 HUs fueron renumeradas durante la corrección post-auditoría (ADR-0010). Ver tabla de equivalencias en [BACKLOG-HU.md §3.1](BACKLOG-HU.md#31-correcciones-de-auditoría-aplicadas).

### 24.4 Expansión planificada del backlog

Para alcanzar la madurez operativa del producto, se planifica expandir de 45 a 120+ HUs en 14 épicas. Ver [BACKLOG-HU.md §7](BACKLOG-HU.md#7-expansión-planificada-del-backlog) para el roadmap de expansión.

### 24.5 Referencias

- [BACKLOG-HU.md](BACKLOG-HU.md) — Catálogo completo de HUs, Golden Template, DoD, matriz de trazabilidad.
- [Developer-Handbook.md](Developer-Handbook.md) §8 — Contratos de módulo y recetas de implementación.
- [ADR-0010](#adr-0010--normalización-y-corrección-del-corpus-documental-v311) — Normalización del corpus documental.
- Auditoría externa Mayo 2026 — Hallazgos y plan de corrección.

---

