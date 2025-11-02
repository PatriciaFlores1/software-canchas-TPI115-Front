// Añadir Cancha - Propietario

(function () {
  function $(id) { return document.getElementById(id); }

  function normalizePrice(v) {
    const n = (v + '').replace(/[^0-9.]/g, '');
    const num = parseFloat(n || '0');
    return `$${num.toFixed(2)}`;
  }

  function bindPrecio() {
    const input = $('precio');
    if (!input) return;
    input.addEventListener('blur', () => {
      input.value = normalizePrice(input.value);
    });
    // Valor inicial
    if (!input.value) input.value = '$0.00';
  }

  // No inline dropzone: images are uploaded in a separate step (gestion-fotosCancha.html)

  // Module state: allow loadCancha to set this so Edit action can prefill the form
  let createdId = null;
  // When editing, the deporte select is filled asynchronously. Store a pending value to apply after options load.
  let pendingTipoDeporte = null;
  // Track whether the form was opened for editing an existing cancha
  let isEditing = false;

  // Acciones de formulario
  function bindForm() {
  const form = $('form-nueva-cancha');
  const cancel = $('btn-cancelar');
  const fb = $('form-feedback');
  const btnContinuar = $('btn-continuar');

    if (btnContinuar) {
      btnContinuar.disabled = true;
      btnContinuar.textContent = 'Continuar';
    }
    if (cancel) cancel.addEventListener('click', () => { window.location.href = '/?v=propietario/gestion-misCanchas.html'; });
    if (!form) return;

    if (btnContinuar) {
      btnContinuar.addEventListener('click', () => {
        if (!createdId) return;
        // Use & to append additional query params (v is the first param)
        window.location.href = '/?v=propietario/gestion-fotosCancha.html&id_cancha=' + encodeURIComponent(createdId);
      });
    }

    // If URL contains id_cancha, load the cancha data for editing
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id_cancha') || urlParams.get('id');
    if (idFromUrl) {
      // Edit mode: mark editing, enable button and change text
      isEditing = true;
      if (btnContinuar) {
        btnContinuar.disabled = false;
        btnContinuar.textContent = 'Editar foto';
      }
      // try loading the cancha details
      loadCancha(idFromUrl);
    }

    // Cargar tipos de deporte en el select
    fetch('/api/v1/catalogos/tipos-deporte')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(json => {
        const select = $('deporte');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccione el tipo de deporte</option>' + (json.data || []).map(td => `<option value="${td.id_tipo_deporte}">${td.nombre}</option>`).join('');
        // If we have a pending value (from loadCancha), apply it now
        if (pendingTipoDeporte) {
          try { select.value = String(pendingTipoDeporte); } catch (e) { /* ignore */ }
          pendingTipoDeporte = null;
        }
      }).catch(err => console.warn('No se pudieron cargar tipos de deporte', err));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (fb) fb.textContent = '';

      // Validación mínima
      const requiredIds = ['nombre', 'deporte', 'direccion', 'precio'];
      const missing = requiredIds.filter((id) => !($(id).value || '').trim());
      if (missing.length) {
        if (fb) fb.textContent = 'Complete los campos obligatorios marcados con *';
        return;
      }

      const nombre = $('nombre').value.trim();
      const id_tipo_deporte = $('deporte').value;
      const ubicacion = $('ubicacion').value.trim() || $('direccion').value.trim();
      const precioRaw = $('precio').value.replace(/[^0-9.,]/g, '').replace(',', '.');
      const precio = parseFloat(precioRaw) || 0;
      const descripcion = $('descripcion').value.trim();
      const condiciones = $('condiciones').value.trim();
      const coords = $('coords').value.trim();

      const payload = {
        nombre,
        id_tipo_deporte,
        ubicacion,
        precio_hora: precio,
        descripcion,
        condiciones_uso: condiciones,
        coordenada: coords,
      };

      try {
        let res, json;

        if (createdId) {
          // Actualizar cancha existente
          payload.id_cancha = createdId;
          res = await fetch('/api/v1/canchas', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          // Crear nueva cancha
          res = await fetch('/api/v1/canchas', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        json = await res.json();
        if (res.ok) {
          // obtener id desde response (data.id_cancha o id_cancha)
          const id = json.data && json.data.id_cancha ? json.data.id_cancha : (json.id_cancha || null);
            if (id) {
              const wasCreating = !createdId && !isEditing;
              createdId = id;
              if (btnContinuar) {
                btnContinuar.disabled = false;
                btnContinuar.textContent = isEditing ? 'Editar foto' : 'Continuar';
              }
            }
          if (fb) fb.textContent = json.message || 'Cancha guardada correctamente';
        } else {
          if (fb) fb.textContent = json.message || json.error || 'Error al guardar la cancha';
        }
      } catch (err) {
        console.error('Error al guardar cancha', err);
        if (fb) fb.textContent = 'Ocurrió un error de comunicación';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindPrecio();
    bindForm();
    // Inicializar mapa cuando la API de Google Maps esté disponible
    waitForGoogleMapsInit();
  });

  // Helper: load cancha details and populate the form for editing
  async function loadCancha(id) {
    if (!id) return;
    const fb = $('form-feedback');
    if (fb) fb.textContent = 'Cargando datos de la cancha...';
    try {
      const res = await fetch('/api/v1/canchas/detalle?id_cancha=' + encodeURIComponent(id), { credentials: 'same-origin' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error al obtener la cancha');
      const d = json.data || json;
      // populate fields
      if ($('nombre')) $('nombre').value = d.nombre || '';
      if ($('deporte')) {
        // select options are loaded asynchronously; set pending value to apply after options populate
        pendingTipoDeporte = (d.id_tipo_deporte !== undefined && d.id_tipo_deporte !== null) ? String(d.id_tipo_deporte) : null;
      } else {
        // if select not present, store anyway
        pendingTipoDeporte = (d.id_tipo_deporte !== undefined && d.id_tipo_deporte !== null) ? String(d.id_tipo_deporte) : null;
      }
      if ($('direccion')) $('direccion').value = d.ubicacion || '';
      if ($('ubicacion')) $('ubicacion').value = d.ubicacion || '';
      if ($('coords')) $('coords').value = (d.coordenadas || d.coordenada || '') ;
      if ($('descripcion')) $('descripcion').value = d.descripcion || '';
      if ($('condiciones')) $('condiciones').value = d.condiciones_uso || '';
      if ($('precio')) {
        const p = (d.precio || d.precio_hora || d.precio_hora === 0) ? (d.precio || d.precio_hora) : '';
        if (p !== '') $('precio').value = normalizePrice(p);
      }

      createdId = d.id_cancha || id;
      const btnContinuar = $('btn-continuar');
      if (btnContinuar) {
        btnContinuar.disabled = false;
        btnContinuar.textContent = isEditing ? 'Editar foto' : 'Continuar';
      }
      if (fb) fb.textContent = '';

      // If map already initialized, re-run initMap to position marker from coords
      if (window.google && window.google.maps && typeof window.initMap === 'function') {
        try { window.initMap(); } catch (e) { console.warn('initMap call failed', e); }
      }
    } catch (err) {
      console.error('Error al cargar cancha', err);
      if (fb) fb.textContent = 'No se pudo cargar la cancha para editar';
    }
  }

  // Espera a que Google Maps esté disponible y luego inicializa el mapa
  function waitForGoogleMapsInit() {
    const timeout = 10000; // 10s
    const interval = 200;
    let waited = 0;
    const t = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(t);
        initMap();
      } else {
        waited += interval;
        if (waited >= timeout) {
          clearInterval(t);
          console.warn('Google Maps API no disponible (timeout)');
          // Mostrar mensaje amigable en la UI
          const errEl = document.getElementById('map-error');
          if (errEl) errEl.textContent = 'Google Maps no disponible. Verifique la clave API y la conexión.';
        }
      }
    }, interval);
  }

  // Inicializa el mapa y la interacción para seleccionar ubicación
  function initMap() {
    const mapEl = $('mapa');
    if (!mapEl || !window.google || !window.google.maps) return;

    const defaultCenter = { lat: 13.69294, lng: -89.21819 }; // El Salvador (aprox.)
    const map = new google.maps.Map(mapEl, {
      center: defaultCenter,
      zoom: 13,
    });

    const geocoder = new google.maps.Geocoder();
    let marker = null;

    // Intentar centrar en la ubicación del navegador si el usuario lo permite
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(p);
      }, () => { /* ignorar errores */ });
    }

    function placeMarkerAndPan(latLng) {
      if (marker) {
        marker.setPosition(latLng);
      } else {
        marker = new google.maps.Marker({ position: latLng, map });
      }
      map.panTo(latLng);
      // Llenar coords
      const coordsInput = $('coords');
      if (coordsInput) coordsInput.value = latLng.lat().toFixed(6) + ', ' + latLng.lng().toFixed(6);

      // Reverse geocode para llenar ubicacion
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const ubicInput = $('ubicacion');
          if (ubicInput) ubicInput.value = results[0].formatted_address;
        }
      });
    }

    map.addListener('click', (e) => {
      placeMarkerAndPan(e.latLng);
    });

    // Si el campo coords ya tiene valor, posicionar el marker
    const coordsVal = ($('coords') && $('coords').value) || '';
    if (coordsVal) {
      const parts = coordsVal.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const latLng = new google.maps.LatLng(parts[0], parts[1]);
        placeMarkerAndPan(latLng);
      }
    }
  }

  // Exponer la función initMap para que Google Maps pueda invocar el callback global
  try {
    window.initMap = initMap;
  } catch (e) {
    console.warn('No se pudo exponer initMap globalmente', e);
  }

  // Detectar fallo de autenticación (clave inválida / no autorizada)
  window.gm_authFailure = function() {
    console.error('Google Maps authentication failed (gm_authFailure)');
    const errEl = document.getElementById('map-error');
    if (errEl) errEl.textContent = 'Google Maps: clave API inválida o no autorizada. Reemplace la clave API en el archivo.';
  };
})();

