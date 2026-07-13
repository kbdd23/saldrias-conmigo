/* =============================================
   Saldrías Conmigo — Confetti
   ============================================= */
SC.Confetti = class {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this._intervalId = null;
  }

  start() {
    this.stop();
    this.containerEl.innerHTML = '';
    const colors = ['#FF6B81', '#FFB3C1', '#FFD1DC', '#FF8FA3', '#C94C5C', '#FFEAA7', '#DFE6E9'];
    let count = 0;
    const maxPieces = 150;

    this._intervalId = setInterval(() => {
      if (count >= maxPieces) {
        this.stop();
        return;
      }
      for (let i = 0; i < 3; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = 6 + Math.random() * 8;
        piece.style.width = size + 'px';
        piece.style.height = size * (0.4 + Math.random() * 0.6) + 'px';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.animationDuration = (2 + Math.random() * 3) + 's';
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        this.containerEl.appendChild(piece);
        count++;
      }
    }, 70);
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this.containerEl.innerHTML = '';
  }
};
