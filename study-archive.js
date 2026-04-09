import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    setPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "REDACTED_FIREBASE_WEB_API_KEY",
    authDomain: "skct-tool.firebaseapp.com",
    databaseURL: "https://skct-tool-default-rtdb.firebaseio.com",
    projectId: "skct-tool",
    storageBucket: "skct-tool.firebasestorage.app",
    messagingSenderId: "1098212167923",
    appId: "1:1098212167923:web:cfe9f159f5f8820e84e786",
    measurementId: "G-F00PXNPBJ5"
};

const FIREBASE_RTDB_BASE_URL = firebaseConfig.databaseURL;
const ADVANCED_LICENSE_STORAGE_KEY = 'skct_advanced_license_bundle';
const DEFAULT_MANUAL_SUBSCRIPTION_CONFIG = {
    licensePublicKeyPem: ''
};
const STORAGE_TYPES = ['문제+AI 응답', '문제 원문', 'AI 응답', '복기 메모'];
const SUBJECT_KEYWORDS = ['언어이해', '자료해석', '창의수리', '언어추리', '수열추리', '실행역량', '복합'];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
let remoteManualSubscriptionConfig = DEFAULT_MANUAL_SUBSCRIPTION_CONFIG;
let remoteSiteTextConfig = window.SKCTSiteTextConfig?.normalizeSiteTextConfig?.({}) || {};
let verifiedAdvancedLicenseBundle = null;

const state = {
    authMode: 'login',
    items: [],
    selectedId: '',
    editingId: '',
    tagFilters: new Set(),
    unsubscribe: null,
    currentUser: null
};

const accessGate = document.getElementById('archiveAccessGate');
const accessGateTitle = document.getElementById('archiveAccessGateTitle');
const accessGateBody = document.getElementById('archiveAccessGateBody');
const accessGateStatus = document.getElementById('archiveAccessGateStatus');
const accessGuideLink = document.getElementById('archiveAccessGuideLink');
const archiveHeroEyebrow = document.getElementById('archiveHeroEyebrow');
const archiveHeroTitle = document.getElementById('archiveHeroTitle');
const archiveHeroCopy = document.getElementById('archiveHeroCopy');
const archiveBackButton = document.getElementById('archiveBackButton');
const authPanel = document.getElementById('archiveAuthPanel');
const workspace = document.getElementById('archiveWorkspace');
const authLoginTab = document.getElementById('authLoginTab');
const authRegisterTab = document.getElementById('authRegisterTab');
const authTitle = document.getElementById('authTitle');
const authDescription = document.getElementById('authDescription');
const authEmailLabel = document.getElementById('authEmailLabel');
const authPasswordLabel = document.getElementById('authPasswordLabel');
const authEmailInput = document.getElementById('authEmailInput');
const authPasswordInput = document.getElementById('authPasswordInput');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authStatus = document.getElementById('authStatus');
const archiveAuthFootnote = document.getElementById('archiveAuthFootnote');
const authLogoutBtn = document.getElementById('authLogoutBtn');
const currentUserBadge = document.getElementById('currentUserBadge');
const archiveWorkspaceTitle = document.getElementById('archiveWorkspaceTitle');
const archiveWorkspaceCopy = document.getElementById('archiveWorkspaceCopy');
const entryFormTitle = document.getElementById('entryFormTitle');
const entryTitleInput = document.getElementById('entryTitleInput');
const entryOrganizerInput = document.getElementById('entryOrganizerInput');
const entryRoundInput = document.getElementById('entryRoundInput');
const entrySubjectInput = document.getElementById('entrySubjectInput');
const entryStorageTypeSelect = document.getElementById('entryStorageTypeSelect');
const entryProblemFormatInput = document.getElementById('entryProblemFormatInput');
const entryTagsInput = document.getElementById('entryTagsInput');
const entryRawTextInput = document.getElementById('entryRawTextInput');
const entryAiResponseInput = document.getElementById('entryAiResponseInput');
const autoTagPreview = document.getElementById('autoTagPreview');
const entrySaveBtn = document.getElementById('entrySaveBtn');
const entryDeleteBtn = document.getElementById('entryDeleteBtn');
const entryFormStatus = document.getElementById('entryFormStatus');
const entryFormResetBtn = document.getElementById('entryFormResetBtn');
const filterSearchInput = document.getElementById('filterSearchInput');
const filterSubjectSelect = document.getElementById('filterSubjectSelect');
const filterStorageTypeSelect = document.getElementById('filterStorageTypeSelect');
const filterRoundInput = document.getElementById('filterRoundInput');
const tagFilterList = document.getElementById('tagFilterList');
const clearTagFiltersBtn = document.getElementById('clearTagFiltersBtn');
const entryList = document.getElementById('entryList');
const entryListEmpty = document.getElementById('entryListEmpty');
const entryCountBadge = document.getElementById('entryCountBadge');
const detailEmpty = document.getElementById('detailEmpty');
const detailView = document.getElementById('detailView');
const detailTitle = document.getElementById('detailTitle');
const detailMeta = document.getElementById('detailMeta');
const detailTags = document.getElementById('detailTags');
const detailRawText = document.getElementById('detailRawText');
const detailAiResponse = document.getElementById('detailAiResponse');
const detailEditBtn = document.getElementById('detailEditBtn');

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
}

