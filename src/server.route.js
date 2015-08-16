module.exports = function(server) {
    'use strict';
    server.app.use('/api', require('./api/api.route.js')(server));
};