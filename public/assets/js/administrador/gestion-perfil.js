// Gestión de Perfil Personal - Admin

(function () {
  function $(id) { return document.getElementById(id); }

  function initData() {
    $('inp-nombre').value = 'Juan';
    $('inp-apellido').value = 'Pérez';
    $('inp-correo').value = 'juan.perez@example.com';
    $('inp-telefono').value = '0000-0000';
  }

  function bindAvatar() {
    const btn = $('btn-avatar');
    const file = $('avatar-file');
    const img = $('avatar-preview');
    const icon = $('avatar-icon');

    if (btn && file) btn.addEventListener('click', () => file.click());
    if (file && img) file.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.src = ev.target.result;
        img.style.display = 'block';
        if (icon) icon.style.display = 'none';
      };
      reader.readAsDataURL(f);
    });
  }

  function showMsg(el, msg) {
    if (!el) return;
    el.textContent = msg;
  }

  function bindPerfilForm() {
    const form = $('form-perfil');
    const fb = $('perfil-feedback');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showMsg(fb, 'Datos guardados (demo). Integre su API aquí.');
    });
  }

  function bindPasswordForm() {
    const form = $('form-password');
    const fb = $('password-feedback');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const actual = $('pass-actual').value;
      const nueva = $('pass-nueva').value;
      const repetir = $('pass-repetir').value;
      if (!nueva || nueva.length < 8) return showMsg(fb, 'La nueva contraseña debe tener al menos 8 caracteres.');
      if (nueva !== repetir) return showMsg(fb, 'Las contraseñas no coinciden.');
      if (!actual) return showMsg(fb, 'Ingrese su contraseña actual.');
      showMsg(fb, 'Contraseña actualizada (demo).');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initData();
    bindAvatar();
    bindPerfilForm();
    bindPasswordForm();
  });
})();

