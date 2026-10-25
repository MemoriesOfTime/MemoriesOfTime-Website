/* =========================================================
   i18n — 轻量国际化运行时（零依赖）
   ---------------------------------------------------------
   · 语言包外置为 JSON，只请求当前 locale；标记 complete 的语言不预载回退包
   · 语言协商：?lang= → localStorage → navigator.languages → <html lang> → 默认语言
   · 缺失键回退 fallbackLocale（首次缺键时才懒加载回退包），仍缺失时返回 key 并告警一次
   · 复数、数字、相对时间全部走 Intl，随 locale 自动生效
   · DOM 声明式绑定：data-i18n / data-i18n-html / data-i18n-attr
   · 切换语言时同步 <html lang|dir>、og:locale、URL，并派发 mot:localechange

   新增语言：在 assets/i18n/locales.json 注册一条记录并放入同名语言包即可，
   可选字段：complete（已完整翻译，不预载回退包）、aliases（浏览器标签别名，
   如 zh-TW/zh-HK → zh-Hant）、dir（rtl）。无需改动任何代码。
   ========================================================= */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'mot_lang';
  var QUERY_KEY = 'lang';
  var DAY_MS = 24 * 60 * 60 * 1000;

  function fetchJson(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + url);
      return res.json();
    });
  }

  /* 以脚本自身位置为基准解析资源路径，404 页在任意路径下都能加载语言包 */
  function scriptBase() {
    var script = document.currentScript;
    if (!script || !script.src) {
      var scripts = document.querySelectorAll('script[src]');
      for (var i = 0; i < scripts.length; i++) {
        if (/assets\/js\/i18n\.js(\?|$)/.test(scripts[i].src)) { script = scripts[i]; break; }
      }
    }
    if (!script || !script.src) return document.baseURI;
    // 去掉已知脚本路径，得到站点根，registry 里的 path 都相对根目录
    var marker = '/assets/js/i18n.js';
    var index = script.src.indexOf(marker);
    return index !== -1 ? script.src.slice(0, index + 1) : new URL('.', script.src).href;
  }

  function I18n(options) {
    options = options || {};
    this.baseUrl = options.baseUrl || scriptBase();
    this.registryUrl = new URL(options.registryUrl || 'assets/i18n/locales.json', this.baseUrl).href;
    this.defaultLocale = options.defaultLocale || 'zh-CN';
    this.fallbackLocale = options.fallbackLocale || this.defaultLocale;

    this.locales = [];
    this.locale = null;
    this.loadError = null;

    this._bundles = new Map();
    this._formats = new Map();
    this._missing = new Set();
    this._fallbackPending = false;

    this.ready = this._boot();
  }

  /* --- 语言协商 --- */

  I18n.prototype.meta = function (code) {
    var target = code || this.locale;
    for (var i = 0; i < this.locales.length; i++) {
      if (this.locales[i].code === target) return this.locales[i];
    }
    return null;
  };

  /* 把任意 BCP 47 标签映射到已注册的 locale：en-US → en, zh-Hans-CN → zh-CN */
  I18n.prototype.normalize = function (code) {
    if (!code) return null;
    var raw = String(code).trim().replace(/_/g, '-');
    if (!raw) return null;

    var parts = raw.split('-');
    while (parts.length) {
      var tag = parts.join('-').toLowerCase();
      for (var i = 0; i < this.locales.length; i++) {
        var locale = this.locales[i];
        var aliases = locale.aliases || [];
        for (var k = 0; k < aliases.length; k++) {
          if (aliases[k].toLowerCase() === tag) return locale.code;
        }
        if (locale.code.toLowerCase() === tag || (locale.htmlLang || '').toLowerCase() === tag) {
          return locale.code;
        }
      }
      parts.pop();
    }

    // 仅语言级匹配：zh-TW / zh-HK 在只提供 zh-CN 时回落到中文
    var base = raw.split('-')[0].toLowerCase();
    for (var j = 0; j < this.locales.length; j++) {
      if (this.locales[j].code.split('-')[0].toLowerCase() === base) return this.locales[j].code;
    }
    return null;
  };

  I18n.prototype.resolveLocale = function () {
    var fromQuery = null;
    try {
      fromQuery = new URLSearchParams(global.location.search).get(QUERY_KEY);
    } catch (e) { /* 忽略异常 URL */ }
    if (fromQuery) return this.normalize(fromQuery) || this.defaultLocale;

    var stored = null;
    try { stored = global.localStorage.getItem(STORAGE_KEY); } catch (e) { /* 隐私模式 */ }
    if (stored) return this.normalize(stored) || this.defaultLocale;

    var preferred = (global.navigator.languages && global.navigator.languages.length)
      ? global.navigator.languages
      : [global.navigator.language];
    for (var i = 0; i < preferred.length; i++) {
      var hit = this.normalize(preferred[i]);
      if (hit) return hit;
    }

    return this.normalize(document.documentElement.lang) || this.defaultLocale;
  };

  /* --- 语言包加载 --- */

  I18n.prototype.loadBundle = function (code) {
    var self = this;
    if (this._bundles.has(code)) return Promise.resolve(this._bundles.get(code));

    var meta = this.meta(code);
    if (!meta || !meta.path) return Promise.reject(new Error('Locale "' + code + '" is not registered'));

    return fetchJson(new URL(meta.path, this.baseUrl).href).then(function (bundle) {
      self._bundles.set(code, bundle);
      return bundle;
    });
  };

  I18n.prototype._boot = function () {
    var self = this;
    return fetchJson(this.registryUrl)
      .then(function (registry) {
        self.locales = Array.isArray(registry.locales) ? registry.locales : [];
        if (!self.locales.length) throw new Error('Locale registry is empty');
        self.defaultLocale = registry.defaultLocale || self.defaultLocale;
        self.fallbackLocale = registry.fallbackLocale || self.defaultLocale;
      })
      .then(function () {
        self.locale = self.resolveLocale();
        return self.loadBundle(self.locale).catch(function (error) {
          console.error('[i18n] 无法加载语言包 "' + self.locale + '"，回退到 ' + self.defaultLocale, error);
          self.locale = self.defaultLocale;
          return self.loadBundle(self.defaultLocale);
        });
      })
      .then(function () {
        // 语言包已完整翻译时不需要回退包；未标注 complete 的语言仍预载，保证缺键可用
        var meta = self.meta(self.locale);
        if (self.fallbackLocale !== self.locale && !(meta && meta.complete)) {
          return self.loadBundle(self.fallbackLocale).catch(function () {});
        }
      })
      .then(function () {
        self.applyDocument();
        self.syncUrl(true);
        return self;
      })
      .catch(function (error) {
        self.loadError = error;
        console.error('[i18n] 初始化失败，页面将回退为显示文案 key', error);
        return self;
      });
  };

  /* --- 翻译 --- */

  I18n.prototype._lookup = function (key) {
    var current = this._bundles.get(this.locale);
    var message = resolvePath(current, key);
    if (message !== undefined) return message;
    if (this.fallbackLocale !== this.locale) return resolvePath(this._bundles.get(this.fallbackLocale), key);
    return undefined;
  };

  I18n.prototype.t = function (key, vars) {
    if (!key) return '';
    var message = this._lookup(key);
    if (message === undefined) {
      // 当前语言缺这条文案：回退包此时才加载，加载完成后通知页面重渲染
      this._ensureFallback();
      if (!this._missing.has(key)) {
        this._missing.add(key);
        console.warn('[i18n] 缺少文案：' + key + ' (' + this.locale + ')');
      }
      return key;
    }
    return this._format(message, vars);
  };

  I18n.prototype._ensureFallback = function () {
    var self = this;
    var code = this.fallbackLocale;
    if (!code || code === this.locale || this._fallbackPending || this._bundles.has(code)) return;

    this._fallbackPending = true;
    this.loadBundle(code).then(function () {
      self._fallbackPending = false;
      document.dispatchEvent(new CustomEvent('mot:messagesloaded', {
        detail: { locale: code, reason: 'fallback' }
      }));
    }, function (error) {
      self._fallbackPending = false;
      console.warn('[i18n] 回退语言包加载失败：' + code, error);
    });
  };

  I18n.prototype._format = function (message, vars) {
    if (typeof message === 'string') return this.interpolate(message, vars);
    if (!message || typeof message !== 'object') return String(message);

    // 复数：{ one, other, ... }，由 Intl.PluralRules 选择分类
    var count = vars && vars.count !== undefined ? Number(vars.count) : null;
    if (count === null || !isFinite(count)) return this.interpolate(message.other || '', vars);
    var category = this._pluralRules().select(count);
    var template = message[category] || message.other || message.one || '';
    // 只对数量做本地化分组：年份等普通数字不应出现千分位
    var params = Object.assign({}, vars, { count: this.formatNumber(count) });
    return this.interpolate(template, params);
  };

  I18n.prototype.interpolate = function (template, vars) {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, function (match, name) {
      if (!Object.prototype.hasOwnProperty.call(vars, name)) return match;
      return String(vars[name]);
    });
  };

  /* --- Intl 格式化 --- */

  I18n.prototype._formatCached = function (key, factory) {
    if (!this._formats.has(key)) this._formats.set(key, factory());
    return this._formats.get(key);
  };

  I18n.prototype._pluralRules = function () {
    var self = this;
    return this._formatCached('plural', function () { return new Intl.PluralRules(self.htmlLang); });
  };

  I18n.prototype._relativeTime = function () {
    var self = this;
    return this._formatCached('relative', function () {
      return new Intl.RelativeTimeFormat(self.htmlLang, { numeric: 'always' });
    });
  };

  I18n.prototype.formatNumber = function (value, options) {
    var number = Number(value);
    if (!isFinite(number)) return value === undefined || value === null ? '' : String(value);
    var cacheKey = 'number:' + (options ? JSON.stringify(options) : 'default');
    var self = this;
    return this._formatCached(cacheKey, function () {
      return new Intl.NumberFormat(self.htmlLang, options);
    }).format(number);
  };

  /* 相对时间：<1 天用文案，30 天内按天，更久按月 */
  I18n.prototype.formatRelativeTime = function (value, now) {
    var date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    var reference = now instanceof Date ? now : new Date();
    var diff = reference - date;
    if (diff < DAY_MS) return this.t('time.recent');

    var days = Math.floor(diff / DAY_MS);
    if (days <= 30) return this._relativeTime().format(-days, 'day');
    return this._relativeTime().format(-Math.floor(days / 30), 'month');
  };

  /* --- DOM 绑定 --- */

  I18n.prototype.apply = function (root) {
    // 语言包不可用时保留 HTML 里的静态默认文案，避免把 key 写进页面
    if (!this.locale || !this._bundles.has(this.locale)) return;

    var scope = root || document;
    var self = this;

    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = self.t(el.getAttribute('data-i18n'));
    });

    scope.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = self.t(el.getAttribute('data-i18n-html'));
    });

    // 语法：data-i18n-attr="placeholder:projects.search.placeholder,aria-label:projects.search.label"
    scope.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var index = pair.indexOf(':');
        if (index < 1) return;
        var attr = pair.slice(0, index).trim();
        var key = pair.slice(index + 1).trim();
        if (attr && key) el.setAttribute(attr, self.t(key));
      });
    });
  };

  I18n.prototype.applyDocument = function () {
    var meta = this.meta(this.locale) || {};
    var html = document.documentElement;
    html.lang = meta.htmlLang || this.locale || this.defaultLocale;
    html.dir = meta.dir || 'ltr';

    this.apply(document);

    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale && meta.ogLocale) ogLocale.setAttribute('content', meta.ogLocale);
  };

  /* --- 切换语言 --- */

  I18n.prototype.syncUrl = function (replace) {
    if (!this.locale || typeof history === 'undefined') return;
    var url = new URL(global.location.href);
    if (this.locale === this.defaultLocale) url.searchParams.delete(QUERY_KEY);
    else url.searchParams.set(QUERY_KEY, this.locale);
    if (url.href === global.location.href) return;
    try {
      history[replace === false ? 'pushState' : 'replaceState'](null, '', url);
    } catch (e) { /* file:// 等环境不允许改写地址，忽略即可 */ }
  };

  I18n.prototype.persist = function (code) {
    try { global.localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* 隐私模式 */ }
  };

  I18n.prototype.setLocale = function (code, options) {
    options = options || {};
    var target = this.normalize(code);
    if (!target) return Promise.resolve(this.locale);

    var self = this;

    if (target === this.locale) {
      this.persist(target);
      this.syncUrl(options.replaceUrl);
      return Promise.resolve(this.locale);
    }

    return this.loadBundle(target).then(function () {
      var previous = self.locale;
      self.locale = target;
      self.persist(target);
      self._formats.clear();
      self.applyDocument();
      self.syncUrl(options.replaceUrl);
      document.dispatchEvent(new CustomEvent('mot:localechange', {
        detail: { locale: target, previous: previous, meta: self.meta(target) }
      }));
      return target;
    }).catch(function (error) {
      console.error('[i18n] 切换语言失败：' + target, error);
      return self.locale;
    });
  };

  /* --- Getters --- */

  Object.defineProperty(I18n.prototype, 'htmlLang', {
    get: function () {
      var meta = this.meta();
      return (meta && meta.htmlLang) || this.locale || this.defaultLocale;
    }
  });

  Object.defineProperty(I18n.prototype, 'dir', {
    get: function () {
      var meta = this.meta();
      return (meta && meta.dir) || 'ltr';
    }
  });

  function resolvePath(bundle, path) {
    if (!bundle) return undefined;
    if (Object.prototype.hasOwnProperty.call(bundle, path)) return bundle[path];

    var node = bundle;
    var parts = String(path).split('.');
    for (var i = 0; i < parts.length; i++) {
      if (node === null || typeof node !== 'object' || !(parts[i] in node)) return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  global.I18n = I18n;
  global.i18n = new I18n(global.MOT_I18N_OPTIONS);
})(window);
