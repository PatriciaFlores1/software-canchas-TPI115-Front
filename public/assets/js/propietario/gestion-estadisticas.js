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

  // Datos demo
  const stats = { canchas: 8, usuarios: 200, reservas: 320 };
  const reservasMensuales = [40, 85, 60, 130, 90, 35, 95, 75, 120, 88, 140, 150];
  const historial = [
    { cancha: 'Cancha de Fútbol 5 "El Campeón"', fecha: '2025-05-15', hora: '18:00 - 19:00', cliente: 'Juan Pérez', estado: 'Reservada' },
    { cancha: 'Pádel Center - Pista 2', fecha: '2025-05-15', hora: '20:00 - 21:00', cliente: 'Ana Gómez', estado: 'Reservada' },
    { cancha: 'Tenis Club "Smash" - Cancha Central', fecha: '2025-05-14', hora: '10:00 - 11:00', cliente: 'Carlos Rodríguez', estado: 'Cancelada' },
    { cancha: 'Fútbol Rápido "La Bombonera"', fecha: '2025-05-14', hora: '19:00 - 20:00', cliente: 'Laura Martínez', estado: 'Cancelada' },
    { cancha: 'Baloncesto "El Aro"', fecha: '2025-05-13', hora: '17:00 - 18:00', cliente: 'Miguel Sánchez', estado: 'Cancelada' },
  ];

  function renderStats() {
    const a = document.getElementById('stat-canchas');
    const b = document.getElementById('stat-usuarios');
    const c = document.getElementById('stat-reservas');
    if (a) a.textContent = stats.canchas;
    if (b) b.textContent = stats.usuarios;
    if (c) c.textContent = stats.reservas;
  }

  function renderChart() {
    const el = document.getElementById('reservasPorMesPropChart');
    if (!el || !window.Chart) return;
    new Chart(el, {
      type: 'bar',
      data: {
        labels: ['En', 'Fe', 'Ma', 'Ab', 'Ma', 'Jun', 'Jul', 'Ag', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          data: reservasMensuales,
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

  function badge(estado) {
    if (estado === 'Reservada') return '<span class="badge badge-success">Reservada</span>';
    if (estado === 'Pendiente') return '<span class="badge badge-warning">Pendiente</span>';
    return '<span class="badge badge-danger">Cancelada</span>';
  }

  function renderTable(page = 1) {
    const tbody = document.getElementById('tabla-historial');
    const info = document.getElementById('tabla-info');
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, historial.length);
    const rows = historial.slice(start, end).map((r) => `
      <tr>
        <td>${r.cancha}</td>
        <td>${r.fecha}</td>
        <td>${r.hora}</td>
        <td>${r.cliente}</td>
        <td class="text-end">${badge(r.estado)}</td>
      </tr>
    `).join('');
    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="5" class="text-center py-4 text-muted">Sin resultados</td></tr>';
    if (info) info.textContent = historial.length ? `Mostrando ${start + 1}-${end} de ${historial.length} resultados` : 'Mostrando 0 resultados';

    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.disabled = page <= 1;
    if (next) next.disabled = end >= historial.length;
  }

  function bindPagination() {
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(currentPage); } });
    if (next) next.addEventListener('click', () => {
      const totalPages = Math.ceil(historial.length / pageSize);
      if (currentPage < totalPages) { currentPage++; renderTable(currentPage); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderChart();
    bindPagination();
    renderTable(currentPage);
  });
})();

