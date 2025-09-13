function setCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function json(res, status, data) {
    setCORS(res);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function error(res, status, message) {
    setCORS(res);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        error: message,
        timestamp: new Date().toISOString()
    }));
}

function handleOptions(req, res) {
    if (req.method === 'OPTIONS') {
        setCORS(res);
        res.writeHead(200);
        res.end();
        return true;
    }
    return false;
}

async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                try {
                    // Try URL-encoded format
                    const params = new URLSearchParams(body);
                    const result = {};
                    for (const [key, value] of params) {
                        result[key] = value;
                    }
                    resolve(result);
                } catch (e2) {
                    resolve({});
                }
            }
        });
        req.on('error', reject);
    });
}

function setSecureCookie(res, name, value, maxAge = 3600) {
    const cookieOptions = [
        `${name}=${value}`,
        'HttpOnly',
        'SameSite=Strict',
        'Path=/',
        `Max-Age=${maxAge}`
    ];
    
    // Only set Secure in production
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.push('Secure');
    }
    
    res.setHeader('Set-Cookie', cookieOptions.join('; '));
}

function clearCookie(res, name) {
    setSecureCookie(res, name, '', 0);
}

module.exports = {
    setCORS,
    json,
    error,
    handleOptions,
    parseBody,
    setSecureCookie,
    clearCookie
};