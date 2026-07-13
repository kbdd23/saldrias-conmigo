/* =============================================
   DatePicker — Selección de fecha
   Muestra 7 días desde "mañana".
   ============================================= */
class DatePicker {
  constructor(containerEl, nextBtn) {
    this.containerEl = containerEl;
    this.nextBtn = nextBtn;
    this._selected = null;
  }

  render() {
    this.containerEl.innerHTML = '';
    this._selected = null;
    this.nextBtn.disabled = true;

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = days[d.getDay()];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();

      let label;
      if (i === 1) {
        label = 'Mañana (' + dayNum + ' ' + monthName + ')';
      } else {
        label = dayName + ' ' + dayNum + ' ' + monthName;
      }

      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(year).slice(-2);
      const iso = d.toISOString().split('T')[0];
      const displayDate = dayName + ' ' + dd + '-' + mm + '-' + yy;

      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.value = iso;
      btn.dataset.displayDate = displayDate;
      btn.dataset.label = label;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        this.containerEl.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this._selected = { value: iso, displayDate: displayDate, label: label };
        this._checkReady();
      });
      this.containerEl.appendChild(btn);
    }
  }

  getSelected() {
    return this._selected;
  }

  reset() {
    this._selected = null;
    this.nextBtn.disabled = true;
    this.containerEl.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
  }

  _checkReady() {
    this.nextBtn.disabled = !this._selected;
  }
}

/* =============================================
   TimePicker — Selección de bloque horario
   Muestra 3 bloques: Medio-Día, Tarde, Atardecer.
   ============================================= */
class TimePicker {
  constructor(containerEl, nextBtn) {
    this.containerEl = containerEl;
    this.nextBtn = nextBtn;
    this._selected = null;
  }

  static TIME_BLOCKS = [
    { label: 'Medio-Día (12:00)', value: '12:00' },
    { label: 'Tarde (15:00)', value: '15:00' },
    { label: 'Atardecer (18:00)', value: '18:00' },
  ];

  render() {
    this.containerEl.innerHTML = '';
    this._selected = null;
    this.nextBtn.disabled = true;

    TimePicker.TIME_BLOCKS.forEach((block) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.value = block.value;
      btn.textContent = block.label;
      btn.addEventListener('click', () => {
        this.containerEl.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this._selected = block;
        this._checkReady();
      });
      this.containerEl.appendChild(btn);
    });
  }

  getSelected() {
    return this._selected;
  }

  reset() {
    this._selected = null;
    this.nextBtn.disabled = true;
    this.containerEl.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
  }

  _checkReady() {
    this.nextBtn.disabled = !this._selected;
  }
}
