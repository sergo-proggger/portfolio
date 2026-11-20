document.addEventListener('DOMContentLoaded',()=>{
  document.body.classList.add('is-loading');

  const preloader=document.querySelector('.site-preloader');
  const hidePreloader=()=>{
    if(!preloader)return;
    preloader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    setTimeout(()=>preloader.remove(),700);
  };
  if(document.readyState==='complete') setTimeout(hidePreloader,500);
  else window.addEventListener('load',()=>setTimeout(hidePreloader,500),{once:true});
  setTimeout(hidePreloader,2400);

  const b=document.querySelector('.menu-btn'),n=document.querySelector('.main-nav');
  if(b&&n){
    b.addEventListener('click',()=>{
      const o=n.classList.toggle('is-open');
      b.setAttribute('aria-expanded',o?'true':'false');
    });
    n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      n.classList.remove('is-open');b.setAttribute('aria-expanded','false');
    }));
  }

  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}
  }),{threshold:.12,rootMargin:'0px 0px -40px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  const floatingContact=document.querySelector('[data-floating-contact]');
  const heroSection=document.getElementById('top');
  const footerSection=document.querySelector('.site-footer');
  if(floatingContact&&heroSection){
    let pastHero=false, atFooter=false;
    const updateVisibility=()=>floatingContact.classList.toggle('is-visible',pastHero&&!atFooter);
    const heroWatch=new IntersectionObserver(es=>es.forEach(e=>{
      pastHero=!e.isIntersecting;updateVisibility();
    }),{threshold:0});
    heroWatch.observe(heroSection);
    if(footerSection){
      const footerWatch=new IntersectionObserver(es=>es.forEach(e=>{
        atFooter=e.isIntersecting;updateVisibility();
      }),{threshold:0,rootMargin:'0px 0px -40px'});
      footerWatch.observe(footerSection);
    }
  }else if(floatingContact){
    floatingContact.classList.add('is-visible');
  }

  const progress=document.querySelector('.scroll-progress span');
  const updateProgress=()=>{
    if(!progress)return;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const pct=max>0?(window.scrollY/max)*100:0;
    progress.style.width=pct+'%';
  };
  updateProgress();
  window.addEventListener('scroll',updateProgress,{passive:true});

  const tilt=document.querySelector('[data-tilt]');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(tilt&&!reduce&&window.matchMedia('(pointer:fine)').matches){
    tilt.addEventListener('pointermove',e=>{
      const r=tilt.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      tilt.style.transform=`perspective(900px) rotateY(${x*4}deg) rotateX(${-y*4}deg) translateY(-2px)`;
    });
    tilt.addEventListener('pointerleave',()=>{tilt.style.transform='';});
  }

  document.querySelectorAll('.btn').forEach(btn=>{
    if(reduce||!window.matchMedia('(pointer:fine)').matches)return;
    btn.addEventListener('pointermove',e=>{
      const r=btn.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.08;
      const y=(e.clientY-r.top-r.height/2)*.12;
      btn.style.transform=`translate(${x}px,${y}px) translateY(-2px)`;
    });
    btn.addEventListener('pointerleave',()=>btn.style.transform='');
  });
});

