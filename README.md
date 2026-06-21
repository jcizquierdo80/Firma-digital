# 🚀 Guía de Personalización: Firma Digital

Esta guía es un "machote" o plantilla para que cualquier persona o desarrollador pueda tomar este proyecto y generar una nueva firma digital para un usuario diferente (sin romper nada y sin olvidar datos ocultos).

## 1. Archivos Multimedia (`media/`)

Todos los archivos de imagen, audio y video se han consolidado en una sola carpeta llamada `media/`.
Ya no existe `assets/img/`.

Para personalizar la identidad visual, simplemente reemplaza los siguientes archivos en la carpeta `media/` asegurándote de **mantener exactamente los mismos nombres y formatos**:

*   **`perfil.webp`**: La foto de perfil principal (usada también como favicon). *Se recomienda un recorte circular o cuadrado.*
*   **`avatar.mp4` / `avatar.webm`**: El video en bucle que aparece en el círculo principal (Avatar Hero).
*   **`og-share.jpeg`**: La imagen que aparece cuando se comparte el enlace de la firma en WhatsApp, iMessage, Twitter, etc.
*   **`tech-stack.webp`**: La imagen horizontal con los logos de las tecnologías al final de la página.
*   **`podcast-cover.webp`**: La imagen de portada que aparece en la sección del Podcast.
*   **`modal-bg.mp4` / `modal-bg.webm`**: El video abstracto de fondo que se reproduce al abrir las tarjetas (Modales).

*(Los archivos `f1-*` son del tema visual base y no necesitan cambiarse a menos que se desee otro tema).*

## 2. Reemplazar Identidad en Código

Debes hacer una búsqueda y reemplazo exhaustivo del nombre de la persona, teléfono y dominio anterior. 

### Archivos a editar:

1.  **`index.html`**:
    *   `<title>`, `<meta name="description">`, `<meta name="author">`
    *   Tags de OpenGraph (`og:title`, `og:description`, `og:url`)
    *   Datos Estructurados JSON-LD (Schema.org)
    *   Link Canonical
    *   Nombre en el Hero (`<h1>`) y descripción (`<p class="hero-description">`)
    *   Nombres en los Modales (Ej. `<h2 class="modal-name">`)
    *   **Enlace de WhatsApp**: Busca `wa.me/` y actualiza el teléfono y el texto codificado.
2.  **`assets/js/main.js`**:
    *   Objeto `CONTACT_DATA`: Actualiza `name`, `org`, `title`, `email`, `url`, `phone` y `whatsapp`.
    *   Función `saveContact()`: Actualiza el texto en `navigator.share({ title: '...' })`.
    *   Nombre de descarga del vCard: `download: 'nuevo-nombre.vcf'`.
    *   NFC Module: Actualiza el texto que se graba en el Tag (`recordType: 'text'`).
    *   Calendly Widget: Actualiza la variable `URL_CALENDLY`.
3.  **`manifest.json`**:
    *   Actualiza `name`, `short_name` y `description`.
4.  **`robots.txt` y `sitemap.xml`**:
    *   Actualiza los dominios para SEO.

## 3. Lista de Verificación (Checklist)

*   [ ] ¿Se movieron todas las nuevas imágenes/videos a la carpeta `media/` con los nombres correctos?
*   [ ] ¿Se cambió el `<title>` y los metadatos en `index.html`?
*   [ ] ¿Se actualizaron las etiquetas OpenGraph y el Schema JSON-LD en `index.html`?
*   [ ] ¿Se cambió el número de WhatsApp en los botones?
*   [ ] ¿Se actualizó el objeto `CONTACT_DATA` en `main.js`?
*   [ ] ¿Se probaron las descargas vCard para confirmar que baja con el nombre y datos correctos?
*   [ ] ¿Se actualizó `manifest.json`?
*   [ ] ¿Se limpió por completo cualquier rastro del nombre anterior realizando una búsqueda global en el proyecto?
