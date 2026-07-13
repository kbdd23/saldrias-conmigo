/* =============================================
   SubtitleManager — Cambia el subtítulo según
   la fase actual de la interacción.
   ============================================= */
class SubtitleManager {
  constructor(el) {
    this.el = el;
    this._chaseIdx = 0;
    this._tpIdx = 0;
    this._randomTpIdx = 0;
    this._postReplaceIdx = 0;
  }

  static CHASE = [
    'Ups!',
    'Casi...',
    'Uhum... -3-',
    'Botones resbaladizos, verdad?',
    'Juraría que estaba allí!',
    'Otra vez...',
    'Eres libre de elegir',
    'Sigue intentando...'
  ];

  static TP = [
    '¿Sigues decidiendo?',
    '¿Segura?',
    'Quizás puedas intentar otra vez',
    '¿Segura de que estás segura?',
    'Estaba ahí, ¿cierto?, intentalo otra vez. ^3^',
    'Tú dale no más... No hay apuros',
    'Segura de que estabas segura de que estás segura?',
    'Tienes problemas con los botones?, contacta al administrador >3<',
    'Intenta otra vez',
    'Cosas que pasan...'
  ];

  static RANDOM_TP = [
    'Opa!, que ágil',
    'Ahí va! °o°',
    'Miralo, ¿soy yo o está huyendo de tí?',
    'Recuerda que eres libre de elegir lo que más desees.',
    'Vamos a divertirnos muchisimo sí dices que si!',
    'Mmh... ¬-¬',
    'El botón está en plan: \'Podria hacer esto todo el día\'',
    'Me pregunto porque tarda tanto...',
    '>-<',
    'Corre que te pilla'
  ];

  static POST_REPLACE = [
    '¿Si quieres salir conmigo?, que linda!',
    'Uops, tranquila, aquí está el botón que quieres pulsar.',
    'Uops...Se ha vuelto a resbalar, Try again.',
    ''
  ];

  set(text) { this.el.textContent = text; }

  initial()           { this.set('Una pregunta completamente normal para alguien especial.'); }
  firstClick()        { this.set('Mmh... ¬3¬'); }
  chaseNext()         { this.set(SubtitleManager.CHASE[this._chaseIdx++ % SubtitleManager.CHASE.length]); }
  tpNext()            { this.set(SubtitleManager.TP[this._tpIdx++ % SubtitleManager.TP.length]); }
  randomTpNext()      { this.set(SubtitleManager.RANDOM_TP[this._randomTpIdx++ % SubtitleManager.RANDOM_TP.length]); }
  hideout()           { this.set('Elige una opción. ^3^'); }
  falling()           { this.set('No puede ser, estuvo allí todo este tiempo? °o°'); }
  postFallClick()     { this.set('Lo lamento, no lo pude registrar, ¿Podrias intentarlo otra vez, porfavor?'); }
  trappedDrag()       { this.set('Aja!, ¡Te atrape!'); }

  resetPostReplace()  { this._postReplaceIdx = 0; }

  postReplaceNext() {
    const text = SubtitleManager.POST_REPLACE[this._postReplaceIdx];
    this._postReplaceIdx = (this._postReplaceIdx + 1) % SubtitleManager.POST_REPLACE.length;
    if (text) this.set(text);
  }

  segundoHideout()    { this.set('¿Y ahora donde estará?'); }
  segundoFalling()    { this.set('Ahí va!'); }
}
