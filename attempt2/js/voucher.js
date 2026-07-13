/* =============================================
   Voucher — Comprobante de cita
   Renderiza el resumen final con actividades,
   fecha y bloque horario.
   ============================================= */
class Voucher {
  constructor(detailsEl) {
    this.detailsEl = detailsEl;
  }

  render(activities, dateObj, timeObj) {
    const actText = activities.length > 0 ? activities.join(', ') : 'lo que tú quieras';
    const dateLabel = dateObj ? dateObj.displayDate : '—';
    const timeLabel = timeObj ? timeObj.label : '—';

    this.detailsEl.innerHTML =
      '<p>📅 Fecha: <strong>' + dateLabel + '</strong></p>' +
      '<p>⏰ Bloque: <strong>' + timeLabel + '</strong></p>' +
      '<p>🎯 Actividad: <strong>' + actText + '</strong></p>';
  }

  reset() {
    this.detailsEl.innerHTML = '';
  }
}
