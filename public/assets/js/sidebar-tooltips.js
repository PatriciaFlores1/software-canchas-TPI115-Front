// sidebar-tooltips.js
// Inicializa tooltips de Bootstrap para los items del sidebar y los activa/desactiva según el estado del sidebar

(function () {
  function setup() {
    if (!window.bootstrap || !bootstrap.Tooltip) return;
    const links = document.querySelectorAll('#sidebar-menu [data-bs-toggle="tooltip"]');
    // limpiar anteriores
    if (window.__sidebarTooltips && Array.isArray(window.__sidebarTooltips)) {
      window.__sidebarTooltips.forEach((t) => { try { t.dispose && t.dispose(); } catch {} });
    }
    window.__sidebarTooltips = Array.from(links).map((el) => new bootstrap.Tooltip(el, { placement: 'right', container: 'body' }));
    applyState();
  }

  function applyState() {
    const sidebar = document.querySelector('.sidebar');
    const collapsed = sidebar && sidebar.classList.contains('collapsed');
    const isMobile = window.innerWidth <= 768;
    (window.__sidebarTooltips || []).forEach((t) => { try { (collapsed && !isMobile) ? t.enable() : t.disable(); } catch {} });
  }

  // Observa cambios de clase en el sidebar para activar/desactivar tooltips
  function observe() {
    try {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      const obs = new MutationObserver(applyState);
      obs.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Sidebar puede inyectarse dinámicamente; dar un pequeño retraso para asegurar carga
    setTimeout(() => { setup(); observe(); }, 50);
  });

  window.addEventListener('resize', applyState);
})();

