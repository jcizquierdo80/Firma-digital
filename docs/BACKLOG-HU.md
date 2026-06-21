# BACKLOG DE HISTORIAS DE USUARIO (HU)
## Firma Digital Sentinel — F1 Cinematic v4.1
**Golden Template — 26 Historias de Usuario en 5 Épicas**

---

## 0. Control Documental

**Versión:** 4.1.0-MASTER | **Fecha:** 27 Mayo 2026 | **Autor:** Equipo Orion / Cesar Segura  
**Sincronizado con:** [SAD.md](./SAD.md) • [SAD-Lite.md](./SAD-Lite.md) • [Developer-Handbook.md](./Developer-Handbook.md)

---

## 1. Golden Template

Cada historia de usuario sigue el formato estándar:

```
### HU-NN.NN — Título
**Épica:** EP-NN **Módulo(s):** ...
**Historia:** Como [rol], quiero [acción] para [beneficio]
**Alcance:** ...
**Given/When/Then:** ...
**Prerrequisitos y reglas de negocio:** ...
**Criterios de aceptación:** ...
**Impactos y consideraciones:** ...
**Referencias y trazabilidad:** ...
```

---

## 2. Tabla Maestra de Historias

| Épica | Sprint | HU Count | Estado |
|-------|--------|----------|--------|
| EP-01: Golden Master + Frente 2 | v3.1 | HU-01.01 a HU-01.05 | ✅ |
| EP-02: Estabilización | v3.3 | HU-02.01 a HU-02.05 | ✅ |
| EP-03: Haptic + Scroll/Modal | v3.4 | HU-03.01 a HU-03.05 | ✅ |
| EP-04: Documentación + F1 Video | v4.0 | HU-04.01 a HU-04.05 | ✅ |
| EP-05: Audio 3D + Pulso Digital | v4.1 | HU-05.01 a HU-05.06 | ✅ |

---

## ÉPICA 01: Golden Master + Frente 2 (v3.1)

### HU-01.01 — Motor Visual Neuronal 3D
**Épica:** EP-01 **Módulo(s):** Canvas, JS  
**Historia:** Como visitante, quiero ver un fondo interactivo con neuronas animadas para sentir una experiencia inmersiva desde el primer segundo.  
**Alcance:** Canvas 2D con motor neuronal 3D, pulsos entre neuronas, dendritas reactivas al mouse.  
**Given/When/Then:**
- **Given** que la página carga completamente
- **When** el canvas se renderiza
- **Then** las neuronas son visibles con pulsos y dendritas reactivas al mouse  
**Criterios de aceptación:**
1. Canvas `#bg-canvas` visible con z-index negativo
2. Neuronas, dendritas y pulsos renderizados correctamente  
**Referencias:** SAD.md §5.3, Developer-Handbook.md PATTERN-01

### HU-01.02 — Hero y Servicios
**Épica:** EP-01 **Módulo(s):** HTML, CSS  
**Historia:** Como visitante, quiero ver la foto de perfil, nombre y servicios al cargar la página.  
**Alcance:** Sección hero con imagen, nombre, título, badges. Tres glass cards de servicios.  
**Given/When/Then:**
- **Given** que el loader se ha ocultado
- **When** los elementos `.reveal` aparecen
- **Then** el hero, nombre y glass cards son visibles con stagger de 150ms  
**Criterios de aceptación:**
1. Hero visible con foto de perfil y nombre profesional
2. Tres glass cards visibles con hover effect 3D  
**Referencias:** SAD.md §5.4

### HU-01.03 — Orb Hub Flotante
**Épica:** EP-01 **Módulo(s):** JS, CSS, SVG  
**Historia:** Como visitante, quiero un menú flotante interactivo con diseño de volante F1 para acceder a funciones clave.  
**Given/When/Then:**
- **Given** que el hub está visible
- **When** hago click en el volante F1
- **Then** el menú se abre/cierra con animación, sonido y vibración  
**Criterios de aceptación:**
1. Hub rota en hover/active
2. Apertura/cierre con sonido UI y vibración
3. `stopPropagation()` aísla eventos internos  
**Referencias:** Developer-Handbook.md PATTERN-02

