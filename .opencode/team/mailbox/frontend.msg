# 🔍 AUDITORÍA FRONTEND — Firma Digital v2
**Autor:** [Frontend] Equipo Orion
**Fecha:** 2026-05-16
**Archivos auditados:** index.html (346 líneas), main.js (1353 líneas), main.css (1350 líneas)

---

## 📊 SCORE GENERAL: 64/100

| Dimensión            | Score | Estado   |
|----------------------|-------|----------|
| Cursor Magnético     | 7/10  | 🟡 Aceptable |
| Haptic/Vibración     | 5/10  | 🔴 Deficiente |
| F1 Telemetry Engine  | 7/10  | 🟡 Aceptable |
| Scroll Feedback      | 4/10  | 🔴 Deficiente |
| Modales              | 8/10  | 🟢 Bueno |
| Estructura HTML      | 6/10  | 🟠 Mejorable |
| CSS                  | 5/10  | 🔴 Deficiente |
| Performance          | 5/10  | 🔴 Deficiente |

---

## 🔴 BUGS CRÍTICOS (7)

### BUG-1: Vibración de arranque incondicional (main.js:294)
**Severidad:** Alta
```
navigator.vibrate([150, 50, 150, 50, 150, 50, 150, 50, 200]);
```
Se ejecuta en `initLoader()` sin ningún gate de usuario. Es un patrón de ~900ms que dispara al cargar la página. En Android, `navigator.vibrate` funciona sin user gesture, así que el teléfono vibra solo al abrir la web. Esto es invasivo y puede asustar al usuario.

**Fix:**
```js
// Eliminar la línea 294 completamente.
// Si se desea feedback de arranque, moverlo al primer user gesture:
// Dentro de unlockSensors(), después de Haptic.unlock():
// try { Haptic.success(); } catch(e) {} // Ya existe, es suficiente
```

### BUG-2: Haptic methods sin try/catch (main.js:232-250)
**Severidad:** Alta
`Haptic.tap()`, `scrollTick()`, `medium()`, `success()` llaman `navigator.vibrate()` sin try/catch. Si `navigator.vibrate` lanza (permiso denegado, contexto inválido), el error propaga y puede romper el flujo.

**Fix:**
```js
tap() {
    try {
        if (this._unlocked && navigator.vibrate) navigator.vibrate(15);
        this._iosClick();
    } catch(e) {}
},
scrollTick() {
    try {
        if (this._unlocked && navigator.vibrate) navigator.vibrate(25);
        this._iosClick();
    } catch(e) {}
},
medium() {
    try {
        if (this._unlocked && navigator.vibrate) navigator.vibrate(40);
        this._iosClick();
        setTimeout(() => this._iosClick(), 80);
    } catch(e) {}
},
success() {
    try {
        if (this._unlocked && navigator.vibrate) navigator.vibrate([30, 50, 30]);
        this._iosClick();
        setTimeout(() => this._iosClick(), 80);
        setTimeout(() => this._iosClick(), 160);
    } catch(e) {}
}
```

### BUG-3: Scroll haptic/sound excesivo — cada 40px (main.js:1324-1348)
**Severidad:** Alta
Cada 40px de scroll dispara `SoundManager.tick()` + `Haptic.scrollTick()`/`medium()`/`success()`. En una página de 3000px, son ~75 vibraciones + 75 sonidos. Esto es extremadamente molesto y drena batería.

**Fix:**
```js
// Dentro de initScrollFeedback, agregar rate limiting para haptic:
let lastHapticTime = 0;
const MIN_HAPTIC_INTERVAL = 300; // Mínimo 300ms entre vibraciones

// Reemplazar el bloque try dentro del if (accumulatedDelta >= TICK_THRESHOLD):
try {
    // Sound: solo en modos Race/Overtake
    if (mode >= 2 && SoundManager && SoundManager.tick) SoundManager.tick(mode);
    
    // Haptic: rate-limited, solo en modo Overtake
    if (mode === 3 && Haptic) {
        const now = performance.now();
        if (now - lastHapticTime > MIN_HAPTIC_INTERVAL) {
            lastHapticTime = now;
            if (Haptic.medium) Haptic.medium();
        }
    }
} catch(e) {}
```

