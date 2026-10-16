const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');

if (menuToggle && navigation) {
  const setMenuOpen = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    navigation.classList.toggle('is-open', open);
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('header')) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
  window.matchMedia('(max-width: 720px)').addEventListener('change', () => setMenuOpen(false));
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('[data-list-toggle]').forEach((button) => {
  const list = document.getElementById(button.getAttribute('aria-controls'));
  if (!list) return;
  let animation;
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    const wasHidden = list.hidden;
    const currentHeight = list.getBoundingClientRect().height;
    const currentStyle = getComputedStyle(list);
    const startOpacity = wasHidden ? 0 : currentStyle.opacity;
    const startMarginTop = wasHidden ? '0px' : currentStyle.marginTop;
    const startMarginBottom = wasHidden ? '0px' : currentStyle.marginBottom;
    animation?.cancel();
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', `${open ? 'Скрыть' : 'Показать'} ${button.dataset.listToggle}`);
    if (reducedMotion.matches || !list.animate) {
      list.hidden = !open;
      list.style.removeProperty('overflow');
      return;
    }
    list.hidden = false;
    const targetStyle = getComputedStyle(list);
    list.style.overflow = 'hidden';
    animation = list.animate([
      { height: currentHeight + 'px', opacity: startOpacity, marginTop: startMarginTop, marginBottom: startMarginBottom },
      { height: open ? list.scrollHeight + 'px' : '0px', opacity: open ? 1 : 0, marginTop: open ? targetStyle.marginTop : '0px', marginBottom: open ? targetStyle.marginBottom : '0px' }
    ], { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    animation.onfinish = () => {
      list.hidden = !open;
      list.style.removeProperty('overflow');
      animation = null;
    };
  });
});

// Content stays visible if JavaScript or IntersectionObserver is unavailable.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('is-visible');
      observer.unobserve(target);
      target.addEventListener('transitionend', () => {
        target.classList.remove('is-reveal-ready', 'is-visible');
      }, { once: true });
    });
  }, { threshold: .08 });
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    // Accordion contents must stay visible while their container expands.
    if (element.closest('.list')) return;
    element.classList.add('is-reveal-ready');
    observer.observe(element);
  });
}

// The three tabs point to real sections and remain available on every page.
const appNavigation = document.querySelector('.app-nav');
if (appNavigation) {
  const tabs = Array.from(appNavigation.querySelectorAll('[data-tab]'));
  const setActiveTab = (name) => {
    tabs.forEach((tab) => {
      if (tab.dataset.tab === name) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
  };

  const scholars = document.getElementById('ss');
  const categories = document.getElementById('categories');
  if (scholars && categories) {
    const syncActiveTab = () => {
      const threshold = window.innerHeight * .45;
      setActiveTab(categories.getBoundingClientRect().top <= threshold ? 'categories' :
        scholars.getBoundingClientRect().top <= threshold ? 'scholars' : 'home');
    };
    let framePending = false;
    window.addEventListener('scroll', () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        syncActiveTab();
        framePending = false;
      });
    }, { passive: true });
    window.addEventListener('resize', syncActiveTab);
    window.addEventListener('pageshow', syncActiveTab);
    window.addEventListener('hashchange', syncActiveTab);
    syncActiveTab();
  }
}
