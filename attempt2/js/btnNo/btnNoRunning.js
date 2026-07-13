/* =============================================
   BtnNoRunning — Primer salto
   Al primer click, el botón No escapa a una
   posición aleatoria dentro del viewport.
   Se mueve a document.body con position: fixed
   para evitar containing blocks por transform.
   ============================================= */
class BtnNoRunning {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._hasDodged = false;
    this._onFirstDodge = null;

    this._handleClick = (e) => {
      if (!this._hasDodged) {
        e.preventDefault();
        this._firstDodge();
      }
    };

    this.btnEl.addEventListener('click', this._handleClick);
  }

  _firstDodge() {
    this._hasDodged = true;

    // Mover el botón a body para que position: fixed opere sobre el viewport
    // sin heredar transform de .state
    document.body.appendChild(this.btnEl);

    const pad = 20;
    const bw = this.btnEl.offsetWidth;
    const bh = this.btnEl.offsetHeight;

    const maxX = window.innerWidth - bw - pad;
    const maxY = window.innerHeight - bh - pad;

    const x = Math.max(pad, Math.random() * maxX);
    const y = Math.max(pad, Math.random() * maxY);

    Object.assign(this.btnEl.style, {
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      zIndex: '999',
      transition: 'left 0.2s ease-out, top 0.2s ease-out',
    });

    if (this._onFirstDodge) this._onFirstDodge();
  }

  reset() {
    this._hasDodged = false;
    this.btnEl.style.position = '';
    this.btnEl.style.left = '';
    this.btnEl.style.top = '';
    this.btnEl.style.zIndex = '';
    this.btnEl.style.transition = '';
  }

  onFirstDodge(cb) {
    this._onFirstDodge = cb;
  }
}
