// Historial por Cancha (Administrador)

(function () {
  // Datos de ejemplo
  const nombreCancha = 'Cancha Central de Tenis';
  const reservas = [
    { fecha: '2025-08-05', inicio: '09:00', fin: '10:00' },
    { fecha: '2025-08-06', inicio: '09:00', fin: '10:00' },
  ];

  const diasES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function formateaFechaLarga(iso) {
    const d = new Date(iso + 'T00:00:00');
    const fmt = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
    const s = fmt.format(d);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function nombreDia(iso) {
    const d = new Date(iso + 'T00:00:00');
    return diasES[d.getDay()];
  }

  function agrupaPorDia(items) {
    const mapa = new Map();
    items.forEach((r) => {
      const dia = nombreDia(r.fecha);
      if (!mapa.has(dia)) mapa.set(dia, []);
      mapa.get(dia).push(r);
    });
    return mapa;
  }

  function renderTitulo() {
    const h = document.getElementById('titulo-cancha');
    if (h) h.textContent = nombreCancha;
  }

  function renderAccordion() {
    const cont = document.getElementById('historial-accordion');
    if (!cont) return;

    const grupos = agrupaPorDia(reservas);
    const orden = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    const bloques = orden.map((dia, idx) => {
      const id = `dia-${idx}`;
      const lista = grupos.get(dia) || [];
      const cards = lista
        .map(
          (r) => `
            <div class="card mb-3">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div class="text-muted">${formateaFechaLarga(r.fecha)}</div>
                <div><strong>Hora:</strong> ${r.inicio} - ${r.fin}</div>
              </div>
            </div>`
        )
        .join('');

      const contenido = cards || '<div class="text-muted">Sin reservas registradas.</div>';

      return `
        <div class="accordion-item">
          <h2 class="accordion-header" id="h-${id}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#c-${id}" aria-expanded="false" aria-controls="c-${id}">
              ${dia.charAt(0).toUpperCase() + dia.slice(1)}
            </button>
          </h2>
          <div id="c-${id}" class="accordion-collapse collapse" aria-labelledby="h-${id}" data-bs-parent="#historial-accordion">
            <div class="accordion-body">
              ${contenido}
            </div>
          </div>
        </div>`;
    });

    cont.innerHTML = bloques.join('');
  }

  function renderTabla() {
    const tbody = document.getElementById('tabla-historial');
    if (!tbody) return;
    const filas = reservas
      .map(
        (r) => `
        <tr>
          <td>${formateaFechaLarga(r.fecha)}</td>
          <td>${r.inicio} - ${r.fin}</td>
        </tr>`
      )
      .join('');
    tbody.innerHTML = filas || '<tr><td colspan="2" class="text-center py-4 text-muted">Sin registros</td></tr>';
  }

  function bind() {
    const back = document.getElementById('btn-back');
    if (back) back.addEventListener('click', () => history.back());
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderTitulo();
    renderAccordion();
    renderTabla();
    bind();
  });
})();

