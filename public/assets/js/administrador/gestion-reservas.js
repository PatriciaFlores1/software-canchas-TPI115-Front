// Gestión de Reservas - Admin

(function () {
  const reservas = [
    { cancha: 'Cancha Rápida 1', cliente: 'Juan Pérez', fecha: '2025-05-10', hora: '18:00', deporte: 'Fútbol', precio: 25.0, estado: 'Confirmada' },
    { cancha: 'Tenis Central', cliente: 'Ana Gómez', fecha: '2025-05-11', hora: '10:00', deporte: 'Tenis', precio: 30.0, estado: 'Pendiente' },
    { cancha: 'Pádel Pro', cliente: 'Carlos Ruiz', fecha: '2025-05-12', hora: '20:00', deporte: 'Pádel', precio: 20.0, estado: 'Cancelada' },
    { cancha: 'Basket Arena', cliente: 'Paty Flores', fecha: '2025-05-13', hora: '16:00', deporte: 'Baloncesto', precio: 35.0, estado: 'Cancelada' },
    { cancha: 'Cancha Dos', cliente: 'Carlos Enri', fecha: '2025-06-13', hora: '17:00', deporte: 'Fútbol', precio: 25.0, estado: 'Confirmada' },
    { cancha: 'Fútbol Norte', cliente: 'Rosa Vela', fecha: '2025-06-14', hora: '09:00', deporte: 'Fútbol', precio: 22.0, estado: 'Confirmada' },
    { cancha: 'Pádel Club 3', cliente: 'Cecilia M.', fecha: '2025-06-15', hora: '12:00', deporte: 'Pádel', precio: 21.5, estado: 'Pendiente' },
  ];

  const pageSize = 5;
  let currentPage = 1;
  let q = '';
  let qDate = '';

  function pad(n) { return n.toString().padStart(2, '0'); }

  // Acepta "MM/DD/YYYY" o "YYYY-MM-DD" y devuelve "YYYY-MM-DD" o ""
  function toISODate(str) {
    if (!str) return '';
    const s = str.trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const mm = pad(Number(m[1]));
      const dd = pad(Number(m[2]));
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  }

  function badge(estado) {
    if (estado === 'Confirmada') return '<span class="badge badge-success">Confirmada</span>';
    if (estado === 'Pendiente') return '<span class="badge badge-warning">Pendiente</span>';
    return '<span class="badge badge-danger">Cancelada</span>';
  }

  function filtra() {
    const iso = toISODate(qDate);
    const term = q.toLowerCase();
    return reservas.filter((r) => {
      const matchText = term
        ? r.cancha.toLowerCase().includes(term) || r.cliente.toLowerCase().includes(term)
        : true;
      const matchDate = iso ? r.fecha === iso : true;
      return matchText && matchDate;
    });
  }

  function render(page = 1) {
    const data = filtra();
    const tbody = document.getElementById('tabla-reservas');
    const info = document.getElementById('tabla-info');
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, data.length);

    const rows = data.slice(start, end).map((r) => `
      <tr>
        <td>${r.cancha}</td>
        <td>${r.cliente}</td>
        <td>${r.fecha}</td>
        <td>${r.hora}</td>
        <td>${r.deporte}</td>
        <td>$${r.precio.toFixed(2)}</td>
        <td>${badge(r.estado)}</td>
        <td class="text-end cell-actions">
          <button class="btn btn-outline btn-sm" title="Ver"><i class="bi bi-eye"></i></button>
        </td>
      </tr>
    `).join('');

    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="8" class="text-center py-4 text-muted">Sin resultados</td></tr>';
    if (info) info.textContent = data.length ? `Mostrando ${Math.min(start + 1, data.length)}-${end} de ${data.length} resultados` : 'Mostrando 0 resultados';

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = page <= 1;
    if (btnNext) btnNext.disabled = end >= data.length;
  }

  function bind() {
    const $ = (id) => document.getElementById(id);
    const search = $('search');
    const fecha = $('fecha');
    const filtrar = $('btn-filtrar');
    const iconCalendar = document.getElementById('icon-calendar');
    const btnPrev = $('btn-prev');
    const btnNext = $('btn-next');

    const doFilter = () => {
      q = search ? search.value : '';
      qDate = fecha ? fecha.value : '';
      currentPage = 1;
      render(currentPage);
    };

    if (filtrar) filtrar.addEventListener('click', doFilter);
    if (search) search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doFilter(); } });
    if (fecha) fecha.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doFilter(); } });
    if (iconCalendar && fecha) iconCalendar.addEventListener('click', () => {
      if (typeof fecha.showPicker === 'function') {
        try { fecha.showPicker(); } catch { fecha.focus(); }
      } else {
        fecha.focus();
      }
    });

    if (btnPrev) btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage -= 1; render(currentPage); } });
    if (btnNext) btnNext.addEventListener('click', () => {
      const totalPages = Math.ceil(filtra().length / pageSize);
      if (currentPage < totalPages) { currentPage += 1; render(currentPage); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    render(currentPage);
  });
})();
