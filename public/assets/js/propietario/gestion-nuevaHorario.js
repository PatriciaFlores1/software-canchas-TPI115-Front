// Gestión de nueva horario por cancha (Propietario)

(function () {
  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const horarios = [];
  let seq = 1;

  const $ = (id) => document.getElementById(id);

  function to12h(hhmm) {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hh = ((h + 11) % 12) + 1;
    return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function validate(dia, inicio, fin) {
    const fb = $('form-feedback');
    const errors = [];
    if (!dia) errors.push('Seleccione el día.');
    if (!inicio) errors.push('Defina la hora de inicio.');
    if (!fin) errors.push('Defina la hora de fin.');
    if (inicio && fin && inicio >= fin) errors.push('La hora de inicio debe ser menor que la hora de fin.');
    fb.textContent = errors[0] || '';
    return errors.length === 0;
  }

  async function addHorario() {
    const dia = $('dia').value;
    const inicio = $('inicio').value;
    const fin = $('fin').value;
    if (!validate(dia, inicio, fin)) return;

    const idCancha = getQueryParam('id_cancha');
    if (idCancha) {
      // Guardar inmediatamente en el servidor (un solo horario)
      const payload = {
        id_cancha: Number(idCancha),
        dia: dia,
        inicio: inicio,
        fin: fin
      };
      try {
        const res = await fetch('/api/v1/horarios', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (res.ok) {
          // json.data puede ser un array de objetos creados
          const created = Array.isArray(json.data) ? json.data[0] : json.data;
          if (created) {
            // Normalizar y agregar a la lista local
            horarios.push({ id: created.id_horario || created.id || created.id_horario, id_horario: created.id_horario || created.id || null, dia: created.dia_semana || dia, inicio: created.hora_inicio || inicio, fin: created.hora_fin || fin });
            const fb = $('form-feedback');
            if (fb) fb.textContent = json.message || 'Horario guardado';
          }
        } else {
          const fb = $('form-feedback');
          if (fb) fb.textContent = json.message || json.error || 'Error al guardar horario';
          // fallback: agregar localmente para no perder la entrada
          horarios.push({ id: 'local-' + (seq++), dia, inicio, fin });
        }
      } catch (err) {
        console.error('Error guardando horario', err);
        const fb = $('form-feedback');
        if (fb) fb.textContent = 'Error de comunicación';
        horarios.push({ id: 'local-' + (seq++), dia, inicio, fin });
      }
    } else {
      // No hay id_cancha en la URL: sólo guardar localmente y guardar en el batch al pulsar Guardar
      horarios.push({ id: 'local-' + (seq++), dia, inicio, fin });
    }

    $('inicio').value = '';
    $('fin').value = '';
    render();
  }

  async function removeHorario(id) {
    // id may be local string like 'local-1' or numeric server id
    const idStr = String(id);
    const idx = horarios.findIndex((h) => String(h.id) === idStr || String(h.id_horario) === idStr);
    if (idx < 0) return;

    const item = horarios[idx];
    // If item has a server id (id_horario numeric), call DELETE
    const serverId = item.id_horario || (Number.isFinite(Number(idStr)) ? Number(idStr) : null);
    if (serverId) {
      try {
        const res = await fetch('/api/v1/horarios?id_horario=' + encodeURIComponent(serverId), { method: 'DELETE', credentials: 'same-origin' });
        const json = await res.json();
        if (!res.ok) {
          const fb = $('form-feedback');
          if (fb) fb.textContent = json.message || 'No se pudo eliminar el horario';
          return;
        }
      } catch (err) {
        console.error('Error deleting horario', err);
        const fb = $('form-feedback');
        if (fb) fb.textContent = 'Error de comunicación';
        return;
      }
    }

    // Remove locally
    horarios.splice(idx, 1);
    render();
  }

  function groupByDia() {
    const map = new Map();
    diasOrden.forEach((d) => map.set(d, []));
    horarios.forEach((h) => {
      if (!map.has(h.dia)) map.set(h.dia, []);
      map.get(h.dia).push(h);
    });
    return map;
  }

  function renderAccordion() {
    const container = $('horarios-accordion');
    if (!container) return;
    const grupos = groupByDia();
    const blocks = diasOrden.map((dia, i) => {
      const id = `g-${i}`;
      const items = (grupos.get(dia) || [])
        .map(
          (h) => `
          <div class="card mb-3">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div class="text-muted">Horario establecido</div>
              <div><strong>Hora:</strong> ${to12h(h.inicio)} - ${to12h(h.fin)}</div>
            </div>
          </div>`
        )
        .join('');
      const body = items || '<div class="text-muted">Sin horarios</div>';
      return `
        <div class="accordion-item">
          <h2 class="accordion-header" id="h-${id}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#c-${id}" aria-expanded="false" aria-controls="c-${id}">
              ${dia}
            </button>
          </h2>
          <div id="c-${id}" class="accordion-collapse collapse" aria-labelledby="h-${id}" data-bs-parent="#horarios-accordion">
            <div class="accordion-body">
              ${body}
            </div>
          </div>
        </div>`;
    });
    container.innerHTML = blocks.join('');
  }

  function renderTable() {
    const tbody = $('tabla-horarios');
    if (!tbody) return;
    const rows = horarios
      .map(
        (h) => `
        <tr>
          <td>${h.dia}</td>
          <td>${to12h(h.inicio)}</td>
          <td>${to12h(h.fin)}</td>
          <td class="text-end">
            <button class="btn btn-outline btn-sm" data-id="${h.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`
      )
      .join('');
    tbody.innerHTML = rows || '<tr><td colspan="4" class="text-center py-4 text-muted">Sin horarios agregados</td></tr>';

    tbody.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => removeHorario(btn.getAttribute('data-id')));
    });
  }

  function render() {
    renderAccordion();
    renderTable();
  }

  function bind() {
    const back = $('btn-back');
    const add = $('btn-add');
    const guardar = $('btn-guardar');
    const cancelar = $('btn-cancelar');
    if (back) back.addEventListener('click', () => history.back());
    if (cancelar) cancelar.addEventListener('click', () => history.back());
    if (add) add.addEventListener('click', addHorario);
    if (guardar) guardar.addEventListener('click', async () => {
      // Enviar horarios al backend
      const idCancha = getQueryParam('id_cancha') || null;
      if (!idCancha) {
        alert('Falta el id de la cancha en la URL');
        return;
      }
      if (!horarios.length) {
        alert('No hay horarios para guardar');
        return;
      }

      const payload = {
        id_cancha: Number(idCancha),
        horarios: horarios.map(h => ({ dia_semana: h.dia, hora_inicio: h.inicio, hora_fin: h.fin }))
      };

      try {
        const res = await fetch('/api/v1/horarios', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (res.ok) {
          // éxito: limpiar lista y notificar
          horarios.length = 0;
          seq = 1;
          render();
          const fb = $('form-feedback');
          if (fb) fb.textContent = json.message || 'Horarios guardados correctamente';
        } else {
          const fb = $('form-feedback');
          if (fb) fb.textContent = json.message || json.error || 'Error al guardar horarios';
        }
      } catch (err) {
        console.error('Error guardando horarios', err);
        const fb = $('form-feedback');
        if (fb) fb.textContent = 'Error de comunicación';
      }
    });
  }

  function getQueryParam(name) {
    const qs = window.location.search.substring(1);
    const params = new URLSearchParams(qs);
    return params.get(name);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Si viene id_cancha en la URL, cargar nombre y mostrarlo
    const idCancha = getQueryParam('id_cancha');
    if (idCancha) {
      fetch('/api/v1/canchas/detalle?id_cancha=' + encodeURIComponent(idCancha), { credentials: 'same-origin' })
        .then(r => r.json())
        .then(j => {
          const d = j.data || j;
          const titulo = document.getElementById('titulo-cancha');
          if (titulo && d.nombre) titulo.textContent = d.nombre;
        }).catch(() => {/* ignore */});
      // Cargar horarios existentes desde API
      fetch('/api/v1/horarios?id_cancha=' + encodeURIComponent(idCancha), { credentials: 'same-origin' })
        .then(r => r.json())
        .then(j => {
          const items = j.data || [];
          // Normalizar y añadir al estado local
          items.forEach(it => {
            horarios.push({ id: it.id_horario || it.id || it.id_horario, id_horario: it.id_horario || it.id || null, dia: it.dia_semana || it.dia, inicio: it.hora_inicio || it.inicio, fin: it.hora_fin || it.fin });
          });
          render();
        }).catch(() => {/* ignore */});
    }

    bind();
    render();
  });
})();

