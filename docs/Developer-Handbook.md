# DEVELOPER HANDBOOK (SOP)
## Firma Digital Sentinel — F1 Cinematic v4.1
**Guía de Patrones, Convenciones y Protocolos de Ingeniería**

---

## 0. Control Documental

Este **Developer Handbook** es la guía de implementación técnica para **Firma Digital Sentinel v4.1**. Contiene los patrones arquitectónicos, convenciones de código y protocolos operativos obligatorios.

| Versión | Fecha | SAD Asociado | Propósito |
|---------|-------|-------------|-----------|
| `4.1.0-DEV-HB` | 27 Mayo 2026 | `4.1.0-MASTER` | Patrones, reglas JS/CSS/HTML, protocolo build, git |

**Cómo usar este Handbook:**
*   Los patrones de código y convenciones son de carácter **OBLIGATORIO**.
*   Los protocolos de git y build son de carácter **OBLIGATORIO**.
*   Las configuraciones de herramientas son **SUGERIDAS**.

---

## 1. Patrones Arquitectónicos Institucionalizados

### PATTERN-01: Merge Quirúrgico (Anti-Neuron-Loss)

**Contexto:** El archivo `main.js` contiene ~1530 líneas con múltiples subsistemas. Reescrituras completas han causado pérdida de código.

**Regla:** 
> **Nunca reescribir un archivo >200 líneas sin tener un commit de backup en git.**
> 
> 1. `git commit` del estado actual (backup explícito)
> 2. Modificar solo las líneas necesarias — nunca reemplazar el archivo completo
> 3. Verificar el diff antes de confirmar

**Implementación:**
```javascript
// ✅ AÑADIR al final con bloque etiquetado:
// ================================================
// [NUEVO MÓDULO] — Descripción
// ================================================
// ... código nuevo ...

// ❌ NUNCA reescribir el archivo completo
```

### PATTERN-02: Anti-Trabado Scroll (Modal Lock)

**Contexto:** Al abrir un modal, el scroll del fondo debe detenerse. En iOS, `document.body.style.overflow` no funciona.

**Solución:**
```javascript
// Bloquear #appShell, no document.body
appShell.classList.add('modal-open');

// CSS: #appShell.modal-open { overflow: hidden; touch-action: none; }
```

### PATTERN-03: Ghost Haptic iOS (Taptic Engine Bypass)

**Contexto:** iOS Safari no expone API de vibración. Solo el checkbox nativo `<input type="checkbox" switch>` activa el Taptic Engine.

**Solución:**
```html
<input type="checkbox" id="__haptic_switch__" hidden>
<label id="__haptic_label__" for="__haptic_switch__" hidden></label>
```

```javascript
// label.click() dispara Taptic Engine. NO usar input.checked = !input.checked
Haptic._iosClick = function() {
    label.addEventListener('click', e => e.stopPropagation()); // Escudo
    label.click();
};
```

### PATTERN-04: F1 Telemetry Scroll Feedback

**Contexto:** El scroll debe producir feedback sensorial multi-modo.

```javascript
function initScrollFeedback() {
    let accumulatedDelta = 0;
    const TICK_THRESHOLD = 40;

    appShell.addEventListener('scroll', () => {
        accumulatedDelta += delta;
        if (accumulatedDelta >= TICK_THRESHOLD) {
            const velocity = accumulatedDelta / elapsed;
            let mode = velocity > 2.0 ? 3 : velocity > 0.8 ? 2 : 1;
            SoundManager.tick(mode);
            Haptic.scrollTick/medium/success según modo;
            accumulatedDelta = 0;
        }
    }, { passive: true });
}
```

### PATTERN-05: Rescate de Loader (Sentinel Rescue Protocol)

**Contexto:** Si la carga falla, el loader no debe bloquear la UI indefinidamente.

**Solución:**
```javascript
const rescueTimer = setTimeout(() => {
    if (!loader.classList.contains('nl-hidden')) {
        loader.classList.add('nl-hidden'); // Fuerza reveal a 4.5s
    }
}, 4500);
```

