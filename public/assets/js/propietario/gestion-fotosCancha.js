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
      $('id-cancha').value = id;
      $('info-cancha').textContent = 'Subiendo fotos para la cancha id=' + id;
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
      preview.innerHTML = '';
      Array.from(e.target.files || []).forEach(f => {
        const url = URL.createObjectURL(f);
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '120px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.className = 'rounded border';
        preview.appendChild(img);
      });
    });
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
