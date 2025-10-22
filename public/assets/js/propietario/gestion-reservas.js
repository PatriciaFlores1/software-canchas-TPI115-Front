// Gestión de Reservas - Propietario

(function () {
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const COLOR_SUN = css('--color-sunshine') || '#52658F';
  const COLOR_VER = css('--color-vermillion') || '#333A56';
  const COLOR_WHITE = css('--color-white') || '#FFFFFF';

  // Datos demo
  const reservas = {
    '2025-08-15': [
      { cancha: 'Cancha de Futbol 5 - “El Campeon”', inicio: '18:00', fin: '19:00', cliente: 'Juan Pérez', estado: 'Reservada' },
      { cancha: 'Cancha Center - Pista 2', inicio: '14:00', fin: '15:00', cliente: 'Ana Gómez', estado: 'Reservada' },
    ],
    '2025-08-09': [
      { cancha: 'Pádel Pro - Court 1', inicio: '09:00', fin: '10:00', cliente: 'Carlos Ruiz', estado: 'Reservada' },
    ],
    '2025-08-13': [
      { cancha: 'Basket Arena', inicio: '16:00', fin: '17:30', cliente: 'Paty Flores', estado: 'Cancelada' },
    ],
    '2025-08-14': [
      { cancha: 'Fútbol Norte', inicio: '20:00', fin: '21:00', cliente: 'Rosa Vela', estado: 'Pendiente' },
    ],
  };

  const ingresosMensuales = [1000, 2300, 3100, 1200, 4500, 2600, 0, 0, 0, 0, 0, 0];

  // Utils
  function pad(n) { return n.toString().padStart(2, '0'); }
  function toISO(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
  function toESLong(date) {
    const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const s = fmt.format(date);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function to12h(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hh = ((h + 11) % 12) + 1;
    return `${pad(hh)}:${pad(m)} ${ampm}`;
  }

  // Estado del calendario
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth() + 1; // 1-12
  let selectedISO = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // Render del calendario
  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-title');
    if (!grid || !title) return;

    const first = new Date(viewYear, viewMonth - 1, 1);
    const last = new Date(viewYear, viewMonth, 0);
    const dow = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(first);
    title.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    grid.innerHTML = '';
    dow.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'calendar-dow';
      el.textContent = d;
      grid.appendChild(el);
    });

    const startWeekday = (first.getDay() + 7) % 7;
    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day disabled';
      grid.appendChild(empty);
    }

    // Days of month
    for (let d = 1; d <= last.getDate(); d++) {
      const iso = toISO(viewYear, viewMonth, d);
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      if (iso === selectedISO) cell.classList.add('selected');
      cell.dataset.date = iso;
      cell.innerHTML = `<div class="date">${d}</div>`;
      if (reservas[iso] && reservas[iso].length) {
        const dot = document.createElement('div');
        dot.className = 'calendar-dot';
        cell.appendChild(dot);
      }
      cell.addEventListener('click', () => selectDate(iso));
      grid.appendChild(cell);
    }
  }

  // Selección de fecha -> Panel de reservas
  function selectDate(iso) {
    selectedISO = iso;
    const grid = document.getElementById('calendar-grid');
    grid.querySelectorAll('.calendar-day').forEach((c) => c.classList.toggle('selected', c.dataset.date === iso));
    const title = document.getElementById('selected-date');
    if (title) title.textContent = toESLong(new Date(iso));
    renderReservasPanel();
  }

  function badge(estado) {
    if (estado === 'Reservada' || estado === 'Confirmada') return '<span class="badge badge-success">Reservada</span>';
    if (estado === 'Pendiente') return '<span class="badge badge-warning">Pendiente</span>';
    return '<span class="badge badge-danger">Cancelada</span>';
  }

  function renderReservasPanel() {
    const cont = document.getElementById('reservas-list');
    if (!cont) return;
    const list = reservas[selectedISO] || [];
    cont.innerHTML = list
      .map(
        (r) => `
        <div class="reserva-card">
          <strong>${r.cancha}</strong>
          <div class="text-muted">${to12h(r.inicio)} - ${to12h(r.fin)}</div>
          <div class="text-muted">Cliente: ${r.cliente}</div>
          <div class="mt-2">${badge(r.estado)}</div>
        </div>`
      )
      .join('') || '<div class="text-muted">Sin reservas para este día.</div>';
  }

  // Navegación de mes
  function prevMonth() {
    viewMonth -= 1;
    if (viewMonth < 1) { viewMonth = 12; viewYear -= 1; }
    renderCalendar();
  }
  function nextMonth() {
    viewMonth += 1;
    if (viewMonth > 12) { viewMonth = 1; viewYear += 1; }
    renderCalendar();
  }

  // Chart de ingresos
  function renderIngresosChart() {
    const el = document.getElementById('ingresosChart');
    if (!el || !window.Chart) return;
    new Chart(el, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: [{
          data: ingresosMensuales,
          borderColor: COLOR_SUN,
          backgroundColor: 'transparent',
          tension: 0.25,
          pointRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: COLOR_VER } },
          y: { grid: { color: '#e0e4ef' }, ticks: { color: COLOR_VER } },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  function renderTopDias() {
    const tbody = document.getElementById('tabla-topdias');
    if (!tbody) return;
    const counts = {};
    Object.keys(reservas).forEach((iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      if (y === viewYear && m === viewMonth) counts[d] = (counts[d] || 0) + (reservas[iso] || []).length;
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
    tbody.innerHTML = sorted
      .map((d) => `<tr><td>${pad(d)} / ${pad(viewMonth)} / ${viewYear}</td><td>${counts[d]}</td></tr>`)
      .join('') || '<tr><td colspan="2" class="text-center py-4 text-muted">Sin datos</td></tr>';
  }

  function bind() {
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if (prev) prev.addEventListener('click', () => { prevMonth(); renderTopDias(); selectDate(toISO(viewYear, viewMonth, 1)); });
    if (next) next.addEventListener('click', () => { nextMonth(); renderTopDias(); selectDate(toISO(viewYear, viewMonth, 1)); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    bind();
    renderIngresosChart();
    renderTopDias();
    const initialISO = (today.getMonth() + 1 === viewMonth && today.getFullYear() === viewYear) ? selectedISO : toISO(viewYear, viewMonth, 1);
    selectDate(initialISO);
  });
})();