function readSiteText(path, fallback = '', tokens = {}) {
    const api = window.SKCTSiteTextConfig;
    let value = api?.getValueByPath?.(remoteSiteTextConfig, path);
    if ((value == null || value === '') && api?.DEFAULT_SITE_TEXT_CONFIG) {
        value = api.getValueByPath(api.DEFAULT_SITE_TEXT_CONFIG, path);
    }
    const baseText = value == null || value === '' ? fallback : String(value);
    return baseText.replace(/\{(\w+)\}/g, (_, token) => (Object.prototype.hasOwnProperty.call(tokens, token) ? String(tokens[token]) : `{${token}}`));
}

function formatConfiguredHtml(value) {
    if (window.SKCTSiteTextConfig?.sanitizeHtml) {
        return window.SKCTSiteTextConfig.sanitizeHtml(value, { multiline: true });
    }
    return String(value ?? '');
}

function setElementText(element, value) {
    if (!element) return;
    element.textContent = value;
}

function setElementHtml(element, value) {
    if (!element) return;
    element.innerHTML = formatConfiguredHtml(value);
}

function applyArchiveStaticText() {
    document.title = readSiteText('archivePage.metaTitle', document.title);
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', readSiteText('archivePage.metaDescription', metaDescription.getAttribute('content') || ''));
    }
    setElementText(archiveHeroEyebrow, readSiteText('archivePage.heroEyebrow', 'Advanced Study Library'));
    setElementText(archiveHeroTitle, readSiteText('archivePage.heroTitle', '개인 학습자료 보관함'));
    setElementHtml(archiveHeroCopy, readSiteText('archivePage.heroCopyHtml', '고급 모드 이용자 전용 보관함입니다. 자료보관함 로그인 후 문제 원문, AI 응답, 복기 메모를 계정별로 분리해 저장하고 다시 꺼내 볼 수 있습니다.'));
    setElementText(archiveBackButton, readSiteText('archivePage.backButton', '메인 연습 도구로 돌아가기'));
    setElementText(accessGateTitle, readSiteText('archivePage.gateTitle', '고급 모드 확인이 먼저 필요합니다'));
    setElementHtml(accessGateBody, readSiteText('archivePage.gateBodyHtml', '이 페이지는 <strong>고급 모드 전용</strong>입니다. 메인 화면의 <strong>고급 안내</strong>에서 승인된 신청 이메일 또는 로그인 ID로 라이선스를 먼저 확인한 뒤 다시 들어와 주세요.'));
    setElementText(accessGuideLink, readSiteText('archivePage.gateButton', '고급 안내로 돌아가기'));
    setElementText(authLoginTab, readSiteText('archivePage.authLoginTab', '로그인'));
    setElementText(authRegisterTab, readSiteText('archivePage.authRegisterTab', '회원가입'));
    setElementText(authEmailLabel, readSiteText('archivePage.authEmailLabel', '이메일'));
    setElementText(authPasswordLabel, readSiteText('archivePage.authPasswordLabel', '비밀번호'));
    if (authEmailInput) authEmailInput.placeholder = readSiteText('archivePage.authEmailPlaceholder', 'example@email.com');
    if (authPasswordInput) authPasswordInput.placeholder = readSiteText('archivePage.authPasswordPlaceholder', '비밀번호 6자 이상');
    setElementHtml(archiveAuthFootnote, readSiteText('archivePage.authFootnoteHtml', '세션은 브라우저를 닫으면 종료됩니다. 일반 모드에서는 이 페이지를 사용할 수 없고, 고급 라이선스 확인 후에만 로그인 화면이 열립니다.'));
    setElementText(archiveWorkspaceTitle, readSiteText('archivePage.workspaceTitle', '내 보관함 작업 공간'));
    setElementHtml(archiveWorkspaceCopy, readSiteText('archivePage.workspaceCopyHtml', '입력 폼에서 저장하고, 오른쪽 목록에서 필터링하며, 상세 패널에서 복기 내용을 바로 확인합니다.'));
    setElementText(authLogoutBtn, readSiteText('archivePage.logoutButton', '로그아웃'));
}

