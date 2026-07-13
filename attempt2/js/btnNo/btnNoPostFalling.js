/* =============================================
   BtnNoPostFalling — Post-caída
   No está en la esquina inferior derecha.
   Solo reacciona a click (no hover/proximidad)
   para que el usuario controle cuándo Sí
   reemplaza la posición de No.
   ============================================= */
class BtnNoPostFalling {
  constructor(btnEl, btnSiReplace) {
    this.btnEl = btnEl;
    this.btnSiReplace = btnSiReplace;
    this._active = false;

    this._lastNoPos = null;
    this._onWake = null;

    this._onClick = (e) => {
      if (!this._active) return;
      e.preventDefault();
      e.stopPropagation();
      this._trigger();
    };
  }

  activate() {
    if (this._active) return;
    this._active = true;

    // Anclar No explícitamente con position:fixed en su ubicación actual
    const r = this.btnEl.getBoundingClientRect();
    this._lastNoPos = { x: r.left, y: r.top };
    this.btnEl.style.position = 'fixed';
    this.btnEl.style.right = (window.innerWidth - r.right) + 'px';
    this.btnEl.style.bottom = (window.innerHeight - r.bottom) + 'px';
    this.btnEl.style.left = '';
    this.btnEl.style.top = '';
    this.btnEl.style.transition = 'none';
    this.btnEl.style.pointerEvents = 'auto';
    this.btnEl.style.cursor = 'pointer';

    // Solo click — nada de hover ni proximidad
    this.btnEl.addEventListener('click', this._onClick);
  }

  stop() {
    this._active = false;
    this.btnEl.removeEventListener('click', this._onClick);
    this.btnEl.style.pointerEvents = '';
    this.btnEl.style.cursor = '';
  }

  onWake(cb) { this._onWake = cb; }

  _trigger() {
    if (!this._active) return;
    this._active = false;

    const prevPos = this._lastNoPos;
    if (!prevPos) return;

    // No: teletransporte instantáneo a esquina superior izquierda
    this.btnEl.style.position = 'fixed';
    this.btnEl.style.transition = 'none';
    this.btnEl.style.left = '20px';
    this.btnEl.style.top = '20px';

    // Sí: animación suave hacia donde estaba No (esquina inf-der)
    this.btnSiReplace.replaceTo(prevPos.x, prevPos.y, 'right-bottom');

    // Limpiar listeners de PostFalling
    this.stop();
    this.btnEl.style.pointerEvents = 'none';

    if (this._onWake) this._onWake();
  }
}
