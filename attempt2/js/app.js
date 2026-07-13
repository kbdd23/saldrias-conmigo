/* =============================================
   App — Orquestador principal
   Cadena: Running → Chasing(12) → Tp(10)
          → RandomTp(10) → Jumping ↔ Chilling
          → Hideout → Falling → PostFalling
          → PostReplace(4) → Trapped
          → (drag Sí → click No → fin)
          → Activities → DateTime → Voucher
          → (reset → vuelve a Prompt)
   ============================================= */
class App {
  constructor() {
    // --- DOM refs ---
    this.btnSiEl = document.getElementById('btn-yes');
    this.btnNoEl = document.getElementById('btn-no');

    // --- Module: Theme & Visuals ---
    this.theme = new ThemeToggle(document.getElementById('theme-toggle'));
    this.visuals = new Visuals(
      document.getElementById('hearts-bg'),
      document.getElementById('confetti-container')
    );
    this.subtitles = new SubtitleManager(document.getElementById('subtitle'));
    this.subtitles.initial();

    // --- Module: Minigame (BtnSi) — crear ANTES que BtnNo que los necesita ---
    this.btnSi = new BtnSi(this.btnSiEl);
    this.btnSiReplace = new BtnSiReplace(this.btnSiEl);
    this.btnSiDraggable = new BtnSiDraggable(this.btnSiEl);
    this.btnSiVibrate = new BtnSiVibrate(this.btnSiEl);

    // --- Module: Minigame (BtnNo) ---
    this.btnNoRunning = new BtnNoRunning(this.btnNoEl);
    this.btnNoChasing = new BtnNoChasing(this.btnNoEl);
    this.btnNoTp = new BtnNoTp(this.btnNoEl);
    this.btnNoRandomTp = new BtnNoRandomTp(this.btnNoEl);
    this.btnNoJumping = new BtnNoJumping(this.btnNoEl);
    this.btnNoChilling = new BtnNoChilling(this.btnNoEl);
    this.btnNoHideout = new BtnNoHideout(this.btnNoEl);
    this.btnNoFalling = new BtnNoFalling(this.btnNoEl);
    this.btnNoPostFalling = new BtnNoPostFalling(this.btnNoEl, this.btnSiReplace);
    this.btnNoPostReplace = new BtnNoPostReplace(this.btnNoEl, this.btnSiEl, this.btnSiReplace);
    this.btnNoTrapped = new BtnNoTrapped(
      this.btnNoEl, this.btnSiEl,
      this.btnSiReplace, this.btnSiDraggable, this.btnSiVibrate
    );

    // --- Module: Post-game ---
    this.activitiesGrid = new ActivitiesGrid(
      document.getElementById('activities-grid'),
      document.getElementById('btn-activities-next')
    );
    this.datePicker = new DatePicker(
      document.getElementById('date-options'),
      document.getElementById('btn-date-next')
    );
    this.timePicker = new TimePicker(
      document.getElementById('time-options'),
      document.getElementById('btn-time-next')
    );
    this.voucher = new Voucher(
      document.getElementById('voucher-details')
    );

    // --- State refs ---
    this.promptState = document.getElementById('state-prompt');
    this.activitiesState = document.getElementById('state-activities');
    this.dateState = document.getElementById('state-date');
    this.timeState = document.getElementById('state-time');
    this.voucherState = document.getElementById('state-voucher');
    this.btnReset = document.getElementById('btn-reset');

    // --- State machine ---
    this._currentState = null;

    // --- Guard para evitar doble click en Sí ---
    this._siCooldown = false;

    // --- Easter egg buffer ---
    this._secretBuffer = '';
    this._secretEl = document.getElementById('secret-footer');
    this._onSecretKey = (e) => {
      this._secretBuffer += e.key;
      if (this._secretBuffer.length > 3) {
        this._secretBuffer = this._secretBuffer.slice(-3);
      }
      if (this._secretBuffer === '207') {
        this._secretEl.classList.add('revealed');
        this._secretBuffer = '';
      }
    };

    // --- Flags para ruteo del minijuego ---
    this._pendingTrapped = false;
    this._trappedActive = false;
    this._secondHideout = false;

    // =============================================
    // INICIALIZAR
    // =============================================
    this.theme.load();
    this.visuals.startHearts();

    // =============================================
    // EVENTOS GLOBALES
    // =============================================
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.theme.toggle();
    });

    // Sí: dispara confetti y navega a la grilla de actividades
    this.btnSiEl.addEventListener('click', () => {
      if (this._siCooldown) return;
      this._siCooldown = true;
      this.visuals.startConfetti();
      setTimeout(() => {
        this._siCooldown = false;
        this._switchTo('activities');
      }, 1800);
    });

    // =============================================
    // CADENA DEL MINIJUEGO
    // =============================================

    // 1. Running → primer click → Chasing
    this.btnNoRunning.onFirstDodge(() => {
      this.subtitles.firstClick();
      this.btnNoChasing.start();
    });

    // 2. Chasing → 12 huidas → Tp
    this.btnNoChasing.onDodge(() => {
      this.subtitles.chaseNext();
    });
    this.btnNoChasing.onChaseLimit(() => {
      this.btnNoChasing.stop();
      this.btnNoTp.activate();
    });

    // 3. Tp → 10 saltos → RandomTp
    this.btnNoTp.onTp(() => {
      this.subtitles.tpNext();
    });
    this.btnNoTp.setJumpThreshold(10);
    this.btnNoTp.onChaseLimit(() => {
      this.btnNoTp.stop();
      this.btnNoRandomTp.activate();
    });

    // 4. RandomTp → 10 saltos → Jumping
    this.btnNoRandomTp.onTp(() => {
      this.subtitles.randomTpNext();
    });
    this.btnNoRandomTp.setJumpThreshold(10);
    this.btnNoRandomTp.onChaseLimit(() => {
      this.btnNoRandomTp.stop();
      this.btnNoJumping.activate();
    });

    // 5. Jumping → (inactividad) → Chilling
    this.btnNoJumping.onIdle(() => {
      this.btnNoJumping.stop();
      this.btnNoChilling.activate();
    });

    // 6. Chilling → (proximidad) → Hideout
    this.btnNoChilling.onWake(() => {
      this.btnNoChilling.stop();
      this.subtitles.hideout();
      this.btnNoHideout.activate();
    });

    // 7. Hideout → (click toggle) → Falling
    this.btnNoHideout.onFall(() => {
      if (this._secondHideout) {
        this.subtitles.segundoFalling();
        this._secondHideout = false;
      } else {
        this.subtitles.falling();
      }
      if (this._pendingTrapped) {
        // Caer detrás de Sí
        const siRect = this.btnSiEl.getBoundingClientRect();
        this._pendingTrapped = false;
        this._trappedActive = true;
        this.btnNoFalling.activate(siRect.left, siRect.top);
      } else {
        // Caída normal a bottom-right
        this.btnNoFalling.activate();
      }
    });

    // 8. Falling: re-trigger del toggle
    this.btnNoFalling.onToggleReTrigger(() => {
      this.theme.toggle();
    });

    // 9. Falling completa → PostFalling o Trapped
    this.btnNoFalling.onFallComplete(() => {
      if (this._trappedActive) {
        this._trappedActive = false;
        this.btnNoFalling.stop();
        this.btnNoTrapped.activate();
      } else {
        this.btnNoFalling.stop();
        this.btnNoPostFalling.activate();
      }
    });

    // 10. PostFalling → click en No → PostReplace
    this.btnNoPostFalling.onWake(() => {
      this.subtitles.postFallClick();
      this.subtitles.resetPostReplace();
      setTimeout(() => {
        this.btnNoPostReplace.activate();
      }, 350);
    });

    // 11. PostReplace → vaivén de intercambios
    this.btnNoPostReplace.onWake(() => {
      this.subtitles.postReplaceNext();
    });

    // 12. PostReplace → 4 intercambios → Trapped (segundo ciclo)
    this.btnNoPostReplace.onTrappedEnter(() => {
      this.subtitles.segundoHideout();
      this._pendingTrapped = true;
      this._secondHideout = true;
      this._trappedActive = false;
      this.btnNoHideout.activate();
    });

    // 13. Trapped → arrastrar Sí + finish
    this.btnNoTrapped.onSiDrag(() => {
      this.subtitles.trappedDrag();
    });

    this.btnNoTrapped.onFinish(() => {
      // 2 segundos para que el usuario vea el No "conquistado"
      setTimeout(() => {
        this._switchTo('activities');
      }, 2000);
    });

    // =============================================
    // NAVEGACIÓN POST-GAME
    // =============================================
    document.getElementById('btn-activities-next').addEventListener('click', () => {
      this._switchTo('date');
    });
    document.getElementById('btn-date-next').addEventListener('click', () => {
      this._switchTo('time');
    });
    document.getElementById('btn-time-next').addEventListener('click', () => {
      this._switchTo('voucher');
    });
    this.btnReset.addEventListener('click', () => {
      this._switchTo('prompt');
    });

    // =============================================
    // ARRANQUE
    // =============================================
    this._switchTo('prompt');
  }

  // =============================================
  // MÁQUINA DE ESTADOS
  // =============================================
  _switchTo(newState) {
    if (newState === this._currentState) return;

    // Apagar animaciones del estado anterior
    this.visuals.stopConfetti();
    this.visuals.stopHearts();

    // Ocultar todos los estados
    this.promptState.classList.remove('active');
    this.activitiesState.classList.remove('active');
    this.dateState.classList.remove('active');
    this.timeState.classList.remove('active');
    this.voucherState.classList.remove('active');

    // Limpiar easter egg al salir del voucher
    document.removeEventListener('keydown', this._onSecretKey);
    if (this._secretEl) this._secretEl.classList.remove('revealed');
    this._secretBuffer = '';

    this._currentState = newState;

    switch (newState) {
      case 'prompt':
        this._resetMinigame();
        this.activitiesGrid.reset();
        this.datePicker.reset();
        this.timePicker.reset();
        this.voucher.reset();
        this.subtitles.initial();
        this.promptState.classList.add('active');
        this.visuals.startHearts();
        break;

      case 'activities':
        this._resetMinigame();
        this.activitiesState.classList.add('active');
        this.activitiesGrid.render();
        break;

      case 'date':
        this.dateState.classList.add('active');
        this.datePicker.render();
        break;

      case 'time':
        this.timeState.classList.add('active');
        this.timePicker.render();
        break;

      case 'voucher':
        this.voucherState.classList.add('active');
        this.visuals.startConfetti({ maxPieces: 300, intervalMs: 90, animMin: 4, animMax: 8 });
        const acts = this.activitiesGrid.getSelected();
        const dateObj = this.datePicker.getSelected();
        const timeObj = this.timePicker.getSelected();
        this.voucher.render(acts, dateObj, timeObj);
        document.addEventListener('keydown', this._onSecretKey);
        break;
    }
  }

  // =============================================
  // RESET DEL MINIJUEGO
  // =============================================
  _resetMinigame() {
    // Detener todos los módulos activos del minijuego
    this.btnNoChasing.stop();
    this.btnNoTp.stop();
    this.btnNoRandomTp.stop();
    this.btnNoJumping.stop();
    this.btnNoChilling.stop();
    this.btnNoHideout.stop();
    this.btnNoFalling.stop();
    this.btnNoPostFalling.stop();
    this.btnNoPostReplace.stop();
    this.btnNoTrapped.stop();

    // Resetear módulos de Sí
    this.btnSi.unStalk();
    this.btnSiReplace.reset();
    this.btnSiDraggable.stop();
    this.btnSiVibrate.stop();

    // Remover estados visuales de No
    this.btnNoEl.classList.remove('conquered');
    this.btnNoEl.classList.remove('hideout');
    this.btnNoEl.classList.remove('dodging');

    // Resetear flag de Running
    this.btnNoRunning.reset();

    // Mover No de vuelta al grupo de botones del prompt
    const btnGroup = document.querySelector('#state-prompt .button-group');
    if (btnGroup && !btnGroup.contains(this.btnNoEl)) {
      btnGroup.appendChild(this.btnNoEl);
    }

    // Mover Sí de vuelta al grupo de botones del prompt
    if (btnGroup && !btnGroup.contains(this.btnSiEl)) {
      btnGroup.appendChild(this.btnSiEl);
    }

    // Limpiar estilos inline de Sí
    this.btnSiEl.style.position = '';
    this.btnSiEl.style.left = '';
    this.btnSiEl.style.top = '';
    this.btnSiEl.style.right = '';
    this.btnSiEl.style.bottom = '';
    this.btnSiEl.style.zIndex = '';
    this.btnSiEl.style.transition = '';
    this.btnSiEl.classList.remove('stalking');

    // Resetear flags internos
    this._pendingTrapped = false;
    this._trappedActive = false;
    this._secondHideout = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
