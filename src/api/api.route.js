module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    
    router.use('/', function(req, res) {
        res.status(200).json(require('./api.json'));
    });
    
    router.use('/login', require('./login/api-login.route.js')(server));
    router.use('/user', require('./user/api-user.route.js')(server));
    router.use('/application', require('./application/api-application.route.js')(server));

    return router;
};