### HU-01.04 — Modal de Contacto + vCard
**Épica:** EP-01 **Módulo(s):** JS, Wallet API  
**Historia:** Como visitante, quiero guardar el contacto en mi teléfono o billetera digital.  
**Alcance:** Modal con vCard download, Wallet (Apple/Google), NFC, QR, Calendly.  
**Given/When/Then:**
- **Given** que el modal de contacto está abierto
- **When** presiono "Guardar Contacto"
- **Then** se descarga un archivo .vcf o se abre Web Share API  
**Criterios de aceptación:**
1. vCard descargable con nombre, teléfono, email, web
2. Wallet buttons visibles (Apple/Google)
3. QR generado apuntando a la URL del sitio
4. Calendly widget funcional  
**Referencias:** SAD.md §2

### HU-01.05 — Loader Cinemático
**Épica:** EP-01 **Módulo(s):** HTML, CSS, JS  
**Historia:** Como visitante, quiero ver una animación de carga atractiva mientras el sitio se prepara.  
**Alcance:** Loader Nexus con animación F1, ocultamiento con fade, rescue timer.  
**Given/When/Then:**
- **Given** que la página se está cargando
- **When** los recursos están listos (mínimo 2.2s)
- **Then** el loader se oculta con fade y los elementos aparecen  
**Criterios de aceptación:**
1. Loader visible durante mínimo 2.2s
2. Rescue timer de 4.5s fuerza reveal si algo falla
3. `SoundManager._pendingEngineStart = true` al ocultar  
**Referencias:** Developer-Handbook.md PATTERN-05, SAD.md §5.4

---

## ÉPICA 02: Estabilización Post-Frente 2 (v3.3)

### HU-02.01 — Restauración de Motor Neuronal
**Épica:** EP-02 **Módulo(s):** JS, Git  
**Historia:** Como desarrollador, necesito restaurar el motor neuronal 3D (~300 líneas) que fue eliminado accidentalmente durante la reescritura del Frente 2.  
**Alcance:** Recuperar desde git `05589ae:assets/js/main.js`. Verificar que neuronas, pulsos y dendritas son visibles.  
**Given/When/Then:**
- **Given** que el código fue eliminado en reescritura
- **When** ejecuto `git show HEAD:assets/js/main.js`
- **Then** el motor neuronal se restaura y el canvas vuelve a mostrar neuronas interactivas  
**Criterios de aceptación:**
1. `grep "initNeurons\|class Neuron" assets/js/main.js` devuelve > 0
2. Canvas muestra neuronas, pulsos y dendritas correctamente  
**Referencias:** Developer-Handbook.md PATTERN-01, SAD.md §10 (ADR-03)

### HU-02.02 — Build System Reparado
**Épica:** EP-02 **Módulo(s):** Node.js, build.js  
**Historia:** Como desarrollador, necesito que `node build.js` funcione correctamente para empaquetar el sitio.  
**Alcance:** Reescribir build.js de regex inline → copia directa de archivos. Agregar gate de seguridad.  
**Given/When/Then:**
- **Given** que el build anterior usaba regex rotos
- **When** ejecuto `node build.js`
- **Then** el ZIP se genera correctamente con todos los archivos  
**Criterios de aceptación:**
1. `node build.js` completa sin errores
2. ZIP contiene index.html, assets/, media/, .htaccess
3. Gate de seguridad valida sintaxis JS  
**Referencias:** Developer-Handbook.md PATTERN-06

### HU-02.03 — CSP Consolidada
**Épica:** EP-02 **Módulo(s):** .htaccess, HTML  
**Historia:** Como administrador, quiero una única fuente canónica de CSP para evitar divergencias de seguridad.  
**Alcance:** Eliminar `<meta http-equiv="Content-Security-Policy">` de index.html. Dejar solo `.htaccess` como fuente.  
**Given/When/Then:**
- **Given** que existían 3 CSPs divergentes
- **When** se consolida en `.htaccess`
- **Then** solo una CSP canónica existe en el servidor  
**Criterios de aceptación:**
1. Sin meta tag CSP en index.html
2. `.htaccess` contiene la CSP canónica completa  
**Referencias:** SAD.md §6.1

### HU-02.04 — CSS Deduplicado y Panel Debug Eliminado
**Épica:** EP-02 **Módulo(s):** CSS, JS  
**Historia:** Como desarrollador, quiero un código limpio sin duplicados ni herramientas de debug en producción.  
**Alcance:** Eliminar bloque CSS minificado duplicado en main.css. Remover `Debug.init()` y elementos `debug-trigger`/`debug-panel` de main.js e index.html.  
**Given/When/Then:**
- **Given** que el CSS tenía ~50% de contenido duplicado
- **When** se elimina el bloque duplicado
- **Then** el peso del CSS se reduce y el debug no es accesible en producción  
**Criterios de aceptación:**
1. CSS sin bloques minificados duplicados
2. Sin referencias a `debug-trigger` o `debug-panel` en HTML/JS  
**Referencias:** SAD.md §6.3