### BUG-4: Tres rAF loops infinitos sin cleanup (main.js:518, 618, 1016)
**Severidad:** Media-Alta
- `updateParallax()` (línea 517-518): rAF perpetuo
- `F1Telemetry.loop()` (línea 610-618): rAF perpetuo
- `cursor loop()` (línea 1011-1017): rAF perpetuo

Ninguno se detiene nunca. Si el usuario cambia de tab, siguen corriendo (aunque el browser los throttlea). Si los elementos se remueven del DOM, los loops siguen.

**Fix para cursor:**
```js
(function initMagneticCursor() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.body.classList.add('custom-cursor-active');
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let rafId = null;
    let isVisible = false;

    function onMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        if (!isVisible) {
            isVisible = true;
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        }
    }
    function onLeave() {
        isVisible = false;
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    }
    function loop() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(loop);

    // Cleanup si los elementos se remueven
    const mo = new MutationObserver(() => {
        if (!document.body.contains(dot) || !document.body.contains(ring)) {
            cancelAnimationFrame(rafId);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
            mo.disconnect();
        }
    });
    mo.observe(document.body, { childList: true, subtree: true });
})();
```

### BUG-5: CSS :active rules duplicadas (main.css)
**Severidad:** Media
Seis reglas `:active` están duplicadas — aparecen una vez en el bloque general (~líneas 327-345) y otra vez en el bloque "v3.3 TAP-HIGHLIGHT" (~líneas 1077-1108). Las segundas sobrescriben las primeras, pero el código muerto ensucia el archivo.

| Selector | Línea 1ª | Línea 2ª |
|----------|----------|----------|
| `.orb-trigger:active` | 327 | 1080 |
| `.orb-item:active .orb-icon` | 330 | 1084 |
| `.podcast-link:active` | 336 | 1087 |
| `.tech-stack-image:active` | 339 | 1091 |
| `.sensor-chip:active` | 333 | 1095 |
| `.liquid-modal-close:active` | 342 | 1098 |

**Fix:** Eliminar las reglas duplicadas en líneas 327-345 (las del bloque "v3.3" son más específicas y tienen valores refinados).

### BUG-6: Parallax sobre-escribe transform de glass-cards (main.js:510-511)
**Severidad:** Media
Cuando el giroscopio está activo, `updateParallax()` aplica `transform` a TODAS las `.glass-card` cada frame. Esto sobrescribe el `transform` del 3D tilt on hover (líneas 470-483) y del hover CSS (`translateY(-12px) scale(1.02)`). El usuario no puede hacer hover en cards si el giroscopio está activo.

**Fix:**
```js
function updateParallax() {
    if (sensorsActive) {
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;
        if (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
            const tx = currentX * 15;
            const ty = currentY * 10;
            // Solo aplicar parallax al bg-image-layer, NO a las cards
            // Las cards deben responder a hover, no a giroscopio
            if (bgImageLayer) {
                // Ya se maneja en F1Telemetry loop
            }
            if (window.F1Telemetry) window.F1Telemetry.setGyro(currentX, currentY);
        }
    }
    requestAnimationFrame(updateParallax);
}
```

### BUG-7: `tap-highlight-color` no es propiedad estándar (main.css:1075)
**Severidad:** Baja
```css
tap-highlight-color: transparent;
```
Solo `-webkit-tap-highlight-color` existe. La versión sin prefijo no hace nada en ningún navegador.

**Fix:** Eliminar línea 1075.

---

## 🟠 PROBLEMAS DE UX (6)

### UX-1: Heading hierarchy rota
**index.html:** El podcast card (línea 179) usa `<h2>` pero está dentro de la sección de servicios que ya tiene `<h3>` para las cards. La jerarquía debería ser:
- h1: Hero (Juan Carlos Izquierdo)
- h2: Statement section
- h2: Servicios section (no existe, falta)
- h3: Cards individuales
- h3: Podcast (no h2)

**Fix:** Cambiar `<h2>` del podcast a `<h3>`. Agregar un `<h2>` antes del bento-grid.

### UX-2: Sin elemento `<nav>`
No hay navegación visible ni `<nav>` semántico. El Nexus Orb Hub funciona como menú flotante pero no está marcado como navegación.

**Fix:** Envolver el orb menu en `<nav aria-label="Menú de contacto">`.

