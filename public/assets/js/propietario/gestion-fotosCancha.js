(function () {
  const $ = (id) => document.getElementById(id);

  function parseQuery() {
    const q = {};
    location.search.replace(/^\?/, '').split('&').forEach(p => {
      if (!p) return;
      const [k, v] = p.split('=');
      q[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return q;
  }

  function init() {
    const q = parseQuery();
    const id = q.id_cancha || '';
    if (id) {
      // set hidden id for submission
      $('id-cancha').value = id;
      // fetch cancha details to display a friendly name
      fetch('/api/v1/canchas/detalle?id_cancha=' + encodeURIComponent(id), { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(json => {
          const d = json.data || json;
          const nombre = d.nombre || ('id=' + id);
          const nombreEl = $('nombre-cancha');
          if (nombreEl) nombreEl.value = nombre;
          $('info-cancha').textContent = 'Subiendo fotos para la cancha: ' + nombre;

          // Render existing fotos (si las hay)
          if (d.fotos && Array.isArray(d.fotos) && d.fotos.length) {
            renderExistingFotos(d.fotos);
          }
        }).catch(err => {
          console.warn('No se pudo obtener detalle de la cancha', err);
          // fallback to showing id
          const nombreEl = $('nombre-cancha');
          if (nombreEl) nombreEl.value = 'Cancha id=' + id;
          $('info-cancha').textContent = 'Subiendo fotos para la cancha id=' + id;
        });
    } else {
      $('info-cancha').textContent = 'Indique el id_cancha en la URL como ?id_cancha=123';
    }

    bindPreview();
    bindSubmit();
    bindCancel();
  }

  function bindCancel() {
    const btn = $('btn-cancelar');
    if (!btn) return;
    btn.addEventListener('click', () => { window.location.href = '/?v=propietario/gestion-misCanchas.html'; });
  }

  function bindPreview() {
    const input = $('fotos');
    const preview = $('preview');
    if (!input) return;
    input.addEventListener('change', (e) => {
      // Preserve existing fotos preview and append selected images for upload
      // Selected files preview
      const selected = Array.from(e.target.files || []);
      // Remove only the temporary selected previews (we mark them with data-new)
      preview.querySelectorAll('[data-new]').forEach(n => n.remove());
      selected.forEach(f => {
        const url = URL.createObjectURL(f);
        const wrapper = document.createElement('div');
        wrapper.className = 'position-relative';
        wrapper.setAttribute('data-new', '1');
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '120px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.className = 'rounded border';
        wrapper.appendChild(img);
        preview.appendChild(wrapper);
      });
    });
  }

  // Render existing fotos with delete controls
  function renderExistingFotos(fotos) {
    const preview = $('preview');
    if (!preview) return;
    // First remove any existing server-side foto nodes
    preview.querySelectorAll('[data-foto-id]').forEach(n => n.remove());

    fotos.forEach(f => {
      const wrapper = document.createElement('div');
      wrapper.className = 'position-relative';
      wrapper.setAttribute('data-foto-id', f.id_foto || f.id || '');

      const img = document.createElement('img');
      img.src = f.url_foto || f.url || '';
      img.style.width = '120px';
      img.style.height = '80px';
      img.style.objectFit = 'cover';
      img.className = 'rounded border';
      wrapper.appendChild(img);

      // Delete button overlay
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-danger position-absolute';
      btn.style.right = '4px';
      btn.style.top = '4px';
      btn.textContent = 'Eliminar';
      btn.addEventListener('click', () => handleDeleteFoto(f.id_foto || f.id));
      wrapper.appendChild(btn);

      preview.appendChild(wrapper);
    });
  }

  async function handleDeleteFoto(idFoto) {
    if (!idFoto) return;
    const confirmDelete = confirm('¿Desea eliminar esta foto? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;
    const feedback = $('fotos-feedback');
    try {
      const res = await fetch('/api/v1/canchas/fotos?id_foto=' + encodeURIComponent(idFoto), {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const json = await res.json();
      if (res.ok) {
        feedback.textContent = json.message || 'Foto eliminada';
        // remove element
        const el = document.querySelector('[data-foto-id="' + idFoto + '"]');
        if (el) el.remove();
      } else {
        feedback.textContent = json.message || json.error || 'Error al eliminar foto';
      }
    } catch (err) {
      console.error('Error deleting foto', err);
      if (feedback) feedback.textContent = 'Error de comunicación';
    }
  }

  async function bindSubmit() {
    const form = $('form-fotos');
    const feedback = $('fotos-feedback');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.textContent = '';
      const id = $('id-cancha').value;
      if (!id) return feedback.textContent = 'Id de cancha requerido';
      const files = $('fotos').files;
      if (!files || files.length === 0) return feedback.textContent = 'Seleccione al menos una imagen';

      const fd = new FormData();
      fd.append('id_cancha', id);
      Array.from(files).forEach(f => fd.append('fotos[]', f, f.name));

      try {
        const res = await fetch('/api/v1/canchas/fotos?id_cancha=' + encodeURIComponent(id), {
          method: 'POST',
          credentials: 'same-origin',
          body: fd,
        });
        const json = await res.json();
        if (res.ok) {
          feedback.textContent = json.message || 'Fotos subidas con éxito';
          // opcional: redirigir a mis canchas
          setTimeout(() => { window.location.href = '/?v=propietario/gestion-misCanchas.html'; }, 1200);
        } else {
          feedback.textContent = json.message || json.error || 'Error al subir fotos';
        }
      } catch (err) {
        console.error('Error uploading fotos', err);
        feedback.textContent = 'Error de comunicación';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
