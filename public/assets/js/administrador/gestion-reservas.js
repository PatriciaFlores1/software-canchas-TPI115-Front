// Gestión de Reservas - Admin

(function () {
  let reservas = [];
  let pagination = {};
  let currentPage = 1;
  let q = '';
  let qDate = '';

  function badge(estado) {
    if (estado === 'Confirmada') return '<span class="badge badge-success">Confirmada</span>';
    if (estado === 'Pendiente') return '<span class="badge badge-warning">Pendiente</span>';
    return '<span class="badge badge-danger">Cancelada</span>';
  }

  function formatFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function formatHora(fecha) {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function render() {
    const tbody = document.getElementById('tabla-reservas');
    const info = document.getElementById('tabla-info');

    const rows = reservas.map((r) => `
      <tr>
        <td>${r.cancha}</td>
        <td>${r.nombre_cliente || r.usuario}</td>
        <td>${formatFecha(r.fecha_inicio)}</td>
        <td>${formatHora(r.fecha_inicio)}</td>
        <td>${r.deporte}</td>
        <td>$${parseFloat(r.precio).toFixed(2)}</td>
        <td>${badge(r.estado)}</td>
        <td class="text-end cell-actions">
          <button class="btn btn-outline btn-sm" title="Ver"><i class="bi bi-eye"></i></button>
        </td>
      </tr>
    `).join('');

    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="8" class="text-center py-4 text-muted">Sin resultados</td></tr>';
    if (info) info.textContent = pagination.total ? `Mostrando ${pagination.from}-${pagination.to} de ${pagination.total} resultados` : 'Mostrando 0 resultados';

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = pagination.current_page <= 1;
    if (btnNext) btnNext.disabled = pagination.current_page >= pagination.last_page;
  }

  function fetchReservas(page = 1) {
    const params = new URLSearchParams();
    params.append('page', page);
    if (q) {
      params.append('q', q);
    }
    if (qDate) {
      params.append('date', qDate);
    }

    fetch(`/api/v1/reservas?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        reservas = data.data;
        pagination = data.pagination;
        currentPage = data.pagination.current_page;
        render();
      })
      .catch(error => {
        console.error('Error fetching reservas:', error);
      });
  }

  function bind() {
    const $ = (id) => document.getElementById(id);
    const search = $('search');
    const fecha = $('fecha');
    const filtrar = $('btn-filtrar');
    const btnPrev = $('btn-prev');
    const btnNext = $('btn-next');

    const doFilter = () => {
      q = search ? search.value : '';
      qDate = fecha ? fecha.value : '';
      fetchReservas(1);
    };

    if (filtrar) filtrar.addEventListener('click', doFilter);
    if (search) search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doFilter(); } });
    if (fecha) fecha.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doFilter(); } });

    if (btnPrev) btnPrev.addEventListener('click', () => { if (currentPage > 1) { fetchReservas(currentPage - 1); } });
    if (btnNext) btnNext.addEventListener('click', () => { if (currentPage < pagination.last_page) { fetchReservas(currentPage + 1); } });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    fetchReservas(currentPage);
  });
})();
