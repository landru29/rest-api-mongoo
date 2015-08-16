module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = require('../user/api-user.controller.js')(server);

    
    router.post('/', function(req, res) {
        var checker = server.helpers.mendatoryFieldsError(req.body, {
            email: true,
            password: true
        });
        if (!checker) {
            controller.checkUser(req.body.email, req.body.password, function(err, data) {
                server.helpers.response(req, res, err, data);
            });
        } else {
             server.helpers.response(req, res, checker, null);
        }
    });
    
    return router;
};