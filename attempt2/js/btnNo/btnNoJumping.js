/* =============================================
   BtnNoJumping — Salto autónomo
   Salta cada 0.5s + proximidad + click.
   Detecta inactividad: si no hay chase por 2s,
   notifica a app.js para ir a Chilling.
   ============================================= */
class BtnNoJumping {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;
    this._jumpTimer = null;
    this._idleTimer = null;

    this._dodgeRadius = 220;
    this._cx = -9999;
    this._cy = -9999;
    this._onJump = null;
    this._onActivate = null;
    this._onIdle = null;

    // Última vez que el cursor estuvo cerca
    this._lastProximityTime = null;

    this._onMouseMove = (e) => {
      this._cx = e.clientX;
      this._cy = e.clientY;
      this._check();
    };

    this._onTouchMove = (e) => {
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
      this._onProximity();
      this._jump();
    };
  }

  activate() {
    if (this._active) return;
    this._active = true;
    this._lastProximityTime = performance.now();

    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.btnEl.addEventListener('click', this._onClick);

    this.btnEl.style.transition = 'none';

    this._jumpTimer = setInterval(() => {
      this._jump();
    }, 500);

    // Monitor de inactividad: cada 500ms revisa si han pasado 1s sin chase
    this._idleTimer = setInterval(() => {
      if (!this._active) return;
      if (this._lastProximityTime === null) return;
      if (performance.now() - this._lastProximityTime > 1000) {
        if (this._onIdle) this._onIdle();
      }
    }, 500);

    if (this._onActivate) this._onActivate();
  }

  stop() {
    this._active = false;
    if (this._jumpTimer) {
      clearInterval(this._jumpTimer);
      this._jumpTimer = null;
    }
    if (this._idleTimer) {
      clearInterval(this._idleTimer);
      this._idleTimer = null;
    }
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onTouchMove);
    this.btnEl.removeEventListener('click', this._onClick);
    this.btnEl.style.transition = '';
  }

  onJump(cb) { this._onJump = cb; }
  onActivate(cb) { this._onActivate = cb; }
  onIdle(cb) { this._onIdle = cb; }
  setRadius(r) { this._dodgeRadius = r; }

  _onProximity() {
    this._lastProximityTime = performance.now();
  }

  _check() {
    if (!this._active) return;
    if (this.btnEl.style.display === 'none') return;

    const r = this.btnEl.getBoundingClientRect();
    const btnCX = r.left + r.width / 2;
    const btnCY = r.top + r.height / 2;

    const dx = this._cx - btnCX;
    const dy = this._cy - btnCY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= this._dodgeRadius) return;

    this._onProximity();
    this._jump();
  }

  _jump() {
    const pad = 20;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = this.btnEl.offsetWidth;
    const bh = this.btnEl.offsetHeight;

    const x = Math.max(pad, Math.random() * (vw - bw - pad));
    const y = Math.max(pad, Math.random() * (vh - bh - pad));

    this.btnEl.style.left = x + 'px';
    this.btnEl.style.top = y + 'px';
    if (this._onJump) this._onJump();
  }
}
