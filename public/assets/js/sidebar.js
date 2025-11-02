// sidebar.js
(function () {
  const menuContainer = document.getElementById("sidebar-menu");
  if (!menuContainer) return;

  // --- Menús por rol ---
  const menus = {
    administrador: [
      { icon: "bi-graph-up", label: "Estadísticas", view: "administrador/gestion-estadisticas.html" },
      { icon: "bi-gear", label: "Gestión de Canchas", view: "administrador/gestion-canchas.html" },
      { icon: "bi-people", label: "Gestión de Usuarios", view: "administrador/gestion-usuarios.html" },
      { icon: "bi-calendar-check", label: "Gestión de Reservas", view: "administrador/gestion-reservas.html" },
  { icon: "bi-person", label: "Perfil", view: "administrador/gestion-perfil.html" },
    ],
    propietario: [
      { icon: "bi-graph-up", label: "Estadísticas", view: "propietario/gestion-estadisticas.html" },
      { icon: "bi-folder2-open", label: "Mis Canchas", view: "propietario/gestion-misCanchas.html" },
      { icon: "bi-cash-coin", label: "Ingresos", view: "propietario/gestion-reservas.html" },
      { icon: "bi-person", label: "Perfil", view: "propietario/gestion-perfil.html" },
    ],
    cliente: [
      { icon: "bi-search", label: "Explorar", view: "cliente/gestion-homeCanchas.html" },
      { icon: "bi-folder2-open", label: "Mis Reservas", view: "cliente/gestion-misReservas.html" },
      { icon: "bi-person", label: "Perfil", view: "cliente/gestion-perfil.html" },
    ],
  };

  // --- Renderizar el menú según rol ---
  function updateMenu(rol) {
    menuContainer.innerHTML = "";

    if (menus[rol]) {
      menus[rol].forEach((item) => {
        const link = document.createElement("a");
        // Usar la ruta con ?v= para compatibilidad si no hay mod_rewrite
        link.href = `/?v=${item.view}`;
        link.classList.add("sidebar-link");
        link.title = item.label; // tooltip útil cuando está colapsado
        link.setAttribute("data-bs-toggle", "tooltip");
        link.setAttribute("data-bs-placement", "right");
        link.setAttribute("data-bs-container", "body");
        link.innerHTML = `
          <i class="bi ${item.icon}" title="${item.label}"></i>
          <span>${item.label}</span>
        `;
        menuContainer.appendChild(link);
      });
    }
  }

  // Obtener rol actual desde el backend (/api/v1/me)
  fetch('/api/v1/me')
    .then((res) => {
      if (!res.ok) throw res;
      return res.json();
    })
    .then((data) => {
      // Mapear id_rol a nombre de rol
  const idRol = Number(data.id_rol || 0);
  let rol = 'cliente';
  // id_rol: 1=Admin, 2=Cliente, 3=Propietario
  if (idRol === 1) rol = 'administrador';
  else if (idRol === 2) rol = 'cliente';
  else if (idRol === 3) rol = 'propietario';

      updateMenu(rol);
    })
    .catch(() => {
      // No autenticado: ocultar menú o dejar cliente por defecto
      updateMenu('cliente');
    });

  // --- Elementos principales ---
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");

  // Crear overlay si no existe
  let overlay = document.querySelector(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("sidebar-overlay");
    document.body.appendChild(overlay);
  }

  // --- Función general para alternar ---
  function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const isOpen = sidebar.classList.toggle("open");
      overlay.classList.toggle("active", isOpen);
      document.body.classList.toggle("no-scroll", isOpen);
      
      // Ocultar/mostrar botón flotante en móvil
      if (mobileMenuBtn) {
        mobileMenuBtn.style.display = isOpen ? "none" : "block";
      }
    } else {
      sidebar.classList.toggle("collapsed");
    }
  }

  // Event listeners
  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);
  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleSidebar);

  // Logout handler (el elemento viene del sidebar.html cargado dinámicamente)
  function attachLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/v1/logout', { method: 'POST' });
        // Al cerrar sesión, redirigimos al inicio público
        window.location.href = '/';
      } catch (err) {
        console.error('Error en logout', err);
        window.location.href = '/';
      }
    });
  }

  // Como sidebar.html se carga dinámicamente, esperar un tick para adjuntar logout
  setTimeout(attachLogout, 300);

  // Cerrar al hacer clic fuera (modo móvil)
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    if (mobileMenuBtn) mobileMenuBtn.style.display = "block";
  });

  // Cerrar con tecla ESC en móvil
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
      if (mobileMenuBtn) mobileMenuBtn.style.display = "block";
    }
  });

  // Asegurar estados correctos al redimensionar
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
      if (mobileMenuBtn) mobileMenuBtn.style.display = "none";
    } else {
      if (mobileMenuBtn) mobileMenuBtn.style.display = "block";
    }
  });

  // Inicializar estado en móvil
  if (window.innerWidth <= 768 && mobileMenuBtn) {
    mobileMenuBtn.style.display = "block";
  }
})();
