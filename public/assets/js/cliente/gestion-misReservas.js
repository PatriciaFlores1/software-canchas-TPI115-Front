// Mis Reservas - Cliente

(function () {
  const reservas = [
    {
      id: 1,
      cancha: 'Cancha Central de Tenis',
      deporte: 'Tenis',
      fechaISO: '2025-08-05',
      inicio: '09:00',
      fin: '10:00',
      imagen: '/public/assets/img/tenis.png',
      precioHora: 25,
      impuestos: 5,
    },
    {
      id: 2,
      cancha: 'Cancha Central de Futbol',
      deporte: 'Fútbol',
      fechaISO: '2025-07-05',
      inicio: '09:00',
      fin: '10:00',
      imagen: '/public/assets/img/futbol.png',
      precioHora: 25,
      impuestos: 5,
    },
  ];

  // Datos de cliente (demo).
  const cliente = {
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@example.com',
    telefono: '0000-0000',
  };

  let query = '';
  const $ = (id) => document.getElementById(id);

  function toES(iso) {
    const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const s = fmt.format(new Date(iso));
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function to12h(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = ((h + 11) % 12) + 1;
    return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}${ampm}`;
  }

  function currency(n) { return `$${Number(n || 0).toFixed(2)}`; }

  function template(r) {
    return `
      <div class="page-content p-3 d-flex gap-3 align-items-start">
        <img src="${r.imagen}" alt="${r.deporte}" style="width: 180px; height: 120px; object-fit: cover; border-radius: var(--border-radius); box-shadow: var(--shadow-sm);" />
        <div class="flex-grow-1">
          <h5 class="mb-1">${r.cancha}</h5>
          <div class="text-muted mb-2">${r.deporte}</div>
          <div class="mb-1"><strong>Fecha:</strong> ${toES(r.fechaISO)}</div>
          <div class="mb-2"><strong>Hora:</strong> ${to12h(r.inicio)} - ${to12h(r.fin)}</div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" data-action="detalle" data-id="${r.id}">Ver Detalles</button>
            <button class="btn btn-outline btn-sm" data-action="cancelar" data-id="${r.id}">Cancelar</button>
          </div>
        </div>
        <div class="ms-auto">
          <button class="btn btn-outline btn-sm" title="Descargar PDF" data-action="pdf" data-id="${r.id}"><i class="bi bi-download"></i></button>
        </div>
      </div>`;
  }

  function filtradas() {
    if (!query) return reservas;
    const q = query.toLowerCase();
    return reservas.filter((r) =>
      r.cancha.toLowerCase().includes(q) ||
      r.deporte.toLowerCase().includes(q) ||
      toES(r.fechaISO).toLowerCase().includes(q)
    );
  }

  function render() {
    const list = $('reservas-list');
    const items = filtradas();
    list.innerHTML = items.map(template).join('') || '<div class="text-muted">No tienes reservas.</div>';

    list.querySelectorAll('[data-action="detalle"]').forEach((b) => b.addEventListener('click', onDetalle));
    list.querySelectorAll('[data-action="cancelar"]').forEach((b) => b.addEventListener('click', onCancelar));
    list.querySelectorAll('[data-action="pdf"]').forEach((b) => b.addEventListener('click', onPDF));
  }

  function onDetalle(e) {
    const id = Number(e.currentTarget.getAttribute('data-id'));
    window.location.href = '/view/cliente/gestion-infoCancha.html?id=' + id;
  }

  function onCancelar(e) {
    const id = Number(e.currentTarget.getAttribute('data-id'));
    const i = reservas.findIndex((r) => r.id === id);
    if (i >= 0 && confirm('¿Deseas cancelar esta reserva?')) {
      reservas.splice(i, 1);
      render();
    }
  }

  function onPDF(e) {
    const id = Number(e.currentTarget.getAttribute('data-id'));
    const r = reservas.find((x) => x.id === id);
    if (!r) return;
    const subtotal = r.precioHora;
    const impuestos = r.impuestos;
    const total = subtotal + impuestos;
    const folio = `R-${r.fechaISO.replace(/-/g,'')}-${String(r.id).padStart(3,'0')}`;
    const now = new Date();
    const ahora = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(now);

    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Comprobante de Reserva ${folio}</title>
        <style>
          :root{ --verm:#333A56; --sun:#52658F; --clean:#F4F5F7; --white:#FFFFFF; }
          *{ box-sizing: border-box; }
          body{ margin:0; background:var(--clean); color:var(--verm); font-family:'Nunito Sans', Arial, sans-serif; }
          .container{ width: 850px; margin: 24px auto; background:var(--white); border-radius:12px; box-shadow: 0 6px 18px rgba(0,0,0,.12); padding: 28px; }
          .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 18px; }
          .brand{ display:flex; align-items:center; gap:10px; }
          .brand img{ width:42px; height:42px; }
          .brand h1{ font-size:1.15rem; margin:0; color:var(--verm); }
          .title{ text-align:right; }
          .title h2{ margin:0; font-size:1.25rem; }
          .meta{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin: 16px 0 10px; }
          .card{ border:1px solid #e0e4ef; border-radius:10px; padding:12px; }
          .section h3{ font-size:1rem; margin: 18px 0 8px; border-bottom:2px solid var(--sun); padding-bottom:6px; }
          .row{ display:flex; gap:12px; }
          .row .col{ flex:1; }
          .thumb{ border-radius:10px; width:240px; height:160px; object-fit:cover; box-shadow:0 2px 6px rgba(0,0,0,.06); }
          table{ width:100%; border-collapse:separate; border-spacing:0; margin-top:6px; }
          th,td{ padding:10px 12px; border-bottom:1px solid #e0e4ef; text-align:left; }
          tfoot td{ font-weight:700; }
          .right{ text-align:right; }
          .note{ font-size:.9rem; color:#5b6279; margin-top:12px; }
          .foot{ text-align:center; font-size:.85rem; color:#7b8197; margin-top: 18px; }
          @media print{ body{ background:white; } .container{ box-shadow:none; margin:0; width:auto; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">
              <img src="/public/assets/img/logo.png" alt="Logo"/>
              <h1>Canchas SV</h1>
            </div>
            <div class="title">
              <h2>Comprobante de Reserva</h2>
              <div>Folio: <strong>${folio}</strong></div>
              <div>Emitido: ${ahora}</div>
            </div>
          </div>

          <div class="meta">
            <div class="card">
              <strong>Datos del Cliente</strong>
              <div>Nombre: ${cliente.nombre} ${cliente.apellido}</div>
              <div>Correo: ${cliente.correo}</div>
              <div>Teléfono: ${cliente.telefono}</div>
            </div>
            <div class="card">
              <strong>Detalle de Reserva</strong>
              <div>Cancha: ${r.cancha}</div>
              <div>Fecha: ${toES(r.fechaISO)}</div>
              <div>Hora: ${to12h(r.inicio)} - ${to12h(r.fin)}</div>
              <div>Estado: Pagado</div>
              <div>Método: PayPal Sandbox</div>
            </div>
          </div>

          <div class="section">
            <h3>Resumen</h3>
            <div class="row">
              <img class="thumb" src="${r.imagen}" alt="Imagen"/>
              <div class="col">
                <table>
                  <thead>
                    <tr><th>Descripción</th><th class="right">Cant.</th><th class="right">Precio</th><th class="right">Importe</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Renta de ${r.deporte} - ${r.cancha} (${to12h(r.inicio)}-${to12h(r.fin)})</td><td class="right">1</td><td class="right">${currency(subtotal)}</td><td class="right">${currency(subtotal)}</td></tr>
                  </tbody>
                  <tfoot>
                    <tr><td colspan="3" class="right">SubTotal</td><td class="right">${currency(subtotal)}</td></tr>
                    <tr><td colspan="3" class="right">Impuestos</td><td class="right">${currency(impuestos)}</td></tr>
                    <tr><td colspan="3" class="right">Total</td><td class="right">${currency(total)}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="note">Documento generado electrónicamente. No requiere firma. Para consultas, comuníquese con soporte de Canchas SV.</div>
          </div>

          <div class="foot">Gracias por preferirnos.</div>
        </div>
        <script>window.onload = function(){ window.print(); }<\/script>
      </body>
      </html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  }

  function bindSearch() {
    const b = $('buscar');
    if (!b) return;
    b.addEventListener('input', (e) => { query = e.target.value || ''; render(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindSearch();
    render();
  });
})();
