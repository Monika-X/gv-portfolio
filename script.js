/* ============================================================
   GOWTHAM V — PORTFOLIO JAVASCRIPT
   Modular · Clean · High Performance
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   MODULE: NAVBAR
   Scrolled state + mobile toggle
────────────────────────────────────────────────────────── */
const NavbarModule = (() => {
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  const onToggle = () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const onNavClick = (e) => {
    if (e.target.closest('.nav-link')) closeMenu();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') closeMenu();
  };

  return {
    init() {
      window.addEventListener('scroll', onScroll, { passive: true });
      navToggle?.addEventListener('click', onToggle);
      navLinks?.addEventListener('click', onNavClick);
      document.addEventListener('keydown', onKeydown);
      onScroll();
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: PARALLAX
   Mouse parallax on AWS cloud visual nodes + float cards
────────────────────────────────────────────────────────── */
const ParallaxModule = (() => {
  const SMOOTH = 0.065;
  const MAX_SHIFT = 26; // max px shift

  let section   = null;
  let items     = [];
  let mouseX    = 0, mouseY    = 0;
  let currentX  = 0, currentY  = 0;
  let rafId     = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  const onMouseMove = (e) => {
    if (!section) return;
    const rect    = section.getBoundingClientRect();
    const cx      = rect.left + rect.width  / 2;
    const cy      = rect.top  + rect.height / 2;
    // Normalise to -1 … +1
    mouseX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width  / 2)));
    mouseY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
  };

  const onMouseLeave = () => { mouseX = 0; mouseY = 0; };

  const tick = () => {
    currentX = lerp(currentX, mouseX, SMOOTH);
    currentY = lerp(currentY, mouseY, SMOOTH);

    items.forEach(({ el, depth, isNode }) => {
      const dx = currentX * depth * MAX_SHIFT;
      const dy = currentY * depth * MAX_SHIFT;
      if (isNode) {
        // Nodes use translate(-50%,-50%) as base — preserve it
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      } else {
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    });

    rafId = requestAnimationFrame(tick);
  };

  return {
    init() {
      section = document.getElementById('hero');
      if (!section) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.matchMedia('(hover: hover)').matches) return;

      document.querySelectorAll('.cv-node').forEach((el) => {
        items.push({ el, depth: parseFloat(el.dataset.depth || '0.3'), isNode: true });
      });
      document.querySelectorAll('.cv-float').forEach((el) => {
        items.push({ el, depth: parseFloat(el.dataset.depth || '0.4'), isNode: false });
      });

      if (!items.length) return;

      section.addEventListener('mousemove',  onMouseMove,  { passive: true });
      section.addEventListener('mouseleave', onMouseLeave);
      rafId = requestAnimationFrame(tick);
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: TYPEWRITER
   Cycles through role titles
────────────────────────────────────────────────────────── */
const TypewriterModule = (() => {
  const PHRASES = [
    'Cloud Engineer',
    'AWS Specialist',
    'DevOps Enthusiast',
    'Infrastructure Builder',
    'Desktop Engineer',
  ];

  let pIdx      = 0;
  let cIdx      = 0;
  let deleting  = false;
  let timerId   = null;

  const tick = (el) => {
    const phrase = PHRASES[pIdx];

    if (deleting) {
      el.textContent = phrase.substring(0, cIdx - 1);
      cIdx--;
    } else {
      el.textContent = phrase.substring(0, cIdx + 1);
      cIdx++;
    }

    let delay = deleting ? 55 : 95;

    if (!deleting && cIdx === phrase.length) {
      delay    = 2200;
      deleting = true;
    } else if (deleting && cIdx === 0) {
      deleting = false;
      pIdx     = (pIdx + 1) % PHRASES.length;
      delay    = 380;
    }

    timerId = setTimeout(() => tick(el), delay);
  };

  return {
    init() {
      const el = document.getElementById('typewriterEl');
      if (!el) return;

      // Skip animation if user prefers reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = PHRASES[0];
        return;
      }

      setTimeout(() => tick(el), 600);
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: COUNTER ANIMATION
   Animates numeric stat counters on scroll into view
────────────────────────────────────────────────────────── */
const CounterModule = (() => {
  // Cubic ease-out easing
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el, target, duration = 1400) => {
    const start = performance.now();
    const isLarge = target >= 100;

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);

      el.textContent = value;

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };

    requestAnimationFrame(step);
  };

  return {
    init() {
      const counters = document.querySelectorAll('[data-count]');
      if (!counters.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.dataset.count, 10);
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.6 });

      counters.forEach((el) => observer.observe(el));
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: SCROLL REVEAL
   Observes [data-animate] elements and adds .visible class
────────────────────────────────────────────────────────── */
const ScrollRevealModule = (() => {
  return {
    init() {
      const targets = document.querySelectorAll('[data-animate]');
      if (!targets.length) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        targets.forEach((el) => el.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger siblings slightly
            const delay = (entry.target.dataset.staggerIndex || 0) * 100;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      targets.forEach((el, i) => {
        // Assign stagger index to siblings in the same parent
        el.dataset.staggerIndex = i % 6;
        observer.observe(el);
      });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: GRADE BAR ANIMATION
   Triggers CSS scaleX animation on education bars
────────────────────────────────────────────────────────── */
const GradeBarModule = (() => {
  return {
    init() {
      const bars = document.querySelectorAll('.grade-bar');
      if (!bars.length) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bars.forEach((b) => b.classList.add('animated'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      bars.forEach((bar) => observer.observe(bar));
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: STAGGER ANIMATION
   Animates grid items in staggered sequence
────────────────────────────────────────────────────────── */
const StaggerModule = (() => {
  const groups = [
    { selector: '.aws-card',       delay: 75  },
    { selector: '.strength-card',  delay: 55  },
    { selector: '.tech-category',  delay: 90  },
  ];

  const animateGroup = (elements, delay) => {
    elements.forEach((el, i) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(22px)';
      el.style.transition = `opacity 0.5s ease ${i * delay}ms, transform 0.5s ease ${i * delay}ms`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  };

  return {
    init() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      groups.forEach(({ selector, delay }) => {
        const elements = document.querySelectorAll(selector);
        if (!elements.length) return;

        // Watch first element; fire stagger when group enters view
        const observer = new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            animateGroup(elements, delay);
            observer.disconnect();
          }
        }, { threshold: 0.05 });

        observer.observe(elements[0]);
      });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: TILT EFFECT
   Subtle 3D tilt on AWS cards (desktop only)
────────────────────────────────────────────────────────── */
const TiltModule = (() => {
  const INTENSITY = 4; // max degrees

  const onMove = (e) => {
    const card   = e.currentTarget;
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const rotX   = ((y / rect.height) - 0.5) * -INTENSITY * 2;
    const rotY   = ((x / rect.width)  - 0.5) *  INTENSITY * 2;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
  };

  const onLeave = (card) => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s cubic-bezier(0.4,0,0.2,1), border-color 0.28s cubic-bezier(0.4,0,0.2,1)';
  };

  return {
    init() {
      // Only on pointer devices that can hover (not touch)
      if (!window.matchMedia('(hover: hover)').matches) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      document.querySelectorAll('.aws-card, .bento-item, .contact-card, .wa-quick-card, .timeline-item, .profile-ecosystem').forEach((card) => {
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', () => onLeave(card));
      });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: SMOOTH SCROLL
   Handles anchor links with offset for fixed navbar
────────────────────────────────────────────────────────── */
const SmoothScrollModule = (() => {
  return {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const href   = link.getAttribute('href');
          if (href === '#') return;

          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();

          const navH   = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
            10
          ) || 70;

          const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;

          window.scrollTo({ top, behavior: 'smooth' });
        });
      });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: ACTIVE NAV HIGHLIGHT
   Highlights nav links based on current scroll position
────────────────────────────────────────────────────────── */
const ActiveNavModule = (() => {
  let sections  = [];
  let navLinks  = [];
  let rafQueued = false;

  const update = () => {
    const offset = window.scrollY + 120;
    let current  = '';

    sections.forEach(({ el, id }) => {
      if (el.offsetTop <= offset) current = id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === current);
    });

    rafQueued = false;
  };

  const onScroll = () => {
    if (!rafQueued) {
      rafQueued = true;
      requestAnimationFrame(update);
    }
  };

  return {
    init() {
      document.querySelectorAll('section[id]').forEach((el) => {
        sections.push({ el, id: el.id });
      });

      document.querySelectorAll('.nav-link[data-nav]').forEach((link) => {
        navLinks.push(link);
      });

      window.addEventListener('scroll', onScroll, { passive: true });
      update();
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: AV-DOT ANIMATION
   Animates the dot grid in the About section
────────────────────────────────────────────────────────── */
const AvDotModule = (() => {
  return {
    init() {
      const dots = document.querySelectorAll('.av-dot.filled');
      if (!dots.length) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const toggle = () => {
        const randomDot = dots[Math.floor(Math.random() * dots.length)];
        randomDot.style.opacity = randomDot.style.opacity === '0.25' ? '0.65' : '0.25';
      };

      // Subtle flicker every 1.8s
      setInterval(toggle, 1800);
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: HERO ENTRANCE
   Staggered fade-in for hero content on page load
────────────────────────────────────────────────────────── */
const HeroEntranceModule = (() => {
  const selectors = [
    '.hero-status-badge',
    '.hero-name',
    '.hero-role',
    '.hero-desc',
    '.hero-ctas',
    '.hero-meta-row',
    '.cloud-visual',
    '.scroll-cue',
  ];

  return {
    init() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      selectors.forEach((sel, i) => {
        const el = document.querySelector(sel);
        if (!el) return;

        el.style.opacity   = '0';
        el.style.transform = 'translateY(22px)';

        setTimeout(() => {
          el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
          el.style.opacity    = '1';
          el.style.transform  = 'translateY(0)';
        }, 120 + i * 100);
      });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: CONTACT FORM
   Handles Formspree submission, validation, loading, toasts
────────────────────────────────────────────────────────── */
const ContactFormModule = (() => {
  let form = null;
  let submitBtn = null;
  let btnText = null;
  let btnLoader = null;
  let toastContainer = null;

  const showToast = (message, type = 'success') => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconStr = type === 'success' 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

    toast.innerHTML = `${iconStr} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    btnText.style.display = 'none';
    submitBtn.querySelector('.btn-icon').style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showToast('Message sent successfully!');
        form.reset();
      } else {
        const data = await response.json();
        if (Object.hasOwn(data, 'errors')) {
          showToast(data.errors.map(err => err.message).join(', '), 'error');
        } else {
          showToast('Oops! There was a problem submitting your form', 'error');
        }
      }
    } catch (error) {
      showToast('Oops! There was a problem submitting your form', 'error');
    } finally {
      btnText.style.display = 'block';
      submitBtn.querySelector('.btn-icon').style.display = 'block';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;
    }
  };

  return {
    init() {
      form = document.getElementById('contactForm');
      if (!form) return;
      
      submitBtn = document.getElementById('formSubmitBtn');
      btnText = submitBtn.querySelector('.btn-text');
      btnLoader = submitBtn.querySelector('.btn-loader');
      toastContainer = document.getElementById('toastContainer');

      form.addEventListener('submit', handleSubmit);
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: SCROLL PROGRESS
────────────────────────────────────────────────────────── */
const ScrollProgressModule = (() => {
  return {
    init() {
      const progressBar = document.getElementById('scrollProgress');
      if (!progressBar) return;
      
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = scrollTop / docHeight;
            progressBar.style.transform = `scaleX(${scrollPercent})`;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: BACK TO TOP
────────────────────────────────────────────────────────── */
const BackToTopModule = (() => {
  return {
    init() {
      const btn = document.getElementById('backToTop');
      if (!btn) return;
      
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 400) {
              btn.classList.add('visible');
            } else {
              btn.classList.remove('visible');
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: MAGNETIC BUTTONS
────────────────────────────────────────────────────────── */
const MagneticModule = (() => {
  return {
    init() {
      if (window.matchMedia('(hover: none)').matches) return; // Disable on touch
      
      const magnets = document.querySelectorAll('.btn-primary, .btn-outline, .btn-whatsapp, .contact-card, .floating-wa-btn');
      
      magnets.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
          btn.style.transform = `translate(${x}px, ${y}px)`;
          btn.style.transition = 'none'; // Snappy follow
        });
        
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
          btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease'; // Smooth reset
        });
      });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   MODULE: MOUSE BACKGROUND
────────────────────────────────────────────────────────── */
const MouseBackgroundModule = (() => {
  return {
    init() {
      if (window.matchMedia('(hover: none)').matches) return; // Disable on touch
      
      let ticking = false;
      window.addEventListener('mousemove', (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  };
})();

/* ──────────────────────────────────────────────────────────
   APP BOOTSTRAP
   Initialise all modules when DOM is ready
────────────────────────────────────────────────────────── */
const App = {
  init() {
    NavbarModule.init();
    ParallaxModule.init();
    TypewriterModule.init();
    CounterModule.init();
    ScrollRevealModule.init();
    GradeBarModule.init();
    StaggerModule.init();
    TiltModule.init();
    SmoothScrollModule.init();
    ActiveNavModule.init();
    AvDotModule.init();
    HeroEntranceModule.init();
    ContactFormModule.init();
    ScrollProgressModule.init();
    BackToTopModule.init();
    MagneticModule.init();
    MouseBackgroundModule.init();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
