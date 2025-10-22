// Gestion de Estadísticas - Admin

(function () {
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const COLOR_SUN = cssVar('--color-sunshine') || '#52658F';
  const COLOR_VER = cssVar('--color-vermillion') || '#333A56';
  const COLOR_WHITE = cssVar('--color-white') || '#FFFFFF';
  const COLOR_CLEAN = cssVar('--color-clean') || '#F4F5F7';

  function hexToRgba(hex, alpha = 1) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Datos de ejemplo
  const stats = {
    canchas: 150,
    usuarios: 500,
    reservas: 1200,
  };

  const reservasMensuales = [
    40, 85, 60, 130, 90, 35, 95, 75, 120, 88, 140, 150,
  ];

  const historial = [
    { cancha: 'Cancha de Fútbol 5 "El Campeón"', fecha: '2025-05-15', hora: '18:00 - 19:00', cliente: 'Juan Pérez', estado: 'Reserva' },
    { cancha: 'Pádel Center - Pista 2', fecha: '2025-05-15', hora: '20:00 - 21:00', cliente: 'Ana Gómez', estado: 'Reserva' },
    { cancha: 'Tenis Club "Smash" - Cancha Central', fecha: '2025-05-14', hora: '10:00 - 11:00', cliente: 'Carlos Rodríguez', estado: 'Cancelada' },
    { cancha: 'Fútbol Rápido "La Bombonera"', fecha: '2025-05-14', hora: '19:00 - 20:00', cliente: 'Laura Martínez', estado: 'Cancelada' },
    { cancha: 'Baloncesto "El Aro"', fecha: '2025-05-13', hora: '17:00 - 18:00', cliente: 'Miguel Sánchez', estado: 'Cancelada' },
    { cancha: 'Fútbol 7 - Norte', fecha: '2025-05-13', hora: '08:00 - 09:00', cliente: 'Rosa Vela', estado: 'Reserva' },
    { cancha: 'Tenis - Court 1', fecha: '2025-05-12', hora: '09:00 - 10:00', cliente: 'Diego Castro', estado: 'Reserva' },
    { cancha: 'Voleibol de Arena - A', fecha: '2025-05-12', hora: '16:00 - 17:00', cliente: 'Paola Ruiz', estado: 'Reserva' },
    { cancha: 'Baloncesto Indoor B', fecha: '2025-05-11', hora: '11:00 - 12:00', cliente: 'Luis Torres', estado: 'Cancelada' },
    { cancha: 'Pádel - Pista 3', fecha: '2025-05-11', hora: '12:00 - 13:00', cliente: 'Cecilia M.', estado: 'Reserva' },
    { cancha: 'Tenis - Court 2', fecha: '2025-05-10', hora: '14:00 - 15:00', cliente: 'Ricardo L.', estado: 'Reserva' },
    { cancha: 'Fútbol 11 - Sur', fecha: '2025-05-09', hora: '18:30 - 19:30', cliente: 'Germán P.', estado: 'Cancelada' },
  ];

  // Render de tarjetas
  function renderStats() {
    const elCanchas = document.getElementById('stat-canchas');
    const elUsuarios = document.getElementById('stat-usuarios');
    const elReservas = document.getElementById('stat-reservas');
    if (elCanchas) elCanchas.textContent = stats.canchas;
    if (elUsuarios) elUsuarios.textContent = stats.usuarios;
    if (elReservas) elReservas.textContent = stats.reservas;
  }

  // Render del gráfico
  function renderChart() {
    const ctx = document.getElementById('reservasPorMesChart');
    if (!ctx || !window.Chart) return;

    const border = COLOR_SUN;
    const fill = hexToRgba(COLOR_SUN, 0.35);
    const tickColor = COLOR_VER;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['En', 'Fe', 'Ma', 'Ab', 'Ma', 'Jun', 'Jul', 'Ag', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          {
            data: reservasMensuales,
            backgroundColor: fill,
            borderColor: border,
            borderWidth: 1.5,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor },
          },
          y: {
            grid: { color: '#e0e4ef' },
            ticks: { color: tickColor, precision: 0 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: COLOR_WHITE,
            titleColor: COLOR_VER,
            bodyColor: COLOR_VER,
            borderColor: border,
            borderWidth: 1,
          },
        },
      },
    });
  }

  const pageSize = 5;
  let currentPage = 1;

  function badgeFor(estado) {
    if (estado === 'Reserva') return '<span class="badge badge-success">Reserva</span>';
    if (estado === 'Pendiente') return '<span class="badge badge-warning">Pendiente</span>';
    return '<span class="badge badge-danger">Cancelada</span>';
  }

  function renderTable(page = 1) {
    const tbody = document.getElementById('tabla-historial');
    const info = document.getElementById('tabla-info');
    if (!tbody) return;

    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, historial.length);
    const rows = historial.slice(start, end)
      .map((r) => `
        <tr>
          <td>${r.cancha}</td>
          <td>${r.fecha}</td>
          <td>${r.hora}</td>
          <td>${r.cliente}</td>
          <td class="text-end">${badgeFor(r.estado)}</td>
        </tr>
      `)
      .join('');

    tbody.innerHTML = rows || `<tr><td colspan="5" class="text-center py-4 text-muted">Sin resultados</td></tr>`;

    if (info) {
      const label = historial.length
        ? `Mostrando ${start + 1}-${end} de ${historial.length} resultados`
        : 'Mostrando 0 resultados';
      info.textContent = label;
    }

    // estado de botones
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = page <= 1;
    if (btnNext) btnNext.disabled = end >= historial.length;
  }

  function bindPagination() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderTable(currentPage);
      }
    });
    if (btnNext) btnNext.addEventListener('click', () => {
      const totalPages = Math.ceil(historial.length / pageSize);
      if (currentPage < totalPages) {
        currentPage += 1;
        renderTable(currentPage);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderChart();
    bindPagination();
    renderTable(currentPage);
  });
})();

