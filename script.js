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
    document.querySelectorAll('.g-item').forEach(item => {
      const match = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('hidden', !match);
    });
  });
});

// ── SELECTOR DE SERVICIOS (multi-select) ──
let serviciosElegidos = [];

document.querySelectorAll('.svc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
    const svc = btn.dataset.svc;
    if (btn.classList.contains('selected')) {
      if (!serviciosElegidos.includes(svc)) serviciosElegidos.push(svc);
    } else {
      serviciosElegidos = serviciosElegidos.filter(s => s !== svc);
    }
    // Actualizar resumen
    const summary = document.getElementById('svcSummary');
    const summaryText = document.getElementById('svcSummaryText');
    if (serviciosElegidos.length > 0) {
      summary.style.display = 'block';
      summaryText.textContent = serviciosElegidos.join(' · ');
      document.getElementById('svcError').style.display = 'none';
    } else {
      summary.style.display = 'none';
    }
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

  // Validar servicios seleccionados
  if (serviciosElegidos.length === 0) {
    document.getElementById('svcError').style.display = 'block';
    document.getElementById('serviceSelector').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');

  // Recoger datos del formulario
  const servicioTexto = serviciosElegidos.join(', ');
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
    `*Servicio(s):* ${servicioTexto}\n` +
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
  serviciosElegidos = [];
  const sum = document.getElementById('svcSummary');
  if (sum) sum.style.display = 'none';
}

// ── PARTÍCULAS FLOTANTES EN HERO ──
(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#C8A4A5','#E8DDD6','#8B5E5E','#F5ECE8','#C4A882'];

  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.opacity = Math.random() * 0.5 + 0.1;
    this.shape = Math.random() > 0.5 ? 'circle' : 'diamond';
  }
  Particle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width)  this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  };
  Particle.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
    }
    ctx.restore();
  };

  for (let i = 0; i < 55; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── CONTADORES ANIMADOS (STATS) ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

const statsSection = document.getElementById('stats');
if (statsSection) statsObserver.observe(statsSection);

// ── PARALLAX SUAVE EN HERO BG TEXT ──
window.addEventListener('scroll', () => {
  const bgText = document.querySelector('.hero-bg-text');
  if (bgText) {
    bgText.style.transform = `translate(-50%, calc(-50% + ${window.scrollY * 0.15}px))`;
  }
});

// ── MAGNETIC EFFECT EN BOTONES ──
document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    this.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });
  btn.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

// ── MENÚ HAMBURGUESA ──
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const menuClose   = document.getElementById('menuClose');

function openMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMenu);
if (menuClose)  menuClose.addEventListener('click', closeMenu);

// Cerrar al tocar un enlace del menú
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
    // Dar tiempo al cierre antes de hacer scroll
    setTimeout(() => {
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  });
});

// ══════════════════════════════════
// LIGHTBOX DE GALERÍA
// ══════════════════════════════════
(function() {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  if (!lightbox) return;

  let currentItems = [];
  let currentIndex = 0;

  function getVisibleItems() {
    return [...document.querySelectorAll('.g-item:not(.hidden)')];
  }

  function openLightbox(index) {
    currentItems = getVisibleItems();
    currentIndex = index;
    showItem(currentIndex);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showItem(index) {
    const item   = currentItems[index];
    const img    = item.querySelector('img');
    const label  = item.querySelector('.g-label');
    lbImg.src    = img.src;
    lbImg.alt    = img.alt;
    lbCaption.textContent = label ? label.textContent : img.alt;
    lbPrev.style.display = currentItems.length > 1 ? 'flex' : 'none';
    lbNext.style.display = currentItems.length > 1 ? 'flex' : 'none';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Click en foto abre lightbox
  document.getElementById('galleryGrid').addEventListener('click', function(e) {
    const item = e.target.closest('.g-item');
    if (!item || item.classList.contains('hidden')) return;
    const visible = getVisibleItems();
    openLightbox(visible.indexOf(item));
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  lbPrev.addEventListener('click', e => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    showItem(currentIndex);
  });
  lbNext.addEventListener('click', e => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % currentItems.length;
    showItem(currentIndex);
  });

  // Teclado
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  { currentIndex = (currentIndex-1+currentItems.length)%currentItems.length; showItem(currentIndex); }
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex+1)%currentItems.length; showItem(currentIndex); }
  });

  // Swipe táctil para móvil
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
  lightbox.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { currentIndex = (currentIndex+1)%currentItems.length; }
      else          { currentIndex = (currentIndex-1+currentItems.length)%currentItems.length; }
      showItem(currentIndex);
    }
  });
})();

