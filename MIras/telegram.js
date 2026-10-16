(() => {
  const app = window.Telegram?.WebApp;
  if (!app || app.platform === 'unknown') return;

  const root = document.documentElement;
  const home = new URL('index.html', document.currentScript.src);
  const basePath = new URL('.', home).pathname;
  const isHome = location.pathname === home.pathname || location.pathname === basePath;
  root.dataset.telegram = 'true';

  const applyTheme = () => {
    root.dataset.telegramTheme = app.colorScheme;
    const background = app.colorScheme === 'dark' ? '#18201b' : '#fbfaf7';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
    if (app.isVersionAtLeast('6.1')) app.setBackgroundColor(background);
    if (app.isVersionAtLeast('6.9')) app.setHeaderColor(background);
    else if (app.isVersionAtLeast('6.1')) app.setHeaderColor('bg_color');
    if (app.isVersionAtLeast('7.10')) app.setBottomBarColor(background);
  };

  const syncBackButton = () => {
    if (!app.isVersionAtLeast('6.1')) return;
    if (isHome) app.BackButton.hide();
    else app.BackButton.show();
  };

  if (app.isVersionAtLeast('6.1')) {
    app.BackButton.onClick(() => {
      const previous = document.referrer ? new URL(document.referrer) : null;
      // Only navigate back when the previous document belongs to this app.
      if (previous?.origin === home.origin && previous.pathname.startsWith(basePath) && history.length > 1) {
        history.back();
      } else {
        location.replace(home.href);
      }
    });
  }

  applyTheme();
  syncBackButton();
  app.onEvent('themeChanged', applyTheme);
  window.addEventListener('pageshow', syncBackButton);
  app.ready();
  app.expand();
})();
