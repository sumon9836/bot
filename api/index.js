
// Main API handler for Vercel deployment
const { error } = require('../lib/http');

module.exports = async function handler(req, res) {
    return error(res, 404, 'API endpoint not found. Use specific endpoints like /api/sessions, /api/pair, etc.');
};
