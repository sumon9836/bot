const { fetchProxy } = require('../lib/proxy');
const { handleOptions, json, error } = require('../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;

    if (req.method !== 'GET') {
        return error(res, 405, 'Method not allowed');
    }

    try {
        console.log('📋 Fetching public banlist...');
        const result = await fetchProxy('/blocklist');

        // Ensure we're returning JSON
        if (typeof result.data === 'string') {
            return json(res, 200, {});
        } else {
            return json(res, 200, result.data || {});
        }
    } catch (error) {
        console.error('Banlist API Error:', error.message);
        return json(res, 200, {});
    }
};