/* ══════════════════════════════════════════════════════════════════════════
   STACK FLOW — script.js
   Mobile-first: touch events, passive listeners, reduced motion support
   ══════════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── HELPERS ─────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const isDesktop = () => window.innerWidth >= 900;

/* ══════════════════════════════════════════════════════════════════════════
   LOADER
   ══════════════════════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  const loader = $('loader');
  const delay = prefersReducedMotion ? 200 : 2200;

  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 500);

    // Stagger hero reveals
    $$('#hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120 + 150);
    });
  }, delay);
});

/* ══════════════════════════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════════════════════════ */
const navbar    = $('navbar');
const hamburger = $('hamburger');
const navLinks  = $('navLinks');

// Scroll-dependent styles — passive for performance
window.addEventListener('scroll', onScroll, { passive: true });

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateBackToTop();
  setActiveNavLink();
}

// Hamburger toggle
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close nav on outside tap
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeNav();
  }
});

function closeNav() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Active link on scroll
const sections       = $$('section[id]');
const navAnchorLinks = navLinks.querySelectorAll('a[href^="#"]');

function setActiveNavLink() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 90) current = sec.id;
  });
  navAnchorLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${current}`;
    link.classList.toggle('active-link', isActive);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   THEME TOGGLE
   ══════════════════════════════════════════════════════════════════════════ */
const themeToggle = $('themeToggle');
const themeIcon   = $('themeIcon');
const html        = document.documentElement;
const metaTheme   = document.querySelector('meta[name="theme-color"]');

// Respect OS preference on first visit
const osPreference   = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
const savedTheme     = localStorage.getItem('sf-theme') || osPreference;
html.setAttribute('data-theme', savedTheme);
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('sf-theme', next);
  applyTheme(next);
});

function applyTheme(theme) {
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  if (metaTheme) metaTheme.content = theme === 'dark' ? '#070b14' : '#f0f4ff';
}

/* ══════════════════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — REVEAL ANIMATIONS
   ══════════════════════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

// Add stagger delays to grid children
$$('.services-grid, .projects-grid, .why-grid, .testimonials-grid').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = prefersReducedMotion ? '0ms' : `${i * 70}ms`;
  });
});

$$('.reveal').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════════════════════════════════════
   COUNTER ANIMATION
   ══════════════════════════════════════════════════════════════════════════ */
const counters       = $$('.stat-num');
let countersStarted  = false;
const heroStats      = document.querySelector('.hero-stats');

if (heroStats) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      counters.forEach(animateCounter);
    }
  }, { threshold: 0.5 }).observe(heroStats);
}

function animateCounter(el) {
  const target   = +el.dataset.target;
  const duration = prefersReducedMotion ? 0 : 1600;
  if (duration === 0) { el.textContent = target; return; }
  const start = performance.now();
  (function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // easeOutExpo
    el.textContent = Math.floor(e * target);
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = target;
  })(start);
}

/* ══════════════════════════════════════════════════════════════════════════
   PROJECT FILTER
   ══════════════════════════════════════════════════════════════════════════ */
const filterBtns  = $$('.filter-btn');
const projectCards = $$('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
      if (show) {
        card.classList.remove('visible');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => card.classList.add('visible'));
        });
      }
    });
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   TOUCH: TAP PROJECT CARD TO REVEAL OVERLAY (mobile)
   ══════════════════════════════════════════════════════════════════════════ */
if (isTouch) {
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      projectCards.forEach(c => c.classList.remove('active'));
      if (!wasActive) card.classList.add('active');
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   CONTACT FORM
   ══════════════════════════════════════════════════════════════════════════ */
document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Get form values
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let service = document.getElementById("service").value;
  let budget = document.getElementById("budget").value;
  let message = document.getElementById("message").value.trim();

  // Basic validation
  if (!name || !email || !service || !budget || !message) {
    alert("Please fill all fields");
    return;
  }

  // 🔴 Replace with your WhatsApp number
  let phoneNumber = "919067831928";

  // Create WhatsApp message (formatted)
  let whatsappMessage =
    `🚀 Hello Stack Flow,%0A%0A` +
    `👤 Name: ${name}%0A` +
    `📧 Email: ${email}%0A` +
    `💼 Service: ${service}%0A` +
    `💰 Budget: ${budget}%0A` +
    `📝 Project Details: ${message}`;

  // Open WhatsApp
  let url = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
  window.open(url, "_blank");
});

/* ══════════════════════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   ══════════════════════════════════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   BACK TO TOP
   ══════════════════════════════════════════════════════════════════════════ */
const backToTopBtn = $('backToTop');

function updateBackToTop() {
  backToTopBtn.classList.toggle('visible', window.scrollY > 400);
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

/* ══════════════════════════════════════════════════════════════════════════
   FOOTER YEAR
   ══════════════════════════════════════════════════════════════════════════ */
const yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════════════════════════════════
   CODE WINDOW TYPEWRITE (desktop, no reduced motion)
   ══════════════════════════════════════════════════════════════════════════ */
if (!prefersReducedMotion) {
  $$('.code-line').forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-8px)';
    line.style.transition = 'opacity .3s ease, transform .3s ease';
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, 2400 + i * 110);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   MOUSE PARALLAX ON HERO ORBS (desktop + no touch + no reduced motion)
   ══════════════════════════════════════════════════════════════════════════ */
if (!isTouch && !prefersReducedMotion) {
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');

  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 18;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    if (orb1) orb1.style.transform = `translate(${x * .5}px,${y * .5}px)`;
    if (orb2) orb2.style.transform = `translate(${-x * .3}px,${-y * .3}px)`;
  }, { passive: true });

  /* Cursor glow */
  const glow = document.createElement('div');
  glow.setAttribute('aria-hidden', 'true');
  glow.style.cssText = 'position:fixed;pointer-events:none;z-index:9998;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.05),transparent 70%);transform:translate(-50%,-50%);transition:left .12s ease,top .12s ease;';
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });

  /* Card 3D tilt */
  $$('.service-card,.why-card,.testi-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `translateY(-5px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* Tech icon tilt */
  $$('.tech-item').forEach(item => {
    const icon = item.querySelector('.tech-icon');
    item.addEventListener('mousemove', e => {
      const r  = item.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      if (icon) icon.style.transform = `translateY(-5px) scale(1.05) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg)`;
    });
    item.addEventListener('mouseleave', () => { if (icon) icon.style.transform = ''; });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   RESIZE: Close mobile nav if viewport grows to desktop
   ══════════════════════════════════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  if (isDesktop() && navLinks.classList.contains('open')) closeNav();
}, { passive: true });

/* ══════════════════════════════════════════════════════════════════════════
   VIEWPORT HEIGHT FIX for mobile browsers (address bar)
   ══════════════════════════════════════════════════════════════════════════ */
function setVH() {
  document.documentElement.style.setProperty('--real-vh', `${window.innerHeight * 0.01}px`);
}
setVH();
window.addEventListener('resize', setVH, { passive: true });
