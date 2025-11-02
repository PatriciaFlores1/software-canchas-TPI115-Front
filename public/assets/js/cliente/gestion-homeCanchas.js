// Home de Canchas - Cliente

(function () {
  let data = [];

  const $ = (id) => document.getElementById(id);

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function currency(n) {
    return `$${Number(n || 0).toFixed(2)}`;
  }

  function parseCurrency(str) {
    const s = (str || '').replace(/[^0-9.]/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  function renderOptions() {
    const select = $('f-deporte');
    const deportes = Array.from(new Set(data.map((c) => c.deporte || c.tipo_deporte)));
    deportes.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      select.appendChild(opt);
    });
  }

  function card(cancha) {
    const imagen = cancha.imagen || cancha.url_foto || '/public/assets/img/tenis.png';
    const nombre = cancha.nombre || cancha.nombre_cancha || '';
    const deporte = cancha.deporte || cancha.tipo_deporte || '';
    const precio = cancha.precio || cancha.precioHora || 0;
    const descripcion = cancha.descripcion || '';
    const id = cancha.id_cancha || cancha.id || cancha.id_cancha;

    return `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="card h-100">
          <img src="${imagen}" class="card-img-top" alt="${deporte}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${escapeHtml(nombre)}</h5>
            <div class="text-muted mb-2">${escapeHtml(deporte)} · ${currency(precio)}/hora</div>
            <p class="card-text flex-grow-1">${escapeHtml(descripcion)}</p>
            <button class="btn btn-primary mt-2" data-id="${id}">Más Información</button>
          </div>
        </div>
      </div>`;
  }

  function applyFilters() {
    const deporte = $('f-deporte').value;
    const ubicacion = ($('f-ubicacion').value || '').toLowerCase();
    const precioMax = parseCurrency($('f-precio').value);

    return data.filter((c) => {
      const byDep = deporte ? (c.deporte === deporte || c.tipo_deporte === deporte) : true;
      const byUbi = ubicacion ? ((c.ubicacion || '') + ' ' + (c.nombre || '')).toLowerCase().includes(ubicacion) : true;
      const precioActual = c.precio || c.precioHora || 0;
      const byPrice = precioMax != null ? precioActual <= precioMax : true;
      return byDep && byUbi && byPrice;
    });
  }

  function renderGrid(items) {
    const grid = $('canchas-grid');
    grid.innerHTML = items.map(card).join('') || '<div class="text-muted">No hay canchas que coincidan con la búsqueda.</div>';
    grid.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        // Navigate to cancha info view
        window.location.href = '/?v=cliente/gestion-infoCancha.html&id_cancha=' + encodeURIComponent(id);
      });
    });
  }

  function bindFilters() {
    const buscar = $('btn-buscar');
    const precio = $('f-precio');
    if (buscar) buscar.addEventListener('click', () => renderGrid(applyFilters()));
    if (precio) precio.addEventListener('blur', () => {
      const n = parseCurrency(precio.value);
      precio.value = n != null ? currency(n) : '';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Load canchas from API and render
    fetch('/api/v1/canchas?page=1&per_page=100', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((j) => {
        const items = j.data || [];
        data = items.map((c) => ({
          id_cancha: c.id_cancha,
          nombre: c.nombre,
          tipo_deporte: c.tipo_deporte,
          deporte: c.tipo_deporte,
          ubicacion: c.ubicacion,
          precio: c.precio || c.precio_hora || 0,
          descripcion: c.descripcion || c.condiciones_uso || '',
          imagen: c.imagen || (c.fotos && c.fotos[0] && c.fotos[0].url_foto) || c.imagen,
        }));
        renderOptions();
        bindFilters();
        renderGrid(data);
      }).catch((err) => {
        console.error('No se pudieron cargar las canchas', err);
        // Fallback: render empty
        renderOptions();
        bindFilters();
        renderGrid([]);
      });
  });
})();

