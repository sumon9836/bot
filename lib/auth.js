const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sumon2008';

// Simple JWT implementation for serverless
function base64URLEscape(str) {
    return str.replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=/g, '');
}

function base64URLUnescape(str) {
    str += new Array(5 - str.length % 4).join('=');
    return str.replace(/\-/g, '+').replace(/_/g, '/');
}

function base64URLDecode(str) {
    return Buffer.from(base64URLUnescape(str), 'base64').toString();
}

function base64URLEncode(str) {
    return base64URLEscape(Buffer.from(str).toString('base64'));
}

function signJWT(payload, expiresIn = 3600) { // 1 hour default
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const claims = {
        ...payload,
        iat: now,
        exp: now + expiresIn
    };
    
    const encodedHeader = base64URLEncode(JSON.stringify(header));
    const encodedPayload = base64URLEncode(JSON.stringify(claims));
    
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(encodedHeader + '.' + encodedPayload)
        .digest('base64');
    
    const encodedSignature = base64URLEscape(signature);
    
    return encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
}

function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        
        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(encodedHeader + '.' + encodedPayload)
            .digest('base64');
        
        const actualSignature = base64URLUnescape(encodedSignature);
        
        if (expectedSignature !== actualSignature) {
            return null;
        }
        
        // Decode payload
        const payload = JSON.parse(base64URLDecode(encodedPayload));
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return null;
        }
        
        return payload;
    } catch (error) {
        return null;
    }
}

function parseCookies(req) {
    const cookies = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.trim().split('=');
            if (parts.length === 2) {
                cookies[parts[0]] = parts[1];
            }
        });
    }
    return cookies;
}

function isAuthenticated(req) {
    const cookies = parseCookies(req);
    const token = cookies.admin_session;
    if (!token) {
        return false;
    }
    
    const payload = verifyJWT(token);
    return payload && payload.user === 'admin';
}

function requireAdmin(req, res) {
    if (!isAuthenticated(req)) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Please login to access admin features'
        });
        return false;
    }
    return true;
}

function checkAdminPassword(password) {
    return password === ADMIN_PASSWORD;
}

module.exports = {
    signJWT,
    verifyJWT,
    isAuthenticated,
    requireAdmin,
    checkAdminPassword,
    parseCookies
};