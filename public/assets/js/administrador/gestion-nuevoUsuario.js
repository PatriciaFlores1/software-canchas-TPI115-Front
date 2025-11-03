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

  function getRoleId(roleName) {
    switch (roleName) {
      case 'Administrador':
        return 1;
      case 'Propietario':
        return 2;
      case 'Cliente':
        return 3;
      default:
        return 3; // Default to Cliente
    }
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

      const nombreCompleto = $('nombre').value.trim();
      const nombreParts = nombreCompleto.split(' ');
      const nombre = nombreParts.shift();
      const apellido = nombreParts.join(' ');

      const data = {
        nombre: nombre,
        apellido: apellido,
        email: $('correo').value.trim(),
        password: $('password').value,
        id_rol: getRoleId($('rol').value),
      };

      fetch('/api/v1/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          showFeedback(result.error, false);
        } else {
          showFeedback('Usuario guardado correctamente.', true);
          setTimeout(() => {
            window.location.href = '/administrador/gestion-usuarios.html';
          }, 1500);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showFeedback('Ocurrió un error al guardar el usuario.', false);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', bind);
})();

