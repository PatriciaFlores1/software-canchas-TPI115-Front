// sidebar.js
(function () {
  const menuContainer = document.getElementById("sidebar-menu");
  if (!menuContainer) return;

  // --- Rol actual (simulado) ---
  const rolUsuario = "administrador";

  // --- Menús por rol ---
  const menus = {
    administrador: [
      { icon: "bi-graph-up", label: "Estadísticas" },
      { icon: "bi-gear", label: "Gestión de Canchas" },
      { icon: "bi-people", label: "Gestión de Usuarios" },
      { icon: "bi-calendar-check", label: "Gestión de Reservas" },
      { icon: "bi-person", label: "Perfil" },
    ],
    propietario: [
      { icon: "bi-graph-up", label: "Estadísticas" },
      { icon: "bi-folder2-open", label: "Mis Canchas" },
      { icon: "bi-cash-coin", label: "Ingresos" },
      { icon: "bi-person", label: "Perfil" },
    ],
    cliente: [
      { icon: "bi-search", label: "Explorar" },
      { icon: "bi-folder2-open", label: "Mis Canchas" },
      { icon: "bi-person", label: "Perfil" },
    ],
  };

  // --- Renderizar el menú según rol ---
  function updateMenu(rol) {
    menuContainer.innerHTML = "";
    
    if (menus[rol]) {
      menus[rol].forEach((item) => {
        const link = document.createElement("a");
        link.href = "#";
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

  // Renderizar menú según el rol actual
  updateMenu(rolUsuario);

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