function setStatus(target, message = '', tone = 'muted') {
    if (!target) return;
    target.textContent = message;
    target.style.color = tone === 'error'
        ? '#b91c1c'
        : tone === 'success'
            ? '#0f766e'
            : '#475569';
}

function normalizeManualSubscriptionConfig(raw) {
    return {
        licensePublicKeyPem: String(raw?.licensePublicKeyPem || '').trim()
    };
}

function readStoredAdvancedLicenseBundle() {
    try {
        return JSON.parse(localStorage.getItem(ADVANCED_LICENSE_STORAGE_KEY) || 'null');
    } catch (error) {
        return null;
    }
}

function clearArchiveSubscription() {
    if (state.unsubscribe) {
        state.unsubscribe();
        state.unsubscribe = null;
    }
}

function resetArchiveDataState() {
    state.items = [];
    state.selectedId = '';
    state.editingId = '';
    state.tagFilters.clear();
    clearArchiveSubscription();
    renderFilterOptions();
    renderTagFilters();
    renderEntryList();
    renderDetail();
    resetForm();
}

async function verifyAdvancedLicenseBundle(bundle) {
    if (!bundle || !remoteManualSubscriptionConfig.licensePublicKeyPem || !window.SKCTSubscriptionCrypto?.verifyLicenseBundle) {
        return null;
    }
    try {
        const verified = await window.SKCTSubscriptionCrypto.verifyLicenseBundle(bundle, remoteManualSubscriptionConfig.licensePublicKeyPem);
        if (!verified) return null;
        const payloadStatus = String(bundle?.payload?.status || '').trim().toLowerCase();
        if (payloadStatus && payloadStatus !== 'active') return null;
        const expiryTime = Date.parse(bundle?.payload?.expiresAt || '');
        if (Number.isFinite(expiryTime) && expiryTime < Date.now()) return null;
        return bundle;
    } catch (error) {
        return null;
    }
}

async function loadArchiveRemoteConfig() {
    try {
        const response = await fetch(`${FIREBASE_RTDB_BASE_URL}/config.json`);
        if (response.ok) {
            const config = await response.json();
            remoteManualSubscriptionConfig = normalizeManualSubscriptionConfig(config?.manualSubscriptionConfig || {});
            if (window.SKCTSiteTextConfig?.normalizeSiteTextConfig) {
                remoteSiteTextConfig = window.SKCTSiteTextConfig.normalizeSiteTextConfig(config?.siteTextConfig || {});
            }
        } else {
            remoteManualSubscriptionConfig = normalizeManualSubscriptionConfig({});
        }
    } catch (error) {
        remoteManualSubscriptionConfig = normalizeManualSubscriptionConfig({});
    }
    applyArchiveStaticText();
}

async function hydrateArchiveAdvancedAccess() {
    setStatus(accessGateStatus, readSiteText('messages.archiveAccessChecking', '이 브라우저의 고급 라이선스를 확인하는 중입니다.'));
    const storedBundle = readStoredAdvancedLicenseBundle();
    verifiedAdvancedLicenseBundle = await verifyAdvancedLicenseBundle(storedBundle);
    if (!verifiedAdvancedLicenseBundle && storedBundle) {
        localStorage.removeItem(ADVANCED_LICENSE_STORAGE_KEY);
    }
}

