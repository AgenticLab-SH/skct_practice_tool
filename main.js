document.addEventListener('DOMContentLoaded', () => {
    const runtimeFlags = window.SKCT_FLAGS || {};
    const isAdminPreviewMode = runtimeFlags.adminPreview === true;
    const isPopupMode = window.name === 'skct_popup_mode';
    const isPopupEditorMode = isPopupMode && isAdminPreviewMode && runtimeFlags.popupEditor === true;
    const ADVANCED_UNLOCK_STORAGE_KEY = 'skct_advanced_unlock';
    const ADVANCED_PASSWORD_FAIL_STORAGE_KEY = 'skct_advanced_password_failures';
    const ADVANCED_UNLOCK_DURATION_MS = 1000 * 60 * 30;
    const ADVANCED_FAIL_WINDOW_MS = 1000 * 60 * 10;
    const ADVANCED_MAX_FAIL_COUNT = 5;
    const ADVANCED_FAIL_COOLDOWN_MS = 1000 * 30;
    const readAdvancedUnlockState = () => {
        try {
            return JSON.parse(localStorage.getItem(ADVANCED_UNLOCK_STORAGE_KEY) || 'null');
        } catch (error) {
            return null;
        }
    };
    const hasAdvancedUnlock = () => {
        const state = readAdvancedUnlockState();
        return Boolean(state && Number.isFinite(state.expiresAt) && state.expiresAt > Date.now());
    };
    const getAdvancedUnlockRemainingMs = () => {
        const state = readAdvancedUnlockState();
        if (!state || !Number.isFinite(state.expiresAt)) return 0;
        return Math.max(0, state.expiresAt - Date.now());
    };
    const readAdvancedFailState = () => {
        try {
            return JSON.parse(localStorage.getItem(ADVANCED_PASSWORD_FAIL_STORAGE_KEY) || 'null');
        } catch (error) {
            return null;
        }
    };
    const writeAdvancedFailState = (state) => {
        localStorage.setItem(ADVANCED_PASSWORD_FAIL_STORAGE_KEY, JSON.stringify(state));
    };
    const resetAdvancedFailState = () => {
        localStorage.removeItem(ADVANCED_PASSWORD_FAIL_STORAGE_KEY);
    };
    const getAdvancedCooldownRemainingMs = () => {
        const state = readAdvancedFailState();
        if (!state || !Number.isFinite(state.lockedUntil)) return 0;
        return Math.max(0, state.lockedUntil - Date.now());
    };
    const registerAdvancedPasswordFailure = () => {
        const now = Date.now();
        const current = readAdvancedFailState();
        const attempts = Array.isArray(current?.attempts)
            ? current.attempts.filter((value) => Number.isFinite(value) && now - value <= ADVANCED_FAIL_WINDOW_MS)
            : [];
        attempts.push(now);
        const nextState = { attempts };
        if (attempts.length >= ADVANCED_MAX_FAIL_COUNT) {
            nextState.lockedUntil = now + ADVANCED_FAIL_COOLDOWN_MS;
        }
        writeAdvancedFailState(nextState);
        return nextState;
    };
    const isAdvancedMode = runtimeFlags.advanced === true && hasAdvancedUnlock();
    const DEFAULT_LAYOUT_RATIOS = { timer: 8.6, utils: 45.0, calc: 46.4 };
    const DEFAULT_POPUP_LAYOUT = {
        window: { widthRatio: 0.269, heightRatio: 0.98, leftRatio: 0.731, topRatio: 0 },
        omrWidthRatio: 0.30
    };
    const DEFAULT_TOOL_UI_CONFIG = { bottomPaddingRatio: 0.11, sideButtonColumnRatio: 0.09, noteFontSize: 12, canvasLineWidth: 2 };
    const ADVANCED_SUBSCRIPTION_PLAN_OPTIONS = ['3일 이용권', '7일 이용권', '14일 이용권', '1달 이용권', '1년 이용권', '영구이용권'];
    const DEFAULT_ADVANCED_PLAN_TYPE = '1달 이용권';
    const PERMANENT_ADVANCED_PLAN_TYPE = '영구이용권';
    const MANUAL_SUBSCRIPTION_REQUEST_STORAGE_KEY = 'skct_manual_subscription_recent_request';
    const DEFAULT_ADVANCED_FEATURE_CONFIG = {
        subscriptions: [
            {
                id: 'seed-0208',
                planType: PERMANENT_ADVANCED_PLAN_TYPE,
                userIdentity: '운영자 기본값',
                loginId: 'seed-0208',
                status: 'active',
                passwordSalt: 'seed-20260406',
                passwordHash: 'a1c558a1b233a95e200e0d78af383b407fc9326d5b46ee8107cf5a4dccba5ac9',
                expiresAt: '',
                note: '기본 운영 계정'
            }
        ]
    };
    const DEFAULT_MANUAL_SUBSCRIPTION_CONFIG = {
        enabled: true,
        donationUrl: 'https://toon.at/donate/foreveryonehappy',
        supportEmail: 'zhdlsqpdj@gmail.com',
        adminPublicKeyPem: '',
        plans: [
            { code: 'manual-7d', label: '7일 이용권', days: 7, price: 4900, enabled: true, highlight: '시험 직전 단기 몰입용' },
            { code: 'manual-14d', label: '14일 이용권', days: 14, price: 7900, enabled: true, highlight: '가장 추천하는 주력 이용권' }
        ]
    };
    const FIREBASE_RTDB_BASE_URL = 'https://skct-tool-default-rtdb.firebaseio.com';
    const POPUP_EDITOR_MESSAGE_TYPES = {
        preview: 'skct-popup-layout-preview',
        saveRequest: 'skct-popup-layout-save-request',
        saveResult: 'skct-popup-layout-save-result'
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
    const popupSideColumnRange = document.getElementById('popupSideColumnRange');
    const popupSideColumnValue = document.getElementById('popupSideColumnValue');
    const ratioTimer = document.getElementById('ratioTimer');
    const ratioUtils = document.getElementById('ratioUtils');
    const ratioCalc = document.getElementById('ratioCalc');
    const noteFontSizeRange = document.getElementById('noteFontSizeRange');
    const noteFontSizeValue = document.getElementById('noteFontSizeValue');
    const canvasLineWidthRange = document.getElementById('canvasLineWidthRange');
    const canvasLineWidthValue = document.getElementById('canvasLineWidthValue');
    const advancedGuideToggle = document.getElementById('advancedGuideToggle');
    const advancedGuideModal = document.getElementById('advancedGuideModal');
    const advancedAccessSummary = document.getElementById('advancedAccessSummary');
    const advancedAccessIdInput = document.getElementById('advancedAccessIdInput');
    const advancedAccessPasswordInput = document.getElementById('advancedAccessPasswordInput');
    const advancedAccessSubmitBtn = document.getElementById('advancedAccessSubmitBtn');
    const advancedAccessReveal = document.getElementById('advancedAccessReveal');
    const advancedAccessReuseBtn = document.getElementById('advancedAccessReuseBtn');
    const advancedAccessStatus = document.getElementById('advancedAccessStatus');
    const manualSubscriptionDonateLink = document.getElementById('manualSubscriptionDonateLink');
    const manualSubscriptionPlanCards = document.getElementById('manualSubscriptionPlanCards');
    const manualSubscriptionPlanSelect = document.getElementById('manualSubscriptionPlanSelect');
    const manualSubscriptionDonationNameInput = document.getElementById('manualSubscriptionDonationNameInput');
    const manualSubscriptionNicknameInput = document.getElementById('manualSubscriptionNicknameInput');
    const manualSubscriptionEmailInput = document.getElementById('manualSubscriptionEmailInput');
    const manualSubscriptionDesiredIdInput = document.getElementById('manualSubscriptionDesiredIdInput');
    const manualSubscriptionStartDateInput = document.getElementById('manualSubscriptionStartDateInput');
    const manualSubscriptionMemoInput = document.getElementById('manualSubscriptionMemoInput');
    const manualSubscriptionPasswordInput = document.getElementById('manualSubscriptionPasswordInput');
    const manualSubscriptionPasswordConfirmInput = document.getElementById('manualSubscriptionPasswordConfirmInput');
    const manualSubscriptionSubmitBtn = document.getElementById('manualSubscriptionSubmitBtn');
    const manualSubscriptionSubmitStatus = document.getElementById('manualSubscriptionSubmitStatus');
    const manualSubscriptionLookupIdInput = document.getElementById('manualSubscriptionLookupIdInput');
    const manualSubscriptionLookupPasswordInput = document.getElementById('manualSubscriptionLookupPasswordInput');
    const manualSubscriptionLookupBtn = document.getElementById('manualSubscriptionLookupBtn');
    const manualSubscriptionLookupResult = document.getElementById('manualSubscriptionLookupResult');
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedFeatureModal = document.getElementById('advancedFeatureModal');
    const advancedStatsDownloadBtn = document.getElementById('advancedStatsDownloadBtn');
    const advancedToolsStatus = document.getElementById('advancedToolsStatus');
    const advancedFeatureManualFlowBtn = document.getElementById('advancedFeatureManualFlowBtn');
    const advancedFeatureDonateLink = document.getElementById('advancedFeatureDonateLink');
    const settingsVersionRow = document.getElementById('settingsVersionRow');
    let popupLayoutSyncTimeout = null;
    let popupMoveWatcher = null;
    let lastPopupEditorSignature = '';
    let lastPopupWindowOnlySignature = '';
    let isAdvancedConfigReady = false;
    let remoteManualSubscriptionConfig = DEFAULT_MANUAL_SUBSCRIPTION_CONFIG;

    document.body.classList.toggle('popup-editor-mode', isPopupEditorMode);
    document.body.classList.toggle('advanced-mode', isAdvancedMode);
    if (isAdvancedMode) {
        document.title = `${document.title} | 고급버전`;
        if (settingsVersionRow) {
            settingsVersionRow.innerHTML = '<strong style="color:#334155;">현재 버전</strong>: v2026.04.06.1525 (고급버전)';
        }
    }

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
        return {
            widthRatio: DEFAULT_POPUP_LAYOUT.window.widthRatio,
            heightRatio: DEFAULT_POPUP_LAYOUT.window.heightRatio,
            leftRatio: DEFAULT_POPUP_LAYOUT.window.leftRatio,
            topRatio: DEFAULT_POPUP_LAYOUT.window.topRatio
        };
    }

    function normalizePopupLayout(raw) {
        const fallbackWindow = createLegacyPopupWindowDefaults();
        const sourceWindow = raw?.window || {};
        const widthRatio = parseFloat(sourceWindow.widthRatio);
        const heightRatio = parseFloat(sourceWindow.heightRatio);
        const safeWidthRatio = Number.isFinite(widthRatio) ? clampNumber(widthRatio, 0.18, 0.8) : fallbackWindow.widthRatio;
        const safeHeightRatio = Number.isFinite(heightRatio) ? clampNumber(heightRatio, 0.45, 0.98) : fallbackWindow.heightRatio;
        const leftRatioValue = parseFloat(sourceWindow.leftRatio);
        const topRatioValue = parseFloat(sourceWindow.topRatio);
        const omrWidthRatio = parseFloat(raw?.omrWidthRatio);

        return {
            window: {
                widthRatio: roundRatio(safeWidthRatio),
                heightRatio: roundRatio(safeHeightRatio),
                leftRatio: roundRatio(clampNumber(Number.isFinite(leftRatioValue) ? leftRatioValue : fallbackWindow.leftRatio, 0, Math.max(0, 1 - safeWidthRatio))),
                topRatio: roundRatio(clampNumber(Number.isFinite(topRatioValue) ? topRatioValue : fallbackWindow.topRatio, 0, Math.max(0, 1 - safeHeightRatio)))
            },
            omrWidthRatio: roundRatio(Number.isFinite(omrWidthRatio) ? clampNumber(omrWidthRatio, 0.12, 0.7) : DEFAULT_POPUP_LAYOUT.omrWidthRatio)
        };
    }

    function normalizeToolUiConfig(raw) {
        return {
            bottomPaddingRatio: roundRatio(clampNumber(parseFloat(raw?.bottomPaddingRatio) || DEFAULT_TOOL_UI_CONFIG.bottomPaddingRatio, 0, 0.9)),
            sideButtonColumnRatio: roundRatio(clampNumber(parseFloat(raw?.sideButtonColumnRatio) || DEFAULT_TOOL_UI_CONFIG.sideButtonColumnRatio, 0.03, 0.24)),
            noteFontSize: clampNumber(parseInt(raw?.noteFontSize, 10) || DEFAULT_TOOL_UI_CONFIG.noteFontSize, 12, 22),
            canvasLineWidth: clampNumber(parseInt(raw?.canvasLineWidth, 10) || DEFAULT_TOOL_UI_CONFIG.canvasLineWidth, 2, 12)
        };
    }

    function normalizeAdvancedPlanType(value) {
        const trimmed = String(value || '').trim();
        if (trimmed === '2주 이용권') return '14일 이용권';
        return ADVANCED_SUBSCRIPTION_PLAN_OPTIONS.includes(trimmed) ? trimmed : DEFAULT_ADVANCED_PLAN_TYPE;
    }

    function normalizeAdvancedLoginId(value) {
        return String(value || '').trim();
    }

    function getAdvancedLoginIdKey(value) {
        return normalizeAdvancedLoginId(value).toLowerCase();
    }

    function normalizeAdvancedExpiresAt(value) {
        return String(value || '').trim();
    }

    function isPermanentAdvancedSubscription(planType, expiresAt) {
        return normalizeAdvancedPlanType(planType) === PERMANENT_ADVANCED_PLAN_TYPE || !normalizeAdvancedExpiresAt(expiresAt);
    }

    function normalizeAdvancedPersistenceFields(planType, expiresAt) {
        if (isPermanentAdvancedSubscription(planType, expiresAt)) {
            return {
                planType: PERMANENT_ADVANCED_PLAN_TYPE,
                expiresAt: ''
            };
        }
        return {
            planType: normalizeAdvancedPlanType(planType),
            expiresAt: normalizeAdvancedExpiresAt(expiresAt)
        };
    }

    function normalizeAdvancedSubscription(raw, index = 0) {
        const fallback = DEFAULT_ADVANCED_FEATURE_CONFIG.subscriptions[0];
        const status = ['active', 'paused', 'expired'].includes(raw?.status) ? raw.status : 'active';
        const persistence = normalizeAdvancedPersistenceFields(raw?.planType || raw?.planName || fallback.planType, raw?.expiresAt);
        return {
            id: String(raw?.id || `subscription-${index + 1}`),
            planType: persistence.planType,
            userIdentity: String(raw?.userIdentity || raw?.memberLabel || '').trim(),
            loginId: normalizeAdvancedLoginId(raw?.loginId || raw?.externalId || (raw?.id === 'seed-0208' ? 'seed-0208' : '')),
            status,
            passwordSalt: String(raw?.passwordSalt || '').trim(),
            passwordHash: String(raw?.passwordHash || '').trim().toLowerCase(),
            expiresAt: persistence.expiresAt,
            note: String(raw?.note || '').trim()
        };
    }

    function normalizeAdvancedFeatureConfig(raw) {
        const subscriptions = Array.isArray(raw?.subscriptions)
            ? raw.subscriptions.map((item, index) => normalizeAdvancedSubscription(item, index)).filter((item) => item.passwordSalt && item.passwordHash)
            : [];
        const legacySource = (Array.isArray(raw?.passwords)
            ? raw.passwords
            : String(raw?.passwords || '').split(/\r?\n|,/))
            .map((item) => String(item || '').trim())
            .filter(Boolean);
        const legacyPasswords = [];
        legacySource.forEach((item) => {
            if (!item || legacyPasswords.includes(item)) return;
            legacyPasswords.push(item);
        });
        if (Array.isArray(raw?.subscriptions) || subscriptions.length || legacyPasswords.length) {
            return {
                subscriptions,
                legacyPasswords
            };
        }
        return {
            subscriptions: DEFAULT_ADVANCED_FEATURE_CONFIG.subscriptions.map((item, index) => normalizeAdvancedSubscription(item, index)),
            legacyPasswords: []
        };
    }

    function normalizeManualSubscriptionConfig(raw) {
        const sourcePlans = Array.isArray(raw?.plans) ? raw.plans : DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.plans;
        const plans = sourcePlans
            .map((plan, index) => {
                const fallback = DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.plans[index] || DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.plans[0];
                const code = String(plan?.code || fallback.code || '').trim();
                const label = String(plan?.label || fallback.label || '').trim();
                const days = Math.max(1, parseInt(plan?.days, 10) || fallback.days || 7);
                const price = Math.max(1000, parseInt(plan?.price, 10) || fallback.price || 4900);
                return {
                    code,
                    label,
                    days,
                    price,
                    enabled: plan?.enabled !== false,
                    highlight: String(plan?.highlight || fallback.highlight || '').trim()
                };
            })
            .filter((plan) => plan.code && plan.label);
        return {
            enabled: raw?.enabled !== false,
            donationUrl: String(raw?.donationUrl || DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.donationUrl).trim(),
            supportEmail: String(raw?.supportEmail || DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.supportEmail).trim(),
            adminPublicKeyPem: String(raw?.adminPublicKeyPem || '').trim(),
            plans: plans.length ? plans : DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.plans.map((plan) => ({ ...plan }))
        };
    }

    function formatCurrency(value) {
        return `${Number(value || 0).toLocaleString('ko-KR')}원`;
    }

    function formatKstDateTime(timestamp) {
        if (!Number.isFinite(timestamp)) return '-';
        return new Date(timestamp).toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getTodayKstDateInputValue() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const kst = new Date(utc + (9 * 60 * 60000));
        return `${kst.getFullYear()}-${String(kst.getMonth() + 1).padStart(2, '0')}-${String(kst.getDate()).padStart(2, '0')}`;
    }

    function ensureManualSubscriptionStartDate() {
        if (manualSubscriptionStartDateInput && !manualSubscriptionStartDateInput.value) {
            manualSubscriptionStartDateInput.value = getTodayKstDateInputValue();
        }
    }

    function maskEmail(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed.includes('@')) return trimmed ? `${trimmed.slice(0, 2)}***` : '-';
        const [local, domain] = trimmed.split('@');
        return `${local.slice(0, 2)}***@${domain}`;
    }

    function maskText(value) {
        const trimmed = String(value || '').trim();
        if (!trimmed) return '-';
        if (trimmed.length <= 2) return `${trimmed[0]}*`;
        return `${trimmed.slice(0, 2)}***`;
    }

    function getManualSubscriptionPlanByCode(code) {
        return remoteManualSubscriptionConfig.plans.find((plan) => plan.code === code) || remoteManualSubscriptionConfig.plans[0] || DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.plans[0];
    }

    function saveRecentRequestInfo(info) {
        localStorage.setItem(MANUAL_SUBSCRIPTION_REQUEST_STORAGE_KEY, JSON.stringify(info));
    }

    function readRecentRequestInfo() {
        try {
            return JSON.parse(localStorage.getItem(MANUAL_SUBSCRIPTION_REQUEST_STORAGE_KEY) || 'null');
        } catch (error) {
            return null;
        }
    }

    let remotePopupLayout = normalizePopupLayout();
    let currentPopupLayout = normalizePopupLayout();
    let remoteToolUiConfig = normalizeToolUiConfig();
    let remoteAdvancedFeatureConfig = normalizeAdvancedFeatureConfig();
    let currentToolUiConfig = normalizeToolUiConfig(
        isAdminPreviewMode ? DEFAULT_TOOL_UI_CONFIG : (JSON.parse(localStorage.getItem('skct_tool_ui')) || DEFAULT_TOOL_UI_CONFIG)
    );

    function buildPopupWindowMetrics(windowConfig = currentPopupLayout.window) {
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

    function syncToolsBottomPadding() {
        const { availHeight } = getScreenMetrics();
        const basisHeight = availHeight || window.screen?.availHeight || window.outerHeight || window.innerHeight || 900;
        const paddingPx = Math.max(0, Math.round(basisHeight * currentToolUiConfig.bottomPaddingRatio));
        document.documentElement.style.setProperty('--tools-bottom-padding', `${paddingPx}px`);
        if (popupBottomPaddingRange) popupBottomPaddingRange.value = String(currentToolUiConfig.bottomPaddingRatio);
        if (popupBottomPaddingValue) popupBottomPaddingValue.textContent = `${(currentToolUiConfig.bottomPaddingRatio * 100).toFixed(1)}%`;
    }

    function syncToolsRightRail() {
        if (!isAdvancedMode) {
            document.documentElement.style.setProperty('--tools-right-rail-button-size', '0px');
            document.documentElement.style.setProperty('--tools-right-rail-reserve', '0px');
            if (popupSideColumnRange) popupSideColumnRange.value = String(currentToolUiConfig.sideButtonColumnRatio);
            if (popupSideColumnValue) popupSideColumnValue.textContent = `${(currentToolUiConfig.sideButtonColumnRatio * 100).toFixed(1)}%`;
            return;
        }
        const baseWidth = document.querySelector('.tools-layout')?.clientWidth || mainContentEl?.clientWidth || window.innerWidth || 360;
        const buttonPx = clampNumber(Math.round(baseWidth * currentToolUiConfig.sideButtonColumnRatio), 22, 78);
        document.documentElement.style.setProperty('--tools-right-rail-button-size', `${buttonPx}px`);
        document.documentElement.style.setProperty('--tools-right-rail-reserve', `${buttonPx + 14}px`);
        if (popupSideColumnRange) popupSideColumnRange.value = String(currentToolUiConfig.sideButtonColumnRatio);
        if (popupSideColumnValue) popupSideColumnValue.textContent = `${(currentToolUiConfig.sideButtonColumnRatio * 100).toFixed(1)}%`;
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

    function applyPopupOmrWidthRatio(widthRatio) {
        const safeRatio = roundRatio(clampNumber(parseFloat(widthRatio), 0.12, 0.7));
        currentPopupLayout.omrWidthRatio = Number.isFinite(safeRatio) ? safeRatio : 0.30;
        if (!appContainerEl) return;
        const maxWidth = Math.round(appContainerEl.clientWidth * 0.8);
        const nextWidth = clampNumber(Math.round(appContainerEl.clientWidth * currentPopupLayout.omrWidthRatio), 120, maxWidth);
        document.documentElement.style.setProperty('--omr-width', `${nextWidth}px`);
    }

    function readCurrentLayoutRatios() {
        const styles = getComputedStyle(document.documentElement);
        const timer = parseFloat(styles.getPropertyValue('--timer-ratio')) || DEFAULT_LAYOUT_RATIOS.timer;
        const utils = parseFloat(styles.getPropertyValue('--utils-ratio')) || DEFAULT_LAYOUT_RATIOS.utils;
        const calc = parseFloat(styles.getPropertyValue('--calc-ratio')) || DEFAULT_LAYOUT_RATIOS.calc;
        return {
            timer: roundRatio(timer),
            utils: roundRatio(utils),
            calc: roundRatio(calc)
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
            localStorage.setItem('skct_layout_ratios', JSON.stringify({ timer: tR, utils: uR, calc: cR }));
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
        document.documentElement.style.setProperty('--notepad-font-size', `${currentToolUiConfig.noteFontSize}px`);
        if (notepadEl) {
            notepadEl.style.fontSize = `${currentToolUiConfig.noteFontSize}px`;
        }
        if (noteFontSizeRange) noteFontSizeRange.value = String(currentToolUiConfig.noteFontSize);
        if (noteFontSizeValue) noteFontSizeValue.textContent = String(currentToolUiConfig.noteFontSize);
        if (canvasLineWidthRange) canvasLineWidthRange.value = String(currentToolUiConfig.canvasLineWidth);
        if (canvasLineWidthValue) canvasLineWidthValue.textContent = String(currentToolUiConfig.canvasLineWidth);
        syncToolsBottomPadding();
        syncToolsRightRail();

        if (persist) {
            localStorage.setItem('skct_tool_ui', JSON.stringify(currentToolUiConfig));
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
        const { popupLayout, layoutRatios } = payload;
        popupEditorMetricsEl.innerHTML = `
            <div>창 크기: ${(popupLayout.window.widthRatio * 100).toFixed(1)}% x ${(popupLayout.window.heightRatio * 100).toFixed(1)}%</div>
            <div>창 위치: 왼쪽 ${(popupLayout.window.leftRatio * 100).toFixed(1)}% / 위 ${(popupLayout.window.topRatio * 100).toFixed(1)}%</div>
            <div>OMR 폭: ${(popupLayout.omrWidthRatio * 100).toFixed(1)}%</div>
            <div>세로 비율: 타이머 ${layoutRatios.timer.toFixed(1)} / 메모 ${layoutRatios.utils.toFixed(1)} / 계산기 ${layoutRatios.calc.toFixed(1)}</div>
            <div>도구 기본값: 하단 여백 ${(payload.toolUiConfig.bottomPaddingRatio * 100).toFixed(1)}%, 우측 버튼 열 ${(payload.toolUiConfig.sideButtonColumnRatio * 100).toFixed(1)}%, 메모 ${payload.toolUiConfig.noteFontSize}px, 그림판 ${payload.toolUiConfig.canvasLineWidth}px</div>
        `;
    }

    function postPopupEditorMessage(type, payload) {
        if (!isPopupEditorMode || !window.opener || window.opener.closed) {
            return false;
        }
        window.opener.postMessage({ type, payload }, window.location.origin);
        return true;
    }

    function syncPopupEditorSnapshot(force = false) {
        if (!isPopupEditorMode) return;
        renderPopupEditorMetrics();
        const payload = capturePopupEditorPayload();
        const signature = JSON.stringify(payload);
        if (!force && signature === lastPopupEditorSignature) {
            return;
        }
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
    const savedOmrWidth = !isPopupMode ? localStorage.getItem('skct_omr_width') : null;
    if (savedOmrWidth) {
        document.documentElement.style.setProperty('--omr-width', `${savedOmrWidth}px`);
    }

    // Layout Ratios Settings
    const savedRatios = (!isAdminPreviewMode && !isPopupMode)
        ? (JSON.parse(localStorage.getItem('skct_layout_ratios')) || DEFAULT_LAYOUT_RATIOS)
        : DEFAULT_LAYOUT_RATIOS;
    const savedToolUiConfig = (!isAdminPreviewMode && !isPopupMode)
        ? (JSON.parse(localStorage.getItem('skct_tool_ui')) || DEFAULT_TOOL_UI_CONFIG)
        : DEFAULT_TOOL_UI_CONFIG;
    setLayoutRatios(savedRatios.timer, savedRatios.utils, savedRatios.calc, {
        persist: false,
        syncInputs: true,
        notifyPopupEditor: false
    });
    applyToolUiConfig(savedToolUiConfig, {
        persist: false,
        notifyPopupEditor: false
    });

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

    if (popupSideColumnRange) {
        popupSideColumnRange.addEventListener('input', () => {
            applyToolUiConfig({ sideButtonColumnRatio: popupSideColumnRange.value }, { persist: false, notifyPopupEditor: true });
        });
    }

    if (isPopupEditorMode) {
        popupEditorPanelEl?.classList.remove('hidden');
        topBarResizerEl?.classList.remove('hidden');
        toolsSectionResizerEl?.classList.remove('hidden');
        setPopupEditorCollapsed(true);
        setPopupEditorStatus('창 위치, 크기, 세로 비율, 하단 여백을 조절한 뒤 저장하세요.');

        popupEditorToggleBtn?.addEventListener('click', () => {
            setPopupEditorCollapsed(!popupEditorPanelEl.classList.contains('collapsed'));
        });

        popupEditorReloadBtn?.addEventListener('click', () => {
            currentPopupLayout = normalizePopupLayout(remotePopupLayout);
            applyPopupWindowToCurrentWindow(currentPopupLayout.window);
            applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
            applyToolUiConfig(remoteToolUiConfig, { persist: false, notifyPopupEditor: false });
            syncPopupEditorSnapshot(true);
            setPopupEditorStatus('서버에 저장된 기본값을 다시 적용했습니다.');
        });

        popupEditorSaveBtn?.addEventListener('click', () => {
            const payload = capturePopupEditorPayload();
            const posted = postPopupEditorMessage(POPUP_EDITOR_MESSAGE_TYPES.saveRequest, payload);
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
                currentPopupLayout = normalizePopupLayout(remotePopupLayout);
                setLayoutRatios(
                    message.payload?.layoutRatios?.timer,
                    message.payload?.layoutRatios?.utils,
                    message.payload?.layoutRatios?.calc,
                    { persist: false, notifyPopupEditor: false }
                );
                remoteToolUiConfig = normalizeToolUiConfig(message.payload?.toolUiConfig);
                applyToolUiConfig(remoteToolUiConfig, { persist: false, notifyPopupEditor: false });
                applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
                renderPopupEditorMetrics();
                setPopupEditorStatus('서버 기본값 저장이 완료되었습니다.', 'success');
            } else {
                setPopupEditorStatus(message.error || '저장 중 오류가 발생했습니다.', 'error');
            }
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
        buttonUrl: "https://toon.at/donate/foreveryonehappy",
        sponsorTickerSeconds: 4
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

    function renderManualSubscriptionPlans() {
        if (manualSubscriptionPlanCards) {
            manualSubscriptionPlanCards.innerHTML = remoteManualSubscriptionConfig.plans
                .filter((plan) => plan.enabled)
                .map((plan) => `
                    <div style="padding:12px; border-radius:8px; background:#ffffff; border:1px solid #fdba74;">
                        <div style="font-size:12px; color:#9a3412; font-weight:700;">${escapeHtml(plan.label)}</div>
                        <div style="font-size:20px; font-weight:800; color:#7c2d12; margin-top:4px;">${formatCurrency(plan.price)}</div>
                        <div style="font-size:11px; color:#9a3412; line-height:1.6; margin-top:6px;">${escapeHtml(plan.highlight || `${plan.days}일 사용`)}</div>
                    </div>
                `)
                .join('');
        }
        if (manualSubscriptionPlanSelect) {
            const currentValue = manualSubscriptionPlanSelect.value;
            manualSubscriptionPlanSelect.innerHTML = remoteManualSubscriptionConfig.plans
                .filter((plan) => plan.enabled)
                .map((plan) => `<option value="${escapeHtml(plan.code)}">${escapeHtml(plan.label)} · ${formatCurrency(plan.price)}</option>`)
                .join('');
            if (currentValue && Array.from(manualSubscriptionPlanSelect.options).some((option) => option.value === currentValue)) {
                manualSubscriptionPlanSelect.value = currentValue;
            }
        }
        if (manualSubscriptionDonateLink) {
            manualSubscriptionDonateLink.href = remoteManualSubscriptionConfig.donationUrl || DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.donationUrl;
        }
        if (advancedFeatureDonateLink) {
            advancedFeatureDonateLink.href = remoteManualSubscriptionConfig.donationUrl || DEFAULT_MANUAL_SUBSCRIPTION_CONFIG.donationUrl;
        }
    }

    function applyManualSubscriptionConfig(config) {
        remoteManualSubscriptionConfig = normalizeManualSubscriptionConfig(config);
        renderManualSubscriptionPlans();
        ensureManualSubscriptionStartDate();
    }
    window.applyManualSubscriptionConfig = applyManualSubscriptionConfig;
    applyManualSubscriptionConfig();

    function renderManualRequestLookup(record, payload) {
        if (!manualSubscriptionLookupResult) return;
        const statusMap = {
            pending: '승인 대기',
            approved: '승인 완료',
            rejected: '반려',
            fulfilled: '발급 완료'
        };
        const response = payload?.adminResponse || {};
        manualSubscriptionLookupResult.innerHTML = `
            <div style="padding:12px; border-radius:8px; background:#ffffff; border:1px solid #bfdbfe;">
                <div style="font-weight:800; color:#1d4ed8; margin-bottom:8px;">${escapeHtml(statusMap[record.status] || record.status || '대기')}</div>
                <div style="font-size:12px; color:#334155; line-height:1.75;">
                    <div><strong>신청 플랜</strong>: ${escapeHtml(record.planLabel || '-')}</div>
                    <div><strong>신청 시각</strong>: ${escapeHtml(formatKstDateTime(record.createdAt))}</div>
                    <div><strong>후원 닉네임</strong>: ${escapeHtml(payload?.donationName || '-')}</div>
                    <div><strong>이용 시작일</strong>: ${escapeHtml(payload?.requestedStartDate || '-')}</div>
                    <div><strong>표시 닉네임</strong>: ${escapeHtml(payload?.siteNickname || '-')}</div>
                    <div><strong>이메일</strong>: ${escapeHtml(payload?.email || '-')}</div>
                    <div><strong>희망 ID</strong>: ${escapeHtml(payload?.desiredLoginId || '-')}</div>
                    ${payload?.memo ? `<div><strong>신청 메모</strong>: ${escapeHtml(payload.memo)}</div>` : ''}
                    ${response.statusMessage ? `<div><strong>처리 메모</strong>: ${escapeHtml(response.statusMessage)}</div>` : ''}
                    ${response.issuedLoginId ? `<div style="margin-top:8px; padding:10px; border-radius:8px; background:#eff6ff; border:1px solid #bfdbfe;"><strong>발급 ID</strong>: ${escapeHtml(response.issuedLoginId)}<br><strong>발급 비밀번호</strong>: ${escapeHtml(response.issuedPassword || '-')}<br><strong>사용 종료일</strong>: ${escapeHtml(response.expiresAt || '-')}</div>` : ''}
                </div>
            </div>
        `;
    }

    const isLegacyDefaultTimerConfig = (cfg) => {
        if (!cfg || typeof cfg !== 'object') return false;
        const total = sanitizeMinutes(cfg.total, -1);
        const subj = sanitizeMinutes(cfg.subj, -1);
        const brk = sanitizeMinutes(cfg.brk, -1);
        return total === 79 && subj === 15 && brk === 1 && cfg.source !== 'user';
    };

    const ADVANCED_TRIGGER_TAP_COUNT = 7;
    const ADVANCED_TRIGGER_TIMEOUT_MS = 1800;
    const ADVANCED_POPUP_PATH = 'advanced-tools.html';

    const buildAdvancedLaunchUrl = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('advanced', '1');
        url.searchParams.delete('popupEditor');
        return url.toString();
    };

    const activateAdvancedSession = () => {
        localStorage.setItem(ADVANCED_UNLOCK_STORAGE_KEY, JSON.stringify({
            issuedAt: Date.now(),
            expiresAt: Date.now() + ADVANCED_UNLOCK_DURATION_MS
        }));
        return {
            targetUrl: buildAdvancedLaunchUrl(),
            popupName: 'skct_popup_mode'
        };
    };

    const getSubscriptionExpiryTime = (value) => {
        const trimmed = String(value || '').trim();
        if (!trimmed) return Number.POSITIVE_INFINITY;
        const parsed = Date.parse(`${trimmed}T12:00:00+09:00`);
        return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
    };

    const isActiveAdvancedSubscription = (subscription) => {
        if (!subscription) return false;
        if (subscription.status !== 'active') return false;
        return getSubscriptionExpiryTime(subscription.expiresAt) >= Date.now();
    };

    const hashAdvancedPassword = async (password, salt) => {
        const encoder = new TextEncoder();
        const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${salt}::${password}`));
        return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    };

    const validateAdvancedCredentialsDetailed = async (loginId, password) => {
        const normalizedLoginId = getAdvancedLoginIdKey(loginId);
        const value = String(password || '').trim();
        if (!normalizedLoginId && !value) return { ok: false, reason: 'empty' };
        if (!value) return { ok: false, reason: normalizedLoginId ? 'empty_password' : 'empty' };
        if (!normalizedLoginId && remoteAdvancedFeatureConfig.legacyPasswords.includes(value)) {
            return { ok: true, reason: 'active' };
        }
        const candidateSubscriptions = normalizedLoginId
            ? remoteAdvancedFeatureConfig.subscriptions.filter((subscription) => getAdvancedLoginIdKey(subscription.loginId) === normalizedLoginId)
            : remoteAdvancedFeatureConfig.subscriptions.filter((subscription) => !getAdvancedLoginIdKey(subscription.loginId));
        let matchedInactiveSubscription = false;
        for (const subscription of candidateSubscriptions) {
            const digest = await hashAdvancedPassword(value, subscription.passwordSalt);
            if (digest !== subscription.passwordHash) continue;
            if (isActiveAdvancedSubscription(subscription)) {
                return { ok: true, reason: 'active' };
            }
            matchedInactiveSubscription = true;
        }
        if (normalizedLoginId && !candidateSubscriptions.length) {
            return { ok: false, reason: 'invalid_id' };
        }
        return { ok: false, reason: matchedInactiveSubscription ? 'expired' : 'invalid' };
    };

    const validateAdvancedCredentials = async (loginId, password) => {
        const result = await validateAdvancedCredentialsDetailed(loginId, password);
        return result.ok;
    };

    const validateAdvancedPasswordDetailed = async (password) => {
        return validateAdvancedCredentialsDetailed('', password);
    };

    const validateAdvancedPassword = async (password) => {
        const result = await validateAdvancedPasswordDetailed(password);
        return result.ok;
    };

    const updateAdvancedAccessPanel = () => {
        if (!advancedAccessSummary) return;
        const activeCount = remoteAdvancedFeatureConfig.legacyPasswords.length
            + remoteAdvancedFeatureConfig.subscriptions.filter(isActiveAdvancedSubscription).length;
        const unlockRemainingMs = getAdvancedUnlockRemainingMs();
        const cooldownRemainingMs = getAdvancedCooldownRemainingMs();
        if (!isAdvancedConfigReady) {
            advancedAccessSummary.textContent = '고급 구독 정보를 불러오는 중입니다.';
            if (advancedAccessSubmitBtn) advancedAccessSubmitBtn.disabled = true;
            if (advancedAccessReuseBtn) advancedAccessReuseBtn.disabled = !hasAdvancedUnlock();
            return;
        }
        if (cooldownRemainingMs > 0) {
            advancedAccessSummary.textContent = `ID 또는 비밀번호를 여러 번 틀려 ${Math.ceil(cooldownRemainingMs / 1000)}초 동안 다시 시도할 수 없습니다.`;
        } else if (unlockRemainingMs > 0) {
            advancedAccessSummary.textContent = `이 브라우저는 이미 인증되어 있습니다. 약 ${Math.max(1, Math.ceil(unlockRemainingMs / 60000))}분 동안 바로 고급 모드를 열 수 있습니다.`;
        } else if (activeCount > 0) {
            advancedAccessSummary.textContent = `현재 사용 가능한 고급 이용권 ${activeCount}건을 확인했습니다. 관리자에게 받은 ID와 비밀번호를 입력하면 바로 고급 팝업이 열립니다.`;
        } else {
            advancedAccessSummary.textContent = '현재 사용 가능한 고급 이용권이 없습니다. 관리자 페이지의 고급 구독 관리 표를 먼저 확인하세요.';
        }
        if (advancedAccessSubmitBtn) advancedAccessSubmitBtn.disabled = activeCount === 0 || cooldownRemainingMs > 0;
        if (advancedAccessReuseBtn) advancedAccessReuseBtn.disabled = unlockRemainingMs <= 0;
    };

    const submitManualSubscriptionRequest = async () => {
        if (!manualSubscriptionSubmitStatus) return;
        manualSubscriptionSubmitStatus.style.color = '#64748b';
        if (!remoteManualSubscriptionConfig.enabled) {
            manualSubscriptionSubmitStatus.textContent = '현재 수동 이용권 신청이 닫혀 있습니다.';
            return;
        }
        if (!remoteManualSubscriptionConfig.adminPublicKeyPem) {
            manualSubscriptionSubmitStatus.textContent = '운영 설정이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.';
            return;
        }
        const plan = getManualSubscriptionPlanByCode(manualSubscriptionPlanSelect?.value);
        const donationName = manualSubscriptionDonationNameInput?.value.trim() || '';
        const siteNickname = manualSubscriptionNicknameInput?.value.trim() || '';
        const email = manualSubscriptionEmailInput?.value.trim() || '';
        const desiredLoginId = manualSubscriptionDesiredIdInput?.value.trim() || '';
        const requestedStartDate = manualSubscriptionStartDateInput?.value || '';
        const memo = manualSubscriptionMemoInput?.value.trim() || '';
        const requestPassword = manualSubscriptionPasswordInput?.value || '';
        const requestPasswordConfirm = manualSubscriptionPasswordConfirmInput?.value || '';

        if (!plan?.code) {
            manualSubscriptionSubmitStatus.textContent = '신청 가능한 이용권이 아직 열리지 않았습니다.';
            return;
        }
        if (!donationName || !siteNickname || !email || !desiredLoginId || !requestedStartDate || !requestPassword || !requestPasswordConfirm) {
            manualSubscriptionSubmitStatus.textContent = '투네이션 이름, 이용 시작일, 닉네임, 이메일, ID, 조회 비밀번호를 모두 입력해주세요.';
            return;
        }
        if (!email.includes('@')) {
            manualSubscriptionSubmitStatus.textContent = '이메일 형식이 올바르지 않습니다.';
            return;
        }
        if (requestPassword.length < 6) {
            manualSubscriptionSubmitStatus.textContent = '조회 비밀번호는 6자 이상으로 설정해주세요.';
            return;
        }
        if (requestPassword !== requestPasswordConfirm) {
            manualSubscriptionSubmitStatus.textContent = '조회 비밀번호 확인이 일치하지 않습니다.';
            return;
        }
        try {
            const requestId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            const encrypted = await window.SKCTSubscriptionCrypto.encryptRequestPayload({
                donationName,
                requestedStartDate,
                siteNickname,
                email,
                desiredLoginId,
                memo,
                createdAt: Date.now(),
                adminResponse: null
            }, requestPassword, remoteManualSubscriptionConfig.adminPublicKeyPem);
            const record = {
                requestId,
                status: 'pending',
                planCode: plan.code,
                planLabel: plan.label,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                requesterMask: maskText(siteNickname),
                emailMask: maskEmail(email),
                donationMask: maskText(donationName),
                ...encrypted
            };
            const writeResponse = await fetch(`${FIREBASE_RTDB_BASE_URL}/subscriptionRequests/${encodeURIComponent(requestId)}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(record)
            });
            if (!writeResponse.ok) {
                throw new Error('신청서 저장 중 오류가 발생했습니다.');
            }
            saveRecentRequestInfo({ requestId, createdAt: Date.now() });
            if (manualSubscriptionLookupIdInput) manualSubscriptionLookupIdInput.value = requestId;
            if (manualSubscriptionLookupPasswordInput) manualSubscriptionLookupPasswordInput.value = requestPassword;
            manualSubscriptionSubmitStatus.style.color = '#0f766e';
            manualSubscriptionSubmitStatus.innerHTML = `비밀글 신청이 저장되었습니다. <strong>신청번호 ${escapeHtml(requestId)}</strong> 와 조회 비밀번호를 꼭 보관해주세요. 아래 조회 영역에서 같은 값으로 상태를 다시 확인할 수 있습니다.`;
            if (manualSubscriptionMemoInput) manualSubscriptionMemoInput.value = '';
        } catch (error) {
            manualSubscriptionSubmitStatus.style.color = '#b91c1c';
            manualSubscriptionSubmitStatus.textContent = error.message || '신청 저장 중 오류가 발생했습니다.';
        }
    };

    const lookupManualSubscriptionRequest = async () => {
        if (!manualSubscriptionLookupResult) return;
        const requestId = manualSubscriptionLookupIdInput?.value.trim() || '';
        const requestPassword = manualSubscriptionLookupPasswordInput?.value || '';
        if (!requestId || !requestPassword) {
            manualSubscriptionLookupResult.textContent = '신청번호와 조회 비밀번호를 모두 입력해주세요.';
            return;
        }
        const response = await fetch(`${FIREBASE_RTDB_BASE_URL}/subscriptionRequests/${encodeURIComponent(requestId)}.json`);
        if (!response.ok) {
            manualSubscriptionLookupResult.textContent = '신청 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            return;
        }
        const record = await response.json();
        if (!record) {
            manualSubscriptionLookupResult.textContent = '해당 신청번호를 찾지 못했습니다. 오타가 없는지 다시 확인해주세요.';
            return;
        }
        try {
            const payload = await window.SKCTSubscriptionCrypto.decryptRequestPayloadForUser(record, requestPassword);
            renderManualRequestLookup(record, payload);
        } catch (error) {
            manualSubscriptionLookupResult.textContent = '조회 비밀번호가 일치하지 않거나 요청을 복호화하지 못했습니다.';
        }
    };

    const openAdvancedModeWindow = () => {
        const launch = activateAdvancedSession();
        updateAdvancedAccessPanel();
        if (isPopupMode) {
            window.name = launch.popupName;
            window.location.assign(launch.targetUrl);
            return true;
        }
        const { width, height, left, top } = buildPopupWindowMetrics(remotePopupLayout.window);
        const popup = window.open(
            launch.targetUrl,
            launch.popupName,
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
        );
        if (popup) {
            popup.focus();
            return true;
        }
        window.location.assign(launch.targetUrl);
        return false;
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
    let isPracticeMode = localStorage.getItem('skct_practice_mode') === 'true';
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
        if (newWidth < 120) newWidth = 120; // 팝업에서도 5지선다가 보이도록 최소폭 재조정
        if (newWidth > document.body.clientWidth * 0.8) newWidth = document.body.clientWidth * 0.8; // 최대폭
        document.documentElement.style.setProperty('--omr-width', `${newWidth}px`);
        if (isPopupMode && appContainerEl) {
            currentPopupLayout.omrWidthRatio = roundRatio(clampNumber(newWidth / appContainerEl.clientWidth, 0.12, 0.7));
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
                localStorage.setItem('skct_omr_width', currentWidth);
            } else if (appContainerEl) {
                currentPopupLayout.omrWidthRatio = roundRatio(clampNumber(parseFloat(currentWidth) / appContainerEl.clientWidth, 0.12, 0.7));
                schedulePopupEditorSync();
            }
            resizeCanvas(); // OMR 너비 변동으로 캔버스 폭 변경 대응
        }
    });

    if (isPopupEditorMode && topBarResizerEl && toolsSectionResizerEl && topBarEl && utilitySectionEl && calculatorSectionEl) {
        const MIN_TIMER_HEIGHT = 0;
        const MIN_UTILITY_HEIGHT = 0;
        const MIN_CALC_HEIGHT = 0;

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
        topBarResizerEl.addEventListener('mousedown', (event) => {
            event.preventDefault();
            topBarResizeSession = {
                startY: event.clientY,
                heights: readSectionHeights()
            };
            topBarResizerEl.classList.add('active');
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        });

        let toolsResizeSession = null;
        toolsSectionResizerEl.addEventListener('mousedown', (event) => {
            event.preventDefault();
            toolsResizeSession = {
                startY: event.clientY,
                heights: readSectionHeights()
            };
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

    const clearQuestionTools = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        notepad.value = '';
        resetCalculator();
    };

    const recordCurrentQuestionTiming = (isSkip = false) => {
        const qKey = getCurrentQKey();
        if (!qKey) {
            questionSpentSec = 0;
            return;
        }
        if (!questionTimings[qKey]) {
            questionTimings[qKey] = { spent: 0, state: isSkip ? 'skipped' : 'answered' };
        }
        if (questionSpentSec > 0) {
            questionTimings[qKey].spent += questionSpentSec;
        }
        questionTimings[qKey].state = isSkip ? 'skipped' : 'answered';
        questionSpentSec = 0;
    };

    const advanceQuestion = (isSkip = false) => {
        recordCurrentQuestionTiming(isSkip);
        clearQuestionTools();
        if (omrState.mode === 'answer') {
            const maxQ = subjects.reduce((sum, s) => sum + s.count, 0);
            if (omrState.currentGlobalIndex < maxQ - 1) {
                omrState.currentGlobalIndex++;
            }
            renderOMR();
        }
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

    const isAnswerEditableIndex = (questionIndex, subjectLocked) => {
        if (subjectLocked) return false;
        if (isPracticeMode) return true;
        return questionIndex <= omrState.currentGlobalIndex;
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
                    if (omrState.mode === 'answer' && !isAnswerEditableIndex(currentIdx, isSubjLocked)) {
                        disabledAttr = 'disabled';
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
                            advanceQuestion(false);
                        } else if (gIdx === omrState.currentGlobalIndex) {
                            advanceQuestion(false);
                        } else {
                            renderOMR();
                        }
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
    const omrModeHint = document.getElementById('omrModeHint');
    const bulkCorrectImportBtn = document.getElementById('bulkCorrectImportBtn');

    const updateModeUI = () => {
        if (omrState.mode === 'answer') {
            modeToggleBtn.textContent = '📝 정답 입력 모드로 전환';
            modeToggleBtn.classList.remove('active-score');
            if (omrModeLabel) {
                omrModeLabel.textContent = '📝 답안 작성 중';
                omrModeLabel.style.color = '';
            }
            if (omrModeHint) {
                omrModeHint.classList.add('hidden');
                omrModeHint.textContent = '';
            }
        } else {
            modeToggleBtn.textContent = '✏️ 답안 작성 모드로 돌아가기';
            modeToggleBtn.classList.add('active-score');
            if (omrModeLabel) omrModeLabel.textContent = '✅ 정답 입력 중';
            if (omrModeLabel) omrModeLabel.style.color = '#4ade80';
            if (omrModeHint) {
                omrModeHint.textContent = '미응답(건너뛴) 문제도 번호를 바로 클릭해 정답을 입력할 수 있습니다.';
                omrModeHint.classList.remove('hidden');
            }
        }
        if (bulkCorrectImportBtn) {
            bulkCorrectImportBtn.classList.toggle('hidden', !(isAdvancedMode && omrState.mode === 'score'));
        }
        if (omrState.mode !== 'score' && bulkCorrectImportModal) {
            bulkCorrectImportModal.classList.add('hidden');
        }
    };

    const stopTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerIsRunning = false;
        syncTimerPlayButtonLabel(false);
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

    const detailScoreBtn = document.getElementById('detailScoreBtn');
    const bulkCorrectImportModal = document.getElementById('bulkCorrectImportModal');
    const bulkCorrectImportInput = document.getElementById('bulkCorrectImportInput');
    const bulkCorrectImportParseBtn = document.getElementById('bulkCorrectImportParseBtn');
    const bulkCorrectQuestionCol = document.getElementById('bulkCorrectQuestionCol');
    const bulkCorrectAnswerCol = document.getElementById('bulkCorrectAnswerCol');
    const bulkCorrectImportSummary = document.getElementById('bulkCorrectImportSummary');
    const bulkCorrectImportPreview = document.getElementById('bulkCorrectImportPreview');
    const bulkCorrectImportStatus = document.getElementById('bulkCorrectImportStatus');
    const bulkCorrectImportApplyBtn = document.getElementById('bulkCorrectImportApplyBtn');
    let bulkCorrectImportState = { parsed: null, preview: null };
    const formatRateText = (value) => `${(Math.round((Number(value) || 0) * 10) / 10).toFixed(1).replace(/\.0$/, '')}%`;

    const getTotalQuestionCount = () => subjects.reduce((sum, subj) => sum + subj.count, 0);

    const tokenizeBulkImportLine = (line) => {
        const cleaned = String(line || '')
            .replace(/[{}]/g, ' ')
            .replace(/[“”"]/g, '')
            .trim();
        if (!cleaned) return [];
        let parts = [];
        if (cleaned.includes('\t')) {
            parts = cleaned.split(/\t+/);
        } else if (cleaned.includes('|')) {
            parts = cleaned.split(/\s*\|\s*/);
        } else if (cleaned.includes(',')) {
            parts = cleaned.split(/\s*,\s*/);
        } else if (/\s{2,}/.test(cleaned)) {
            parts = cleaned.split(/\s{2,}/);
        } else {
            parts = cleaned.split(/\s+/);
        }
        return parts.map((part) => part.trim()).filter(Boolean);
    };

    const normalizeBulkHeaderToken = (value) => String(value || '').replace(/[.\-_:]/g, '').trim().toLowerCase();

    const isLikelyBulkHeaderRow = (cells) => {
        const joined = cells.map(normalizeBulkHeaderToken).join(' ');
        if (!joined) return false;
        return /(no|번호|문항|정답|입력답|정오|정답률|correct|answer|result|rate|user)/i.test(joined);
    };

    const deriveBulkColumnLabels = (headerRows, maxCols) => {
        const labels = [];
        for (let col = 0; col < maxCols; col++) {
            const counts = new Map();
            headerRows.forEach((row) => {
                const value = String(row[col] || '').trim();
                if (!value) return;
                counts.set(value, (counts.get(value) || 0) + 1);
            });
            const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
            labels.push(top ? top[0] : `열 ${col + 1}`);
        }
        return labels;
    };

    const parseBulkQuestionNumber = (value) => {
        const match = String(value || '').match(/\d+/);
        if (!match) return null;
        const num = parseInt(match[0], 10);
        return Number.isInteger(num) ? num : null;
    };

    const parseBulkChoice = (value) => {
        const trimmed = String(value || '').trim();
        if (!trimmed) return null;
        const circledMap = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };
        if (circledMap[trimmed]) return circledMap[trimmed];
        const match = trimmed.match(/[1-5]/);
        if (!match) return null;
        const num = parseInt(match[0], 10);
        return num >= 1 && num <= 5 ? num : null;
    };

    const parseBulkCorrectImportText = (text) => {
        const lines = String(text || '').split(/\r?\n/);
        const rows = [];
        const headerRows = [];
        let currentHeader = [];
        lines.forEach((line, lineIndex) => {
            const cells = tokenizeBulkImportLine(line);
            if (!cells.length) return;
            if (isLikelyBulkHeaderRow(cells)) {
                currentHeader = cells.slice();
                headerRows.push(cells.slice());
                return;
            }
            if (!cells.some((cell) => /\d|①|②|③|④|⑤/.test(cell))) return;
            rows.push({
                lineNumber: lineIndex + 1,
                cells,
                header: currentHeader.slice()
            });
        });
        const maxCols = Math.max(
            rows.reduce((max, row) => Math.max(max, row.cells.length), 0),
            headerRows.reduce((max, row) => Math.max(max, row.length), 0)
        );
        return {
            rows,
            headerRows,
            columnLabels: deriveBulkColumnLabels(headerRows, maxCols),
            maxCols
        };
    };

    const detectBulkQuestionColumn = (parsed) => {
        let bestIndex = 0;
        let bestScore = Number.NEGATIVE_INFINITY;
        const totalQuestions = getTotalQuestionCount();
        for (let col = 0; col < parsed.maxCols; col++) {
            const label = normalizeBulkHeaderToken(parsed.columnLabels[col]);
            let score = 0;
            if (/(^no$|^no\.?$|번호|문항|num|number)/i.test(label)) score += 50;
            let lastNum = null;
            parsed.rows.forEach((row) => {
                const num = parseBulkQuestionNumber(row.cells[col]);
                if (num == null) return;
                if (num >= 1 && num <= totalQuestions) score += 3;
                if (lastNum != null && num === lastNum + 1) score += 1;
                lastNum = num;
            });
            if (score > bestScore) {
                bestScore = score;
                bestIndex = col;
            }
        }
        return bestIndex;
    };

    const detectBulkAnswerColumn = (parsed, questionCol) => {
        let bestIndex = Math.min(1, Math.max(0, parsed.maxCols - 1));
        let bestScore = Number.NEGATIVE_INFINITY;
        for (let col = 0; col < parsed.maxCols; col++) {
            if (col === questionCol) continue;
            const label = normalizeBulkHeaderToken(parsed.columnLabels[col]);
            let score = 0;
            if (/정답|correct/.test(label)) score += 80;
            if (/입력답|user|my|응답/.test(label)) score -= 50;
            parsed.rows.forEach((row) => {
                if (parseBulkChoice(row.cells[col]) != null) score += 2;
            });
            if (score > bestScore) {
                bestScore = score;
                bestIndex = col;
            }
        }
        return bestIndex;
    };

    const renderBulkColumnOptions = (parsed, selectedQuestionCol, selectedAnswerCol) => {
        if (!bulkCorrectQuestionCol || !bulkCorrectAnswerCol) return;
        const optionsHtml = Array.from({ length: parsed.maxCols }, (_, index) => {
            const label = escapeHtml(parsed.columnLabels[index] || `열 ${index + 1}`);
            return `<option value="${index}">${label} (${index + 1})</option>`;
        }).join('');
        bulkCorrectQuestionCol.innerHTML = optionsHtml;
        bulkCorrectAnswerCol.innerHTML = optionsHtml;
        bulkCorrectQuestionCol.value = String(selectedQuestionCol);
        bulkCorrectAnswerCol.value = String(selectedAnswerCol);
    };

    const buildBulkCorrectPreview = (parsed, questionCol, answerCol) => {
        const mapped = new Map();
        let invalidRowCount = 0;
        let duplicateCount = 0;
        parsed.rows.forEach((row) => {
            const questionNo = parseBulkQuestionNumber(row.cells[questionCol]);
            const answer = parseBulkChoice(row.cells[answerCol]);
            if (questionNo == null || answer == null) {
                invalidRowCount++;
                return;
            }
            if (mapped.has(questionNo)) duplicateCount++;
            mapped.set(questionNo, {
                questionNo,
                answer,
                rawQuestion: row.cells[questionCol] || '',
                rawAnswer: row.cells[answerCol] || ''
            });
        });
        return {
            mappedRows: [...mapped.values()].sort((a, b) => a.questionNo - b.questionNo),
            invalidRowCount,
            duplicateCount
        };
    };

    const renderBulkCorrectPreview = () => {
        const parsed = bulkCorrectImportState.parsed;
        if (!parsed || !parsed.rows.length || parsed.maxCols === 0) {
            bulkCorrectImportState.preview = null;
            if (bulkCorrectImportSummary) bulkCorrectImportSummary.textContent = '붙여넣은 데이터에서 표 형태를 찾지 못했습니다.';
            if (bulkCorrectImportPreview) bulkCorrectImportPreview.textContent = 'NO./정답 같은 헤더가 있거나, 문항 번호와 정답이 포함된 줄 단위 데이터여야 합니다.';
            if (bulkCorrectImportApplyBtn) bulkCorrectImportApplyBtn.disabled = true;
            return;
        }
        const questionCol = Number(bulkCorrectQuestionCol?.value ?? 0);
        const answerCol = Number(bulkCorrectAnswerCol?.value ?? 1);
        const preview = buildBulkCorrectPreview(parsed, questionCol, answerCol);
        bulkCorrectImportState.preview = preview;
        if (bulkCorrectImportSummary) {
            bulkCorrectImportSummary.textContent = `데이터 줄 ${parsed.rows.length}개 중 ${preview.mappedRows.length}문항을 정답으로 읽었습니다.`;
        }
        if (bulkCorrectImportStatus) {
            const notes = [];
            if (preview.invalidRowCount > 0) notes.push(`무시된 줄 ${preview.invalidRowCount}개`);
            if (preview.duplicateCount > 0) notes.push(`중복 문항 ${preview.duplicateCount}개(마지막 값 사용)`);
            bulkCorrectImportStatus.textContent = notes.length ? notes.join(' · ') : '이 설정으로 바로 반영할 수 있습니다.';
        }
        if (bulkCorrectImportApplyBtn) {
            bulkCorrectImportApplyBtn.disabled = preview.mappedRows.length === 0;
        }
        if (bulkCorrectImportPreview) {
            if (!preview.mappedRows.length) {
                bulkCorrectImportPreview.textContent = '현재 선택한 열 조합으로는 반영할 정답을 찾지 못했습니다.';
            } else {
                const rowsHtml = preview.mappedRows.slice(0, 12).map((item) => `
                    <tr>
                        <td>${item.questionNo}</td>
                        <td>${item.answer}</td>
                        <td>${escapeHtml(item.rawQuestion)}</td>
                        <td>${escapeHtml(item.rawAnswer)}</td>
                    </tr>
                `).join('');
                const moreHtml = preview.mappedRows.length > 12
                    ? `<div style="margin-top:8px; color:#64748b;">그 외 ${preview.mappedRows.length - 12}문항도 함께 반영됩니다.</div>`
                    : '';
                bulkCorrectImportPreview.innerHTML = `
                    <div><strong>미리보기</strong> · 문항 번호와 정답이 이렇게 들어갑니다.</div>
                    <table>
                        <thead>
                            <tr>
                                <th>문항</th>
                                <th>정답</th>
                                <th>문항 원본</th>
                                <th>정답 원본</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                    ${moreHtml}
                `;
            }
        }
    };

    const openBulkCorrectImportModal = () => {
        if (!isAdvancedMode || omrState.mode !== 'score' || !bulkCorrectImportModal) return;
        bulkCorrectImportModal.classList.remove('hidden');
        if (bulkCorrectImportInput?.value.trim()) {
            bulkCorrectImportParseBtn?.click();
        } else if (bulkCorrectImportStatus) {
            bulkCorrectImportStatus.textContent = '정오표 표를 붙여넣고 분석 버튼을 눌러주세요.';
        }
    };

    const parseBulkCorrectImport = () => {
        const parsed = parseBulkCorrectImportText(bulkCorrectImportInput?.value || '');
        bulkCorrectImportState.parsed = parsed;
        if (!parsed.rows.length || parsed.maxCols === 0) {
            renderBulkCorrectPreview();
            return;
        }
        const questionCol = detectBulkQuestionColumn(parsed);
        const answerCol = detectBulkAnswerColumn(parsed, questionCol);
        renderBulkColumnOptions(parsed, questionCol, answerCol);
        renderBulkCorrectPreview();
    };

    const getQuestionKeyByNumber = (questionNo) => {
        if (!Number.isInteger(questionNo) || questionNo < 1) return null;
        let base = 0;
        for (const subj of subjects) {
            const start = base + 1;
            const end = base + subj.count;
            if (questionNo >= start && questionNo <= end) {
                return `${subj.id}_${questionNo - base}`;
            }
            base = end;
        }
        return null;
    };

    const applyBulkCorrectImport = () => {
        const preview = bulkCorrectImportState.preview;
        if (!preview || !preview.mappedRows.length) {
            if (bulkCorrectImportStatus) bulkCorrectImportStatus.textContent = '반영할 정답이 없습니다.';
            return;
        }
        preview.mappedRows.forEach((item) => {
            const key = getQuestionKeyByNumber(item.questionNo);
            if (key) {
                omrState.correctAnswers[key] = item.answer;
            }
        });
        if (bulkCorrectImportStatus) {
            bulkCorrectImportStatus.textContent = `${preview.mappedRows.length}문항의 정답을 반영했습니다.`;
        }
        updateScoreSummaryPanel();
        renderOMR();
    };

    const buildQuestionStatItem = (subj, num) => {
        const key = `${subj.id}_${num}`;
        const myAnswer = omrState.myAnswers[key] ?? null;
        const correctAnswer = omrState.correctAnswers[key] ?? null;
        const timing = questionTimings[key] || null;
        const spent = timing?.spent ?? 0;
        const timingState = timing?.state || null;
        const answered = myAnswer != null;
        const skipped = !answered && timingState === 'skipped';
        const unanswered = !answered && !skipped;
        const correctKnown = correctAnswer != null;
        const correct = correctKnown && answered && myAnswer === correctAnswer;
        const wrongByAnswer = correctKnown && answered && myAnswer !== correctAnswer;
        const skippedAsWrong = skipped && correctKnown && configTreatSkippedAsWrong;

        let resultKey = 'unanswered';
        let resultLabel = '못 풂';
        if (correct) {
            resultKey = 'correct';
            resultLabel = '정답';
        } else if (wrongByAnswer) {
            resultKey = 'wrong';
            resultLabel = '오답';
        } else if (skippedAsWrong) {
            resultKey = 'skipped_wrong';
            resultLabel = '건너뜀(오답)';
        } else if (skipped) {
            resultKey = 'skipped';
            resultLabel = '건너뜀';
        } else if (answered && !correctKnown) {
            resultKey = 'pending';
            resultLabel = '정답 미입력';
        }

        return {
            key,
            subjId: subj.id,
            subjName: subj.name,
            num,
            myAnswer,
            correctAnswer,
            spent,
            timingState,
            answered,
            skipped,
            unanswered,
            correct,
            wrongByAnswer,
            skippedAsWrong,
            resultKey,
            resultLabel
        };
    };

    const summarizeQuestionItems = (items) => {
        const total = items.length;
        const attempted = items.filter((item) => item.answered).length;
        const correct = items.filter((item) => item.correct).length;
        const skipped = items.filter((item) => item.skipped).length;
        const unanswered = items.filter((item) => item.unanswered).length;
        const wrong = items.filter((item) => item.wrongByAnswer || item.skippedAsWrong).length;
        const attemptedRate = attempted > 0 ? (correct / attempted) * 100 : 0;
        const overallRate = total > 0 ? (correct / total) * 100 : 0;
        return {
            total,
            attempted,
            correct,
            skipped,
            unanswered,
            wrong,
            attemptedRate,
            overallRate
        };
    };

    const collectDetailedStatsModel = () => {
        const questionItems = subjects.flatMap((subj) => {
            const items = [];
            for (let i = 1; i <= subj.count; i++) {
                items.push(buildQuestionStatItem(subj, i));
            }
            return items;
        });

        const resultOrder = {
            wrong: 0,
            skipped_wrong: 1,
            skipped: 2,
            unanswered: 3,
            correct: 4,
            pending: 5
        };

        const subjectRows = subjects.map((subj) => {
            const items = questionItems
                .filter((item) => item.subjId === subj.id)
                .sort((a, b) => (resultOrder[a.resultKey] - resultOrder[b.resultKey]) || (a.num - b.num));
            return {
                id: subj.id,
                name: subj.name,
                count: subj.count,
                summary: summarizeQuestionItems(items),
                items
            };
        });

        const topTimes = [...questionItems]
            .filter((item) => item.spent > 0)
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 3);

        return {
            overall: summarizeQuestionItems(questionItems),
            questionItems,
            subjectRows,
            topTimes,
            treatSkippedAsWrong: configTreatSkippedAsWrong
        };
    };

    const updateScoreSummaryPanel = () => {
        const model = collectDetailedStatsModel();
        const summaryEl = document.getElementById('statSummary');
        const attemptedRateEl = document.getElementById('statRateAttempted');
        const overallRateEl = document.getElementById('statRateOverall');
        const skippedEl = document.getElementById('statSkipped');
        const unansweredEl = document.getElementById('statUnanswered');

        if (summaryEl) summaryEl.innerText = `${model.overall.correct} / ${model.overall.attempted} / ${model.overall.total}`;
        if (attemptedRateEl) attemptedRateEl.innerText = formatRateText(model.overall.attemptedRate);
        if (overallRateEl) overallRateEl.innerText = formatRateText(model.overall.overallRate);
        if (skippedEl) skippedEl.innerText = `${model.overall.skipped}`;
        if (unansweredEl) unansweredEl.innerText = `${model.overall.unanswered}`;

        const resEl = document.getElementById('scoreResult');
        if (resEl) resEl.classList.remove('hidden');
        if (detailScoreBtn && isAdvancedMode) detailScoreBtn.classList.remove('hidden');
        return model;
    };

    document.getElementById('scoreBtn').addEventListener('click', () => {
        const hasCorrectAnswers = Object.values(omrState.correctAnswers).some((v) => v != null);
        if (!hasCorrectAnswers) {
            enterScoreMode();
            return;
        }

        updateScoreSummaryPanel();
        renderOMR();
    });

    const buildDetailedStatsText = () => {
        const model = collectDetailedStatsModel();
        const lines = [
            'SKCT 문항별 상세 통계',
            `생성 시각: ${new Date().toLocaleString('ko-KR')}`,
            `모드: ${isPracticeMode ? '연습 모드' : '실전 모드'}`,
            `설정 시간(입력값): 전체 ${configTotalMins}분 / 과목 ${configSubjectMins}분 / 쉬는시간 ${configBreakMins}분`,
            `전체 제한 시간(쉬는 시간 제외): ${Math.round(getEffectiveConfiguredTotalSeconds() / 60)}분`,
            `건너뜀 오답 처리: ${model.treatSkippedAsWrong ? 'ON' : 'OFF'}`,
            '',
            `[전체 요약]`,
            `맞은 / 푼 / 전체: ${model.overall.correct} / ${model.overall.attempted} / ${model.overall.total}`,
            `정답률(푼 문제 대비): ${formatRateText(model.overall.attemptedRate)}`,
            `정답률(전체 문제 대비): ${formatRateText(model.overall.overallRate)}`,
            `건너뜀: ${model.overall.skipped}`,
            `못 풂: ${model.overall.unanswered}`,
            ''
        ];

        if (model.topTimes.length) {
            lines.push('[가장 오래 걸린 문항 Top 3]');
            model.topTimes.forEach((item, index) => {
                lines.push(`${index + 1}위: [${item.subjName}] ${item.num}번 - ${item.spent}초 (${item.resultLabel})`);
            });
            lines.push('');
        }

        model.subjectRows.forEach((row) => {
            lines.push(`[${row.name}]`);
            lines.push(`맞은 / 푼 / 전체: ${row.summary.correct} / ${row.summary.attempted} / ${row.summary.total}`);
            lines.push(`정답률(푼 문제 대비): ${formatRateText(row.summary.attemptedRate)}`);
            lines.push(`정답률(전체 문제 대비): ${formatRateText(row.summary.overallRate)}`);
            lines.push(`건너뜀: ${row.summary.skipped}`);
            lines.push(`못 풂: ${row.summary.unanswered}`);
            lines.push('문항별 상세:');
            row.items.forEach((item) => {
                lines.push(`- ${item.num}번 | 입력 ${item.myAnswer ?? '-'} | 정답 ${item.correctAnswer ?? '-'} | 결과 ${item.resultLabel} | ${item.spent > 0 ? `${item.spent}초` : '시간 기록 없음'}`);
            });
            lines.push('');
        });

        if (!model.subjectRows.length) {
            lines.push('표시할 통계가 없습니다.');
        }
        return lines.join('\n');
    };

    const downloadDetailedStatsText = () => {
        const text = buildDetailedStatsText();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
        anchor.href = url;
        anchor.download = `skct-question-stats-${stamp}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    const openDetailedStatsModal = () => {
        const tbody = document.getElementById('statTableBody');
        const detailWrapper = document.getElementById('statDetailWrapper');
        if (!tbody) return;

        const model = collectDetailedStatsModel();
        const trHtml = model.subjectRows.map((row) => `
            <tr style="border-bottom: 1px solid #e2e8f0; height: 30px;">
                <td style="font-weight: bold; color: #1e293b;">${row.name}</td>
                <td style="color: #0f172a; font-weight: 700;">${row.summary.correct} / ${row.summary.attempted} / ${row.summary.total}</td>
                <td style="color: #64748b;">${row.summary.skipped}</td>
                <td style="color: #94a3b8;">${row.summary.unanswered}</td>
                <td style="color: #f59e0b; font-weight: bold;">${formatRateText(row.summary.attemptedRate)} / ${formatRateText(row.summary.overallRate)}</td>
            </tr>
        `).join('');
        tbody.innerHTML = trHtml;

        const topTimeHtml = model.topTimes.length
            ? `
                <div style="padding: 10px; background: #fffcf8; border: 1px solid #fed7aa; border-radius: 6px; margin-bottom: 8px;">
                    <span style="font-size:11px; color:#c2410c; font-weight:bold;">🚨 가장 오래 걸린 문항 Top 3</span>
                    ${model.topTimes.map((item, idx) => `
                        <div style="color: ${idx === 0 ? '#ef4444' : '#f97316'}; font-weight:bold; font-size:12px; margin-top:2px;">
                            ${idx + 1}위: [${item.subjName}] ${item.num}번 - ${item.spent}초 (${item.resultLabel})
                        </div>
                    `).join('')}
                </div>`
            : '';

        const overallHtml = `
            <div style="padding: 10px; background: #f8fafc; border: 1px solid #dbeafe; border-radius: 8px; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #334155; font-weight: 700; margin-bottom: 6px;">전체 요약</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                    <span style="background:#eff6ff; color:#1d4ed8; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">맞은/푼/전체 ${model.overall.correct}/${model.overall.attempted}/${model.overall.total}</span>
                    <span style="background:#f8fafc; color:#475569; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">건너뜀 ${model.overall.skipped}</span>
                    <span style="background:#f8fafc; color:#64748b; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">못 풂 ${model.overall.unanswered}</span>
                    <span style="background:#ecfeff; color:#0f766e; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">푼 문제 대비 ${formatRateText(model.overall.attemptedRate)}</span>
                    <span style="background:#fffbeb; color:#b45309; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">전체 대비 ${formatRateText(model.overall.overallRate)}</span>
                    <span style="background:${model.treatSkippedAsWrong ? '#fee2e2' : '#f1f5f9'}; color:${model.treatSkippedAsWrong ? '#b91c1c' : '#475569'}; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">건너뜀 오답 처리 ${model.treatSkippedAsWrong ? 'ON' : 'OFF'}</span>
                </div>
            </div>
        `;

        const detailHtml = model.subjectRows.map((row) => {
            const itemRows = row.items.map((item) => {
                const tone = item.resultKey === 'correct'
                    ? { bg: '#ecfdf5', border: '#bbf7d0', color: '#166534' }
                    : item.resultKey === 'wrong' || item.resultKey === 'skipped_wrong'
                        ? { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' }
                        : item.resultKey === 'skipped'
                            ? { bg: '#f8fafc', border: '#cbd5e1', color: '#475569' }
                            : item.resultKey === 'pending'
                                ? { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' }
                                : { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' };
                return `
                    <tr style="background:${tone.bg};">
                        <td style="padding:6px 8px; border:1px solid ${tone.border}; font-weight:700; color:#1e293b;">${item.num}번</td>
                        <td style="padding:6px 8px; border:1px solid ${tone.border}; color:#334155;">${item.myAnswer ?? '-'}</td>
                        <td style="padding:6px 8px; border:1px solid ${tone.border}; color:#334155;">${item.correctAnswer ?? '-'}</td>
                        <td style="padding:6px 8px; border:1px solid ${tone.border}; color:${tone.color}; font-weight:700;">${escapeHtml(item.resultLabel)}</td>
                        <td style="padding:6px 8px; border:1px solid ${tone.border}; color:#475569;">${item.spent > 0 ? `${item.spent}초` : '-'}</td>
                    </tr>
                `;
            }).join('');
            return `
                <details style="border:1px solid #dbeafe; border-radius:10px; background:#f8fbff; padding:0 12px;" data-stat-subject="${row.id}">
                    <summary style="cursor:pointer; list-style:none; padding:12px 0; display:flex; align-items:center; justify-content:space-between; gap:12px; font-weight:700; color:#1d4ed8;">
                        <span>${row.name}</span>
                        <span style="font-size:11px; color:#475569; font-weight:600;">${row.summary.correct}/${row.summary.attempted}/${row.summary.total} · 건너뜀 ${row.summary.skipped} · 못 풂 ${row.summary.unanswered}</span>
                    </summary>
                    <div style="padding:0 0 12px; border-top:1px dashed #bfdbfe;">
                        <div style="padding-top:10px;">
                            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                                <span style="background:#ecfdf5; color:#166534; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">정답 ${row.summary.correct}</span>
                                <span style="background:#fef2f2; color:#b91c1c; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">오답 ${row.summary.wrong}</span>
                                <span style="background:#f8fafc; color:#475569; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">건너뜀 ${row.summary.skipped}</span>
                                <span style="background:#f8fafc; color:#64748b; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">못 풂 ${row.summary.unanswered}</span>
                                <span style="background:#ecfeff; color:#0f766e; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">푼 문제 대비 ${formatRateText(row.summary.attemptedRate)}</span>
                                <span style="background:#fffbeb; color:#b45309; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:700;">전체 대비 ${formatRateText(row.summary.overallRate)}</span>
                            </div>
                            <div style="overflow-x:auto;">
                                <table style="width:100%; min-width:420px; border-collapse:collapse; font-size:11px; text-align:center;">
                                    <thead>
                                        <tr style="background:#e0ecff;">
                                            <th style="padding:6px 8px; border:1px solid #bfdbfe;">문항</th>
                                            <th style="padding:6px 8px; border:1px solid #bfdbfe;">입력답</th>
                                            <th style="padding:6px 8px; border:1px solid #bfdbfe;">정답</th>
                                            <th style="padding:6px 8px; border:1px solid #bfdbfe;">결과</th>
                                            <th style="padding:6px 8px; border:1px solid #bfdbfe;">소요시간</th>
                                        </tr>
                                    </thead>
                                    <tbody>${itemRows}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </details>
            `;
        }).join('');

        if (detailWrapper) {
            detailWrapper.innerHTML = overallHtml + topTimeHtml + (detailHtml === '' ? '<div style="text-align:center; color:#10b981; font-weight:bold; margin-top:10px;">표시할 과목별 상세 통계가 없습니다.</div>' : detailHtml);
        }
        document.getElementById('statModal').classList.remove('hidden');
    };

    if (detailScoreBtn) {
        detailScoreBtn.addEventListener('click', openDetailedStatsModal);
    }
    if (bulkCorrectImportBtn) {
        bulkCorrectImportBtn.addEventListener('click', openBulkCorrectImportModal);
    }
    if (bulkCorrectImportParseBtn) {
        bulkCorrectImportParseBtn.addEventListener('click', parseBulkCorrectImport);
    }
    if (bulkCorrectQuestionCol) {
        bulkCorrectQuestionCol.addEventListener('change', renderBulkCorrectPreview);
    }
    if (bulkCorrectAnswerCol) {
        bulkCorrectAnswerCol.addEventListener('change', renderBulkCorrectPreview);
    }
    if (bulkCorrectImportApplyBtn) {
        bulkCorrectImportApplyBtn.addEventListener('click', applyBulkCorrectImport);
    }


    /* --- Notepad / Canvas Toggle --- */
    const tabNotepad = document.getElementById('tabNotepad');
    const tabCanvas = document.getElementById('tabCanvas');
    const notepadWrapper = document.getElementById('notepadWrapper');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const notepad = document.getElementById('notepad');

    tabNotepad.addEventListener('click', () => {
        tabNotepad.classList.add('active');
        tabCanvas.classList.remove('active');
        notepadWrapper.classList.remove('hidden');
        canvasWrapper.classList.add('hidden');
    });

    tabCanvas.addEventListener('click', () => {
        tabCanvas.classList.add('active');
        tabNotepad.classList.remove('active');
        canvasWrapper.classList.remove('hidden');
        notepadWrapper.classList.add('hidden');
        resizeCanvas(); // Ensure canvas fits when revealed
    });

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
        // 흐물흐물한 크레용 느낌 모방 (투명도 + 굵기)
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

    document.getElementById('globalClearBtn').addEventListener('click', (event) => {
        event.preventDefault();
        advanceQuestion(true);
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
                calcState.expressionTokens = [];
                calcState.waitingNew = false;
                calcState.justEvaluated = false;
                calcState.history = [];
                updateCalcDisplay();
                
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
        expressionTokens: [],
        waitingNew: false,
        justEvaluated: false,
        history: [],
        lastEvaluatedLine: '',
        lastAnswerArchived: true
    };

    function getOperatorSymbol(operator) {
        if (operator === '*') return '×';
        if (operator === '/') return '÷';
        return operator || '';
    }

    function limitCalcInput(value) {
        return value.length <= CALC_MAX_INPUT_LENGTH ? value : value.slice(0, CALC_MAX_INPUT_LENGTH);
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

    function archiveCurrentAnswerLine() {
        if (!calcState.justEvaluated || calcState.lastAnswerArchived) return;
        const ansLine = `Ans = ${calcState.current}`;
        if (calcState.history.length && calcState.history[calcState.history.length - 1] === calcState.lastEvaluatedLine) {
            calcState.history[calcState.history.length - 1] = ansLine;
        } else {
            pushCalcHistory(ansLine);
        }
        calcState.lastAnswerArchived = true;
    }

    function isOperatorToken(token) {
        return ['+', '-', '*', '/'].includes(token);
    }

    function formatExpression(tokens) {
        return tokens.map((token) => isOperatorToken(token) ? getOperatorSymbol(token) : token).join(' ');
    }

    function getPendingCalcLine() {
        if (!calcState.expressionTokens.length) return null;
        if (calcState.waitingNew) {
            return formatExpression(calcState.expressionTokens);
        }
        return formatExpression([...calcState.expressionTokens, calcState.current]);
    }

    function evaluateExpression(tokens) {
        if (!tokens.length) return '0';
        const values = [parseFloat(tokens[0])];
        const operators = [];

        for (let i = 1; i < tokens.length; i += 2) {
            operators.push(tokens[i]);
            values.push(parseFloat(tokens[i + 1]));
        }

        if (values.some((value) => !Number.isFinite(value))) {
            return 'Error';
        }

        const collapsedValues = [values[0]];
        const collapsedOperators = [];

        for (let i = 0; i < operators.length; i++) {
            const operator = operators[i];
            const nextValue = values[i + 1];
            if (operator === '*' || operator === '/') {
                const leftValue = collapsedValues.pop();
                if (operator === '/' && nextValue === 0) {
                    return 'Error';
                }
                collapsedValues.push(operator === '*' ? leftValue * nextValue : leftValue / nextValue);
            } else {
                collapsedOperators.push(operator);
                collapsedValues.push(nextValue);
            }
        }

        let result = collapsedValues[0];
        for (let i = 0; i < collapsedOperators.length; i++) {
            const operator = collapsedOperators[i];
            const nextValue = collapsedValues[i + 1];
            result = operator === '+' ? result + nextValue : result - nextValue;
        }

        return Number.isFinite(result)
            ? String(Math.round(result * 100000000) / 100000000)
            : 'Error';
    }

    function updateCalcDisplay() {
        if (!calcHistory) return;
        const upperLines = [...calcState.history];
        const pendingLine = getPendingCalcLine();
        if (pendingLine) {
            upperLines.push(pendingLine);
        }

        const lines = upperLines.slice(-3).map((line) => {
            const sizeClass = getCalcLineSizeClass(line, false);
            return `<div class="calc-line history-line ${sizeClass}">${escapeCalcLine(line)}</div>`;
        });
        const currentSizeClass = getCalcLineSizeClass(calcState.current, true);
        lines.push(`<div class="calc-line current-line ${currentSizeClass}">${escapeCalcLine(calcState.current)}</div>`);
        calcHistory.innerHTML = lines.join('');
        calcHistory.scrollTop = calcHistory.scrollHeight;
    }

    function resetCalculator() {
        calcState.current = '0';
        calcState.expressionTokens = [];
        calcState.waitingNew = false;
        calcState.justEvaluated = false;
        calcState.history = [];
        calcState.lastEvaluatedLine = '';
        calcState.lastAnswerArchived = true;
        updateCalcDisplay();
    }

    function calculateResult() {
        if (!calcState.expressionTokens.length) return;

        const expressionTokens = [...calcState.expressionTokens];
        if (isOperatorToken(expressionTokens[expressionTokens.length - 1])) {
            expressionTokens.push(calcState.current);
        }

        const resultText = evaluateExpression(expressionTokens);
        const expressionLine = `${formatExpression(expressionTokens)} = ${resultText}`;
        pushCalcHistory(expressionLine);
        calcState.current = resultText;
        calcState.expressionTokens = [];
        calcState.waitingNew = true;
        calcState.justEvaluated = true;
        calcState.lastEvaluatedLine = expressionLine;
        calcState.lastAnswerArchived = false;
        updateCalcDisplay();
    }

    function handleNumber(numStr) {
        if (calcState.waitingNew) {
            if (calcState.justEvaluated && !calcState.expressionTokens.length) {
                archiveCurrentAnswerLine();
            }
            calcState.current = numStr === '.' ? '0.' : numStr;
            calcState.waitingNew = false;
            calcState.justEvaluated = false;
            calcState.lastAnswerArchived = true;
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
        updateCalcDisplay();
    }

    function handleOperator(op) {
        if (calcState.justEvaluated && !calcState.expressionTokens.length) {
            archiveCurrentAnswerLine();
        }
        if (!calcState.expressionTokens.length) {
            calcState.expressionTokens = [calcState.current, op];
        } else if (calcState.waitingNew) {
            if (isOperatorToken(calcState.expressionTokens[calcState.expressionTokens.length - 1])) {
                calcState.expressionTokens[calcState.expressionTokens.length - 1] = op;
            } else {
                calcState.expressionTokens.push(op);
            }
        } else {
            calcState.expressionTokens.push(calcState.current, op);
        }
        calcState.waitingNew = true;
        calcState.justEvaluated = false;
        calcState.lastAnswerArchived = true;
        updateCalcDisplay();
    }

    function handleFn(fnStr) {
        if (fnStr === 'C') {
            resetCalculator();
            return;
        } else if (fnStr === 'BACK') {
            if (calcState.waitingNew && calcState.expressionTokens.length && isOperatorToken(calcState.expressionTokens[calcState.expressionTokens.length - 1])) {
                calcState.expressionTokens.pop();
                calcState.waitingNew = false;
                calcState.justEvaluated = false;
            } else if (!calcState.waitingNew && calcState.current !== '0' && calcState.current !== 'Error') {
                calcState.current = calcState.current.slice(0, -1);
                if (calcState.current === '' || calcState.current === '-') calcState.current = '0';
            }
        } else if (fnStr === 'SQRT') {
            const currentValue = parseFloat(calcState.current);
            const result = Number.isFinite(currentValue) && currentValue >= 0
                ? String(Math.round(Math.sqrt(currentValue) * 100000000) / 100000000)
                : 'Error';
            calcState.current = result;
            calcState.waitingNew = false;
            calcState.justEvaluated = false;
            calcState.lastAnswerArchived = true;
        } else if (fnStr === '=') {
            calculateResult();
        }
        updateCalcDisplay();
    }

    updateCalcDisplay();

    // UI Buttons
    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.dataset.val;
            if (e.target.classList.contains('num-btn')) {
                handleNumber(val);
            } else if (e.target.classList.contains('op-btn')) {
                handleOperator(val);
            } else if (e.target.classList.contains('fn-btn')) {
                // If it's pure C/Equal
                handleFn(val);
            }
        });
    });

    // Keyboard Support
    window.addEventListener('keydown', (e) => {
        // Prevent if user is typing in notepad or timer
        if (document.activeElement === notepad || document.activeElement.tagName === 'INPUT') {
            return;
        }

        const key = e.key;

        // Numbers
        if (/[0-9]/.test(key)) {
            handleNumber(key);
            e.preventDefault();
        } 
        else if (key === '.') {
            handleNumber('.');
            e.preventDefault();
        }
        // Operators
        else if (['+', '-', '*', '/'].includes(key)) {
            handleOperator(key);
            e.preventDefault();
        } 
        else if (key === 'Enter' || key === '=') {
            calculateResult();
            e.preventDefault();
        }
        else if (key === 'Backspace') {
            handleFn('BACK');
            e.preventDefault();
        }
        else if (key.toLowerCase() === 'c') {
            handleFn('C');
            e.preventDefault();
        }
        // Explicitly block Delete, Escape from clearing the calc as requested
        else if (key === 'Delete' || key === 'Escape') {
            // Do nothing intentionally
            e.preventDefault();
        }
    });


    const getConfiguredPhaseTotalSeconds = () => {
        const subjectTotal = subjects.length * configSubjectMins * 60;
        const breakTotal = Math.max(subjects.length - 1, 0) * configBreakMins * 60;
        return subjectTotal + breakTotal;
    };

    const getEffectiveConfiguredTotalSeconds = () => {
        return configTotalMins * 60;
    };

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
        savedTimerCfg = JSON.parse(localStorage.getItem('skct_timer_cfg'));
        if (isLegacyDefaultTimerConfig(savedTimerCfg)) {
            localStorage.removeItem('skct_timer_cfg');
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
    const savedGuideCfg = isAdminPreviewMode ? null : JSON.parse(localStorage.getItem('skct_guide_cfg'));
    if (savedGuideCfg) {
        configGuideEnabled = savedGuideCfg.enabled;
        configGuideSec = savedGuideCfg.sec;
    }
    let configTreatSkippedAsWrong = false;
    const savedScoreCfg = isAdminPreviewMode ? null : JSON.parse(localStorage.getItem('skct_score_cfg'));
    if (savedScoreCfg && typeof savedScoreCfg.treatSkippedAsWrong === 'boolean') {
        configTreatSkippedAsWrong = savedScoreCfg.treatSkippedAsWrong;
    }
    const totalTimeInput = document.getElementById('cfgTotal');
    const subjectTimeInput = document.getElementById('cfgSubj');
    const breakTimeInput = document.getElementById('cfgBreak');
    const guideEnabledInput = document.getElementById('cfgGuideEnabled');
    const guideSecInput = document.getElementById('cfgGuideSec');
    const skippedAsWrongInput = document.getElementById('cfgSkippedAsWrong');

    if(totalTimeInput) totalTimeInput.value = configTotalMins;
    if(subjectTimeInput) subjectTimeInput.value = configSubjectMins;
    if(breakTimeInput) breakTimeInput.value = configBreakMins;
    if(guideEnabledInput) guideEnabledInput.checked = configGuideEnabled;
    if(guideSecInput) guideSecInput.value = configGuideSec;
    if(skippedAsWrongInput) skippedAsWrongInput.checked = configTreatSkippedAsWrong;
    
    totalSeconds = getEffectiveConfiguredTotalSeconds();
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

    const syncTimerPlayButtonLabel = (isRunning) => {
        if (!timerPlayBtn) return;
        timerPlayBtn.textContent = isRunning ? '■' : '▶';
        timerPlayBtn.setAttribute('aria-label', isRunning ? '타이머 중지' : '타이머 시작');
        timerPlayBtn.title = isRunning ? '타이머 중지' : '타이머 시작';
    };

    const getCurrentPhase = () => currentPhaseIdx < phases.length ? phases[currentPhaseIdx] : null;

    const canSkipToNextSubject = () => {
        if (!isAdvancedMode || isPracticeMode) return false;
        if (!timerIsRunning) return false;
        if (currentPhaseIdx >= phases.length) return false;
        const currentPhase = getCurrentPhase();
        if (currentPhase?.type !== 'subject') return false;
        return currentPhaseIdx + 2 < phases.length;
    };

    const canResetCurrentSubjectTimer = () => {
        if (!isAdvancedMode) return false;
        const currentPhase = getCurrentPhase();
        return currentPhase?.type === 'subject';
    };

    const canResetFullTimer = () => isAdvancedMode && phases.length > 0;

    const updateSubjectResetButton = () => {
        const subjectResetBtn = document.getElementById('subjectResetBtn');
        if (!subjectResetBtn) return;
        const enabled = canResetCurrentSubjectTimer();
        subjectResetBtn.disabled = !enabled;
        if (!isAdvancedMode) {
            subjectResetBtn.title = '고급모드에서만 사용할 수 있습니다.';
        } else if (currentPhaseIdx >= phases.length) {
            subjectResetBtn.title = '이미 모든 과목이 종료되었습니다.';
        } else if (getCurrentPhase()?.type !== 'subject') {
            subjectResetBtn.title = '과목 진행 중일 때만 사용할 수 있습니다.';
        } else {
            subjectResetBtn.title = '현재 과목 타이머를 처음부터 다시 시작';
        }
    };

    const updateSubjectSkipButton = () => {
        const subjectSkipBtn = document.getElementById('subjectSkipBtn');
        if (!subjectSkipBtn) return;
        const enabled = canSkipToNextSubject();
        subjectSkipBtn.disabled = !enabled;
        if (!isAdvancedMode) {
            subjectSkipBtn.title = '고급모드에서만 사용할 수 있습니다.';
        } else if (isPracticeMode) {
            subjectSkipBtn.title = '응시 모드에서만 사용할 수 있습니다.';
        } else if (!timerIsRunning) {
            subjectSkipBtn.title = '타이머 실행 중에만 사용할 수 있습니다.';
        } else if (currentPhaseIdx >= phases.length) {
            subjectSkipBtn.title = '이미 모든 과목이 종료되었습니다.';
        } else if (getCurrentPhase()?.type === 'break') {
            subjectSkipBtn.title = '쉬는 시간에는 사용할 수 없습니다.';
        } else if (currentPhaseIdx + 2 >= phases.length) {
            subjectSkipBtn.title = '다음 과목이 남아 있을 때만 사용할 수 있습니다.';
        } else {
            subjectSkipBtn.title = '현재 과목을 종료하고 다음 과목으로 바로 이동';
        }
    };

    const updateFullResetButton = () => {
        const fullResetBtn = document.getElementById('fullResetBtn');
        if (!fullResetBtn) return;
        const enabled = canResetFullTimer();
        fullResetBtn.disabled = !enabled;
        fullResetBtn.title = enabled
            ? '전체 타이머를 처음 상태로 다시 세팅'
            : '고급모드에서만 사용할 수 있습니다.';
    };

    const updateTimerActionButtons = () => {
        updateSubjectSkipButton();
        updateSubjectResetButton();
        updateFullResetButton();
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
        if (guideWrapper && displayGuide && isAdvancedMode && configGuideEnabled && !isPracticeMode && timerIsRunning && qKey && currentPhaseIdx < phases.length && phases[currentPhaseIdx].type !== 'break') {
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

        updateTimerActionButtons();
    };

    window.applyRemoteTimerDefaults = (total, subj, brk) => {
        if (timerIsRunning) return; // ignore if running
        configSubjectMins = sanitizeMinutes(subj, 15);
        configBreakMins = sanitizeMinutes(brk, 1);
        configTotalMins = sanitizeMinutes(total, 75);

        if (totalTimeInput) totalTimeInput.value = configTotalMins;
        if (subjectTimeInput) subjectTimeInput.value = configSubjectMins;
        if (breakTimeInput) breakTimeInput.value = configBreakMins;

        totalSeconds = getEffectiveConfiguredTotalSeconds();
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

    window.applyRemoteToolUiConfig = (toolUiConfig) => {
        remoteToolUiConfig = normalizeToolUiConfig(toolUiConfig);
        applyToolUiConfig(remoteToolUiConfig, {
            persist: false,
            notifyPopupEditor: false
        });
    };

    window.applyRemotePopupLayout = (popupLayout) => {
        remotePopupLayout = normalizePopupLayout(popupLayout);
        if (!isPopupMode) {
            return;
        }
        currentPopupLayout = normalizePopupLayout(remotePopupLayout);
        applyPopupOmrWidthRatio(currentPopupLayout.omrWidthRatio);
        schedulePopupEditorSync();
    };

    window.applyRemoteAdvancedFeatureConfig = (advancedFeatureConfig) => {
        remoteAdvancedFeatureConfig = normalizeAdvancedFeatureConfig(advancedFeatureConfig);
        isAdvancedConfigReady = true;
        updateAdvancedAccessPanel();
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

        const currentPhase = currentPhaseIdx < phases.length ? phases[currentPhaseIdx] : null;
        if (currentPhase?.type !== 'break') {
            if (totalSeconds > 0) {
                totalSeconds--;
            } else {
                clearInterval(timerInterval);
                timerIsRunning = false;
                syncTimerPlayButtonLabel(false);
                currentPhaseIdx = phases.length;
                updateTimerUI();
                playBeep(440, 300, 3); // 전체 시간 종료
                return;
            }
        }

        if (currentPhaseIdx < phases.length) {
            if (currentPhaseSeconds > 0) {
                currentPhaseSeconds--;
            } else {
                advancePhaseBoundary();
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

    const advancePhaseBoundary = ({ skipRemainingPhaseSeconds = false } = {}) => {
        if (currentPhaseIdx >= phases.length) return;
        const endedPhase = phases[currentPhaseIdx];
        const endedPhaseIdx = currentPhaseIdx;

        currentPhaseIdx++;

        if (typeof ctx !== 'undefined' && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (typeof notepad !== 'undefined') notepad.value = '';
        if (typeof calcState !== 'undefined') {
            resetCalculator();
        }

        if (currentPhaseIdx < phases.length) {
            currentPhaseSeconds = phases[currentPhaseIdx].mins * 60;
            if (endedPhase.type === 'subject') {
                playBeep(659, 400, 2);
                if (!isPracticeMode) {
                    const subjIdx = Math.floor(endedPhaseIdx / 2);
                    lockedSubjectIndices.add(subjIdx);
                }
            } else if (!skipRemainingPhaseSeconds) {
                playBeep(523, 400, 1);
            }
            applyPhaseToOMR();
        } else {
            clearInterval(timerInterval);
            timerIsRunning = false;
            syncTimerPlayButtonLabel(false);
            playBeep(440, 500, 3);
            if (!isPracticeMode) {
                const subjIdx = Math.floor((currentPhaseIdx - 1) / 2);
                lockedSubjectIndices.add(subjIdx);
            }
            applyPhaseToOMR();
        }
    };

    const skipCurrentBreak = () => {
        if (!timerIsRunning || currentPhaseIdx >= phases.length) return;
        const currentPhase = phases[currentPhaseIdx];
        if (currentPhase?.type !== 'break') return;
        advancePhaseBoundary({ skipRemainingPhaseSeconds: true });
        updateTimerUI();
    };

    const clearQuestionTimingsForSubjectRange = (startSubjectIdx, endSubjectIdx = startSubjectIdx) => {
        for (let subjectIdx = startSubjectIdx; subjectIdx <= endSubjectIdx; subjectIdx++) {
            const subject = subjects[subjectIdx];
            if (!subject) continue;
            const prefix = `${subject.id}_`;
            Object.keys(questionTimings).forEach((key) => {
                if (key.startsWith(prefix)) {
                    delete questionTimings[key];
                }
            });
        }
    };

    const clearLockedSubjectsFrom = (startSubjectIdx) => {
        [...lockedSubjectIndices].forEach((subjectIdx) => {
            if (subjectIdx >= startSubjectIdx) {
                lockedSubjectIndices.delete(subjectIdx);
            }
        });
    };

    const computeRemainingTotalSecondsFromSubject = (subjectIdx, currentSubjectSeconds) => {
        let remaining = Math.max(0, currentSubjectSeconds);
        for (let idx = subjectIdx + 1; idx < subjects.length; idx++) {
            remaining += configSubjectMins * 60;
        }
        return remaining;
    };

    const resetCurrentSubjectTimer = () => {
        if (!canResetCurrentSubjectTimer()) return;
        stopTimer();
        const subjectIdx = Math.floor(currentPhaseIdx / 2);
        currentPhaseIdx = subjectIdx * 2;
        currentPhaseSeconds = phases[currentPhaseIdx].mins * 60;
        totalSeconds = computeRemainingTotalSecondsFromSubject(subjectIdx, currentPhaseSeconds);
        questionSpentSec = 0;
        clearQuestionTimingsForSubjectRange(subjectIdx);
        clearLockedSubjectsFrom(subjectIdx);
        omrState.currentGlobalIndex = getSubjectStartIndex(subjectIdx);
        if (omrState.mode !== 'answer') {
            omrState.mode = 'answer';
            updateModeUI();
        }
        applyPhaseToOMR();
        updateTimerUI();
    };

    const resetAllTimerProgress = () => {
        if (!canResetFullTimer()) return;
        stopTimer();
        totalSeconds = getEffectiveConfiguredTotalSeconds();
        buildPhases();
        questionSpentSec = 0;
        questionTimings = {};
        lockedSubjectIndices.clear();
        omrState.currentGlobalIndex = 0;
        if (omrState.mode !== 'answer') {
            omrState.mode = 'answer';
            updateModeUI();
        }
        applyPhaseToOMR();
        updateTimerUI();
    };

    const skipCurrentSubjectToNext = () => {
        if (!canSkipToNextSubject()) return;
        totalSeconds = Math.max(0, totalSeconds - Math.max(0, currentPhaseSeconds));
        questionSpentSec = 0;
        advancePhaseBoundary({ skipRemainingPhaseSeconds: true });
        if (currentPhaseIdx < phases.length && phases[currentPhaseIdx]?.type === 'break') {
            advancePhaseBoundary({ skipRemainingPhaseSeconds: true });
        }
        updateTimerUI();
    };

    // --- 초기 렌더링 갱신 ---
    updateTimerUI();
    applyPhaseToOMR();
    syncTimerPlayButtonLabel(timerIsRunning);

    if(timerPlayBtn) {
        timerPlayBtn.addEventListener('click', () => {
            initAudio(); // 사용자 인터랙션 시 AudioContext 활성화
            if (currentPhaseIdx >= phases.length && totalSeconds <= 0) return;
            if (timerIsRunning) {
                clearInterval(timerInterval);
                timerIsRunning = false;
                syncTimerPlayButtonLabel(false);
                applyPhaseToOMR();
            } else {
                timerInterval = setInterval(timerTick, 1000);
                timerIsRunning = true;
                syncTimerPlayButtonLabel(true);
                applyPhaseToOMR();
            }
        });
    }

    const breakSkipBtn = document.getElementById('breakSkipBtn');
    if (breakSkipBtn) {
        breakSkipBtn.addEventListener('click', () => {
            skipCurrentBreak();
        });
    }

    const subjectSkipBtn = document.getElementById('subjectSkipBtn');
    if (subjectSkipBtn) {
        subjectSkipBtn.addEventListener('click', () => {
            skipCurrentSubjectToNext();
        });
    }

    const subjectResetBtn = document.getElementById('subjectResetBtn');
    if (subjectResetBtn) {
        subjectResetBtn.addEventListener('click', () => {
            resetCurrentSubjectTimer();
        });
    }

    const fullResetBtn = document.getElementById('fullResetBtn');
    if (fullResetBtn) {
        fullResetBtn.addEventListener('click', () => {
            resetAllTimerProgress();
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
                localStorage.setItem('skct_timer_cfg', JSON.stringify({total: configTotalMins, subj: configSubjectMins, brk: configBreakMins, source: 'user'}));
            }
            
            configGuideEnabled = document.getElementById('cfgGuideEnabled').checked;
            configGuideSec = parseInt(document.getElementById('cfgGuideSec').value) || 45;
            if (!isAdminPreviewMode) {
                localStorage.setItem('skct_guide_cfg', JSON.stringify({enabled: configGuideEnabled, sec: configGuideSec}));
            }
            configTreatSkippedAsWrong = document.getElementById('cfgSkippedAsWrong').checked;
            if (!isAdminPreviewMode) {
                localStorage.setItem('skct_score_cfg', JSON.stringify({ treatSkippedAsWrong: configTreatSkippedAsWrong }));
            }

            // 모드 설정 적용
            const practiceModeInput = document.getElementById('cfgPracticeMode');
            if (practiceModeInput) {
                isPracticeMode = practiceModeInput.checked;
                localStorage.setItem('skct_practice_mode', isPracticeMode);
            }

            if (timerIsRunning) {
                stopTimer();
            }
            totalSeconds = getEffectiveConfiguredTotalSeconds();
            lockedSubjectIndices.clear(); // 모드 변경 시 잠금 초기화
            buildPhases();
            updateTimerUI();
            applyRatios();
            renderOMR();
            const scoreResultEl = document.getElementById('scoreResult');
            const statModalEl = document.getElementById('statModal');
            if (scoreResultEl && !scoreResultEl.classList.contains('hidden')) {
                updateScoreSummaryPanel();
            }
            if (statModalEl && !statModalEl.classList.contains('hidden')) {
                openDetailedStatsModal();
            }
            settingsModal.classList.add('hidden');
        });
    }

    if (advancedGuideToggle && advancedGuideModal) {
        advancedGuideToggle.addEventListener('click', () => {
            if (isAdvancedMode) return;
            if (advancedAccessStatus) advancedAccessStatus.textContent = '';
            if (advancedAccessPasswordInput) advancedAccessPasswordInput.value = '';
            ensureManualSubscriptionStartDate();
            const recentRequest = readRecentRequestInfo();
            if (recentRequest?.requestId && manualSubscriptionLookupIdInput && !manualSubscriptionLookupIdInput.value) {
                manualSubscriptionLookupIdInput.value = recentRequest.requestId;
            }
            updateAdvancedAccessPanel();
            advancedGuideModal.classList.remove('hidden');
        });
    }
    if (advancedToggle && advancedFeatureModal) {
        advancedToggle.addEventListener('click', () => {
            if (!isAdvancedMode) return;
            if (advancedToolsStatus) advancedToolsStatus.textContent = '';
            advancedFeatureModal.classList.remove('hidden');
        });
    }
    if (advancedFeatureManualFlowBtn && advancedGuideModal && advancedFeatureModal) {
        advancedFeatureManualFlowBtn.addEventListener('click', () => {
            advancedFeatureModal.classList.add('hidden');
            advancedGuideModal.classList.remove('hidden');
        });
    }
    if (advancedStatsDownloadBtn) {
        advancedStatsDownloadBtn.addEventListener('click', () => {
            downloadDetailedStatsText();
            if (advancedToolsStatus) advancedToolsStatus.textContent = '문항별 상세 통계 TXT 다운로드를 시작했습니다.';
        });
    }
    if (manualSubscriptionSubmitBtn) {
        manualSubscriptionSubmitBtn.addEventListener('click', submitManualSubscriptionRequest);
    }
    if (manualSubscriptionLookupBtn) {
        manualSubscriptionLookupBtn.addEventListener('click', lookupManualSubscriptionRequest);
    }

    const openAdvancedToolsPopup = () => {
        const { width, height, left, top } = buildPopupWindowMetrics(remotePopupLayout.window);
        const popup = window.open(
            ADVANCED_POPUP_PATH,
            'skct_advanced_tools',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
        );
        if (!popup) {
            alert('브라우저에서 팝업이 차단되어 고급 기능 창을 열 수 없습니다.');
            return;
        }
        popup.focus();
    };

    const settingsTitleTrigger = document.getElementById('settingsTitleTrigger');
    let advancedTapCount = 0;
    let advancedTapTimeout = null;
    if (settingsTitleTrigger) {
        settingsTitleTrigger.addEventListener('click', () => {
            advancedTapCount += 1;
            if (advancedTapTimeout) {
                clearTimeout(advancedTapTimeout);
            }
            advancedTapTimeout = window.setTimeout(() => {
                advancedTapCount = 0;
            }, ADVANCED_TRIGGER_TIMEOUT_MS);
            if (advancedTapCount >= ADVANCED_TRIGGER_TAP_COUNT) {
                advancedTapCount = 0;
                clearTimeout(advancedTapTimeout);
                advancedTapTimeout = null;
                openAdvancedToolsPopup();
            }
        });
    }

    window.SKCTAdvancedBridge = {
        isConfigReady() {
            return isAdvancedConfigReady;
        },
        async validateCredentials(loginId, password) {
            return validateAdvancedCredentials(loginId, password);
        },
        async validateCredentialsDetailed(loginId, password) {
            return validateAdvancedCredentialsDetailed(loginId, password);
        },
        async validatePassword(password) {
            return validateAdvancedPassword(password);
        },
        async validatePasswordDetailed(password) {
            return validateAdvancedPasswordDetailed(password);
        },
        activateAdvancedSession() {
            return activateAdvancedSession();
        },
        getAdvancedSnapshot() {
            return {
                timer: {
                    configuredTotalMinutes: configTotalMins,
                    subjectMinutes: configSubjectMins,
                    breakMinutes: configBreakMins,
                    phaseTotalMinutes: Math.round(getConfiguredPhaseTotalSeconds() / 60),
                    effectiveTotalMinutes: Math.round(getEffectiveConfiguredTotalSeconds() / 60),
                    remainingSeconds: totalSeconds,
                    questionSpentSec,
                    currentPhaseIndex: currentPhaseIdx,
                    currentPhaseName: currentPhaseIdx < phases.length ? phases[currentPhaseIdx].name : '모든 시험 종료',
                    currentPhaseSeconds,
                    isRunning: timerIsRunning
                },
                question: {
                    currentKey: getCurrentQKey(),
                    currentIndex: omrState.currentGlobalIndex,
                    mode: omrState.mode
                }
            };
        },
        downloadDetailedStatsText() {
            downloadDetailedStatsText();
            return true;
        },
        buildDetailedStatsText() {
            return buildDetailedStatsText();
        }
    };

    if (advancedAccessSubmitBtn) {
        advancedAccessSubmitBtn.addEventListener('click', async () => {
            if (isAdvancedMode) return;
            const loginId = advancedAccessIdInput?.value || '';
            const password = advancedAccessPasswordInput?.value || '';
            if (!isAdvancedConfigReady) {
                if (advancedAccessStatus) {
                    advancedAccessStatus.textContent = '고급 구독 정보를 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.';
                    advancedAccessStatus.style.color = '#b45309';
                }
                updateAdvancedAccessPanel();
                return;
            }
            const cooldownRemainingMs = getAdvancedCooldownRemainingMs();
            if (cooldownRemainingMs > 0) {
                if (advancedAccessStatus) {
                    advancedAccessStatus.textContent = `${Math.ceil(cooldownRemainingMs / 1000)}초 후에 다시 시도할 수 있습니다.`;
                    advancedAccessStatus.style.color = '#b91c1c';
                }
                updateAdvancedAccessPanel();
                return;
            }
            if (advancedAccessStatus) {
                advancedAccessStatus.textContent = 'ID와 비밀번호를 확인하고 있습니다...';
                advancedAccessStatus.style.color = '#64748b';
            }
            const validationResult = await validateAdvancedCredentialsDetailed(loginId, password);
            if (!validationResult.ok) {
                const failState = registerAdvancedPasswordFailure();
                if (advancedAccessStatus) {
                    const nextCooldownRemainingMs = Number.isFinite(failState.lockedUntil)
                        ? Math.max(0, failState.lockedUntil - Date.now())
                        : 0;
                    advancedAccessStatus.textContent = nextCooldownRemainingMs > 0
                        ? `ID 또는 비밀번호 오류가 누적되어 ${Math.ceil(nextCooldownRemainingMs / 1000)}초 동안 다시 시도할 수 없습니다.`
                        : validationResult.reason === 'expired'
                            ? 'ID와 비밀번호는 맞지만 이용권이 만료되었거나 비활성화되었습니다.'
                            : validationResult.reason === 'empty_password'
                                ? '비밀번호를 입력해주세요.'
                                : validationResult.reason === 'empty'
                                    ? 'ID와 비밀번호를 모두 입력해주세요.'
                                    : 'ID 또는 비밀번호가 일치하지 않습니다.';
                    advancedAccessStatus.style.color = '#b91c1c';
                }
                if (!String(loginId || '').trim() && advancedAccessIdInput) {
                    advancedAccessIdInput.focus();
                    advancedAccessIdInput.select();
                } else if (advancedAccessPasswordInput) {
                    advancedAccessPasswordInput.focus();
                    advancedAccessPasswordInput.select();
                }
                updateAdvancedAccessPanel();
                return;
            }
            resetAdvancedFailState();
            if (advancedAccessStatus) {
                advancedAccessStatus.textContent = '고급 버전 팝업을 여는 중입니다.';
                advancedAccessStatus.style.color = '#0f766e';
            }
            openAdvancedModeWindow();
        });
    }

    if (advancedAccessIdInput) {
        advancedAccessIdInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                advancedAccessSubmitBtn?.click();
            }
        });
    }
    if (advancedAccessPasswordInput) {
        advancedAccessPasswordInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                advancedAccessSubmitBtn?.click();
            }
        });
    }
    if (advancedAccessReveal && advancedAccessPasswordInput) {
        advancedAccessReveal.addEventListener('change', () => {
            advancedAccessPasswordInput.type = advancedAccessReveal.checked ? 'text' : 'password';
        });
    }
    if (advancedAccessReuseBtn) {
        advancedAccessReuseBtn.addEventListener('click', () => {
            if (!hasAdvancedUnlock()) {
                if (advancedAccessStatus) {
                    advancedAccessStatus.textContent = '이 브라우저의 인증 상태가 없거나 만료되었습니다. ID와 비밀번호를 다시 입력해주세요.';
                    advancedAccessStatus.style.color = '#b45309';
                }
                updateAdvancedAccessPanel();
                return;
            }
            if (advancedAccessStatus) {
                advancedAccessStatus.textContent = '저장된 인증 상태로 고급 버전을 다시 엽니다.';
                advancedAccessStatus.style.color = '#0f766e';
            }
            openAdvancedModeWindow();
        });
    }
    updateAdvancedAccessPanel();

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

    // Clicking the calculator surface should move keyboard focus to the calculator.
    const calcHistoryEl = document.getElementById('calcHistory');
    const focusCalculatorSurface = () => {
        if (!calculatorSectionEl) return;
        if (document.activeElement === notepad) {
            notepad.blur();
        }
        calculatorSectionEl.focus({ preventScroll: true });
    };
    if (calculatorSectionEl) {
        calculatorSectionEl.tabIndex = -1;
        calculatorSectionEl.addEventListener('mousedown', (e) => {
            if (!(e.target instanceof Element)) return;
            if (e.target.closest('.calc-btn, input, textarea')) return;
            requestAnimationFrame(focusCalculatorSurface);
        });
        calculatorSectionEl.addEventListener('click', (e) => {
            if (!(e.target instanceof Element)) return;
            if (e.target.closest('.calc-btn, input, textarea')) return;
            focusCalculatorSurface();
        });
    }
    if (calcHistoryEl) {
        calcHistoryEl.tabIndex = -1;
        calcHistoryEl.addEventListener('mousedown', () => {
            requestAnimationFrame(focusCalculatorSurface);
        });
    }

    document.getElementById('mockChatBtn')?.addEventListener('click', () => {
        alert('skct와 동일한 위치에 존재하는 기능 없는 버튼입니다');
    });

    document.getElementById('mockQuestionBtn')?.addEventListener('click', () => {
        alert('skct와 동일한 위치에 존재하는 기능 없는 버튼입니다');
    });

    /* --- Window Popup Mode Logic --- */
    function launchPopupMode() {
        const popupUrl = window.location.href;
        const { width, height, left, top } = buildPopupWindowMetrics(remotePopupLayout.window);
        const popupParams = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,directories=no`;
        const newWin = window.open(popupUrl, 'skct_popup_mode', popupParams);

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

    if (window.name === 'skct_popup_mode') {
        if (popupBtn) popupBtn.style.display = 'none';
        if (popupToggle) popupToggle.style.display = 'none';
    }

});
