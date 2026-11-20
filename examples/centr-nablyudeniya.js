(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const closeMenu = () => { if (!toggle || !menu) return; menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Открыть меню'); };
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); menu.hidden = !open; });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  const wide = window.matchMedia('(min-width: 1001px)');
  wide.addEventListener('change', e => { if (e.matches) closeMenu(); });
  const dialog = document.querySelector('#callback-dialog');
  document.querySelectorAll('[data-callback]').forEach(button => button.addEventListener('click', () => { if (dialog && !dialog.open) dialog.showModal(); }));
  dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', e => { const b = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom)) dialog.close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();

(() => {
  const form = document.querySelector('#callback-form');
  const dialog = document.querySelector('#callback-dialog');
  if (!form || !dialog) return;
  const phone = form.querySelector('[name="phone"]');
  const error = document.querySelector('#callback-error');
  const submit = form.querySelector('[type="submit"]');
  let pending = false;
  phone.addEventListener('input', () => { phone.setCustomValidity(''); error.textContent = ''; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    const digits = phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15 || !/^[+0-9() .-]+$/.test(phone.value)) {
      phone.setCustomValidity('Введите номер телефона, включая код страны или города.');
      phone.reportValidity(); return;
    }
    if (!form.reportValidity()) return;
    pending = true; submit.disabled = true; submit.textContent = 'Отправляем…'; error.textContent = '';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), signal: controller.signal, credentials: 'same-origin', headers: {'Accept':'application/json'} });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.data?.message || 'Не удалось отправить номер. Попробуйте позже.');
      dialog.querySelector('.callback-entry').hidden = true;
      dialog.querySelector('.callback-success').hidden = false;
      dialog.setAttribute('aria-labelledby', 'callback-success-title');
      dialog.querySelector('.callback-success h2').id = 'callback-success-title';
      dialog.querySelector('.success-close').focus();
      form.reset();
    } catch (failure) {
      error.textContent = failure.name === 'AbortError' ? 'Ответ сервера задерживается. Попробуйте позже или позвоните нам.' : (failure instanceof SyntaxError ? 'Отправка в локальном просмотре недоступна. Она заработает после установки темы и настройки почты.' : failure.message);
    } finally {
      clearTimeout(timer); pending = false; submit.disabled = false; submit.innerHTML = 'Жду звонка <span aria-hidden="true">↗</span>';
    }
  });
  dialog.querySelector('.success-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (pending) return;
    dialog.querySelector('.callback-entry').hidden = false;
    dialog.querySelector('.callback-success').hidden = true;
    dialog.setAttribute('aria-labelledby', 'callback-title');
    error.textContent = '';
  });
})();

(() => {
  const header = document.querySelector('.site-header');
  const links = [...document.querySelectorAll('.navigation a, .mobile-menu a')];
  const sections = ['solutions', 'services', 'process', 'contacts'].map(id => document.getElementById(id)).filter(Boolean);
  const top = document.querySelector('.floating-top');
  const phone = document.querySelector('#callback-phone');
  phone?.addEventListener('blur', () => {
    const raw = phone.value.trim();
    if (!/^[+0-9() .-]+$/.test(raw)) return;
    let digits = raw.replace(/\D/g, '');
    if (digits.length === 10) digits = '7' + digits;
    if (digits.length === 11 && /^[78]/.test(digits)) {
      phone.value = `+7 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7,9)}-${digits.slice(9)}`;
    }
  });
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const offset = (header?.offsetHeight || 0) + (document.querySelector('#wpadminbar')?.offsetHeight || 0) + 50;
    let active = '';
    sections.forEach(section => { if (section.getBoundingClientRect().top <= offset) active = section.id; });
    links.forEach(link => {
      const selected = !!active && new URL(link.href).hash === '#' + active;
      link.classList.toggle('is-current', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    header?.classList.toggle('is-scrolled', scrollY > 30);
    if (top) top.hidden = scrollY < 650;
  };
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, {passive:true});
  const resize = () => {
    document.documentElement.style.setProperty('--header-height', `${header?.offsetHeight || 80}px`);
    update();
  };
  if (header && 'ResizeObserver' in window) new ResizeObserver(resize).observe(header);
  window.addEventListener('resize', resize);
  resize();
})();

(() => {
 const root=document.querySelector('.object-selector'); if(!root)return;
 const navigation=root.querySelector('.object-navigation');
 const choices=[...root.querySelectorAll('.object-choice')];
 const panels=[...root.querySelectorAll('.object-panel')];
 const activate=(button,focus=false)=>{
  choices.forEach(choice=>{const active=choice===button;choice.setAttribute('aria-selected',String(active));choice.tabIndex=active?0:-1;});
  panels.forEach(panel=>panel.hidden=panel.id!==button.dataset.object);
  if(focus)button.focus();
 };
 navigation.setAttribute('role','tablist');navigation.setAttribute('aria-label','Тип объекта');
 choices.forEach((button,index)=>{button.id='object-tab-'+index;button.setAttribute('role','tab');const panel=document.getElementById(button.dataset.object);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);panel.tabIndex=0;button.addEventListener('click',()=>activate(button));button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%choices.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index-1+choices.length)%choices.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=choices.length-1;else return;event.preventDefault();activate(choices[next],true);});});
 root.classList.add('objects-enhanced');activate(choices[0]);
})();

(() => {
  const bar = document.querySelector('.mobile-actions');
  const hero = document.querySelector('.hero');
  const contacts = document.getElementById('contacts');
  if (!bar || !hero || !('IntersectionObserver' in window)) { bar?.classList.add('is-visible'); return; }
  let pastHero = false, atContacts = false;
  const sync = () => bar.classList.toggle('is-visible', pastHero && !atContacts);
  new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting; sync(); }).observe(hero);
  if (contacts) new IntersectionObserver(([entry]) => { atContacts = entry.isIntersecting; sync(); }, {threshold: .25}).observe(contacts);
})();
