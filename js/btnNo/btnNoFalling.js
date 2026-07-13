/* =============================================
   BtnNoFalling — Animación de caída
   Por defecto cae a la esquina inferior derecha.
   Si se pasa targetX/targetY, cae a esas
   coordenadas (usado para caer detrás de Sí).
   ============================================= */
class BtnNoFalling {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;

    this._onToggleReTrigger = null;
    this._onFallComplete = null;
  }

  activate(targetX, targetY) {
    if (this._active) return;
    this._active = true;

    // Salir del modo hideout
    this.btnEl.classList.remove('hideout');
    this.btnEl.style.pointerEvents = 'auto';
    this.btnEl.style.cursor = 'pointer';

    // Posición inicial: donde estaba el toggle
    const toggle = document.getElementById('theme-toggle');
    const tr = toggle ? toggle.getBoundingClientRect() : { left: 0, top: 0 };
    this.btnEl.style.transition = 'none';
    this.btnEl.style.position = 'fixed';
    this.btnEl.style.right = '';
    this.btnEl.style.left = tr.left + 'px';
    this.btnEl.style.top = tr.top + 'px';

    // Forzar reflow
    void this.btnEl.offsetHeight;

    // Destino: coordenadas custom o bottom-right por defecto
    let destX, destY;
    if (targetX !== undefined && targetY !== undefined) {
      destX = targetX;
      destY = targetY;
    } else {
      const bw = this.btnEl.offsetWidth;
      const bh = this.btnEl.offsetHeight;
      destX = window.innerWidth - bw - 20;
      destY = window.innerHeight - bh - 20;
    }

    this.btnEl.style.transition = 'left 0.8s ease-in, top 0.8s ease-in';
    this.btnEl.style.left = destX + 'px';
    this.btnEl.style.top = destY + 'px';

    // 0.2s después: re-disparar el toggle
    setTimeout(() => {
      if (this._onToggleReTrigger) this._onToggleReTrigger();
    }, 200);

    // transitionend: esperar left + top
    let propsDone = 0;
    const onEnd = (e) => {
      if (e.propertyName !== 'left' && e.propertyName !== 'top') return;
      propsDone++;
      if (propsDone < 2) return;
      this.btnEl.removeEventListener('transitionend', onEnd);
      if (!this._active) return;
      this.btnEl.style.transition = '';
      if (this._onFallComplete) this._onFallComplete();
    };
    this.btnEl.addEventListener('transitionend', onEnd);
  }

  stop() {
    this._active = false;
    this.btnEl.style.transition = '';
    this.btnEl.style.pointerEvents = '';
    this.btnEl.style.cursor = '';
  }

  onToggleReTrigger(cb) { this._onToggleReTrigger = cb; }
  onFallComplete(cb) { this._onFallComplete = cb; }
}
