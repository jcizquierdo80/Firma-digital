// 🏁 Motor F1: Carga en memoria para AudioBuffer (zero latency)
let F1_SAMPLE_BUFFER = null;

const SoundManager = {
    _unlocked: false,
    _unlocking: false,
    _pendingEngineStart: false,
    
    // Carga el audio en memoria para uso con Web Audio API
    async loadF1Sample() {
        if (F1_SAMPLE_BUFFER) return;
        try {
            const response = await fetch('media/f1-engine.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            if (!this.ctx) this.ctx = new AC();
            F1_SAMPLE_BUFFER = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error("Error cargando F1 audio buffer:", e);
        }
    },

    // Called on first user gesture to unlock audio
    unlock() {
        if (this._unlocked || this._unlocking) return Promise.resolve();
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { this._unlocked = true; return Promise.resolve(); }
        if (!this.ctx) {
            try { this.ctx = new AC(); } catch(e) { return Promise.resolve(); }
        }
        if (this.ctx.state === 'running') {
            this._unlocked = true;
            if (this._pendingEngineStart) {
                this._pendingEngineStart = false;
                this.engineStart();
            }
            return Promise.resolve();
        } else if (this.ctx.state === 'suspended') {
            this._unlocking = true;
            return this.ctx.resume().then(() => {
                this._unlocking = false;
                this._unlocked = true;
                if (this._pendingEngineStart) {
                    this._pendingEngineStart = false;
                    this.engineStart();
                }
            }).catch(() => {
                this._unlocking = false;
            });
        }
        return Promise.resolve();
    },

    init() {
        if (!this._unlocked) return null;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        return this.ctx;
    },
    
    _resumeAttempted: false,
    getContext() {
        if (!this._unlocked) return null;
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            if (!this._resumeAttempted) {
                this._resumeAttempted = true;
                this.ctx.resume().then(() => {
                    this._resumeAttempted = false;
                }).catch(() => {});
            }
            return null;
        }
        return this.ctx;
    },
    click() {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(528, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) {}
    },
    open() {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch(e) {}
    },
    close() {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(528, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch(e) {}
    },
    hum() {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch(e) {}
    },
    engineStart() {
        if (this._enginePlaying) return;
        const ctx = this.getContext();
        if (!ctx || !F1_SAMPLE_BUFFER) return;

        this._enginePlaying = true;
        setTimeout(() => { this._enginePlaying = false; }, 4000);

        try {
            const source = ctx.createBufferSource();
            source.buffer = F1_SAMPLE_BUFFER;
            
            const panner = ctx.createStereoPanner();
            panner.pan.setValueAtTime(-0.2, ctx.currentTime);
            panner.pan.linearRampToValueAtTime(0.2, ctx.currentTime + 4);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);

            source.connect(panner);
            panner.connect(gain);
            gain.connect(ctx.destination);
            source.start(ctx.currentTime);
        } catch (e) {}
    },
    createChainWithPan(panValue = 0) {
        const ctx = this.getContext();
        if (!ctx) return null;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const hasStereoPanner = typeof ctx.createStereoPanner === 'function';
        const panner = hasStereoPanner ? ctx.createStereoPanner() : null;
        if (panner) panner.pan.value = panValue;
        if (panner) {
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(ctx.destination);
        } else {
            osc.connect(gain);
            gain.connect(ctx.destination);
        }
        return { ctx, osc, gain, panner };
    },
    _lastTickTime: 0,
    tick(mode = 1) {
        // ── PULSO DIGITAL ESPACIAL ──
        // Scroll suena a notas musicales puras con stereo spread y reverb.
        // Mi(660Hz) → Sol(784Hz) → Do(1047Hz): escala ascendente por modo.
        try {
            const now = performance.now();
            if (now - this._lastTickTime < 80) return;
            this._lastTickTime = now;

            const ctx = this.getContext();
            if (!ctx) return;

            const freq = mode === 1 ? 660 : mode === 2 ? 784 : 1047;
            const vol  = mode === 1 ? 0.010 : mode === 2 ? 0.015 : 0.020;
            const pan  = mode === 1 ? 0 : mode === 2 ? 0.15 : -0.20;
            const dur  = 0.15;

            // Stereo spread: osciladores izquierdo y derecho ligeramente desafinados
            var oscL = ctx.createOscillator();
            oscL.type = 'sine';
            oscL.frequency.setValueAtTime(freq - 3, ctx.currentTime);

            var oscR = ctx.createOscillator();
            oscR.type = 'sine';
            oscR.frequency.setValueAtTime(freq + 3, ctx.currentTime);

            // Paneo 3D
            var panner = ctx.createStereoPanner();
            panner.pan.setValueAtTime(pan, ctx.currentTime);

            // Volumen con envolvente suave de 150ms
            var gain = ctx.createGain();
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

            // Reverb sintética con DelayNode + feedback
            var delay = ctx.createDelay(0.5);
            delay.delayTime.setValueAtTime(0.04, ctx.currentTime);
            var feedbackG = ctx.createGain();
            feedbackG.gain.setValueAtTime(0.30, ctx.currentTime);
            delay.connect(feedbackG);
            feedbackG.connect(delay);

            var wetGain = ctx.createGain();
            wetGain.gain.setValueAtTime(vol * 0.35, ctx.currentTime);
            wetGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur * 1.5);

            // Conexiones: osc → panner → dry → out  +  delay → wet → out
            oscL.connect(panner);
            oscR.connect(panner);
            panner.connect(gain);
            gain.connect(ctx.destination);

            panner.connect(delay);
            delay.connect(wetGain);
            wetGain.connect(ctx.destination);

            var stopTime = ctx.currentTime + dur + 0.01;
            oscL.start(); oscR.start();
            oscL.stop(stopTime); oscR.stop(stopTime);
        } catch (e) {}
    }
};

