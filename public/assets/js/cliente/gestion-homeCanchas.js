// Home de Canchas - Cliente

(function () {
  const data = [
    {
      id: 1,
      nombre: 'Campo de fútbol en el centro de la ciudad',
      deporte: 'Fútbol',
      ubicacion: 'Centro, Ciudad',
      precioHora: 50,
      descripcion: 'Un campo de primera calidad en el corazón de la ciudad, perfecto para partidos competitivos.',
      imagen: '/public/assets/img/futbol.png',
    },
    {
      id: 2,
      nombre: 'Cancha de baloncesto en el centro',
      deporte: 'Baloncesto',
      ubicacion: 'Parque Central',
      precioHora: 40,
      descripcion: 'Disfruta de un partido con vistas a la ciudad en esta cancha al aire libre bien mantenida.',
      imagen: '/public/assets/img/baloncesto.png',
    },
    {
      id: 3,
      nombre: 'Cancha de voleibol de playa',
      deporte: 'Voleibol',
      ubicacion: 'Costa Norte',
      precioHora: 35,
      descripcion: 'Juega con la arena entre los dedos en esta impresionante cancha junto a la playa.',
      imagen: '/public/assets/img/voleibol.png',
    },
    {
      id: 4,
      nombre: 'Tenis Club - Court A',
      deporte: 'Tenis',
      ubicacion: 'Zona Norte',
      precioHora: 45,
      descripcion: 'Pista rápida, iluminación nocturna y vestuarios.',
      imagen: '/public/assets/img/tenis.png',
    },
  ];

  const $ = (id) => document.getElementById(id);

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
    const deportes = Array.from(new Set(data.map((c) => c.deporte)));
    deportes.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      select.appendChild(opt);
    });
  }

  function card(cancha) {
    return `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="card h-100">
          <img src="${cancha.imagen}" class="card-img-top" alt="${cancha.deporte}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${cancha.nombre}</h5>
            <div class="text-muted mb-2">${cancha.deporte} · ${currency(cancha.precioHora)}/hora</div>
            <p class="card-text flex-grow-1">${cancha.descripcion}</p>
            <button class="btn btn-primary mt-2" data-id="${cancha.id}">Más Información</button>
          </div>
        </div>
      </div>`;
  }

  function applyFilters() {
    const deporte = $('f-deporte').value;
    const ubicacion = ($('f-ubicacion').value || '').toLowerCase();
    const precioMax = parseCurrency($('f-precio').value);

    return data.filter((c) => {
      const byDep = deporte ? c.deporte === deporte : true;
      const byUbi = ubicacion ? (c.ubicacion + ' ' + c.nombre).toLowerCase().includes(ubicacion) : true;
      const byPrice = precioMax != null ? c.precioHora <= precioMax : true;
      return byDep && byUbi && byPrice;
    });
  }

  function renderGrid(items) {
    const grid = $('canchas-grid');
    grid.innerHTML = items.map(card).join('') || '<div class="text-muted">No hay canchas que coincidan con la búsqueda.</div>';
    grid.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        alert('Más información de la cancha #' + id);
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
    renderOptions();
    bindFilters();
    renderGrid(data);
  });
})();

