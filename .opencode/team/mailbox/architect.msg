═══════════════════════════════════════════════════════════
  AUDITORÍA DE SEGURIDAD — FIRMA DIGITAL v4.006
  Orion Architect | Equipo Orion
  Fecha: 2026-05-16
  Alcance: .htaccess, index.html, main.js, robots.txt
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│  SCORE DE SEGURIDAD GENERAL: 62 / 100                   │
│  Clasificación: MODERADO — Requiere hardening           │
└─────────────────────────────────────────────────────────┘

Desglose por dimensión:
  CSP:                55/100  (unsafe-inline debilita la política)
  Headers:            50/100  (falta HSTS, headers CO*)
  Anti-Bot:           30/100  (sin protección alguna)
  JS Security:        80/100  (sin eval, innerHTML estático)
  Data Exposure:      55/100  (PII en texto plano en JS+HTML)
  Apache Config:      75/100  (buen baseline, gaps en dirs)


═══════════════════════════════════════════════════════════
  🔴 VULNERABILIDADES CRÍTICAS (Requieren acción inmediata)
═══════════════════════════════════════════════════════════

🔴-01: SIN HSTS (Strict-Transport-Security)
  Archivo: .htaccess
  Severidad: ALTA — MITM en primera visita
  Descripción:
    Existe un redirect HTTP→HTTPS (líneas 2-3), pero sin HSTS el
    primer request viaja en claro. Un atacante en la red puede
    interceptar la conexión inicial (SSL stripping attack).
    El redirect 301 NO es suficiente protección.
  Impacto:
    Un atacante puede servir una versión HTTP del sitio y capturar
    datos de sesión, cookies, o inyectar contenido malicioso.
  Fix (.htaccess, dentro de <IfModule mod_headers.c>):
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Nota:
    "preload" requiere registrar el dominio en hstspreload.org.
    Si no se desea preload, remover ese token.

🔴-02: CSP CON 'unsafe-inline' EN script-src
  Archivo: .htaccess línea 12
  Severidad: ALTA — Anula la protección XSS de CSP
  Descripción:
    'unsafe-inline' en script-src permite la ejecución de cualquier
    <script> inline o atributo on*. Esto efectivamente desactiva la
    protección anti-XSS que CSP debería proveer.
    Un atacante que logre inyectar HTML puede ejecutar JS arbitrario.
  Impacto:
    XSS almacenado o reflejo bypass completo de CSP.
  Fix (dos opciones):
    Opción A (Recomendada — Nonces):
      1. Generar nonce por request en el servidor (Apache no lo hace
         nativamente; requiere mod_rewrite + script o usar un CDN).
      2. Reemplazar 'unsafe-inline' con 'nonce-<valor>' en script-src.
      3. Agregar nonce a cada <script inline> en el HTML.
    Opción B (Pragmática para sitio estático — Hashes):
      Calcular SHA-256 de cada bloque inline y usar 'sha256-<hash>'.
      Para este sitio, los scripts inline son 0 (todo está en main.js),
      por lo que se puede eliminar 'unsafe-inline' de script-src
      INMEDIATAMENTE sin romper funcionalidad.
  Acción inmediata:
    Eliminar 'unsafe-inline' de script-src. El sitio no tiene scripts
    inline; todos los scripts son externos (main.js, qrcode, calendly).
    CSP corregida:
    Header set Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; media-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://assets.calendly.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.themisbynexus.com https://calendly.com; frame-src https://www.youtube.com https://calendly.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self';"

🔴-03: DIRECTORIO .git/ EXPUESTO
  Archivo: .htaccess línea 46
  Severidad: ALTA — Exposición de código fuente y credenciales
  Descripción:
    El FilesMatch bloquea archivos con extensión .git pero NO el
    directorio .git/. Si el repositorio se despliega con .git incluido,
    un atacante puede descargar:
      GET /.git/config → credenciales de remote
      GET /.git/HEAD → hash del último commit
      GET /.git/objects/ → reconstruir todo el repositorio
  Impacto:
    Exposición completa del código fuente, historial de commits,
    posibles credenciales en commits antiguos, estructura del proyecto.
  Fix (.htaccess, agregar antes de ErrorDocument):
    <DirectoryMatch "/\.git">
      Require all denied
    </DirectoryMatch>
    # Alternativa si DirectoryMatch no está disponible:
    RedirectMatch 404 /\.git