function syncArchiveAccessView() {
    const hasAdvancedAccess = Boolean(verifiedAdvancedLicenseBundle);
    const hasUser = Boolean(state.currentUser);
    accessGate?.classList.toggle('hidden', hasAdvancedAccess);
    authPanel?.classList.toggle('hidden', !hasAdvancedAccess || hasUser);
    workspace?.classList.toggle('hidden', !hasAdvancedAccess || !hasUser);

    if (!hasAdvancedAccess) {
        setStatus(accessGateStatus, readSiteText('messages.archiveAccessDenied', '자료 보관함은 고급 모드 전용입니다. 메인 화면의 고급 안내에서 승인된 신청 이메일 또는 로그인 ID로 고급 모드를 먼저 열어주세요.'), 'error');
        resetArchiveDataState();
        return;
    }

    setStatus(accessGateStatus, '');
    if (!hasUser) {
        clearArchiveSubscription();
        currentUserBadge.textContent = readSiteText('messages.archiveGuestLabel', '로그인이 필요합니다.');
        state.items = [];
        state.selectedId = '';
        state.tagFilters.clear();
        renderFilterOptions();
        renderTagFilters();
        renderEntryList();
        renderDetail();
        return;
    }

    currentUserBadge.textContent = `${state.currentUser.email || readSiteText('messages.archiveGuestLabel', '로그인이 필요합니다.')} · ${readSiteText('messages.archiveSessionSuffix', '세션 로그인')}`;
}

