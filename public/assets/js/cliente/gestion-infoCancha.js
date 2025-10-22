// Información de Cancha - Cliente

(function () {
  // Datos demo de la cancha
  const cancha = {
    nombre: 'Cancha Central de Tenis',
    deporte: 'Tenis',
    direccion: '123 Calle Principal, Ciudad, Provincia',
    precioHora: 25,
    condiciones: 'Cancelaciones hasta 24 horas antes. No se permiten alimentos en la cancha.',
    descripcion:
      'Disfruta de nuestra cancha de tenis profesional, ideal para partidos individuales o dobles. Superficie de juego de alta calidad, iluminación nocturna y vestuarios disponibles.',
    imagenes: [
      '/public/assets/img/tenis.png',
      '/public/assets/img/futbol.png',
      '/public/assets/img/baloncesto.png',
    ],
  };

  // Horarios por fecha (ISO YYYY-MM-DD) con estado
  const horarios = {
    // Día con disponibles y ocupados
    '2025-08-05': [
      { inicio: '09:00', fin: '10:00', estado: 'Disponible' },
      { inicio: '10:00', fin: '11:00', estado: 'Ocupado' },
      { inicio: '11:00', fin: '12:00', estado: 'Disponible' },
      { inicio: '12:00', fin: '13:00', estado: 'Disponible' },
    ],
    // Otros días
    '2025-08-06': [
      { inicio: '09:00', fin: '10:00', estado: 'Disponible' },
      { inicio: '10:00', fin: '11:00', estado: 'Ocupado' },
    ],
  };

  // Utilidades
  const $ = (id) => document.getElementById(id);
  const pad = (n) => n.toString().padStart(2, '0');
  const toISO = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  function toESLong(date) {
    const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const s = fmt.format(date);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function renderGaleria() {
    const indicators = $('galeria-indicadores');
    const inner = $('galeria-inner');
    if (!indicators || !inner) return;
    indicators.innerHTML = cancha.imagenes
      .map((_, idx) => `<button type="button" data-bs-target="#galeria" data-bs-slide-to="${idx}" ${idx === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${idx + 1}"></button>`) 
      .join('');
    inner.innerHTML = cancha.imagenes
      .map((src, idx) => `
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${src}" class="d-block w-100" alt="Imagen ${idx + 1}" style="border-radius: var(--border-radius); object-fit: cover; max-height: 420px;"/>
        </div>`)
      .join('');
  }

  function renderInfo() {
    const nombre = $('cancha-nombre');
    const meta = $('cancha-meta');
    const precio = $('cancha-precio');
    const condiciones = $('cancha-condiciones');
    const descripcion = $('cancha-descripcion');
    if (nombre) nombre.textContent = cancha.nombre;
    if (meta) meta.textContent = `${cancha.deporte} · ${cancha.direccion}`;
    if (precio) precio.textContent = `$${Number(cancha.precioHora).toFixed(2)}`;
    if (condiciones) condiciones.textContent = cancha.condiciones;
    if (descripcion) descripcion.textContent = cancha.descripcion;
  }

  // Calendario
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth() + 1; // 1-12
  let selectedISO = toISO(viewYear, viewMonth, today.getDate());

  function renderCalendar() {
    const grid = $('cal-grid');
    const title = $('cal-title');
    const first = new Date(viewYear, viewMonth - 1, 1);
    const last = new Date(viewYear, viewMonth, 0);
    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(first);
    if (title) title.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const dows = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    grid.innerHTML = '';
    dows.forEach((d) => {
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

    for (let d = 1; d <= last.getDate(); d++) {
      const iso = toISO(viewYear, viewMonth, d);
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      if (iso === selectedISO) cell.classList.add('selected');
      cell.dataset.date = iso;
      cell.innerHTML = `<div class="date">${d}</div>`;
      if (horarios[iso] && horarios[iso].length) {
        const dot = document.createElement('div');
        dot.className = 'calendar-dot';
        cell.appendChild(dot);
      }
      cell.addEventListener('click', () => selectDate(iso));
      grid.appendChild(cell);
    }
  }

  function selectDate(iso) {
    selectedISO = iso;
    const grid = $('cal-grid');
    grid.querySelectorAll('.calendar-day').forEach((c) => c.classList.toggle('selected', c.dataset.date === iso));
    const titulo = $('slots-titulo');
    if (titulo) titulo.textContent = `Horarios para el ${toESLong(new Date(iso))}`;
    renderSlots();
  }

  function renderSlots() {
    const cont = $('slots-list');
    if (!cont) return;
    const list = horarios[selectedISO] || [];
    cont.innerHTML = list
      .map((h, idx) => {
        const reservado = h.estado !== 'Disponible';
        return `
          <div class="reserva-card d-flex align-items-center justify-content-between">
            <div class="fw-semibold">${h.inicio} - ${h.fin}</div>
            ${reservado
              ? '<button class="btn btn-outline btn-sm" disabled>Ocupado</button>'
              : `<button class="btn btn-primary btn-sm" data-slot="${idx}">Reservar</button>`}
          </div>`;
      })
      .join('') || '<div class="text-muted">No hay horarios configurados para esta fecha.</div>';

    cont.querySelectorAll('button[data-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-slot'));
        const slot = (horarios[selectedISO] || [])[i];
        if (!slot) return;
        alert(`Reservar ${slot.inicio}-${slot.fin} para ${toESLong(new Date(selectedISO))}`);
      });
    });
  }

  function bindCalendarNav() {
    const prev = $('cal-prev');
    const next = $('cal-next');
    if (prev) prev.addEventListener('click', () => { viewMonth--; if (viewMonth < 1) { viewMonth = 12; viewYear--; } renderCalendar(); selectDate(toISO(viewYear, viewMonth, 1)); });
    if (next) next.addEventListener('click', () => { viewMonth++; if (viewMonth > 12) { viewMonth = 1; viewYear++; } renderCalendar(); selectDate(toISO(viewYear, viewMonth, 1)); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderGaleria();
    renderInfo();
    renderCalendar();
    bindCalendarNav();
    const initialISO = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate());
    selectDate(initialISO);
  });
})();