═══════════════════════════════════════════════════════════
  🟠 VULNERABILIDADES IMPORTANTES (Atender en este sprint)
═══════════════════════════════════════════════════════════

🟠-01: SIN PROTECCIÓN CONTRA BOTS MALICIOSOS
  Archivo: .htaccess
  Severidad: MEDIA — Scraping de datos de contacto
  Descripción:
    No existe ningún mecanismo para bloquear bots de scraping,
    harvesters de email, o crawlers agresivos. El email y teléfono
    están en texto plano en el JS, accesibles para cualquier scraper.
  Impacto:
    Spam al email jc@themisbynexus.com, scraping del teléfono para
    llamadas no deseadas, clonación del contenido del sitio.
  Fix (.htaccess, agregar después de RewriteEngine On):
    # ── Anti-Bot: Bloquear user-agents de scraping conocidos ──
    RewriteCond %{HTTP_USER_AGENT} (AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|YandexBot|Baiduspider|Sogou|Exabot|facebot|ia_archiver|Scrapy|python-requests|Go-http-client|curl|wget|libwww-perl|HTTrack|nikto|sqlmap|ZmEu|w3af) [NC]
    RewriteRule .* - [F,L]

    # ── Anti-Scraping: Rate limiting básico por IP ──
    # Requiere mod_ratelimit o mod_evasive (si disponible)
    <IfModule mod_ratelimit.c>
      <Location />
        SetOutputFilter RATE_LIMIT
        SetEnv rate-limit 400
      </Location>
    </IfModule>

🟠-02: PII EXPUESTO EN TEXTO PLANO (Email + Teléfono)
  Archivos: main.js líneas 1050-1058, index.html líneas 225, 333
  Severidad: MEDIA — Scraping de datos personales
  Descripción:
    El email y teléfono de contacto están en texto plano tanto en
    el JavaScript como en el HTML. Los harvesters de email escanean
    archivos .js buscando patrones de email.
  Impacto:
    Spam, phishing dirigido, llamadas no deseadas.
  Fix (Ofuscación en main.js):
    Reemplazar CONTACT_DATA con ofuscación:
    
    const CONTACT_DATA = {
        name: 'Juan Carlos Izquierdo González',
        org: 'Themis by Nexus',
        title: 'Arquitecto de Sistemas & IA',
        // Ofuscación: email reconstruido en runtime
        _e: ['jc','themisbynexus','com'],
        get email() { return this._e[0] + '@' + this._e[1] + '.' + this._e[2]; },
        url: 'https://jcarlos.themisbynexus.com',
        // Ofuscación: teléfono codificado en base64
        _p: 'KzUyMTcyOTE1NTY2MzA=',
        get phone() { return atob(this._p); },
        get whatsapp() { return this.phone; }
    };
    
    Fix (Ofuscación en index.html para links wa.me):
      Reemplazar el href estático con un data-attribute y
      construir la URL en JS al hacer click:
      
      <a class="cta-btn cta-btn--whatsapp"
         data-wa-base="5217291556630"
         data-wa-msg="Hola%20Juan%20Carlos..."
         id="btn-whatsapp-cta">
      
      En main.js:
      document.getElementById('btn-whatsapp-cta')?.addEventListener('click', function() {
          const base = this.dataset.waBase;
          const msg = this.dataset.waMsg;
          window.open('https://wa.me/' + base + '?text=' + msg, '_blank', 'noopener,noreferrer');
      });

🟠-03: FALTAN DIRECTIVAS CSP CRÍTICAS
  Archivo: .htaccess línea 12
  Severidad: MEDIA
  Descripción:
    Faltan las siguientes directivas en la CSP:
    • frame-ancestors: Reemplaza/moderniza X-Frame-Options
    • form-action: Controla dónde se pueden enviar formularios
    • upgrade-insecure-requests: Fuerza HTTPS para recursos mixtos
  Fix (CSP completa corregida):
    Header set Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; media-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://assets.calendly.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.themisbynexus.com https://calendly.com; frame-src https://www.youtube.com https://calendly.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests;"

