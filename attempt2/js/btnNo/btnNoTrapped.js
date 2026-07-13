/* =============================================
   BtnNoTrapped — No atrapado detrás de Sí
   No se posiciona exactamente donde está Sí,
   con z-index inferior. Sí vibra (btnSiVibrate)
   para atraer la atención, y es arrastrable.
   Al arrastrar Sí lejos y clickear No, el
   juego termina: No se vuelve "conquered" y
   se notifica a app.js para transicionar.
   ============================================= */
class BtnNoTrapped {
  constructor(btnNoEl, btnSiEl, btnSiReplace, btnSiDraggable, btnSiVibrate) {
    this.btnNoEl = btnNoEl;
    this.btnSiEl = btnSiEl;
    this.btnSiReplace = btnSiReplace;
    this.btnSiDraggable = btnSiDraggable;
    this.btnSiVibrate = btnSiVibrate;
    this._active = false;
    this._onFinish = null;
    this._onSiDrag = null;

    this._onClick = (e) => {
      if (!this._active) return;
      e.preventDefault();
      e.stopPropagation();
      this._finish();
    };

    this._onSiMouseDown = () => {
      this.btnSiVibrate.stop();
      if (this._onSiDrag) this._onSiDrag();
    };
  }

  onSiDrag(cb) { this._onSiDrag = cb; }
  onFinish(cb) { this._onFinish = cb; }

  activate() {
    if (this._active) return;
    this._active = true;

    const siRect = this.btnSiEl.getBoundingClientRect();
    const siR = window.innerWidth - siRect.right;
    const siB = window.innerHeight - siRect.bottom;

    // No: fixed, anclado a esquina inferior derecha
    this.btnNoEl.style.transition = 'none';
    this.btnNoEl.style.position = 'fixed';
    this.btnNoEl.style.right = siR + 'px';
    this.btnNoEl.style.bottom = siB + 'px';
    this.btnNoEl.style.left = '';
    this.btnNoEl.style.top = '';
    this.btnNoEl.style.zIndex = '998';
    this.btnNoEl.style.pointerEvents = 'auto';
    this.btnNoEl.style.cursor = 'pointer';
    this.btnNoEl.style.opacity = '';

    // Sí: mismo anclaje a esquina inferior derecha
    this._fixSiPosition(siR, siB);

    // Activar módulos de Sí
    this.btnSiDraggable.activate();
    this.btnSiVibrate.activate();

    this.btnSiEl.addEventListener('mousedown', this._onSiMouseDown);
    this.btnNoEl.addEventListener('click', this._onClick);
  }

  stop() {
    this._active = false;
    this.btnSiDraggable.stop();
    this.btnSiVibrate.stop();
    this.btnSiEl.removeEventListener('mousedown', this._onSiMouseDown);
    this.btnNoEl.removeEventListener('click', this._onClick);
    this.btnNoEl.style.zIndex = '';
    this.btnNoEl.style.pointerEvents = '';
    this.btnNoEl.style.cursor = '';
  }

  _modeFor(x, y) {
    return (x < window.innerWidth / 2 && y < window.innerHeight / 2)
      ? 'left-top' : 'right-bottom';
  }

  /** Fija Sí con position: fixed, anclado a esquina inferior derecha */
  _fixSiPosition(right, bottom) {
    const el = this.btnSiEl;
    el.classList.remove('stalking');
    el.style.transition = 'none';
    el.style.position = 'fixed';
    el.style.zIndex = '1000';
    el.style.right = right + 'px';
    el.style.bottom = bottom + 'px';
    el.style.left = '';
    el.style.top = '';
  }

  _finish() {
    if (!this._active) return;
    this._active = false;

    // Detener módulos de Sí
    this.btnSiVibrate.stop();
    this.btnSiDraggable.stop();
    this.btnNoEl.removeEventListener('click', this._onClick);
    this.btnSiEl.removeEventListener('mousedown', this._onSiMouseDown);

    // No se vuelve "conquistado" — visualmente intocable
    this.btnNoEl.classList.add('conquered');
    this.btnNoEl.style.pointerEvents = 'none';

    if (this._onFinish) this._onFinish();
  }
}