### HU-02.05 — Teléfono Unificado
**Épica:** EP-02 **Módulo(s):** JS  
**Historia:** Como visitante, quiero que el número de teléfono sea consistente en todos los puntos de contacto.  
**Alcance:** Unificar `CONTACT_DATA.phone` y `CONTACT_DATA.whatsapp` con el número correcto en un solo lugar.  
**Given/When/Then:**
- **Given** que existían dos números distintos (WhatsApp vs vCard)
- **When** se unifican en `CONTACT_DATA`
- **Then** todos los botones de contacto usan el mismo número  
**Criterios de aceptación:**
1. WhatsApp link y vCard usan el mismo número
2. `CONTACT_DATA` es la única fuente de verdad para datos de contacto  
**Referencias:** SAD.md §6.3

---

## ÉPICA 03: Haptic + Scroll/Modal v2 (v3.4)

### HU-03.01 — Ghost Checkbox Haptic iOS
**Épica:** EP-03 **Módulo(s):** HTML, JS  
**Historia:** Como usuario de iPhone, quiero sentir vibración al interactuar con la página.  
**Alcance:** Implementar `<input type="checkbox" switch>` + `<label>` oculto. `label.click()` dispara Taptic Engine.  
**Given/When/Then:**
- **Given** que estoy en Safari iOS 17.4+
- **When** hago scroll o interactúo con la UI
- **Then** siento vibración háptica del Taptic Engine  
**Criterios de aceptación:**
1. Elementos `#__haptic_switch__` y `#__haptic_label__` existen en el DOM
2. `label.click()` se ejecuta en cada interacción
3. Vibración perceptible en iPhone  
**Referencias:** Developer-Handbook.md PATTERN-03, SAD.md §5.2

### HU-03.02 — Scroll Modal Lock Fix
**Épica:** EP-03 **Módulo(s):** JS, CSS  
**Historia:** Como usuario, quiero que el scroll del fondo se detenga al abrir un modal sin trabarse en iOS.  
**Alcance:** Usar `#appShell.modal-open` en lugar de `document.body.style.overflow`. Transición opacity 0.2s.  
**Given/When/Then:**
- **Given** que un modal está abierto
- **When** intento hacer scroll en el fondo
- **Then** el fondo no se mueve y el modal responde correctamente al cierre  
**Criterios de aceptación:**
1. `#appShell.modal-open { overflow: hidden; touch-action: none }`
2. `rubberPaused` se activa al cerrar modal, se desactiva en `transitionend`
3. Sin hit-testing lag en iOS Safari  
**Referencias:** Developer-Handbook.md PATTERN-02

### HU-03.03 — F1 Telemetry Engine V3
**Épica:** EP-03 **Módulo(s):** Canvas, JS  
**Historia:** Como visitante, quiero ver un fondo de telemetría F1 interactivo en lugar del motor neuronal.  
**Alcance:** Grid perspectiva, HUD broadcast (DRS/ERS), chispas, speed lines, RPM bar, sector labels.  
**Given/When/Then:**
- **Given** que la página está cargada
- **When** el canvas se renderiza
- **Then** el grid de perspectiva, HUD y elementos F1 son visibles y reaccionan al giroscopio  
**Criterios de aceptación:**
1. Grid perspectiva con punto de fuga dinámico
2. HUD con brackets, DRS/ERS, RPM bar
3. Sector labels: S1 Auditoría, S2 Arquitectura, S3 Talento  
**Referencias:** SAD.md §5.3, SAD-Lite.md §2

### HU-03.04 — Scroll Multi-Modo F1
**Épica:** EP-03 **Módulo(s):** JS, Audio, Haptic  
**Historia:** Como visitante, quiero que el scroll produzca feedback sensorial diferenciado según la velocidad.  
**Alcance:** Clasificación GLIDE (<0.8 px/ms), RACE (0.8-2.0), OVERTAKE (>2.0). Audio, haptic y canvas por modo.  
**Given/When/Then:**
- **Given** que estoy haciendo scroll en la página
- **When** la velocidad supera los umbrales
- **Then** el audio, vibración y canvas cambian según el modo  
**Criterios de aceptación:**
1. Tres modos diferenciados por velocidad
2. Rate-limit 150ms entre ticks
3. Canvas responde con sparks/speed lines según modo  
**Referencias:** Developer-Handbook.md PATTERN-04, SAD.md §8

