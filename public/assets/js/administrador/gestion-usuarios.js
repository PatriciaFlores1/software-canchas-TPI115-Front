// gestion-usuarios.js
document.addEventListener('DOMContentLoaded', () => {
  const API = '/api/v1/usuarios';
  const tbody = document.getElementById('tabla-usuarios');
  const searchInput = document.getElementById('search');
  const info = document.getElementById('tabla-info');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  let users = [];
  let filtered = [];
  let page = 1;
  const perPage = 10;

  function renderRow(user) {
    const tr = document.createElement('tr');

    const nombre = `${user.nombre || ''} ${user.apellido || ''}`.trim();
    const rol = (user.rol && user.rol.nombre) ? user.rol.nombre : (user.id_rol ?? '—');
    const estado = (user.estado && user.estado.nombre) ? user.estado.nombre : (user.id_estado ?? '—');

    tr.innerHTML = `
      <td>${escapeHtml(nombre)}</td>
      <td>${escapeHtml(user.email || '—')}</td>
      <td>${escapeHtml(String(rol))}</td>
      <td>${escapeHtml(String(estado))}</td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-primary me-1" href="/?v=administrador/gestion-perfil.html&id_usuario=${user.id_usuario}">Ver</a>
        <a class="btn btn-sm btn-outline-secondary" href="/?v=administrador/editar-usuario.html&id_usuario=${user.id_usuario}">Editar</a>
      </td>
    `;

    return tr;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderTable() {
    tbody.innerHTML = '';
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const slice = filtered.slice(start, end);

    slice.forEach(u => {
      tbody.appendChild(renderRow(u));
    });

    info.textContent = `Mostrando ${start + 1}-${Math.min(end, total)} de ${total}`;

    btnPrev.disabled = page <= 1;
    btnNext.disabled = page >= totalPages;
  }

  btnPrev.addEventListener('click', () => {
    if (page > 1) {
      page--;
      renderTable();
    }
  });

  btnNext.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page < totalPages) {
      page++;
      renderTable();
    }
  });

  function applySearch() {
    const q = (searchInput.value || '').trim().toLowerCase();
    if (!q) {
      filtered = users.slice();
    } else {
      filtered = users.filter(u => {
        const nombre = ((u.nombre || '') + ' ' + (u.apellido || '')).toLowerCase();
        const email = (u.email || '').toLowerCase();
        const rol = (u.rol && u.rol.nombre) ? (u.rol.nombre || '') : String(u.id_rol || '');
        return nombre.includes(q) || email.includes(q) || (rol+'').toLowerCase().includes(q);
      });
    }
    page = 1;
    renderTable();
  }

  searchInput.addEventListener('input', () => applySearch());

  // Fetch users
  async function loadUsers() {
    try {
      const res = await fetch(API);
      if (!res.ok) {
        console.error('Error cargando usuarios', res.status);
        tbody.innerHTML = '<tr><td colspan="5">Error cargando usuarios.</td></tr>';
        return;
      }
      users = await res.json();
      if (!Array.isArray(users)) users = [];
      filtered = users.slice();
      renderTable();
    } catch (err) {
      console.error('Error en petición usuarios', err);
      tbody.innerHTML = '<tr><td colspan="5">Error de comunicación con el servidor.</td></tr>';
    }
  }

  loadUsers();
});
