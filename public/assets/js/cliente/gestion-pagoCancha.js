// Pago de Cancha - Cliente

(function () {
  const reserva = {
    cancha: 'Cancha Central de Tenis',
    fechaISO: '2025-08-05',
    duracion: '1 hora',
    hora: '09:00 - 10:00',
    imagen: '/public/assets/img/tenis.png',
    precioHora: 25.0,
    impuestos: 5.0,
  };

  const usuario = {
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@example.com',
    telefono: '0000-0000',
  };

  const $ = (id) => document.getElementById(id);
  const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

  function toES(dateISO) {
    const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const s = fmt.format(new Date(dateISO));
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function renderResumen() {
    $('resumen-imagen').src = reserva.imagen;
    $('resumen-cancha').textContent = reserva.cancha;
    $('resumen-fecha').textContent = toES(reserva.fechaISO);
    $('resumen-duracion').textContent = reserva.duracion;
    $('resumen-hora').textContent = reserva.hora;
  }

  function renderUsuario() {
    $('u-nombre').value = usuario.nombre;
    $('u-apellido').value = usuario.apellido;
    $('u-correo').value = usuario.correo;
    $('u-telefono').value = usuario.telefono;
  }

  function renderTotales() {
    const subtotal = reserva.precioHora;
    const impuestos = reserva.impuestos;
    const total = subtotal + impuestos;
    $('p-subtotal').textContent = currency(subtotal);
    $('p-impuestos').textContent = currency(impuestos);
    $('p-total').textContent = currency(total);
    return total;
  }

  function bindConfirm(total) {
    const btn = $('btn-confirmar');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Si está Paypal, forzamos click al botón interno; si no, mostramos confirmación demo
      const paypalBtns = document.querySelector('#paypal-button-container iframe');
      if (paypalBtns) {
        alert('Puedes completar el pago desde el módulo de PayPal integrado.');
      } else {
        alert('Pago simulado por $' + total.toFixed(2));
      }
    });
  }

  let paypalRendered = false;
  function renderPayPal(total) {
    const container = document.getElementById('paypal-button-container');
    const fallback = document.getElementById('paypal-fallback');
    if (!container) return;

    if (paypalRendered) {
      container.style.display = 'block';
      return;
    }

    if (window.paypal && typeof window.paypal.Buttons === 'function') {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [{ amount: { value: total.toFixed(2) } }],
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function () {
            alert('Pago completado. ¡Gracias por tu reserva!');
          });
        },
        onError: function () {
          if (fallback) fallback.style.display = 'block';
        },
      }).render('#paypal-button-container');
      paypalRendered = true;
      container.style.display = 'block';
    } else {
      if (fallback) fallback.style.display = 'block';
    }
  }

  function bindPaymentActivation(total) {
    const opt = document.getElementById('opt-paypal');
    const radio = document.getElementById('p-paypal');
    const container = document.getElementById('paypal-button-container');
    if (!opt || !radio) return;

    const activate = () => {
      radio.checked = true;
      opt.classList.add('active');
      opt.setAttribute('aria-pressed', 'true');
      renderPayPal(total);
    };
    const deactivate = () => {
      radio.checked = false;
      opt.classList.remove('active');
      opt.setAttribute('aria-pressed', 'false');
      if (container) container.style.display = 'none';
    };

    // Click en la tarjeta o radio
    opt.addEventListener('click', () => activate());
    radio.addEventListener('change', (e) => { if (e.target.checked) activate(); else deactivate(); });
    opt.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Paso 2 de 3
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = '66%';
    renderResumen();
    renderUsuario();
    const total = renderTotales();
    bindConfirm(total);
    bindPaymentActivation(total);
  });
})();
