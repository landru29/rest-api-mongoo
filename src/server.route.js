module.exports = function(server) {
    'use strict';
    server.app.use('/api', server.middlewares.authentication, require('./api/api.route.js')(server));
};