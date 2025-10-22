// Gestión de Detalles de Cancha

(function () {
  // Datos simulados
  const detalle = {
    nombre: 'Cancha de Fútbol 5 "El Campeón"',
    deporte: 'Fútbol',
    direccion: 'Avenida del Deporte 456, Ciudad',
    descripcion:
      'Campo de césped sintético con iluminación nocturna y vestuarios. Ubicado en zona céntrica con parqueo disponible.',
    condiciones:
      'Se requiere puntualidad. Uso de tacos de goma. Cancelaciones con 12 horas de anticipación.',
  };

  const horarios = [
    { dia: 'Lunes', apertura: '07:00', cierre: '21:00', precio: '$12', estado: 'Disponible' },
    { dia: 'Martes', apertura: '07:00', cierre: '21:00', precio: '$12', estado: 'Disponible' },
    { dia: 'Miércoles', apertura: '07:00', cierre: '21:00', precio: '$12', estado: 'Disponible' },
    { dia: 'Jueves', apertura: '07:00', cierre: '21:00', precio: '$12', estado: 'Disponible' },
    { dia: 'Viernes', apertura: '07:00', cierre: '23:00', precio: '$15', estado: 'Disponible' },
    { dia: 'Sábado', apertura: '08:00', cierre: '23:00', precio: '$18', estado: 'Alta demanda' },
    { dia: 'Domingo', apertura: '08:00', cierre: '20:00', precio: '$15', estado: 'Mantenimiento' },
  ];

  function badgeEstado(h) {
    if (h.estado === 'Disponible') return '<span class="badge badge-success">Disponible</span>';
    if (h.estado === 'Alta demanda') return '<span class="badge badge-warning">Alta demanda</span>';
    return '<span class="badge badge-danger">Mantenimiento</span>';
  }

  function renderForm() {
    const $ = (id) => document.getElementById(id);
    const nombre = $('input-nombre');
    const deporte = $('select-deporte');
    const direccion = $('input-direccion');
    const descripcion = $('input-descripcion');
    const condiciones = $('input-condiciones');

    if (nombre) nombre.value = detalle.nombre;
    if (deporte) deporte.value = detalle.deporte;
    if (direccion) direccion.value = detalle.direccion;
    if (descripcion) descripcion.value = detalle.descripcion;
    if (condiciones) condiciones.value = detalle.condiciones;
  }

  function renderHorarios() {
    const tbody = document.getElementById('tabla-horarios');
    if (!tbody) return;
    tbody.innerHTML = horarios
      .map(
        (h) => `
        <tr>
          <td>${h.dia}</td>
          <td>${h.apertura}</td>
          <td>${h.cierre}</td>
          <td>${h.precio}</td>
          <td class="text-end">${badgeEstado(h)}</td>
        </tr>`
      )
      .join('');
  }

  // Acciones
  function bind() {
    const btnBack = document.getElementById('btn-regresar');
    if (btnBack) btnBack.addEventListener('click', () => history.back());
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderForm();
    renderHorarios();
    bind();

    const carouselEl = document.getElementById('galeriaCancha');
    const counterEl = document.getElementById('carousel-counter');
    if (carouselEl && counterEl) {
      const total = carouselEl.querySelectorAll('.carousel-item').length;
      const update = (toIndex) => {
        const current = Number(toIndex) + 1;
        counterEl.textContent = `${current} / ${total}`;
      };

      carouselEl.addEventListener('slide.bs.carousel', (e) => {
        if (typeof e.to !== 'undefined') update(e.to);
      });

      // Valor inicial
      const activeIndex = Array.from(carouselEl.querySelectorAll('.carousel-item'))
        .findIndex((el) => el.classList.contains('active'));
      if (activeIndex >= 0) update(activeIndex);
    }
  });
})();
