module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = require('./api-user-refresh-token.controller.js')(server);
    
    
    router.post('/', function (req, res) {
        controller.generateAccessToken(req.body['refresh-token'], function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    
    return router;
};