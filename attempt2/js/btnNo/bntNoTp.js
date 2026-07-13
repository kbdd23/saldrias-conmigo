/* =============================================
   BtnNoTp — Teletransporte con sesgo direccional
   Cuenta saltos. Al llegar a N transiciona.
   ============================================= */
class BtnNoTp {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;

    this._dodgeRadius = 180;
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
      e.stopPropagation();
      const r = this.btnEl.getBoundingClientRect();
      this._tp(0, 0, r);
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

    if (dist >= this._dodgeRadius || dist < 1) return;

    this._tp(dx, dy, r);
  }

  _tp(_dx, _dy, r) {
    const pad = 20;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = vw - r.width - pad;
    const maxY = vh - r.height - pad;

    let x, y, dist;
    let attempts = 0;
    do {
      x = Math.max(pad, Math.random() * maxX);
      y = Math.max(pad, Math.random() * maxY);
      dist = Math.sqrt((x - r.left) * (x - r.left) + (y - r.top) * (y - r.top));
      attempts++;
    } while (dist < 300 && attempts < 20);

    this.btnEl.style.left = x + 'px';
    this.btnEl.style.top = y + 'px';

    this._jumpCount++;
    if (this._jumpCount >= this._jumpThreshold && this._onChaseLimit) {
      this._onChaseLimit();
    }

    if (this._onTp) this._onTp();
  }
}