const Haptic = {
    _unlocked: false,
    _lastIosClickTime: 0,
    _labelListenerAdded: false,
    _programmaticClick: false,
    _getLabel() {
        if (!this._label) this._label = document.getElementById('__haptic_label__');
        return this._label;
    },
    _iosClick() {
        // IOS HAPTIC: No gate on _unlocked — haptic must work on scroll.
        // stopPropagation prevents the click from bubbling to the document.
        const label = this._getLabel();
        if (!label) return;

        const now = performance.now();
        if (now - this._lastIosClickTime < 40) return;
        this._lastIosClickTime = now;

        try {
            if (!this._labelListenerAdded) {
                label.addEventListener('click', e => e.stopPropagation());
                this._labelListenerAdded = true;
            }
            Haptic._programmaticClick = true;
            label.click();
        } catch(e) {
        } finally {
            Haptic._programmaticClick = false;
        }
    },
    unlock() {
        this._unlocked = true;
    },
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
};

function feedback(type = 'click') {
    try {
        if (typeof Haptic !== 'undefined' && Haptic.tap) Haptic.tap();
        switch (type) {
            case 'click':
                if (SoundManager && SoundManager.click) SoundManager.click();
                break;
            case 'open':
                if (SoundManager && SoundManager.open) SoundManager.open();
                break;
            case 'close':
                if (SoundManager && SoundManager.close) SoundManager.close();
                break;
            case 'hum':
                if (SoundManager && SoundManager.hum) SoundManager.hum();
                break;
            case 'success':
                if (SoundManager && SoundManager.hum) SoundManager.hum();
                break;
            default:
                if (SoundManager && SoundManager.click) SoundManager.click();
        }
    } catch(e) {}
}

// ── UNLOCK: Activate audio + haptic on first REAL user gesture ──
async function unlockSensors(event) {
    if (SoundManager._unlocked) {
        removeUnlockListeners();
        return;
    }
    // Layer 2: Reject if _iosClick set the programmatic flag
    if (Haptic._programmaticClick) return;
    // Layer 3: Reject programmatic / synthetic events
    if (!event || !event.isTrusted) return;

    removeUnlockListeners();
    await SoundManager.unlock();
    await SoundManager.loadF1Sample();
    Haptic.unlock();
    SoundManager.engineStart();
    try { Haptic.success(); } catch(e) {}

    // Video hero: reproducir tras desbloqueo
    var av = document.getElementById('avatar-video');
    if (av && av.style.display !== 'none') {
        av.play().then(function() {
            var fb = document.getElementById('avatar-fallback');
            if (fb) fb.style.display = 'none';
        }).catch(function() {});
    }
}

function removeUnlockListeners() {
    document.removeEventListener('click', unlockSensors);
    document.removeEventListener('keydown', unlockSensors);
}

// Listen for first user interaction to unlock audio/haptic
// NOTE: touchstart is NOT a valid user gesture for AudioContext in Chrome.
document.addEventListener('click', unlockSensors);
document.addEventListener('keydown', unlockSensors);

// Hide loader when page is ready
(function initLoader() {
    const loader = document.getElementById('nexus-loader');
    if (!loader) return;

    // Rescue timer: safety net to force hide loader after 4.5s
    const rescueTimer = setTimeout(() => {
        if (!loader.classList.contains('nl-hidden')) {
            loader.classList.add('nl-hidden');
        }
    }, 4500);

    function hideLoader() {
        if (loader.classList.contains('nl-hidden')) return;
        clearTimeout(rescueTimer);
        SoundManager._pendingEngineStart = true;
        loader.classList.add('nl-hidden');
        document.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('active'), i * 150);
        });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        hideLoader();
    } else {
        window.addEventListener('DOMContentLoaded', hideLoader, { once: true });
        window.addEventListener('load', hideLoader, { once: true });
    }
})();

const Env = {
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    supportsSensors: typeof DeviceOrientationEvent !== 'undefined',
    needsPermission: typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'
};
const appShell = document.getElementById('appShell');
window._modalOpen = false;
const fixIOSRubber = (el) => {
    el.addEventListener('touchstart', () => {
        if (window._modalOpen) return;
        const top = el.scrollTop;
        const totalScroll = el.scrollHeight;
        const currentScroll = top + el.offsetHeight;
        if (top <= 0) el.scrollTop = 1;
        else if (currentScroll >= totalScroll) el.scrollTop = top - 1;
    }, {
        passive: true
    });
};
if (Env.isIOS) fixIOSRubber(appShell);
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    ...observerOptions,
    root: document.getElementById('appShell')
});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
// Safety fallback: si algún .reveal no se activó tras 6s, forzar aparición
setTimeout(() => {
    document.querySelectorAll('.reveal:not(.active)').forEach(el => {
        el.classList.add('active');
    });
}, 6000);
const nexusHub = document.getElementById('nexusHub');
const nexusTrigger = document.getElementById('nexusTrigger');
let hubActive = false;

function toggleHub(forceState) {
    hubActive = (forceState !== undefined) ? forceState : !hubActive;

    if (hubActive) {
        nexusHub.classList.add('active');
        try { feedback('open'); } catch(e){}
    } else {
        nexusHub.classList.remove('active');
        try { feedback('close'); } catch(e){}
    }
}

nexusTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHub();
});

document.addEventListener('click', (e) => {
    if (hubActive && !nexusHub.contains(e.target)) toggleHub(false);
});

document.addEventListener('touchstart', (e) => {
    if (hubActive && !nexusHub.contains(e.target)) toggleHub(false);
}, {
    passive: true
});