### PATTERN-06: Gate de Seguridad en Build

**Contexto:** El build debe abortar si hay código de debug en producción.

**Solución:**
```javascript
// En build.js
try {
    new Function(mainJsContent); // Valida sintaxis JS
} catch (syntaxErr) {
    console.error('❌ ERROR CRÍTICO: JavaScript contiene errores de sintaxis.');
    process.exit(1);
}
```

### PATTERN-07: Unlock Sensorial Multi-Capa

**Contexto:** AudioContext y vibrate requieren gesto real del usuario. Programmatic clicks de `_iosClick()` NO deben activar el unlock.

**5 capas de defensa en `unlockSensors()`:**
```javascript
async function unlockSensors(event) {
    if (SoundManager._unlocked) return removeUnlockListeners();     // Capa 0
    if (Haptic._programmaticClick) return;                          // Capa 1
    if (!event || !event.isTrusted) return;                         // Capa 2

    removeUnlockListeners();                                        // Capa 3
    await SoundManager.unlock();                                    // Capa 4
    await SoundManager.loadF1Sample();
    Haptic.unlock();
    SoundManager.engineStart();
    Haptic.success();
}
```

### PATTERN-08: Pulso Digital Espacial (Audio Scroll)

**Contexto:** Los ticks de scroll deben ser agradables, no fatigantes.

**Implementación:**
```javascript
tick(mode) {
    // Solo ondas sine puras
    const freq = mode === 1 ? 660 : mode === 2 ? 784 : 1047;
    
    // Stereo spread ±3Hz
    const oscL = ctx.createOscillator(); oscL.frequency.value = freq - 3;
    const oscR = ctx.createOscillator(); oscR.frequency.value = freq + 3;
    
    // Paneo 3D
    const panner = ctx.createStereoPanner();
    panner.pan.value = mode === 1 ? 0 : mode === 2 ? 0.15 : -0.20;
    
    // Reverb sintética
    const delay = ctx.createDelay(0.5);
    delay.delayTime.value = 0.04;
    // feedback loop: delay → feedbackGain(0.3) → delay
    
    // Envolvente 150ms con decaimiento exponencial
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
}
```

---

## 2. Convenciones de Código

### 2.1 JavaScript (ES6+ Vanilla)

| Regla | Ejemplo |
|-------|---------|
| **Variables:** `const` para inmutables, `let` para mutables, nunca `var` | `const SoundManager = { ... }` |
| **Funciones:** Arrow functions para callbacks cortos, `function` para métodos nombrados | `const hideLoader = () => { ... }` |
| **Objetos:** Notación literal con métodos shorthand | `{ unlock() { ... }, tick(mode) { ... } }` |
| **Async:** `async/await` para operaciones asíncronas | `await SoundManager.unlock()` |
| **Error handling:** try/catch con catch vacío para operaciones no críticas | `try { ... } catch(e) {}` |
| **Comentarios:** Solo en secciones complejas, nunca obvios | `// ── UNLOCK: 5 capas ──` |
| **Strings:** Single quotes para strings, template literals para interpolación | `'click'` vs `` `rgba(${r},${g},${b})` `` |
| **Rate limiters:** `performance.now()` para throttling | `if (now - this._lastTime < 80) return;` |

### 2.2 CSS3

| Regla | Ejemplo |
|-------|---------|
| **Custom Properties:** Variables en `:root` para paleta | `--f1-red: #E10600;` |
| **Selectores:** Clases descriptivas con BEM-like | `.glass-card`, `.orb-trigger`, `.nl-hidden` |
| **Transiciones:** 0.2s para modales (evita hit-testing lag en iOS) | `transition: opacity 0.2s;` |
| **z-index:** Negativos para fondo, positivos para UI | `#bg-canvas { z-index: -3; }` |
| **Media Queries:** Mobile-first | `@media (min-width: 768px) { ... }` |

### 2.3 HTML5

