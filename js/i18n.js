// i18n - Internationalization (try-catch wrapped IIFE)
try {
(function() {
'use strict';

class I18n {
  constructor() {
    this.translations = {};
    this.supportedLangs = ['ko','en','zh','hi','ru','ja','es','pt','id','tr','de','fr'];
    this.currentLang = this.detectLanguage();
    this.loadTranslations(this.currentLang).then(() => this.updateUI());
  }

  detectLanguage() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const urlLang = params.get('lang');
      if (urlLang && this.supportedLangs.includes(urlLang)) return urlLang;
    } catch (e) {}
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && this.supportedLangs.includes(saved)) return saved;
    const browser = (navigator.language || '').split('-')[0];
    return this.supportedLangs.includes(browser) ? browser : 'en';
  }

  async loadTranslations(lang) {
    try {
      const res = await fetch(`js/locales/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.translations = await res.json();
      this.currentLang = lang;
    } catch (e) {
      console.warn(`i18n: Failed to load ${lang}, falling back to en`);
      if (lang !== 'en') {
        try {
          const res = await fetch('js/locales/en.json');
          this.translations = await res.json();
          this.currentLang = 'en';
        } catch (e2) {
          console.error('i18n: Failed to load fallback', e2);
        }
      }
    }
  }

  t(key) {
    const keys = key.split('.');
    let val = this.translations;
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) val = val[k];
      else return key;
    }
    return typeof val === 'string' ? val : key;
  }

  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text === key) return;
      if (el.tagName === 'META') el.setAttribute('content', text);
      else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = text;
      else el.textContent = text;
    });
    document.documentElement.lang = this.currentLang;
  }

  async setLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) return;
    localStorage.setItem('preferredLanguage', lang);
    await this.loadTranslations(lang);
    this.updateUI();
  }

  getCurrentLanguage() { return this.currentLang; }
}

window.i18n = new I18n();

})();
} catch(e) { console.warn('i18n init failed:', e); }
