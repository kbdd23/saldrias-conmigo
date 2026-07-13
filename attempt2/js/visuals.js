/* =============================================
   Visuals — Corazones de fondo + Confetti
   ============================================= */
class Visuals {
  constructor(heartsContainer, confettiContainer) {
    this.heartsContainer = heartsContainer;
    this.confettiContainer = confettiContainer;
    this._heartsInterval = null;
    this._confettiInterval = null;
  }

  // =========================================
  // CORAZONES
  // =========================================
  startHearts() {
    this.stopHearts();
    this.heartsContainer.innerHTML = '';
    this._heartsInterval = setInterval(() => {
      const heart = document.createElement('span');
      heart.className = 'heart-float';
      heart.textContent = '\u2665';
      const size = 0.8 + Math.random() * 1.5;
      heart.style.fontSize = size + 'rem';
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDuration = (6 + Math.random() * 8) + 's';
      heart.style.animationDelay = Math.random() * 2 + 's';
      heart.style.opacity = 0.15 + Math.random() * 0.35;
      this.heartsContainer.appendChild(heart);
      setTimeout(() => {
        if (heart.parentNode) heart.remove();
      }, 16000);
    }, 280);
  }

  stopHearts() {
    if (this._heartsInterval) {
      clearInterval(this._heartsInterval);
      this._heartsInterval = null;
    }
    this.heartsContainer.innerHTML = '';
  }

  // =========================================
  // CONFETTI
  // =========================================

  _getConfettiColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
      return ['#FFD700', '#F0C000', '#DAA520', '#FFC125', '#B8860B', '#FFD700', '#F5E56B'];
    }

    return ['#FF6B35', '#F7931E', '#FFB347', '#FF8C42', '#FF5722', '#FFA07A'];
  }

  startConfetti(opts) {
    const cfg = Object.assign({
      maxPieces: 150,
      intervalMs: 70,
      animMin: 2,
      animMax: 3,
    }, opts || {});

    // limpia si hay confettis
    this.stopConfetti();
    this.confettiContainer.innerHTML = '';

    const colors = this._getConfettiColors();
    let count = 0;

    this._confettiInterval = setInterval(() => {
      if (count >= cfg.maxPieces) {
        this.stopConfetti();
        return;
      }
      for (let i = 0; i < 3; i++) {
        if (count >= cfg.maxPieces) break;
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = 6 + Math.random() * 8;
        piece.style.width = size + 'px';
        piece.style.height = size * (0.4 + Math.random() * 0.6) + 'px';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.animationDuration = (cfg.animMin + Math.random() * (cfg.animMax - cfg.animMin)) + 's';
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        piece.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
        this.confettiContainer.appendChild(piece);
        count++;
      }
    }, cfg.intervalMs);
  }

  stopConfetti() {
    if (this._confettiInterval) {
      clearInterval(this._confettiInterval);
      this._confettiInterval = null;
    }
    this.confettiContainer.innerHTML = '';
  }
}
