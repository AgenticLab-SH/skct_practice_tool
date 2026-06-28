(function () {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    function bytesToBase64(bytes) {
        let binary = '';
        bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
        });
        return btoa(binary);
    }

    function base64ToBytes(base64) {
        const binary = atob(String(base64 || ''));
        return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    }

    function pemToArrayBuffer(pem) {
        const normalized = String(pem || '')
            .replace(/-----BEGIN [^-]+-----/g, '')
            .replace(/-----END [^-]+-----/g, '')
            .replace(/\s+/g, '');
        return base64ToBytes(normalized).buffer;
    }

    function arrayBufferToPem(buffer, label) {
        const base64 = bytesToBase64(new Uint8Array(buffer));
        const wrapped = base64.match(/.{1,64}/g)?.join('\n') || base64;
        return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----`;
    }

    async function derivePasswordKey(password, saltBytes) {
        const baseKey = await crypto.subtle.importKey(
            'raw',
            textEncoder.encode(String(password || '')),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltBytes,
                iterations: 120000,
                hash: 'SHA-256'
            },
            baseKey,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function importAesKey(rawBytes) {
        return crypto.subtle.importKey(
            'raw',
            rawBytes,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function exportAesKey(key) {
        return new Uint8Array(await crypto.subtle.exportKey('raw', key));
    }

    async function encryptBytesWithPassword(rawBytes, password) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await derivePasswordKey(password, salt);
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, rawBytes);
        return {
            cipher: bytesToBase64(new Uint8Array(encrypted)),
            iv: bytesToBase64(iv),
            salt: bytesToBase64(salt)
        };
    }

    async function decryptBytesWithPassword(bundle, password) {
        const key = await derivePasswordKey(password, base64ToBytes(bundle.salt));
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: base64ToBytes(bundle.iv) },
            key,
            base64ToBytes(bundle.cipher)
        );
        return new Uint8Array(decrypted);
    }

    async function encryptJsonWithPassword(payload, password) {
        const encoded = textEncoder.encode(JSON.stringify(payload || {}));
        return encryptBytesWithPassword(encoded, password);
    }

    async function decryptJsonWithPassword(bundle, password) {
        const decrypted = await decryptBytesWithPassword(bundle, password);
        return JSON.parse(textDecoder.decode(decrypted));
    }

    async function encryptJsonWithContentKey(payload, contentKey) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = textEncoder.encode(JSON.stringify(payload || {}));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, contentKey, encoded);
        return {
            payloadCipher: bytesToBase64(new Uint8Array(encrypted)),
            payloadIv: bytesToBase64(iv)
        };
    }

    async function decryptJsonWithContentKey(bundle, contentKey) {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: base64ToBytes(bundle.payloadIv) },
            contentKey,
            base64ToBytes(bundle.payloadCipher)
        );
        return JSON.parse(textDecoder.decode(decrypted));
    }

    async function importPublicKeyPem(publicKeyPem) {
        return crypto.subtle.importKey(
            'spki',
            pemToArrayBuffer(publicKeyPem),
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            false,
            ['encrypt']
        );
    }

    async function importPrivateKeyPem(privateKeyPem) {
        return crypto.subtle.importKey(
            'pkcs8',
            pemToArrayBuffer(privateKeyPem),
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            false,
            ['decrypt']
        );
    }

    async function importLicensePublicKeyPem(publicKeyPem) {
        return crypto.subtle.importKey(
            'spki',
            pemToArrayBuffer(publicKeyPem),
            {
                name: 'ECDSA',
                namedCurve: 'P-256'
            },
            false,
            ['verify']
        );
    }

    async function importLicensePrivateKeyPem(privateKeyPem) {
        return crypto.subtle.importKey(
            'pkcs8',
            pemToArrayBuffer(privateKeyPem),
            {
                name: 'ECDSA',
                namedCurve: 'P-256'
            },
            false,
            ['sign']
        );
    }

    async function generateAdminKeyPairPem() {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256'
            },
            true,
            ['encrypt', 'decrypt']
        );
        const publicKeyPem = arrayBufferToPem(await crypto.subtle.exportKey('spki', keyPair.publicKey), 'PUBLIC KEY');
        const privateKeyPem = arrayBufferToPem(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey), 'PRIVATE KEY');
        return { publicKeyPem, privateKeyPem };
    }

    async function generateLicenseKeyPairPem() {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: 'P-256'
            },
            true,
            ['sign', 'verify']
        );
        const publicKeyPem = arrayBufferToPem(await crypto.subtle.exportKey('spki', keyPair.publicKey), 'PUBLIC KEY');
        const privateKeyPem = arrayBufferToPem(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey), 'PRIVATE KEY');
        return { publicKeyPem, privateKeyPem };
    }

    function stableSerialize(value) {
        if (Array.isArray(value)) {
            return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`;
        }
        if (value && typeof value === 'object') {
            const pairs = Object.keys(value)
                .sort()
                .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`);
            return `{${pairs.join(',')}}`;
        }
        return JSON.stringify(value ?? null);
    }

    async function signLicensePayload(payload, privateKeyPem) {
        const privateKey = await importLicensePrivateKeyPem(privateKeyPem);
        const serialized = stableSerialize(payload || {});
        const signature = await crypto.subtle.sign(
            {
                name: 'ECDSA',
                hash: 'SHA-256'
            },
            privateKey,
            textEncoder.encode(serialized)
        );
        return {
            version: 1,
            payload: payload || {},
            signature: bytesToBase64(new Uint8Array(signature))
        };
    }

    async function verifyLicenseBundle(bundle, publicKeyPem) {
        if (!bundle || typeof bundle !== 'object' || !bundle.payload || !bundle.signature || !publicKeyPem) {
            return false;
        }
        const publicKey = await importLicensePublicKeyPem(publicKeyPem);
        const serialized = stableSerialize(bundle.payload);
        return crypto.subtle.verify(
            {
                name: 'ECDSA',
                hash: 'SHA-256'
            },
            publicKey,
            base64ToBytes(bundle.signature),
            textEncoder.encode(serialized)
        );
    }

    async function readContentKeyForUser(record, requestPassword) {
        const rawKey = await decryptBytesWithPassword(
            {
                cipher: record.userKeyCipher,
                iv: record.userKeyIv,
                salt: record.userKeySalt
            },
            requestPassword
        );
        return importAesKey(rawKey);
    }

    async function readContentKeyForAdmin(record, privateKeyPem) {
        const privateKey = await importPrivateKeyPem(privateKeyPem);
        const rawKey = await crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            base64ToBytes(record.adminKeyCipher)
        );
        return importAesKey(new Uint8Array(rawKey));
    }

    async function encryptRequestPayload(payload, requestPassword, adminPublicKeyPem) {
        const contentKey = await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
        const rawKey = await exportAesKey(contentKey);
        const userWrapped = await encryptBytesWithPassword(rawKey, requestPassword);
        const publicKey = await importPublicKeyPem(adminPublicKeyPem);
        const adminWrappedKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawKey);
        const payloadBundle = await encryptJsonWithContentKey(payload, contentKey);
        return {
            version: 1,
            payloadCipher: payloadBundle.payloadCipher,
            payloadIv: payloadBundle.payloadIv,
            userKeyCipher: userWrapped.cipher,
            userKeyIv: userWrapped.iv,
            userKeySalt: userWrapped.salt,
            adminKeyCipher: bytesToBase64(new Uint8Array(adminWrappedKey))
        };
    }

    async function decryptRequestPayloadForUser(record, requestPassword) {
        const contentKey = await readContentKeyForUser(record, requestPassword);
        return decryptJsonWithContentKey(record, contentKey);
    }

    async function decryptRequestPayloadForAdmin(record, privateKeyPem) {
        const contentKey = await readContentKeyForAdmin(record, privateKeyPem);
        return decryptJsonWithContentKey(record, contentKey);
    }

    async function reencryptRequestPayloadForAdmin(record, nextPayload, privateKeyPem) {
        const contentKey = await readContentKeyForAdmin(record, privateKeyPem);
        const payloadBundle = await encryptJsonWithContentKey(nextPayload, contentKey);
        return {
            payloadCipher: payloadBundle.payloadCipher,
            payloadIv: payloadBundle.payloadIv
        };
    }

    const SKCTSubscriptionCrypto = {
        bytesToBase64,
        base64ToBytes,
        generateAdminKeyPairPem,
        generateLicenseKeyPairPem,
        encryptRequestPayload,
        decryptRequestPayloadForUser,
        decryptRequestPayloadForAdmin,
        reencryptRequestPayloadForAdmin,
        encryptJsonWithPassword,
        decryptJsonWithPassword,
        signLicensePayload,
        verifyLicenseBundle
    };

    // Browser: expose on window. Node (auto-issuer/tests): expose via module.exports.
    // Both environments provide Web Crypto (crypto.subtle), TextEncoder/TextDecoder, btoa/atob globally.
    if (typeof window !== 'undefined') {
        window.SKCTSubscriptionCrypto = SKCTSubscriptionCrypto;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SKCTSubscriptionCrypto;
    }
})();