### UX-3: Botones de cierre de modal sin `aria-label`
**index.html:254, 269:** Los botones `.liquid-modal-close` no tienen `aria-label`.

**Fix:** Agregar `aria-label="Cerrar modal"` a ambos botones.

### UX-4: Sin breakpoint para tablet (1024px)
Solo hay media query para 768px. Tablets en portrait (768-1024px) no tienen estilos adaptados. El bento-grid en tablet se vería forzado.

**Fix:** Agregar breakpoint intermedio:
```css
@media (max-width: 1024px) {
    .bento-card--wide { grid-column: span 12; }
    .bento-card--narrow { grid-column: span 6; }
    section { padding: 80px 20px; }
}
```

### UX-5: Sin fallback para `backdrop-filter`
Los glass cards tienen `background: rgba(255,255,255,0.02)` — casi transparente. En navegadores sin `backdrop-filter` (Firefox < 103, browsers antiguos), las cards son prácticamente invisibles.

**Fix:**
```css
@supports not (backdrop-filter: blur(1px)) {
    .glass-card, .bento-card {
        background: rgba(15, 20, 35, 0.85);
    }
    .liquid-modal-content {
        background: rgba(8, 8, 12, 0.95);
    }
}
```

### UX-6: Scroll feedback sonoro es intrusivo
Incluso con el fix de BUG-3, los sonidos de scroll tick son innecesarios en modo Glide. El usuario no espera sonido al hacer scroll.

**Fix:** Desactivar sonidos de scroll por defecto. Solo activar en modo "experiencia F1" explícito.

---

## 🟡 MEJORAS DE CÓDIGO (8)

### IMP-1: Monolito JS de 1353 líneas
`main.js` contiene 8+ módulos mezclados: SoundManager, Haptic, Loader, F1Telemetry, Cursor, Modals, Contact/vCard, Scroll, NFC, QR. Debería modularizarse:

```
assets/js/
  core/sound-manager.js
  core/haptic.js
  core/env.js
  ui/loader.js
  ui/cursor.js
  ui/modals.js
  ui/scroll-feedback.js
  effects/f1-telemetry.js
  effects/parallax.js
  features/contact-modal.js
  features/vcard.js
  features/nfc.js
  features/qr.js
  main.js (entry point)
```

### IMP-2: CSS muerto no referenciado
- `.services-grid` (línea 275) — nunca usada en HTML (se usa `.bento-grid`)
- `.text-gradient-red` (línea 141) — nunca usada en HTML
- `.avatar-skeleton` (línea 788) — nunca usada (la imagen se carga directamente)
- `.wallet-btn` (línea 910) — nunca usada (wallet muestra solo texto)

**Fix:** Eliminar o documentar como "available for future use".

### IMP-3: F1 canvas renderiza en idle
El canvas redibuja todo cada frame (~60fps) incluso cuando no hay scroll, no hay gyro, y no hay partículas moviéndose significativamente. En un MacBook Pro 16" con pantalla retina, esto es ~12Mpx/frame.

**Fix:** Agregar dirty flag:
```js
let dirty = true;
let lastSp = 0, lastGx = 0, lastGy = 0;

function loop(now) {
    time = now * 0.001;
    const spChanged = Math.abs(scrollProgress - lastSp) > 0.001;
    const gyroChanged = Math.abs(gyroX - lastGx) > 0.001 || Math.abs(gyroY - lastGy) > 0.001;
    if (spChanged || gyroChanged || particlesNeedUpdate) {
        render(ctx, canvas.clientWidth, canvas.clientHeight, scrollProgress, gyroX, gyroY);
        lastSp = scrollProgress; lastGx = gyroX; lastGy = gyroY;
        dirty = true;
    }
    // Always render for particles/sparks animation
    requestAnimationFrame(loop);
}
```

### IMP-4: Sin `loading="lazy"` en imágenes
**index.html:** Las imágenes (`media1.jpg`, `perfil.jpg`, `4.jpeg`, `2.png`, `22.webp`) no tienen `loading="lazy"`. Solo el background image (CSS) no puede ser lazy, pero las demás sí.

**Fix:** Agregar `loading="lazy"` a `<img>` tags que no son above-the-fold.

