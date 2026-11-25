const $ = selector => document.querySelector(selector);
const menu=$('#menu-toggle'),nav=$('#navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Apri navigazione');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Chiudi navigazione':'Apri navigazione');nav.classList.toggle('open',open);});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:0.08});document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('animate');observer.observe(el);});}

const serviceSlugs = ["installazione-caldaie","assistenza-caldaie","servizi-idraulici","impianti-idraulici","impianti-elettrici"];
function openLegacyService(){
  if (!$('#service-grid') || !location.hash.startsWith('#servizio/')) return;
  const slug = location.hash.slice('#servizio/'.length);
  location.replace(serviceSlugs.includes(slug) ? 'servizi/' + slug + '.html' : '#servizi');
}
window.addEventListener('hashchange', openLegacyService);
openLegacyService();

const grid = $('#service-grid');
if (grid) {
  const desktop = matchMedia('(min-width: 801px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const previous = $('#service-prev');
  const next = $('#service-next');
  const slider = grid.parentElement;
  let position = 0;
  let direction = 1;
  let visible = false;
  let timer;

  const lastPosition = grid.children.length - 3;
  function schedule() {
    clearTimeout(timer);
    if (reducedMotion.matches || !visible || !desktop.matches || document.hidden ||
        slider.matches(':hover') || slider.contains(document.activeElement)) return;
    timer = setTimeout(() => {
      if (position === lastPosition) direction = -1;
      if (position === 0) direction = 1;
      slide(position + direction);
      schedule();
    }, 5000);
  }

  function slide(index, instant = false) {
    position = Math.max(0, Math.min(lastPosition, index));
    grid.scrollTo({
      left: grid.children[position].offsetLeft - grid.children[0].offsetLeft,
      behavior: instant || reducedMotion.matches ? 'instant' : 'smooth'
    });
  }

  function syncLayout() {
    previous.hidden = next.hidden = !desktop.matches;
    grid.classList.toggle('service-carousel', desktop.matches);
    slide(desktop.matches ? position : 0, true);
    schedule();
  }

  function step(amount) {
    slide((position + amount + lastPosition + 1) % (lastPosition + 1));
    direction = amount;
    schedule();
  }

  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  slider.addEventListener('focusin', event => {
    if (desktop.matches) {
      const index = Array.from(grid.children).indexOf(event.target);
      if (index >= 0 && (index < position || index > position + 2)) slide(index, true);
    }
    schedule();
  });
  slider.addEventListener('focusout', () => setTimeout(schedule, 0));
  slider.addEventListener('pointerenter', schedule);
  slider.addEventListener('pointerleave', schedule);
  desktop.addEventListener('change', syncLayout);
  reducedMotion.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('resize', syncLayout);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, {threshold: 0.4}).observe(grid);
  }
  syncLayout();
}
