/**
 * SKCT Tool - 링커리어 Focus Bypass
 * content.js — document_start에서 실행되어 포커스 감지 이벤트를 선제적으로 차단
 */
(function () {
  'use strict';

  // ── 1. hasFocus 항상 true 반환 ──
  try {
    Object.defineProperty(document, 'hasFocus', {
      value: function () { return true; },
      writable: false,
      configurable: true
    });
  } catch (e) { /* ignored */ }

  // ── 2. visibilityState / hidden 항상 visible 고정 ──
  try {
    Object.defineProperty(document, 'visibilityState', {
      get: function () { return 'visible'; },
      configurable: true
    });
    Object.defineProperty(document, 'hidden', {
      get: function () { return false; },
      configurable: true
    });
  } catch (e) { /* ignored */ }

  // ── 3. blur, visibilitychange, focusout 이벤트 캡처 단계 차단 ──
  ['blur', 'visibilitychange', 'focusout', 'webkitvisibilitychange'].forEach(function (evt) {
    window.addEventListener(evt, function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }, true);
    document.addEventListener(evt, function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }, true);
  });

  // ── 4. window.onblur 덮어쓰기 방지 ──
  try {
    Object.defineProperty(window, 'onblur', {
      get: function () { return null; },
      set: function () { },
      configurable: true
    });
  } catch (e) { /* ignored */ }

  // ── 5. 가림막(overlay) 자동 제거 — MutationObserver ──
  function tryRemoveOverlay(node) {
    if (node.nodeType !== 1) return;
    var s = node.style || window.getComputedStyle(node);
    var zi = parseInt(s.zIndex || 0);
    if (zi >= 9990 && (s.position === 'fixed' || s.position === 'absolute')) {
      var rect = node.getBoundingClientRect();
      if (rect.width > window.innerWidth * 0.5 && rect.height > window.innerHeight * 0.5) {
        node.remove();
        console.log('[SKCT Bypass] 가림막 제거됨');
      }
    }
  }

  // DOM이 준비되면 Observer 시작
  function startObserver() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(tryRemoveOverlay);
      });
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    // 기존 가림막 즉시 제거
    document.querySelectorAll('*').forEach(tryRemoveOverlay);
  }

  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }

  console.log('[SKCT Bypass] ✅ 포커스 잠금 + 가림막 차단 활성화');
})();