### HU-03.05 — Logging v2
**Épica:** EP-03 **Módulo(s):** JS  
**Historia:** Como desarrollador, quiero logs de errores y eventos para diagnosticar problemas en producción.  
**Alcance:** `window.addEventListener('error')`, `unhandledrejection`, persistencia en `sessionStorage`.  
**Given/When/Then:**
- **Given** que ocurre un error en producción
- **When** el error es capturado por el listener global
- **Then** el error se registra con timestamp, tipo y ubicación  
**Criterios de aceptación:**
1. Errores JS capturados globalmente
2. Promesas sin catch capturadas
3. Logs persisten en sessionStorage (últimos 50)  
**Referencias:** SAD.md §9

---

## ÉPICA 04: Documentación + F1 Video (v4.0)

### HU-04.01 — Video F1 de Fondo
**Épica:** EP-04 **Módulo(s):** HTML, Media  
**Historia:** Como visitante, quiero ver un video cinemático de F1 como fondo de la página.  
**Alcance:** `f1-bg.webm` en loop con fallback `f1-bg.mp4`. Poster `f1-poster.jpg`.  
**Given/When/Then:**
- **Given** que la página carga
- **When** el navegador soporta WebM
- **Then** el video F1 se reproduce en loop detrás del contenido  
**Criterios de aceptación:**
1. `f1-bg.webm` en loop con `playsinline`
2. Fallback `f1-bg.mp4` si WebM no soportado
3. Poster visible mientras carga  
**Referencias:** SAD-Lite.md §4

### HU-04.02 — Sistema de Documentación
**Épica:** EP-04 **Módulo(s):** Docs  
**Historia:** Como desarrollador, necesito documentación completa del ecosistema en un solo lugar.  
**Alcance:** PATTERNS.md, CHANGELOG.md, SYSTEM_CHARTER.md, CODE_MAP.md, DEPLOYMENT_GUIDE.md, DOMAIN_MAP.md, BUSINESS_FLOWS.md.  
**Given/When/Then:**
- **Given** que el proyecto alcanzó v4.0
- **When** accedo a la carpeta .opencode/team/docs/
- **Then** encuentro documentación completa del ecosistema  
**Criterios de aceptación:**
1. 11 patrones documentados en PATTERNS.md
2. CHANGELOG con todos los sprints
3. Documentos sincronizados con el estado del código  
**Referencias:** README.md, SAD.md §11

### HU-04.03 — Server Restart y Verificación
**Épica:** EP-04 **Módulo(s):** Ops  
**Historia:** Como administrador, necesito que el servidor local funcione correctamente para desarrollo.  
**Given/When/Then:**
- **Given** que el servidor previo estaba caído
- **When** inicio Python HTTP Server en puerto 8080
- **Then** todos los recursos responden con 200/304  
**Criterios de aceptación:**
1. `index.html` → 304
2. `f1-bg.webm` → 200
3. `main.js` y `main.css` → 304  
**Referencias:** SAD.md §7

### HU-04.04 — Build Output v4.0
**Épica:** EP-04 **Módulo(s):** Build  
**Historia:** Como desarrollador, quiero un ZIP de producción listo para desplegar con todos los assets F1.  
**Given/When/Then:**
- **Given** que ejecuto `node build.js`
- **When** el build completa sin errores
- **Then** `FirmaDigital_v4.0.zip` contiene todos los archivos necesarios  
**Criterios de aceptación:**
1. Build sin errores
2. ZIP contiene index.html, assets/, media/, .htaccess
3. JS validado sintácticamente  
**Referencias:** Developer-Handbook.md §4

### HU-04.05 — Rescue Protocol Implementado
**Épica:** EP-04 **Módulo(s):** JS  
**Historia:** Como usuario, no quiero quedarme con pantalla negra si algo falla durante la carga.  
**Alcance:** Rescue timer de 4.5s que fuerza el ocultamiento del loader.  
**Given/When/Then:**
- **Given** que la carga está tardando más de lo esperado
- **When** pasan 4.5 segundos
- **Then** el loader se oculta automáticamente y el contenido es visible  
**Criterios de aceptación:**
1. Loader se oculta a los 4.5s máximo
2. Contenido `.reveal` aparece incluso si hubo error  
**Referencias:** Developer-Handbook.md PATTERN-05

