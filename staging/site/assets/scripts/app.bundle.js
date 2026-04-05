// ============================================================
// STAGING APP BUNDLE
// main.js + community.js 통합본
// ============================================================
import { getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, push, set, get, update, onValue, off, runTransaction } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const getDb = () => getDatabase(getApp());
document.addEventListener('DOMContentLoaded', () => {
    const runtimeFlags = window.SKCT_FLAGS || {};
    const isAdminPreviewMode = runtimeFlags.adminPreview === true;
    const isPopupMode = window.name === 'stg_skct_popup_mode';
    const isPopupEditorMode = isPopupMode && isAdminPreviewMode && runtimeFlags.popupEditor === true;
    const isStagingReadOnly = runtimeFlags.stagingReadOnly === true;
    const DEFAULT_LAYOUT_RATIOS = { timer: 0.2, utils: 1, calc: 2 };
    const DEFAULT_TOOL_UI_CONFIG = { bottomPaddingRatio: 0.04, noteFontSize: 14, canvasLineWidth: 4 };
    const POPUP_EDITOR_MESSAGE_TYPES = {
        preview: 'stg-skct-popup-preview',
        saveRequest: 'stg-skct-popup-save-request',
        saveResult: 'stg-skct-popup-save-result'
    };
    const appContainerEl = document.querySelector('.app-container');
    const mainContentEl = document.querySelector('.main-content');
    const topBarEl = document.querySelector('.top-bar');
    const utilitySectionEl = document.querySelector('.utility-section');
    const calculatorSectionEl = document.querySelector('.calculator-section');
    const topBarResizerEl = document.getElementById('topBarResizer');
    const toolsSectionResizerEl = document.getElementById('toolsSectionResizer');
    const popupEditorPanelEl = document.getElementById('popupEditorPanel');
    const popupEditorMetricsEl = document.getElementById('popupEditorMetrics');
    const popupEditorStatusEl = document.getElementById('popupEditorStatus');
    const popupEditorToggleBtn = document.getElementById('popupEditorToggleBtn');
    const popupEditorReloadBtn = document.getElementById('popupEditorReloadBtn');
    const popupEditorSaveBtn = document.getElementById('popupEditorSaveBtn');
    const popupBottomPaddingRange = document.getElementById('popupBottomPaddingRange');
    const popupBottomPaddingValue = document.getElementById('popupBottomPaddingValue');
    const ratioTimer = document.getElementById('ratioTimer');
    const ratioUtils = document.getElementById('ratioUtils');
    const ratioCalc = document.getElementById('ratioCalc');
    const noteFontSizeRange = document.getElementById('noteFontSizeRange');
    const noteFontSizeValue = document.getElementById('noteFontSizeValue');
    const canvasLineWidthRange = document.getElementById('canvasLineWidthRange');
    const canvasLineWidthValue = document.getElementById('canvasLineWidthValue');
    let popupLayoutSyncTimeout = null;
    let popupMoveWatcher = null;
    let lastPopupEditorSignature = '';
    let lastPopupWindowOnlySignature = '';
    const showReadOnlyNotice = () => {
        alert('이 테스트 사이트는 운영 데이터를 읽기 전용으로만 표시합니다.\n좋아요, 댓글, 글 작성, 관리자 저장은 모두 차단됩니다.');
    };

    document.body.classList.toggle('popup-editor-mode', isPopupEditorMode);

    function clampNumber(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function roundRatio(value) {
        return Math.round(value * 1000) / 1000;
    }

    function getScreenMetrics() {
        const availWidth = screen.availWidth || screen.width || window.outerWidth || 1440;
        const availHeight = screen.availHeight || screen.height || window.outerHeight || 900;
        const availLeft = Number.isFinite(screen.availLeft) ? screen.availLeft : 0;
        const availTop = Number.isFinite(screen.availTop) ? screen.availTop : 0;
        return { availWidth, availHeight, availLeft, availTop };
    }

    function createLegacyPopupWindowDefaults() {
        const { availWidth, availHeight } = getScreenMetrics();
        const width = clampNumber(350, 300, availWidth);
        const height = clampNumber(800, 520, availHeight);
        return {
            widthRatio: roundRatio(width / availWidth),
            heightRatio: roundRatio(height / availHeight),
            leftRatio: roundRatio(Math.max(0, (availWidth - width) / 2) / availWidth),
            topRatio: roundRatio(Math.max(0, (availHeight - height) / 2) / availHeight)
        };
    }

    function normalizePopupLayout(raw) {
        const fallbackWindow = createLegacyPopupWindowDefaults();
        const sourceWindow = raw?.window || {};
        const widthRatio = parseFloat(sourceWindow.widthRatio);
        const heightRatio = parseFloat(sourceWindow.heightRatio);
        const safeWidthRatio = Number.isFinite(widthRatio) ? clampNumber(widthRatio, 0.18, 0.8) : fallbackWindow.widthRatio;
        const safeHeightRatio = Number.isFinite(heightRatio) ? clampNumber(heightRatio, 0.45, 0.98) : fallbackWindow.heightRatio;
        const leftRatio = parseFloat(sourceWindow.leftRatio);
        const topRatio = parseFloat(sourceWindow.topRatio);
        const omrWidthRatio = parseFloat(raw?.omrWidthRatio);
        return {
            window: {
                widthRatio: roundRatio(safeWidthRatio),
                heightRatio: roundRatio(safeHeightRatio),
                leftRatio: roundRatio(clampNumber(Number.isFinite(leftRatio) ? leftRatio : fallbackWindow.leftRatio, 0, Math.max(0, 1 - safeWidthRatio))),
                topRatio: roundRatio(clampNumber(Number.isFinite(topRatio) ? topRatio : fallbackWindow.topRatio, 0, Math.max(0, 1 - safeHeightRatio)))
            },
            omrWidthRatio: roundRatio(Number.isFinite(omrWidthRatio) ? clampNumber(omrWidthRatio, 0.16, 0.7) : 0.34)
        };
    }

    function normalizeToolUiConfig(raw) {
        return {
            bottomPaddingRatio: roundRatio(clampNumber(parseFloat(raw?.bottomPaddingRatio) || DEFAULT_TOOL_UI_CONFIG.bottomPaddingRatio, 0, 0.18)),
            noteFontSize: clampNumber(parseInt(raw?.noteFontSize, 10) || DEFAULT_TOOL_UI_CONFIG.noteFontSize, 12, 22),
            canvasLineWidth: clampNumber(parseInt(raw?.canvasLineWidth, 10) || DEFAULT_TOOL_UI_CONFIG.canvasLineWidth, 2, 12)
        };
    }

    function buildPopupWindowMetrics(windowConfig) {
        const normalized = normalizePopupLayout({ window: windowConfig });
        const { availWidth, availHeight, availLeft, availTop } = getScreenMetrics();
        const width = clampNumber(Math.round(availWidth * normalized.window.widthRatio), 300, availWidth);
        const height = clampNumber(Math.round(availHeight * normalized.window.heightRatio), 520, availHeight);
        const maxLeft = Math.max(0, availWidth - width);
        const maxTop = Math.max(0, availHeight - height);
        const left = Math.round(availLeft + clampNumber(availWidth * normalized.window.leftRatio, 0, maxLeft));
        const top = Math.round(availTop + clampNumber(availHeight * normalized.window.topRatio, 0, maxTop));
        return { width, height, left, top };
    }

    function capturePopupWindowRatios() {
        const { availWidth, availHeight, availLeft, availTop } = getScreenMetrics();
        const widthRatio = clampNumber(window.outerWidth / availWidth, 0.18, 0.8);
        const heightRatio = clampNumber(window.outerHeight / availHeight, 0.45, 0.98);
        const maxLeft = Math.max(0, availWidth - window.outerWidth);
        const maxTop = Math.max(0, availHeight - window.outerHeight);
        const leftPx = clampNumber(window.screenX - availLeft, 0, maxLeft);
        const topPx = clampNumber(window.screenY - availTop, 0, maxTop);
        return {
            widthRatio: roundRatio(widthRatio),
            heightRatio: roundRatio(heightRatio),
            leftRatio: roundRatio(clampNumber(leftPx / availWidth, 0, Math.max(0, 1 - widthRatio))),
            topRatio: roundRatio(clampNumber(topPx / availHeight, 0, Math.max(0, 1 - heightRatio)))
        };
    }

    let remotePopupLayout = normalizePopupLayout();
    let currentPopupLayout = normalizePopupLayout();
    let remoteToolUiConfig = normalizeToolUiConfig();
    let currentToolUiConfig = normalizeToolUiConfig(
        isAdminPreviewMode ? DEFAULT_TOOL_UI_CONFIG : (JSON.parse(localStorage.getItem('stg_skct_tool_ui')) || DEFAULT_TOOL_UI_CONFIG)
    );

    function syncToolsBottomPadding() {
        const baseHeight = mainContentEl?.clientHeight || window.innerHeight || 900;
        const paddingPx = Math.round(baseHeight * currentToolUiConfig.bottomPaddingRatio);
        document.documentElement.style.setProperty('--tools-bottom-padding', `${paddingPx}px`);
        if (popupBottomPaddingRange) popupBottomPaddingRange.value = String(currentToolUiConfig.bottomPaddingRatio);
        if (popupBottomPaddingValue) popupBottomPaddingValue.textContent = `${(currentToolUiConfig.bottomPaddingRatio * 100).toFixed(1)}%`;
    }

    function applyPopupOmrWidthRatio(widthRatio) {
        currentPopupLayout.omrWidthRatio = roundRatio(clampNumber(parseFloat(widthRatio), 0.16, 0.7));
        if (!appContainerEl) return;
        const maxWidth = Math.round(appContainerEl.clientWidth * 0.8);
        const nextWidth = clampNumber(Math.round(appContainerEl.clientWidth * currentPopupLayout.omrWidthRatio), 130, maxWidth);
        document.documentElement.style.setProperty('--omr-width', `${nextWidth}px`);
    }

    function setPopupEditorStatus(message, type = '') {
        if (!popupEditorStatusEl) return;
        popupEditorStatusEl.textContent = message;
        popupEditorStatusEl.className = `popup-editor-status${type ? ` ${type}` : ''}`;
    }

    function setPopupEditorCollapsed(collapsed) {
        if (!popupEditorPanelEl) return;
        popupEditorPanelEl.classList.toggle('collapsed', collapsed);
        if (popupEditorToggleBtn) {
            popupEditorToggleBtn.textContent = collapsed ? '펼치기' : '접기';
            popupEditorToggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        }
    }

    function readCurrentLayoutRatios() {
        const styles = getComputedStyle(document.documentElement);
        return {
            timer: roundRatio(parseFloat(styles.getPropertyValue('--timer-ratio')) || DEFAULT_LAYOUT_RATIOS.timer),
            utils: roundRatio(parseFloat(styles.getPropertyValue('--utils-ratio')) || DEFAULT_LAYOUT_RATIOS.utils),
            calc: roundRatio(parseFloat(styles.getPropertyValue('--calc-ratio')) || DEFAULT_LAYOUT_RATIOS.calc)
        };
    }

    function setLayoutRatios(timer, utils, calc, options = {}) {
        const {
            persist = !isAdminPreviewMode && !isPopupMode,
            syncInputs = true,
            notifyPopupEditor = isPopupEditorMode
        } = options;
        const tR = roundRatio(clampNumber(parseFloat(timer) || DEFAULT_LAYOUT_RATIOS.timer, 0.05, 98));
        const uR = roundRatio(clampNumber(parseFloat(utils) || DEFAULT_LAYOUT_RATIOS.utils, 0.05, 98));
        const cR = roundRatio(clampNumber(parseFloat(calc) || DEFAULT_LAYOUT_RATIOS.calc, 0.05, 98));
        document.documentElement.style.setProperty('--timer-ratio', tR);
        document.documentElement.style.setProperty('--utils-ratio', uR);
        document.documentElement.style.setProperty('--calc-ratio', cR);
        if (syncInputs) {
            if (ratioTimer) ratioTimer.value = tR;
            if (ratioUtils) ratioUtils.value = uR;
            if (ratioCalc) ratioCalc.value = cR;
        }
        if (persist) {
            localStorage.setItem('stg_skct_layout_ratios', JSON.stringify({ timer: tR, utils: uR, calc: cR }));
        }
        if (typeof resizeCanvas === 'function') {
            requestAnimationFrame(resizeCanvas);
        }
        if (notifyPopupEditor) {
            schedulePopupEditorSync();
        }
    }

    function applyRatiosFromHeights(timerHeight, utilityHeight, calcHeight) {
        const totalHeight = Math.max(timerHeight + utilityHeight + calcHeight, 1);
        setLayoutRatios(
            (timerHeight / totalHeight) * 100,
            (utilityHeight / totalHeight) * 100,
            (calcHeight / totalHeight) * 100,
            { persist: false, notifyPopupEditor: true }
        );
    }

    function applyToolUiConfig(rawConfig, options = {}) {
        const {
            persist = !isAdminPreviewMode && !isPopupMode,
            notifyPopupEditor = isPopupEditorMode
        } = options;
        currentToolUiConfig = normalizeToolUiConfig({ ...currentToolUiConfig, ...(rawConfig || {}) });
        const notepadEl = document.getElementById('notepad');
        if (notepadEl) {
            document.documentElement.style.setProperty('--notepad-font-size', `${currentToolUiConfig.noteFontSize}px`);
            notepadEl.style.fontSize = `${currentToolUiConfig.noteFontSize}px`;
        }
        if (noteFontSizeRange) noteFontSizeRange.value = String(currentToolUiConfig.noteFontSize);
        if (noteFontSizeValue) noteFontSizeValue.textContent = String(currentToolUiConfig.noteFontSize);
        if (canvasLineWidthRange) canvasLineWidthRange.value = String(currentToolUiConfig.canvasLineWidth);
        if (canvasLineWidthValue) canvasLineWidthValue.textContent = String(currentToolUiConfig.canvasLineWidth);
        syncToolsBottomPadding();
        if (persist) {
            localStorage.setItem('stg_skct_tool_ui', JSON.stringify(currentToolUiConfig));
        }
        if (notifyPopupEditor) {
            schedulePopupEditorSync();
        }
    }

    function capturePopupEditorPayload() {
        return {
            popupLayout: {
                window: capturePopupWindowRatios(),
                omrWidthRatio: currentPopupLayout.omrWidthRatio
            },
            layoutRatios: readCurrentLayoutRatios(),
            toolUiConfig: currentToolUiConfig
        };
    }

    function renderPopupEditorMetrics() {
        if (!popupEditorMetricsEl) return;
        const payload = capturePopupEditorPayload();
        popupEditorMetricsEl.innerHTML = `
            <div>창 크기: ${(payload.popupLayout.window.widthRatio * 100).toFixed(1)}% x ${(payload.popupLayout.window.heightRatio * 100).toFixed(1)}%</div>
            <div>창 위치: 왼쪽 ${(payload.popupLayout.window.leftRatio * 100).toFixed(1)}% / 위 ${(payload.popupLayout.window.topRatio * 100).toFixed(1)}%</div>
            <div>OMR 폭: ${(payload.popupLayout.omrWidthRatio * 100).toFixed(1)}%</div>
            <div>세로 비율: 타이머 ${payload.layoutRatios.timer.toFixed(1)} / 메모 ${payload.layoutRatios.utils.toFixed(1)} / 계산기 ${payload.layoutRatios.calc.toFixed(1)}</div>
            <div>도구 기본값: 하단 여백 ${(currentToolUiConfig.bottomPaddingRatio * 100).toFixed(1)}%, 메모 ${currentToolUiConfig.noteFontSize}px, 그림판 ${currentToolUiConfig.canvasLineWidth}px</div>
        `;
    }

    function postPopupEditorMessage(type, payload) {
        if (!isPopupEditorMode || !window.opener || window.opener.closed) return false;
        window.opener.postMessage({ type, payload }, window.location.origin);
        return true;
    }

    function syncPopupEditorSnapshot(force = false) {
        if (!isPopupEditorMode) return;
        renderPopupEditorMetrics();
        const payload = capturePopupEditorPayload();
        const signature = JSON.stringify(payload);
        if (!force && signature === lastPopupEditorSignature) return;
        lastPopupEditorSignature = signature;
        lastPopupWindowOnlySignature = JSON.stringify(payload.popupLayout.window);
        postPopupEditorMessage(POPUP_EDITOR_MESSAGE_TYPES.preview, payload);
    }

    function schedulePopupEditorSync(delay = 120) {
        if (!isPopupEditorMode) return;
        clearTimeout(popupLayoutSyncTimeout);
        popupLayoutSyncTimeout = setTimeout(() => syncPopupEditorSnapshot(), delay);
    }

    function applyPopupWindowToCurrentWindow(windowConfig) {
        if (!isPopupMode) return;
        const { width, height, left, top } = buildPopupWindowMetrics(windowConfig);
        try {
            window.resizeTo(width, height);
            window.moveTo(left, top);
        } catch (error) {
            console.warn('popup window resize/move failed', error);
        }
    }

    /* --- State Restoration from LocalStorage --- */
    const savedOmrWidth = !isPopupMode ? localStorage.getItem('stg_skct_omr_width') : null;
    if (savedOmrWidth) {
        document.documentElement.style.setProperty('--omr-width', `${savedOmrWidth}px`);
    }

    const savedRatios = (!isAdminPreviewMode && !isPopupMode)
        ? (JSON.parse(localStorage.getItem('stg_skct_layout_ratios')) || DEFAULT_LAYOUT_RATIOS)
        : DEFAULT_LAYOUT_RATIOS;
    setLayoutRatios(savedRatios.timer, savedRatios.utils, savedRatios.calc, {
        persist: false,
        syncInputs: true,
        notifyPopupEditor: false
    });
    applyToolUiConfig(currentToolUiConfig, { persist: false, notifyPopupEditor: false });
    if (isPopupMode) {
        applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
    }

    const applyRatios = () => {
        if (!ratioTimer) return;
        setLayoutRatios(ratioTimer.value, ratioUtils.value, ratioCalc.value);
    };

    if (ratioTimer) {
        ratioTimer.addEventListener('input', applyRatios);
        ratioUtils.addEventListener('input', applyRatios);
        ratioCalc.addEventListener('input', applyRatios);
    }

    if (popupBottomPaddingRange) {
        popupBottomPaddingRange.addEventListener('input', () => {
            applyToolUiConfig({ bottomPaddingRatio: popupBottomPaddingRange.value }, { persist: false, notifyPopupEditor: true });
        });
    }

    let winResizeTimeout = null;
    window.addEventListener('resize', () => {
        syncToolsBottomPadding();
        if (isPopupMode) {
            clearTimeout(winResizeTimeout);
            winResizeTimeout = setTimeout(() => {
                applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
                schedulePopupEditorSync();
            }, 500);
        }
    });

    if (isPopupEditorMode) {
        popupEditorPanelEl?.classList.remove('hidden');
        topBarResizerEl?.classList.remove('hidden');
        toolsSectionResizerEl?.classList.remove('hidden');
        setPopupEditorCollapsed(true);
        setPopupEditorStatus('필요할 때만 펼쳐서 저장하고, 평소에는 접은 상태로 화면을 확인하세요.');

        popupEditorToggleBtn?.addEventListener('click', () => {
            setPopupEditorCollapsed(!popupEditorPanelEl.classList.contains('collapsed'));
        });

        popupEditorReloadBtn?.addEventListener('click', () => {
            currentPopupLayout = normalizePopupLayout(remotePopupLayout);
            currentToolUiConfig = normalizeToolUiConfig(remoteToolUiConfig);
            applyPopupWindowToCurrentWindow(currentPopupLayout.window);
            applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
            applyToolUiConfig(currentToolUiConfig, { persist: false, notifyPopupEditor: false });
            syncPopupEditorSnapshot(true);
            setPopupEditorStatus('서버에 저장된 스테이징 기본값을 다시 적용했습니다.');
        });

        popupEditorSaveBtn?.addEventListener('click', () => {
            const posted = postPopupEditorMessage(POPUP_EDITOR_MESSAGE_TYPES.saveRequest, capturePopupEditorPayload());
            setPopupEditorStatus(
                posted ? '관리자 페이지에 저장 요청을 보냈습니다...' : '관리자 페이지와 연결되지 않아 저장할 수 없습니다.',
                posted ? '' : 'error'
            );
        });

        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            const message = event.data || {};
            if (message.type !== POPUP_EDITOR_MESSAGE_TYPES.saveResult) return;
            if (message.success) {
                remotePopupLayout = normalizePopupLayout(message.payload?.popupLayout);
                remoteToolUiConfig = normalizeToolUiConfig(message.payload?.toolUiConfig);
                currentPopupLayout = normalizePopupLayout(remotePopupLayout);
                applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
                setLayoutRatios(
                    message.payload?.layoutRatios?.timer,
                    message.payload?.layoutRatios?.utils,
                    message.payload?.layoutRatios?.calc,
                    { persist: false, notifyPopupEditor: false }
                );
                applyToolUiConfig(remoteToolUiConfig, { persist: false, notifyPopupEditor: false });
                renderPopupEditorMetrics();
                setPopupEditorStatus('스테이징 기본값 저장이 완료되었습니다.', 'success');
            } else {
                setPopupEditorStatus(message.error || '저장 중 오류가 발생했습니다.', 'error');
            }
        });

        popupMoveWatcher = window.setInterval(() => {
            const signature = JSON.stringify(capturePopupWindowRatios());
            if (signature !== lastPopupWindowOnlySignature) {
                lastPopupEditorSignature = '';
                schedulePopupEditorSync(0);
            }
        }, 400);
        syncPopupEditorSnapshot(true);
    }

    /* --- OMR & Scoring Logic --- */
    const subjects = [
        { id: 'lang_und', name: '언어이해', count: 20 },
        { id: 'data_ana', name: '자료해석', count: 20 },
        { id: 'crea_math', name: '창의수리', count: 20 },
        { id: 'lang_rea', name: '언어추리', count: 20 },
        { id: 'seq_rea', name: '수열추리', count: 20 }
    ];

    const sanitizeMinutes = (value, fallback) => {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    };

    const escapeHtml = (value) => {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    };

    const formatMultilineHtml = (value) => escapeHtml(value || '').replace(/\n/g, '<br>');

    const DEFAULT_SUPPORT_CONFIG = {
        modalTitle: "☕ 광고 없는 SKCT 연습 공간,<br>함께 지켜주세요!",
        modalLead: "결제와 광고 없는 쾌적한 환경은 여러분의 소중한 참여로 유지됩니다.",
        modalBody: "안녕하세요! 저 역시 여러분과 함께 합격을 목표로 달리는 취준생입니다.\n이곳은 오직 공부에만 집중할 수 있도록 광고나 결제 유도 없이, 제가 직접 사비로 운영 중인 100% 무료 공간입니다.",
        modalPromise: "최근 방문자가 늘어나면서 서버 유지 비용에 대한 부담이 커지고 있습니다.\n'광고 없는 무료 개방' 원칙을 다음 달에도 변함없이 지켜나가기 위해, 이용자분들의 따뜻한 응원이 필요합니다.",
        modalHighlight: "이 공간이 준비에 도움이 되셨다면, 투네이션을 통해 '커피 한 잔 ☕' 정도의 마음을 나누어 주세요.\n보내주신 정성은 서버 운영 및 관리 비용으로만 사용됩니다.",
        breakFooter: "개발에 큰 힘이 됩니다. 좌측 ☕ 아이콘을 통해 후원 부탁드립니다.",
        contactText: "",
        contactUrl: "",
        buttonLabel: "☕ 쿨하게 지원하기",
        buttonUrl: "https://toon.at/donate/foreveryonehappy"
    };

    function applySupportConfig(config) {
        const support = { ...DEFAULT_SUPPORT_CONFIG, ...(config || {}) };
        const titleEl = document.getElementById('donateModalTitle');
        const leadEl = document.getElementById('donateModalLead');
        const bodyEl = document.getElementById('donateModalBody');
        const promiseEl = document.getElementById('donateModalPromise');
        const highlightEl = document.getElementById('donateModalHighlight');
        const contactEl = document.getElementById('donateModalContact');
        const buttonEl = document.getElementById('donateConfirmBtn');
        const breakHintEl = document.getElementById('breakSupportHint');

        if (titleEl) titleEl.innerHTML = support.modalTitle || DEFAULT_SUPPORT_CONFIG.modalTitle;
        if (leadEl) leadEl.innerHTML = formatMultilineHtml(support.modalLead);
        if (bodyEl) bodyEl.innerHTML = formatMultilineHtml(support.modalBody);
        if (promiseEl) promiseEl.innerHTML = formatMultilineHtml(support.modalPromise);
        if (highlightEl) highlightEl.innerHTML = formatMultilineHtml(support.modalHighlight);
        if (breakHintEl) breakHintEl.innerHTML = formatMultilineHtml(support.breakFooter);

        if (buttonEl) {
            buttonEl.textContent = support.buttonLabel || DEFAULT_SUPPORT_CONFIG.buttonLabel;
            buttonEl.dataset.href = support.buttonUrl || DEFAULT_SUPPORT_CONFIG.buttonUrl;
        }

        if (contactEl) {
            const contactText = (support.contactText || '').trim();
            const contactUrl = (support.contactUrl || '').trim();
            if (contactText && contactUrl) {
                const resolvedUrl = contactUrl.includes('@') && !/^https?:/i.test(contactUrl) && !/^mailto:/i.test(contactUrl)
                    ? `mailto:${contactUrl}`
                    : contactUrl;
                contactEl.innerHTML = `<a href="${escapeHtml(resolvedUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb; text-decoration:none; font-weight:600;">${escapeHtml(contactText)}</a>`;
                contactEl.style.display = 'block';
            } else if (contactText) {
                contactEl.textContent = contactText;
                contactEl.style.display = 'block';
            } else {
                contactEl.textContent = '';
                contactEl.style.display = 'none';
            }
        }
    }
    window.applySupportConfig = applySupportConfig;

    const isLegacyDefaultTimerConfig = (cfg) => {
        if (!cfg || typeof cfg !== 'object') return false;
        const total = sanitizeMinutes(cfg.total, -1);
        const subj = sanitizeMinutes(cfg.subj, -1);
        const brk = sanitizeMinutes(cfg.brk, -1);
        return total === 79 && subj === 15 && brk === 1 && cfg.source !== 'user';
    };

    const omrState = {
        myAnswers: {},
        correctAnswers: {},
        mode: 'answer', // 'answer' | 'score'
        currentGlobalIndex: 0
    };

    /* --- Multi-Phase Timer State --- */
    let timerInterval = null;
    let totalSeconds = 75 * 60;
    let configTotalMins = 75;
    let configSubjectMins = 15;
    let configBreakMins = 1;
    let phases = [];
    let currentPhaseIdx = 0;
    let currentPhaseSeconds = 0;
    let timerIsRunning = false;

    // 실전/연습 모드 (기본: 실전 모드)
    let isPracticeMode = localStorage.getItem('stg_skct_practice_mode') === 'true';
    // 실전 모드에서 시간 종료된 과목 인덱스를 추적
    const lockedSubjectIndices = new Set();

    const omrSidebar = document.getElementById('omrSidebar');
    const omrToggleBtn = document.getElementById('omrToggleBtn');
    const omrContent = document.getElementById('omrContent');
    const omrBody = document.getElementById('omrBody');
    
    // Toggle OMR Sidebar
    omrToggleBtn.addEventListener('click', () => {
        omrSidebar.classList.remove('collapsed');
        omrContent.classList.remove('hidden');
        // 리사이저 힌트 애니메이션 표시
        const resizer = document.getElementById('omrResizer');
        if (resizer) {
            resizer.classList.add('hint-active');
            // 플로팅 힌트 배지 생성
            const badge = document.createElement('div');
            badge.className = 'resizer-hint-badge';
            badge.innerHTML = '<span class="arrows">◀▶</span> 드래그하여 폭 조절';
            document.body.appendChild(badge);
            // 리사이저 위치에 배지 배치
            requestAnimationFrame(() => {
                const rect = resizer.getBoundingClientRect();
                badge.style.top = (rect.top + rect.height / 2 - 15) + 'px';
                badge.style.left = (rect.right + 8) + 'px';
            });
            // 3초 후 정리
            setTimeout(() => {
                resizer.classList.remove('hint-active');
                if (badge.parentNode) badge.parentNode.removeChild(badge);
            }, 3000);
        }
    });

    document.getElementById('omrCollapseBtn').addEventListener('click', () => {
        omrSidebar.classList.add('collapsed');
        omrContent.classList.add('hidden');
    });

    // OMR Drag Resizer
    const omrResizer = document.getElementById('omrResizer');
    let isResizingOmr = false;

    omrResizer.addEventListener('mousedown', (e) => {
        isResizingOmr = true;
        document.body.style.cursor = 'col-resize';
        // 방해 방지용
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizingOmr) return;
        let newWidth = e.clientX;
        if (newWidth < 130) newWidth = 130; // 좁혀진 레이아웃에 맞춰 최소폭 하향
        if (newWidth > document.body.clientWidth * 0.8) newWidth = document.body.clientWidth * 0.8; // 최대폭
        document.documentElement.style.setProperty('--omr-width', `${newWidth}px`);
        if (isPopupMode && appContainerEl) {
            currentPopupLayout.omrWidthRatio = roundRatio(clampNumber(newWidth / appContainerEl.clientWidth, 0.16, 0.7));
            schedulePopupEditorSync();
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizingOmr) {
            isResizingOmr = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            const currentWidth = getComputedStyle(document.documentElement).getPropertyValue('--omr-width').replace('px', '').trim();
            if (!isPopupMode) {
                localStorage.setItem('stg_skct_omr_width', currentWidth);
            } else if (appContainerEl) {
                currentPopupLayout.omrWidthRatio = roundRatio(clampNumber(parseFloat(currentWidth) / appContainerEl.clientWidth, 0.16, 0.7));
                schedulePopupEditorSync();
            }
            resizeCanvas(); // OMR 너비 변동으로 캔버스 폭 변경 대응
        }
    });

    if (isPopupEditorMode && topBarResizerEl && toolsSectionResizerEl && topBarEl && utilitySectionEl && calculatorSectionEl) {
        const MIN_TIMER_HEIGHT = 44;
        const MIN_UTILITY_HEIGHT = 120;
        const MIN_CALC_HEIGHT = 170;

        function readSectionHeights() {
            return {
                timerHeight: topBarEl.getBoundingClientRect().height,
                utilityHeight: utilitySectionEl.getBoundingClientRect().height,
                calcHeight: calculatorSectionEl.getBoundingClientRect().height
            };
        }

        function finishHorizontalResize() {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            topBarResizerEl.classList.remove('active');
            toolsSectionResizerEl.classList.remove('active');
            schedulePopupEditorSync();
        }

        let topBarResizeSession = null;
        let toolsResizeSession = null;

        topBarResizerEl.addEventListener('mousedown', (event) => {
            event.preventDefault();
            topBarResizeSession = { startY: event.clientY, heights: readSectionHeights() };
            topBarResizerEl.classList.add('active');
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        });

        toolsSectionResizerEl.addEventListener('mousedown', (event) => {
            event.preventDefault();
            toolsResizeSession = { startY: event.clientY, heights: readSectionHeights() };
            toolsSectionResizerEl.classList.add('active');
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (event) => {
            if (topBarResizeSession) {
                const { timerHeight, utilityHeight, calcHeight } = topBarResizeSession.heights;
                const totalHeight = timerHeight + utilityHeight + calcHeight;
                const desiredTimerHeight = clampNumber(
                    timerHeight + (event.clientY - topBarResizeSession.startY),
                    MIN_TIMER_HEIGHT,
                    totalHeight - (MIN_UTILITY_HEIGHT + MIN_CALC_HEIGHT)
                );
                const remainingHeight = totalHeight - desiredTimerHeight;
                const toolsTotal = Math.max(utilityHeight + calcHeight, 1);
                const utilityShare = utilityHeight / toolsTotal;
                const nextUtilityHeight = remainingHeight * utilityShare;
                const nextCalcHeight = remainingHeight - nextUtilityHeight;
                applyRatiosFromHeights(desiredTimerHeight, nextUtilityHeight, nextCalcHeight);
            }

            if (toolsResizeSession) {
                const { timerHeight, utilityHeight, calcHeight } = toolsResizeSession.heights;
                const toolsTotal = utilityHeight + calcHeight;
                const desiredUtilityHeight = clampNumber(
                    utilityHeight + (event.clientY - toolsResizeSession.startY),
                    MIN_UTILITY_HEIGHT,
                    toolsTotal - MIN_CALC_HEIGHT
                );
                const nextCalcHeight = toolsTotal - desiredUtilityHeight;
                applyRatiosFromHeights(timerHeight, desiredUtilityHeight, nextCalcHeight);
            }
        });

        document.addEventListener('mouseup', () => {
            if (topBarResizeSession || toolsResizeSession) {
                topBarResizeSession = null;
                toolsResizeSession = null;
                finishHorizontalResize();
            }
        });
    }

    // Question Timing
    let questionTimings = {}; // { "math_1": { spent: 45, state: 'answered' | 'skipped' } }
    let questionSpentSec = 0;

    // Helper to get current Question Key
    const getCurrentQKey = () => {
        let globalIndex = 0;
        for (let subj of subjects) {
            for (let i = 1; i <= subj.count; i++) {
                if (globalIndex === omrState.currentGlobalIndex) return `${subj.id}_${i}`;
                globalIndex++;
            }
        }
        return null;
    };

    const advanceQuestion = (isSkip = false) => {
        if (timerIsRunning) {
            const qKey = getCurrentQKey();
            if (qKey) {
                if (!questionTimings[qKey]) questionTimings[qKey] = { spent: 0, state: 'answered' };
                questionTimings[qKey].spent += questionSpentSec;
                if (isSkip) questionTimings[qKey].state = 'skipped';
                else questionTimings[qKey].state = 'answered';
                questionSpentSec = 0; // reset
            }
        }
        document.getElementById('globalClearBtn').click();
    };

    // 현재 globalIndex가 어떤 과목(subjectIndex)에 속하는지 반환
    const getSubjectIndexForGlobal = (globalIdx) => {
        let cumulative = 0;
        for (let i = 0; i < subjects.length; i++) {
            cumulative += subjects[i].count;
            if (globalIdx < cumulative) return i;
        }
        return subjects.length - 1;
    };

    // 과목 인덱스별 시작 globalIndex 반환
    const getSubjectStartIndex = (subjIdx) => {
        let start = 0;
        for (let k = 0; k < subjIdx; k++) {
            start += subjects[k].count;
        }
        return start;
    };

    // Render OMR
    function renderOMR() {
        let globalIndex = 0;
        omrBody.innerHTML = '';
        subjects.forEach((subj, subjIdx) => {
            const group = document.createElement('div');
            group.className = 'subject-group';
            const isSubjLocked = lockedSubjectIndices.has(subjIdx) && !isPracticeMode;
            if (isSubjLocked) group.classList.add('subject-locked');
            group.innerHTML = `<div class="subject-title">${subj.name}${isSubjLocked ? ' <span class="lock-badge">🔒 시간종료</span>' : ''}</div>`;
            
            for (let i = 1; i <= subj.count; i++) {
                const qRow = document.createElement('div');
                qRow.className = 'q-row';
                const currentIdx = globalIndex;
                const isCurrent = (currentIdx === omrState.currentGlobalIndex);
                const isPast = (currentIdx < omrState.currentGlobalIndex);

                if (omrState.mode === 'answer') {
                    if (isSubjLocked) {
                        qRow.classList.add('locked-q');
                    } else if (isCurrent) {
                        qRow.classList.add('current-q');
                    } else if (isPast) {
                        qRow.classList.add('past-q');
                    }
                } else if (omrState.mode === 'score') {
                    const qKey = `${subj.id}_${i}`;
                    const myAns = omrState.myAnswers[qKey];
                    const corAns = omrState.correctAnswers[qKey];
                    if (!myAns) qRow.classList.add('status-missed');
                    else if (myAns === corAns) qRow.classList.add('status-correct');
                    else qRow.classList.add('status-wrong');
                }
                
                let optionsHtml = '';
                for (let opt = 1; opt <= 5; opt++) {
                    const qKey = `${subj.id}_${i}`;
                    const isMyAnswer = omrState.myAnswers[qKey] === opt;
                    const isCorrectAnswer = omrState.correctAnswers[qKey] === opt;
                    
                    let extraClass = '';
                    if (omrState.mode === 'answer' && isMyAnswer) {
                        extraClass = 'selected';
                    } else if (omrState.mode === 'score') {
                        if (isCorrectAnswer) {
                            extraClass = 'selected correct';
                        } else if (isMyAnswer) {
                            extraClass = 'selected wrong';
                        }
                    }

                    let disabledAttr = '';
                    if (omrState.mode === 'answer') {
                        if (isPracticeMode) {
                            // 연습 모드: 모든 문항 자유 입력
                            disabledAttr = '';
                        } else if (isSubjLocked) {
                            disabledAttr = 'disabled';
                        } else if (!isCurrent) {
                            disabledAttr = 'disabled';
                        }
                    }

                    optionsHtml += `<button class="q-opt ${extraClass}" data-key="${qKey}" data-opt="${opt}" data-gidx="${currentIdx}" ${disabledAttr}>${opt}</button>`;
                }
                
                qRow.innerHTML = `
                    <div class="q-num">${i}.</div>
                    <div class="q-options" style="display:flex; align-items:center; gap:4px;">
                        ${optionsHtml}
                    </div>
                `;
                group.appendChild(qRow);
                globalIndex++;
            }
            omrBody.appendChild(group);
        });

        // Let's add scroll auto-focus right after render
        requestAnimationFrame(() => {
            const currentEl = document.querySelector('.q-row.current-q');
            if (currentEl) {
                currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // Attach events
        document.querySelectorAll('.q-opt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.dataset.key;
                const opt = parseInt(e.target.dataset.opt);
                const gIdx = parseInt(e.target.dataset.gidx);
                
                if (omrState.mode === 'answer') {
                    if (!e.target.disabled) {
                        omrState.myAnswers[key] = (omrState.myAnswers[key] === opt) ? null : opt;
                        if (isPracticeMode) {
                            // 연습 모드: 클릭한 문항 위치로 currentGlobalIndex 이동 후 advance
                            omrState.currentGlobalIndex = gIdx;
                        }
                        advanceQuestion(false);
                    }
                } else {
                    omrState.correctAnswers[key] = (omrState.correctAnswers[key] === opt) ? null : opt;
                    renderOMR();
                }
            });
        });
    }

    renderOMR();

    // Mode Toggle (단일 토글 버튼)
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    const omrModeLabel = document.getElementById('omrModeLabel');

    const updateModeUI = () => {
        if (omrState.mode === 'answer') {
            modeToggleBtn.textContent = '📝 정답 입력 모드로 전환';
            modeToggleBtn.classList.remove('active-score');
            if (omrModeLabel) {
                omrModeLabel.textContent = '📝 답안 작성 중';
                omrModeLabel.style.color = '';
            }
        } else {
            modeToggleBtn.textContent = '✏️ 답안 작성 모드로 돌아가기';
            modeToggleBtn.classList.add('active-score');
            if (omrModeLabel) omrModeLabel.textContent = '✅ 정답 입력 중';
            if (omrModeLabel) omrModeLabel.style.color = '#4ade80';
        }
    };

    const stopTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerIsRunning = false;
        if (timerPlayBtn) {
            timerPlayBtn.innerText = '▶ 시작 / 정지';
        }
        updateTimerUI();
        applyPhaseToOMR();
    };

    const enterScoreMode = () => {
        omrState.mode = 'score';
        stopTimer();
        updateModeUI();
        renderOMR();
    };

    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', () => {
            if (omrState.mode === 'answer') {
                enterScoreMode();
            } else {
                omrState.mode = 'answer';
                updateModeUI();
                renderOMR();
            }
        });
    }

    document.getElementById('scoreBtn').addEventListener('click', () => {
        // 정답이 하나도 입력 안 됐으면 안내
        const hasCorrectAnswers = Object.values(omrState.correctAnswers).some(v => v != null);
        if (!hasCorrectAnswers) {
            // 정답 입력 모드로 자동 전환
            enterScoreMode();
            return;
        }

        let totalScore = 0;
        let attemptedCount = 0;

        subjects.forEach(subj => {
            for (let i=1; i<=subj.count; i++) {
                const qKey = `${subj.id}_${i}`;
                if (omrState.myAnswers[qKey]) {
                    attemptedCount++;
                }
                if (omrState.correctAnswers[qKey] && omrState.myAnswers[qKey] === omrState.correctAnswers[qKey]) {
                    totalScore++;
                }
            }
        });
        
        const maxQ = subjects.reduce((sum, s) => sum + s.count, 0);
        document.getElementById('statAttempted').innerText = `${attemptedCount} / ${maxQ}`;
        document.getElementById('statCorrect').innerText = `${totalScore} 개`;
        
        const rate = attemptedCount > 0 ? ((totalScore / attemptedCount) * 100).toFixed(1) : 0;
        document.getElementById('statRate').innerText = `${rate}%`;
        
        const resEl = document.getElementById('scoreResult');
        resEl.classList.remove('hidden');
        const detailScoreBtn = document.getElementById('detailScoreBtn');
        if(detailScoreBtn) detailScoreBtn.classList.remove('hidden');
        renderOMR();
    });

    const detailScoreBtn = document.getElementById('detailScoreBtn');
    if (detailScoreBtn) {
        detailScoreBtn.addEventListener('click', () => {
            const tbody = document.getElementById('statTableBody');
            const detailWrapper = document.getElementById('statDetailWrapper');
            if(!tbody) return;
            
            let trHtml = '';
            let detailHtml = '';
            let allTimes = [];

            subjects.forEach(subj => {
                for (let i = 1; i <= subj.count; i++) {
                    const qKey = `${subj.id}_${i}`;
                    if (questionTimings[qKey]) {
                        allTimes.push({
                            key: qKey,
                            subjId: subj.id,
                            subjName: subj.name,
                            num: i,
                            spent: questionTimings[qKey].spent,
                            state: questionTimings[qKey].state
                        });
                    }
                }
            });
            
            subjects.forEach(subj => {
                let sAtt = 0;
                let sCor = 0;
                let wrongItems = [];
                for (let i=1; i<=subj.count; i++) {
                    const qKey = `${subj.id}_${i}`;
                    const myAns = omrState.myAnswers[qKey];
                    const corAns = omrState.correctAnswers[qKey];
                    if (myAns) sAtt++;
                    if (corAns && myAns === corAns) {
                        sCor++;
                    } else if (corAns) {
                       let myAnsText = myAns ? myAns : "-";
                       wrongItems.push(`<span style="background: ${myAns?'#fee2e2':'#f1f5f9'}; color: ${myAns?'#ef4444':'#64748b'}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${myAns?'#fca5a5':'#cbd5e1'}; white-space: nowrap; font-size: 11px;">
                            <strong>${i}번</strong>: 답(${myAnsText}) 정답(${corAns})
                       </span>`);
                    }
                }
                const rate = sAtt > 0 ? ((sCor / sAtt) * 100).toFixed(1) : 0;
                trHtml += `
                    <tr style="border-bottom: 1px solid #e2e8f0; height: 30px;">
                        <td style="font-weight: bold; color: #1e293b;">${subj.name}</td>
                        <td style="color: #64748b;">${subj.count}</td>
                        <td style="color: #3b82f6;">${sAtt}</td>
                        <td style="color: #22c55e;">${sCor}</td>
                        <td style="color: #f59e0b; font-weight: bold;">${rate}%</td>
                    </tr>
                `;
                const subjectTimes = allTimes.filter(t => t.subjId === subj.id);
                const wrongHtml = wrongItems.length > 0
                    ? `<div style="margin-bottom: 10px;">
                            <div style="font-size: 11px; color: #475569; font-weight: bold; margin-bottom: 4px;">오답/미응답</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${wrongItems.join('')}</div>
                       </div>`
                    : `<div style="margin-bottom: 10px; color:#10b981; font-weight:600;">오답/미응답이 없습니다.</div>`;
                const timeHtml = subjectTimes.length > 0
                    ? `<div>
                            <div style="font-size: 11px; color: #475569; font-weight: bold; margin-bottom: 4px;">소요 시간</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${subjectTimes.map(t => `<span style="background: ${t.state==='skipped' ? '#f1f5f9' : '#e0f2fe'}; color: ${t.state==='skipped' ? '#64748b' : '#0369a1'}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${t.state==='skipped' ? '#cbd5e1' : '#bae6fd'}; white-space: nowrap; font-size: 11px;">
                                <strong>${t.num}번</strong>: ${t.spent}초 소요${t.state==='skipped'?' (건너뜀)':''}
                            </span>`).join('')}</div>
                       </div>`
                    : `<div style="color:#64748b;">기록된 소요 시간이 없습니다.</div>`;
                detailHtml += `
                    <details style="border:1px solid #dbeafe; border-radius:10px; background:#f8fbff; padding:0 12px;" data-stat-subject="${subj.id}">
                        <summary style="cursor:pointer; list-style:none; padding:12px 0; display:flex; align-items:center; justify-content:space-between; gap:12px; font-weight:700; color:#1d4ed8;">
                            <span>${subj.name}</span>
                            <span style="font-size:11px; color:#475569; font-weight:600;">${sCor}/${sAtt || 0} 정답 · ${rate}% · ${subjectTimes.length}개 시간기록</span>
                        </summary>
                        <div style="padding:0 0 12px; border-top:1px dashed #bfdbfe;">
                            <div style="padding-top:10px;">
                                ${wrongHtml}
                                ${timeHtml}
                            </div>
                        </div>
                    </details>
                `;
            });
            tbody.innerHTML = trHtml;
            
            let topTimeHtml = '';
            if (allTimes.length > 0) {
                const sortedTimes = [...allTimes].sort((a, b) => b.spent - a.spent);
                const topHtml = sortedTimes.slice(0, 3).map((item, idx) => `
                    <div style="color: ${idx===0 ? '#ef4444' : '#f97316'}; font-weight:bold; font-size:12px; margin-top:2px;">
                        ${idx+1}위: [${item.subjName}] ${item.num}번 - ${item.spent}초 (${item.state === 'skipped' ? '건너뜀' : '마킹함'})
                    </div>
                `).join('');

                topTimeHtml = `
                    <div style="padding: 10px; background: #fffcf8; border: 1px solid #fed7aa; border-radius: 6px; margin-bottom: 8px;">
                        <span style="font-size:11px; color:#c2410c; font-weight:bold;">🚨 가장 오래 걸린 문항 Top 3</span>
                        ${topHtml}
                    </div>`;
            }

            if(detailWrapper) {
                detailWrapper.innerHTML = topTimeHtml + (detailHtml === '' ? '<div style="text-align:center; color:#10b981; font-weight:bold; margin-top:10px;">표시할 과목별 상세 통계가 없습니다.</div>' : detailHtml);
            }
            document.getElementById('statModal').classList.remove('hidden');
        });
    }


    /* --- Notepad / Canvas Toggle --- */
    const tabNotepad = document.getElementById('tabNotepad');
    const tabCanvas = document.getElementById('tabCanvas');
    const notepadWrapper = document.getElementById('notepadWrapper');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const notepad = document.getElementById('notepad');
    const noteFontControl = document.getElementById('noteFontControl');
    const canvasLineWidthControl = document.getElementById('canvasLineWidthControl');

    const updateToolControlVisibility = () => {
        noteFontControl?.classList.toggle('hidden', notepadWrapper.classList.contains('hidden'));
        canvasLineWidthControl?.classList.toggle('hidden', canvasWrapper.classList.contains('hidden'));
    };

    tabNotepad.addEventListener('click', () => {
        tabNotepad.classList.add('active');
        tabCanvas.classList.remove('active');
        notepadWrapper.classList.remove('hidden');
        canvasWrapper.classList.add('hidden');
        updateToolControlVisibility();
    });

    tabCanvas.addEventListener('click', () => {
        tabCanvas.classList.add('active');
        tabNotepad.classList.remove('active');
        canvasWrapper.classList.remove('hidden');
        notepadWrapper.classList.add('hidden');
        updateToolControlVisibility();
        resizeCanvas(); // Ensure canvas fits when revealed
    });

    updateToolControlVisibility();

    /* --- Drawing Board (Canvas) Logic --- */
    const canvas = document.getElementById('drawingBoard');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Resize canvas safely
    function resizeCanvas() {
        if (canvasWrapper.classList.contains('hidden')) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = canvasWrapper.clientWidth;
        canvas.height = canvasWrapper.clientHeight;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = currentToolUiConfig.canvasLineWidth;
        ctx.strokeStyle = 'rgba(40, 40, 60, 0.9)';

        ctx.drawImage(tempCanvas, 0, 0);
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 50);
    });
    
    // Initial size
    setTimeout(() => { if (!canvasWrapper.classList.contains('hidden')) resizeCanvas(); }, 100);

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function startDrawing(e) {
        if(e.type === 'mousedown' && e.button !== 0) return; // Only left click
        isDrawing = true;
        const pos = getMousePos(e);
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault(); // prevent touch scroll
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getMousePos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    noteFontSizeRange?.addEventListener('input', () => {
        applyToolUiConfig({ noteFontSize: noteFontSizeRange.value });
    });

    canvasLineWidthRange?.addEventListener('input', () => {
        applyToolUiConfig({ canvasLineWidth: canvasLineWidthRange.value });
        ctx.lineWidth = currentToolUiConfig.canvasLineWidth;
    });

    /* --- global Utilities --- */
    document.getElementById('clearCurrentToolBtn').addEventListener('click', () => {
        if (!canvasWrapper.classList.contains('hidden')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            notepad.value = '';
        }
    });

    document.getElementById('globalClearBtn').addEventListener('click', () => {
        // Clear all states across problems
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        notepad.value = '';
        // Note: SKCT initializes Calculator as well, so we can init it too.
        calcState.current = '0';
        calcState.storedValue = null;
        calcState.operator = null;
        calcState.waitingNew = false;
        calcState.history = [];
        renderCalcDisplay();
        
        // Advance question
        if (omrState.mode === 'answer') {
            const maxQ = subjects.reduce((sum, s) => sum + s.count, 0);
            if (omrState.currentGlobalIndex < maxQ - 1) {
                omrState.currentGlobalIndex++;
            }
            renderOMR();
        }
    });

    const omrResetBtn = document.getElementById('omrResetBtn');
    if (omrResetBtn) {
        omrResetBtn.addEventListener('click', () => {
            if (confirm("모든 답안과 정답을 초기화하시겠습니까?")) {
                omrState.myAnswers = {};
                omrState.correctAnswers = {};
                omrState.currentGlobalIndex = 0;
                omrState.mode = 'answer';
                questionTimings = {};
                questionSpentSec = 0;
                lockedSubjectIndices.clear(); // 잠금 해제
                updateModeUI();
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                notepad.value = '';
                calcState.current = '0';
                calcState.storedValue = null;
                calcState.operator = null;
                calcState.waitingNew = false;
                calcState.history = [];
                renderCalcDisplay();
                
                document.getElementById('scoreResult').classList.add('hidden');
                renderOMR();
                
                requestAnimationFrame(() => {
                    omrBody.scrollTop = 0;
                });
            }
        });
    }

    /* --- Calculator Logic --- */
    const calcHistory = document.getElementById('calcHistory');
    const CALC_MAX_INPUT_LENGTH = 32;
    const calcState = {
        current: '0',
        storedValue: null,
        operator: null,
        waitingNew: false,
        history: []
    };

    function getOperatorSymbol(operator) {
        if (operator === '*') return '×';
        if (operator === '/') return '÷';
        return operator || '';
    }

    function limitCalcInput(value) {
        return value.length <= CALC_MAX_INPUT_LENGTH ? value : value.slice(0, CALC_MAX_INPUT_LENGTH);
    }

    function getCurrentCalcLine() {
        if (calcState.operator && calcState.storedValue !== null) {
            const rightText = calcState.waitingNew ? '' : ` ${calcState.current}`;
            return `${calcState.storedValue} ${getOperatorSymbol(calcState.operator)}${rightText}`;
        }
        return calcState.current;
    }

    function escapeCalcLine(line) {
        return String(line)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    function getCalcLineSizeClass(line, isCurrent = false) {
        const length = String(line).length;
        if (length > (isCurrent ? 26 : 24)) return 'calc-line-tight';
        if (length > (isCurrent ? 18 : 16)) return 'calc-line-compact';
        return '';
    }

    function pushCalcHistory(line) {
        calcState.history.push(line);
        calcState.history = calcState.history.slice(-3);
    }

    function renderCalcDisplay() {
        if (!calcHistory) return;
        const lines = calcState.history.map((line) => {
            const sizeClass = getCalcLineSizeClass(line, false);
            return `<div class="calc-line history-line ${sizeClass}">${escapeCalcLine(line)}</div>`;
        });
        const currentLine = getCurrentCalcLine();
        const currentSizeClass = getCalcLineSizeClass(currentLine, true);
        lines.push(`<div class="calc-line current-line ${currentSizeClass}">${escapeCalcLine(currentLine)}</div>`);
        calcHistory.innerHTML = lines.join('');
        calcHistory.scrollTop = calcHistory.scrollHeight;
    }

    function handleNumber(numStr) {
        if (calcState.waitingNew) {
            calcState.current = numStr === '.' ? '0.' : numStr;
            calcState.waitingNew = false;
        } else if (numStr === '.') {
            if (!calcState.current.includes('.')) {
                calcState.current += '.';
            }
        } else if (numStr === '00') {
            calcState.current = calcState.current === '0' ? '0' : `${calcState.current}00`;
        } else if (calcState.current === '0') {
            calcState.current = numStr;
        } else {
            calcState.current += numStr;
        }
        calcState.current = limitCalcInput(calcState.current);
        renderCalcDisplay();
    }

    function handleOperator(op) {
        if (calcState.operator && !calcState.waitingNew) {
            calculateResult(false);
        }
        calcState.storedValue = calcState.current;
        calcState.operator = op;
        calcState.waitingNew = true;
        renderCalcDisplay();
    }

    function calculateResult(commitHistory = true) {
        if (!calcState.operator || calcState.storedValue === null) return;

        const leftValue = calcState.storedValue;
        const rightValue = calcState.current;
        const prev = parseFloat(leftValue);
        const curr = parseFloat(rightValue);
        let res = 0;

        switch (calcState.operator) {
            case '+': res = prev + curr; break;
            case '-': res = prev - curr; break;
            case '*': res = prev * curr; break;
            case '/': res = curr !== 0 ? prev / curr : 'Error'; break;
        }

        if (res !== 'Error') {
            res = Math.round(res * 100000000) / 100000000;
        }

        const resultText = String(res);
        if (commitHistory) {
            pushCalcHistory(`${leftValue} ${getOperatorSymbol(calcState.operator)} ${rightValue} = ${resultText}`);
        }

        calcState.current = resultText;
        calcState.operator = null;
        calcState.storedValue = null;
        calcState.waitingNew = true;
        renderCalcDisplay();
    }

    function handleFn(fnStr) {
        if (fnStr === 'C') {
            calcState.current = '0';
            calcState.storedValue = null;
            calcState.operator = null;
            calcState.waitingNew = false;
        } else if (fnStr === 'BACK') {
            if (!calcState.waitingNew && calcState.current !== '0' && calcState.current !== 'Error') {
                calcState.current = calcState.current.slice(0, -1);
                if (calcState.current === '' || calcState.current === '-') calcState.current = '0';
            }
        } else if (fnStr === 'SQRT') {
            const currentValue = parseFloat(calcState.current);
            const result = Number.isFinite(currentValue) && currentValue >= 0
                ? String(Math.round(Math.sqrt(currentValue) * 100000000) / 100000000)
                : 'Error';
            pushCalcHistory(`√${calcState.current} = ${result}`);
            calcState.current = result;
            calcState.storedValue = null;
            calcState.operator = null;
            calcState.waitingNew = true;
        } else if (fnStr === '=') {
            calculateResult(true);
        }
        renderCalcDisplay();
    }

    renderCalcDisplay();

    document.getElementById('mockChatBtn')?.addEventListener('click', () => {
        alert('skct와 동일한 위치에 존재하는 기능 없는 버튼입니다');
    });

    document.getElementById('mockQuestionBtn')?.addEventListener('click', () => {
        alert('skct와 동일한 위치에 존재하는 기능 없는 버튼입니다');
    });

    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.dataset.val;
            if (e.target.classList.contains('num-btn')) {
                handleNumber(val);
            } else if (e.target.classList.contains('op-btn')) {
                handleOperator(val);
            } else if (e.target.classList.contains('fn-btn')) {
                handleFn(val);
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (document.activeElement === notepad || document.activeElement.tagName === 'INPUT') {
            return;
        }

        const key = e.key;
        if (/[0-9]/.test(key)) {
            handleNumber(key);
            e.preventDefault();
        } else if (key === '.') {
            handleNumber('.');
            e.preventDefault();
        } else if (['+', '-', '*', '/'].includes(key)) {
            handleOperator(key);
            e.preventDefault();
        } else if (key === 'Enter' || key === '=') {
            calculateResult(true);
            e.preventDefault();
        } else if (key === 'Backspace') {
            handleFn('BACK');
            e.preventDefault();
        } else if (key.toLowerCase() === 'c') {
            handleFn('C');
            e.preventDefault();
        } else if (key === 'Delete' || key === 'Escape') {
            e.preventDefault();
        }
    });


    const buildPhases = () => {
        phases = [];
        subjects.forEach((subj, idx) => {
            phases.push({ type: 'subject', name: `${idx+1}과목 ${subj.name}`, mins: configSubjectMins });
            if (idx < subjects.length - 1) {
                phases.push({ type: 'break', name: '쉬는 시간', mins: configBreakMins });
            }
        });
        currentPhaseIdx = 0;
        if (phases.length > 0) {
            currentPhaseSeconds = phases[0].mins * 60;
        }
    };
    
    let savedTimerCfg = null;
    if (!isAdminPreviewMode) {
        savedTimerCfg = JSON.parse(localStorage.getItem('stg_skct_timer_cfg'));
        if (isLegacyDefaultTimerConfig(savedTimerCfg)) {
            localStorage.removeItem('stg_skct_timer_cfg');
            savedTimerCfg = null;
        }
    }
    if (savedTimerCfg) {
        configTotalMins = sanitizeMinutes(savedTimerCfg.total, 75);
        configSubjectMins = sanitizeMinutes(savedTimerCfg.subj, 15);
        configBreakMins = sanitizeMinutes(savedTimerCfg.brk, 1);
    }

    let configGuideEnabled = true;
    let configGuideSec = 45;
    const savedGuideCfg = isAdminPreviewMode ? null : JSON.parse(localStorage.getItem('stg_skct_guide_cfg'));
    if (savedGuideCfg) {
        configGuideEnabled = savedGuideCfg.enabled;
        configGuideSec = savedGuideCfg.sec;
    }
    const totalTimeInput = document.getElementById('cfgTotal');
    const subjectTimeInput = document.getElementById('cfgSubj');
    const breakTimeInput = document.getElementById('cfgBreak');
    const guideEnabledInput = document.getElementById('cfgGuideEnabled');
    const guideSecInput = document.getElementById('cfgGuideSec');

    if(totalTimeInput) totalTimeInput.value = configTotalMins;
    if(subjectTimeInput) subjectTimeInput.value = configSubjectMins;
    if(breakTimeInput) breakTimeInput.value = configBreakMins;
    if(guideEnabledInput) guideEnabledInput.checked = configGuideEnabled;
    if(guideSecInput) guideSecInput.value = configGuideSec;
    
    totalSeconds = configTotalMins * 60;
    buildPhases();

    const displayTotal = document.getElementById('displayTotalTime');
    const displayPName = document.getElementById('displayPhaseName');
    const displayPTime = document.getElementById('displayPhaseTime');
    const timerPlayBtn = document.getElementById('timerPlayBtn');
    
    const formatTime = (totalSecs) => {
        if (totalSecs < 0) totalSecs = 0;
        const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const s = (totalSecs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const updateTimerUI = () => {
        if(!displayTotal) return;
        displayTotal.innerText = `${formatTime(totalSeconds)}`;
        if (currentPhaseIdx < phases.length) {
            const p = phases[currentPhaseIdx];
            displayPName.innerText = `${p.name}`;
            displayPTime.innerText = formatTime(currentPhaseSeconds);
            if (p.type === 'break') {
                displayPName.style.color = '#fb923c'; 
                displayPTime.style.color = '#fb923c';
            } else {
                displayPName.style.color = '#60a5fa'; 
                displayPTime.style.color = '#4ade80';
            }
        } else {
            displayPName.innerText = '모든 시험 종료';
            displayPTime.innerText = '00:00';
            displayPName.style.color = '#ef4444';
            displayPTime.style.color = '#ef4444';
        }

        // Guide Timer Update (연습 모드에서는 가이드 타이머 숨김)
        const guideWrapper = document.getElementById('guideTimerWrapper');
        const displayGuide = document.getElementById('displayGuideTime');
        const qKey = getCurrentQKey();
        if (guideWrapper && displayGuide && configGuideEnabled && !isPracticeMode && timerIsRunning && qKey && currentPhaseIdx < phases.length && phases[currentPhaseIdx].type !== 'break') {
            guideWrapper.style.display = 'block';
            const remaining = configGuideSec - questionSpentSec;
            if (remaining >= 0) {
                displayGuide.style.color = '#38bdf8';
                displayGuide.innerText = `${remaining}초 남음`;
            } else {
                displayGuide.style.color = '#ef4444';
                displayGuide.innerText = `+${Math.abs(remaining)}초 초과`;
            }
        } else if (guideWrapper) {
            guideWrapper.style.display = 'none';
        }
    };

    window.applyRemoteTimerDefaults = (total, subj, brk) => {
        if (timerIsRunning) return; // ignore if running
        configSubjectMins = sanitizeMinutes(subj, 15);
        configBreakMins = sanitizeMinutes(brk, 1);
        configTotalMins = sanitizeMinutes(total, 75);

        if (totalTimeInput) totalTimeInput.value = configTotalMins;
        if (subjectTimeInput) subjectTimeInput.value = configSubjectMins;
        if (breakTimeInput) breakTimeInput.value = configBreakMins;

        totalSeconds = configTotalMins * 60;
        buildPhases();
        updateTimerUI();
    };

    window.applyRemoteGuideDefaults = (enabled, sec) => {
        configGuideEnabled = enabled;
        configGuideSec = sec || 45;
        if (guideEnabledInput) guideEnabledInput.checked = enabled;
        if (guideSecInput) guideSecInput.value = sec;
        updateTimerUI();
    };

    window.applyRemoteLayoutRatios = (timer, utils, calc) => {
        setLayoutRatios(timer, utils, calc, {
            persist: false,
            notifyPopupEditor: false
        });
    };

    window.applyRemotePopupLayout = (popupLayout) => {
        remotePopupLayout = normalizePopupLayout(popupLayout);
        if (!isPopupMode) return;
        currentPopupLayout = normalizePopupLayout(remotePopupLayout);
        applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
        schedulePopupEditorSync();
    };

    window.applyRemoteToolUiConfig = (toolUiConfig) => {
        remoteToolUiConfig = normalizeToolUiConfig(toolUiConfig);
        applyToolUiConfig(remoteToolUiConfig, { persist: false, notifyPopupEditor: false });
    };

    // 부드러운 알람 비프음 (Web Audio API)
    let audioCtx = null;
    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    };

    const playBeep = (freq = 600, durationMs = 300, count = 1) => {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const playSingle = (startTime) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'triangle'; // 부드러운 소리
            osc.frequency.setValueAtTime(freq, startTime);
            
            // Envelope: 부드럽게 커지고 서서히 작아짐 (팝 노이즈 방지)
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durationMs / 1000);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + durationMs / 1000);
        };

        const now = audioCtx.currentTime;
        for (let i = 0; i < count; i++) {
            playSingle(now + i * (durationMs / 1000 + 0.2)); // 간격 추가
        }
    };

    updateTimerUI();

    const timerTick = () => {
        if (timerIsRunning && currentPhaseIdx < phases.length && phases[currentPhaseIdx].type !== 'break') {
            questionSpentSec++;
        }

        if (totalSeconds > 0) {
            totalSeconds--;
        } else {
            clearInterval(timerInterval);
            timerIsRunning = false;
            timerPlayBtn.innerText = '▶ 시작 / 정지';
            currentPhaseIdx = phases.length;
            updateTimerUI();
            playBeep(440, 300, 3); // 전체 시간 종료
            return;
        }

        if (currentPhaseIdx < phases.length) {
            if (currentPhaseSeconds > 0) {
                currentPhaseSeconds--;
            } else {
                // 페이즈 종료 → 알람음 재생
                const endedPhase = phases[currentPhaseIdx];
                const endedPhaseIdx = currentPhaseIdx;
                currentPhaseIdx++;
                
                // --- 도구 초기화 (과목 전환 혹은 쉬는 시간 진입 시) ---
                if (typeof ctx !== 'undefined' && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (typeof notepad !== 'undefined') notepad.value = '';
                if (typeof calcState !== 'undefined') {
                    calcState.current = '0';
                    calcState.previous = null;
                    calcState.operator = null;
                    calcState.waitingNew = false;
                    if (typeof updateCalcDisplay === 'function') updateCalcDisplay();
                }
                // ------------------------------------------------
                if (currentPhaseIdx < phases.length) {
                    currentPhaseSeconds = phases[currentPhaseIdx].mins * 60;
                    if (endedPhase.type === 'subject') {
                        playBeep(659, 400, 2); // 과목 종료: 부드러운 더블 차임 (E5)
                        // 실전 모드: 종료된 과목 잠금
                        if (!isPracticeMode) {
                            const subjIdx = Math.floor(endedPhaseIdx / 2);
                            lockedSubjectIndices.add(subjIdx);
                        }
                    } else {
                        playBeep(523, 400, 1); // 쉬는시간 종료: 단일 차임 (C5)
                    }
                    applyPhaseToOMR();
                } else {
                    clearInterval(timerInterval);
                    timerIsRunning = false;
                    timerPlayBtn.innerText = '▶ 시작 / 정지';
                    playBeep(440, 500, 3); // 전체 종료
                    // 실전 모드: 마지막 과목도 잠금
                    if (!isPracticeMode) {
                        const subjIdx = Math.floor((currentPhaseIdx - 1) / 2);
                        lockedSubjectIndices.add(subjIdx);
                    }
                    applyPhaseToOMR();
                }
            }
        }
        updateTimerUI();
    };

    const applyPhaseToOMR = () => {
        const breakOverlay = document.getElementById('omrBreakOverlay');
        if (currentPhaseIdx >= phases.length) {
            if (breakOverlay) breakOverlay.classList.add('hidden');
            renderOMR();
            return;
        }
        const currentPhase = phases[currentPhaseIdx];
        if (currentPhase.type === 'break') {
            if (!isPracticeMode && timerIsRunning) {
                if (breakOverlay) breakOverlay.classList.remove('hidden');
            } else {
                // 연습 모드이거나 타이머 중지 상태: break overlay 표시하지 않음
                if (breakOverlay) breakOverlay.classList.add('hidden');
            }
        } else {
            if (breakOverlay) breakOverlay.classList.add('hidden');
            
            const subjIdx = Math.floor(currentPhaseIdx / 2);
            const targetIndex = getSubjectStartIndex(subjIdx);
            if (!isPracticeMode) {
                // 실전 모드: 강제로 다음 과목 첫 문항으로 이동
                if (omrState.currentGlobalIndex < targetIndex) {
                    omrState.currentGlobalIndex = targetIndex;
                }
            }
            renderOMR();
        }
    };

    // --- 초기 렌더링 갱신 ---
    updateTimerUI();
    applyPhaseToOMR();

    if(timerPlayBtn) {
        timerPlayBtn.addEventListener('click', () => {
            initAudio(); // 사용자 인터랙션 시 AudioContext 활성화
            if (currentPhaseIdx >= phases.length && totalSeconds <= 0) return;
            if (timerIsRunning) {
                clearInterval(timerInterval);
                timerIsRunning = false;
                timerPlayBtn.innerText = '▶ 시작 / 정지';
                applyPhaseToOMR();
            } else {
                timerInterval = setInterval(timerTick, 1000);
                timerIsRunning = true;
                timerPlayBtn.innerText = '⏸ 일시정지';
                applyPhaseToOMR();
            }
        });
    }

    const settingsToggle = document.getElementById('settingsToggle');
    const settingsModal = document.getElementById('settingsModal');
    if(settingsToggle && settingsModal) {
        settingsToggle.addEventListener('click', () => {
            // 모달 열릴 때 현재 모드 상태 동기화
            const practiceModeInput = document.getElementById('cfgPracticeMode');
            if (practiceModeInput) practiceModeInput.checked = isPracticeMode;
            settingsModal.classList.remove('hidden');
        });
    }

    /* --- Extension Modal Logic --- */
    const extToggle = document.getElementById('extensionToggle');
    const extModal = document.getElementById('extensionModal');
    const extClose = document.getElementById('extensionClose');
    const extStatusCheck = document.getElementById('extStatusCheck');
    const extInstallGuide = document.getElementById('extInstallGuide');
    
    if (extToggle && extModal && extClose) {
        extToggle.addEventListener('click', () => {
            extModal.style.display = 'flex';
            extModal.classList.remove('hidden');
            
            // Check if extension injected the marker
            setTimeout(() => {
                const marker = document.getElementById('skct-extension-installed');
                if (marker) {
                    extStatusCheck.innerHTML = `
                        <div style="font-size:50px; margin-bottom:10px;">✅</div>
                        <div style="font-weight:bold; font-size:18px; color:#10b981;">설치 완료 및 정상 작동중!</div>
                        <div style="font-size:12px; color:#94a3b8; margin-top:8px;">이제 링커리어 화면에 가림막이 뜨지 않습니다.</div>
                    `;
                    extInstallGuide.classList.add('hidden');
                } else {
                    extStatusCheck.innerHTML = `
                        <div style="font-size:50px; margin-bottom:10px;">❌</div>
                        <div style="font-weight:bold; font-size:18px; color:#ef4444;">무적모드(테스트 기능) 확장이 아직 설치되지 않았습니다</div>
                    `;
                    extInstallGuide.classList.remove('hidden');
                }
            }, 300); // 딜레이 약간 주어 렌더링 안정화
        });
        
        extClose.addEventListener('click', () => {
            extModal.classList.add('hidden');
            extModal.style.display = '';
        });
    }

    const settingsApplyBtn = document.getElementById('settingsApplyBtn');
    if (settingsApplyBtn) {
        settingsApplyBtn.addEventListener('click', () => {
            configSubjectMins = sanitizeMinutes(document.getElementById('cfgSubj').value, 15);
            configBreakMins = sanitizeMinutes(document.getElementById('cfgBreak').value, 1);
            configTotalMins = sanitizeMinutes(document.getElementById('cfgTotal').value, 75);
            document.getElementById('cfgTotal').value = configTotalMins;
            if (!isAdminPreviewMode) {
                localStorage.setItem('stg_skct_timer_cfg', JSON.stringify({total: configTotalMins, subj: configSubjectMins, brk: configBreakMins, source: 'user'}));
            }
            
            configGuideEnabled = document.getElementById('cfgGuideEnabled').checked;
            configGuideSec = parseInt(document.getElementById('cfgGuideSec').value) || 45;
            if (!isAdminPreviewMode) {
                localStorage.setItem('stg_skct_guide_cfg', JSON.stringify({enabled: configGuideEnabled, sec: configGuideSec}));
            }

            // 모드 설정 적용
            const practiceModeInput = document.getElementById('cfgPracticeMode');
            if (practiceModeInput) {
                isPracticeMode = practiceModeInput.checked;
                localStorage.setItem('stg_skct_practice_mode', isPracticeMode);
            }

            if (timerIsRunning) {
                stopTimer();
            }
            totalSeconds = configTotalMins * 60;
            lockedSubjectIndices.clear(); // 모드 변경 시 잠금 초기화
            buildPhases();
            updateTimerUI();
            applyRatios();
            renderOMR();
            settingsModal.classList.add('hidden');
        });
    }

    // Modal & Help Controls
    const helpToggle = document.getElementById('helpToggle');
    const helpModal = document.getElementById('helpModal');
    if(helpToggle && helpModal) {
        helpToggle.addEventListener('click', () => helpModal.classList.remove('hidden'));
    }

    const donateToggle = document.getElementById('donateToggle');
    const donateModal = document.getElementById('donateModal');
    if (donateToggle && donateModal) {
        donateToggle.addEventListener('click', () => {
            donateModal.classList.remove('hidden');
        });
    }
    const donateConfirmBtn = document.getElementById('donateConfirmBtn');
    if (donateConfirmBtn) {
        donateConfirmBtn.addEventListener('click', () => {
            donateModal.classList.add('hidden');
            const targetUrl = donateConfirmBtn.dataset.href || DEFAULT_SUPPORT_CONFIG.buttonUrl;
            window.open(targetUrl, '_blank');
        });
    }
    const donateLaterBtn = document.getElementById('donateLaterBtn');
    if (donateLaterBtn) {
        donateLaterBtn.addEventListener('click', () => {
             donateModal.classList.add('hidden');
        });
    }
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.classList.add('hidden');
                if (modal.id === 'statsModal' && typeof window.stopPresencePolling === 'function') {
                    window.stopPresencePolling();
                }
            }
        });
    });

    // Developer Notice System - Firebase 기반 공지 렌더링 함수 (호출은 index.html에서 수행)

    // 🛡️ 숨겨진 관리자 페이지 통로
    const helpModalHeaderTitle = document.querySelector('.help-modal-header h3');
    if (helpModalHeaderTitle) {
        helpModalHeaderTitle.style.cursor = 'pointer';
        helpModalHeaderTitle.title = "더블 클릭 시 관리자 페이지로 이동합니다.";
        helpModalHeaderTitle.addEventListener('dblclick', () => {
            window.open('admin.html', '_blank');
        });
    }

    function renderNotice(data) {
        if (!data.show) return;
        const noticeContainer = document.getElementById('devNotice');
        if (!noticeContainer) return;

        const typeColors = {
            info: { bg: '#eff6ff', border: '#3b82f6', icon: '💡' },
            warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
            update: { bg: '#f0fdf4', border: '#22c55e', icon: '🆕' },
            event: { bg: '#fdf4ff', border: '#a855f7', icon: '🎉' }
        };
        const style = typeColors[data.type] || typeColors.info;

        // message에서 줄바꿈을 <br>로 변환
        const formattedMessage = (data.message || '').replace(/\n/g, '<br>');

        noticeContainer.innerHTML = `
            <div style="background: ${style.bg}; border: 1px solid ${style.border}; border-left: 4px solid ${style.border}; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; font-size: 13px;">
                <div style="font-weight: bold; color: #1e293b; margin-bottom: 4px;">${style.icon} ${data.title || '공지'}</div>
                <div style="color: #475569; line-height: 1.5;">${formattedMessage}</div>
                ${data.updated ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 6px; text-align: right;">📅 ${data.updated}</div>` : ''}
            </div>
        `;
    }
    window.renderNotice = renderNotice;

    // (hitscounter.dev 로직이 Firebase total_visits로 대체되어 완전히 제거됨)

    // Disable implicit focusing on calc history area
    const calcDisplayEl = document.getElementById('calcHistory');
    if(calcDisplayEl) calcDisplayEl.addEventListener('mousedown', (e) => e.preventDefault());

    /* --- Window Popup Mode Logic --- */
    function launchPopupMode() {
        const popupUrl = window.location.href;
        const { width, height, left, top } = buildPopupWindowMetrics(remotePopupLayout.window);
        const popupParams = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,directories=no`;
        const newWin = window.open(popupUrl, 'stg_skct_popup_mode', popupParams);

        if (!newWin) {
            alert("팝업 창이 차단되었습니다.\n브라우저 주소창의 팝업 차단 해제를 눌러 다시 시도해주세요.");
            return;
        }

        document.body.innerHTML = '<h2 style="padding: 20px; color: #64748b; text-align: center;">팝업 모드로 이동되었습니다.<br><br>이 창은 자동으로 닫히거나 무시하시면 됩니다.</h2>';
        setTimeout(() => { window.close(); }, 100);
    }

    const popupBtn = document.getElementById('popupBtn');
    const popupToggle = document.getElementById('popupToggle');
    if (popupBtn) popupBtn.addEventListener('click', launchPopupMode);
    if (popupToggle) popupToggle.addEventListener('click', launchPopupMode);

    if (window.name === 'stg_skct_popup_mode') {
        if (popupBtn) popupBtn.style.display = 'none';
        if (popupToggle) popupToggle.style.display = 'none';
    }

});