function formatDateTime(value) {
    if (!Number.isFinite(value)) return '-';
    return new Date(value).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function normalizeTagText(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function detectRound(text) {
    const match = String(text || '').match(/(\d{1,3})\s*회(?:차)?/);
    return match ? `${match[1]}회차` : '';
}

function detectDifficulty(text) {
    const source = String(text || '');
    if (/최상|매우 어려움|상/.test(source)) return '상';
    if (/하|쉬움|쉬운/.test(source)) return '하';
    if (/중/.test(source)) return '중';
    return '';
}

function detectSubject(text) {
    return SUBJECT_KEYWORDS.find((keyword) => String(text || '').includes(keyword)) || '';
}

function detectQuestionCount(text) {
    const matches = Array.from(String(text || '').matchAll(/(?:^|\n)\s*(\d{1,3})[\.\)]/g)).map((match) => Number(match[1]));
    if (!matches.length) return 0;
    return new Set(matches).size;
}

function buildAutoTags(values) {
    const source = `${values.title}\n${values.organizer}\n${values.roundLabel}\n${values.subject}\n${values.problemFormat}\n${values.rawText}\n${values.aiResponse}`;
    const tags = new Set();

    if (values.storageType) tags.add(values.storageType);
    if (values.organizer) tags.add(values.organizer);
    if (values.subject) tags.add(values.subject);
    if (values.roundLabel) tags.add(values.roundLabel);
    if (values.problemFormat) tags.add(values.problemFormat);

    const detectedSubject = detectSubject(source);
    if (detectedSubject) tags.add(detectedSubject);

    const detectedRound = detectRound(source);
    if (detectedRound) tags.add(detectedRound);

    const difficulty = detectDifficulty(source);
    if (difficulty) tags.add(`난이도-${difficulty}`);

    const questionCount = detectQuestionCount(values.rawText);
    if (questionCount > 0) tags.add(`문항-${questionCount}`);

    return {
        autoTags: Array.from(tags),
        detectedDifficulty: difficulty,
        questionCount
    };
}

function collectFormValues() {
    return {
        title: entryTitleInput.value.trim(),
        organizer: entryOrganizerInput.value.trim(),
        roundLabel: entryRoundInput.value.trim(),
        subject: entrySubjectInput.value.trim(),
        storageType: entryStorageTypeSelect.value,
        problemFormat: entryProblemFormatInput.value.trim(),
        manualTags: normalizeTagText(entryTagsInput.value),
        rawText: entryRawTextInput.value.trim(),
        aiResponse: entryAiResponseInput.value.trim()
    };
}

function resetForm() {
    state.editingId = '';
    entryFormTitle.textContent = '새 자료 저장';
    entryTitleInput.value = '';
    entryOrganizerInput.value = '';
    entryRoundInput.value = '';
    entrySubjectInput.value = '';
    entryStorageTypeSelect.value = STORAGE_TYPES[0];
    entryProblemFormatInput.value = '';
    entryTagsInput.value = '';
    entryRawTextInput.value = '';
    entryAiResponseInput.value = '';
    entryDeleteBtn.classList.add('hidden');
    renderAutoTagPreview();
    setStatus(entryFormStatus, '');
}

function renderAutoTagPreview() {
    const values = collectFormValues();
    const { autoTags, detectedDifficulty, questionCount } = buildAutoTags(values);
    const chips = [...new Set([...values.manualTags, ...autoTags])];
    if (!chips.length) {
        autoTagPreview.innerHTML = '<span class="tag-chip muted">아직 자동 태그가 없습니다.</span>';
        return;
    }
    const extraInfo = [];
    if (detectedDifficulty) extraInfo.push(`난이도 ${detectedDifficulty}`);
    if (questionCount > 0) extraInfo.push(`문항 수 ${questionCount}`);
    autoTagPreview.innerHTML = chips.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('') +
        (extraInfo.length ? ` <span class="tag-chip">${escapeHtml(extraInfo.join(' · '))}</span>` : '');
}

function buildEntryPayload() {
    const values = collectFormValues();
    if (!values.title) throw new Error('자료 제목을 입력해주세요.');
    if (!values.rawText && !values.aiResponse) throw new Error('문제 원문 또는 AI 응답 중 하나는 입력해주세요.');

    const { autoTags, detectedDifficulty, questionCount } = buildAutoTags(values);
    const mergedTags = Array.from(new Set([...values.manualTags, ...autoTags]));
    const now = Date.now();
    const current = state.items.find((item) => item.id === state.editingId);

    return {
        ...values,
        autoTags,
        mergedTags,
        detectedDifficulty,
        questionCount,
        summary: (values.rawText || values.aiResponse).slice(0, 200),
        ownerEmail: state.currentUser?.email || '',
        createdAt: current?.createdAt || now,
        updatedAt: now
    };
}

function getUserItemsPath(uid = state.currentUser?.uid) {
    return `userStudyLibrary/${uid}/items`;
}

function describeAuthError(error, mode) {
    const code = String(error?.code || '');
    if (code === 'auth/invalid-credential') return readSiteText('messages.archiveAuthInvalidCredential', '이메일 또는 비밀번호를 다시 확인해주세요.');
    if (code === 'auth/email-already-in-use') return readSiteText('messages.archiveAuthEmailInUse', '이미 사용 중인 이메일입니다. 로그인으로 전환하거나 다른 이메일을 사용해주세요.');
    if (code === 'auth/weak-password') return readSiteText('messages.archiveAuthWeakPassword', '비밀번호는 6자 이상으로 설정해주세요.');
    if (code === 'auth/operation-not-allowed') return readSiteText('messages.archiveAuthOperationNotAllowed', '현재 Firebase에서 이메일/비밀번호 가입이 비활성화되어 있습니다. 관리자 설정을 확인해주세요.');
    if (mode === 'register') return readSiteText('messages.archiveAuthRegisterError', '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    return readSiteText('messages.archiveAuthLoginError', '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}

function setAuthMode(mode) {
    state.authMode = mode;
    document.querySelectorAll('[data-auth-mode]').forEach((button) => {
        button.classList.toggle('active', button.dataset.authMode === mode);
    });
    authTitle.textContent = mode === 'register'
        ? readSiteText('archivePage.authRegisterTitle', '자료보관함 계정 만들기')
        : readSiteText('archivePage.authLoginTitle', '내 자료에 로그인');
    authDescription.innerHTML = formatConfiguredHtml(
        mode === 'register'
            ? readSiteText('archivePage.authRegisterDescription', '처음이라면 이메일/비밀번호 계정을 만들고, 같은 계정으로만 내 자료를 읽고 수정할 수 있습니다.')
            : readSiteText('archivePage.authLoginDescription', '고급 모드가 확인된 뒤에는 자료보관함 전용 계정으로 로그인해야 자기 자료를 읽고 수정할 수 있습니다.')
    );
    authSubmitBtn.textContent = mode === 'register'
        ? readSiteText('archivePage.authRegisterButton', '회원가입 후 시작')
        : readSiteText('archivePage.authLoginButton', '로그인');
    authPasswordInput.setAttribute('autocomplete', mode === 'register' ? 'new-password' : 'current-password');
    setStatus(authStatus, '');
}

async function handleAuthSubmit() {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    if (!email || !password) {
        setStatus(authStatus, readSiteText('messages.archiveAuthRequired', '이메일과 비밀번호를 모두 입력해주세요.'), 'error');
        return;
    }
    authSubmitBtn.disabled = true;
    setStatus(
        authStatus,
        state.authMode === 'register'
            ? readSiteText('messages.archiveAuthRegistering', '계정을 만드는 중입니다...')
            : readSiteText('messages.archiveAuthLoggingIn', '로그인하는 중입니다...')
    );
    try {
        if (state.authMode === 'register') {
            await createUserWithEmailAndPassword(auth, email, password);
            setStatus(authStatus, readSiteText('messages.archiveAuthRegisterSuccess', '계정을 만들고 로그인했습니다. 이제 자료를 저장할 수 있습니다.'), 'success');
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            setStatus(authStatus, readSiteText('messages.archiveAuthLoginSuccess', '로그인했습니다.'), 'success');
        }
        authPasswordInput.value = '';
    } catch (error) {
        setStatus(authStatus, describeAuthError(error, state.authMode), 'error');
    } finally {
        authSubmitBtn.disabled = false;
    }
}

function getFilteredItems() {
    const search = filterSearchInput.value.trim().toLowerCase();
    const subject = filterSubjectSelect.value;
    const storageType = filterStorageTypeSelect.value;
    const roundKeyword = filterRoundInput.value.trim().toLowerCase();

    return state.items.filter((item) => {
        const haystack = `${item.title} ${item.organizer} ${item.roundLabel} ${item.subject} ${item.problemFormat} ${item.rawText} ${item.aiResponse} ${item.mergedTags?.join(' ') || ''}`.toLowerCase();
        const matchesSearch = !search || haystack.includes(search);
        const matchesSubject = !subject || item.subject === subject;
        const matchesStorageType = !storageType || item.storageType === storageType;
        const matchesRound = !roundKeyword || String(item.roundLabel || '').toLowerCase().includes(roundKeyword);
        const matchesTags = !state.tagFilters.size || Array.from(state.tagFilters).every((tag) => item.mergedTags?.includes(tag));
        return matchesSearch && matchesSubject && matchesStorageType && matchesRound && matchesTags;
    });
}

function renderFilterOptions() {
    const subjectSet = new Set(SUBJECT_KEYWORDS);
    const storageTypeSet = new Set(STORAGE_TYPES);
    state.items.forEach((item) => {
        if (item.subject) subjectSet.add(item.subject);
        if (item.storageType) storageTypeSet.add(item.storageType);
    });

    const currentSubject = filterSubjectSelect.value;
    filterSubjectSelect.innerHTML = `<option value="">전체</option>${Array.from(subjectSet).filter(Boolean).map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`;
    if (currentSubject && Array.from(filterSubjectSelect.options).some((option) => option.value === currentSubject)) {
        filterSubjectSelect.value = currentSubject;
    }

    const currentStorageType = filterStorageTypeSelect.value;
    filterStorageTypeSelect.innerHTML = `<option value="">전체</option>${Array.from(storageTypeSet).filter(Boolean).map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`;
    if (currentStorageType && Array.from(filterStorageTypeSelect.options).some((option) => option.value === currentStorageType)) {
        filterStorageTypeSelect.value = currentStorageType;
    }
}

function renderTagFilters() {
    const tags = Array.from(new Set(state.items.flatMap((item) => item.mergedTags || []))).sort((a, b) => a.localeCompare(b, 'ko'));
    const validTagSet = new Set(tags);
    Array.from(state.tagFilters).forEach((tag) => {
        if (!validTagSet.has(tag)) {
            state.tagFilters.delete(tag);
        }
    });
    if (!tags.length) {
        tagFilterList.innerHTML = '<span class="tag-chip muted">태그가 생기면 여기에 체크 필터가 표시됩니다.</span>';
        return;
    }
    tagFilterList.innerHTML = tags.map((tag) => `
        <label class="tag-filter-pill">
            <input type="checkbox" value="${escapeHtml(tag)}" ${state.tagFilters.has(tag) ? 'checked' : ''}>
            <span>${escapeHtml(tag)}</span>
        </label>
    `).join('');
    tagFilterList.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.addEventListener('change', () => {
            if (input.checked) {
                state.tagFilters.add(input.value);
            } else {
                state.tagFilters.delete(input.value);
            }
            renderEntryList();
        });
    });
}