---

## ÉPICA 05: Audio 3D + Pulso Digital + Docs Consolidados (v4.1)

### HU-05.01 — AudioBuffer 3D Engine Start
**Épica:** EP-05 **Módulo(s):** Audio, JS  
**Historia:** Como usuario, quiero escuchar el rugido de un motor F1 real con sonido envolvente 3D al tocar la pantalla.  
**Alcance:** `AudioBufferSourceNode` con `f1-engine.mp3` cargado en memoria. `StereoPannerNode` para paneo izquierda-derecha.  
**Given/When/Then:**
- **Given** que toco la pantalla por primera vez
- **When** `unlockSensors()` ejecuta la secuencia de unlock
- **Then** el motor suena con paneo 3D moviéndose de izquierda a derecha  
**Criterios de aceptación:**
1. `F1_SAMPLE_BUFFER` cargado via `fetch` + `decodeAudioData`
2. `StereoPannerNode` con pan de -0.2 a 0.2 en 4 segundos
3. Latencia < 100ms tras unlock  
**Referencias:** Developer-Handbook.md PATTERN-08, SAD.md §5.1

### HU-05.02 — Pulso Digital Espacial (Scroll Audio)
**Épica:** EP-05 **Módulo(s):** Audio, JS  
**Historia:** Como usuario, quiero que el sonido del scroll sea agradable, moderno y no fatigante.  
**Alcance:** Ondas sine puras con notas musicales (Mi 660Hz / Sol 784Hz / Do 1047Hz), stereo spread ±3Hz, reverb sintética con DelayNode + feedback.  
**Given/When/Then:**
- **Given** que estoy haciendo scroll en la página
- **When** el sistema dispara un tick de audio
- **Then** escucho un pulso limpio con nota musical y eco espacial  
**Criterios de aceptación:**
1. Solo ondas sine (sin sawtooth, sin square)
2. Notas musicales: 660Hz, 784Hz, 1047Hz según modo
3. Stereo spread ±3Hz con DelayNode (40ms, feedback 30%)
4. Duración 150ms con decaimiento exponencial
5. Volumen ≤ 2% en todos los modos  
**Referencias:** Developer-Handbook.md PATTERN-08, SAD.md §8

### HU-05.03 — Defensa Multi-Capa Anti-Unlock
**Épica:** EP-05 **Módulo(s):** JS  
**Historia:** Como desarrollador, necesito que el sistema de unlock sensorial sea robusto contra activaciones accidentales.  
**Alcance:** 5 capas de defensa en `unlockSensors()`: stopPropagation, flag programmaticClick, isTrusted, removeEventListener manual, solo eventos click/keydown.  
**Given/When/Then:**
- **Given** que un click programático de `_iosClick()` intenta activar el unlock
- **When** el evento llega a `unlockSensors()`
- **Then** es rechazado por al menos una de las 5 capas de defensa  
**Criterios de aceptación:**
1. `label.click()` desde scroll NO activa `unlockSensors`
2. Click real del usuario SÍ activa `unlockSensors`
3. Cero errores de AudioContext en consola
4. Cero warnings de navigator.vibrate en consola  
**Referencias:** Developer-Handbook.md PATTERN-07, SAD.md §5.4

### HU-05.04 — iOS Haptic Liberado
**Épica:** EP-05 **Módulo(s):** JS, Haptic  
**Historia:** Como usuario de iPhone, quiero sentir vibración al hacer scroll inmediatamente, sin tener que hacer click antes.  
**Alcance:** Eliminar gate `if (!this._unlocked) return` de `_iosClick()`. Usar `stopPropagation` como escudo.  
**Given/When/Then:**
- **Given** que hago scroll en iPhone sin haber hecho click previo
- **When** el sistema llama a `Haptic.scrollTick()`
- **Then** siento vibración háptica inmediata sin errores de AudioContext  
**Criterios de aceptación:**
1. `_iosClick()` funciona sin verificar `_unlocked`
2. `stopPropagation` previene bubbling al document
3. Rate-limit 40ms entre disparos hápticos  
**Referencias:** Developer-Handbook.md PATTERN-03, SAD.md §5.2

