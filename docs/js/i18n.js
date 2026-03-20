/* ─────────────────────────────────────────────
   ReflexDuels — i18n System
   Language detection, switching, and DOM updates
───────────────────────────────────────────── */

(function () {
  'use strict';

  const STORAGE_KEY = 'reflexduels-lang';
  const SUPPORTED = ['en', 'pl'];
  const DEFAULT = 'en';
  let translations = {};
  let currentLang = DEFAULT;

  /* ── Detect language ── */
  function detectLanguage() {
    // 1. URL parameter
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) return urlLang;

    // 2. localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    // 3. Browser language
    const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(browserLang)) return browserLang;

    return DEFAULT;
  }

  /* ── Get nested value from object by dot path ── */
  function getNestedValue(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : null;
    }, obj);
  }

  /* ── Update DOM with translations ── */
  function updateDOM() {
    // Text content
    var elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = getNestedValue(translations, key);
      if (value) el.textContent = value;
    });

    // HTML content (for line breaks etc.)
    var htmlElements = document.querySelectorAll('[data-i18n-html]');
    htmlElements.forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var value = getNestedValue(translations, key);
      if (value) el.innerHTML = value;
    });

    // Alt attributes
    var altElements = document.querySelectorAll('[data-i18n-alt]');
    altElements.forEach(function (el) {
      var key = el.getAttribute('data-i18n-alt');
      var value = getNestedValue(translations, key);
      if (value) el.setAttribute('alt', value);
    });

    // Placeholder attributes
    var placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var value = getNestedValue(translations, key);
      if (value) el.setAttribute('placeholder', value);
    });

    // Update page title and meta description
    var metaTitle = getNestedValue(translations, 'meta.title');
    if (metaTitle) document.title = metaTitle;

    var metaDesc = document.querySelector('meta[name="description"]');
    var descValue = getNestedValue(translations, 'meta.description');
    if (metaDesc && descValue) metaDesc.setAttribute('content', descValue);

    // Update html lang attribute
    document.documentElement.setAttribute('lang', currentLang);

    // Update screenshot src attributes
    var screenshots = document.querySelectorAll('[data-screenshot]');
    screenshots.forEach(function (img) {
      var filename = img.getAttribute('data-screenshot');
      img.setAttribute('src', 'assets/screenshots/' + currentLang + '/' + filename);
    });

    // Update language toggle buttons
    var langBtns = document.querySelectorAll('.lang-toggle__btn');
    langBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
  }

  /* ── Load translations and apply ── */
  function loadLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    fetch('i18n/' + lang + '.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        translations = data;
        updateDOM();
      })
      .catch(function (err) {
        console.error('Failed to load translations for ' + lang, err);
      });
  }

  /* ── Switch language ── */
  function switchLanguage(lang) {
    if (lang === currentLang) return;
    loadLanguage(lang);
  }

  /* ── Initialize ── */
  function init() {
    var lang = detectLanguage();

    // Bind language toggle buttons
    var langBtns = document.querySelectorAll('.lang-toggle__btn');
    langBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchLanguage(btn.getAttribute('data-lang'));
      });
    });

    // Load initial language
    loadLanguage(lang);
  }

  // Expose for external use
  window.i18n = {
    switchLanguage: switchLanguage,
    getCurrentLang: function () { return currentLang; }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
