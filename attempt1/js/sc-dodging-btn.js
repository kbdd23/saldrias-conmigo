/* =============================================
   Saldrías Conmigo — DodgingButton
   Máquina de estados del botón No y su interacción
   con el botón Sí modo acecho.
   ============================================= */
SC.DodgingButton = class {
  constructor(appEl, btnNo, btnYes, subtitleEl, darkToggle) {
    this.appEl = appEl;
    this.btnNo = btnNo;
    this.btnYes = btnYes;
    this.subtitleEl = subtitleEl;
    this.darkToggle = darkToggle;

    const cfg = SC.CONFIG;

    // Constantes de comportamiento
    this._DODGE_RADIUS = cfg.DODGE_RADIUS;
    this._STALK_THRESHOLD = cfg.STALK_THRESHOLD;
    this._DODGE_COOLDOWN = cfg.DODGE_COOLDOWN;
    this._HIDEOUT_THRESHOLD = cfg.HIDEOUT_THRESHOLD;

    // --- Máquina de estados ---
    // STATIC | DODGING | STALKING | HIDEOUT | FALLEN | POST_FALL
    this.mode = 'STATIC';

    this._cursorX = -9999;
    this._cursorY = -9999;
    this._dodgeCount = 0;
    this._lastDodgeTime = 0;
    this._hideoutCount = 0;

    // Callbacks
    this.onYesClick = null;

    // Bind listeners
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onNoClick = this._onNoClick.bind(this);
    this._onNoTouchStart = this._onNoTouchStart.bind(this);
    this._onYesClick = this._onYesClick.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);

    // ResizeObserver para responsive sin perder estado
    this._resizeObserver = new ResizeObserver(() => this._clampPosition());

    this._init();
  }

  // =============================================
  // INIT
  // =============================================
  _init() {
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.btnNo.addEventListener('click', this._onNoClick);
    this.btnNo.addEventListener('touchstart', this._onNoTouchStart, { passive: false });
    this.btnYes.addEventListener('click', this._onYesClick);
    this._resizeObserver.observe(this.appEl);
    // Fallback: window.resize cuando el contenedor no cambia (max-width en pantallas anchas)
    this._onWindowResize = () => this._clampPosition();
    window.addEventListener('resize', this._onWindowResize);
  }

  destroy() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onTouchMove);
    this.btnNo.removeEventListener('click', this._onNoClick);
    this.btnNo.removeEventListener('touchstart', this._onNoTouchStart);
    this.btnYes.removeEventListener('click', this._onYesClick);
    this._resizeObserver.disconnect();
    window.removeEventListener('resize', this._onWindowResize);
  }

  // =============================================
  // PUBLIC API
  // =============================================
  reset() {
    this.mode = 'STATIC';
    this._dodgeCount = 0;
    this._hideoutCount = 0;
    this._lastDodgeTime = 0;
    this._resetNoStyles();
    this._deactivateYesStalking();
    this._setSubtitle(SC.SUBTITLES.initial);
  }

  hide() {
    this.btnNo.style.display = 'none';
  }

  show() {
    this.btnNo.style.display = '';
  }

  isInHideout() {
    return this.mode === 'HIDEOUT';
  }

  /** Transición HIDEOUT → FALLEN (gatillada por el toggle de dark mode) */
  triggerFall() {
    if (this.mode !== 'HIDEOUT') return;
    this.mode = 'FALLEN';

    this.btnNo.classList.remove('hideout');
    this.btnNo.classList.remove('dodging');

    // Limpiar estilos inline residuales del hideout
    this.btnNo.style.fontSize = '';
    this.btnNo.style.padding = '';
    this.btnNo.style.margin = '';
    this.btnNo.style.borderRadius = '';
    this.btnNo.style.display = '';
    this.btnNo.style.alignItems = '';
    this.btnNo.style.justifyContent = '';
    this.btnNo.style.background = '';
    this.btnNo.style.color = '';
    this.btnNo.style.width = '';
    this.btnNo.style.height = '';
    this.btnNo.style.right = '';
    this.btnNo.style.bottom = '';
    this.btnNo.style.pointerEvents = 'none';
    this.btnNo.style.opacity = '1';

    // FLIP: leer posición actual (aún en fixed, coords viewport)
    const ar = this.appEl.getBoundingClientRect();
    const noRect = this.btnNo.getBoundingClientRect();
    const curLeft = noRect.left - ar.left;
    const curTop = noRect.top - ar.top;

    // Destino: esquina inferior derecha de #app
    const destLeft = ar.width - noRect.width - 20;
    const destTop = ar.height - noRect.height - 20;

    // Frame 1: pasar a absolute dentro de #app, fijar posición actual SIN transición
    this.btnNo.style.position = 'absolute';
    this.btnNo.style.transition = 'none';
    this.btnNo.style.left = curLeft + 'px';
    this.btnNo.style.top = curTop + 'px';
    this.btnNo.style.right = '';
    this.btnNo.style.bottom = '';
    this.btnNo.style.transform = 'none';

    // Forzar reflow para que el browser capture la posición actual
    void this.btnNo.offsetHeight;

    // Frame 2: animar al destino CON transición
    this.btnNo.style.transition = 'top 1s cubic-bezier(0.22, 1, 0.36, 1), left 1s cubic-bezier(0.22, 1, 0.36, 1)';
    this.btnNo.style.left = destLeft + 'px';
    this.btnNo.style.top = destTop + 'px';
    this.btnNo.style.transform = 'rotate(3deg)';

    this._setSubtitle(SC.SUBTITLES.fall);

    setTimeout(() => {
      this.btnNo.style.transition = '';
      this.btnNo.style.pointerEvents = 'auto';
      this.btnNo.style.transform = 'none';
      this.mode = 'POST_FALL';
      this._dodgeCount = 0;
      this._hideoutCount = 0;
      this._setSubtitle(SC.SUBTITLES.postFall);
    }, 1100);
  }

  // =============================================
  // EVENT HANDLERS
  // =============================================
  _onMouseMove(e) {
    this._cursorX = e.clientX;
    this._cursorY = e.clientY;
    this._checkProximity();
  }

  _onTouchMove(e) {
    const touch = e.touches[0];
    if (!touch) return;
    this._cursorX = touch.clientX;
    this._cursorY = touch.clientY;
    this._checkProximity();
  }

  _onNoClick(e) {
    if (this.mode !== 'HIDEOUT') {
      e.preventDefault();
      this._triggerDodge();
    }
  }

  _onNoTouchStart(e) {
    if (this.mode !== 'HIDEOUT') {
      e.preventDefault();
      const touch = e.touches[0];
      this._cursorX = touch.clientX;
      this._cursorY = touch.clientY;
      this._triggerDodge();
    }
  }

  _onYesClick() {
    // El Sí se clickeó — resetear modo acecho y notificar
    this._deactivateYesStalking();
    if (this.onYesClick) this.onYesClick();
  }

  // =============================================
  // PROXIMIDAD (mousemove / touchmove)
  // =============================================
  _checkProximity() {
    // No procesar si el botón está oculto (display:none desde App)
    if (this.btnNo.style.display === 'none') return;
    if (this.mode === 'HIDEOUT') return;

    if (this.mode === 'DODGING' || this.mode === 'STALKING') {
      this._triggerDodge();
      return;
    }

    if (this.mode === 'POST_FALL') {
      const noRect = this.btnNo.getBoundingClientRect();
      const cx = noRect.left + noRect.width / 2;
      const cy = noRect.top + noRect.height / 2;
      const dx = this._cursorX - cx;
      const dy = this._cursorY - cy;
      if (Math.sqrt(dx * dx + dy * dy) < this._DODGE_RADIUS) {
        this.mode = 'STATIC'; // reseteo implícito para re-ingresar a DODGING limpio
        this._dodgeCount = 0;
        this._triggerDodge();
      }
    }
  }

  // =============================================
  // NÚCLEO: ESQUIVA
  // =============================================
  _triggerDodge() {
    if (this.mode === 'HIDEOUT') return;

    const ar = SC.getAppRect(this.appEl);
    const btnRect = this.btnNo.getBoundingClientRect();
    const bw = btnRect.width;
    const bh = btnRect.height;

    const btnAppX = btnRect.left - ar.left + bw / 2;
    const btnAppY = btnRect.top - ar.top + bh / 2;
    const curAppX = this._cursorX - ar.left;
    const curAppY = this._cursorY - ar.top;

    const dx = curAppX - btnAppX;
    const dy = curAppY - btnAppY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= this._DODGE_RADIUS) return;

    // --- PRIMER SALTO: de estático/flujo a absoluto ---
    if (this.mode !== 'DODGING' && this.mode !== 'STALKING') {
      const staticX = btnRect.left - ar.left;
      const staticY = btnRect.top - ar.top;

      // Forzar width antes de cambiar a absolute (evita estiramiento)
      const forcedW = btnRect.width + 'px';
      this.btnNo.style.width = forcedW;

      this.mode = 'DODGING';
      this.btnNo.classList.add('dodging');
      this.btnNo.style.position = 'absolute';
      this.btnNo.style.left = staticX + 'px';
      this.btnNo.style.top = staticY + 'px';
      this.btnNo.style.right = '';
      this.btnNo.style.bottom = '';

      // Mover al cuadrante opuesto al cursor
      const cursorQuad = this._getQuadrant(curAppX, curAppY, ar.width, ar.height);
      const pos = this._randomPosInQuadrant(3 - cursorQuad, bw, bh, ar.width, ar.height);
      this.btnNo.style.left = pos.x + 'px';
      this.btnNo.style.top = pos.y + 'px';

      requestAnimationFrame(() => { this.btnNo.style.width = ''; });

      this.btnNo.style.transform = 'scale(0.92)';
      requestAnimationFrame(() => { this.btnNo.style.transform = 'scale(1)'; });

      this._setSubtitle(SC.SUBTITLES.firstDodge);
      return; // Primer salto NO cuenta como persecución
    }

    // --- YA EN DODGING: lógica de persecución ---
    const prevLeft = parseFloat(this.btnNo.style.left) || 0;
    const prevTop = parseFloat(this.btnNo.style.top) || 0;

    const cursorQuad = this._getQuadrant(curAppX, curAppY, ar.width, ar.height);
    const pos = this._randomPosInQuadrant(3 - cursorQuad, bw, bh, ar.width, ar.height);
    this.btnNo.style.left = pos.x + 'px';
    this.btnNo.style.top = pos.y + 'px';

    this.btnNo.style.transform = 'scale(0.92)';
    requestAnimationFrame(() => { this.btnNo.style.transform = 'scale(1)'; });

    if (this.mode === 'STALKING') {
      // Sí acecha: ocupa el lugar que No acaba de dejar
      this._moveYesTo(prevLeft, prevTop);

      this._hideoutCount++;
      if (this._hideoutCount >= this._HIDEOUT_THRESHOLD) {
        this._activateHideout();
        return;
      }
      this._setSubtitle(SC.pickRandom(SC.SUBTITLES.stalking));
    } else {
      // DODGING normal → cuenta persecución
      const now = Date.now();
      if (now - this._lastDodgeTime > this._DODGE_COOLDOWN) {
        this._dodgeCount = 1;
      } else {
        this._dodgeCount++;
      }
      this._lastDodgeTime = now;
      this._setSubtitle(SC.pickRandom(SC.SUBTITLES.chase));

      if (this._dodgeCount >= this._STALK_THRESHOLD) {
        this._activateStalking(prevLeft, prevTop);
      }
    }
  }

  // =============================================
  // STALKING MODE (Sí acecha al No)
  // =============================================
  _activateStalking(x, y) {
    this.mode = 'STALKING';
    this._dodgeCount = 0;
    this.btnYes.classList.add('stalking');
    this._moveYesTo(x, y);
  }

  _deactivateYesStalking() {
    this.btnYes.classList.remove('stalking');
    this.btnYes.style.left = '';
    this.btnYes.style.top = '';
    this.btnYes.style.position = '';
  }

  _moveYesTo(x, y) {
    this.btnYes.style.left = x + 'px';
    this.btnYes.style.top = y + 'px';
  }

  // =============================================
  // HIDEOUT MODE (No se esconde tras el toggle)
  // =============================================
  _activateHideout() {
    this.mode = 'HIDEOUT';
    this._hideoutCount = 0;

    this.btnNo.classList.remove('dodging');
    this.btnNo.classList.add('hideout');
    this.btnNo.style.position = 'fixed';
    this.btnNo.style.top = '20px';
    this.btnNo.style.right = '20px';
    this.btnNo.style.left = 'auto';
    this.btnNo.style.bottom = 'auto';
    this.btnNo.style.margin = '0';
    this.btnNo.style.transform = 'none';
    this.btnNo.style.opacity = '0.6';
    this.btnNo.style.background = 'transparent';

    this._deactivateYesStalking();
    this._setSubtitle(SC.SUBTITLES.hideout);
  }

  // =============================================
  // RESPONSIVE: clampa posición sin perder estado
  // =============================================
  _clampPosition() {
    if (this.mode === 'STATIC' || this.mode === 'HIDEOUT') return;

    if (this.mode === 'FALLEN' || this.mode === 'POST_FALL') {
      // Limpiar right/bottom residual antes de medir
      this.btnNo.style.right = '';
      this.btnNo.style.bottom = '';
      // Re-posicionar en la esquina inferior derecha de #app
      const ar = this.appEl.getBoundingClientRect();
      const noRect = this.btnNo.getBoundingClientRect();
      this.btnNo.style.left = (ar.width - noRect.width - 20) + 'px';
      this.btnNo.style.top = (ar.height - noRect.height - 20) + 'px';
      return;
    }

    // DODGING / STALKING: clampa dentro del contenedor
    const ar = this.appEl.getBoundingClientRect();
    const btnRect = this.btnNo.getBoundingClientRect();
    const bw = btnRect.width;
    const bh = btnRect.height;
    const pad = 20;

    let left = parseFloat(this.btnNo.style.left) || 0;
    let top = parseFloat(this.btnNo.style.top) || 0;

    left = Math.max(pad, Math.min(left, ar.width - bw - pad));
    top = Math.max(pad, Math.min(top, ar.height - bh - pad));

    this.btnNo.style.left = left + 'px';
    this.btnNo.style.top = top + 'px';
  }

  // =============================================
  // HELPERS
  // =============================================
  _getQuadrant(xApp, yApp, cw, ch) {
    const midX = cw / 2;
    const midY = ch / 2;
    let q = 0;
    if (xApp >= midX) q |= 1;
    if (yApp >= midY) q |= 2;
    return q;
  }

  _randomPosInQuadrant(quadrant, bw, bh, cw, ch) {
    const halfW = cw / 2;
    const halfH = ch / 2;
    const pad = 20;

    let xMin, xMax, yMin, yMax;

    if (quadrant & 1) {
      xMin = halfW + pad;
      xMax = cw - bw - pad;
    } else {
      xMin = pad;
      xMax = halfW - bw - pad;
    }

    if (quadrant & 2) {
      yMin = halfH + pad;
      yMax = ch - bh - pad;
    } else {
      yMin = pad;
      yMax = halfH - bh - pad;
    }

    if (xMin >= xMax) { xMin = pad; xMax = cw - bw - pad; }
    if (yMin >= yMax) { yMin = pad; yMax = ch - bh - pad; }

    return {
      x: Math.random() * (xMax - xMin) + xMin,
      y: Math.random() * (yMax - yMin) + yMin,
    };
  }

  _resetNoStyles() {
    this.btnNo.classList.remove('dodging', 'hideout');
    this.btnNo.style.position = '';
    this.btnNo.style.left = '';
    this.btnNo.style.top = '';
    this.btnNo.style.right = '';
    this.btnNo.style.bottom = '';
    this.btnNo.style.transform = '';
    this.btnNo.style.opacity = '';
    this.btnNo.style.pointerEvents = '';
    this.btnNo.style.display = '';
    this.btnNo.style.transition = '';
    this.btnNo.style.width = '';
    this.btnNo.style.fontSize = '';
    this.btnNo.style.padding = '';
    this.btnNo.style.margin = '';
    this.btnNo.style.borderRadius = '';
    this.btnNo.style.background = '';
    this.btnNo.style.color = '';
    this.btnNo.style.alignItems = '';
    this.btnNo.style.justifyContent = '';
  }

  _setSubtitle(text) {
    if (this.subtitleEl) {
      this.subtitleEl.textContent = text;
    }
  }
};
