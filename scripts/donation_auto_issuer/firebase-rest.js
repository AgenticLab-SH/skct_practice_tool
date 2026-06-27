"use strict";

// Firebase 인증 + RTDB 읽기/쓰기 (REST)
// 관리자 페이지(admin.html)와 동일한 Email/Password 인증 모델을 사용한다.
// 서비스 계정 키를 쓰지 않으므로 운영자 계정만으로 동작하고, 개인키는 로컬에만 둔다.

const IDENTITY_TOOLKIT = "https://identitytoolkit.googleapis.com/v1/accounts";

function requireFetch() {
    if (typeof fetch !== "function") {
        throw new Error("이 Node 버전에는 전역 fetch 가 없습니다. Node 18+ 가 필요합니다.");
    }
    return fetch;
}

function normalizeDbUrl(databaseURL) {
    return String(databaseURL || "").replace(/\/+$/, "");
}

class FirebaseRestClient {
    constructor({ apiKey, databaseURL, email, password }) {
        if (!apiKey) throw new Error("config.apiKey 가 필요합니다.");
        if (!databaseURL) throw new Error("config.databaseURL 가 필요합니다.");
        if (!email || !password) throw new Error("운영자 email/password 가 필요합니다.");
        this.apiKey = apiKey;
        this.databaseURL = normalizeDbUrl(databaseURL);
        this.email = email;
        this.password = password;
        this.idToken = null;
        this.refreshToken = null;
        this.expiresAtMs = 0;
    }

    async signIn() {
        const doFetch = requireFetch();
        const res = await doFetch(`${IDENTITY_TOOLKIT}:signInWithPassword?key=${encodeURIComponent(this.apiKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: this.email, password: this.password, returnSecureToken: true })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.idToken) {
            throw new Error(`Firebase 로그인 실패: ${data?.error?.message || res.status}`);
        }
        this.idToken = data.idToken;
        this.refreshToken = data.refreshToken || null;
        this.expiresAtMs = Date.now() + (Number(data.expiresIn || 3600) - 60) * 1000;
        return this.idToken;
    }

    async getToken() {
        if (this.idToken && Date.now() < this.expiresAtMs) {
            return this.idToken;
        }
        return this.signIn();
    }

    async readPath(pathStr) {
        const doFetch = requireFetch();
        const token = await this.getToken();
        const url = `${this.databaseURL}/${pathStr}.json?auth=${encodeURIComponent(token)}`;
        const res = await doFetch(url);
        if (!res.ok) {
            throw new Error(`RTDB 읽기 실패(${pathStr}): ${res.status}`);
        }
        return res.json();
    }

    async writePath(pathStr, value) {
        const doFetch = requireFetch();
        const token = await this.getToken();
        const url = `${this.databaseURL}/${pathStr}.json?auth=${encodeURIComponent(token)}`;
        const res = await doFetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(value)
        });
        if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`RTDB 쓰기 실패(${pathStr}): ${res.status} ${body}`);
        }
        return res.json().catch(() => value);
    }

    async updatePath(pathStr, partial) {
        const doFetch = requireFetch();
        const token = await this.getToken();
        const url = `${this.databaseURL}/${pathStr}.json?auth=${encodeURIComponent(token)}`;
        const res = await doFetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partial)
        });
        if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`RTDB 부분수정 실패(${pathStr}): ${res.status} ${body}`);
        }
        return res.json().catch(() => partial);
    }
}

module.exports = { FirebaseRestClient };
