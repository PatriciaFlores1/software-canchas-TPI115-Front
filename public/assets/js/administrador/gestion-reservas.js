// Gestión de Reservas
// -------------------------------------------------
(function () {
  // DOM
  const $tablaBody = document.getElementById("tablaReservas");
  const $busqueda = document.getElementById("busqueda");
  const $fecha = document.getElementById("fechaFiltro");
  const $btnFiltrar = document.getElementById("btnFiltrar");
  const $btnAnt = document.getElementById("btnAnterior");
  const $btnSig = document.getElementById("btnSiguiente");
  const $info = document.getElementById("infoResultados");

  if (
    !$tablaBody || !$busqueda || !$fecha ||
    !$btnFiltrar || !$btnAnt || !$btnSig || !$info
  ) return;

  // ---- Datos (mock). reemplazar por fetch('/api/reservas') ----
  let reservas = [
    { cancha: "Cancha Rápida 1", cliente: "Juan Pérez",   fecha: "2025-05-10", hora: "18:00", deporte: "Fútbol",     precio: 25, estado: "Confirmada" },
    { cancha: "Tenis Central",   cliente: "Ana Gómez",    fecha: "2025-05-11", hora: "10:00", deporte: "Tenis",      precio: 30, estado: "Pendiente" },
    { cancha: "Pádel Pro",       cliente: "Carlos Ruiz",  fecha: "2025-05-12", hora: "20:00", deporte: "Pádel",      precio: 20, estado: "Cancelada" },
    { cancha: "Basket Arena",    cliente: "Paty Flores",  fecha: "2025-05-13", hora: "16:00", deporte: "Baloncesto", precio: 35, estado: "Cancelada" },
    { cancha: "Cancha Dos",      cliente: "Carlos Enri",  fecha: "2025-06-13", hora: "17:00", deporte: "Fútbol",     precio: 25, estado: "Confirmada" },
  ];

  // ---- Estado de paginación y filtro ----
  const state = {
    pagina: 1,
    porPagina: 5,
    filtradas: [...reservas]
  };

  // ---- Helpers ----
  function toBadgeClass(estado) {
    const e = (estado || "").toLowerCase();
    if (e === "confirmada") return "badge-confirmada";
    if (e === "pendiente")  return "badge-pendiente";
    if (e === "cancelada")  return "badge-cancelada";
    return "badge-estado";
  }

  function pintarTabla() {
    const { pagina, porPagina, filtradas } = state;
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const page = filtradas.slice(inicio, fin);

    $tablaBody.innerHTML = "";

    if (!page.length) {
      $tablaBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-secondary py-4">
            No hay resultados para los filtros aplicados.
          </td>
        </tr>`;
    } else {
      page.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.cancha}</td>
          <td>${r.cliente}</td>
          <td>${r.fecha}</td>
          <td>${r.hora}</td>
          <td>${r.deporte}</td>
          <td>$${Number(r.precio).toFixed(2)}</td>
          <td><span class="badge ${toBadgeClass(r.estado)}">${r.estado}</span></td>
          <td class="text-center">
            <button type="button" class="btn btn-outline-light btn-sm" title="Ver detalles" data-action="ver">
              <i class="bi bi-eye"></i>
            </button>
          </td>
        `;
        $tablaBody.appendChild(tr);
      });
    }

    $info.textContent = `Mostrando ${filtradas.length ? (inicio + 1) : 0}-${Math.min(fin, filtradas.length)} de ${filtradas.length} resultados`;
    $btnAnt.disabled = pagina === 1;
    $btnSig.disabled = fin >= filtradas.length;
  }

  function aplicarFiltros() {
    const texto = $busqueda.value.trim().toLowerCase();
    const fecha = $fecha.value;

    state.filtradas = reservas.filter(r => {
      const coincideTexto =
        r.cancha.toLowerCase().includes(texto) ||
        r.cliente.toLowerCase().includes(texto);
      const coincideFecha = !fecha || r.fecha === fecha;
      return coincideTexto && coincideFecha;
    });

    state.pagina = 1;
    pintarTabla();
  }

  function toggleLoading(show) {
    if (show) {
      $tablaBody.innerHTML = `
        <tr>
          <td colspan="8" class="py-4">
            <div class="reservas-skeleton"></div>
          </td>
        </tr>`;
    }
  }

  // ---- Eventos ----
  $btnFiltrar.addEventListener("click", aplicarFiltros);
  $busqueda.addEventListener("input", aplicarFiltros);
  $fecha.addEventListener("change", aplicarFiltros);

  $btnAnt.addEventListener("click", () => {
    if (state.pagina > 1) {
      state.pagina--;
      pintarTabla();
    }
  });

  $btnSig.addEventListener("click", () => {
    const max = Math.ceil(state.filtradas.length / state.porPagina);
    if (state.pagina < max) {
      state.pagina++;
      pintarTabla();
    }
  });

  // Delegación para acciones (ver detalles, etc.)
  $tablaBody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "ver") {
      console.log("Ver detalle de la reserva");
    }
  });

  aplicarFiltros();
})();
