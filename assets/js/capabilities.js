/**
 * Capabilities Detection Module
 * Detecta hardware, APIs disponibles y preferencias del usuario
 * Versión: 1.0 - Firma Digital v4.2
 */

export const capabilities = {
    // APIs básicas
    vibration: 'vibrate' in navigator,
    orientation: 'DeviceOrientationEvent' in window,
    nfc: 'NDEFReader' in window,
    webShare: 'share' in navigator,
    webShareFiles: false, // Se detectará dinámicamente
    
    // Hardware (con valores por defecto seguros)
    memory: navigator.deviceMemory || 4,
    cores: navigator.hardwareConcurrency || 4,
    gpu: 'medium', // Se detectará dinámicamente
    
    // Preferencias del usuario
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    
    // Navegador
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    
    // Conexión
    slowConnection: navigator.connection && 
                    (navigator.connection.effectiveType === '2g' || 
                     navigator.connection.effectiveType === 'slow-2g')
};

/**
 * Detecta capacidad de GPU mediante WebGL
 * @returns {'high' | 'medium' | 'low' | 'none'}
 */
function detectGPUClass() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'none';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'medium';
        
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        
        if (renderer.includes('nvidia') || renderer.includes('radeon') || renderer.includes('geforce')) {
            return 'high';
        } else if (renderer.includes('intel') || renderer.includes('apple')) {
            return 'medium';
        } else {
            return 'low';
        }
    } catch (e) {
        console.warn('GPU detection failed:', e);
        return 'medium';
    }
}

/**
 * Detecta si Web Share API soporta archivos
 */
async function detectWebShareFiles() {
    try {
        if (!('canShare' in navigator)) {
            capabilities.webShareFiles = false;
            return false;
        }
        const testFile = new File(['test'], 'test.vcf', { type: 'text/vcard' });
        capabilities.webShareFiles = navigator.canShare({ files: [testFile] });
        return capabilities.webShareFiles;
    } catch (e) {
        capabilities.webShareFiles = false;
        return false;
    }
}

/**
 * Inicializa todas las detecciones
 */
export async function initCapabilities() {
    capabilities.gpu = detectGPUClass();
    await detectWebShareFiles();
    
    // Log de diagnóstico en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Capabilities:', capabilities);
    }
    
    return capabilities;
}

// Exportar función para verificar soporte de vibración en iOS (siempre falso)
export const hasRealVibration = capabilities.vibration && !capabilities.isIOS;

export default capabilities;
