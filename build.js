const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, 'dist');
const ZIP_NAME = 'FirmaDigital_v4.1_F1Cinematic.zip';

console.log('🚀 Iniciando proceso de build para Firma Digital v4.1 (F1 Cinematic)...');

// 1. Clean output directory
if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR);

// 2. Define files and directories to copy
const filesToCopy = [
    'index.html',
    '.htaccess',
    'robots.txt',
    'sitemap.xml'
];

const dirsToCopy = [
    'assets',
    'media'
];

const EXCLUDED_FILES = new Set([
    '.DS_Store',
    'Thumbs.db',
    'desktop.ini'
]);

// Archivos en media/ que no son referenciados por el HTML/CSS/JS
// Identificados por auditoría de código (grep en index.html, main.js, main.css)
const MEDIA_EXCLUDES = new Set([
    'motor.wav'  // archivo fuente de 30MB — el MP3 ya está generado
]);

// Archivos en assets/img/ reemplazados por sus versiones .webp
const ASSETS_EXCLUDES = new Set([
    // vacío — todos los archivos son necesarios
]);

// 3. Helper to copy files recursively (with exclude list)
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function(childItemName) {
            if (EXCLUDED_FILES.has(childItemName)) return; // skip junk files
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        const base = path.basename(src);
        if (EXCLUDED_FILES.has(base)) return;
        if (MEDIA_EXCLUDES.has(base)) {
            console.log(`   ⏭️  ${path.relative(__dirname, src)} (no referenciado)`);
            return;
        }
        if (ASSETS_EXCLUDES.has(base)) {
            console.log(`   ⏭️  ${path.relative(__dirname, src)} (→ .webp optimizado)`);
            return;
        }
        fs.copyFileSync(src, dest);
    }
}

// 4. Copy required files and directories
console.log('📦 Copiando archivos de producción...');
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(OUTPUT_DIR, file));
    }
});

dirsToCopy.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyRecursiveSync(dir, path.join(OUTPUT_DIR, dir));
    }
});

// 5. Verificaciones de integridad (Opcional, pero recomendado)
console.log('🔍 Verificando integridad de código...');
const indexHtmlContent = fs.readFileSync(path.join(OUTPUT_DIR, 'index.html'), 'utf8');
if (indexHtmlContent.includes('eruda')) {
    console.warn('⚠️ ADVERTENCIA: Se encontró "eruda" en index.html');
}
if (indexHtmlContent.includes('debug-btn')) {
    console.warn('⚠️ ADVERTENCIA: Se encontró "debug-btn" en index.html');
}

const mainJsContent = fs.readFileSync(path.join(OUTPUT_DIR, 'assets', 'js', 'main.js'), 'utf8');
if (mainJsContent.includes('nexus360.company')) {
    console.warn('⚠️ ADVERTENCIA: Email antiguo (nexus360.company) detectado en main.js');
}

// 🛡️ GATE DE SEGURIDAD: Validación sintáctica de JavaScript (previene SyntaxError en prod)
try {
    new Function(mainJsContent);
    console.log('✅ Validación sintáctica JS: OK');
} catch (syntaxErr) {
    console.error('❌ ERROR CRÍTICO: JavaScript contiene errores de sintaxis.');
    console.error('   ' + syntaxErr.message);
    console.error('   El build se ABORTA. Corrige el error antes de desplegar.');
    process.exit(1);
}

// 6. Clean old ZIP and generate new one
const zipPath = path.join(__dirname, ZIP_NAME);
if (fs.existsSync(zipPath)) {
    fs.rmSync(zipPath);
}
console.log(`🗜️ Comprimiendo archivo ${ZIP_NAME}...`);
try {
    // Uses macOS native zip utility
    execSync(`cd "${OUTPUT_DIR}" && zip -rq "../${ZIP_NAME}" .`);
    console.log(`✅ Build completado exitosamente: ${ZIP_NAME}`);
} catch (error) {
    console.error('❌ Error al comprimir:', error.message);
}

// 7. Cleanup
if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
