// Gestión de nueva horario por cancha (Propietario)

(function () {
  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const horarios = [];
  let seq = 1;

  const $ = (id) => document.getElementById(id);

  function to12h(hhmm) {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hh = ((h + 11) % 12) + 1;
    return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function validate(dia, inicio, fin) {
    const fb = $('form-feedback');
    const errors = [];
    if (!dia) errors.push('Seleccione el día.');
    if (!inicio) errors.push('Defina la hora de inicio.');
    if (!fin) errors.push('Defina la hora de fin.');
    if (inicio && fin && inicio >= fin) errors.push('La hora de inicio debe ser menor que la hora de fin.');
    fb.textContent = errors[0] || '';
    return errors.length === 0;
  }

  function addHorario() {
    const dia = $('dia').value;
    const inicio = $('inicio').value;
    const fin = $('fin').value;
    if (!validate(dia, inicio, fin)) return;
    horarios.push({ id: seq++, dia, inicio, fin });
    $('inicio').value = '';
    $('fin').value = '';
    render();
  }

  function removeHorario(id) {
    const idx = horarios.findIndex((h) => h.id === id);
    if (idx >= 0) horarios.splice(idx, 1);
    render();
  }

  function groupByDia() {
    const map = new Map();
    diasOrden.forEach((d) => map.set(d, []));
    horarios.forEach((h) => {
      if (!map.has(h.dia)) map.set(h.dia, []);
      map.get(h.dia).push(h);
    });
    return map;
  }

  function renderAccordion() {
    const container = $('horarios-accordion');
    if (!container) return;
    const grupos = groupByDia();
    const blocks = diasOrden.map((dia, i) => {
      const id = `g-${i}`;
      const items = (grupos.get(dia) || [])
        .map(
          (h) => `
          <div class="card mb-3">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div class="text-muted">Horario establecido</div>
              <div><strong>Hora:</strong> ${to12h(h.inicio)} - ${to12h(h.fin)}</div>
            </div>
          </div>`
        )
        .join('');
      const body = items || '<div class="text-muted">Sin horarios</div>';
      return `
        <div class="accordion-item">
          <h2 class="accordion-header" id="h-${id}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#c-${id}" aria-expanded="false" aria-controls="c-${id}">
              ${dia}
            </button>
          </h2>
          <div id="c-${id}" class="accordion-collapse collapse" aria-labelledby="h-${id}" data-bs-parent="#horarios-accordion">
            <div class="accordion-body">
              ${body}
            </div>
          </div>
        </div>`;
    });
    container.innerHTML = blocks.join('');
  }

  function renderTable() {
    const tbody = $('tabla-horarios');
    if (!tbody) return;
    const rows = horarios
      .map(
        (h) => `
        <tr>
          <td>${h.dia}</td>
          <td>${to12h(h.inicio)}</td>
          <td>${to12h(h.fin)}</td>
          <td class="text-end">
            <button class="btn btn-outline btn-sm" data-id="${h.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`
      )
      .join('');
    tbody.innerHTML = rows || '<tr><td colspan="4" class="text-center py-4 text-muted">Sin horarios agregados</td></tr>';

    tbody.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => removeHorario(Number(btn.getAttribute('data-id'))));
    });
  }

  function render() {
    renderAccordion();
    renderTable();
  }

  function bind() {
    const back = $('btn-back');
    const add = $('btn-add');
    const guardar = $('btn-guardar');
    const cancelar = $('btn-cancelar');
    if (back) back.addEventListener('click', () => history.back());
    if (cancelar) cancelar.addEventListener('click', () => history.back());
    if (add) add.addEventListener('click', addHorario);
    if (guardar) guardar.addEventListener('click', () => {
      alert('Horarios guardados (demo).');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    render();
  });
})();

