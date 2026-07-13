/* =============================================
   BtnSiDraggable — Sí se vuelve arrastrable
   Mouse y touch: drag para revelar No detrás.
   ============================================= */
class BtnSiDraggable {
  constructor(btnSiEl) {
    this.btnSiEl = btnSiEl;
    this._active = false;
    this._isDragging = false;
    this._offsetX = 0;
    this._offsetY = 0;

    // ---- Mouse ----
    this._onMouseDown = (e) => {
      if (!this._active) return;
      if (e.button !== 0) return;
      if (e.target !== this.btnSiEl && !this.btnSiEl.contains(e.target)) return;
      this._startDrag(e.clientX, e.clientY);
      e.preventDefault();
    };

    this._onMouseMove = (e) => {
      if (!this._isDragging) return;
      this._moveDrag(e.clientX, e.clientY);
    };

    this._onMouseUp = () => {
      this._endDrag();
    };

    // ---- Touch ----
    this._onTouchStart = (e) => {
      if (!this._active) return;
      const t = e.touches[0];
      if (!t) return;
      if (e.target !== this.btnSiEl && !this.btnSiEl.contains(e.target)) return;
      this._startDrag(t.clientX, t.clientY);
      e.preventDefault();
    };

    this._onTouchMove = (e) => {
      if (!this._isDragging) return;
      const t = e.touches[0];
      if (t) this._moveDrag(t.clientX, t.clientY);
      e.preventDefault();
    };

    this._onTouchEnd = () => {
      this._endDrag();
    };
  }

  _startDrag(clientX, clientY) {
    this._isDragging = true;
    const r = this.btnSiEl.getBoundingClientRect();
    this._offsetX = clientX - r.left;
    this._offsetY = clientY - r.top;
    this.btnSiEl.style.transition = 'none';
    this.btnSiEl.style.cursor = 'grabbing';
  }

  _moveDrag(clientX, clientY) {
    const bw = this.btnSiEl.offsetWidth;
    const bh = this.btnSiEl.offsetHeight;
    let x = clientX - this._offsetX;
    let y = clientY - this._offsetY;
    x = Math.max(0, Math.min(x, window.innerWidth - bw));
    y = Math.max(0, Math.min(y, window.innerHeight - bh));
    this.btnSiEl.style.left = x + 'px';
    this.btnSiEl.style.top = y + 'px';
    this.btnSiEl.style.right = '';
    this.btnSiEl.style.bottom = '';
  }

  _endDrag() {
    if (!this._isDragging) return;
    this._isDragging = false;
    this.btnSiEl.style.cursor = 'grab';
  }

  activate() {
    if (this._active) return;
    this._active = true;

    this.btnSiEl.style.position = 'fixed';
    this.btnSiEl.style.zIndex = '1000';
    this.btnSiEl.style.cursor = 'grab';
    this.btnSiEl.style.userSelect = 'none';
    this.btnSiEl.style.touchAction = 'none';

    document.addEventListener('mousedown', this._onMouseDown, true);
    document.addEventListener('mousemove', this._onMouseMove, true);
    document.addEventListener('mouseup', this._onMouseUp, true);

    document.addEventListener('touchstart', this._onTouchStart, { passive: false, capture: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', this._onTouchEnd, { passive: false, capture: true });
  }

  stop() {
    this._active = false;
    this._isDragging = false;

    document.removeEventListener('mousedown', this._onMouseDown, true);
    document.removeEventListener('mousemove', this._onMouseMove, true);
    document.removeEventListener('mouseup', this._onMouseUp, true);

    document.removeEventListener('touchstart', this._onTouchStart, true);
    document.removeEventListener('touchmove', this._onTouchMove, true);
    document.removeEventListener('touchend', this._onTouchEnd, true);

    this.btnSiEl.style.cursor = '';
    this.btnSiEl.style.userSelect = '';
    this.btnSiEl.style.touchAction = '';
  }
}
