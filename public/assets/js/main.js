// Cargar dinámicamente el navbar, footer y sidebar
document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar-container");
  const footerContainer = document.getElementById("footer-container");
  const sidebarContainer = document.getElementById("sidebar-container");

  // NAVBAR
  if (navbarContainer) {
    fetch("/public/components/navbar.html")
      .then((response) => response.text())
      .then((html) => (navbarContainer.innerHTML = html))
      .finally(() => {
        const script = document.createElement("script");
        script.src = "/public/assets/js/navbar.js";
        document.body.appendChild(script);
      });
  }

  // FOOTER
  if (footerContainer) {
    fetch("/public/components/footer.html")
      .then((response) => response.text())
      .then((html) => (footerContainer.innerHTML = html));
  }

  // SIDEBAR
  if (sidebarContainer) {
    fetch("/public/components/sidebar.html")
      .then((res) => res.text())
      .then((html) => {
        sidebarContainer.innerHTML = html;

        const sidebar = sidebarContainer.querySelector(".sidebar");
        const mainContent = document.querySelector(".main-content");
        if (sidebar && mainContent) {
          document.body.insertBefore(sidebar, mainContent);
        }

        const script = document.createElement("script");
        script.src = "/public/assets/js/sidebar.js";
        document.body.appendChild(script);
      })
      .catch((err) => console.error("Error cargando sidebar:", err));
  }
});
