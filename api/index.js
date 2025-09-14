
const { error } = require('../lib/http');

// Map routes to handlers
const routes = {
  sessions: require('./sessions'),
  pair: require('./pair'),
   health: require('./health'),
  banlist: require('./banlist'),
  authcheck: require('./admin/auth-check'),
  abanlist: require('./admin/banlist'),
  block: require('./admin/block'),
  ablocklist: require('./admin/blocklist'),
  adelete: require('./admin/delete'),
  login: require('./admin/login'),
  logout: require('./admin/logout'),
  unblock: require('./admin/unblock')
};

module.exports = async function handler(req, res) {
  // Extract first part of path after /api/
  const path = req.url.replace(/^\/api\//, '').split('/')[0];
  const route = routes[path];

  if (route) {
    return route(req, res);
  }

  return error(res, 404, 'API endpoint not found.');
};