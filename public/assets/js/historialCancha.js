// ====================================================
// HISTORIAL DE HORARIOS DE CANCHA
// ====================================================

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("canchaHorariosContainer");
  const tituloCancha = document.getElementById("canchaTitulo");

  try {
    // Ejemplo de ID de cancha 
    const canchaId = 1;

    // Llamada a la API
    // const res = await fetch(`http://localhost:8000/api/canchas/${canchaId}/horarios`);
    // const data = await res.json();

    // Datos simulados
    const data = {
      cancha: "Cancha Central de Tenis",
      horarios: [
        { dia: "Lunes", fecha: "2025-08-05", hora_inicio: "09:00 am", hora_fin: "10:00 am" },
        { dia: "Lunes", fecha: "2025-08-05", hora_inicio: "10:00 am", hora_fin: "11:00 am" },
        { dia: "Martes", fecha: "2025-08-06", hora_inicio: "08:00 am", hora_fin: "09:00 am" },
        { dia: "Jueves", fecha: "2025-08-08", hora_inicio: "10:00 am", hora_fin: "11:00 am" }
      ]
    };

    // Actualiza el título con el nombre de la cancha
    tituloCancha.textContent = data.cancha;

    // Agrupa los horarios por día
    const diasAgrupados = {};
    data.horarios.forEach(h => {
      if (!diasAgrupados[h.dia]) diasAgrupados[h.dia] = [];
      diasAgrupados[h.dia].push(h);
    });

    // Limpia el contenedor
    container.innerHTML = "";

    // Genera dinámicamente las tarjetas de cada día
    Object.keys(diasAgrupados).forEach(dia => {
      const daySection = document.createElement("div");
      daySection.classList.add("day-section", "mb-3");

      // Encabezado del día
      let dayHTML = `<h5 class="day-title">${dia}</h5>`;

      // Horarios de ese día
      diasAgrupados[dia].forEach(h => {
        const fechaFormateada = new Date(h.fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });
        dayHTML += `
          <div class="horario-item d-flex justify-content-between align-items-center">
            <span class="text-muted">${fechaFormateada}</span>
            <span><strong>Hora:</strong> ${h.hora_inicio} - ${h.hora_fin}</span>
          </div>
        `;
      });

      // Inserta los horarios del día
      daySection.innerHTML = dayHTML;
      container.appendChild(daySection);
    });

  } catch (error) {
    console.error("Error al cargar horarios:", error);
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        No se pudieron cargar los horarios. Intenta más tarde.
      </div>
    `;
  }
});