function renderEntryList() {
    const filtered = getFilteredItems();
    if (!filtered.some((item) => item.id === state.selectedId)) {
        state.selectedId = filtered[0]?.id || '';
    }
    entryCountBadge.textContent = `${filtered.length}건`;
    entryListEmpty.classList.toggle('hidden', filtered.length > 0);
    entryList.innerHTML = filtered.map((item) => `
        <article class="entry-card ${item.id === state.selectedId ? 'active' : ''}" data-entry-id="${escapeHtml(item.id)}">
            <div class="entry-card-top">
                <div>
                    <h4 class="entry-card-title">${escapeHtml(item.title || '제목 없음')}</h4>
                    <div class="entry-card-meta">${escapeHtml(item.subject || '과목 미지정')} · ${escapeHtml(item.roundLabel || '회차 미지정')} · ${escapeHtml(item.storageType || '-')}</div>
                </div>
                <div class="entry-card-meta">${escapeHtml(formatDateTime(item.updatedAt))}</div>
            </div>
            <div class="tag-chip-wrap">
                ${(item.mergedTags || []).slice(0, 5).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <p class="entry-card-summary">${escapeHtml(item.summary || '')}</p>
        </article>
    `).join('');

    entryList.querySelectorAll('[data-entry-id]').forEach((card) => {
        card.addEventListener('click', () => {
            state.selectedId = card.dataset.entryId;
            renderEntryList();
            renderDetail();
        });
    });
    renderDetail();
}

