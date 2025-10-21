// estadisticasAdmin.js
class EstadisticasManager {
  constructor() {
    // URL base del backend
    this.apiUrl = 'http://localhost:3000/api';

    // Referencias HTML
    this.cards = document.querySelectorAll('.summary-card');
    this.chartContainer = document.getElementById('chart-container');
    this.tableBody = document.getElementById('tabla-body');
    this.chart = null;

    this.init();
  }

  async init() {
    await this.cargarResumen();
    await this.cargarGrafico();
    await this.cargarHistorial();
  }

  /* ================================
     RESUMEN GENERAL (tarjetas)
  ================================= */
  async cargarResumen() {
    try {
      const res = await fetch(`${this.apiUrl}/estadisticas/resumen`);
      const data = await res.json();

      if (data.success && data.data) {
        // Reemplaza el spinner por los valores obtenidos
        const valores = [
          data.data.total_canchas,
          data.data.total_usuarios,
          data.data.total_reservas
        ];

        this.cards.forEach((card, i) => {
        const body = card.querySelector('.card-body');
        const titulo = body.querySelector('h6') ? body.querySelector('h6').textContent : '';
        body.innerHTML = `
            <h6>${titulo}</h6>
            <h3 class="fw-bold">${valores[i]}</h3>
        `;
        });
      } else {
        this.mostrarErrorTarjetas('No se pudieron cargar los datos.');
      }
    } catch (error) {
      console.error('Error al cargar resumen:', error);
      this.mostrarErrorTarjetas('Error al cargar los datos.');
    }
  }

  mostrarErrorTarjetas(mensaje) {
    this.cards.forEach(card => {
      const body = card.querySelector('.card-body');
      body.innerHTML = `
        <h6>${body.querySelector('h6').textContent}</h6>
        <p class="text-danger small mt-2">${mensaje}</p>
      `;
    });
  }

  /* ================================
     GRÁFICO DE RESERVAS
  ================================= */
  async cargarGrafico() {
    try {
      const res = await fetch(`${this.apiUrl}/estadisticas/reservas-mensuales`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        // Reemplazar loader por el canvas
        this.chartContainer.innerHTML = `
          <h6 class="mb-3">Resumen de Reservas Por Mes</h6>
          <canvas id="chartReservas"></canvas>
        `;
        const chartCanvas = document.getElementById('chartReservas');

        const labels = data.data.map(item => item.mes);
        const valores = data.data.map(item => item.total);

        if (this.chart) this.chart.destroy();

        this.chart = new Chart(chartCanvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Reservas por mes',
              data: valores,
              backgroundColor: 'rgba(255, 193, 7, 0.8)',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        });
      } else {
        this.chartContainer.innerHTML = `
          <h6 class="mb-3">Resumen de Reservas Por Mes</h6>
          <p class="text-secondary small mb-0 py-4">No hay datos disponibles</p>
        `;
      }
    } catch (error) {
      console.error('Error al cargar gráfico:', error);
      this.chartContainer.innerHTML = `
        <h6 class="mb-3">Resumen de Reservas Por Mes</h6>
        <p class="text-danger small mb-0 py-4">Error al cargar gráfico</p>
      `;
    }
  }

  /* ================================
     HISTORIAL DE RESERVAS (tabla)
  ================================= */
  async cargarHistorial() {
    try {
      const res = await fetch(`${this.apiUrl}/reservas/historial`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        this.tableBody.innerHTML = data.data.map(item => `
          <tr>
            <td>${item.cancha}</td>
            <td>${item.fecha}</td>
            <td>${item.hora_inicio} - ${item.hora_fin}</td>
            <td>${item.cliente}</td>
            <td>
              <span class="badge ${item.estado === 'Reserva' ? 'bg-success' : 'bg-danger'}">
                ${item.estado}
              </span>
            </td>
          </tr>
        `).join('');
      } else {
        this.tableBody.innerHTML = `
          <tr><td colspan="5" class="text-center text-secondary py-3">
          No hay registros disponibles
          </td></tr>`;
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      this.tableBody.innerHTML = `
        <tr><td colspan="5" class="text-center text-danger py-3">
        Error al cargar datos
        </td></tr>`;
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => new EstadisticasManager());
