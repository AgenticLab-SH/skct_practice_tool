/** @returns {import('firebase/app').FirebaseOptions} */
export function getFirebaseWebConfig() {
    const config = globalThis.FIREBASE_WEB_CONFIG;
    if (!config || !config.apiKey || String(config.apiKey).includes("REPLACE_WITH")) {
        throw new Error(
            "Firebase 설정이 없습니다. config/firebase-web-config.js 를 준비하세요 (예시: firebase-web-config.example.js)."
        );
    }
    return config;
}