function renderDetail() {
    const item = state.items.find((entry) => entry.id === state.selectedId);
    detailEmpty.classList.toggle('hidden', Boolean(item));
    detailView.classList.toggle('hidden', !item);
    if (!item) return;

    detailTitle.textContent = item.title || '제목 없음';
    detailMeta.textContent = `${item.organizer || '주관사 미지정'} · ${item.subject || '과목 미지정'} · ${item.roundLabel || '회차 미지정'} · ${item.storageType || '-'} · 수정 ${formatDateTime(item.updatedAt)}`;
    detailTags.innerHTML = (item.mergedTags || []).length
        ? (item.mergedTags || []).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('')
        : '<span class="tag-chip muted">태그 없음</span>';
    detailRawText.textContent = item.rawText || '저장된 문제 원문이 없습니다.';
    detailAiResponse.textContent = item.aiResponse || '저장된 AI 응답이 없습니다.';
}

function populateFormFromItem(itemId) {
    const item = state.items.find((entry) => entry.id === itemId);
    if (!item) return;
    state.editingId = item.id;
    state.selectedId = item.id;
    entryFormTitle.textContent = '선택 자료 수정';
    entryTitleInput.value = item.title || '';
    entryOrganizerInput.value = item.organizer || '';
    entryRoundInput.value = item.roundLabel || '';
    entrySubjectInput.value = item.subject || '';
    entryStorageTypeSelect.value = item.storageType || STORAGE_TYPES[0];
    entryProblemFormatInput.value = item.problemFormat || '';
    entryTagsInput.value = (item.manualTags || []).join(', ');
    entryRawTextInput.value = item.rawText || '';
    entryAiResponseInput.value = item.aiResponse || '';
    entryDeleteBtn.classList.remove('hidden');
    renderAutoTagPreview();
    renderEntryList();
    setStatus(entryFormStatus, '선택 자료를 폼으로 불러왔습니다. 수정 후 다시 저장하세요.');
    entryTitleInput.focus();
}

