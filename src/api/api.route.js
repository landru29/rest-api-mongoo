module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();

    router.get('/', function (req, res) {
        res.json({
            message: 'hooray! welcome to our api!'
        });
    });

    router.use('/user', require('./user/api-user.route.js')(server));

    return router;
};