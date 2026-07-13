/* =============================================
   ThemeToggle
   Maneja modo oscuro/claro con persistencia en
   localStorage. Oscuro por defecto.
   API pública mínima para que app.js orqueste.
   ============================================= */
class ThemeToggle {
  constructor(toggleEl) {
    this.toggleEl = toggleEl;
    this._dark = true;
    this._onToggleCb = null;
  }

  /** Cargar tema guardado o default (oscuro) */
  load() {
    try {
      const saved = localStorage.getItem('sc-theme-v2');
      this._dark = saved !== 'light';
    } catch (_) {
      this._dark = true;
    }
    this._apply();
  }

  isDark() {
    return this._dark;
  }

  /** Cambia y persiste */
  toggle() {
    this._dark = !this._dark;
    this._apply();
    this._save();
    if (this._onToggleCb) this._onToggleCb(this._dark);
  }

  /** Vincular callback que se dispara post-toggle */
  onToggle(cb) {
    this._onToggleCb = cb;
  }

  // -- privadas --

  _apply() {
    document.documentElement.setAttribute('data-theme', this._dark ? 'dark' : 'light');
    // El icono muestra el destino: ☀️ si está oscuro (presiona para ir a claro)
    this.toggleEl.textContent = this._dark ? '☀️' : '🌙';
  }

  _save() {
    try {
      localStorage.setItem('sc-theme-v2', this._dark ? 'dark' : 'light');
    } catch (_) { /* no-op */ }
  }
}
