/* =============================================
   BtnNoHideout — El botón No real se esconde
   detrás del theme-toggle, inalcanzable.
   Si el usuario hace click en el toggle,
   se activa la caída (Falling).
   Limpia TODOS los estilos de posicionamiento
   previos para evitar estiramientos.
   ============================================= */
class BtnNoHideout {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this._active = false;
    this._onFall = null;
    this._toggleEl = document.getElementById('theme-toggle');

    this._onToggleClick = (e) => {
      if (!this._active) return;
      this.stop();
      if (this._onFall) this._onFall();
    };
  }

  activate() {
    if (this._active) return;
    this._active = true;

    const toggle = this._toggleEl;
    if (!toggle) return;

    const tr = toggle.getBoundingClientRect();

    this.btnEl.classList.add('hideout');
    // Limpiar CUALQUIER estilo de posicionamiento heredado
    // para evitar que left+right o top+bottom estiren el botón
    this.btnEl.style.left = '';
    this.btnEl.style.top = '';
    this.btnEl.style.right = '';
    this.btnEl.style.bottom = '';
    this.btnEl.style.transform = '';
    this.btnEl.style.fontSize = '';
    this.btnEl.style.padding = '';
    // Aplicar solo top y right (posición detrás del toggle)
    this.btnEl.style.position = 'fixed';
    this.btnEl.style.top = tr.top + 'px';
    this.btnEl.style.right = (window.innerWidth - tr.right) + 'px';
    this.btnEl.style.zIndex = '199';
    this.btnEl.style.margin = '0';

    // Interceptar click en toggle
    toggle.addEventListener('click', this._onToggleClick, true);
  }

  stop() {
    if (!this._active) return;
    this._active = false;
    if (this._toggleEl) {
      this._toggleEl.removeEventListener('click', this._onToggleClick, true);
    }
    this.btnEl.classList.remove('hideout');
    this.btnEl.style.position = '';
    this.btnEl.style.top = '';
    this.btnEl.style.right = '';
    this.btnEl.style.left = '';
    this.btnEl.style.bottom = '';
    this.btnEl.style.zIndex = '';
    this.btnEl.style.margin = '';
    this.btnEl.style.transform = '';
    this.btnEl.style.fontSize = '';
    this.btnEl.style.padding = '';
  }

  onFall(cb) { this._onFall = cb; }
}
