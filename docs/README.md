# 📚 DOCUMENTACIÓN — Firma Digital Sentinel v4.1

> **Versión:** 4.1 (Build 4009) | **Fecha:** 27 Mayo 2026  
> **Auditoría:** 6 archivos, 0 links rotos, 100% sprints cubiertos

---

## Los 6 Archivos

| # | Archivo | Propósito | Líneas | Audiencia |
|---|---------|-----------|--------|-----------|
| 1 | **[SAD.md](./SAD.md)** | Arquitectura de Software completa | ~400 | Arquitectos, Devs |
| 2 | **[SAD-Lite.md](./SAD-Lite.md)** | Visión de negocio y onboarding | ~170 | C-Level, Diseñadores |
| 3 | **[Developer-Handbook.md](./Developer-Handbook.md)** | Patrones, convenciones, protocolos | ~350 | Desarrolladores |
| 4 | **[BACKLOG-HU.md](./BACKLOG-HU.md)** | 26 Historias de Usuario (Golden Template) | ~400 | Product, QA |
| 5 | **[README.md](./README.md)** | Este índice — referencia rápida | ~70 | Todos |
| 6 | **[GUIA_NOTEBOOKLM.md](./GUIA_NOTEBOOKLM.md)** | Configuración para asistente AI | ~30 | Devs, AI users |

---

## Cómo encontrar lo que buscas

| Pregunta | Ir a |
|----------|------|
| ¿Cómo funciona el motor F1? | [SAD.md §5](./SAD.md#5-arquitectura-de-módulos) |
| ¿Cómo se despliega? | [SAD.md §7](./SAD.md#7-arquitectura-de-despliegue) |
| ¿Qué patrones de código usamos? | [Developer-Handbook.md §1](./Developer-Handbook.md#1-patrones-arquitectónicos-institucionalizados) |
| ¿Cómo hacer un commit? | [Developer-Handbook.md §3](./Developer-Handbook.md#3-protocolo-de-git) |
| ¿Cuáles son las reglas CSS? | [Developer-Handbook.md §2.2](./Developer-Handbook.md#22-css3) |
| ¿Qué se construyó en cada sprint? | [BACKLOG-HU.md §4](./BACKLOG-HU.md#4-resumen-por-sprint) |
| ¿Cómo funciona la vibración? | [SAD.md §5.2](./SAD.md#52-haptic-vibración-multi-plataforma) |
| ¿Cómo funciona el unlock sensorial? | [SAD.md §5.4](./SAD.md#54-unlocksensors-desbloqueo-sensorial) |
| ¿Qué es el Pulso Digital Espacial? | [Developer-Handbook.md PATTERN-08](./Developer-Handbook.md#pattern-08-pulso-digital-espacial-audio-scroll) |

---

## Resumen del Backlog

| Épica | Sprint | HU Count | Build |
|-------|--------|----------|-------|
| EP-01: Golden Master + Frente 2 | v3.1 | 5 | `?v=3.1` |
| EP-02: Estabilización | v3.3 | 5 | `?v=3.3` |
| EP-03: Haptic + Scroll/Modal | v3.4 | 5 | `?v=cb2` |
| EP-04: Documentación + F1 Video | v4.0 | 5 | `?v=4008` |
| EP-05: Audio 3D + Pulso Digital | v4.1 | 6 | `?v=4009` |
| **TOTAL** | | **26 HU** | |

---

## Valores Canónicos

| Parámetro | Valor |
|-----------|-------|
| AudioContext | Web Audio API + AudioBufferSourceNode |
| Paneo 3D | StereoPannerNode (-0.2 → 0.2 en 4s) |
| Scroll ticks | Sine puro: 660 / 784 / 1047 Hz |
| Reverb | DelayNode 40ms, feedback 30% |
| Haptic iOS | Ghost checkbox `<input type="checkbox" switch>` |
| Rate limit audio | 80ms interno + 150ms global |
| Rate limit haptic | 40ms |
| Rescue timer | 4.5s |
| Build gate | `new Function(mainJsContent)` |
| CSP | `.htaccess` como fuente canónica única |

---

## Reglas de Oro

1. **El SAD es la fuente única de verdad.** Cualquier cambio arquitectónico se registra primero en SAD.md
2. **El código va en Developer-Handbook.md, nunca en las historias de usuario.**
3. **Las HU usan el Golden Template.** Given/When/Then obligatorio. Criterios de aceptación numerados.
4. **Nunca reescribir main.js completo.** Merge quirúrgico. Commit antes de tocar.
5. **El build gate aborta si hay errores.** `new Function()` es la última línea de defensa.
6. **Los documentos se sincronizan en cascada.** SAD → SAD-Lite → Dev-HB → BACKLOG-HU.

---

*© 2026 Nexus 360 iA — Arquitectura de Alto Rango.*
