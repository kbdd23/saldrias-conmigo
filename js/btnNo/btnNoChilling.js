/* =============================================
   BtnNoChilling — Reposo vigilante
   El botón se queda quieto. Si el usuario se
   acerca, hace hover o click, despierta y
   vuelve a Jumping.
   ============================================= */
class BtnNoChilling {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;
    this._onWake = null;

    this._dodgeRadius = 220;

    this._onMouseMove = (e) => {
      if (!this._active) return;
      const r = this.btnEl.getBoundingClientRect();
      const btnCX = r.left + r.width / 2;
      const btnCY = r.top + r.height / 2;
      const dx = e.clientX - btnCX;
      const dy = e.clientY - btnCY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this._dodgeRadius && this._onWake) this._onWake();
    };

    this._onTouchMove = (e) => {
      if (!this._active) return;
      const t = e.touches[0];
      if (!t) return;
      const r = this.btnEl.getBoundingClientRect();
      const btnCX = r.left + r.width / 2;
      const btnCY = r.top + r.height / 2;
      const dx = t.clientX - btnCX;
      const dy = t.clientY - btnCY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this._dodgeRadius && this._onWake) this._onWake();
    };

    this._onClick = (e) => {
      if (!this._active) return;
      e.preventDefault();
      if (this._onWake) this._onWake();
    };
  }

  activate() {
    if (this._active) return;
    this._active = true;

    // Botón se queda quieto, sin animación
    this.btnEl.style.transition = 'none';

    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.btnEl.addEventListener('click', this._onClick);
  }

  stop() {
    this._active = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onTouchMove);
    this.btnEl.removeEventListener('click', this._onClick);
  }

  onWake(cb) { this._onWake = cb; }
  setRadius(r) { this._dodgeRadius = r; }
}
