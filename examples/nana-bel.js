(() => {
  'use strict';
  if (window.nadIntro) {
    const cover = document.querySelector('.hero-photo img');
    const imageReady = !cover || cover.complete ? Promise.resolve() : new Promise(resolve => {
      cover.addEventListener('load', resolve, {once:true});
      cover.addEventListener('error', resolve, {once:true});
    });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([imageReady, fontsReady]).then(() => window.nadIntro.ready());
  }

  const dialog = document.querySelector('.lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');
    let links = [], index = 0, opener = null, touchX = null, touchY = null;
    const show = (next) => {
      index = (next + links.length) % links.length;
      image.src = links[index].href;
      image.alt = links[index].querySelector('img').alt;
      caption.textContent = `${index + 1} / ${links.length}`;
    };
    document.querySelectorAll('[data-gallery]').forEach(gallery => {
      gallery.addEventListener('click', event => {
        const link = event.target.closest('a.photo-link');
        if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        links = [...gallery.querySelectorAll('a.photo-link')];
        opener = link;
        show(links.indexOf(link));
        dialog.showModal();
        document.body.classList.add('has-lightbox');
      });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('close', () => {
      document.body.classList.remove('has-lightbox');
      image.removeAttribute('src');
      opener?.focus({preventScroll:true});
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault();show(index + (event.key === 'ArrowLeft' ? -1 : 1));}
    });
    dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
    image.addEventListener('touchstart', event => {touchX=event.changedTouches[0].clientX;touchY=event.changedTouches[0].clientY;}, {passive:true});
    image.addEventListener('touchend', event => {
      if(touchX === null)return;
      const dx=event.changedTouches[0].clientX-touchX,dy=event.changedTouches[0].clientY-touchY;
      if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));
      touchX=null;
    }, {passive:true});
  }
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){entry.target.classList.remove('is-waiting');observer.unobserve(entry.target);}
    }), {rootMargin:'0px 0px 80px 0px'});
    document.querySelectorAll('.reveal').forEach(element => {element.classList.add('is-waiting');observer.observe(element);});
  }
})();
