// Perfil Personal - Propietario

(function () {
  const $ = (id) => document.getElementById(id);

  function initData() {
    const nombre = $('inp-nombre');
    const apellido = $('inp-apellido');
    const correo = $('inp-correo');
    const tel = $('inp-telefono');
    if (nombre) nombre.value = 'Pérez';
    if (apellido) apellido.value = 'Pérez';
    if (correo) correo.value = 'perez.perez@example.com';
    if (tel) tel.value = '0000-0000';
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

  function bindPerfilForm() {
    const form = $('form-perfil');
    const fb = $('perfil-feedback');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (fb) fb.textContent = 'Datos guardados (demo). Integre su API aquí.';
    });
  }

  function bindPasswordForm() {
    const form = $('form-password');
    const fb = $('password-feedback');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nueva = $('pass-nueva').value;
      const repetir = $('pass-repetir').value;
      const actual = $('pass-actual').value;
      if (!nueva || nueva.length < 8) return fb && (fb.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.');
      if (nueva !== repetir) return fb && (fb.textContent = 'Las contraseñas no coinciden.');
      if (!actual) return fb && (fb.textContent = 'Ingrese su contraseña actual.');
      if (fb) fb.textContent = 'Contraseña actualizada (demo).';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initData();
    bindAvatar();
    bindPerfilForm();
    bindPasswordForm();
  });
})();

