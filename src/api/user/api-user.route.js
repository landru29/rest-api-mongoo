module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = require('./api-user.controller.js')(server);

    router.get('/', function (req, res) {
        controller.readUsers(function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    
    router.get('/:id', function(req, res) {
        controller.readUserById(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    
    router.post('/', function(req, res) {
        var checker = server.helpers.mendatoryFieldsError(req.body, {
            name: /^[\w\s]*$/,
            email: true,
            password: true
        });
        if (!checker) {
            controller.createUser(req.body, function(err, data) {
                server.helpers.response(req, res, err, data, {message: {success: 'User created'}});
            });
        } else {
             server.helpers.response(req, res, checker, null);
        }
    });
    
    router.delete('/:id', function (req, res) {
        controller.deleteUser(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, null, {message: {success: 'User deleted'}});
        });
    });
    
    router.put('/:id', function (req, res) {
        controller.updateUser(req.params.id, {
            name: req.body.name
        }, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'User updated'}});
        });
    });
    
    return router;
};