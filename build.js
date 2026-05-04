const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const DIST = path.join(SRC, 'Firma Digital Hostinger');
const HTML_PATH = path.join(SRC, 'index.html');

// Clean dist
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });

// Create directories
['assets/css', 'assets/js', 'assets/img', 'media'].forEach(d =>
  fs.mkdirSync(path.join(DIST, d), { recursive: true })
);

let html = fs.readFileSync(HTML_PATH, 'utf-8');

// Extract and minify CSS
const cssFull = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const cssMin = cssFull
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .replace(/\n\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
fs.writeFileSync(path.join(DIST, 'assets/css/main.css'), cssMin);

// Extract and minify JS
const jsFull = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];
const jsMin = jsFull
    .replace(/\/\/.*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s*([=+\-*/{}();,<>!|&:])\s*/g, '$1')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/; /g, ';')
    .replace(/ }/g, '}')
    .replace(/{ /g, '{')
    .trim();
fs.writeFileSync(path.join(DIST, 'assets/js/main.js'), jsMin);

// Build production HTML
let prodHtml = html
    .replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="assets/css/main.css">')
    .replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, '<script src="assets/js/main.js"></script>\n</body>')
    // Rewrite asset paths
    .replace(/src="OK\/1\.mp4/g, 'src="media/1.mp4')
    .replace(/src="OK\/2\.png/g, 'src="assets/img/2.png')
    .replace(/src="OK\/3\.mp4/g, 'src="media/3.mp4')
    .replace(/src="OK\/4\.jpeg/g, 'src="assets/img/4.jpeg')
    .replace(/\/OK\/4\.jpeg/g, '/assets/img/4.jpeg');

fs.writeFileSync(path.join(DIST, 'index.html'), prodHtml);

// Copy media
const mediaDir = path.join(SRC, 'ok');
if (fs.existsSync(mediaDir)) {
    fs.readdirSync(mediaDir).forEach(f => {
        const src = path.join(mediaDir, f);
        const ext = path.extname(f).toLowerCase();
        const target = ['.mp4', '.webm', '.mov'].includes(ext)
            ? path.join(DIST, 'media')
            : path.join(DIST, 'assets/img');
        fs.cpSync(src, path.join(target, f), { recursive: true });
    });
}
if (fs.existsSync(path.join(SRC, 'perfil.jpg'))) {
    fs.cpSync(path.join(SRC, 'perfil.jpg'), path.join(DIST, 'assets/img', 'perfil.jpg'));
}

// Config files
fs.writeFileSync(path.join(DIST, '.htaccess'), `RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

<IfModule mod_headers.c>
  Header set X-XSS-Protection "1; mode=block"
  Header always append X-Frame-Options SAMEORIGIN
  Header set X-Content-Type-Options nosniff
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "accelerometer=(), autoplay=(self), camera=(), gyroscope=(self), magnetometer=(), microphone=(), usb=()"
  Header set Content-Security-Policy "default-src 'self'; img-src 'self' data: https://images.unsplash.com https://assets.zyrosite.com; media-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'; frame-src https://www.youtube.com;"
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
  <FilesMatch "\\.(css|js|png|jpe?g|webp|woff2)$">
    Header set Cache-Control "public, immutable, max-age=31536000"
  </FilesMatch>
  <FilesMatch "\\.(mp4|webm)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml font/woff2
</IfModule>

Options -Indexes

<FilesMatch "(?i)\\.(env|ini|log|sh|bak|sql|md|git|DS_Store)$">
  Require all denied
</FilesMatch>

ErrorDocument 404 /index.html
`);

fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *
Allow: /

Disallow: /assets/js/
Disallow: /assets/css/
Disallow: /media/

Sitemap: https://jc.themisbynexus.com/sitemap.xml
`);

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jc.themisbynexus.com/</loc>
    <lastmod>2026-05-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

console.log('✓ Build complete');
console.log(`  CSS:  ${(cssMin.length / 1024).toFixed(1)} KB`);
console.log(`  JS:   ${(jsMin.length / 1024).toFixed(1)} KB`);
console.log(`  HTML: ${(prodHtml.length / 1024).toFixed(1)} KB`);
console.log(`  DIST: ${DIST}`);
