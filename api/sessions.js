const { fetchProxy } = require('../lib/proxy');
const { handleOptions, json, error } = require('../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;

    if (req.method !== 'GET') {
        return error(res, 405, 'Method not allowed');
    }

    try {
        console.log('📊 Fetching sessions...');
        const result = await fetchProxy('/sessions');

        // Ensure we're returning JSON
        if (typeof result.data === 'string') {
            try {
                const jsonData = JSON.parse(result.data);
                return json(res, 200, jsonData);
            } catch (e) {
                // If string can't be parsed as JSON, return it wrapped in an object
                console.log('Sessions API: Cannot parse response as JSON, wrapping in object:', e.message);
                return json(res, 200, {
                    raw_response: result.data,
                    error: 'Response is not valid JSON',
                    sessions: []
                });
            }
        } else if (typeof result.data === 'object') {
            return json(res, 200, result.data);
        } else {
            // Handle cases where result.data is neither string nor object (e.g., null, undefined, number)
            console.log('Sessions API: Unexpected data type received:', typeof result.data);
            return json(res, 200, {
                raw_response: result.data,
                error: 'Unexpected API response format',
                sessions: []
            });
        }
    } catch (error) {
        console.error('Sessions API Error:', error.message);
        return json(res, 500, {
            error: 'Failed to fetch sessions',
            message: error.message
        });
    }
};