### IMP-5: `console.log` de producción (main.js:1353)
```js
console.log("🏁 SENTINEL F1 EDITION: READY");
```
No debería estar en producción.

**Fix:** Eliminar o envolver en `if (process.env.NODE_ENV !== 'production')`.

### IMP-6: IntersectionObserver root puede ser null
**main.js:413:** `root: document.getElementById('appShell')` — si `appShell` es null, el observer usa `null` como root (viewport), que funciona pero es inconsistente con la intención.

**Fix:** Agregar null check antes de crear el observer.

### IMP-7: `modalContentMap` usa innerHTML — riesgo futuro
Aunque actualmente el contenido es hardcodeado (seguro), el patrón `modalBody.innerHTML = content.body` es peligroso si en el futuro se usa contenido dinámico.

**Fix:** Documentar con comentario o migrar a `textContent` + DOM construction para contenido dinámico.

### IMP-8: Font loading — 4 familias de Google Fonts
Se cargan Inter, Krona One, Space Grotesk y JetBrains Mono con múltiples pesos. Esto son ~400-600KB de fuentes.

**Fix:** 
- Usar `font-display: optional` para fuentes no críticas
- Considerar subset de caracteres
- Preload solo las fuentes críticas (Krona One para display, Inter para body)

---

## 📋 PLAN DE REFACTOR PRIORIZADO

### Fase 1 — Bugs Críticos (1-2 horas)
| # | Fix | Archivo | Líneas |
|---|-----|---------|--------|
| 1 | Eliminar vibración de arranque incondicional | main.js | 293-295 |
| 2 | Agregar try/catch a Haptic methods | main.js | 232-250 |
| 3 | Rate-limit scroll haptic/sound | main.js | 1324-1348 |
| 4 | Eliminar CSS :active duplicados | main.css | 327-345 |
| 5 | Eliminar `tap-highlight-color` no estándar | main.css | 1075 |

### Fase 2 — UX & Accesibilidad (2-3 horas)
| # | Fix | Archivo |
|---|-----|---------|
| 1 | Corregir heading hierarchy | index.html |
| 2 | Agregar `<nav>` al orb hub | index.html |
| 3 | Agregar aria-label a modal close buttons | index.html |
| 4 | Agregar breakpoint tablet 1024px | main.css |
| 5 | Agregar @supports fallback para backdrop-filter | main.css |
| 6 | Desactivar scroll sounds por defecto | main.js |

### Fase 3 — Performance & Memory (3-4 horas)
| # | Fix | Archivo |
|---|-----|---------|
| 1 | Agregar cleanup a cursor rAF loop | main.js |
| 2 | Agregar cleanup a F1 rAF loop | main.js |
| 3 | Agregar cleanup a parallax rAF loop | main.js |
| 4 | Fix parallax vs card hover conflict | main.js |
| 5 | Agregar dirty flag a F1 canvas | main.js |
| 6 | Agregar loading="lazy" a imágenes | index.html |

### Fase 4 — Refactor Estructural (4-6 horas)
| # | Fix |
|---|-----|
| 1 | Modularizar main.js en archivos separados |
| 2 | Eliminar CSS muerto |
| 3 | Optimizar font loading |
| 4 | Eliminar console.log de producción |

---

## 📝 RESUMEN EJECUTIVO

El frontend tiene una base sólida con patrones avanzados (object pools, zero-GC, unlock de audio con 5 capas de defensa, IntersectionObserver con safety fallback). Sin embargo, hay **7 bugs** que necesitan atención inmediata, siendo los más críticos la vibración incondicional al cargar la página y la falta de try/catch en los métodos haptic.

El scroll feedback es el módulo más problemático: vibra y suena cada 40px sin rate limiting, lo que genera una experiencia intrusiva. Los tres loops de `requestAnimationFrame` que nunca se detienen son un riesgo de memory leak a largo plazo.

La estructura HTML necesita correcciones de accesibilidad (heading hierarchy, aria-labels, nav). El CSS tiene reglas duplicadas y falta de fallbacks para navegadores sin `backdrop-filter`.

**Recomendación:** Ejecutar Fase 1 inmediatamente (bugs críticos), luego Fase 2 (UX) antes de cualquier deploy a producción.

---
*[Frontend] Equipo Orion — Firma Digital v2 Audit*
