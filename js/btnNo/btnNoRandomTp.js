/* =============================================
   BtnNoRandomTp — Teletransporte puro
   Cuenta saltos. Al llegar a N transiciona.
   ============================================= */
class BtnNoRandomTp {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;

    this._dodgeRadius = 220;
    this._cx = -9999;
    this._cy = -9999;
    this._onTp = null;
    this._onActivate = null;
    this._onChaseLimit = null;

    // Contador de saltos
    this._jumpCount = 0;
    this._jumpThreshold = 10;

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
      this._tp();
    };
  }

  activate() {
    if (this._active) return;
    this._active = true;
    this._jumpCount = 0;

    this.btnEl.style.transition = 'none';
    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.btnEl.addEventListener('click', this._onClick);

    if (this._onActivate) this._onActivate();
  }

  stop() {
    this._active = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onTouchMove);
    this.btnEl.removeEventListener('click', this._onClick);
    this.btnEl.style.transition = '';
  }

  onTp(cb) { this._onTp = cb; }
  onActivate(cb) { this._onActivate = cb; }
  onChaseLimit(cb) { this._onChaseLimit = cb; }
  setRadius(r) { this._dodgeRadius = r; }
  setJumpThreshold(n) { this._jumpThreshold = n; }

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

    this._tp();
  }

  _tp() {
    const pad = 20;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = this.btnEl.offsetWidth;
    const bh = this.btnEl.offsetHeight;

    const x = Math.max(pad, Math.random() * (vw - bw - pad));
    const y = Math.max(pad, Math.random() * (vh - bh - pad));

    this.btnEl.style.left = x + 'px';
    this.btnEl.style.top = y + 'px';

    this._jumpCount++;
    if (this._jumpCount >= this._jumpThreshold && this._onChaseLimit) {
      this._onChaseLimit();
    }

    if (this._onTp) this._onTp();
  }
}
