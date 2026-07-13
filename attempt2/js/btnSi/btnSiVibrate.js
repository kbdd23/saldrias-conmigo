/* =============================================
   BtnSiVibrate — Vibración horizontal de Sí
   Oscila sobre right (no left), manteniendo el
   anclaje a la esquina inferior derecha.
   Al arrastrar se detiene y no restaura nada.
   ============================================= */
class BtnSiVibrate {
  constructor(btnSiEl) {
    this.btnSiEl = btnSiEl;
    this._active = false;
    this._animId = null;
    this._startTime = null;
    this._originRight = 0;
    this._onStop = null;

    this._duration = 1000;
    this._amplitude = 10;
    this._frequency = 6;
  }

  activate() {
    if (this._active) return;
    this._active = true;

    // Capturar right actual (anclaje a borde derecho)
    const rect = this.btnSiEl.getBoundingClientRect();
    this._originRight = window.innerWidth - rect.right;
    this.btnSiEl.style.left = '';
    this.btnSiEl.style.right = this._originRight + 'px';

    this._startTime = performance.now();
    this._tick(this._startTime);
  }

  stop() {
    if (this._animId) {
      cancelAnimationFrame(this._animId);
      this._animId = null;
    }
    this._active = false;
    // Quien detiene la vibración (drag o cover)
    // ya va a reposicionar Sí.
    if (this._onStop) this._onStop();
  }

  onStop(cb) { this._onStop = cb; }

  _tick(now) {
    if (!this._active) return;

    const elapsed = now - this._startTime;

    if (elapsed >= this._duration) {
      this.btnSiEl.style.right = this._originRight + 'px';
      this._active = false;
      if (this._onStop) this._onStop();
      return;
    }

    const progress = elapsed / this._duration;
    const angle = progress * Math.PI * 2 * this._frequency;
    const offset = Math.sin(angle) * this._amplitude;

    // Oscilar right en lugar de left
    this.btnSiEl.style.right = (this._originRight + offset) + 'px';

    this._animId = requestAnimationFrame((t) => this._tick(t));
  }
}
