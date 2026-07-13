/* =============================================
   BtnNoPostReplace — Vaivén post-replace
   Detecta qué esquina corresponde a cada botón
   y usa left/top (sup-izq) o right/bottom
   (inf-der) según corresponda.
   ============================================= */
class BtnNoPostReplace {
  constructor(btnNoEl, btnSiEl, btnSiReplace) {
    this.btnNoEl = btnNoEl;
    this.btnSiEl = btnSiEl;
    this.btnSiReplace = btnSiReplace;
    this._active = false;
    this._onWake = null;
    this._onTrappedEnter = null;

    // Contador de intercambios para entrar al modo trapped
    this._exchangeCount = 0;
    this._maxExchanges = 4;

    this._dodgeRadius = 220;
    this._cx = -9999;
    this._cy = -9999;
    this._reactivateTimer = null;

    this._onMouseMove = (e) => {
      if (!this._active) return;
      this._cx = e.clientX;
      this._cy = e.clientY;
      this._check();
    };

    this._onTouchMove = (e) => {
      if (!this._active) return;
      const t = e.touches[0];
      if (t) {
        this._cx = t.clientX;
        this._cy = t.clientY;
        this._check();
      }
    };

    this._onClick = (e) => {
      if (!this._active) return;
      e.preventDefault();
      e.stopPropagation();
      this._trigger();
    };

    this._onHover = (e) => {
      if (!this._active) return;
      const r = this.btnNoEl.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this._dodgeRadius) {
        this._trigger();
      }
    };
  }

  /** Determina si una posición está más cerca de top-left o bottom-right */
  _modeFor(x, y) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    return (x < cx && y < cy) ? 'left-top' : 'right-bottom';
  }

  activate(resetCounter = true) {
    if (this._active) return;
    this._active = true;

    this.btnNoEl.style.pointerEvents = 'auto';
    this.btnNoEl.style.cursor = 'pointer';

    // Resetear contador solo si viene desde fuera (PostFalling)
    if (resetCounter) this._exchangeCount = 0;

    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.btnNoEl.addEventListener('click', this._onClick);
    this.btnNoEl.addEventListener('mouseenter', this._onHover);
  }

  stop() {
    this._active = false;
    if (this._reactivateTimer) {
      clearTimeout(this._reactivateTimer);
      this._reactivateTimer = null;
    }
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onTouchMove);
    this.btnNoEl.removeEventListener('click', this._onClick);
    this.btnNoEl.removeEventListener('mouseenter', this._onHover);
    this.btnNoEl.style.pointerEvents = '';
    this.btnNoEl.style.cursor = '';
  }

  onWake(cb) { this._onWake = cb; }

  _check() {
    if (!this._active) return;
    if (this.btnNoEl.style.display === 'none') return;

    const r = this.btnNoEl.getBoundingClientRect();
    const btnCX = r.left + r.width / 2;
    const btnCY = r.top + r.height / 2;
    const dx = this._cx - btnCX;
    const dy = this._cy - btnCY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= this._dodgeRadius) return;

    this._trigger();
  }

  _trigger() {
    if (!this._active) return;
    this._active = false;

    const bw = this.btnNoEl.offsetWidth;
    const bh = this.btnNoEl.offsetHeight;

    // Capturar posiciones ANTES de modificar estilos
    const siRect = this.btnSiEl.getBoundingClientRect();
    const noRect = this.btnNoEl.getBoundingClientRect();

    // --- No se mueve hacia donde está Sí ---
    const noMode = this._modeFor(siRect.left, siRect.top);
    this.btnNoEl.style.transition = 'none';
    this.btnNoEl.style.position = 'fixed';

    if (noMode === 'right-bottom') {
      const curRight = window.innerWidth - noRect.right;
      const curBottom = window.innerHeight - noRect.bottom;
      this.btnNoEl.style.left = '';
      this.btnNoEl.style.top = '';
      this.btnNoEl.style.right = curRight + 'px';
      this.btnNoEl.style.bottom = curBottom + 'px';
    } else {
      const curLeft = noRect.left;
      const curTop = noRect.top;
      this.btnNoEl.style.right = '';
      this.btnNoEl.style.bottom = '';
      this.btnNoEl.style.left = curLeft + 'px';
      this.btnNoEl.style.top = curTop + 'px';
    }

    void this.btnNoEl.offsetHeight;

    if (noMode === 'right-bottom') {
      const tgtRight = window.innerWidth - siRect.left - bw;
      const tgtBottom = window.innerHeight - siRect.top - bh;
      this.btnNoEl.style.transition = 'right 0.2s ease, bottom 0.2s ease';
      this.btnNoEl.style.right = tgtRight + 'px';
      this.btnNoEl.style.bottom = tgtBottom + 'px';
    } else {
      this.btnNoEl.style.transition = 'left 0.2s ease, top 0.2s ease';
      this.btnNoEl.style.left = siRect.left + 'px';
      this.btnNoEl.style.top = siRect.top + 'px';
    }

    // --- Sí reemplaza donde estaba No ---
    const siMode = this._modeFor(noRect.left, noRect.top);
    this.btnSiReplace.replaceTo(noRect.left, noRect.top, siMode);

    // Quitar interactividad
    this.stop();

    // Incrementar contador y decidir siguiente paso
    this._exchangeCount++;
    if (this._exchangeCount >= this._maxExchanges) {
      // Entrar al modo trapped (No → hideout → caída detrás de Sí)
      if (this._onTrappedEnter) this._onTrappedEnter();
    } else {
      // Reactivar vaivén normalmente
      this._reactivateTimer = setTimeout(() => {
        this._reactivateTimer = null;
        this.activate(false);
      }, 400);
    }

    if (this._onWake) this._onWake();
  }

  onTrappedEnter(cb) { this._onTrappedEnter = cb; }
}