🟠-04: font-src SIN 'self'
  Archivo: .htaccess línea 12
  Severidad: MEDIA — Puede romper fuentes locales
  Descripción:
    font-src solo permite https://fonts.gstatic.com. Si hay fuentes
    locales en /assets/fonts/, serán bloqueadas por CSP.
  Fix:
    Agregar 'self' a font-src:
    font-src 'self' https://fonts.gstatic.com;

🟠-05: DIRECTORIOS SENSIBLES SIN PROTECCIÓN
  Archivo: .htaccess
  Severidad: MEDIA
  Descripción:
    Solo se bloquean archivos por extensión. Los directorios
    .opencode/, .git/, node_modules/, .vscode/ no están protegidos.
  Fix (.htaccess):
    # Bloquear directorios sensibles
    RedirectMatch 404 /\.(git|opencode|vscode|env|svn|hg)(/.*)?$
    RedirectMatch 404 /(node_modules|bower_components)(/.*)?$


═══════════════════════════════════════════════════════════
  🟡 MEJORAS RECOMENDADAS (Backlog de hardening)
═══════════════════════════════════════════════════════════

🟡-01: X-XSS-PROTECTION OBSOLETO
  Archivo: .htaccess línea 6
  Descripción:
    Chrome eliminó XSS Auditor en 2020. Firefox nunca lo implementó.
    Safari lo deshabilitó. Este header no tiene efecto en navegadores
    modernos y puede dar falsa sensación de seguridad.
  Fix:
    Eliminar la línea o reemplazar con comentario:
    # X-XSS-Protection: obsoleto — CSP es la protección moderna

🟡-02: FALTAN HEADERS COOP/CORP/COEP
  Archivo: .htaccess
  Descripción:
    Los headers Cross-Origin-* aíslan el documento de orígenes
    cruzados y habilitan APIs como SharedArrayBuffer.
  Fix (.htaccess, dentro de <IfModule mod_headers.c>):
    Header set Cross-Origin-Opener-Policy "same-origin"
    Header set Cross-Origin-Resource-Policy "same-origin"
    # COEP requiere que todos los recursos cross-origin tengan CORP
    # No activar si se cargan recursos sin headers CORP (Calendly, etc.)
    # Header set Cross-Origin-Embedder-Policy "require-corp"
  Nota:
    COEP "require-corp" puede romper Calendly y cdn.jsdelivr.net
    si no sirven el header CORP. Evaluar antes de activar.

🟡-03: REFERRER-POLICY PUEDE SER MÁS RESTRICTIVO
  Archivo: .htaccess línea 9
  Descripción:
    strict-origin-when-cross-origin envía la URL completa en
    same-origin requests y solo el origen en cross-origin.
    Para un sitio de firma digital, no es necesario enviar el
    path completo a ningún destino.
  Fix:
    Header set Referrer-Policy "strict-origin"
    # O aún más restrictivo:
    # Header set Referrer-Policy "no-referrer-when-downgrade"

🟡-04: PERMISSIONS-POLICY INCOMPLETA
  Archivo: .htaccess línea 10
  Descripción:
    Faltan APIs que podrían ser abusadas si se inyecta contenido:
    geolocation, payment, clipboard-read, clipboard-write,
    display-capture, screen-wake-lock, web-share.
  Fix:
    Header set Permissions-Policy "accelerometer=(self), autoplay=(self), camera=(), geolocation=(), gyroscope=(self), magnetometer=(), microphone=(), payment=(), usb=(), clipboard-read=(), clipboard-write=(self), display-capture=(), screen-wake-lock=(self), web-share=(self)"

🟡-05: innerHTML EN MODALES — DEFENSA EN PROFUNDIDAD
  Archivo: main.js líneas 932-933
  Descripción:
    Aunque el contenido de modalContentMap es estático y no hay
    input del usuario, usar innerHTML es una práctica que crea
    fragilidad futura. Si alguien agrega contenido dinámico al
    map sin sanitizar, se introduce XSS.
  Fix:
    Opción A: Usar textContent + DOM API para construir el contenido.
    Opción B: Agregar un comentario de advertencia:
      // ⚠️ SECURITY: modalContentMap contiene HTML estático.
      // NUNCA agregar contenido dinámico o de usuario sin sanitizar.
    Opción C: Usar DOMPurify si se necesita HTML dinámico en el futuro.

