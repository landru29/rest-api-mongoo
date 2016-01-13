module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();

    /**
     * @method GET
     * @public
     * @role -
     * @name        /
     */
    router.get('/', function(req, res) {
        res.status(200).json(server.meta);
    });

    /**
     * @followRoute ./login/api-login.route.js
     * @name        login
     */
    router.use('/login', require('./login/api-login.route.js')(server));

    /**
     * @followRoute ./user/api-user.route.js
     * @name        user
     */
    router.use('/user', require('./user/api-user.route.js')(server));

    /**
     * @followRoute ./application/api-application.route.js
     * @name        application
     */
    router.use('/application', require('./application/api-application.route.js')(server));

    /**
     * @followRoute ./tournament/api-tournament.route.js
     * @name        tournament
     */
    router.use('/tournament', require('./tournament/api-tournament.route.js')(server));

    /**
     * @followRoute ./beer/api-beer.route.js
     * @name        beer
     */
    router.use('/beer', require('./beer/api-beer.route.js')(server));

    return router;
};
