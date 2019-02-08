const feedResolver = require('./resolvers/feed');
const authResolver = require('./resolvers/auth');

module.exports = Object.assign(authResolver, feedResolver);
