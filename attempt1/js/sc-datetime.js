/* =============================================
   Saldrías Conmigo — DateTimePicker
   ============================================= */
SC.DateTimeManager = class {
  constructor(dateContainer, timeContainer, confirmBtn) {
    this.dateContainer = dateContainer;
    this.timeContainer = timeContainer;
    this.confirmBtn = confirmBtn;
    this._selectedDate = null;
    this._selectedTime = null;
  }

  render() {
    this.dateContainer.innerHTML = '';
    this.timeContainer.innerHTML = '';
    this._selectedDate = null;
    this._selectedTime = null;
    this.confirmBtn.disabled = true;

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = days[d.getDay()];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];
      let label;
      if (i === 0) {
        label = 'Hoy (' + dayNum + ' ' + monthName + ')';
      } else if (i === 1) {
        label = 'Mañana (' + dayNum + ' ' + monthName + ')';
      } else {
        label = dayName + ' ' + dayNum + ' ' + monthName;
      }
      const iso = d.toISOString().split('T')[0];

      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.value = iso;
      btn.dataset.label = label;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        this.dateContainer.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this._selectedDate = { value: iso, label: label };
        this._checkReady();
      });
      this.dateContainer.appendChild(btn);
    }

    SC.TIME_SLOTS.forEach((time) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.value = time;
      btn.textContent = time;
      btn.addEventListener('click', () => {
        this.timeContainer.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this._selectedTime = time;
        this._checkReady();
      });
      this.timeContainer.appendChild(btn);
    });
  }

  getSelected() {
    return {
      date: this._selectedDate,
      time: this._selectedTime,
    };
  }

  reset() {
    this._selectedDate = null;
    this._selectedTime = null;
    this.confirmBtn.disabled = true;
    this.dateContainer.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
    this.timeContainer.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
  }

  _checkReady() {
    this.confirmBtn.disabled = !(this._selectedDate && this._selectedTime);
  }
};
