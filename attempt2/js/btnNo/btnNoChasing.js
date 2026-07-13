/* =============================================
   BtnNoChasing — Huida por proximidad
   Acumula chase time. Al llegar a 3s de
   persecución real, notifica a app.js.
   Responde a mousemove, hover y click.
   Si está acorralado contra un borde, la
   huida se redirige hacia el centro.
   ============================================= */
class BtnNoChasing {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;

    this._dodgeRadius = 180;
    this._cooldownMs = 120;
    this._lastDodge = 0;

    this._cx = -9999;
    this._cy = -9999;
    this._onDodge = null;
    this._onChaseLimit = null;

    // Contador de huidas en lugar de tiempo
    this._dodgeCount = 0;
    this._dodgeThreshold = 12;

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
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      this._flee(dx || 1, dy || 1, r);
    };

    this._onHover = (e) => {
      if (!this._active) return;
      const r = this.btnEl.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this._dodgeRadius) {
        this._flee(dx, dy, r);
      }
    };
  }

  start() {
    if (this._active) return;
    this._active = true;
    this._dodgeCount = 0;
    this.btnEl.style.transition = 'left 0.08s ease-out, top 0.08s ease-out';
    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.btnEl.addEventListener('click', this._onClick);
    this.btnEl.addEventListener('mouseenter', this._onHover);
  }

  stop() {
    this._active = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onTouchMove);
    this.btnEl.removeEventListener('click', this._onClick);
    this.btnEl.removeEventListener('mouseenter', this._onHover);
  }

  onDodge(cb) { this._onDodge = cb; }
  onChaseLimit(cb) { this._onChaseLimit = cb; }
  setRadius(r) { this._dodgeRadius = r; }
  setDodgeThreshold(n) { this._dodgeThreshold = n; }

  _check() {
    if (!this._active) return;
    if (this.btnEl.style.display === 'none') return;

    const now = performance.now();
    if (now - this._lastDodge < this._cooldownMs) return;

    const r = this.btnEl.getBoundingClientRect();
    const btnCX = r.left + r.width / 2;
    const btnCY = r.top + r.height / 2;

    const dx = this._cx - btnCX;
    const dy = this._cy - btnCY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= this._dodgeRadius || dist < 1) return;

    this._lastDodge = now;
    this._flee(dx, dy, r);

    // Contar huidas — al llegar al límite, transicionar
    this._dodgeCount++;
    if (this._dodgeCount >= this._dodgeThreshold) {
      if (this._onChaseLimit) this._onChaseLimit();
    }
  }

  _flee(dx, dy, r) {
    const pad = 20;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = r.width;
    const bh = r.height;
    const edgeThreshold = 120;

    // Vector de huida base: dirección opuesta al cursor
    let fx = -dx;
    let fy = -dy;

    // Si está cerca de un borde, sumar vector que empuje hacia el centro
    const distLeft = r.left;
    const distRight = vw - r.right;
    const distTop = r.top;
    const distBottom = vh - r.bottom;

    if (distLeft < edgeThreshold) fx += edgeThreshold - distLeft;
    if (distRight < edgeThreshold) fx -= edgeThreshold - distRight;
    if (distTop < edgeThreshold) fy += edgeThreshold - distTop;
    if (distBottom < edgeThreshold) fy -= edgeThreshold - distBottom;

    // Normalizar y escalar
    const len = Math.sqrt(fx * fx + fy * fy) || 1;
    const dist = 180 + Math.random() * 200;
    const normX = fx / len;
    const normY = fy / len;

    let destX = r.left + normX * dist;
    let destY = r.top + normY * dist;

    destX = Math.max(pad, Math.min(destX, vw - bw - pad));
    destY = Math.max(pad, Math.min(destY, vh - bh - pad));

    this.btnEl.style.left = destX + 'px';
    this.btnEl.style.top = destY + 'px';

    if (this._onDodge) this._onDodge();
  }
}
