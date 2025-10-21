class DetalleCanchaManager {
  constructor() {
    this.apiUrl = 'http://localhost:3000/api/canchas';
    this.loadingContainer = document.getElementById('loading-container');
    this.contentContainer = document.getElementById('detalle-content');

    // Campos
    this.nombre = document.getElementById('nombre-cancha');
    this.deporte = document.getElementById('tipo-deporte');
    this.direccion = document.getElementById('direccion');
    this.descripcion = document.getElementById('descripcion');
    this.condiciones = document.getElementById('condiciones');
    this.imagenesContainer = document.getElementById('imagenes-cancha');

    this.init();
  }

  async init() {
    const id = this.obtenerIdDesdeURL();
    if (!id) {
      this.mostrarError('No se encontró el ID de la cancha.');
      return;
    }

    await this.cargarDetalles(id);
  }

  obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  async cargarDetalles(id) {
    try {
      const res = await fetch(`${this.apiUrl}/${id}`);
      const data = await res.json();

      if (!data.success || !data.data) {
        this.mostrarError('No se encontraron detalles para esta cancha.');
        return;
      }

      const cancha = data.data;

      // Mostrar datos
      this.nombre.value = cancha.nombre || '';
      this.deporte.value = cancha.deporte || '';
      this.direccion.value = cancha.direccion || '';
      this.descripcion.value = cancha.descripcion || 'Sin descripción';
      this.condiciones.value = cancha.condiciones || 'Sin condiciones';

      // Cargar imágenes dinámicamente
      this.cargarImagenes(cancha.imagenes || []);

      // Mostrar contenido
      this.mostrarContenido();
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      this.mostrarError('Error al conectar con el servidor.');
    }
  }

  cargarImagenes(imagenes) {
    if (imagenes.length === 0) {
      this.imagenesContainer.innerHTML = `
        <div class="carousel-item active">
          <img src="/public/assets/img/no-image.png" class="d-block w-100" alt="Sin imagen disponible">
        </div>`;
      return;
    }

    this.imagenesContainer.innerHTML = imagenes
      .map((img, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <img src="${img.url}" class="d-block w-100" alt="Imagen ${index + 1}">
        </div>
      `)
      .join('');
  }

  mostrarContenido() {
    this.loadingContainer.classList.add('d-none');
    this.contentContainer.classList.remove('d-none');
  }

  mostrarError(mensaje) {
    this.loadingContainer.innerHTML = `
      <p class="text-danger fw-semibold mt-4">${mensaje}</p>
      <button class="btn btn-outline-secondary mt-3" onclick="window.history.back()">Regresar</button>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => new DetalleCanchaManager());
