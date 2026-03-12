/* ---- CURSOR ---- */
const cursor = document.getElementById('cursor') as HTMLElement;
const ring = document.getElementById('cursorRing') as HTMLElement;

let mx: number = 0;
let my: number = 0;
let rx: number = 0;
let ry: number = 0;

document.addEventListener('mousemove', (e: MouseEvent): void => {
  mx = e.clientX;
  my = e.clientY;
});

function animCursor(): void {
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

/* ---- NETWORK CANVAS ---- */
interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
}

const canvas = document.getElementById('networkCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function resizeCanvas(): void {
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = 200 * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
resizeCanvas();

const W = (): number => canvas.offsetWidth;
const H: number = 200;

const nodes: NetworkNode[] = Array.from({ length: 22 }, (): NetworkNode => ({
  x: Math.random() * W(),
  y: Math.random() * H,
  vx: (Math.random() - 0.5) * 0.4,
  vy: (Math.random() - 0.5) * 0.4,
  r: Math.random() * 2.5 + 1.5,
  pulse: Math.random() * Math.PI * 2,
}));

function drawNetwork(_ts: number): void {
  ctx.clearRect(0, 0, W(), H);

  nodes.forEach((n: NetworkNode): void => {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > W()) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    n.pulse += 0.03;
  });

  // edges
  nodes.forEach((a: NetworkNode, i: number): void => {
    nodes.slice(i + 1).forEach((b: NetworkNode): void => {
      const d: number = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 140) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(99,210,255,${(1 - d / 140) * 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
  });

  // nodes
  nodes.forEach((n: NetworkNode): void => {
    const pulse: number = Math.sin(n.pulse) * 0.4 + 0.6;
    const grd: CanvasGradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
    grd.addColorStop(0, 'rgba(99,210,255,0.9)');
    grd.addColorStop(1, 'rgba(99,210,255,0)');
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r * 4 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = '#63d2ff';
    ctx.fill();
  });

  requestAnimationFrame(drawNetwork);
}
requestAnimationFrame(drawNetwork);
window.addEventListener('resize', resizeCanvas);

/* ---- SCROLL REVEAL ---- */
const reveals: NodeListOf<Element> = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
  entries.forEach((e: IntersectionObserverEntry): void => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });
reveals.forEach((r: Element): void => observer.observe(r));

/* ---- COUNTER ANIMATION ---- */
function animateCounter(el: HTMLElement): void {
  const target: number = +(el.dataset['target'] ?? 0);
  const suffix: string = el.dataset['suffix'] ?? '';
  const duration: number = 1800;
  const start: number = performance.now();

  function step(now: number): void {
    const t: number = Math.min((now - start) / duration, 1);
    const ease: number = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target).toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
  entries.forEach((e: IntersectionObserverEntry): void => {
    if (e.isIntersecting) {
      (e.target.querySelectorAll('.stat-num') as NodeListOf<HTMLElement>).forEach(animateCounter);
      (e.target.querySelectorAll('.stat-bar-fill') as NodeListOf<HTMLElement>).forEach((bar: HTMLElement): void => {
        setTimeout((): void => bar.classList.add('animated'), 200);
      });
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stats-wrap').forEach((s: Element): void => statsObserver.observe(s));

/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach((a: Element): void => {
  a.addEventListener('click', (e: Event): void => {
    const href: string | null = (a as HTMLAnchorElement).getAttribute('href');
    if (!href || href === '#') return;
    const target: Element | null = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- NETWORK DROPDOWN ---- */
const trigger  = document.getElementById('networkTrigger') as HTMLElement;
const menu     = document.getElementById('networkMenu') as HTMLElement;
const wrap     = document.getElementById('networkDropdown') as HTMLElement;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function openDropdown(): void {
  if (closeTimer !== null) clearTimeout(closeTimer);
  menu.classList.add('open');
  trigger.classList.add('open');
  trigger.setAttribute('aria-expanded', 'true');
}

function closeDropdown(): void {
  closeTimer = setTimeout((): void => {
    menu.classList.remove('open');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }, 120);
}

wrap.addEventListener('mouseenter', openDropdown);
wrap.addEventListener('mouseleave', closeDropdown);

trigger.addEventListener('click', (e: Event): void => {
  e.stopPropagation();
  menu.classList.contains('open') ? closeDropdown() : openDropdown();
});

document.addEventListener('click', (e: Event): void => {
  if (!wrap.contains(e.target as Node)) closeDropdown();
});

document.addEventListener('keydown', (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    closeDropdown();
    closeDevDropdown();
  }
});

/* ---- DEVELOPERS DROPDOWN ---- */
const devTrigger  = document.getElementById('devTrigger') as HTMLElement;
const devMenu     = document.getElementById('devMenu') as HTMLElement;
const devWrap     = document.getElementById('devDropdown') as HTMLElement;
let devCloseTimer: ReturnType<typeof setTimeout> | null = null;

function openDevDropdown(): void {
  if (devCloseTimer !== null) clearTimeout(devCloseTimer);
  devMenu.classList.add('open');
  devTrigger.classList.add('open');
  devTrigger.setAttribute('aria-expanded', 'true');
}

function closeDevDropdown(): void {
  devCloseTimer = setTimeout((): void => {
    devMenu.classList.remove('open');
    devTrigger.classList.remove('open');
    devTrigger.setAttribute('aria-expanded', 'false');
  }, 120);
}

devWrap.addEventListener('mouseenter', openDevDropdown);
devWrap.addEventListener('mouseleave', closeDevDropdown);

devTrigger.addEventListener('click', (e: Event): void => {
  e.stopPropagation();
  devMenu.classList.contains('open') ? closeDevDropdown() : openDevDropdown();
});

document.addEventListener('click', (e: Event): void => {
  if (!devWrap.contains(e.target as Node)) closeDevDropdown();
});
