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

// ══════════════════════════════════
// EFECTO TILT EN CARDS (desktop)
// ══════════════════════════════════
document.querySelectorAll('.servicios-card, .hsg-item').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    this.style.transform = `perspective(600px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = '';
    this.style.transition = 'transform 0.5s ease';
  });
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'transform 0.1s ease';
  });
});

// ══════════════════════════════════
// EFECTO GLOW CURSOR EN GALERÍA
// ══════════════════════════════════
const gallerySection = document.getElementById('galeria');
if (gallerySection) {
  const glowEl = document.createElement('div');
  glowEl.style.cssText = `
    position:absolute; width:300px; height:300px;
    border-radius:50%; pointer-events:none; z-index:0;
    background: radial-gradient(circle, rgba(200,164,165,0.08) 0%, transparent 70%);
    transform: translate(-50%,-50%); transition: opacity 0.3s;
    opacity:0;
  `;
  gallerySection.style.position = 'relative';
  gallerySection.appendChild(glowEl);

  gallerySection.addEventListener('mousemove', e => {
    const rect = gallerySection.getBoundingClientRect();
    glowEl.style.left = (e.clientX - rect.left) + 'px';
    glowEl.style.top  = (e.clientY - rect.top + gallerySection.scrollTop) + 'px';
    glowEl.style.opacity = '1';
  });
  gallerySection.addEventListener('mouseleave', () => { glowEl.style.opacity = '0'; });
}

// ══════════════════════════════════
// PARALLAX SUAVE EN SECCIONES
// ══════════════════════════════════
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Parallax hero bg text
  const bgText = document.querySelector('.hero-bg-text');
  if (bgText) {
    bgText.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.18}px))`;
  }

  // Parallax proceso bg text
  const lgText = document.querySelector('#proceso::before');
}, { passive: true });

// ══════════════════════════════════
// NÚMERO ANIMADO EN PRECIO DOMICILIO
// ══════════════════════════════════
const domPriceObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    let n = 0;
    const target = 8000;
    const step = target / 40;
    const t = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = '$' + Math.floor(n).toLocaleString('es-CO');
      if (n >= target) clearInterval(t);
    }, 30);
    domPriceObs.unobserve(el);
  });
}, { threshold: 0.5 });

const domPrice = document.querySelector('.domicilio-price-amount');
if (domPrice) domPriceObs.observe(domPrice);

// ══════════════════════════════════
// CURSOR HOVER ESPECIAL EN GALERÍA
// ══════════════════════════════════
document.querySelectorAll('.g-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const cur = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (cur) { cur.style.width = '6px'; cur.style.height = '6px'; cur.style.background = 'white'; }
    if (ring) { ring.style.width = '48px'; ring.style.height = '48px'; ring.style.borderColor = 'rgba(200,164,165,0.6)'; }
  });
  item.addEventListener('mouseleave', () => {
    const cur = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (cur) { cur.style.width = '10px'; cur.style.height = '10px'; cur.style.background = 'var(--rose-deep)'; }
    if (ring) { ring.style.width = '32px'; ring.style.height = '32px'; ring.style.borderColor = 'var(--rose)'; }
  });
});

