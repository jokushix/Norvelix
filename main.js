/* ── main.js — Nexon Labs ── */

const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menu-toggle');
const navPanel = document.getElementById('nav-panel');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

function setMenuState(isOpen) {
  if (!menuToggle || !navPanel) return;

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  navPanel.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
}

function initMenu() {
  if (!menuToggle || !navPanel) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  navPanel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuState(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setMenuState(false);
  });
}

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.fade-up').forEach((el) => fadeObserver.observe(el));

function setFaqState(item, expanded) {
  const button = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');

  item.classList.toggle('open', expanded);
  button.setAttribute('aria-expanded', String(expanded));
  answer.hidden = !expanded;
}

function initFaq() {
  document.querySelectorAll('.faq-item').forEach((item) => setFaqState(item, false));

  document.querySelectorAll('.faq-q').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-item').forEach((faqItem) => setFaqState(faqItem, false));
      if (!isOpen) setFaqState(item, true);
    });
  });
}

function buildTallyEmbedUrl(url) {
  const hasQuery = url.includes('?');
  return `${url}${hasQuery ? '&' : '?'}transparentBackground=1&dynamicHeight=1`;
}

function initTallyEmbed() {
  const container = document.querySelector('[data-tally-embed]');
  if (!container) return;

  const frame = container.querySelector('[data-tally-frame]');
  const link = container.querySelector('[data-tally-link]');
  const note = container.querySelector('[data-tally-note]');
  const url = (container.getAttribute('data-tally-url') || '').trim();

  if (!url || url.includes('REPLACE_ME')) {
    if (frame) frame.hidden = true;
    if (link) link.hidden = true;
    if (note) note.hidden = false;
    return;
  }

  if (frame) frame.src = buildTallyEmbedUrl(url);
  if (link) link.href = url.replace('/embed/', '/r/').split('?')[0];
  if (note) note.hidden = true;
}

initMenu();
initFaq();
initTallyEmbed();