async function saveEntry() {
    if (!state.currentUser) {
        setStatus(entryFormStatus, '먼저 로그인해주세요.', 'error');
        return;
    }
    entrySaveBtn.disabled = true;
    setStatus(entryFormStatus, '자료를 저장하는 중입니다...');
    try {
        const payload = buildEntryPayload();
        const basePath = getUserItemsPath();
        const entryId = state.editingId || push(ref(db, basePath)).key;
        await set(ref(db, `${basePath}/${entryId}`), payload);
        state.selectedId = entryId;
        state.editingId = entryId;
        entryDeleteBtn.classList.remove('hidden');
        setStatus(entryFormStatus, '자료를 저장했습니다.', 'success');
    } catch (error) {
        setStatus(entryFormStatus, error.message || '자료 저장 중 오류가 발생했습니다.', 'error');
    } finally {
        entrySaveBtn.disabled = false;
    }
}

async function deleteEditingEntry() {
    if (!state.currentUser || !state.editingId) return;
    const confirmed = window.confirm('현재 선택한 자료를 삭제할까요? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmed) return;
    entryDeleteBtn.disabled = true;
    setStatus(entryFormStatus, '자료를 삭제하는 중입니다...');
    try {
        await remove(ref(db, `${getUserItemsPath()}/${state.editingId}`));
        setStatus(entryFormStatus, '자료를 삭제했습니다.', 'success');
        resetForm();
    } catch (error) {
        setStatus(entryFormStatus, error.message || '자료 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
        entryDeleteBtn.disabled = false;
    }
}

function subscribeUserItems(uid) {
    if (state.unsubscribe) {
        state.unsubscribe();
        state.unsubscribe = null;
    }
    state.unsubscribe = onValue(ref(db, getUserItemsPath(uid)), (snapshot) => {
        const nextItems = [];
        snapshot.forEach((child) => {
            nextItems.push({ id: child.key, ...child.val() });
        });
        nextItems.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        state.items = nextItems;
        renderFilterOptions();
        renderTagFilters();
        renderEntryList();
    });
}

async function handleLogout() {
    await signOut(auth);
}

async function init() {
    await setPersistence(auth, browserSessionPersistence);
    await loadArchiveRemoteConfig();
    await hydrateArchiveAdvancedAccess();

    document.querySelectorAll('[data-auth-mode]').forEach((button) => {
        button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
    });

    authSubmitBtn.addEventListener('click', handleAuthSubmit);
    authPasswordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAuthSubmit();
        }
    });
    authLogoutBtn.addEventListener('click', handleLogout);

    [entryTitleInput, entryOrganizerInput, entryRoundInput, entrySubjectInput, entryProblemFormatInput, entryTagsInput, entryRawTextInput, entryAiResponseInput].forEach((element) => {
        element.addEventListener('input', renderAutoTagPreview);
    });
    entryStorageTypeSelect.addEventListener('change', renderAutoTagPreview);
    entrySaveBtn.addEventListener('click', saveEntry);
    entryDeleteBtn.addEventListener('click', deleteEditingEntry);
    entryFormResetBtn.addEventListener('click', resetForm);
    detailEditBtn.addEventListener('click', () => populateFormFromItem(state.selectedId));

    [filterSearchInput, filterSubjectSelect, filterStorageTypeSelect, filterRoundInput].forEach((element) => {
        element.addEventListener('input', renderEntryList);
        element.addEventListener('change', renderEntryList);
    });
    clearTagFiltersBtn.addEventListener('click', () => {
        state.tagFilters.clear();
        renderTagFilters();
        renderEntryList();
    });

    renderFilterOptions();
    renderAutoTagPreview();
    setAuthMode('login');
    syncArchiveAccessView();

    onAuthStateChanged(auth, (user) => {
        state.currentUser = user;
        if (!user) {
            resetArchiveDataState();
            currentUserBadge.textContent = readSiteText('messages.archiveGuestLabel', '로그인이 필요합니다.');
            syncArchiveAccessView();
            return;
        }
        if (verifiedAdvancedLicenseBundle) {
            subscribeUserItems(user.uid);
            resetForm();
        } else {
            clearArchiveSubscription();
        }
        syncArchiveAccessView();
    });
}

void init();
