// Mis canchas - Propietario

(function () {
  // State
  let canchas = [];
  let pagination = { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 };
  let loading = false;

  function badge(estado) {
    if (!estado) return '<span class="badge badge-secondary">Desconocido</span>';
    if (estado.toLowerCase().indexOf('act') === 0) return '<span class="badge badge-success">' + estado + '</span>';
    if (estado.toLowerCase().indexOf('man') === 0) return '<span class="badge badge-warning">' + estado + '</span>';
    return '<span class="badge badge-danger">' + estado + '</span>';
  }

  function render() {
    const tbody = document.getElementById('tabla-canchas');
    const info = document.getElementById('tabla-info');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (!tbody) return;

    if (loading) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Cargando...</td></tr>';
      if (info) info.textContent = '';
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      return;
    }

    if (!canchas.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Sin registros</td></tr>';
      if (info) info.textContent = 'Mostrando 0 registros';
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      return;
    }

    const rows = canchas.map((c) => `
      <tr>
        <td>${escapeHtml(c.nombre || '')}</td>
        <td>${escapeHtml(c.tipo_deporte || '')}</td>
        <td>${escapeHtml(c.ubicacion || '')}</td>
        <td>${badge(c.estado || '')}</td>
        <td class="text-end cell-actions">
          <button class="btn btn-outline btn-sm me-1" title="Editar" data-id="${c.id_cancha}"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-outline btn-sm" title="Horarios" data-id="${c.id_cancha}"><i class="bi bi-calendar3"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;

    if (info) info.textContent = `Mostrando ${pagination.from}-${pagination.to} de ${pagination.total} registros`;

    if (btnPrev) btnPrev.disabled = pagination.current_page <= 1;
    if (btnNext) btnNext.disabled = pagination.current_page >= pagination.last_page;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function loadPage(page = 1) {
    loading = true;
    render();
    try {
      const per_page = pagination.per_page || 10;
      const res = await fetch(`/api/v1/canchas?page=${page}&per_page=${per_page}`, { credentials: 'same-origin' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error al obtener canchas');

      canchas = json.data || [];
      pagination = Object.assign(pagination, json.pagination || {});
      // normalize pagination numbers
      pagination.total = pagination.total || (canchas.length || 0);
      pagination.per_page = pagination.per_page || per_page;
      pagination.current_page = pagination.current_page || page;
      pagination.last_page = pagination.last_page || 1;
      pagination.from = pagination.from || (canchas.length ? 1 : 0);
      pagination.to = pagination.to || canchas.length;

    } catch (err) {
      console.error('Error cargando canchas', err);
      const tbody = document.getElementById('tabla-canchas');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-danger">Error al cargar registros</td></tr>';
      const info = document.getElementById('tabla-info');
      if (info) info.textContent = '';
    } finally {
      loading = false;
      render();
    }
  }

  function bind() {
    const btnAdd = document.getElementById('btn-add');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const tbody = document.getElementById('tabla-canchas');

    if (btnAdd) btnAdd.addEventListener('click', () => {
      window.location.href = '/?v=propietario/gestion-nuevaCancha.html';
    });

    if (btnPrev) btnPrev.addEventListener('click', () => {
      if (pagination.current_page > 1) loadPage(pagination.current_page - 1);
    });

    if (btnNext) btnNext.addEventListener('click', () => {
      if (pagination.current_page < pagination.last_page) loadPage(pagination.current_page + 1);
    });

    // Actions: edit / view
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (btn.title === 'Editar') {
          window.location.href = '/?v=propietario/gestion-nuevaCancha.html&id_cancha=' + encodeURIComponent(id);
        } else if (btn.title === 'Horarios') {
          // Abrir la vista para gestionar horarios disponibles de la cancha seleccionada
          // Intentamos primero la ruta correcta; si devuelve 404 probamos la variante antigua
          (async function navigateToHorario(canchaId) {
            const target = '/?v=propietario/gestion-nuevaHorario.html&id_cancha=' + encodeURIComponent(canchaId);
            const alt = '/?v=propietario/gestion-nuevohorario.html&id_cancha=' + encodeURIComponent(canchaId);
            try {
              const r = await fetch(target, { method: 'GET', credentials: 'same-origin' });
              if (r.ok) {
                window.location.href = target;
                return;
              }
              // si no OK y es 404, probamos la alternativa
              if (r.status === 404) {
                const r2 = await fetch(alt, { method: 'GET', credentials: 'same-origin' });
                if (r2.ok) {
                  window.location.href = alt;
                  return;
                }
              }
            } catch (e) {
              // fallthrough: si ocurre un error de red simplemente navegamos a la target
            }
            // última opción: ir a la target aunque pueda 404 (fallback)
            window.location.href = target;
          })(id);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    loadPage(1);
  });
})();