🟡-06: ERROR DOCUMENT 404 COMO SPA FALLBACK
  Archivo: .htaccess línea 50
  Descripción:
    ErrorDocument 404 /index.html funciona como SPA fallback pero
    devuelve status 200 para URLs inexistentes. Esto puede confundir
    a crawlers y herramientas de seguridad.
  Fix (si se desea comportamiento correcto):
    ErrorDocument 404 /index.html
    # Agregar en el HTML un check para mostrar "not found" si la
    # ruta no es válida (este sitio es single-page, así que es
    # aceptable mantener el comportamiento actual).

🟡-07: ROBOTS.TXT PERMISIVO
  Archivo: robots.txt
  Descripción:
    User-agent: * Allow: / permite que cualquier bot indexe todo.
    Para un sitio de firma digital profesional, esto es aceptable
    (se desea visibilidad), pero se podría restringir bots agresivos.
  Fix (opcional):
    User-agent: *
    Allow: /
    Disallow: /assets/js/
    Disallow: /assets/css/
    Disallow: /media/
    Disallow: /.opencode/
    Disallow: /.git/
    
    # Bloquear bots agresivos de IA/scraping
    User-agent: GPTBot
    Disallow: /
    User-agent: Google-Extended
    Disallow: /
    User-agent: CCBot
    Disallow: /
    User-agent: anthropic-ai
    Disallow: /
    User-agent: Bytespider
    Disallow: /
    
    Sitemap: https://jcarlos.themisbynexus.com/sitemap.xml

🟡-08: CACHE DE ASSETS CON "immutable" — INVALIDACIÓN
  Archivo: .htaccess líneas 27-28
  Descripción:
    Cache-Control: immutable con max-age=31536000 significa que los
    navegadores NUNCA revalidarán estos recursos. Si se hace un fix
    de seguridad en main.js, los usuarios con cache no lo recibirán.
  Observación:
    El versionado ?v=4006 en index.html mitiga esto correctamente.
    Asegurar que el query string se incrementa en cada deploy.
    ✅ Patrón correcto, solo documentar la disciplina.


═══════════════════════════════════════════════════════════
  CÓDIGO COMPLETO: .htaccess HARDENED (v4.007)
═══════════════════════════════════════════════════════════

RewriteEngine On

# ── Anti-Bot: Bloquear user-agents de scraping conocidos ──
RewriteCond %{HTTP_USER_AGENT} (AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|Scrapy|python-requests|Go-http-client|curl|wget|libwww-perl|HTTrack|nikto|sqlmap|ZmEu|w3af) [NC]
RewriteRule .* - [F,L]

# ── HTTPS Redirect ──
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# ── Bloquear directorios sensibles ──
RedirectMatch 404 /\.(git|opencode|vscode|env|svn|hg)(/.*)?$

<IfModule mod_headers.c>
  # HSTS (CRÍTICO — proteger contra SSL stripping)
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  
  # X-Frame-Options (legacy, mantenido por compatibilidad)
  Header always append X-Frame-Options SAMEORIGIN
  
  # MIME sniffing protection
  Header set X-Content-Type-Options nosniff
  
  # Referrer Policy (más restrictivo)
  Header set Referrer-Policy "strict-origin"
  
  # Permissions Policy (completa)
  Header set Permissions-Policy "accelerometer=(self), autoplay=(self), camera=(), geolocation=(), gyroscope=(self), magnetometer=(), microphone=(), payment=(), usb=(), clipboard-read=(), clipboard-write=(self), display-capture=(), screen-wake-lock=(self), web-share=(self)"
  
  # CSP v4.007 — Sin unsafe-inline en scripts, directivas completas
  Header set Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; media-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://assets.calendly.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.themisbynexus.com https://calendly.com; frame-src https://www.youtube.com https://calendly.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests;"
  
  # Cross-Origin Isolation (COOP + CORP)
  Header set Cross-Origin-Opener-Policy "same-origin"
  Header set Cross-Origin-Resource-Policy "same-origin"
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType video/mp4 "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(css|js|png|jpe?g|webp|woff2)$">
    Header set Cache-Control "public, immutable, max-age=31536000"
  </FilesMatch>
  <FilesMatch "\.(mp4|webm)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml font/woff2
