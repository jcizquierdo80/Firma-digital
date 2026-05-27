# SOFTWARE ARCHITECTURE DOCUMENT - LITE (SAD-LITE)
## Firma Digital Sentinel — F1 Cinematic v4.1
**Documento Estratégico — Visión de Negocio y Onboarding Rápido**

---

## 0. Propósito y Control Documental

El presente **SAD-Lite** es el manual de inducción rápida para la **Firma Digital Sentinel — F1 Cinematic v4.1**. Diseñado para stakeholders no técnicos, nuevos desarrolladores y auditores, este documento está **libre de fragmentos de código**, enfocándose en el *qué* y *para qué* del sistema.

| Versión | Fecha | SAD Master | Audiencia |
|---------|-------|------------|-----------|
| `4.1.0-LITE` | 27 Mayo 2026 | `4.1.0-MASTER` | C-Level, Diseñadores, Nuevos Devs |

**Política de Sincronización:** Toda actualización se realiza primero en el [SAD.md](./SAD.md) y se propaga a este documento.

---

## 1. Visión General del Producto

**Firma Digital Sentinel** es una firma digital interactiva e inmersiva de alto rango. No es un sitio web convencional: es una **experiencia sensorial completa** que combina un motor visual de telemetría Fórmula 1 en tiempo real, audio 3D estéreo con paneo envolvente, y vibración háptica que responde al tacto del usuario.

### 1.1 El Problema que Resuelve
*   **Firmas digitales genéricas:** La mayoría de firmas web son estáticas, sin interactividad, sin personalidad.
*   **Falta de diferenciación:** En el mercado de servicios profesionales de alto nivel, una firma digital plana no comunica exclusividad ni innovación.
*   **Experiencia sensorial:** Los usuarios de alto perfil esperan una experiencia táctil y sonora equivalente a la calidad del servicio que contratan.

### 1.2 La Solución
Sentinel F1 Cinematic transforma la firma digital en una experiencia de lujo:
- Motor visual de Fórmula 1 que reacciona al scroll y al giroscopio del teléfono
- Sonido de motor F1 real con efecto 3D estéreo
- Vibración háptica que responde al deslizar el dedo
- Diseño Liquid Glass v3 con paleta de colores inspirada en la Fórmula 1

---

## 2. Pilares de la Experiencia

