/* ── main.js — Norvelix ── */

function readMetaContent(name) {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() || '';
}

function isConfigured(value) {
  return value && !value.includes('REPLACE_ME');
}

function loadScript(src, onLoad) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  if (onLoad) script.addEventListener('load', onLoad, { once: true });
  document.head.appendChild(script);
}

function initGoogleAnalytics() {
  const measurementId = readMetaContent('google-analytics-id');
  if (!isConfigured(measurementId)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);
}

function initMicrosoftClarity() {
  const projectId = readMetaContent('microsoft-clarity-id');
  if (!isConfigured(projectId)) return;

  (function clarity(windowObject, documentObject, tagName, clarityName, projectCode) {
    windowObject[clarityName] = windowObject[clarityName] || function clarityQueue() {
      (windowObject[clarityName].q = windowObject[clarityName].q || []).push(arguments);
    };
    const script = documentObject.createElement(tagName);
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${projectCode}`;
    const firstScript = documentObject.getElementsByTagName(tagName)[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }(window, document, 'script', 'clarity', projectId));
}

const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menu-toggle');
const navPanel = document.getElementById('nav-panel');
const heroSequence = document.querySelector('.hero-sequence');

function syncNavOnScroll() {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncHeroSequence() {
  if (!heroSequence) return;
  const rect = heroSequence.getBoundingClientRect();
  const total = Math.max(rect.height - window.innerHeight, 1);
  const progress = clamp((-rect.top) / total, 0, 1);
  heroSequence.classList.toggle('is-beat-2', progress >= 0.18);
  heroSequence.classList.toggle('is-beat-3', progress >= 0.42);
  heroSequence.classList.toggle('is-beat-4', progress >= 0.68);
  heroSequence.classList.toggle('is-beat-5', progress >= 0.8);
}

window.addEventListener('scroll', syncNavOnScroll, { passive: true });
window.addEventListener('scroll', syncHeroSequence, { passive: true });

function setMenuState(isOpen) {
  if (!menuToggle || !navPanel) return;
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  const label = menuToggle.getAttribute(isOpen ? 'data-close-label' : 'data-open-label');
  if (label) menuToggle.setAttribute('aria-label', label);
  navPanel.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
}

function initMenu() {
  if (!menuToggle || !navPanel) return;
  syncNavOnScroll();
  syncHeroSequence();
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });
  navPanel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuState(false));
  });
  document.addEventListener('click', (event) => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    if (nav && !nav.contains(event.target)) setMenuState(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });
  window.addEventListener('resize', () => {
    syncHeroSequence();
    if (window.innerWidth > 768) setMenuState(false);
  });
}

/* ── Scroll fade ── */
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll('.fade-up').forEach((el) => fadeObserver.observe(el));

/* ── FAQ ── */
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

/* ── Portfolio tabs ── */
function initPortfolioTabs() {
  const tabs = document.querySelectorAll('.ptab');
  const panels = document.querySelectorAll('.portfolio-panel');
  if (!tabs.length) return;

  const tabList = document.querySelector('.portfolio-tabs');
  if (tabList) tabList.setAttribute('role', 'tablist');

  tabs.forEach((tab, index) => {
    const target = tab.getAttribute('data-tab');
    const panel = document.getElementById('tab-' + target);
    const tabId = `portfolio-tab-${target || index}`;
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
    tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
    if (panel) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      panel.hidden = !panel.classList.contains('active');
    }
  });

  function activatePortfolioTab(tab) {
    const target = tab.getAttribute('data-tab');
    if (!target) return;

    tabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.tabIndex = -1;
    });
    panels.forEach((p) => {
      p.classList.remove('active');
      p.hidden = true;
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = 0;
    const targetPanel = document.getElementById('tab-' + target);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.hidden = false;
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activatePortfolioTab(tab);
    });

    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activatePortfolioTab(tabs[nextIndex]);
    });
  });
}

/* ── Process stepper ── */
function initStepper() {
  const stepBtns = document.querySelectorAll('.step-btn');
  const stepPanels = document.querySelectorAll('.step-panel');
  const stepNav = document.querySelector('.stepper-nav');
  if (!stepBtns.length) return;

  if (stepNav) stepNav.setAttribute('role', 'tablist');

  function activateStep(btn) {
    const index = btn.getAttribute('data-step');
    if (!index) return;

    stepBtns.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
    });
    stepPanels.forEach((p) => {
      p.classList.remove('active');
      p.hidden = true;
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.tabIndex = 0;
    const targetPanel = document.querySelector('.step-panel[data-panel="' + index + '"]');
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.hidden = false;
    }
  }

  stepBtns.forEach((btn, index) => {
    const step = btn.getAttribute('data-step') || String(index);
    const panel = document.querySelector('.step-panel[data-panel="' + step + '"]');
    const buttonId = `step-btn-${step}`;
    btn.id = buttonId;
    btn.setAttribute('role', 'tab');
    btn.tabIndex = btn.classList.contains('active') ? 0 : -1;
    btn.setAttribute('aria-selected', String(btn.classList.contains('active')));
    if (panel) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', buttonId);
      panel.hidden = !panel.classList.contains('active');
    }

    btn.addEventListener('click', () => {
      activateStep(btn);
    });

    btn.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const isForward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      const direction = isForward ? 1 : -1;
      const nextIndex = (index + direction + stepBtns.length) % stepBtns.length;
      stepBtns[nextIndex].focus();
      activateStep(stepBtns[nextIndex]);
    });
  });
}

/* ── Tally embed ── */
function buildTallyEmbedUrl(url) {
  const hasQuery = url.includes('?');
  return `${url}${hasQuery ? '&' : '?'}transparentBackground=1&dynamicHeight=1`;
}

function initTallyEmbed() {
  const container = document.querySelector('[data-tally-embed]');
  if (!container) return;
  const frame = container.querySelector('[data-tally-frame]');
  const link  = container.querySelector('[data-tally-link]');
  const note  = container.querySelector('[data-tally-note]');
  const url   = (container.getAttribute('data-tally-url') || '').trim();

  if (!url || url.includes('REPLACE_ME')) {
    if (frame) frame.hidden = true;
    if (link)  link.hidden  = true;
    if (note)  note.hidden  = false;
    return;
  }

  if (frame) frame.src = buildTallyEmbedUrl(url);
  if (link)  link.href = url.replace('/embed/', '/r/').split('?')[0];
  if (note)  note.hidden = true;
}

initMenu();
initFaq();
initPortfolioTabs();
initStepper();
initTallyEmbed();
initGoogleAnalytics();
initMicrosoftClarity();
window.addEventListener('load', syncHeroSequence, { once: true });