document.addEventListener('submit',e=>{
  const form=e.target.closest('[data-demo-form]');
  if(!form)return;
  e.preventDefault();
  if(typeof emlContact==='undefined'||!emlContact.ajaxUrl)return;

  const successMsg=form.querySelector('.demo-form-success');
  const errorMsg=form.querySelector('.demo-form-error');
  const btn=form.querySelector('button[type="submit"]');
  const btnLabel=btn?btn.querySelector('.btn-label'):null;

  if(successMsg)successMsg.hidden=true;
  if(errorMsg){errorMsg.hidden=true;errorMsg.textContent='';}
  if(btn){btn.disabled=true;btn.dataset.originalLabel=btnLabel?btnLabel.innerHTML:btn.innerHTML;if(btnLabel)btnLabel.textContent='Отправляю…';else btn.textContent='Отправляю…';}

  const data=new FormData(form);
  data.append('action','eml_contact_submit');
  data.append('nonce',emlContact.nonce);

  fetch(emlContact.ajaxUrl,{method:'POST',credentials:'same-origin',body:data})
    .then(r=>r.json())
    .then(res=>{
      if(res&&res.success){
        form.reset();
        if(successMsg){
          successMsg.textContent=(res.data&&res.data.message)||'Спасибо! Заявка отправлена.';
          successMsg.hidden=false;
          successMsg.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
      }else{
        if(errorMsg){
          errorMsg.textContent=(res&&res.data&&res.data.message)||'Не получилось отправить заявку. Попробуйте ещё раз.';
          errorMsg.hidden=false;
          errorMsg.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
      }
    })
    .catch(()=>{
      if(errorMsg){
        errorMsg.textContent='Не получилось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
        errorMsg.hidden=false;
      }
    })
    .finally(()=>{
      if(btn){
        btn.disabled=false;
        if(btnLabel)btnLabel.innerHTML=btn.dataset.originalLabel;
        else btn.innerHTML=btn.dataset.originalLabel;
      }
    });
});


// Manual lesson photo slider
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-lesson-slider]').forEach(slider=>{
    const track=slider.querySelector('.lesson-slider-track');
    const slides=[...slider.querySelectorAll('.lesson-slide')];
    const dots=[...slider.querySelectorAll('[data-slide-dot]')];
    const prev=slider.querySelector('[data-slide-prev]');
    const next=slider.querySelector('[data-slide-next]');
    const current=slider.querySelector('[data-slide-current]');
    const total=slider.querySelector('[data-slide-total]');
    if(!track||slides.length<2)return;
    let index=0;
    if(total)total.textContent=slides.length;
    const render=()=>{
      track.style.transform=`translateX(-${index*100}%)`;
      slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===index));
      dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
      if(current)current.textContent=index+1;
    };
    const go=nextIndex=>{index=(nextIndex+slides.length)%slides.length;render();};
    prev?.addEventListener('click',()=>go(index-1));
    next?.addEventListener('click',()=>go(index+1));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
    slider.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}
      if(e.key==='ArrowRight'){e.preventDefault();go(index+1);}
    });
    let startX=null;
    slider.addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX??null;},{passive:true});
    slider.addEventListener('touchend',e=>{
      if(startX===null)return;
      const endX=e.changedTouches[0]?.clientX??startX;
      const delta=endX-startX; startX=null;
      if(Math.abs(delta)>45)go(index+(delta<0?1:-1));
    },{passive:true});
    render();
  });
});


// Manual testimonial slider
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-testimonial-slider]').forEach(slider=>{
    const track=slider.querySelector('.testimonial-slider-track');
    const slides=[...slider.querySelectorAll('.testimonial-slide')];
    const dots=[...slider.querySelectorAll('[data-t-slide-dot]')];
    const prev=slider.querySelector('[data-t-slide-prev]');
    const next=slider.querySelector('[data-t-slide-next]');
    const current=slider.querySelector('[data-t-slide-current]');
    const total=slider.querySelector('[data-t-slide-total]');
    if(!track||slides.length<2)return;
    let index=0;
    if(total)total.textContent=slides.length;
    const render=()=>{
      track.style.transform=`translateX(-${index*100}%)`;
      slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===index));
      dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
      if(current)current.textContent=index+1;
    };
    const go=nextIndex=>{index=(nextIndex+slides.length)%slides.length;render();};
    prev?.addEventListener('click',()=>go(index-1));
    next?.addEventListener('click',()=>go(index+1));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
    slider.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}
      if(e.key==='ArrowRight'){e.preventDefault();go(index+1);}
    });
    let startX=null;
    slider.addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX??null;},{passive:true});
    slider.addEventListener('touchend',e=>{
      if(startX===null)return;
      const endX=e.changedTouches[0]?.clientX??startX;
      const delta=endX-startX; startX=null;
      if(Math.abs(delta)>45)go(index+(delta<0?1:-1));
    },{passive:true});
    render();
  });
});