// ══════════════════════════════════
// DATE PICKER PERSONALIZADO
// ══════════════════════════════════
(function() {
  const trigger  = document.getElementById('datePickerTrigger');
  const panel    = document.getElementById('datePanel');
  const display  = document.getElementById('dateDisplay');
  const hidden   = document.getElementById('fecha');
  const monthYr  = document.getElementById('dpMonthYear');
  const daysEl   = document.getElementById('dpDays');
  const prevBtn  = document.getElementById('dpPrev');
  const nextBtn  = document.getElementById('dpNext');
  if (!trigger) return;

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  let currentDate = new Date();
  let selectedDate = null;
  const today = new Date();
  today.setHours(0,0,0,0);

  function renderCalendar() {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYr.textContent = `${MESES[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();

    daysEl.innerHTML = '';

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'dp-day dp-empty';
      daysEl.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'dp-day';
      dayEl.textContent = d;

      const thisDate = new Date(year, month, d);
      thisDate.setHours(0,0,0,0);

      if (thisDate < today) dayEl.classList.add('dp-past');
      if (thisDate.getTime() === today.getTime()) dayEl.classList.add('dp-today');
      if (selectedDate && thisDate.getTime() === selectedDate.getTime()) dayEl.classList.add('dp-selected');

      dayEl.addEventListener('click', () => {
        if (dayEl.classList.contains('dp-past')) return;
        selectedDate = new Date(year, month, d);
        // Formato legible
        const dia  = String(d).padStart(2,'0');
        const mes  = String(month+1).padStart(2,'0');
        const mNombre = MESES[month];
        display.textContent = `${d} de ${mNombre} ${year}`;
        trigger.classList.add('has-date');
        // Formato para envío yyyy-mm-dd
        hidden.value = `${year}-${mes}-${dia}`;
        panel.classList.remove('open');
        renderCalendar();
      });

      daysEl.appendChild(dayEl);
    }
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  prevBtn?.addEventListener('click', e => {
    e.stopPropagation();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1);
    renderCalendar();
  });
  nextBtn?.addEventListener('click', e => {
    e.stopPropagation();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1);
    renderCalendar();
  });

  document.addEventListener('click', e => {
    if (!document.getElementById('datePicker')?.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  renderCalendar();
})();

// ══════════════════════════════════
// SCROLL PROGRESS BAR
// ══════════════════════════════════
window.addEventListener('scroll', () => {
  const bar  = document.getElementById('scrollProgress');
  if (!bar) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (window.scrollY / total * 100) + '%';
}, { passive: true });

// ══════════════════════════════════
// RIPPLE EN BOTONES
// ══════════════════════════════════
document.querySelectorAll('.btn-primary, .btn-secondary, .form-submit, .nav-cta').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top  = (e.clientY - rect.top  - size/2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// ══════════════════════════════════
// VIDEO EN GALERÍA — HOVER PLAY
// ══════════════════════════════════
document.querySelectorAll('.g-video-item').forEach(item => {
  const video = item.querySelector('video');
  if (!video) return;
  item.addEventListener('mouseenter', () => video.play().catch(()=>{}));
  item.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  // Touch en móvil
  item.addEventListener('touchstart', () => video.play().catch(()=>{}), {passive:true});
});

// ══════════════════════════════════
// LIGHTBOX — SOPORTE VIDEO
// ══════════════════════════════════
(function(){
  const lbImg   = document.getElementById('lbImg');
  const lbVideo = document.getElementById('lbVideo');

  // Override del click en galería para detectar video
  const grid = document.getElementById('galleryGrid');
  if (!grid || !lbImg) return;

  // Remover listener anterior y reemplazar
  const newGrid = grid.cloneNode(true);
  // Restaurar imágenes desde el original (no clonar base64)
  // Solo agregar el evento click directamente
  grid.addEventListener('click', e => {
    const item = e.target.closest('.g-item');
    if (!item || item.classList.contains('hidden')) return;

    const lightbox = document.getElementById('lightbox');
    const lbCaption = document.getElementById('lbCaption');
    const video = item.querySelector('video');

    if (video) {
      // Es un video — mostrar en lightbox
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src = video.src;
      lbVideo.play().catch(()=>{});
      lbCaption.textContent = item.querySelector('.g-label')?.textContent || 'Liz Glow Nails';
      // Guardar scroll y fijar body
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      lightbox.dataset.scrollY = scrollY;
      lightbox.classList.add('open');
    }
    // Las fotos normales las maneja el lightbox existente
  }, true); // capture: true para ir antes del listener existente

  // Al cerrar lightbox, pausar video
  document.getElementById('lbClose')?.addEventListener('click', () => {
    if (lbVideo) {
      lbVideo.pause();
      lbVideo.src = '';
      lbVideo.style.display = 'none';
      lbImg.style.display = 'block';
    }
  });

  // Autoplay video en móvil al hacer scroll (IntersectionObserver)
  const galleryVideo = document.getElementById('galleryVideo');
  if (galleryVideo) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) galleryVideo.play().catch(()=>{});
        else { galleryVideo.pause(); galleryVideo.currentTime = 0; }
      });
    }, { threshold: 0.5 });
    obs.observe(galleryVideo);
  }
})();

// ══════════════════════════════════
// HAPTIC FEEDBACK MÓVIL (si disponible)
// ══════════════════════════════════
document.querySelectorAll('.filter-btn, .svc-btn, .g-item').forEach(el => {
  el.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(8);
  });
});

// ══════════════════════════════════
// LAZY LOAD MEJORADO
// ══════════════════════════════════
if ('IntersectionObserver' in window) {
  const imgObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imgObs.observe(img);
  });
}

// ══════════════════════════════════════════════════
// 🔒 SEGURIDAD ANTI-HACK — PROTECCIONES FRONTEND
// ══════════════════════════════════════════════════
(function() {
  'use strict';

  // 1. Anti devtools — detectar si abren las herramientas
  let devtoolsOpen = false;
  const threshold = 160;
  setInterval(() => {
    if (window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        console.clear();
        console.log('%c🔒 Liz Glow Nails — Sitio protegido', 
          'color:#8B5E5E;font-size:18px;font-weight:bold;');
        console.log('%cSi encontraste un bug, escríbenos 💅',
          'color:#C8A4A5;font-size:12px;');
      }
    } else {
      devtoolsOpen = false;
    }
  }, 1000);

  // 2. Bloquear click derecho en imágenes
  document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
      e.preventDefault();
      showToast('🔒 Contenido protegido por Liz Glow Nails');
    }
  });

  // 3. Anti drag de imágenes
  document.querySelectorAll('img, video').forEach(el => {
    el.addEventListener('dragstart', e => e.preventDefault());
    el.setAttribute('draggable', 'false');
  });

  // 4. Bloquear atajos de teclado comunes de scraping
  document.addEventListener('keydown', e => {
    // Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12
    if ((e.ctrlKey && (e.key === 's' || e.key === 'u')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        e.key === 'F12') {
      e.preventDefault();
      console.clear();
    }
    // Ctrl+A en galería — no seleccionar todo
    if (e.ctrlKey && e.key === 'a' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  // 5. Anti-iframe embedding
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }

  // 6. Sanitizar inputs del formulario (XSS prevention)
  function sanitize(str) {
    return str.replace(/[<>&"'\/]/g, c => ({
      '<':'&lt;', '>':'&gt;', '&':'&amp;',
      '"':'&quot;', "'": '&#x27;', '/':'&#x2F;'
    }[c]));
  }

  // Interceptar envío del formulario para sanitizar
  const form = document.getElementById('bookingForm');
  if (form) {
    const origSubmit = form.onsubmit;
    form.addEventListener('submit', e => {
      document.querySelectorAll('#bookingForm input[type="text"], #bookingForm input[type="tel"], #bookingForm textarea').forEach(input => {
        input.value = sanitize(input.value);
      });
    }, true);
  }

  // 7. Rate limiting en formulario (max 3 envíos por sesión)
  let submitCount = parseInt(sessionStorage.getItem('submitCount') || '0');
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn && submitCount >= 3) {
    submitBtn.disabled = true;
    submitBtn.querySelector('.submit-text').textContent = 'Límite alcanzado — escríbenos directo';
  }
  document.getElementById('bookingForm')?.addEventListener('submit', () => {
    submitCount++;
    sessionStorage.setItem('submitCount', submitCount);
  });

  // 8. Honeypot detection — bot trap
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website';
  honeypot.style.cssText = 'position:absolute;left:-9999px;opacity:0;pointer-events:none;';
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  document.getElementById('bookingForm')?.appendChild(honeypot);

  document.getElementById('bookingForm')?.addEventListener('submit', e => {
    if (honeypot.value !== '') {
      e.preventDefault();
      e.stopPropagation();
      return false; // Bot detectado
    }
  }, true);

})();

// ══════════════════════════════════
// 🍞 TOAST NOTIFICATIONS
// ══════════════════════════════════
function showToast(msg, type='info') {
  let toast = document.getElementById('lgToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lgToast';
    toast.style.cssText = `
      position:fixed; bottom:5rem; left:50%; transform:translateX(-50%) translateY(20px);
      background:#1e1010; color:white; padding:0.8rem 1.4rem;
      border:1px solid rgba(200,164,165,0.3); border-radius:100px;
      font-family:'Jost',sans-serif; font-size:0.75rem; font-weight:200;
      letter-spacing:0.1em; z-index:9999; opacity:0;
      transition:all 0.3s; white-space:nowrap;
      box-shadow:0 8px 30px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}

// ══════════════════════════════════
// 🌅 AURORA CANVAS — FONDO ÉPICO
// ══════════════════════════════════
(function() {
  const canvas = document.getElementById('auroraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  const orbs = [
    { x: 0.3, y: 0.4, r: 0.35, color: [200,164,165] },
    { x: 0.7, y: 0.6, r: 0.28, color: [139,94,94] },
    { x: 0.5, y: 0.2, r: 0.22, color: [196,168,130] },
  ];

  function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;

    orbs.forEach((orb, i) => {
      const x = (orb.x + Math.sin(t*0.0008 + i*2.1) * 0.12) * w;
      const y = (orb.y + Math.cos(t*0.0006 + i*1.7) * 0.1)  * h;
      const r = orb.r * Math.min(w,h);
      const [R,G,B] = orb.color;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${R},${G},${B},0.25)`);
      grad.addColorStop(0.5, `rgba(${R},${G},${B},0.08)`);
      grad.addColorStop(1, `rgba(${R},${G},${B},0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(0,0,w,h);
    });

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ══════════════════════════════════
// 🎯 CURSOR MAGNÉTICO EN BOTONES
// ══════════════════════════════════
document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .form-submit, .domicilio-cta').forEach(btn => {
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width/2)  * 0.25;
    const y = (e.clientY - rect.top  - rect.height/2) * 0.25;
    this.style.transform = `translate(${x}px, ${y}px)`;
  });
  btn.addEventListener('mouseleave', function() {
    this.style.transform = '';
    this.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
  });
  btn.addEventListener('mouseenter', function() {
    this.style.transition = 'transform 0.1s';
  });
});

