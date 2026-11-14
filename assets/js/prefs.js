/* =========================================================
   prefs — 跨站偏好存储（mot.dev ↔ status.mot.dev）
   ---------------------------------------------------------
   · 主站与状态页是两个子域，localStorage 按源隔离，只有 cookie 能共享；
     这里把偏好写进 Domain=.mot.dev 的 cookie，两站读到同一份。
   · localStorage 仍保留一份：cookie 被禁用（隐私模式、浏览器限制）时
     退化为单站偏好，功能不受影响，只是不再跨站同步。
   · 首次读取时若 cookie 缺失而 localStorage 有值，顺手搬进 cookie，
     老用户不会因为换了存储方式而丢掉已选的语言 / 主题。
   · 只存偏好键（mot_lang / mot_theme），不涉及任何身份信息。
   ========================================================= */
(function (global) {
  'use strict';

  var COOKIE_DOMAIN = '.mot.dev';   // 只在 mot.dev 及其子域下设置
  var MAX_AGE = 31536000;           // 一年

  function onMotDev() {
    return /(^|\.)mot\.dev$/i.test(global.location.hostname);
  }

  function readCookie(name) {
    var raw = '';
    try { raw = String(document.cookie || ''); } catch (e) { return null; }
    if (!raw) return null;

    var parts = raw.split(';');
    for (var i = 0; i < parts.length; i++) {
      var item = parts[i];
      var eq = item.indexOf('=');
      if (eq < 0) continue;
      if (item.slice(0, eq).trim() !== name) continue;
      var value = item.slice(eq + 1).trim();
      try { return decodeURIComponent(value); } catch (e) { return value; }
    }
    return null;
  }

  function writeCookie(name, value) {
    var parts = [
      name + '=' + encodeURIComponent(value),
      'Path=/',
      'Max-Age=' + MAX_AGE,
      'SameSite=Lax'          // 站间跳转是顶级导航，Lax 会把 cookie 带过去
    ];
    if (onMotDev()) parts.push('Domain=' + COOKIE_DOMAIN);
    if (global.location.protocol === 'https:') parts.push('Secure');
    try { document.cookie = parts.join('; '); } catch (e) { /* 写入被拒时退化为 localStorage */ }
  }

  function dropCookie(name) {
    var parts = [name + '=', 'Path=/', 'Max-Age=0'];
    if (onMotDev()) parts.push('Domain=' + COOKIE_DOMAIN);
    try { document.cookie = parts.join('; '); } catch (e) { /* 忽略 */ }
  }

  function readLocal(name) {
    try { return global.localStorage.getItem(name); } catch (e) { return null; }
  }

  function writeLocal(name, value) {
    try { global.localStorage.setItem(name, value); } catch (e) { /* 隐私模式 */ }
  }

  function get(name) {
    var fromCookie = readCookie(name);
    if (fromCookie !== null && fromCookie !== '') {
      writeLocal(name, fromCookie);
      return fromCookie;
    }

    var fromLocal = readLocal(name);
    if (fromLocal) {
      writeCookie(name, fromLocal);   // 迁移：单站偏好 → 跨站偏好
      return fromLocal;
    }
    return null;
  }

  function set(name, value) {
    if (value === null || value === undefined || value === '') { remove(name); return; }
    writeCookie(name, String(value));
    writeLocal(name, String(value));
  }

  function remove(name) {
    dropCookie(name);
    try { global.localStorage.removeItem(name); } catch (e) { /* 忽略 */ }
  }

  global.motPrefs = {
    get: get,
    set: set,
    remove: remove,
    domain: COOKIE_DOMAIN
  };
})(window);
