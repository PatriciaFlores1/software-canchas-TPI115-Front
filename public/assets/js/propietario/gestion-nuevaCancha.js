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

  function bindDropzone() {
    const dz = $('dropzone');
    const file = $('imagenes');
    const info = $('files-info');
    if (!dz || !file) return;

    const openFile = () => file.click();
    dz.addEventListener('click', openFile);

    ;['dragenter', 'dragover'].forEach((evt) =>
      dz.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); dz.classList.add('active'); })
    );
    ;['dragleave', 'drop'].forEach((evt) =>
      dz.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); dz.classList.remove('active'); })
    );
    dz.addEventListener('drop', (e) => {
      if (!e.dataTransfer) return;
      file.files = e.dataTransfer.files;
      updateInfo();
    });
    file.addEventListener('change', updateInfo);

    function updateInfo() {
      const total = file.files ? file.files.length : 0;
      if (info) info.textContent = total ? `${total} archivo(s) seleccionado(s)` : '';
    }
  }

  // Acciones de formulario
  function bindForm() {
    const form = $('form-nueva-cancha');
    const cancel = $('btn-cancelar');
    const fb = $('form-feedback');
    if (cancel) cancel.addEventListener('click', () => history.back());
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Validación mínima
      const requiredIds = ['nombre', 'deporte', 'direccion', 'precio', 'descripcion', 'condiciones', 'ubicacion', 'coords'];
      const missing = requiredIds.filter((id) => !($(id).value || '').trim());
      if (missing.length) {
        if (fb) fb.textContent = 'Complete los campos obligatorios marcados con *';
        return;
      }
      if (fb) fb.textContent = 'Cancha guardada (demo). Integre su API aquí.';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindPrecio();
    bindDropzone();
    bindForm();
  });
})();

