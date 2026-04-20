// ── CURSOR PERSONALIZADO ──
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  ring.style.left   = e.clientX + 'px';
  ring.style.top    = e.clientY + 'px';
});

function addCursorHover(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '18px';
      cursor.style.height = '18px';
      cursor.style.background = 'var(--rose)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '10px';
      cursor.style.height = '10px';
      cursor.style.background = 'var(--rose-deep)';
    });
  });
}
addCursorHover('a, button, .nail, .gallery-item, .filter-btn, .svc-btn, .contact-card');

// ── NAVBAR SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// ── REVEAL ON SCROLL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── FILTROS DE GALERÍA ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      const match = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('hidden', !match);
    });
  });
});

// ── SELECTOR DE SERVICIOS (chips) ──
let servicioElegido = '';

document.querySelectorAll('.svc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    servicioElegido = btn.dataset.svc;
    document.getElementById('servicioSeleccionado').value = servicioElegido;
    document.getElementById('svcError').style.display = 'none';
  });
});

// ── CUSTOM SELECTS ──
function initCustomSelect(containerId, hiddenInputId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const trigger  = container.querySelector('.cs-trigger');
  const dropdown = container.querySelector('.cs-dropdown');
  const hidden   = document.getElementById(hiddenInputId);
  const placeholder = trigger.dataset.placeholder;

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    // Cerrar otros
    document.querySelectorAll('.custom-select.open').forEach(el => {
      if (el !== container) el.classList.remove('open');
    });
    container.classList.toggle('open');
  });

  container.querySelectorAll('.cs-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.cs-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      trigger.textContent = opt.dataset.value;
      trigger.classList.add('has-value');
      hidden.value = opt.dataset.value;
      container.classList.remove('open');
      // Reconstruir el ::after (se pierde al cambiar textContent)
      trigger.dataset.placeholder = placeholder;
    });
  });

  document.addEventListener('click', () => container.classList.remove('open'));
}

initCustomSelect('horaSelect', 'hora');
initCustomSelect('comoSelect', 'como');

// ── FECHA MÍNIMA = HOY ──
const dateInput = document.getElementById('fecha');
if (dateInput) {
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

// ── FORMULARIO DE RESERVA → WHATSAPP ──
document.getElementById('bookingForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Validar servicio seleccionado
  if (!servicioElegido) {
    document.getElementById('svcError').style.display = 'block';
    document.getElementById('serviceSelector').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');

  // Recoger datos del formulario
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email  = document.getElementById('email').value.trim();
  const fecha  = document.getElementById('fecha').value;
  const hora   = document.getElementById('hora').value;
  const notas  = document.getElementById('notas').value.trim();
  const como   = document.getElementById('como').value;

  // Formatear fecha legible
  let fechaTexto = fecha;
  if (fecha) {
    const [y, m, d] = fecha.split('-');
    fechaTexto = `${d}/${m}/${y}`;
  }

  // Construir mensaje de WhatsApp
  let mensaje =
    `¡Hola! Quiero reservar una cita 💅\n\n` +
    `*Nombre:* ${nombre}\n` +
    `*Teléfono:* ${telefono}\n`;
  if (email) mensaje += `*Correo:* ${email}\n`;
  mensaje +=
    `*Servicio:* ${servicioElegido}\n` +
    `*Fecha:* ${fechaTexto}\n` +
    `*Hora:* ${hora}\n`;
  if (notas)  mensaje += `*Diseño/referencia:* ${notas}\n`;
  if (como)   mensaje += `*¿Cómo nos encontró?:* ${como}\n`;

  // Número de WhatsApp (sin espacios ni +)
  const numero = '573215879755';
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  setTimeout(() => {
    btn.classList.remove('loading');
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('formSuccess').classList.add('show');
    // Abrir WhatsApp
    window.open(url, '_blank');
  }, 800);
});

// ── RESET FORMULARIO ──
function resetForm() {
  document.getElementById('bookingForm').reset();
  document.getElementById('bookingForm').style.display = 'block';
  document.getElementById('formSuccess').classList.remove('show');
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
  servicioElegido = '';
}