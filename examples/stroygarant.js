(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // Mobile navigation.
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Light / dark theme. Preference is persisted in the browser.
  const themeToggle = document.querySelector('.theme-toggle');
  const setTheme = theme => {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('sg-theme', theme); } catch (e) {}
    if (themeToggle) {
      const isDark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
    }
  };
  if (themeToggle) {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    themeToggle.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  }

  // Scroll progress, compact header, and back-to-top button.
  const progress = document.querySelector('.scroll-progress span');
  const header = document.querySelector('.site-header');
  const backToTop = document.querySelector('.back-to-top');
  const hero = document.querySelector('.hero');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progress) progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
      header?.classList.toggle('is-scrolled', y > 18);
      backToTop?.classList.toggle('show', y > 650);
      if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 760) {
        hero.style.setProperty('--hero-shift', `${Math.min(42, y * 0.055)}px`);
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Reveal-on-scroll animation with small automatic staggering.
  const revealTargets = [
    '.section-kicker', '.section-head', '.service-card', '.project-card',
    '.process-grid article', '.about-visual', '.about-copy', '.contact-list',
    '.form-card', '.trust-grid > div', '.cta-band .container > *'
  ];
  const revealEls = [...document.querySelectorAll(revealTargets.join(','))];
  revealEls.forEach((el, i) => {
    el.classList.add('reveal-item');
    el.style.setProperty('--reveal-delay', `${(i % 4) * 65}ms`);
  });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -6% 0px'});
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // A restrained pointer glow gives service cards and the form a more reactive feel.
  if (window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.service-card, .process-grid article, .form-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  // Project gallery modal.
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return;
  const img = modal.querySelector('img');
  const counter = modal.querySelector('.gallery-counter');
  let images = [], idx = 0;
  const show = (direction = 1) => {
    if (!images.length) return;
    img.classList.remove('gallery-image-in');
    img.classList.add('gallery-image-out');
    window.setTimeout(() => {
      img.src = images[idx];
      counter.textContent = `${idx + 1} / ${images.length}`;
      img.classList.remove('gallery-image-out');
      img.classList.add('gallery-image-in');
    }, direction ? 120 : 0);
  };
  document.querySelectorAll('.project-card').forEach(card => {
    const btn = card.querySelector('.project-open');
    const data = card.querySelector('.project-data');
    btn?.addEventListener('click', () => {
      try { images = JSON.parse(data.textContent) || []; } catch (e) { images = []; }
      if (!images.length) return;
      idx = 0;
      show(0);
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    img.src = '';
  };
  modal.querySelector('.gallery-close').addEventListener('click', close);
  modal.querySelector('.gallery-prev').addEventListener('click', () => { idx = (idx - 1 + images.length) % images.length; show(-1); });
  modal.querySelector('.gallery-next').addEventListener('click', () => { idx = (idx + 1) % images.length; show(1); });
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') { idx = (idx - 1 + images.length) % images.length; show(-1); }
    if (e.key === 'ArrowRight') { idx = (idx + 1) % images.length; show(1); }
  });
})();

/* v11 header polish */
(function(){var h=document.querySelector('.site-header');if(!h)return;var sync=function(){h.classList.toggle('is-scrolled',window.scrollY>24)};sync();window.addEventListener('scroll',sync,{passive:true});})();
