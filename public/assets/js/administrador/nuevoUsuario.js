(function () {
  const form = document.getElementById('formNuevoUsuario');
  if (!form) return;

  const pass = document.getElementById('contrasena');
  const confirm = document.getElementById('confirmar');

  function validarCoincidencia() {
    if (confirm.value && pass.value !== confirm.value) {
      confirm.setCustomValidity('Las contraseñas no coinciden');
    } else {
      confirm.setCustomValidity('');
    }
  }

  pass.addEventListener('input', validarCoincidencia);
  confirm.addEventListener('input', validarCoincidencia);

  form.addEventListener('submit', function (e) {
    validarCoincidencia();
    e.preventDefault();
    e.stopPropagation();
    if (form.checkValidity()) {
      // Crear JSON desde los datos del formulario
      const formData = new FormData(form);
      const jsonData = {};

      formData.forEach((value, key) => {
        jsonData[key] = value;
      });

      console.log("API CALL");
      console.log(JSON.stringify(jsonData, null, 2));
    }
  });
})();
