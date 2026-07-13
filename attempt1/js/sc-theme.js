/* =============================================
   Saldrías Conmigo — ThemeManager
   ============================================= */
SC.ThemeManager = class {
  constructor(toggleEl) {
    this.toggleEl = toggleEl;
    this._dark = true;
  }

  load() {
    try {
      const saved = localStorage.getItem('sc-theme');
      this._dark = saved !== 'light';
    } catch (_) {
      this._dark = true;
    }
    this._apply();
  }

  isDark() {
    return this._dark;
  }

  toggle() {
    this._dark = !this._dark;
    this._apply();
    this._save();
  }

  _apply() {
    document.documentElement.setAttribute('data-theme', this._dark ? 'dark' : 'light');
    this.toggleEl.textContent = this._dark ? '☀️' : '🌙';
  }

  _save() {
    try { localStorage.setItem('sc-theme', this._dark ? 'dark' : 'light'); } catch (_) {}
  }
};
