// Mis canchas - Propietario

(function () {
  const canchas = [
    { nombre: 'Cancha de Tenis Central', deporte: 'Tenis', direccion: 'Calle Principal 123, Ciudad', estado: 'Activa' },
    { nombre: 'Cancha de Fútbol 5', deporte: 'Fútbol', direccion: 'Avenida del Deporte 456, Ciudad', estado: 'Activa' },
    { nombre: 'Cancha de Baloncesto Cubierta', deporte: 'Baloncesto', direccion: 'Calle del Gimnasio 789, Ciudad', estado: 'Inactiva' },
    { nombre: 'Fútbol Rápido "La Bombonera"', deporte: 'Tenis', direccion: 'Calle Principal 520, Ciudad', estado: 'Inactiva' },
    { nombre: 'Pádel Center - Pista 2', deporte: 'Véisbol', direccion: 'Calle Principal 1252, Ciudad', estado: 'Activa' },
  ];

  const pageSize = 10;
  let currentPage = 1;

  function badge(estado) {
    if (estado === 'Activa') return '<span class="badge badge-success">Activa</span>';
    if (estado === 'Mantenimiento') return '<span class="badge badge-warning">Mantenimiento</span>';
    return '<span class="badge badge-danger">Inactiva</span>';
  }

  function render(page = 1) {
    const tbody = document.getElementById('tabla-canchas');
    const info = document.getElementById('tabla-info');
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, canchas.length);
    const rows = canchas.slice(start, end).map((c) => `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.deporte}</td>
        <td>${c.direccion}</td>
        <td>${badge(c.estado)}</td>
        <td class="text-end cell-actions">
          <button class="btn btn-outline btn-sm me-1" title="Editar"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-outline btn-sm" title="Ver"><i class="bi bi-eye"></i></button>
        </td>
      </tr>
    `).join('');
    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="5" class="text-center py-4 text-muted">Sin registros</td></tr>';
    if (info) info.textContent = canchas.length ? `Mostrando ${start + 1}-${end} de ${canchas.length} registros` : 'Mostrando 0 registros';

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = page <= 1;
    if (btnNext) btnNext.disabled = end >= canchas.length;
  }

  function bind() {
    const btnAdd = document.getElementById('btn-add');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnAdd) btnAdd.addEventListener('click', () => alert('Acción: Añadir Cancha'));
    if (btnPrev) btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage -= 1; render(currentPage); } });
    if (btnNext) btnNext.addEventListener('click', () => {
      const totalPages = Math.ceil(canchas.length / pageSize);
      if (currentPage < totalPages) { currentPage += 1; render(currentPage); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    render(currentPage);
  });
})();

