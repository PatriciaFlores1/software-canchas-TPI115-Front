// canchasAdmin.js

class CanchasManager {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.tabla = document.getElementById('cuerpo-tabla');
        this.loadingContainer = document.getElementById('loading-container');
        this.noDataMessage = document.getElementById('no-data-message');
        this.tablaContainer = document.querySelector('.table-responsive');
        
        this.init();
    }

    init() {
        this.cargarCanchas();
        this.agregarEventListeners();
    }

    async cargarCanchas() {
        try {
            this.mostrarLoading(true);
            
            const response = await fetch(`${this.apiUrl}/canchas`);
            const data = await response.json();

            if (data.success && data.data) {
                this.mostrarCanchas(data.data);
            } else {
                this.mostrarMensajeNoDatos();
            }
        } catch (error) {
            console.error('Error al cargar canchas:', error);
            this.mostrarError('Error al cargar las canchas');
        } finally {
            this.mostrarLoading(false);
        }
    }

    mostrarCanchas(canchas) {
        if (!canchas || canchas.length === 0) {
            this.mostrarMensajeNoDatos();
            return;
        }

        this.tabla.innerHTML = canchas.map(cancha => `
            <tr data-id="${cancha.id}">
                <td class="text-muted small">${cancha.id}</td>
                <td>${cancha.nombre}</td>
                <td>${cancha.deporte}</td>
                <td>${cancha.direccion}</td>
                <td>
                    <span class="badge ${cancha.estado ? 'bg-success' : 'bg-danger'}">
                        ${cancha.estado ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-icon btn-ver" data-id="${cancha.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-icon btn-editar" data-id="${cancha.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-icon btn-eliminar" data-id="${cancha.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.tablaContainer.classList.remove('d-none');
        this.noDataMessage.classList.add('d-none');
    }

    mostrarMensajeNoDatos() {
        this.tablaContainer.classList.add('d-none');
        this.noDataMessage.classList.remove('d-none');
    }

    mostrarLoading(mostrar) {
        if (mostrar) {
            this.loadingContainer.classList.remove('d-none');
            this.tablaContainer.classList.add('d-none');
            this.noDataMessage.classList.add('d-none');
        } else {
            this.loadingContainer.classList.add('d-none');
        }
    }

    mostrarError(mensaje) {
        console.error(mensaje);
        alert(mensaje);
    }

    agregarEventListeners() {
        // Evento para ver detalles
        this.tabla.addEventListener('click', (e) => {
            if (e.target.closest('.btn-ver')) {
                const id = e.target.closest('.btn-ver').dataset.id;
                this.verCancha(id);
            }
            
            if (e.target.closest('.btn-editar')) {
                const id = e.target.closest('.btn-editar').dataset.id;
                this.editarCancha(id);
            }
            
            if (e.target.closest('.btn-eliminar')) {
                const id = e.target.closest('.btn-eliminar').dataset.id;
                this.eliminarCancha(id);
            }
        });

        // Evento para agregar nueva cancha
        document.getElementById('btn-agregar-cancha').addEventListener('click', () => {
            this.mostrarFormularioCancha();
        });
    }

    async verCancha(id) {
        try {
            const response = await fetch(`${this.apiUrl}/canchas/${id}`);
            const data = await response.json();
            
            if (data.success) {
                this.mostrarModalDetalles(data.data);
            }
        } catch (error) {
            console.error('Error al cargar cancha:', error);
            this.mostrarError('Error al cargar los detalles de la cancha');
        }
    }

    async eliminarCancha(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/canchas/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                this.cargarCanchas(); // Recargar la tabla
                this.mostrarExito('Cancha eliminada correctamente');
            } else {
                this.mostrarError('Error al eliminar la cancha');
            }
        } catch (error) {
            console.error('Error al eliminar cancha:', error);
            this.mostrarError('Error al eliminar la cancha');
        }
    }

    mostrarExito(mensaje) {
        // Implementar notificación de éxito
        console.log(mensaje);
        alert(mensaje); // Temporal
    }

    // Métodos para editar y agregar
    mostrarFormularioCancha(cancha = null) {
        // Implementar modal de formulario
        console.log(cancha ? 'Editar cancha:' : 'Agregar cancha', cancha);
    }

    editarCancha(id) {
        // Cargar datos y mostrar formulario
        this.mostrarFormularioCancha({ id: id });
    }

    mostrarModalDetalles(cancha) {
        // Implementar modal de detalles
        console.log('Detalles de cancha:', cancha);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CanchasManager();
});