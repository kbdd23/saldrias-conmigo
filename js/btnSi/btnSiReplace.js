/* =============================================
   BtnSiReplace — Intercambio de posiciones
   replaceTo(x, y, mode):
     mode 'left-top': posiciona con left/top
     mode 'right-bottom': posiciona con right/bottom
   ============================================= */
class BtnSiReplace {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;
  }

  /** Mueve Sí a (x, y) — coordenadas viewport left/top */
  replaceTo(x, y, mode) {
    if (this._active) return;
    this._active = true;

    const el = this.btnEl;
    const bw = el.offsetWidth;
    const bh = el.offsetHeight;

    // 1. Posición actual en viewport
    const r = el.getBoundingClientRect();

    // 2. Mover a body
    document.body.appendChild(el);

    // 3. Fijar en posición actual sin transición (según el modo destino)
    el.classList.add('stalking');
    el.style.transition = 'none';
    el.style.position = 'fixed';
    el.style.zIndex = '1000';

    if (mode === 'right-bottom') {
      const curRight = window.innerWidth - r.right;
      const curBottom = window.innerHeight - r.bottom;
      el.style.left = '';
      el.style.top = '';
      el.style.right = curRight + 'px';
      el.style.bottom = curBottom + 'px';
    } else {
      // left-top por defecto
      el.style.right = '';
      el.style.bottom = '';
      el.style.left = r.left + 'px';
      el.style.top = r.top + 'px';
    }

    // 4. Forzar reflow
    void el.offsetHeight;

    // 5. Animar al destino
    if (mode === 'right-bottom') {
      const tgtRight = window.innerWidth - x - bw;
      const tgtBottom = window.innerHeight - y - bh;
      el.style.transition = 'right 0.2s ease, bottom 0.2s ease';
      el.style.right = tgtRight + 'px';
      el.style.bottom = tgtBottom + 'px';
    } else {
      el.style.transition = 'left 0.2s ease, top 0.2s ease';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    }

    // 6. Al terminar: resetear flag
    el.addEventListener('transitionend', () => {
      this._active = false;
    }, { once: true });
  }

  reset() {
    this._active = false;
    const el = this.btnEl;
    el.classList.remove('stalking');
    el.style.position = '';
    el.style.left = '';
    el.style.top = '';
    el.style.right = '';
    el.style.bottom = '';
    el.style.zIndex = '';
    el.style.transition = '';
  }
}