document.querySelectorAll('.orb-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (item.id === 'btn-vcard') {
            e.preventDefault();
            toggleHub(false);
            openContactModal();
            return;
        }
        feedback('click');
        toggleHub(false);
    });
});
document.querySelector('.podcast-link')?.addEventListener('click', () => feedback('click'));
document.querySelector('.tech-stack-image')?.addEventListener('click', () => feedback('click'));
if (window.matchMedia("(pointer:fine)").matches) {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / 20;
            const tiltY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px)rotateX(${tiltX}deg)rotateY(${tiltY}deg)translateY(-10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px)rotateX(0deg)rotateY(0deg)translateY(0)`;
        });
    });
}
let targetX = 0,
    targetY = 0;
let currentX = 0,
    currentY = 0;
let sensorsActive = false;
const lerpFactor = 0.12;

function handleOrientation(e) {
    if (!sensorsActive) sensorsActive = true;
    const maxTilt = 15;
    const beta = e.beta - 45;
    const gamma = e.gamma;
    targetX = Math.max(-1, Math.min(1, gamma / maxTilt));
    targetY = Math.max(-1, Math.min(1, beta / maxTilt));
}

function updateParallax() {
    if (sensorsActive) {
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;
        if (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
            const tx = currentX * 15;
            const ty = currentY * 15;
            const rx = -currentY * 5;
            const ry = currentX * 5;
            document.querySelectorAll('.glass-card').forEach(card => {
                card.style.transform = `perspective(1000px)translate3d(${tx}px,${ty}px,0)rotateX(${rx}deg)rotateY(${ry}deg)`;
            });
            // Sincronización con el motor F1
            if (window.F1Telemetry) window.F1Telemetry.setGyro(currentX, currentY);
        }
    }
    requestAnimationFrame(updateParallax);
}
updateParallax();
const sensorChip = document.getElementById('sensorChip');
async function activateSensors() {
    // Activar experiencia F1 completa (audio + háptico + sensores)
    if (!SoundManager._unlocked) {
        SoundManager._pendingEngineStart = false;
        await SoundManager.unlock();
        await SoundManager.loadF1Sample();
        Haptic.unlock();
        SoundManager.engineStart();
        try { Haptic.success(); } catch(e) {}
    }

    // Sensores 3D (giroscopio)
    if (Env.needsPermission) {
        try {
            const result = await DeviceOrientationEvent.requestPermission();
            if (result === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
                sensorChip.classList.remove('visible');
                feedback('hum');
            }
        } catch (e) {}
    } else if (Env.supportsSensors) {
        window.addEventListener('deviceorientation', handleOrientation);
        sensorChip.classList.remove('visible');
        feedback('hum');
    }
}
if (Env.needsPermission) {
    sensorChip.classList.add('visible');
    sensorChip.addEventListener('click', activateSensors);
} else if (Env.supportsSensors) {
    appShell.addEventListener('scroll', () => {
        window.addEventListener('deviceorientation', handleOrientation);
    }, { once: true });
}
// ======================================================
// F1 TELEMETRY ENGINE v3.0 — Image-First Layered Canvas
// Efectos 3D premium SOBRE la imagen de fondo
// ======================================================
(function initF1Telemetry() {
    try {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    let width, height;
    let scrollProgress = 0;
    let gyroX = 0, gyroY = 0;
    let scrollVelocity = 0;
    let time = 0;
    let overtakeFlash = 0; // Flash rojo al entrar en OVERTAKE
    let currentGear = 1; // Marcha actual F1

    // ── SPARKS POOL (pre-allocated, zero GC) ──
    const MAX_SPARKS = 50;
    const SPARKS = [];
    for (let i = 0; i < MAX_SPARKS; i++) SPARKS[i] = { x:0, y:0, vx:0, vy:0, life:0, decay:0, size:0, isRed:true };

    // ── SPEED LINES POOL ──
    const SPEED_LINES = [];
    for (let i = 0; i < 30; i++) SPEED_LINES[i] = {
        y: Math.random(), speed: 0.3 + Math.random() * 0.7,
        width: 0.1 + Math.random() * 0.3, alpha: 0.04 + Math.random() * 0.08,
        isRed: Math.random() > 0.5
    };

    // ── FLOATING PARTICLES (ambient) ──
    const PARTICLES = [];
    for (let i = 0; i < 20; i++) PARTICLES[i] = {
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003,
        vy: -0.0002 - Math.random() * 0.0005,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.2,
        isRed: Math.random() > 0.6
    };

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth * dpr;
        height = canvas.clientHeight * dpr;
        canvas.width = width;
        canvas.height = height;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    window.F1Telemetry = {
        setScrollProgress(p) { scrollProgress = Math.max(0, Math.min(1, p)); },
        setGyro(x, y) { gyroX = x; gyroY = y; },
        setVelocity(v) { 
            scrollVelocity = v; 
            emitSparks(v);
            // Gear shift logic
            const prevGear = currentGear;
            if (v < 0.3) currentGear = 1;
            else if (v < 0.6) currentGear = 2;
            else if (v < 1.0) currentGear = 3;
            else if (v < 1.5) currentGear = 4;
            else if (v < 2.0) currentGear = 5;
            else { currentGear = 6; overtakeFlash = 1.0; } // Flash rojo al entrar 6ª marcha
            if (currentGear > prevGear) {
                // Gear shift up — flash sutil cyan
                overtakeFlash = Math.max(overtakeFlash, 0.3);
            }
        }
    };

    function loop(now) {
        time = now * 0.001;
        // Decay del flash rojo de OVERTAKE (se desvanece en ~0.5s)
        if (overtakeFlash > 0) overtakeFlash = Math.max(0, overtakeFlash - 0.02);
        render(ctx, canvas.clientWidth, canvas.clientHeight, scrollProgress, gyroX, gyroY);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    let raceRpmFactor = 1.0;
    let raceSparkFactor = 1.0;

    function updateRaceStateFactors() {
        if (typeof RaceState === 'undefined') { raceRpmFactor = 1.0; raceSparkFactor = 1.0; return; }
        switch (RaceState.mode) {
            case 'WARMUP': raceRpmFactor = 0.35; raceSparkFactor = 0.1; break;
            case 'ATTACK': raceRpmFactor = 1.4;  raceSparkFactor = 2.0; break;
            case 'FLAG':   raceRpmFactor = 0.8;  raceSparkFactor = 0.7; break;
            default:       raceRpmFactor = 1.0;  raceSparkFactor = 1.0; break;
        }
    }

    function render(ctx, w, h, sp, gx, gy) {
        ctx.clearRect(0, 0, w, h);
        updateRaceStateFactors();

        // Effective scroll progress (WARMUP simula idle mínimo)
        const effectiveSp = (typeof RaceState !== 'undefined' && RaceState.mode === 'WARMUP') ? Math.max(sp, 0.15) : sp;

        drawTelemetryGrid(ctx, w, h, gx, gy);
        drawFloatingParticles(ctx, w, h);
        drawSpeedLines(ctx, w, h, effectiveSp);
        drawSparks(ctx, w, h);
        drawHUDFrame(ctx, w, h, effectiveSp);
        drawSectorData(ctx, w, h, effectiveSp);
        drawRacingStripe(ctx, w, h, effectiveSp);
        drawScanlines(ctx, w, h);
        drawOvertakeFlash(ctx, w, h);
    }

    // ── F1 OVERTAKE FLASH — Destello rojo al cambiar de marcha o entrar en OVERTAKE ═══
    function drawOvertakeFlash(ctx, w, h) {
        if (overtakeFlash <= 0.01) return;
        ctx.save();
        // Flash rojo que cubre toda la pantalla y se desvanece
        ctx.globalAlpha = overtakeFlash * 0.15;
        ctx.fillStyle = '#E10600';
        ctx.fillRect(0, 0, w, h);
        // Borde rojo pulsante en los brackets del HUD
        if (overtakeFlash > 0.3) {
            ctx.globalAlpha = overtakeFlash * 0.5;
            ctx.strokeStyle = '#E10600';
            ctx.lineWidth = 3;
            const m = 14;
            const bl = 45;
            ctx.beginPath(); ctx.moveTo(m, m + bl); ctx.lineTo(m, m); ctx.lineTo(m + bl, m); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w - m - bl, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + bl); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(m, h - m - bl); ctx.lineTo(m, h - m); ctx.lineTo(m + bl, h - m); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w - m - bl, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - bl); ctx.stroke();
        }
        ctx.restore();
    }

    // ── F1 BROADCAST SCANLINES (efecto TV de Fórmula 1) ──
    function drawScanlines(ctx, w, h) {
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = '#000';
        for (let y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
        }
        ctx.restore();
    }

    // ── TELEMETRY PERSPECTIVE GRID (más visible sobre video) ──
    function drawTelemetryGrid(ctx, w, h, gx, gy) {
        ctx.save();
        const vanishX = w * 0.5 + gx * 40;
        const vanishY = h * 0.22 + gy * 25;

        // Horizontal lines with perspective — MÁS BRILLANTES sobre video
        ctx.lineWidth = 1.0;
        for (let i = 0; i < 22; i++) {
            const t = i / 22;
            const y = vanishY + (h - vanishY) * Math.pow(t, 1.4);
            const spread = (y - vanishY) / (h - vanishY);
            const alpha = 0.05 + spread * 0.10; // Más brillante sobre video
            ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(vanishX - w * spread * 0.8, y);
            ctx.lineTo(vanishX + w * spread * 0.8, y);
            ctx.stroke();
        }

        // Radial lines from vanishing point
        for (let a = -40; a <= 40; a += 4) {
            const angle = (a * Math.PI) / 180;
            const dist = Math.abs(a) / 40;
            const alpha = 0.03 + (1 - dist) * 0.08;
            ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(vanishX, vanishY);
            ctx.lineTo(vanishX + Math.sin(angle) * w, vanishY + Math.cos(angle) * h);
            ctx.stroke();
        }

        // Red racing stripes (vertical, más visibles sobre video)
        ctx.lineWidth = 2.0;
        for (let i = 0; i < 2; i++) {
            const x = w * (0.15 + i * 0.7) + gx * 15;
            ctx.strokeStyle = 'rgba(225, 6, 0, 0.10)';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + gx * 50, h);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ── FLOATING PARTICLES (ambient glow, más visible sobre video) ──
    function drawFloatingParticles(ctx, w, h) {
        ctx.save();
        PARTICLES.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
            if (p.x < -0.05 || p.x > 1.05) p.vx *= -1;

            const px = p.x * w;
            const py = p.y * h;
            const color = p.isRed ? '225, 6, 0' : '0, 210, 255';

            // Glow — más grande y visible sobre video
            ctx.globalAlpha = p.alpha * 0.5;
            ctx.fillStyle = `rgba(${color}, 1)`;
            ctx.beginPath();
            ctx.arc(px, py, p.size * 5, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.globalAlpha = p.alpha * 1.5;
            ctx.beginPath();
            ctx.arc(px, py, p.size * 1.2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    // ── SPEED LINES (más visibles sobre video) ──
    function drawSpeedLines(ctx, w, h, sp) {
        if (sp < 0.03) return;
        ctx.save();
        SPEED_LINES.forEach(line => {
            const y = ((line.y + time * line.speed * 0.03) % 1) * h;
            const x = ((sp * w * line.speed * 3) % w);
            const len = w * line.width * (0.5 + sp * 1.5);
            const alpha = line.alpha * Math.min(1, sp * 3) * 1.8; // ×1.8 más visible sobre video

            ctx.strokeStyle = line.isRed
                ? `rgba(225, 6, 0, ${alpha})`
                : `rgba(0, 210, 255, ${alpha})`;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + len, y);
            ctx.stroke();
        });
        ctx.restore();
    }

    // ── BRAKE SPARKS (más dramáticos sobre video) ──
    function emitSparks(velocity) {
        const adjustedVelocity = velocity * raceSparkFactor;
        if (adjustedVelocity < 0.6) return;
        const count = Math.min(10, Math.floor(adjustedVelocity * 3));
        for (let i = 0; i < count; i++) {
            const idx = SPARKS.findIndex(s => s.life <= 0);
            if (idx === -1) return;
            const s = SPARKS[idx];
            s.x = Math.random() * window.innerWidth;
            s.y = window.innerHeight * (0.4 + Math.random() * 0.5);
            s.vx = (Math.random() - 0.5) * 8; // Más dispersión
            s.vy = -(3 + Math.random() * 7);
            s.life = 1.0;
            s.decay = 0.010 + Math.random() * 0.015; // Vida más larga
            s.size = 2 + Math.random() * 4; // Más grandes
            s.isRed = Math.random() > 0.35;
        }
    }

    function drawSparks(ctx, w, h) {
        ctx.save();
        for (let i = 0; i < MAX_SPARKS; i++) {
            const s = SPARKS[i];
            if (s.life <= 0) continue;
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.15;
            s.life -= s.decay;

            const color = s.isRed ? '#E10600' : '#00D2FF';

            // Glow halo
            ctx.globalAlpha = s.life * 0.4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Core bright
            ctx.globalAlpha = s.life * 0.9;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();

            // Trail
            ctx.globalAlpha = s.life * 0.25;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
            ctx.stroke();
        }
        ctx.restore();
    }

    // ── HUD FRAME (F1 Broadcast Style, más visible sobre video) ──
    function drawHUDFrame(ctx, w, h, sp) {
        ctx.save();
        const m = 14;
        const bl = 45; // Brackets más grandes
        const alpha = 0.28; // Más visible sobre video

        ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
        ctx.lineWidth = 2.5;

        // Top-left bracket
        ctx.beginPath(); ctx.moveTo(m, m + bl); ctx.lineTo(m, m); ctx.lineTo(m + bl, m); ctx.stroke();
        // Top-right bracket
        ctx.beginPath(); ctx.moveTo(w - m - bl, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + bl); ctx.stroke();
        // Bottom-left bracket
        ctx.beginPath(); ctx.moveTo(m, h - m - bl); ctx.lineTo(m, h - m); ctx.lineTo(m + bl, h - m); ctx.stroke();
        // Bottom-right bracket
        ctx.beginPath(); ctx.moveTo(w - m - bl, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - bl); ctx.stroke();

        // Sector progress bar (bottom) — RED accent
        const barY = h - m - 3;
        const barW = w - m * 2;
        ctx.fillStyle = 'rgba(0, 210, 255, 0.10)';
        ctx.fillRect(m, barY, barW, 3);
        ctx.fillStyle = 'rgba(225, 6, 0, 0.6)';
        ctx.fillRect(m, barY, barW * sp, 3);

        // DRS indicator
        const drsActive = sp > 0.6;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = drsActive ? 'rgba(225, 6, 0, 0.85)' : 'rgba(255,255,255,0.25)';
        ctx.fillText(drsActive ? 'DRS ACTIVE' : 'DRS READY', w - m - 10, m + 18);

        // ERS indicator (top-left)
        const ersPct = 0.3 + sp * 0.6;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0, 210, 255, 0.35)';
        ctx.fillText('ERS', m + 10, m + 18);
        ctx.fillStyle = 'rgba(0, 210, 255, 0.15)';
        ctx.fillRect(m + 40, m + 10, 60, 6);
        ctx.fillStyle = 'rgba(0, 210, 255, 0.5)';
        ctx.fillRect(m + 40, m + 10, 60 * ersPct, 6);

        ctx.restore();
    }

    // ── RACING STRIPE (animated diagonal, más visible sobre video) ──
    function drawRacingStripe(ctx, w, h, sp) {
        ctx.save();
        const offset = (time * 30 + sp * 200) % (h * 2);
        ctx.strokeStyle = 'rgba(225, 6, 0, 0.08)'; // Más visible sobre video
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-50, offset);
        ctx.lineTo(w + 50, offset - h * 0.3);
        ctx.stroke();
        ctx.restore();
    }

    // ── SECTOR DATA ──
    function drawSectorData(ctx, w, h, sp) {
        ctx.save();
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textBaseline = 'top';

        // Blueprint meta (top-left) — más visible sobre video
        ctx.fillStyle = 'rgba(0, 210, 255, 0.50)';
        ctx.fillText('SENTINEL F1 · TELEMETRY V3', 16, 16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.30)';
        const mode = sp < 0.3 ? 'GLIDE' : sp < 0.7 ? 'RACE' : 'OVERTAKE';
        ctx.fillText('MODE: ' + mode, 16, 30);

        // GEAR indicator (top-left, debajo de MODE)
        const gearColor = currentGear >= 5 ? 'rgba(225, 6, 0, 0.70)' : 'rgba(0, 210, 255, 0.55)';
        ctx.fillStyle = gearColor;
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillText('GEAR: ' + currentGear, 16, 46);

        // Sector label (bottom-right)
        const sectors = ['S1 · AUDITORÍA', 'S2 · ARQUITECTURA', 'S3 · TALENTO'];
        const idx = Math.min(sectors.length - 1, Math.floor(sp * sectors.length));
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(225, 6, 0, 0.60)';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText(sectors[idx], w - 20, h - 28);

        // RPM bar (left side, vertical) — influenciado por RaceState
        const rpm = (8000 + sp * 7000) * raceRpmFactor;
        const rpmPct = Math.min(1, rpm / 15000);
        const barH = h * 0.25;
        const barX = 16;
        const barY = h * 0.55;

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(255,255,255,0.30)';
        ctx.fillText('RPM ' + Math.round(rpm), barX, barY - 4);

        // Bar background
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(barX, barY, 5, barH);

        // Bar fill with gradient effect
        const fillH = barH * rpmPct;
        const rpmColor = rpmPct > 0.8 ? '#E10600' : '#00D2FF';
        ctx.fillStyle = rpmColor;
        ctx.globalAlpha = 0.65;
        ctx.fillRect(barX, barY + barH - fillH, 5, fillH);

        // Redline zone marker — parpadeo más dramático
        if (rpmPct > 0.8) {
            ctx.globalAlpha = 0.4 + Math.sin(time * 8) * 0.25;
            ctx.fillStyle = '#E10600';
            ctx.fillRect(barX - 2, barY, 9, barH * 0.2);
        }

        ctx.restore();
    }
    } catch (e) { console.error('F1 Telemetry Engine:', e); }
})();
// Handler para vCard centralizado en .orb-item
const modalContainer = document.getElementById('global-modal');
const modalVideo = document.getElementById('modal-video');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalContentMap = {
    'modal-auditoria': {
        title: 'Auditoría Cognitiva',
        body: '<p style="color:var(--text-secondary);line-height:1.8;margin-bottom:20px;">Analizamos la arquitectura de tu información empresarial. Mediante la extracción de datos dispersos, identificamos los nodos críticos donde la fricción reduce el rendimiento. Entregamos un plano táctico para la implementación de modelos de lenguaje (LLMs).</p><ul style="color:var(--accent-indigo);line-height:1.8;margin-left:20px;list-style-type:none;"><li style="margin-bottom:8px;">▹ Mapeo de Flujos de Valor</li><li style="margin-bottom:8px;">▹ Evaluación de Madurez de Datos</li><li style="margin-bottom:8px;">▹ Diseño de Casos de Uso ROI Positivo</li></ul>'
    },
    'modal-arquitectura': {
        title: 'Arquitectura y Núcleos IA',
        body: '<p style="color:var(--text-secondary);line-height:1.8;margin-bottom:20px;">Ingeniería de software a la medida. Desarrollamos micro-ecosistemas y plataformas SaaS escalables con Inteligencia Artificial incrustada. Dominamos el stack moderno: Next.js, Supabase, PostgreSQL y modelos de OpenAI. Tu sistema no será una interfaz más, será una ventaja matemática.</p><ul style="color:var(--accent-indigo);line-height:1.8;margin-left:20px;list-style-type:none;"><li style="margin-bottom:8px;">▹ Sistemas Deterministas con Node & Python</li><li style="margin-bottom:8px;">▹ Agentes Autónomos & RAG</li><li style="margin-bottom:8px;">▹ Interfaces Liquid Glass & Zero-Server</li></ul>'
    },
    'modal-adquisicion': {
        title: 'Adquisición Paramétrica',
        body: '<p style="color:var(--text-secondary);line-height:1.8;margin-bottom:20px;">Sistemas algorítmicos para la evaluación de talento. Eliminamos los sesgos en la contratación aplicando análisis predictivo sobre las habilidades cognitivas y técnicas de los candidatos, aislando a los mejores ejecutivos en tiempo récord.</p><ul style="color:var(--accent-indigo);line-height:1.8;margin-left:20px;list-style-type:none;"><li style="margin-bottom:8px;">▹ Filtrado Cognitivo Automatizado</li><li style="margin-bottom:8px;">▹ Sistemas Anti-Sesgo y Cumplimiento</li><li style="margin-bottom:8px;">▹ Integración en Flujos de RRHH</li></ul>'
    }
};

document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
        feedback('open');
        const modalId = card.getAttribute('data-modal');
        const content = modalContentMap[modalId];
        if (content) {
            modalTitle.innerHTML = content.title;
            modalBody.innerHTML = content.body;
            if (modalVideo.paused) {
                modalVideo.play().catch(() => {});
            }
            modalContainer.classList.add('show');
            window._modalOpen = true;
            appShell.classList.add('modal-open');
        }
    });
});
function closeGlobalModal() {
    feedback('close');
    modalContainer.classList.remove('show');
    window._modalOpen = false;
    appShell.classList.remove('modal-open');
    setTimeout(() => {
        if (modalVideo) modalVideo.pause();
    }, 300);
}

document.getElementById('close-modal').addEventListener('click', closeGlobalModal);
document.getElementById('global-modal').querySelector('.liquid-modal-bg').addEventListener('click', closeGlobalModal);

// ================================================
// ANTI-TRABADO MODALES Y TECLA ESCAPE
// ================================================
const allModals = document.querySelectorAll('.liquid-modal');
allModals.forEach(modal => {
    const obs = new MutationObserver(() => {
        if (!modal.classList.contains('show')) {
            let cleaned = false;
            const cleanup = () => {
                if (cleaned) return;
                cleaned = true;
                window._modalOpen = false;
                appShell.classList.remove('modal-open');
            };
            modal.addEventListener('transitionend', cleanup, { once: true });
            setTimeout(cleanup, 500); // safety fallback
        }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modalContainer.classList.contains('show')) closeGlobalModal();
        if (typeof closeContactModal === 'function' && document.getElementById('contact-modal').classList.contains('show')) {
            closeContactModal();
        }
    }
});

// ================================================
// FRENTE 2 — CURSOR MAGNÉTICO (Solo desktop)
// ================================================
(function initMagneticCursor() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.body.classList.add('custom-cursor-active');
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    let mouseX = 0,
        mouseY = 0,
        ringX = 0,
        ringY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        dot.style.opacity = '1';
        ring.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    });
    (function loop() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width = '48px';
            ring.style.height = '48px';
            ring.style.borderColor = 'var(--accent-indigo)';
            ring.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width = '32px';
            ring.style.height = '32px';
            ring.style.borderColor = 'var(--accent-indigo)';
            ring.style.backgroundColor = 'transparent';
        });
    });
})();

// ================================================
// FRENTE 2 — SPOTLIGHT EN CARDS
// ================================================
(function initSpotlight() {
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
        });
    });
})();

// ================================================
// FRENTE 2 — CONTACT DATA & VCARD MEJORADA
// ================================================
// Datos ofuscados para evitar scraping de bots
const CONTACT_DATA = {
    name: 'Juan Carlos Izquierdo González',
    org: 'Themis by Nexus',
    title: 'Arquitecto de Sistemas & IA',
    email: ['jc', '@', 'themisbynexus', '.', 'com'].join(''),
    url: 'https://jcarlos.themisbynexus.com',
    phone: ['+', '52', '1', '729', '155', '6630'].join(''),
    whatsapp: ['52', '1', '729', '155', '6630'].join('')
};

function buildVCard(d) {
    return 'BEGIN:VCARD\nVERSION:3.0\nFN:' + d.name +
        '\nN:Izquierdo González;Juan Carlos;;;\nORG:' + d.org +
        '\nTITLE:' + d.title + '\nTEL;TYPE=CELL:' + d.phone +
        '\nEMAIL;TYPE=INTERNET:' + d.email + '\nURL:' + d.url +
        '\nNOTE:Arquitecto de IA · Co-Founder Themis by Nexus\nEND:VCARD';
}

async function saveContact() {
    feedback('click');
    const blob = new Blob([buildVCard(CONTACT_DATA)], {
        type: 'text/vcard;charset=utf-8'
    });
    const file = new File([blob], 'juan-carlos-themis-nexus.vcf', {
        type: 'text/vcard'
    });
    if (navigator.canShare && navigator.canShare({
            files: [file]
        })) {
        try {
            await navigator.share({
                title: 'Juan Carlos Izquierdo — Themis by Nexus',
                text: '¡Guarda mi contacto!',
                files: [file]
            });
            contactSavedSuccess();
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Juan Carlos Izquierdo',
                url: CONTACT_DATA.url
            });
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
        href: url,
        download: 'juan-carlos-themis-nexus.vcf'
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    contactSavedSuccess();
}

function contactSavedSuccess() {
    feedback('hum');
    Haptic.success();
    var btn = document.querySelector('#save-contact-btn');
    if (!btn) return;
    var orig = btn.innerHTML;
    btn.innerHTML = '✓ Contacto guardado';
    btn.style.cssText += 'background:rgba(103,212,114,0.3);border-color:rgba(103,212,114,0.5);';
    setTimeout(function() {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.borderColor = '';
    }, 2800);
}

// ================================================
// FRENTE 2 — WALLET (Apple / Google)
// ================================================
function renderWalletButtons() {
    var c = document.querySelector('#wallet-buttons');
    if (!c) return;
    var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    var isAndroid = /Android/i.test(navigator.userAgent);
    if (isIOS) {
        c.innerHTML = '<p class="wallet-desktop-hint" style="color:var(--accent-cyan);">Apple Wallet disponible próximamente</p>';
    } else if (isAndroid) {
        c.innerHTML = '<p class="wallet-desktop-hint" style="color:var(--accent-cyan);">Google Wallet disponible próximamente</p>';
    } else {
        c.innerHTML = '<p class="wallet-desktop-hint">Abre desde tu teléfono para agregar al Wallet</p>';
    }
}

function openCalendly() {
    feedback('click');
    var URL_CALENDLY = 'https://calendly.com/jc-themisbynexus/30min';
    if (window.Calendly) {
        Calendly.initPopupWidget({
            url: URL_CALENDLY
        });
    } else {
        window.open(URL_CALENDLY, '_blank');
    }
}

// ================================================
// FRENTE 2 — NFC (Chrome Android only)
// ================================================
var NFCModule = {
    supported: 'NDEFReader' in window,
    status: function(msg, type) {
        var el = document.querySelector('#nfc-status');
        if (el) {
            el.textContent = msg;
            el.className = 'nfc-status nfc-status--' + (type || 'info');
        }
    },
    writeTag: async function() {
        if (!this.supported) {
            this.status('Tu navegador no soporta NFC.', 'error');
            return;
        }
        feedback('click');
        this.status('Acerca tu teléfono a un tag NFC...', 'scanning');
        try {
            await new NDEFReader().write({
                records: [{
                        recordType: 'url',
                        data: 'https://jcarlos.themisbynexus.com'
                    },
                    {
                        recordType: 'text',
                        data: 'Juan Carlos Izquierdo — Themis by Nexus'
                    }
                ]
            });
            this.status('¡Tag NFC programado!', 'success');
            feedback('hum');
        } catch (err) {
            this.status(err.name === 'NotAllowedError' ? 'Permiso NFC denegado.' : 'Error. Intenta de nuevo.', 'error');
        }
    },
    renderButton: function() {
        var c = document.querySelector('#nfc-section');
        if (!c) return;
        if (this.supported) {
            c.innerHTML = '<button class="nfc-write-btn" id="nfc-write-trigger"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Programar Tag NFC</button><p id="nfc-status" class="nfc-status"></p><p class="nfc-hint">Acerca un tag NFC en blanco para programarlo</p>';
            document.getElementById('nfc-write-trigger').addEventListener('click', function() {
                NFCModule.writeTag();
            });
        } else {
            c.style.display = 'none';
        }
    }
};

// ================================================
// FRENTE 2 — QR DINÁMICO
// ================================================
function generateModalQR() {
    var canvas = document.getElementById('qr-canvas');
    if (!canvas || typeof QRCode === 'undefined') return;
    QRCode.toCanvas(canvas, 'https://jcarlos.themisbynexus.com', {
        width: 160,
        margin: 2,
        color: {
            dark: '#ffffff',
            light: '#00000000'
        }
    });
}

// ================================================
// FRENTE 2 — MODAL DE CONTACTO (init + open/close)
// ================================================
function initContactModal() {
    renderWalletButtons();
    NFCModule.renderButton();
    generateModalQR();
}

var contactModal = document.getElementById('contact-modal');
var contactVideo = document.getElementById('contact-modal-video');

function openContactModal() {
    feedback('open');
    initContactModal();
    if (contactVideo && contactVideo.paused) contactVideo.play().catch(function() {});
    contactModal.classList.add('show');
    window._modalOpen = true;
    appShell.classList.add('modal-open');
}

function closeContactModal() {
    feedback('close');
    contactModal.classList.remove('show');
    window._modalOpen = false;
    appShell.classList.remove('modal-open');
    setTimeout(function() {
        if (contactVideo) contactVideo.pause();
    }, 300);
}

document.getElementById('close-contact-modal').addEventListener('click', closeContactModal);
document.getElementById('contact-modal-bg').addEventListener('click', closeContactModal);
document.getElementById('save-contact-btn').addEventListener('click', function() {
    saveContact();
});
document.getElementById('btn-calendly').addEventListener('click', function() {
    openCalendly();
});

// ================================================
// VIDEO FALLBACK PARA AVATAR HERO (iOS)
// ================================================
var avatarVideo = document.getElementById('avatar-video');
var avatarFallback = document.getElementById('avatar-fallback');
// avatar-fallback src ya apunta a perfil.webp en el HTML

if (avatarVideo && avatarFallback) {
    avatarVideo.muted = true;
    avatarVideo.setAttribute('playsinline', '');
    var playPromise = avatarVideo.play();
    if (playPromise) {
        playPromise.then(function() {
            avatarFallback.style.display = 'none';
        }).catch(function() {
            avatarVideo.style.display = 'none';
            avatarFallback.style.display = '';
        });
    }
    setTimeout(function() {
        var playing = !avatarVideo.paused && !avatarVideo.ended && avatarVideo.readyState > 2;
        if (!playing) {
            avatarVideo.style.display = 'none';
            avatarFallback.style.display = '';
        }
    }, 2000);
    // El retry de video hero ahora se gestiona en unlockSensors() (mismo gesto de desbloqueo)
}

// ================================================
// SCROLL MECÁNICO & F1 TELEMETRY FEEDBACK
// ================================================
(function initScrollFeedback() {
    let lastScrollTop = appShell.scrollTop;
    let accumulatedDelta = 0;
    const TICK_THRESHOLD = 40; 
    let lastTime = performance.now();
    let tickAccumStart = performance.now();
    let lastTickTime = 0;
    const MIN_TICK_INTERVAL = 150; // Rate-limit: mínimo 150ms entre ticks hápticos

    appShell.addEventListener('scroll', () => {
        const st = appShell.scrollTop;
        const now = performance.now();
        const delta = Math.abs(st - lastScrollTop);
        const dt = Math.max(1, now - lastTime);
        
        lastScrollTop = st;
        lastTime = now;
        accumulatedDelta += delta;

        // F1 Telemetry Sync
        const maxScroll = appShell.scrollHeight - appShell.clientHeight;
        const progress = maxScroll > 0 ? Math.min(1, Math.max(0, st / maxScroll)) : 0;
        if (window.F1Telemetry) window.F1Telemetry.setScrollProgress(progress);

        if (accumulatedDelta >= TICK_THRESHOLD) {
            const elapsed = Math.max(1, now - tickAccumStart);
            const velocity = accumulatedDelta / elapsed; // px/ms real
            
            // Modos F1 Telemetry (umbrales calibrados)
            let mode = 1; // GLIDE  (< 0.8 px/ms)
            if (velocity > 0.8) mode = 2;  // RACE    (0.8-2.0 px/ms)
            if (velocity > 2.0) mode = 3;  // OVERTAKE (> 2.0 px/ms)

            accumulatedDelta = 0;
            tickAccumStart = now;

            // Sync velocity to F1 Engine for sparks
            if (window.F1Telemetry && window.F1Telemetry.setVelocity) {
                window.F1Telemetry.setVelocity(velocity);
            }

            // Rate-limit: mínimo 150ms entre ticks hápticos para no saturar
            if (now - lastTickTime < MIN_TICK_INTERVAL) {
                accumulatedDelta = 0;
                tickAccumStart = now;
                return;
            }
            lastTickTime = now;

            // ═══ F1 CHASSIS VIBRATION — OVERTAKE MODE ═══
            // En modo OVERTAKE, el "chasis" vibra como un F1 a máxima velocidad
            if (mode === 3) {
                appShell.style.animation = 'f1-chassis-shake 0.15s ease-in-out';
                setTimeout(() => { appShell.style.animation = ''; }, 150);
            }

            try {
                if (typeof SoundManager !== 'undefined' && SoundManager.tick) SoundManager.tick(mode);
                if (typeof Haptic !== 'undefined') {
                    if (mode === 3 && Haptic.success) Haptic.success();
                    else if (mode === 2 && Haptic.medium) Haptic.medium();
                    else if (Haptic.scrollTick) Haptic.scrollTick();
                }
            } catch(e) {}
        }
    }, { passive: true });
})();

// ================================================
// RACE STATE — Telemetría F1 conectada a secciones
// ================================================
const RaceState = {
    mode: 'WARMUP' // WARMUP → ATTACK → PIT → FLAG
};

(function initRaceStateObserver() {
    const sectionModeMap = {
        'main-content': 'WARMUP', // Hero / landing
        'servicios': 'ATTACK',    // Bento Grid
        'section-cta': 'FLAG'     // CTA final
    };

    const map = new Map();
    Object.entries(sectionModeMap).forEach(([id, mode]) => {
        const el = document.getElementById(id);
        if (el) map.set(el, mode);
    });
    if (!map.size) return;

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const mode = map.get(entry.target);
                if (mode) {
                    const prev = RaceState.mode;
                    RaceState.mode = mode;
                    // Disparar Haptic.hum al cambiar de sección
                    if (prev !== mode && prev !== 'WARMUP') {
                        try { if (typeof Haptic !== 'undefined' && Haptic.tap) Haptic.tap(); } catch(e) {}
                    }
                }
            }
        }
    }, { threshold: 0.4 });

    map.forEach((mode, el) => observer.observe(el));
})();

// ExperienceGuard eliminado: el chip "Activar Modo F1" unifica la activación