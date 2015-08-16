module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();

    router.get('/', function (req, res) {
        res.json({
            message: 'hooray! welcome to our api!'
        });
    });

    router.use('/user', server.middlewares.authentication, require('./user/api-user.route.js')(server));
    router.use('/login', require('./login/api-login.route.js')(server));



    router.post('/user/refresh-token', function (req, res) {
        server.helpers.oauth.decrypt(req.body['refresh-token'], 'refresh-token', function (err, data) {
            if (!err) {
                data.created = new Date().getTime();
                var accessToken = server.helpers.oauth.encrypt(data, 'access-token');
                server.helpers.response(req, res, null, {'access-token': accessToken});
            } else {
                server.helpers.response(req, res, err);
            }
        });
    });

    return router;
};