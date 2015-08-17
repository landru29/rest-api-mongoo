module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var refreshTokenController = require('./user/refresh-token/api-user-refresh-token.controller.js')(server);

    
    router.post('/user/refresh-token', function (req, res) {
        refreshTokenController.generateAccessToken(req.body['refresh-token'], function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    

    router.use('/user', server.middlewares.authentication, require('./user/api-user.route.js')(server));
    router.use('/login', require('./login/api-login.route.js')(server));

    return router;
};