</IfModule>

<IfModule mod_mime.c>
  AddType video/mp4 .mp4
</IfModule>

Options -Indexes

# Bloquear archivos sensibles
<FilesMatch "(?i)\.(env|ini|log|sh|bak|sql|md|git|DS_Store)$">
  Require all denied
</FilesMatch>

ErrorDocument 404 /index.html


═══════════════════════════════════════════════════════════
  PLAN DE HARDENING PRIORIZADO
═══════════════════════════════════════════════════════════

FASE 1 — CRÍTICO (Deploy inmediato, < 30 min)
─────────────────────────────────────────────
  [ ] 1. Agregar HSTS header (.htaccess)
  [ ] 2. Eliminar 'unsafe-inline' de script-src en CSP
  [ ] 3. Agregar frame-ancestors, form-action, upgrade-insecure-requests a CSP
  [ ] 4. Agregar 'self' a font-src en CSP
  [ ] 5. Bloquear directorio .git/ con RedirectMatch 404
  [ ] 6. Bump version: main.js?v=4007, main.css?v=4007

FASE 2 — IMPORTANTE (Esta semana)
─────────────────────────────────
  [ ] 7. Agregar reglas anti-bot user-agent en .htaccess
  [ ] 8. Ofuscar email y teléfono en main.js (getters + atob)
  [ ] 9. Ofuscar links wa.me en index.html (data-attributes)
  [ ] 10. Bloquear directorios sensibles (.opencode, .vscode, etc.)
  [ ] 11. Agregar COOP y CORP headers
  [ ] 12. Completar Permissions-Policy
  [ ] 13. Actualizar Referrer-Policy a "strict-origin"
  [ ] 14. Actualizar robots.txt con bloqueos de bots IA

FASE 3 — MEJORAS (Próximo sprint)
─────────────────────────────────
  [ ] 15. Eliminar X-XSS-Protection (obsoleto)
  [ ] 16. Agregar comentario de seguridad en modalContentMap
  [ ] 17. Evaluar COEP "require-corp" (test con Calendly y cdn.jsdelivr)
  [ ] 18. Implementar Subresource Integrity (SRI) para scripts CDN:
         <script src="https://cdn.jsdelivr.net/..." integrity="sha384-..." crossorigin="anonymous">
  [ ] 19. Agregar report-uri o report-to para CSP violation reporting
  [ ] 20. Documentar disciplina de versionado de assets (?v=NNNN)


═══════════════════════════════════════════════════════════
  RESUMEN EJECUTIVO PARA EL LEAD
═══════════════════════════════════════════════════════════

La firma digital v4.006 tiene un baseline de seguridad aceptable
para un sitio estático, pero presenta 3 vulnerabilidades críticas
que deben atenderse antes de cualquier exposición pública adicional:

  1. Sin HSTS → vulnerable a SSL stripping en primera visita
  2. CSP con unsafe-inline → no protege contra XSS
  3. Directorio .git/ potencialmente expuesto → fuga de código

El score actual es 62/100. Con la Fase 1 de hardening sube a ~80/100.
Con las 3 fases completas, el objetivo es 90+/100.

Los datos de contacto (email, teléfono) están expuestos en texto
plano — aceptable para una firma digital (es su propósito), pero
se recomienda ofuscación básica para reducir spam/scraping.

No se encontraron vulnerabilidades de ejecución remota, inyección
SQL, o exposición de credenciales. El código JS es limpio: sin eval(),
sin new Function(), innerHTML con contenido estático controlado.

Riesgo general: MODERADO. No hay urgencia de "drop everything",
pero la Fase 1 debería deployarse en las próximas 48 horas.

[Arquitecto] — Firma Digital v4.006 Security Audit — 2026-05-16