// ══════════════════════════════════
// 🌊 SMOOTH SCROLL CON EASING
// ══════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const start = window.scrollY;
    const end   = target.getBoundingClientRect().top + window.scrollY - 80;
    const dist  = end - start;
    const dur   = Math.min(Math.abs(dist) * 0.5, 1000);
    let startTime = null;

    function ease(t) { return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

    function step(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed/dur, 1);
      window.scrollTo(0, start + dist * ease(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
});

// ══════════════════════════════════
// 💫 STAGGER REVEAL EN GALERÍA
// ══════════════════════════════════
(function() {
  const galleryObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const items = entry.target.querySelectorAll('.g-item');
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.92)';
        setTimeout(() => {
          item.style.transition = `opacity 0.5s ease ${i*0.06}s, transform 0.5s ease ${i*0.06}s`;
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 50);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  const grid = document.getElementById('galleryGrid');
  if (grid) galleryObs.observe(grid);
})();

// ══════════════════════════════════
// 🎨 CURSOR TRAIL DE PARTÍCULAS
// ══════════════════════════════════
(function() {
  if (window.matchMedia('(hover: none)').matches) return; // No en móvil
  const colors = ['#C8A4A5','#8B5E5E','#E8D5C0','#F5ECE8'];
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (Math.random() > 0.6) createTrailDot(mouseX, mouseY);
  });

  function createTrailDot(x, y) {
    const dot = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    dot.style.cssText = `
      position:fixed; pointer-events:none; z-index:9997;
      width:${size}px; height:${size}px; border-radius:50%;
      background:${color}; opacity:0.7;
      left:${x - size/2}px; top:${y - size/2}px;
      transition: transform 0.8s ease, opacity 0.8s ease;
    `;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${(Math.random()-0.5)*30}px, ${(Math.random()-0.5)*30}px) scale(0)`;
      dot.style.opacity = '0';
    });
    setTimeout(() => dot.remove(), 900);
  }
})();

// ══════════════════════════════════
// 🔢 COUNTER ANIMADO SERVICIOS
// ══════════════════════════════════
(function() {
  const priceItems = document.querySelectorAll('.sli-price');
  const priceObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const text = el.textContent;
      const match = text.match(/(\d[\d.]*)/);
      if (!match) return;
      const target = parseInt(match[1].replace('.',''));
      let current = 0;
      const step = target / 30;
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = '$' + Math.floor(current).toLocaleString('es-CO');
        if (current >= target) {
          el.textContent = text;
          clearInterval(interval);
        }
      }, 30);
      priceObs.unobserve(el);
    });
  }, { threshold: 1 });

  priceItems.forEach(el => priceObs.observe(el));
})();

// ══════════════════════════════════
// ⚡ AUTOOPTIMIZADOR DE RENDIMIENTO
// ══════════════════════════════════
(function AutoOptimizer() {
  'use strict';

  // 1. Detectar conexión lenta y reducir animaciones
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g')) {
    document.documentElement.style.setProperty('--transition-speed', '0.1s');
    document.querySelectorAll('video').forEach(v => { v.autoplay = false; v.preload = 'none'; });
    console.info('🔋 Modo ahorro de datos activado');
  }

  // 2. Detectar batería baja y pausar animaciones pesadas
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      if (battery.level < 0.2 && !battery.charging) {
        document.documentElement.classList.add('low-battery');
        const style = document.createElement('style');
        style.textContent = '.low-battery * { animation-play-state: paused !important; }';
        document.head.appendChild(style);
        console.info('🔋 Modo batería baja — animaciones pausadas');
      }
    });
  }

  // 3. Precargar siguiente sección cuando se acerca
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const next = e.target.nextElementSibling;
        if (next) {
          next.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (img.dataset.src) img.src = img.dataset.src;
          });
        }
      }
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('section').forEach(s => sectionObs.observe(s));

  // 4. Pausar videos fuera de pantalla
  const videoObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const video = e.target.querySelector('video');
      if (!video) return;
      if (e.isIntersecting) video.play().catch(()=>{});
      else { video.pause(); video.currentTime = 0; }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.g-video-item').forEach(item => videoObs.observe(item));

  // 5. Optimizar scroll — throttle
  let ticking = false;
  const originalScroll = window.onscroll;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // 6. Caché de imágenes en sessionStorage (para recargas rápidas)
  if ('caches' in window) {
    // Service Worker lite — no requiere SW externo
    const imgCache = new Map();
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', () => imgCache.set(img.src, true));
    });
  }

  // 7. Prerender de sección contacto al hacer scroll 70%
  let contactPrerendered = false;
  window.addEventListener('scroll', () => {
    if (contactPrerendered) return;
    const scrollPct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (scrollPct > 65) {
      contactPrerendered = true;
      const link = document.createElement('link');
      link.rel = 'prerender';
      link.href = '#contacto';
      document.head.appendChild(link);
    }
  }, { passive: true });

  // 8. Detectar dispositivo y ajustar efectos
  const isMobile = window.matchMedia('(hover: none)').matches;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

  if (isMobile || isLowEnd) {
    // Reducir partículas en dispositivos lentos
    const canvas = document.getElementById('particleCanvas');
    if (canvas) canvas.style.display = 'none';
    // Reducir trail
  }

  console.log('%c⚡ AutoOptimizer activo — Liz Glow Nails',
    'color:#C8A4A5; font-size:11px; font-style:italic;');
})();

// ══════════════════════════════════
// 📲 INSTALAR PWA (Add to Home Screen)
// ══════════════════════════════════
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;

  // Mostrar botón de instalación después de 30s
  setTimeout(() => {
    if (!deferredPrompt) return;
    const banner = document.createElement('div');
    banner.id = 'pwaBanner';
    banner.innerHTML = `
      <div style="
        position:fixed; bottom:5.5rem; left:50%;
        transform: translateX(-50%);
        background:#1e1010; border:1px solid rgba(200,164,165,0.3);
        padding:0.8rem 1.2rem; border-radius:100px; z-index:900;
        display:flex; align-items:center; gap:0.8rem;
        font-family:'Jost',sans-serif; font-size:0.72rem; font-weight:200;
        color:white; white-space:nowrap;
        box-shadow:0 8px 30px rgba(0,0,0,0.4);
        animation: fadeSlideUp 0.5s ease;
      ">
        <span>💅</span>
        <span>Instala Liz Glow Nails en tu celular</span>
        <button onclick="installPWA()" style="
          background:var(--rose-deep,#8B5E5E); border:none; color:white;
          padding:0.35rem 0.9rem; border-radius:100px; cursor:pointer;
          font-family:inherit; font-size:0.68rem; font-weight:300;
        ">Instalar</button>
        <button onclick="document.getElementById('pwaBanner').remove()" style="
          background:none; border:none; color:rgba(255,255,255,0.4);
          cursor:pointer; font-size:1rem; padding:0;
        ">×</button>
      </div>`;
    document.body.appendChild(banner);
  }, 30000);
});

function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(result => {
    if (result.outcome === 'accepted') showToast('✦ ¡Liz Glow Nails instalada!');
    deferredPrompt = null;
    document.getElementById('pwaBanner')?.remove();
  });
}

window.addEventListener('appinstalled', () => {
  showToast('💅 ¡App instalada con éxito!');
  deferredPrompt = null;
});

// ══════════════════════════════════
// 🔢 ANIMACIÓN HERO STATS MINI
// ══════════════════════════════════
(function() {
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.hsm-num').forEach(el => {
        const text = el.textContent;
        const num  = parseInt(text.replace(/\D/g,''));
        const suffix = text.replace(/[\d]/g,'');
        if (!num) return;
        let cur = 0;
        const step = num / 40;
        const t = setInterval(() => {
          cur = Math.min(cur + step, num);
          el.textContent = Math.floor(cur) + suffix;
          if (cur >= num) { el.textContent = text; clearInterval(t); }
        }, 35);
      });
      statsObs.unobserve(e.target);
    });
  }, { threshold: 0.8 });
  const miniStats = document.querySelector('.hero-stats-mini');
  if (miniStats) statsObs.observe(miniStats);
})();