| Regla | Ejemplo |
|-------|---------|
| **Semántica:** Usar elementos HTML5 apropiados | `<nav>`, `<section>`, `<footer>` |
| **Accesibilidad:** Atributos ARIA en elementos interactivos | `aria-label="Cargando"`, `role="status"` |
| **Versiones:** Query string en links CSS/JS | `?v=4009` |
| **Preload:** Recursos críticos con `<link rel="preload">` | `f1-engine.mp3`, `f1-bg.webm` |

---

## 3. Protocolo de Git

### 3.1 Commits

```
Formato: [tipo] descripción breve

Tipos: feat, fix, refactor, docs, build, ops, restore

Ejemplos:
  feat: AudioBuffer 3D engine start con StereoPannerNode
  fix: _iosClick() liberado + stopPropagation escudo
  docs: Documentación consolidada en docs/ según modelo ejemplo
  build: Bump version a ?v=4009
```

### 3.2 Regla de Oro

> **Siempre hacer commit ANTES de modificar archivos >200 líneas.**
> Si el cambio sale mal, `git checkout` restaura en segundos.

---

## 4. Protocolo de Build

### 4.1 Flujo

```bash
# 1. Validar sintaxis
node -c assets/js/main.js

# 2. Build (gate de seguridad + ZIP)
node build.js

# Output: FirmaDigital_v4.1_F1Cinematic.zip

# 3. Verificar ZIP
unzip -l FirmaDigital_v4.1_F1Cinematic.zip
```

### 4.2 Gate de Seguridad

El build **aborta** si:
- JavaScript tiene errores de sintaxis (`new Function()` lanza excepción)
- HTML contiene `debug-trigger` o `debug-panel`
- HTML contiene referencia a email antiguo `nexus360.company`

---

## 5. Protocolo de Despliegue

1. **Backup** de `public_html/` actual
2. Subir ZIP a Hostinger
3. Extraer en `public_html/`
4. Verificar checklist de 12 puntos
5. Si hay caché: cambiar `?v=XXXX` y reconstruir

---

## 6. Troubleshooting

### "El motor F1 no suena"
1. ¿Tocaste la pantalla? AudioContext requiere gesto de usuario
2. ¿`media/f1-engine.mp3` existe en el servidor?
3. Limpiar caché del navegador

### "No vibra en iPhone"
1. Probar en Safari nativo (Chrome iOS no es fiable)
2. Verificar que `#__haptic_switch__` y `#__haptic_label__` existen en el DOM
3. iOS 26+ puede haber bloqueado el truco del checkbox fantasma — sin solución web

### "El loader se queda pegado"
1. Rescue timer fuerza reveal a los 4.5s
2. Abrir consola (F12) y revisar errores JS
3. Limpiar caché del navegador

---

## 7. Archivos Clave (CODE MAP)

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `index.html` | ~400 | Punto de entrada, loader, ghost haptic DOM |
| `assets/css/main.css` | ~1340 | Liquid Glass v3, paleta F1, animaciones |
| `assets/js/main.js` | ~1530 | SoundManager, Haptic, F1 Telemetry, modales, contacto |
| `.htaccess` | ~60 | CSP canónica, HTTPS, cache, compresión |
| `build.js` | ~130 | Build script con gate de seguridad |
| `media/f1-engine.mp3` | 85 KB | Sample real motor F1 |
| `media/f1-bg.webm` | 1.3 MB | Video cinemático de fondo |
| `media/1.webm` | 1.9 MB | Video hero avatar |

---

## 8. Referencias Cruzadas

| Documento | Enlace |
|-----------|--------|
| SAD (Arquitectura) | [SAD.md](./SAD.md) |
| SAD-Lite (Resumen) | [SAD-Lite.md](./SAD-Lite.md) |
| Backlog HU (Historias) | [BACKLOG-HU.md](./BACKLOG-HU.md) |
| README (Índice) | [README.md](./README.md) |

---

*Firma: [Arquitecto] Equipo Orion, 27 Mayo 2026*
