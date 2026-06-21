/**
 * AppState Module
 * Encapsula el estado global de la aplicación
 * Versión: 1.0 - Firma Digital v4.2
 */

class AppState {
    #_modalOpen = false;
    #_hubActive = false;
    #_sensorsUnlocked = false;
    #_audioUnlocked = false;
    #_hapticUnlocked = false;
    #_telemetry = {
        fps: 60,
        quality: 'high',
        gyroX: 0,
        gyroY: 0,
        scrollProgress: 0,
        velocity: 0
    };

    // Getters
    get isModalOpen() { return this.#_modalOpen; }
    get isHubActive() { return this.#_hubActive; }
    get areSensorsUnlocked() { return this.#_sensorsUnlocked; }
    get isAudioUnlocked() { return this.#_audioUnlocked; }
    get isHapticUnlocked() { return this.#_hapticUnlocked; }
    get telemetry() { return { ...this.#_telemetry }; }

    // Setters y métodos
    setModalOpen(value) { 
        this.#_modalOpen = Boolean(value);
        // Actualizar variable legacy para compatibilidad temporal
        window._modalOpen = this.#_modalOpen;
    }
    
    toggleModal() { 
        this.#_modalOpen = !this.#_modalOpen;
        window._modalOpen = this.#_modalOpen;
        return this.#_modalOpen;
    }

    setHubActive(value) { this.#_hubActive = Boolean(value); }
    toggleHub() { this.#_hubActive = !this.#_hubActive; return this.#_hubActive; }

    setSensorsUnlocked(value) { this.#_sensorsUnlocked = Boolean(value); }
    setAudioUnlocked(value) { this.#_audioUnlocked = Boolean(value); }
    setHapticUnlocked(value) { this.#_hapticUnlocked = Boolean(value); }

    updateTelemetry(data) {
        this.#_telemetry = { ...this.#_telemetry, ...data };
    }

    setFPS(fps) {
        this.#_telemetry.fps = fps;
        // Ajustar calidad según FPS
        if (fps < 30 && this.#_telemetry.quality !== 'low') {
            this.#_telemetry.quality = 'low';
        } else if (fps < 50 && this.#_telemetry.quality === 'high') {
            this.#_telemetry.quality = 'medium';
        } else if (fps >= 55 && this.#_telemetry.quality === 'low') {
            this.#_telemetry.quality = 'high';
        }
    }

    setQuality(quality) {
        if (['high', 'medium', 'low'].includes(quality)) {
            this.#_telemetry.quality = quality;
        }
    }

    setGyro(x, y) {
        this.#_telemetry.gyroX = x;
        this.#_telemetry.gyroY = y;
    }

    setScrollProgress(progress) {
        this.#_telemetry.scrollProgress = progress;
    }

    setVelocity(velocity) {
        this.#_telemetry.velocity = velocity;
    }
}

// Exportar instancia única
export const state = new AppState();

// Mantener compatibilidad temporal con código legacy
window._modalOpen = false;

export default state;
