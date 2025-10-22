// Añadir Nuevo Usuario - Validaciones básicas y feedback visual

(function () {
  function $(id) { return document.getElementById(id); }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validate(form) {
    const nombre = $('nombre').value.trim();
    const correo = $('correo').value.trim();
    const pass = $('password').value;
    const conf = $('confirm').value;
    const rol = $('rol').value;

    const errors = [];
    if (nombre.length < 3) errors.push('El nombre debe tener al menos 3 caracteres.');
    if (!isEmail(correo)) errors.push('Ingrese un correo electrónico válido.');
    if (pass.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres.');
    if (pass !== conf) errors.push('Las contraseñas no coinciden.');
    if (!rol) errors.push('Seleccione un rol.');
    return errors;
  }

  function showFeedback(msg, isOk) {
    const el = $('form-feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.color = isOk ? 'var(--color-vermillion)' : 'var(--color-vermillion)';
  }

  function bind() {
    const form = $('form-nuevo-usuario');
    const cancel = $('btn-cancelar');

    if (cancel) cancel.addEventListener('click', () => history.back());

    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errs = validate(form);
      if (errs.length) {
        showFeedback(errs[0], false);
        return;
      }
      showFeedback('Usuario guardado (demo). Integre aquí su API.', true);
    });
  }

  document.addEventListener('DOMContentLoaded', bind);
})();

