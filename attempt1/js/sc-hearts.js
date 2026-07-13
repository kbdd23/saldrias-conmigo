/* =============================================
   Saldrías Conmigo — HeartsBackground
   ============================================= */
SC.HeartsBackground = class {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this._intervalId = null;
  }

  start() {
    this.stop();
    this.containerEl.innerHTML = '';
    this._intervalId = setInterval(() => {
      const heart = document.createElement('span');
      heart.className = 'heart-float';
      heart.textContent = '\u2665';
      const size = 0.8 + Math.random() * 1.5;
      heart.style.fontSize = size + 'rem';
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDuration = (6 + Math.random() * 8) + 's';
      heart.style.opacity = 0.2 + Math.random() * 0.4;
      this.containerEl.appendChild(heart);
      setTimeout(() => { if (heart.parentNode) heart.remove(); }, 16000);
    }, 280);
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this.containerEl.innerHTML = '';
  }
};
