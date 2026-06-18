/**
 * Share Manager Module
 * Gestiona el compartir contacto usando Web Share API nativa con fallbacks
 * Versión: 1.0 - Firma Digital v4.2
 */

import { capabilities } from './capabilities.js';

/**
 * Genera contenido vCard
 * @param {Object} contactData - Datos de contacto
 * @returns {string} Contenido vCard
 */
function generateVCardContent(contactData) {
    return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${contactData.firstName} ${contactData.lastName}`,
        `ORG:${contactData.company}`,
        `TITLE:${contactData.title}`,
        `TEL;TYPE=CELL:${contactData.phone}`,
        `EMAIL:${contactData.email}`,
        `URL:${contactData.website}`,
        `ADR;TYPE=WORK:;;${contactData.address};${contactData.city};${contactData.state};${contactData.zip};${contactData.country}`,
        `NOTE:${contactData.note || ''}`,
        'END:VCARD'
    ].join('\n');
}

/**
 * Genera Blob vCard
 * @param {Object} contactData - Datos de contacto
 * @returns {Blob} Blob con contenido vCard
 */
export function generateVCardBlob(contactData) {
    const vcardContent = generateVCardContent(contactData);
    return new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
}

/**
 * Descarga vCard manualmente (fallback)
 * @param {Object} contactData - Datos de contacto
 */
export function downloadVCard(contactData) {
    const blob = generateVCardBlob(contactData);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contactData.firstName}_${contactData.lastName}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Feedback háptico si está disponible
    if ('vibrate' in navigator && !capabilities.isIOS) {
        navigator.vibrate(50);
    }
}

/**
 * Comparte contacto usando Web Share API con fallbacks
 * @param {Object} contactData - Datos de contacto
 * @returns {Promise<boolean>} Éxito de la operación
 */
export async function shareContact(contactData) {
    const vCardBlob = generateVCardBlob(contactData);
    const vCardFile = new File([vCardBlob], 'contact.vcf', { type: 'text/vcard' });
    
    // Intentar Web Share API con archivos (Android Chrome)
    if (capabilities.webShareFiles) {
        try {
            await navigator.share({
                title: `${contactData.firstName} ${contactData.lastName}`,
                text: 'Tarjeta de presentación digital',
                url: window.location.href,
                files: [vCardFile]
            });
            console.log('✅ Contacto compartido con vCard');
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn('Web Share con archivos falló:', err);
            } else {
                return false; // Usuario canceló
            }
        }
    }
    
    // Intentar Web Share API sin archivos (iOS Safari, otros)
    if (capabilities.webShare) {
        try {
            await navigator.share({
                title: `${contactData.firstName} ${contactData.lastName}`,
                text: `Tarjeta de presentación digital\n${contactData.firstName} ${contactData.lastName}\n${contactData.title}\n${contactData.company}\n${window.location.href}`,
                url: window.location.href
            });
            console.log('✅ URL compartida');
            // Ofrecer descarga de vCard después de compartir
            setTimeout(() => {
                if (confirm('¿Quieres guardar el contacto en tu agenda?')) {
                    downloadVCard(contactData);
                }
            }, 500);
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn('Web Share falló:', err);
            } else {
                return false; // Usuario canceló
            }
        }
    }
    
    // Fallback: descarga directa
    console.log('⚠️ Web Share no disponible, descargando vCard');
    downloadVCard(contactData);
    return true;
}

export default { shareContact, downloadVCard, generateVCardBlob };