// ============================================================
// Community Module (bundled)
// ============================================================
const isStagingReadOnly = window.SKCT_FLAGS?.stagingReadOnly === true;
const showReadOnlyNotice = () => {
    alert('이 테스트 사이트는 운영 데이터를 읽기 전용으로만 표시합니다.\n좋아요, 댓글, 글 작성, 관리자 저장은 모두 차단됩니다.');
};

// ── State ──
let currentTab = 'qna';
let popularConfig = { minLikes: 5, minComments: 3 };
let allPosts = {};
let replyCache = {}; // 댓글 캐시
let expandedPost = null;
let isAdmin = false;
let adminHash = null;
let postsListener = null;

// Session ID for likes (anonymous, per-browser)
const sessionId = localStorage.getItem('stg_skct_sid') || (() => {
    const id = 'S' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('stg_skct_sid', id);
    return id;
})();

const WRITABLE_TABS = ['qna', 'tip', 'review', 'improvement'];

// ── Utilities ──
async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function timeAgo(ts) {
    const d = Date.now() - ts, m = Math.floor(d/60000), h = Math.floor(d/3600000), dy = Math.floor(d/86400000);
    if (m < 1) return '방금 전'; if (m < 60) return m+'분 전'; if (h < 24) return h+'시간 전'; if (dy < 30) return dy+'일 전';
    const dt = new Date(ts); return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}`;
}
function getSavedNick() { return localStorage.getItem('stg_skct_cm_nick') || ''; }
function saveNick(n) { localStorage.setItem('stg_skct_cm_nick', n); }

// ── Firebase Config (One-shot fetch) ──
async function listenConfig() {
    try {
        const snap = await get(ref(getDb(), 'config'));
        if (!snap.exists()) return;
        const cfg = snap.val();
        const noticeData = cfg.notice_community || cfg.notice;
        if (noticeData) renderNotice(noticeData);
        else { const el = document.getElementById('cmNotice'); if (el) el.innerHTML = ''; }
        if (cfg.popularConfig) popularConfig = cfg.popularConfig;
        // re-render if popular tab is active
        if (currentTab === 'popular') renderTab();
    } catch(e) { console.error("Config load error:", e); }
}

function renderNotice(data) {
    const el = document.getElementById('cmNotice');
    if (!el) return;
    if (!data || !data.show) { el.innerHTML = ''; return; }
    const colors = { info:{bg:'#eff6ff',br:'#3b82f6',ic:'💡'}, warning:{bg:'#fffbeb',br:'#f59e0b',ic:'⚠️'}, update:{bg:'#f0fdf4',br:'#22c55e',ic:'🆕'}, event:{bg:'#fdf4ff',br:'#a855f7',ic:'🎉'} };
    const s = colors[data.type] || colors.info;
    el.innerHTML = `<div id="cmNoticeWrapper" class="cm-notice" style="cursor:pointer; background:${s.bg};border:1px solid ${s.br};border-left:4px solid ${s.br};">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:bold;color:#1e293b;">${s.ic} ${data.title||'공지'}</div>
            <div id="cmNoticeToggleIcon" style="font-size:10px; color:#64748b; background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px;">▼ 펼치기</div>
        </div>
        <div id="cmNoticeBody" style="display:none; margin-top:8px; border-top:1px dashed ${s.br}; padding-top:8px;">
            <div style="color:#475569;line-height:1.5;font-size:13px;">${(data.message||'').replace(/\n/g,'<br>')}</div>
            ${data.updated?`<div style="font-size:11px;color:#94a3b8;margin-top:6px;text-align:right;">📅 ${data.updated}</div>`:''}
        </div>
    </div>`;

    document.getElementById('cmNoticeWrapper').onclick = () => {
        const body = document.getElementById('cmNoticeBody');
        const icon = document.getElementById('cmNoticeToggleIcon');
        if (body.style.display === 'none') {
            body.style.display = 'block';
            icon.textContent = '▲ 접기';
        } else {
            body.style.display = 'none';
            icon.textContent = '▼ 펼치기';
        }
    };
}

// ── Posts CRUD (DC-style: nickname + password per post) ──
async function createPost(category, nickname, password, content) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    if (!WRITABLE_TABS.includes(category)) return;
    if (!nickname || !password || !content.trim()) { alert('닉네임, 비밀번호, 내용을 모두 입력해주세요.'); return; }
    if (content.length > 1000) { alert('1000자 이내로 작성해주세요.'); return; }
    const lastPost = parseInt(localStorage.getItem('stg_skct_last_post') || '0');
    if (Date.now() - lastPost < 30000) { alert('30초 후에 다시 작성할 수 있습니다.'); return; }
    saveNick(nickname);
    await set(push(ref(getDb(), 'staging_hidden_v1/posts')), {
        category, nickname, passwordHash: await sha256(password),
        content: content.trim(), timestamp: Date.now(),
        likes: 0, replyCount: 0, deleted: false, pinned: false
    });
    localStorage.setItem('stg_skct_last_post', Date.now());
    await loadPostsOnce();
}

async function editPost(pid, newContent, password) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    const p = allPosts[pid]; if (!p) return false;
    if (!isAdmin && (await sha256(password)) !== p.passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return false; }
    await update(ref(getDb(), `staging_hidden_v1/posts/${pid}`), { content: newContent.trim(), editedAt: Date.now() });
    await loadPostsOnce();
    return true;
}

async function softDeletePost(pid, password) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    const p = allPosts[pid]; if (!p) return;
    if (!isAdmin && (await sha256(password)) !== p.passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return; }
    await update(ref(getDb(), `staging_hidden_v1/posts/${pid}`), { deleted: true, deletedAt: Date.now() });
    await loadPostsOnce();
}

async function toggleLike(pid) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    const p = allPosts[pid]; if (!p) return;
    const likedRef = ref(getDb(), `staging_hidden_v1/userLikes/${sessionId}/${pid}`);
    const likesRef = ref(getDb(), `staging_hidden_v1/posts/${pid}/likes`);
    
    // Optistic update
    if (p.likedByMe) {
        p.likedByMe = false; p.likes = Math.max((p.likes||0)-1, 0);
        await set(likedRef, null); await runTransaction(likesRef, c => Math.max((c||0)-1, 0));
    } else {
        p.likedByMe = true; p.likes = (p.likes||0)+1;
        await set(likedRef, true); await runTransaction(likesRef, c => (c||0)+1);
    }
    renderTab();
}

// ── Replies CRUD ──
async function createReply(pid, nickname, password, content) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    if (!nickname || !password || !content.trim()) { alert('닉네임, 비밀번호, 내용을 모두 입력해주세요.'); return; }
    saveNick(nickname);
    await set(push(ref(getDb(), `staging_hidden_v1/replies/${pid}`)), {
        nickname, passwordHash: await sha256(password), content: content.trim(),
        timestamp: Date.now(), isAdmin: false, pinned: false, deleted: false
    });
    await runTransaction(ref(getDb(), `staging_hidden_v1/posts/${pid}/replyCount`), c => (c||0)+1);
    delete replyCache[pid];
}

async function editReply(pid, rid, newContent, password) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    const s = await get(ref(getDb(), `staging_hidden_v1/replies/${pid}/${rid}`)); if (!s.exists()) return false;
    if (!isAdmin && (await sha256(password)) !== s.val().passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return false; }
    await update(ref(getDb(), `staging_hidden_v1/replies/${pid}/${rid}`), { content: newContent.trim(), editedAt: Date.now() }); 
    delete replyCache[pid]; return true;
}

async function softDeleteReply(pid, rid, password) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    const s = await get(ref(getDb(), `staging_hidden_v1/replies/${pid}/${rid}`)); if (!s.exists()) return;
    if (!isAdmin && (await sha256(password)) !== s.val().passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return; }
    await update(ref(getDb(), `staging_hidden_v1/replies/${pid}/${rid}`), { deleted: true, deletedAt: Date.now() });
    await runTransaction(ref(getDb(), `staging_hidden_v1/posts/${pid}/replyCount`), c => Math.max((c||0)-1, 0));
    delete replyCache[pid];
}

// ── Admin ──
async function adminLogin(code) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    if (!adminHash) { alert('Firebase Console에서 staging_hidden_v1/config/adminHash를 설정하세요.'); return; }
    if ((await sha256(code)) !== adminHash) { alert('관리자 코드가 틀립니다.'); return; }
    isAdmin = true; alert('✅ 관리자 모드!'); renderTab();
}
async function adminMoveToFaq(pid) { if (isStagingReadOnly) return showReadOnlyNotice(); if (!isAdmin) return; await update(ref(getDb(), `staging_hidden_v1/posts/${pid}`), { category: 'faq' }); }
async function adminPinPost(pid) { if (isStagingReadOnly) return showReadOnlyNotice(); if (!isAdmin) return; const s = await get(ref(getDb(), `staging_hidden_v1/posts/${pid}/pinned`)); await update(ref(getDb(), `staging_hidden_v1/posts/${pid}`), { pinned: !(s.val()||false) }); }
async function adminReply(pid, content) {
    if (isStagingReadOnly) return showReadOnlyNotice();
    if (!isAdmin || !content) return;
    await set(push(ref(getDb(), `staging_hidden_v1/replies/${pid}`)), { nickname:'🛡️ 관리자', passwordHash:'', content, timestamp:Date.now(), isAdmin:true, pinned:true, deleted:false });
    await runTransaction(ref(getDb(), `staging_hidden_v1/posts/${pid}/replyCount`), c => (c||0)+1);
    delete replyCache[pid];
}
async function adminPinReply(pid, rid) { if (isStagingReadOnly) return showReadOnlyNotice(); if (!isAdmin) return; const s = await get(ref(getDb(), `staging_hidden_v1/replies/${pid}/${rid}/pinned`)); await update(ref(getDb(), `staging_hidden_v1/replies/${pid}/${rid}`), { pinned: !(s.val()||false) }); delete replyCache[pid]; }

// ── Data Loading ──
async function loadPostsOnce() {
    try {
        const snap = await get(ref(getDb(), 'posts'));
        allPosts = {};
        if (snap.exists()) {
            snap.forEach(c => { const p = c.val(); p.id = c.key; allPosts[c.key] = p; });
        }

        const userLikes = isStagingReadOnly
            ? {}
            : ((await get(ref(getDb(), `userLikes/${sessionId}`))).val() || {});

        for (const pid in allPosts) {
            allPosts[pid].likedByMe = !!userLikes[pid];
        }
        renderTab();
    } catch(e) { console.error("Posts load error:", e); }
}

// 하위 호환성 및 기존 호출 대응
window.startListening = loadPostsOnce;
function stopListening() {}

function getFilteredPosts(tab) {
    const posts = Object.values(allPosts).filter(p => !p.deleted);
    if (tab === 'popular') return posts.filter(p => (p.likes||0)>=popularConfig.minLikes||(p.replyCount||0)>=popularConfig.minComments).sort((a,b)=>(b.likes||0)-(a.likes||0));
    return posts.filter(p => p.category===tab).sort((a,b)=>{ if(a.pinned&&!b.pinned) return -1; if(!a.pinned&&b.pinned) return 1; return b.timestamp-a.timestamp; });
}

// ── UI Rendering ──
function renderTab() {
    const posts = getFilteredPosts(currentTab);
    const list = document.getElementById('cmPostList');
    if (!list) return;
    document.querySelectorAll('.cm-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab));
    const wf = document.getElementById('cmWriteForm');
    if (wf) {
        if (isStagingReadOnly) {
            wf.style.display = 'flex';
            wf.innerHTML = '<div style="width:100%; padding:12px 14px; border:1px dashed #fb923c; border-radius:10px; background:#fff7ed; color:#9a3412; font-size:13px; font-weight:600; line-height:1.5;">이 테스트 사이트는 운영 데이터를 읽기 전용으로만 보여줍니다. 게시글 작성, 좋아요, 댓글, 수정, 삭제는 차단됩니다.</div>';
        } else {
            wf.style.display = WRITABLE_TABS.includes(currentTab) ? 'flex' : 'none';
        }
    }
    // Restore saved nickname
    const nickInput = document.getElementById('cmNick');
    if (nickInput && !nickInput.value) nickInput.value = getSavedNick();

    if (!posts.length) { list.innerHTML = `<div class="cm-empty"><span>📭</span><p>아직 게시글이 없습니다.</p></div>`; return; }
    list.innerHTML = posts.map(p => postCardHTML(p)).join('');
    attachPostEvents();
}

function postCardHTML(p) {
    const liked = p.likedByMe;
    let badges = '';
    if (p.pinned) badges += '<span class="cm-badge pin">📌 고정</span>';
    if (currentTab === 'popular') { const cl={qna:'Q&A', tip:'Tip', review:'후기', improvement:'개선', faq:'FAQ'}; badges += `<span class="cm-badge cat">${cl[p.category]||''}</span>`; }
    if (p.editedAt) badges += '<span class="cm-badge edit">(수정됨)</span>';
    const adm = (!isStagingReadOnly && isAdmin) ? `<div class="cm-admin-acts"><button data-act="pin" data-id="${p.id}">📌</button>${p.category!=='faq'?`<button data-act="faq" data-id="${p.id}">→FAQ</button>`:''}<button data-act="areply" data-id="${p.id}">🛡️</button></div>` : '';
    const likeControl = isStagingReadOnly
        ? `<span class="cm-like ${liked?'liked':''}" style="display:inline-flex; align-items:center; gap:4px; opacity:0.72; cursor:default;">${liked?'❤️':'🤍'} <span>${p.likes||0}</span></span>`
        : `<button class="cm-like ${liked?'liked':''}" data-act="like" data-id="${p.id}">${liked?'❤️':'🤍'} <span>${p.likes||0}</span></button>`;
    const authorActs = isStagingReadOnly
        ? `<div class="cm-author-acts"><span style="font-size:11px; color:#94a3b8; font-weight:600;">읽기 전용</span></div>`
        : `<div class="cm-author-acts">
            <button class="cm-act-btn" data-act="edit" data-id="${p.id}">수정</button>
            <button class="cm-act-btn cm-del" data-act="del" data-id="${p.id}">삭제</button>
        </div>`;

    return `<div class="cm-card ${p.pinned?'pinned':''}" data-pid="${p.id}">
        <div class="cm-card-head"><div class="cm-meta">${badges}<span class="cm-nick">${esc(p.nickname)}</span><span class="cm-time">${timeAgo(p.timestamp)}</span></div>${adm}</div>
        <div class="cm-body" id="cmBody_${p.id}">${esc(p.content).replace(/\n/g,'<br>')}</div>
        <div class="cm-foot"><div class="cm-stats">
            ${likeControl}
            <button class="cm-reply-toggle" data-act="replies" data-id="${p.id}">💬 <span>${p.replyCount||0}</span></button>
        </div>${authorActs}</div>
        <div class="cm-replies ${expandedPost===p.id?'':'hidden'}" id="cmReplies_${p.id}"></div>
    </div>`;
}

function attachPostEvents() {
    document.querySelectorAll('#cmPostList [data-act]').forEach(btn => {
        btn.onclick = async e => {
            e.stopPropagation();
            const act = btn.dataset.act, id = btn.dataset.id;
            if (isStagingReadOnly && act !== 'replies') {
                showReadOnlyNotice();
                return;
            }
            if (act === 'like') await toggleLike(id);
            else if (act === 'replies') await doToggleReplies(id);
            else if (act === 'edit') { const pw = prompt('비밀번호를 입력하세요:'); if (pw !== null) showEditForm(id, pw); }
            else if (act === 'del') { const pw = prompt('삭제하려면 비밀번호를 입력하세요:'); if (pw !== null) await softDeletePost(id, pw); }
            else if (act === 'pin') await adminPinPost(id);
            else if (act === 'faq') { if (confirm('FAQ로 이동?')) await adminMoveToFaq(id); }
            else if (act === 'areply') { 
                const c = prompt('관리자 답글:'); 
                if (c) { 
                    await adminReply(id, c); 
                    if (allPosts[id]) allPosts[id].replyCount = (allPosts[id].replyCount || 0) + 1;
                    expandedPost = null; renderTab(); await doToggleReplies(id, true); 
                } 
            }
        };
    });
}

// ── Edit Form ──
async function showEditForm(pid, password) {
    const p = allPosts[pid]; if (!p) return;
    if (!isAdmin && (await sha256(password)) !== p.passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return; }
    const el = document.getElementById(`cmBody_${pid}`); if (!el) return;
    el.innerHTML = `<textarea class="cm-edit-ta" id="cmEI_${pid}">${esc(p.content)}</textarea>
        <div class="cm-edit-acts"><button id="cmES_${pid}" class="cm-edit-save">저장</button><button id="cmEC_${pid}" class="cm-edit-cancel">취소</button></div>`;
    document.getElementById(`cmES_${pid}`).onclick = async () => {
        const v = document.getElementById(`cmEI_${pid}`).value.trim();
        if (v) await editPost(pid, v, password);
    };
    document.getElementById(`cmEC_${pid}`).onclick = () => renderTab();
}

// ── Replies UI ──
async function doToggleReplies(pid, forceReload = false) {
    if (!forceReload && expandedPost === pid) { expandedPost = null; const s = document.getElementById(`cmReplies_${pid}`); if (s) s.classList.add('hidden'); return; }
    expandedPost = pid;
    const section = document.getElementById(`cmReplies_${pid}`);
    if (!section) return;
    section.classList.remove('hidden');
    
    if (!forceReload && replyCache[pid] && (Date.now() - replyCache[pid].time < 60000)) {
        renderReplies(pid, replyCache[pid].data);
        return;
    }
    
    section.innerHTML = '<div class="cm-loading">로딩 중...</div>';
    const snap = await get(ref(getDb(), `replies/${pid}`));
    let replies = [];
    if (snap.exists()) snap.forEach(c => { const r = c.val(); r.id = c.key; replies.push(r); });
    replies.sort((a, b) => { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return a.timestamp - b.timestamp; });
    
    const finalData = replies.filter(r => !r.deleted);
    replyCache[pid] = { data: finalData, time: Date.now() };
    renderReplies(pid, finalData);
}

function renderReplies(pid, replies) {
    const section = document.getElementById(`cmReplies_${pid}`); if (!section) return;
    let html = replies.map(r => {
        const acts = isStagingReadOnly
            ? ''
            : ((!r.isAdmin ? `<button data-ract="redit" data-pid="${pid}" data-rid="${r.id}">수정</button><button data-ract="rdel" data-pid="${pid}" data-rid="${r.id}">삭제</button>` : '') +
            (isAdmin && !r.isAdmin ? `<button data-ract="rpin" data-pid="${pid}" data-rid="${r.id}">${r.pinned ? '해제' : '📌'}</button>` : ''));
        return `<div class="cm-reply ${r.isAdmin ? 'admin' : ''} ${r.pinned ? 'pinned' : ''}">
            <div class="cm-reply-meta">${r.isAdmin ? '<span class="cm-admin-badge">🛡️</span>' : ''}${r.pinned && !r.isAdmin ? '<span class="cm-badge pin">📌</span>' : ''}
                <span class="cm-nick">${esc(r.nickname)}</span><span class="cm-time">${timeAgo(r.timestamp)}</span>${r.editedAt ? '<span class="cm-badge edit">(수정됨)</span>' : ''}</div>
            <div class="cm-reply-body" id="cmRB_${r.id}">${esc(r.content).replace(/\n/g, '<br>')}</div>
            <div class="cm-reply-acts">${acts}</div></div>`;
    }).join('');

    if (isStagingReadOnly) {
        html += `<div class="cm-reply-form" style="background:#fff7ed; border:1px dashed #fb923c; color:#9a3412; font-weight:600;">이 테스트 사이트에서는 운영 댓글을 읽기만 할 수 있습니다.</div>`;
    } else {
        html += `<div class="cm-reply-form">
            <div class="cm-reply-form-top"><input type="text" id="cmRN_${pid}" placeholder="닉네임" value="${esc(getSavedNick())}" maxlength="20"><input type="password" id="cmRP_${pid}" placeholder="비밀번호"></div>
            <div class="cm-reply-form-bot"><textarea id="cmRI_${pid}" placeholder="답글을 입력하세요..." rows="2"></textarea><button id="cmRS_${pid}" class="cm-reply-submit">등록</button></div>
        </div>`;
    }
    section.innerHTML = html;

    // Reply submit
    const replySubmitBtn = document.getElementById(`cmRS_${pid}`);
    if (replySubmitBtn) replySubmitBtn.onclick = async () => {
        const nick = document.getElementById(`cmRN_${pid}`).value.trim();
        const pw = document.getElementById(`cmRP_${pid}`).value;
        const content = document.getElementById(`cmRI_${pid}`).value.trim();
        if (!nick || !pw || !content) { alert('닉네임, 비밀번호, 내용을 모두 입력하세요.'); return; }
        await createReply(pid, nick, pw, content);
        if (allPosts[pid]) allPosts[pid].replyCount = (allPosts[pid].replyCount || 0) + 1;
        expandedPost = null; renderTab(); await doToggleReplies(pid);
    };

    // Reply edit/delete events
    section.querySelectorAll('[data-ract]').forEach(btn => {
        btn.onclick = async () => {
            const a = btn.dataset.ract, p = btn.dataset.pid, rid = btn.dataset.rid;
            if (a === 'redit') {
                const pw = prompt('비밀번호:');
                if (pw === null) return;
                const snap = await get(ref(getDb(), `replies/${p}/${rid}`)); if (!snap.exists()) return;
                const r = snap.val();
                if (!isAdmin && (await sha256(pw)) !== r.passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return; }
                const el = document.getElementById(`cmRB_${rid}`); if (!el) return;
                el.innerHTML = `<textarea class="cm-edit-ta" id="cmERI_${rid}">${esc(r.content)}</textarea><div class="cm-edit-acts"><button id="cmERS_${rid}">저장</button><button id="cmERC_${rid}">취소</button></div>`;
                document.getElementById(`cmERS_${rid}`).onclick = async () => { const v = document.getElementById(`cmERI_${rid}`).value.trim(); if (v) { await editReply(p, rid, v, pw); expandedPost = null; await doToggleReplies(p, true); } };
                document.getElementById(`cmERC_${rid}`).onclick = async () => { expandedPost = null; await doToggleReplies(p, true); };
            } else if (a === 'rdel') {
                const pw = prompt('비밀번호:'); if (pw === null) return;
                await softDeleteReply(p, rid, pw); 
                if (allPosts[p]) allPosts[p].replyCount = Math.max((allPosts[p].replyCount || 0) - 1, 0);
                expandedPost = null; renderTab(); await doToggleReplies(p, true);
            } else if (a === 'rpin') {
                await adminPinReply(p, rid); expandedPost = null; await doToggleReplies(p, true);
            }
        };
    });
}

// ── Tab Switch ──
function switchTab(tab) { currentTab = tab; expandedPost = null; renderTab(); }

// ── Submit Post ──
function submitPost() {
    const nick = document.getElementById('cmNick')?.value.trim();
    const pw = document.getElementById('cmPw')?.value;
    const content = document.getElementById('cmInput')?.value.trim();
    if (!nick || !pw || !content) { alert('닉네임, 비밀번호, 내용을 모두 입력해주세요.'); return; }
    createPost(currentTab, nick, pw, content).then(() => {
        document.getElementById('cmInput').value = '';
        document.getElementById('cmPw').value = '';
    });
}

// ── Modal Open/Close ──
function openModal() {
    const m = document.getElementById('cmModal');
    if (m) { m.classList.remove('hidden'); listenConfig(); startListening(); }
}
function closeModal() {
    const m = document.getElementById('cmModal');
    if (m) { m.classList.add('hidden'); stopListening(); expandedPost = null; }
}

// ── Init ──
function init() {
    document.getElementById('commentToggle')?.addEventListener('click', openModal);
    document.getElementById('cmCloseBtn')?.addEventListener('click', closeModal);
    document.getElementById('cmRefreshBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('cmRefreshBtn');
        if(btn) { btn.textContent = '⏳ 로딩중'; btn.disabled = true; }
        await loadPostsOnce();
        if(btn) { btn.textContent = '🔄 새로고침'; btn.disabled = false; }
    });
    document.querySelectorAll('.cm-tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    document.getElementById('cmSubmitBtn')?.addEventListener('click', submitPost);
    // Admin: double-click title
    document.getElementById('cmTitle')?.addEventListener('dblclick', () => {
        const c = prompt('관리자 코드:'); if (c) adminLogin(c);
    });
}

init();




