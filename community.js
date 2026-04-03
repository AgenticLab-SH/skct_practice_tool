// ============================================================
// SKCT Tool Community System v2 - DCInside Style (ES Module)
// ============================================================
import { getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, push, set, get, update, onValue, off, runTransaction
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const db = getDatabase(getApp());

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
const sessionId = localStorage.getItem('skct_sid') || (() => {
    const id = 'S' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('skct_sid', id);
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
function getSavedNick() { return localStorage.getItem('skct_cm_nick') || ''; }
function saveNick(n) { localStorage.setItem('skct_cm_nick', n); }

// ── Firebase Config (One-shot fetch) ──
async function listenConfig() {
    try {
        const snap = await get(ref(db, 'config'));
        if (!snap.exists()) return;
        const cfg = snap.val();
        if (cfg.notice) renderNotice(cfg.notice);
        else { const el = document.getElementById('cmNotice'); if (el) el.innerHTML = ''; }
        if (cfg.popularConfig) popularConfig = cfg.popularConfig;
        if (cfg.adminHash) adminHash = cfg.adminHash;
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
    el.innerHTML = `<div class="cm-notice" style="background:${s.bg};border:1px solid ${s.br};border-left:4px solid ${s.br};">
        <div style="font-weight:bold;color:#1e293b;margin-bottom:4px;">${s.ic} ${data.title||'공지'}</div>
        <div style="color:#475569;line-height:1.5;font-size:13px;">${(data.message||'').replace(/\n/g,'<br>')}</div>
        ${data.updated?`<div style="font-size:11px;color:#94a3b8;margin-top:6px;text-align:right;">📅 ${data.updated}</div>`:''}
    </div>`;
}

// ── Posts CRUD (DC-style: nickname + password per post) ──
async function createPost(category, nickname, password, content) {
    if (!WRITABLE_TABS.includes(category)) return;
    if (!nickname || !password || !content.trim()) { alert('닉네임, 비밀번호, 내용을 모두 입력해주세요.'); return; }
    if (content.length > 1000) { alert('1000자 이내로 작성해주세요.'); return; }
    const lastPost = parseInt(localStorage.getItem('skct_last_post') || '0');
    if (Date.now() - lastPost < 30000) { alert('30초 후에 다시 작성할 수 있습니다.'); return; }
    saveNick(nickname);
    await set(push(ref(db, 'posts')), {
        category, nickname, passwordHash: await sha256(password),
        content: content.trim(), timestamp: Date.now(),
        likes: 0, replyCount: 0, deleted: false, pinned: false
    });
    localStorage.setItem('skct_last_post', Date.now());
    await loadPostsOnce();
}

async function editPost(pid, newContent, password) {
    const p = allPosts[pid]; if (!p) return false;
    if (!isAdmin && (await sha256(password)) !== p.passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return false; }
    await update(ref(db, `posts/${pid}`), { content: newContent.trim(), editedAt: Date.now() });
    await loadPostsOnce();
    return true;
}

async function softDeletePost(pid, password) {
    const p = allPosts[pid]; if (!p) return;
    if (!isAdmin && (await sha256(password)) !== p.passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return; }
    await update(ref(db, `posts/${pid}`), { deleted: true, deletedAt: Date.now() });
    await loadPostsOnce();
}

async function toggleLike(pid) {
    const p = allPosts[pid]; if (!p) return;
    const likedRef = ref(db, `userLikes/${sessionId}/${pid}`);
    const likesRef = ref(db, `posts/${pid}/likes`);
    
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
    if (!nickname || !password || !content.trim()) { alert('닉네임, 비밀번호, 내용을 모두 입력해주세요.'); return; }
    saveNick(nickname);
    await set(push(ref(db, `replies/${pid}`)), {
        nickname, passwordHash: await sha256(password), content: content.trim(),
        timestamp: Date.now(), isAdmin: false, pinned: false, deleted: false
    });
    await runTransaction(ref(db, `posts/${pid}/replyCount`), c => (c||0)+1);
    delete replyCache[pid];
}

async function editReply(pid, rid, newContent, password) {
    const s = await get(ref(db, `replies/${pid}/${rid}`)); if (!s.exists()) return false;
    if (!isAdmin && (await sha256(password)) !== s.val().passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return false; }
    await update(ref(db, `replies/${pid}/${rid}`), { content: newContent.trim(), editedAt: Date.now() }); 
    delete replyCache[pid]; return true;
}

async function softDeleteReply(pid, rid, password) {
    const s = await get(ref(db, `replies/${pid}/${rid}`)); if (!s.exists()) return;
    if (!isAdmin && (await sha256(password)) !== s.val().passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return; }
    await update(ref(db, `replies/${pid}/${rid}`), { deleted: true, deletedAt: Date.now() });
    await runTransaction(ref(db, `posts/${pid}/replyCount`), c => Math.max((c||0)-1, 0));
    delete replyCache[pid];
}

// ── Admin ──
async function adminLogin(code) {
    if (!adminHash) { alert('Firebase Console에서 config/adminHash를 설정하세요.'); return; }
    if ((await sha256(code)) !== adminHash) { alert('관리자 코드가 틀립니다.'); return; }
    isAdmin = true; alert('✅ 관리자 모드!'); renderTab();
}
async function adminMoveToFaq(pid) { if (!isAdmin) return; await update(ref(db, `posts/${pid}`), { category: 'faq' }); }
async function adminPinPost(pid) { if (!isAdmin) return; const s = await get(ref(db, `posts/${pid}/pinned`)); await update(ref(db, `posts/${pid}`), { pinned: !(s.val()||false) }); }
async function adminReply(pid, content) {
    if (!isAdmin || !content) return;
    await set(push(ref(db, `replies/${pid}`)), { nickname:'🛡️ 관리자', passwordHash:'', content, timestamp:Date.now(), isAdmin:true, pinned:true, deleted:false });
    await runTransaction(ref(db, `posts/${pid}/replyCount`), c => (c||0)+1);
    delete replyCache[pid];
}
async function adminPinReply(pid, rid) { if (!isAdmin) return; const s = await get(ref(db, `replies/${pid}/${rid}/pinned`)); await update(ref(db, `replies/${pid}/${rid}`), { pinned: !(s.val()||false) }); delete replyCache[pid]; }

// ── Data Loading ──
async function loadPostsOnce() {
    try {
        const snap = await get(ref(db, 'posts'));
        allPosts = {};
        if (snap.exists()) {
            snap.forEach(c => { const p = c.val(); p.id = c.key; allPosts[c.key] = p; });
        }
        
        // 내가 좋아요 누른 내역 조회
        const likesSnap = await get(ref(db, `userLikes/${sessionId}`));
        const userLikes = likesSnap.exists() ? likesSnap.val() : {};
        
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
    if (wf) wf.style.display = WRITABLE_TABS.includes(currentTab) ? 'flex' : 'none';
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
    const adm = isAdmin ? `<div class="cm-admin-acts"><button data-act="pin" data-id="${p.id}">📌</button>${p.category!=='faq'?`<button data-act="faq" data-id="${p.id}">→FAQ</button>`:''}<button data-act="areply" data-id="${p.id}">🛡️</button></div>` : '';

    return `<div class="cm-card ${p.pinned?'pinned':''}" data-pid="${p.id}">
        <div class="cm-card-head"><div class="cm-meta">${badges}<span class="cm-nick">${esc(p.nickname)}</span><span class="cm-time">${timeAgo(p.timestamp)}</span></div>${adm}</div>
        <div class="cm-body" id="cmBody_${p.id}">${esc(p.content).replace(/\n/g,'<br>')}</div>
        <div class="cm-foot"><div class="cm-stats">
            <button class="cm-like ${liked?'liked':''}" data-act="like" data-id="${p.id}">${liked?'❤️':'🤍'} <span>${p.likes||0}</span></button>
            <button class="cm-reply-toggle" data-act="replies" data-id="${p.id}">💬 <span>${p.replyCount||0}</span></button>
        </div><div class="cm-author-acts">
            <button class="cm-act-btn" data-act="edit" data-id="${p.id}">수정</button>
            <button class="cm-act-btn cm-del" data-act="del" data-id="${p.id}">삭제</button>
        </div></div>
        <div class="cm-replies ${expandedPost===p.id?'':'hidden'}" id="cmReplies_${p.id}"></div>
    </div>`;
}

function attachPostEvents() {
    document.querySelectorAll('#cmPostList [data-act]').forEach(btn => {
        btn.onclick = async e => {
            e.stopPropagation();
            const act = btn.dataset.act, id = btn.dataset.id;
            if (act === 'like') await toggleLike(id);
            else if (act === 'replies') await doToggleReplies(id);
            else if (act === 'edit') { const pw = prompt('비밀번호를 입력하세요:'); if (pw !== null) showEditForm(id, pw); }
            else if (act === 'del') { const pw = prompt('삭제하려면 비밀번호를 입력하세요:'); if (pw !== null) await softDeletePost(id, pw); }
            else if (act === 'pin') await adminPinPost(id);
            else if (act === 'faq') { if (confirm('FAQ로 이동?')) await adminMoveToFaq(id); }
            else if (act === 'areply') { const c = prompt('관리자 답글:'); if (c) { await adminReply(id, c); expandedPost = null; await doToggleReplies(id, true); } }
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
    const snap = await get(ref(db, `replies/${pid}`));
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
        const acts = (!r.isAdmin ? `<button data-ract="redit" data-pid="${pid}" data-rid="${r.id}">수정</button><button data-ract="rdel" data-pid="${pid}" data-rid="${r.id}">삭제</button>` : '') +
            (isAdmin && !r.isAdmin ? `<button data-ract="rpin" data-pid="${pid}" data-rid="${r.id}">${r.pinned ? '해제' : '📌'}</button>` : '');
        return `<div class="cm-reply ${r.isAdmin ? 'admin' : ''} ${r.pinned ? 'pinned' : ''}">
            <div class="cm-reply-meta">${r.isAdmin ? '<span class="cm-admin-badge">🛡️</span>' : ''}${r.pinned && !r.isAdmin ? '<span class="cm-badge pin">📌</span>' : ''}
                <span class="cm-nick">${esc(r.nickname)}</span><span class="cm-time">${timeAgo(r.timestamp)}</span>${r.editedAt ? '<span class="cm-badge edit">(수정됨)</span>' : ''}</div>
            <div class="cm-reply-body" id="cmRB_${r.id}">${esc(r.content).replace(/\n/g, '<br>')}</div>
            <div class="cm-reply-acts">${acts}</div></div>`;
    }).join('');

    // Reply write form (DC-style: nickname + password)
    html += `<div class="cm-reply-form">
        <div class="cm-reply-form-top"><input type="text" id="cmRN_${pid}" placeholder="닉네임" value="${esc(getSavedNick())}" maxlength="20"><input type="password" id="cmRP_${pid}" placeholder="비밀번호"></div>
        <div class="cm-reply-form-bot"><textarea id="cmRI_${pid}" placeholder="답글을 입력하세요..." rows="2"></textarea><button id="cmRS_${pid}" class="cm-reply-submit">등록</button></div>
    </div>`;
    section.innerHTML = html;

    // Reply submit
    document.getElementById(`cmRS_${pid}`).onclick = async () => {
        const nick = document.getElementById(`cmRN_${pid}`).value.trim();
        const pw = document.getElementById(`cmRP_${pid}`).value;
        const content = document.getElementById(`cmRI_${pid}`).value.trim();
        if (!nick || !pw || !content) { alert('닉네임, 비밀번호, 내용을 모두 입력하세요.'); return; }
        await createReply(pid, nick, pw, content);
        expandedPost = null; await doToggleReplies(pid);
    };

    // Reply edit/delete events
    section.querySelectorAll('[data-ract]').forEach(btn => {
        btn.onclick = async () => {
            const a = btn.dataset.ract, p = btn.dataset.pid, rid = btn.dataset.rid;
            if (a === 'redit') {
                const pw = prompt('비밀번호:');
                if (pw === null) return;
                const snap = await get(ref(db, `replies/${p}/${rid}`)); if (!snap.exists()) return;
                const r = snap.val();
                if (!isAdmin && (await sha256(pw)) !== r.passwordHash) { alert('비밀번호가 일치하지 않습니다.'); return; }
                const el = document.getElementById(`cmRB_${rid}`); if (!el) return;
                el.innerHTML = `<textarea class="cm-edit-ta" id="cmERI_${rid}">${esc(r.content)}</textarea><div class="cm-edit-acts"><button id="cmERS_${rid}">저장</button><button id="cmERC_${rid}">취소</button></div>`;
                document.getElementById(`cmERS_${rid}`).onclick = async () => { const v = document.getElementById(`cmERI_${rid}`).value.trim(); if (v) { await editReply(p, rid, v, pw); expandedPost = null; await doToggleReplies(p, true); } };
                document.getElementById(`cmERC_${rid}`).onclick = async () => { expandedPost = null; await doToggleReplies(p, true); };
            } else if (a === 'rdel') {
                const pw = prompt('비밀번호:'); if (pw === null) return;
                await softDeleteReply(p, rid, pw); expandedPost = null; await doToggleReplies(p, true);
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