```
                PILARES DE LA EXPERIENCIA F1
 ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
 │   MOTOR F1 VISUAL    │   │   AUDIO 3D ESTÉREO   │   │  VIBRACIÓN HÁPTICA   │
 ├──────────────────────┤   ├──────────────────────┤   ├──────────────────────┤
 │ Canvas interactivo   │   │ Motor F1 real en     │   │ Taptic Engine en     │
 │ con grid perspectiva,│   │ memoria con paneo    │   │ iOS + Vibration API  │
 │ HUD de carreras,     │   │ izquierda-derecha.   │   │ en Android. Respuesta│
 │ chispas y velocidad. │   │ Scroll con notas     │   │ inmediata al scroll. │
 └──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

*   **Motor Visual F1:** Al entrar al sitio, el usuario ve un grid de perspectiva animado con elementos de telemetría de Fórmula 1 (DRS, ERS, RPM). El fondo reacciona al movimiento del teléfono (giroscopio) y al scroll.
*   **Audio 3D:** Al primer toque en la pantalla, se reproduce el rugido de un motor F1 real con efecto de sonido envolvente que se mueve de izquierda a derecha. Al hacer scroll, cada movimiento produce un "pulso digital espacial" — notas musicales limpias con eco.
*   **Vibración:** En iPhone, el motor háptico Taptic Engine vibra al hacer scroll. En Android, el vibrador nativo responde con intensidad variable según la velocidad del scroll (suave, normal, rápido).

---

## 3. Tecnología y Stack (Visión Ejecutiva)

| Componente | Descripción para No-Técnicos |
|------------|------------------------------|
| **HTML/CSS/JavaScript** | El sitio está construido sin dependencias externas. No usa WordPress, React, ni frameworks. Es código puro, ligero y rápido. |
| **Canvas 2D** | Es un "lienzo digital" que dibuja los gráficos de F1 en tiempo real, como un videojuego ligero. No requiere descargar videos pesados. |
| **Web Audio API** | El motor de sonido del navegador. Permite cargar el rugido del motor en memoria y reproducirlo al instante, con efectos 3D. |
| **Ghost Checkbox** | Un truco técnico que permite que el iPhone vibre al tocar la pantalla, usando un elemento oculto que activa el motor de vibración nativo de Apple. |
| **Hostinger Apache** | El servidor donde se aloja el sitio. Usa configuración de seguridad avanzada (CSP, HTTPS, anti-hacking). |

---

## 4. Flujo de Usuario (End-to-End)

### 4.1 Desde que entra hasta que interactúa

1. **Carga:** El usuario abre la URL. Aparece una animación de carga (loader) con temática F1 durante ~2.2 segundos.
2. **Revelación:** El loader se oculta y aparece la firma digital completa: foto de perfil, nombre, servicios, y el fondo interactivo de F1.
3. **Primer toque:** El usuario toca la pantalla. En ese instante ocurre el "Big Bang": rugido del motor, vibración de confirmación, y arranque del video hero.
4. **Navegación:** El usuario hace scroll para ver servicios. Cada movimiento produce un sonido limpio y una vibración. Al llegar a secciones específicas, el HUD de F1 muestra "S1 Auditoría", "S2 Arquitectura", "S3 Talento".
5. **Interacción:** El usuario puede abrir el "Orb Hub" (menú flotante con forma de volante F1), ver modales con detalles de servicios, guardar el contacto como vCard, usar NFC, escanear QR, o agendar una llamada por Calendly.

### 4.2 Escenario: Scroll Rápido (Modo Overtake)

*   **Input:** Usuario desliza el dedo rápidamente hacia abajo (>2.0 píxeles por milisegundo)
*   **Procesamiento:** El sistema detecta la velocidad y clasifica el movimiento como "OVERTAKE"
*   **Outputs:**
    *   **Audio:** Nota Do aguda (1047Hz) con efecto de espacio y eco
    *   **Vibración:** Triple pulso háptico (tres golpes seguidos)
    *   **Visual:** Chispas en el canvas, líneas de velocidad, flash rojo en bordes, RPM al máximo
    *   **Chasis:** La interfaz completa tiembla ligeramente (animación CSS `f1-chassis-shake`)

---

## 5. Contenido y Secciones

| Sección | ¿Qué muestra? | Interactividad |
|---------|---------------|----------------|
| **Hero** | Foto de perfil, nombre, título profesional, badges | Video hero al tocar |
| **Servicios** | 3 glass cards: Auditoría, Arquitectura, Talento | Hover 3D, click abre modal |
| **Orb Hub** | Menú flotante tipo volante F1 | Click abre/cierra panel |
| **Modal de Contacto** | vCard, Wallet (Apple/Google), NFC, QR, Calendly | Múltiples acciones |
| **Footer** | Copyright, enlaces legales | — |

---

## 6. Seguridad (Visión General)

*   **HTTPS obligatorio:** El sitio solo funciona con candado verde de seguridad
*   **Protección anti-hacking:** Sin librerías externas que puedan ser hackeadas
*   **Anti-robots:** Los buscadores no pueden indexar el código interno
*   **Datos protegidos:** El teléfono y email de contacto están ocultos en el código

---

## 7. Glosario

*   **SPA:** Single Page Application — toda la interfaz en una sola página
*   **Canvas:** Lienzo digital para dibujar gráficos animados
*   **Taptic Engine:** Motor de vibración de alta precisión de los iPhones
*   **CSP:** Content Security Policy — escudo contra inyección de código malicioso
*   **LCP:** Largest Contentful Paint — métrica de velocidad de carga
*   **DRS:** Drag Reduction System — indicador visual inspirado en F1
*   **ERS:** Energy Recovery System — indicador visual inspirado en F1
*   **vCard:** Formato estándar de tarjeta de contacto digital
*   **NFC:** Near Field Communication — transferencia de datos por proximidad

---

*Firma: [Arquitecto] Equipo Orion, 27 Mayo 2026*
