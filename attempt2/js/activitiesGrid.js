/* =============================================
   ActivitiesGrid — Grilla de actividades
   Renderiza 9 actividades seleccionables.
   ============================================= */
class ActivitiesGrid {
  constructor(gridEl, nextBtn) {
    this.gridEl = gridEl;
    this.nextBtn = nextBtn;
    this._selected = [];
  }

  static ACTIVITIES = [
    { emoji: '🎬', label: 'Ir al cine' },
    { emoji: '☕', label: 'Café' },
    { emoji: '🌳', label: 'Parque' },
    { emoji: '🏖️', label: 'Ir a la playa' },
    { emoji: '📚', label: 'Ir a una librería' },
  ];

  render() {
    this.gridEl.innerHTML = '';
    this._selected = [];
    this.nextBtn.disabled = true;

    ActivitiesGrid.ACTIVITIES.forEach((act) => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.dataset.label = act.label;
      card.innerHTML =
        '<span class="emoji">' + act.emoji + '</span>' +
        '<span class="label">' + act.label + '</span>';

      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        this._sync();
      });

      this.gridEl.appendChild(card);
    });
  }

  getSelected() {
    return this._selected.slice();
  }

  reset() {
    this._selected = [];
    this.nextBtn.disabled = true;
    const cards = this.gridEl.querySelectorAll('.activity-card');
    cards.forEach((c) => c.classList.remove('selected'));
  }

  _sync() {
    this._selected = [];
    const cards = this.gridEl.querySelectorAll('.activity-card');
    cards.forEach((card) => {
      if (card.classList.contains('selected')) {
        this._selected.push(card.dataset.label);
      }
    });
    this.nextBtn.disabled = this._selected.length === 0;
  }
}
