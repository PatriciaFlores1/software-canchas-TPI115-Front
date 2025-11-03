// Gestión de Canchas - Admin

(function () {
  let canchas = [];
  let pagination = {};
  let currentPage = 1;

  function badge(estado) {
    if (estado === 'Activa') return '<span class="badge badge-success">Activa</span>';
    if (estado === 'Mantenimiento') return '<span class="badge badge-warning">Mantenimiento</span>';
    return '<span class="badge badge-danger">Inactiva</span>';
  }

  function render() {
    const tbody = document.getElementById('tabla-canchas');
    const info = document.getElementById('tabla-info');
    
    const rows = canchas.map((c) => `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.tipo_deporte}</td>
        <td>${c.ubicacion}</td>
        <td>${badge(c.estado)}</td>
        <td class="text-end cell-actions">
          <a href="/administrador/gestion-detalles.html?id_cancha=${c.id_cancha}" class="btn btn-outline btn-sm" title="Ver"><i class="bi bi-eye"></i></a>
        </td>
      </tr>
    `).join('');

    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="5" class="text-center py-4 text-muted">Sin registros</td></tr>';
    if (info) info.textContent = pagination.total ? `Mostrando ${pagination.from}-${pagination.to} de ${pagination.total} registros` : 'Mostrando 0 registros';

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = pagination.current_page <= 1;
    if (btnNext) btnNext.disabled = pagination.current_page >= pagination.last_page;
  }

  function fetchCanchas(page = 1) {
    fetch(`/api/v1/canchas?page=${page}`)
      .then(response => response.json())
      .then(data => {
        canchas = data.data;
        pagination = data.pagination;
        currentPage = data.pagination.current_page;
        render();
      })
      .catch(error => {
        console.error('Error fetching canchas:', error);
      });
  }

  function bind() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        fetchCanchas(currentPage - 1);
      }
    });
    if (btnNext) btnNext.addEventListener('click', () => {
      if (currentPage < pagination.last_page) {
        fetchCanchas(currentPage + 1);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    fetchCanchas(currentPage);
  });
})();

