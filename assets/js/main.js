// Cargar dinámicamente el navbar, footer y sidebar
document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar-container");
  const footerContainer = document.getElementById("footer-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  // Detectar profundidad actual del archivo
  const depth = window.location.pathname.split("/").length;
  let relativePath = "./";

  if (window.location.pathname.includes("/pages/")) {
    // Si estamos en /pages/rol/... subimos dos niveles
    relativePath = depth >= 4 ? "../../" : "../";
  }

  // NAVBAR
  if (navbarContainer) {
    fetch(relativePath + "components/navbar.html")
      .then(response => response.text())
      .then(html => (navbarContainer.innerHTML = html));
  }

  // FOOTER
  if (footerContainer) {
    fetch(relativePath + "components/footer.html")
      .then(response => response.text())
      .then(html => (footerContainer.innerHTML = html));
  }

  // SIDEBAR
  if (sidebarContainer) {
    fetch(relativePath + "components/sidebar.html")
      .then(res => res.text())
      .then(html => {
        sidebarContainer.innerHTML = html;

        const sidebar = sidebarContainer.querySelector(".sidebar");
        const mainContent = document.querySelector(".main-content");
        if (sidebar && mainContent) {
          document.body.insertBefore(sidebar, mainContent);
        }

        // Cargar script del sidebar después del HTML
        const script = document.createElement("script");
        script.src = relativePath + "assets/js/sidebar.js";
        document.body.appendChild(script);
      })
      .catch(err => console.error("Error cargando sidebar:", err));
  }
});
