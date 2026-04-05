/**
 * SKCT Tool - 링커리어 Focus Bypass
 * content.js — document_start에서 실행되어 포커스 감지 이벤트를 선제적으로 차단
 */
(function () {
  'use strict';

  // --- SKCT Tool 본 페이지 접속 시: 설치 신호 마커만 주입 후 즉시 종료 ---
  if (!window.location.hostname.includes('linkareer.com')) {
    function injectMarker() {
      if (document.getElementById('skct-extension-installed')) return;
      var marker = document.createElement('div');
      marker.id = 'skct-extension-installed';
      marker.style.display = 'none';
      marker.textContent = 'true';
      document.documentElement.appendChild(marker);
    }
    if (document.documentElement) injectMarker();
    else document.addEventListener('DOMContentLoaded', injectMarker);
    return;
  }

  // ── 1. hasFocus 항상 true 반환 (링커리어 CBT 대상) ──
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
  var overlayHintPattern = /(overlay|modal|backdrop|screen|focus|block|guard|mask|dim|prevent|lock)/i;

  function hideOverlay(node) {
    if (!node || node.nodeType !== 1) return;
    node.setAttribute('data-skct-bypass-removed', 'true');
    node.style.setProperty('pointer-events', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('opacity', '0', 'important');
    node.style.setProperty('display', 'none', 'important');
    if (typeof node.remove === 'function') {
      node.remove();
    }
  }

  function tryRemoveOverlay(node) {
    if (node.nodeType !== 1) return;
    var s = node.style || window.getComputedStyle(node);
    var zi = parseInt(s.zIndex || 0);
    var rect = node.getBoundingClientRect();
    var widthRatio = rect.width / Math.max(window.innerWidth, 1);
    var heightRatio = rect.height / Math.max(window.innerHeight, 1);
    var coversLargeArea = widthRatio >= 0.45 && heightRatio >= 0.45;
    var coversMostOfScreen = widthRatio >= 0.8 && heightRatio >= 0.6;
    var nameHint = [node.id || '', node.className || '', node.getAttribute('role') || ''].join(' ');
    var textHint = (node.textContent || '').slice(0, 200);
    var looksLikeOverlay = s.position === 'fixed' || s.position === 'absolute';
    var suspiciousByName = overlayHintPattern.test(nameHint) || overlayHintPattern.test(textHint);

    if (looksLikeOverlay && ((zi >= 9990 && coversLargeArea) || coversMostOfScreen || (coversLargeArea && suspiciousByName))) {
      hideOverlay(node);
      console.log('[SKCT Bypass] 가림막 제거됨');
    }
  }

  function scanExistingNodes() {
    document.querySelectorAll('*').forEach(tryRemoveOverlay);
  }

  // DOM이 준비되면 Observer 시작
  function startObserver() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(tryRemoveOverlay);
        if (m.type === 'attributes') {
          tryRemoveOverlay(m.target);
        }
      });
    });
    observer.observe(document.body || document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
      childList: true,
      subtree: true
    });

    // 기존 가림막 즉시 제거
    scanExistingNodes();

    var scanInterval = window.setInterval(scanExistingNodes, 1200);
    window.setTimeout(function () {
      window.clearInterval(scanInterval);
    }, 20000);
  }

  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }

  console.log('[SKCT Bypass] ✅ 포커스 잠금 + 가림막 차단 활성화');
})();
