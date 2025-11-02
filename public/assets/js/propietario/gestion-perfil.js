// Perfil Personal - Propietario

(function () {
  const $ = (id) => document.getElementById(id);
  let currentUser = null;
  let avatarFile = null;

  function init() {
    bindAvatar();
    bindForms();
    loadCurrentUser();
  }

  function loadCurrentUser() {
    fetch('/api/v1/me', { credentials: 'same-origin' })
      .then((r) => {
        if (!r.ok) throw r;
        return r.json();
      })
      .then((me) => {
        if (!me || !me.id_usuario) {
          throw new Error('No autenticado');
        }
        currentUser = me;
        loadUserDetail(me.id_usuario);
      })
      .catch((err) => {
        console.warn('No autenticado o error al obtener /api/v1/me', err);
        window.location.href = '/?v=authentication/login.html';
      });
  }

  function loadUserDetail(id) {
    fetch(`/api/v1/usuarios/detalle?id_usuario=${encodeURIComponent(id)}`, { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((usuario) => {
        if (usuario.error) {
          throw new Error(usuario.error);
        }
        populateForm(usuario);
      }).catch((err)=>{
        console.error('Error cargando detalle de usuario', err);
      });
  }

  function populateForm(u) {
    $('perfil-nombre').textContent = (u.nombre || '') + ' ' + (u.apellido || '');
    $('perfil-rol').textContent = (u.rol && u.rol.nombre) ? u.rol.nombre : (u.id_rol == 3 ? 'Propietario' : 'Usuario');
    $('inp-nombre').value = u.nombre || '';
    $('inp-apellido').value = u.apellido || '';
    $('inp-correo').value = u.email || '';
    $('inp-telefono').value = u.telefono || '';

    const avatarPreview = $('avatar-preview');
    const avatarIcon = $('avatar-icon');
    if (u.url_foto) {
      avatarPreview.src = u.url_foto;
      avatarPreview.style.display = 'block';
      avatarIcon.style.display = 'none';
    } else {
      avatarPreview.style.display = 'none';
      avatarIcon.style.display = 'block';
    }
  }

  function bindAvatar() {
    const btn = $('btn-avatar');
    const file = $('avatar-file');
    const avatarPreview = $('avatar-preview');
    const avatarIcon = $('avatar-icon');

    if (!btn || !file) return;

    btn.addEventListener('click', () => file.click());

    file.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      avatarFile = f;
      const reader = new FileReader();
      reader.onload = function (ev) {
        avatarPreview.src = ev.target.result;
        avatarPreview.style.display = 'block';
        avatarIcon.style.display = 'none';
      };
      reader.readAsDataURL(f);
    });
  }

  function bindForms() {
    const form = $('form-perfil');
    const fb = $('perfil-feedback');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser.id_usuario) {
          fb.textContent = 'No autenticado';
          return;
        }

        const nombre = $('inp-nombre').value.trim();
        const apellido = $('inp-apellido').value.trim();
        const correo = $('inp-correo').value.trim();
        const telefono = $('inp-telefono').value.trim();

        try {
          let res, json;
          if (avatarFile) {
            const fd = new FormData();
            fd.append('id_usuario', currentUser.id_usuario);
            fd.append('nombre', nombre);
            fd.append('apellido', apellido);
            fd.append('email', correo);
            fd.append('telefono', telefono);
            fd.append('avatar', avatarFile, avatarFile.name);

            res = await fetch('/api/v1/usuarios', {
              method: 'PUT',
              credentials: 'same-origin',
              body: fd,
            });
          } else {
            res = await fetch('/api/v1/usuarios', {
              method: 'PUT',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id_usuario: currentUser.id_usuario,
                nombre,
                apellido,
                email: correo,
                telefono,
              }),
            });
          }

          json = await res.json();
          if (res.ok) {
            fb.textContent = json.message || 'Perfil actualizado correctamente';
            $('perfil-nombre').textContent = nombre + ' ' + apellido;
          } else {
            fb.textContent = json.error || json.message || 'Error al actualizar perfil';
          }
        } catch (err) {
          console.error('Error al guardar perfil', err);
          if (fb) fb.textContent = 'Ocurrió un error al comunicarse con el servidor';
        }
      });
    }

    const passForm = $('form-password');
    const passFb = $('password-feedback');
    if (passForm) {
      passForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser.id_usuario) {
          passFb.textContent = 'No autenticado';
          return;
        }

        const actual = $('pass-actual').value || '';
        const nueva = $('pass-nueva').value || '';
        const repetir = $('pass-repetir').value || '';

        if (!actual || !nueva || !repetir) {
          passFb.textContent = 'Complete todos los campos de contraseña';
          return;
        }
        if (nueva !== repetir) {
          passFb.textContent = 'La nueva contraseña y la repetición no coinciden';
          return;
        }
        if (nueva.length < 6) {
          passFb.textContent = 'La contraseña debe tener al menos 6 caracteres';
          return;
        }

        try {
          const res = await fetch('/api/v1/usuarios', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_usuario: currentUser.id_usuario,
              current_password: actual,
              password: nueva,
            }),
          });
          const json = await res.json();
          if (res.ok) {
            passFb.textContent = json.message || 'Contraseña actualizada correctamente';
            $('pass-actual').value = '';
            $('pass-nueva').value = '';
            $('pass-repetir').value = '';
          } else {
            passFb.textContent = json.error || json.message || 'Error al cambiar la contraseña';
          }
        } catch (err) {
          console.error('Error al cambiar contraseña', err);
          passFb.textContent = 'Ocurrió un error de comunicación';
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