// ══════════════════════════════════
// FILTROS CON ANIMACIÓN FADE-IN
// ══════════════════════════════════
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.g-item').forEach((item, i) => {
      const match = filter === 'all' || item.dataset.cat === filter;
      if (match) {
        item.classList.remove('hidden');
        item.classList.remove('fade-in');
        // Forzar reflow para reiniciar animación
        void item.offsetWidth;
        item.classList.add('fade-in');
        item.style.animationDelay = (i % 9 * 0.05) + 's';
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ══════════════════════════════════
// CURSOR EN LIGHTBOX Y FAB
// ══════════════════════════════════
addCursorHover('.lightbox-nav, .lightbox-close, .whatsapp-fab, .g-item, .si-item, .servicios-list-item, .domicilio-cta');



// ══════════════════════════════════
// GALERÍA — FILTROS
// ══════════════════════════════════
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    let delay = 0;
    document.querySelectorAll('.g-item').forEach(item => {
      const match = filter === 'all' || item.dataset.cat === filter;
      if (match) {
        item.classList.remove('hidden', 'fade-in');
        void item.offsetWidth;
        item.classList.add('fade-in');
        item.style.animationDelay = (delay * 0.035) + 's';
        delay++;
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ══════════════════════════════════
// LIGHTBOX — SIN BLOQUEAR SCROLL
// ══════════════════════════════════
(function() {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  if (!lightbox) return;

  let items = [];
  let idx   = 0;
  let scrollY = 0;

  function openLB(allItems, i) {
    items = allItems;
    idx   = i;
    showSlide(idx);
    // Guardar posición scroll y fijar body sin mover la página
    scrollY = window.scrollY;
    document.body.style.position   = 'fixed';
    document.body.style.top        = `-${scrollY}px`;
    document.body.style.width      = '100%';
    document.body.style.overflowY  = 'scroll';
    lightbox.classList.add('open');
  }

  function closeLB() {
    lightbox.classList.remove('open');
    // Restaurar scroll exactamente donde estaba
    document.body.style.position  = '';
    document.body.style.top       = '';
    document.body.style.width     = '';
    document.body.style.overflowY = '';
    window.scrollTo(0, scrollY);
  }

  function showSlide(i) {
    const item  = items[i];
    const img   = item.querySelector('img');
    lbImg.src   = img.src;
    lbImg.alt   = img.alt;
    lbCaption.textContent = item.querySelector('.g-label')?.textContent || img.alt;
    lbPrev.style.display = items.length > 1 ? 'flex' : 'none';
    lbNext.style.display = items.length > 1 ? 'flex' : 'none';
  }

  // Clic en items de galería
  document.getElementById('galleryGrid')?.addEventListener('click', e => {
    const item = e.target.closest('.g-item');
    if (!item || item.classList.contains('hidden')) return;
    const visible = [...document.querySelectorAll('#galleryGrid .g-item:not(.hidden)')];
    openLB(visible, visible.indexOf(item));
  });

  // Cerrar
  lbClose?.addEventListener('click', closeLB);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLB();
  });

  // Navegación
  lbPrev?.addEventListener('click', e => {
    e.stopPropagation();
    idx = (idx - 1 + items.length) % items.length;
    showSlide(idx);
  });
  lbNext?.addEventListener('click', e => {
    e.stopPropagation();
    idx = (idx + 1) % items.length;
    showSlide(idx);
  });

  // Teclado
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLB();
    if (e.key === 'ArrowLeft')  { idx = (idx-1+items.length)%items.length; showSlide(idx); }
    if (e.key === 'ArrowRight') { idx = (idx+1)%items.length; showSlide(idx); }
  });

  // Swipe móvil
  let tX = 0;
  lightbox.addEventListener('touchstart', e => { tX = e.touches[0].clientX; }, {passive:true});
  lightbox.addEventListener('touchend',   e => {
    const diff = tX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      idx = diff > 0
        ? (idx+1) % items.length
        : (idx-1+items.length) % items.length;
      showSlide(idx);
    }
  });
})();
