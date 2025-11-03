// Gestión de Estadísticas - Propietario

(function () {
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const COLOR_SUN = cssVar('--color-sunshine') || '#52658F';
  const COLOR_VER = cssVar('--color-vermillion') || '#333A56';
  const COLOR_WHITE = cssVar('--color-white') || '#FFFFFF';

  function hexToRgba(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }



  function renderStats(stats) {
    const a = document.getElementById('stat-canchas');
    const b = document.getElementById('stat-usuarios');
    const c = document.getElementById('stat-reservas');
    if (a) a.textContent = stats.numero_canchas;
    if (b) b.textContent = stats.usuarios_registrados;
    if (c) c.textContent = stats.reservas_totales;
  }

  function renderChart(reservasMensuales) {
    const el = document.getElementById('reservasPorMesPropChart');
    if (!el || !window.Chart) return;

    const data = new Array(12).fill(0);
    reservasMensuales.data.forEach(item => {
      data[item.month - 1] = item.total;
    });

    new Chart(el, {
      type: 'bar',
      data: {
        labels: ['En', 'Fe', 'Ma', 'Ab', 'Ma', 'Jun', 'Jul', 'Ag', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          data: data,
          backgroundColor: hexToRgba(COLOR_SUN, 0.35),
          borderColor: COLOR_SUN,
          borderWidth: 1.5,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: COLOR_VER } },
          y: { grid: { color: '#e0e4ef' }, ticks: { color: COLOR_VER, precision: 0 } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: COLOR_WHITE,
            titleColor: COLOR_VER,
            bodyColor: COLOR_VER,
            borderColor: COLOR_SUN,
            borderWidth: 1,
          },
        },
      },
    });
  }

  const pageSize = 5;
  let currentPage = 1;
  let historial = [];
  let pagination = {};

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

  function renderTable() {
    const tbody = document.getElementById('tabla-historial');
    const info = document.getElementById('tabla-info');
    const rows = historial.map((r) => `
      <tr>
        <td>${r.cancha}</td>
        <td>${formatFecha(r.fecha_inicio)}</td>
        <td>${formatHora(r.fecha_inicio)}</td>
        <td>${r.nombre_cliente || r.usuario}</td>
        <td class="text-end">${badge(r.estado)}</td>
      </tr>
    `).join('');
    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="5" class="text-center py-4 text-muted">Sin resultados</td></tr>';
    if (info) info.textContent = pagination.total ? `Mostrando ${pagination.from}-${pagination.to} de ${pagination.total} resultados` : 'Mostrando 0 resultados';

    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.disabled = pagination.current_page <= 1;
    if (next) next.disabled = pagination.current_page >= pagination.last_page;
  }

  function fetchHistory(page = 1) {
    fetch(`/api/v1/reservas?page=${page}&id_propietario=${ID_PROPIETARIO}`)
      .then(response => response.json())
      .then(data => {
        historial = data.data;
        pagination = data.pagination;
        currentPage = data.pagination.current_page;
        renderTable();
      })
      .catch(error => {
        console.error('Error fetching history:', error);
      });
  }

  function bindPagination() {
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.addEventListener('click', () => { if (currentPage > 1) { fetchHistory(currentPage - 1); } });
    if (next) next.addEventListener('click', () => { if (currentPage < pagination.last_page) { fetchHistory(currentPage + 1); } });
  }

  function fetchAllData() {
    fetch(`/api/v1/estadisticas/generales`)
      .then(response => response.json())
      .then(stats => {
        renderStats(stats);
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
      });

    fetch(`/api/v1/estadisticas/reservas-mensuales`)
      .then(response => response.json())
      .then(reservasMensuales => {
        renderChart(reservasMensuales);
      })
      .catch(error => {
        console.error('Error fetching monthly reservations:', error);
      });

    fetchHistory(currentPage);
  }

  function fetchHistory(page = 1) {
    fetch(`/api/v1/reservas?page=${page}`)
      .then(response => response.json())
      .then(data => {
        historial = data.data;
        pagination = data.pagination;
        currentPage = data.pagination.current_page;
        renderTable();
      })
      .catch(error => {
        console.error('Error fetching history:', error);
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindPagination();
    fetchAllData();
  });
})();

