/* =============================================
   Saldrías Conmigo — App Orchestrator
   Coordina los módulos y maneja la máquina de
   estados global (prompt → activities → datetime → confirmation).
   ============================================= */
SC.App = class {
  constructor() {
    // -------------------------------------------------
    // DOM refs
    // -------------------------------------------------
    this.appEl = SC.$('app');
    this.promptState = SC.$('state-prompt');
    this.activitiesState = SC.$('state-activities');
    this.datetimeState = SC.$('state-datetime');
    this.confirmationState = SC.$('state-confirmation');
    this.btnYes = SC.$('btn-yes');
    this.btnNo = SC.$('btn-no');
    this.subtitleEl = this.promptState.querySelector('.subtitle');
    this.activitiesGrid = SC.$('activities-grid');
    this.btnActivitiesNext = SC.$('btn-activities-next');
    this.dateOptions = SC.$('date-options');
    this.timeOptions = SC.$('time-options');
    this.btnDatetimeNext = SC.$('btn-datetime-next');
    this.confirmationDetails = SC.$('confirmation-details');
    this.confettiContainer = SC.$('confetti-container');
    this.heartsBg = SC.$('hearts-bg');
    this.darkToggle = SC.$('dark-toggle');
    this.btnReset = SC.$('btn-reset');

    // -------------------------------------------------
    // Estado global
    // -------------------------------------------------
    this._currentState = null; // 'prompt' | 'activities' | 'datetime' | 'confirmation'

    // -------------------------------------------------
    // Componentes
    // -------------------------------------------------
    this.themeManager = new SC.ThemeManager(this.darkToggle);
    this.hearts = new SC.HeartsBackground(this.heartsBg);
    this.confetti = new SC.Confetti(this.confettiContainer);
    this.activities = new SC.ActivitiesManager(this.activitiesGrid, this.btnActivitiesNext);
    this.datetime = new SC.DateTimeManager(this.dateOptions, this.timeOptions, this.btnDatetimeNext);

    this.dodgingBtn = new SC.DodgingButton(
      this.appEl,
      this.btnNo,
      this.btnYes,
      this.subtitleEl,
      this.darkToggle
    );

    // -------------------------------------------------
    // Inicializar
    // -------------------------------------------------
    this._init();
  }

  _init() {
    // Cargar tema
    this.themeManager.load();

    // Renderizar grids
    this.activities.render();
    this.datetime.render();

    // Eventos de navegación global
    this.dodgingBtn.onYesClick = () => this._switchTo('activities');
    this.btnActivitiesNext.addEventListener('click', () => this._switchTo('datetime'));
    this.btnDatetimeNext.addEventListener('click', () => this._switchTo('confirmation'));
    this.btnReset.addEventListener('click', () => this._switchTo('prompt'));

    // Dark toggle: si No está en hideout, gatilla la caída
    this.darkToggle.addEventListener('click', () => {
      if (this.dodgingBtn.isInHideout()) {
        const wasDark = this.themeManager.isDark();
        this.themeManager.toggle();          // va a claro
        this.dodgingBtn.triggerFall();        // No cae
        setTimeout(() => {
          if (wasDark) this.themeManager.toggle();  // vuelve a oscuro
        }, 250);
      } else {
        this.themeManager.toggle();
      }
    });

    // Arrancar
    this._switchTo('prompt');
  }

  // =============================================
  // STATE MACHINE
  // =============================================
  _switchTo(newState) {
    if (newState === this._currentState) return;

    // Limpiar animaciones del estado anterior
    this.hearts.stop();
    this.confetti.stop();

    // Ocultar todos los estados
    this.promptState.classList.remove('active');
    this.activitiesState.classList.remove('active');
    this.datetimeState.classList.remove('active');
    this.confirmationState.classList.remove('active');

    // Ocultar/mostrar botón No solo en prompt
    this.dodgingBtn.hide();

    this._currentState = newState;

    switch (newState) {
      case 'prompt':
        this.promptState.classList.add('active');
        this.dodgingBtn.show();
        this.dodgingBtn.reset();
        this.activities.reset();
        this.datetime.reset();
        this.hearts.start();
        break;

      case 'activities':
        this.activitiesState.classList.add('active');
        this.activities.render();
        break;

      case 'datetime':
        this.datetimeState.classList.add('active');
        this.datetime.render();
        break;

      case 'confirmation':
        this.confirmationState.classList.add('active');
        this._renderConfirmation();
        this.confetti.start();
        break;
    }
  }

  _renderConfirmation() {
    const sel = this.activities.getSelected();
    const actText = sel.length > 0 ? sel.join(', ') : 'lo que tú quieras';
    const dt = this.datetime.getSelected();

    this.confirmationDetails.innerHTML =
      '<p>📅 <strong>' + (dt.date ? dt.date.label : '—') + '</strong></p>' +
      '<p>⏰ <strong>' + (dt.time || '—') + '</strong></p>' +
      '<p>🎯 <strong>' + actText + '</strong></p>';
  }
};
