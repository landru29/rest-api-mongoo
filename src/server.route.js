module.exports = function(server) {
    'use strict';
    
    /**
     * @followRoute ./api/api.route.js
     * @name        api
     */
    server.app.use('/api', server.middlewares.authentication, require('./api/api.route.js')(server));

    server.app.use('/assets', require('./assets/assets.route.js')(server));
};