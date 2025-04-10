document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  const translations = {
    it: {
      home: 'Home',
      matches: 'Partite',
      teams: 'Squadre',
      stats: 'Statistiche',
      welcome: 'Benvenuto in Neon Football'
    },
    en: {
      home: 'Home',
      matches: 'Matches',
      teams: 'Teams',
      stats: 'Stats',
      welcome: 'Welcome to Neon Football'
    }
  };

  const langIt = document.getElementById('lang-it');
  const langEn = document.getElementById('lang-en');

  langIt.addEventListener('click', () => switchLang('it', true));
  langEn.addEventListener('click', () => switchLang('en', true));

  function switchLang(lang, save = false) {
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      el.textContent = translations[lang][key];
    });
    if (save) {
      localStorage.setItem('lang', lang);
    }

    langIt.style.opacity = lang === 'it' ? '1' : '0.4';
    langEn.style.opacity = lang === 'en' ? '1' : '0.4';
    langIt.style.boxShadow = lang === 'it' ? '0 0 8px #0077ff' : 'none';
    langEn.style.boxShadow = lang === 'en' ? '0 0 8px #0077ff' : 'none';
  }

  const savedLang = localStorage.getItem('lang') || 'it';
  switchLang(savedLang);

  const flags = document.querySelectorAll('.language-switch img');
  flags.forEach(flag => {
    flag.style.borderRadius = '50%';
    flag.style.border = '1px solid #0077ff';
    flag.style.cursor = 'pointer';
    flag.style.transition = 'all 0.3s ease';
  });

});
