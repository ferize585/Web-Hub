"use strict";
/* ---- CURSOR ---- */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0;
let my = 0;
let rx = 0;
let ry = 0;
document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
});
function animCursor() {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
}
animCursor();
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = 200 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
resizeCanvas();
const W = () => canvas.offsetWidth;
const H = 200;
const nodes = Array.from({ length: 22 }, () => ({
    x: Math.random() * W(),
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2.5 + 1.5,
    pulse: Math.random() * Math.PI * 2,
}));
function drawNetwork(_ts) {
    ctx.clearRect(0, 0, W(), H);
    nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W())
            n.vx *= -1;
        if (n.y < 0 || n.y > H)
            n.vy *= -1;
        n.pulse += 0.03;
    });
    // edges
    nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach((b) => {
            const d = Math.hypot(a.x - b.x, a.y - b.y);
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
    nodes.forEach((n) => {
        const pulse = Math.sin(n.pulse) * 0.4 + 0.6;
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
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
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (e.isIntersecting)
            e.target.classList.add('visible');
    });
}, { threshold: 0.12 });
reveals.forEach((r) => observer.observe(r));
/* ---- COUNTER ANIMATION ---- */
function animateCounter(el) {
    var _a, _b;
    const target = +((_a = el.dataset['target']) !== null && _a !== void 0 ? _a : 0);
    const suffix = (_b = el.dataset['suffix']) !== null && _b !== void 0 ? _b : '';
    const duration = 1800;
    const start = performance.now();
    function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target).toLocaleString() + suffix;
        if (t < 1)
            requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.stat-num').forEach(animateCounter);
            e.target.querySelectorAll('.stat-bar-fill').forEach((bar) => {
                setTimeout(() => bar.classList.add('animated'), 200);
            });
            statsObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.stats-wrap').forEach((s) => statsObserver.observe(s));
/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#')
            return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
/* ---- NETWORK DROPDOWN ---- */
const trigger = document.getElementById('networkTrigger');
const menu = document.getElementById('networkMenu');
const wrap = document.getElementById('networkDropdown');
let closeTimer = null;
function openDropdown() {
    if (closeTimer !== null)
        clearTimeout(closeTimer);
    menu.classList.add('open');
    trigger.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
}
function closeDropdown() {
    closeTimer = setTimeout(() => {
        menu.classList.remove('open');
        trigger.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    }, 120);
}
wrap.addEventListener('mouseenter', openDropdown);
wrap.addEventListener('mouseleave', closeDropdown);
trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeDropdown() : openDropdown();
});
document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target))
        closeDropdown();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDropdown();
        closeDevDropdown();
    }
});
/* ---- DEVELOPERS DROPDOWN ---- */
const devTrigger = document.getElementById('devTrigger');
const devMenu = document.getElementById('devMenu');
const devWrap = document.getElementById('devDropdown');
let devCloseTimer = null;
function openDevDropdown() {
    if (devCloseTimer !== null)
        clearTimeout(devCloseTimer);
    devMenu.classList.add('open');
    devTrigger.classList.add('open');
    devTrigger.setAttribute('aria-expanded', 'true');
}
function closeDevDropdown() {
    devCloseTimer = setTimeout(() => {
        devMenu.classList.remove('open');
        devTrigger.classList.remove('open');
        devTrigger.setAttribute('aria-expanded', 'false');
    }, 120);
}
devWrap.addEventListener('mouseenter', openDevDropdown);
devWrap.addEventListener('mouseleave', closeDevDropdown);
devTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    devMenu.classList.contains('open') ? closeDevDropdown() : openDevDropdown();
});
document.addEventListener('click', (e) => {
    if (!devWrap.contains(e.target))
        closeDevDropdown();
});
