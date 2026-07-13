/* =============================================
   BtnSi — Lógica de acecho (btnSiReplace)
   stalkTo(x, y): Sí se mueve a la posición
   absoluta (fixed) indicada.
   unStalk(): vuelve a su estado normal dentro
   del flujo del prompt.
   ============================================= */
class BtnSi {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._stalking = false;
  }

  stalkTo(x, y) {
    this._stalking = true;
    this.btnEl.classList.add('stalking');
    Object.assign(this.btnEl.style, {
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      zIndex: '1000',
      transition: 'left 1.2s ease, top 1.2s ease',
    });
  }

  unStalk() {
    this._stalking = false;
    this.btnEl.classList.remove('stalking');
    this.btnEl.style.position = '';
    this.btnEl.style.left = '';
    this.btnEl.style.top = '';
    this.btnEl.style.zIndex = '';
    this.btnEl.style.transition = '';
  }
}