### HU-05.05 — Documentación Consolidada
**Épica:** EP-05 **Módulo(s):** Docs  
**Historia:** Como stakeholder, quiero documentación limpia y centralizada en un solo lugar, basada en el modelo empresarial de referencia.  
**Alcance:** Consolidar 16+ documentos en 6 archivos: SAD.md, SAD-Lite.md, Developer-Handbook.md, BACKLOG-HU.md, README.md, GUIA_NOTEBOOKLM.md.  
**Given/When/Then:**
- **Given** que existían documentos regados en 3 carpetas
- **When** accedo a la carpeta `docs/`
- **Then** encuentro exactamente 6 archivos con toda la información necesaria  
**Criterios de aceptación:**
1. Exactamente 6 archivos en `docs/` (sin subcarpetas excepto `ejemplo/`)
2. Sin documentos duplicados
3. Sin archivos históricos obsoletos
4. Cross-links funcionales entre todos los documentos  
**Referencias:** README.md, SAD.md §11

### HU-05.06 — Android Vibration API Protegida
**Épica:** EP-05 **Módulo(s):** JS, Haptic  
**Historia:** Como usuario de Android, no quiero ver warnings de "Blocked call to navigator.vibrate" en la consola.  
**Alcance:** Agregar `this._unlocked &&` a todas las llamadas a `navigator.vibrate()` en los métodos de Haptic.  
**Given/When/Then:**
- **Given** que no he interactuado con la página
- **When** hago scroll
- **Then** no aparecen warnings de vibrate en la consola  
**Criterios de aceptación:**
1. `tap()`, `scrollTick()`, `medium()`, `success()` verifican `this._unlocked` antes de `navigator.vibrate()`
2. Cero warnings de vibrate en consola Chrome Android  
**Referencias:** SAD.md §5.2

---

## 3. Matriz de Trazabilidad

| HU | Épica | SAD § | Dev-HB Pattern | Estado |
|----|-------|-------|---------------|--------|
| HU-01.01 | EP-01 | §5.3 | PATTERN-01 | ✅ |
| HU-01.02 | EP-01 | §5.4 | — | ✅ |
| HU-01.03 | EP-01 | §5.4 | PATTERN-02 | ✅ |
| HU-01.04 | EP-01 | §2 | — | ✅ |
| HU-01.05 | EP-01 | §5.4 | PATTERN-05 | ✅ |
| HU-02.01 | EP-02 | — | PATTERN-01 | ✅ |
| HU-02.02 | EP-02 | — | PATTERN-06 | ✅ |
| HU-02.03 | EP-02 | §6.1 | — | ✅ |
| HU-02.04 | EP-02 | §6.3 | — | ✅ |
| HU-02.05 | EP-02 | §6.3 | — | ✅ |
| HU-03.01 | EP-03 | §5.2 | PATTERN-03 | ✅ |
| HU-03.02 | EP-03 | — | PATTERN-02 | ✅ |
| HU-03.03 | EP-03 | §5.3 | — | ✅ |
| HU-03.04 | EP-03 | §8 | PATTERN-04 | ✅ |
| HU-03.05 | EP-03 | §9 | — | ✅ |
| HU-04.01 | EP-04 | — | — | ✅ |
| HU-04.02 | EP-04 | — | — | ✅ |
| HU-04.03 | EP-04 | §7 | — | ✅ |
| HU-04.04 | EP-04 | — | §4 | ✅ |
| HU-04.05 | EP-04 | — | PATTERN-05 | ✅ |
| HU-05.01 | EP-05 | §5.1 | PATTERN-08 | ✅ |
| HU-05.02 | EP-05 | §8 | PATTERN-08 | ✅ |
| HU-05.03 | EP-05 | §5.4 | PATTERN-07 | ✅ |
| HU-05.04 | EP-05 | §5.2 | PATTERN-03 | ✅ |
| HU-05.05 | EP-05 | §11 | — | ✅ |
| HU-05.06 | EP-05 | §5.2 | — | ✅ |

---

## 4. Resumen por Sprint

| Sprint | Épicas | Historias | Build |
|--------|--------|-----------|-------|
| v3.1 Golden Master | EP-01 | 5 | `?v=3.1` |
| v3.3 Estabilización | EP-02 | 5 | `?v=3.3` |
| v3.4 Haptic+Scroll | EP-03 | 5 | `?v=cb2` |
| v4.0 Docs+F1 Video | EP-04 | 5 | `?v=4008` |
| v4.1 Audio 3D+Pulso | EP-05 | 6 | `?v=4009` |
| **TOTAL** | **5 épicas** | **26 historias** | |

---

*Firma: [Arquitecto] Equipo Orion, 27 Mayo 2026*
