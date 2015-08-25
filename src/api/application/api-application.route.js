module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = server.controllers.application;


    router.get('/', function (req, res) {
        controller.readApplications(function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    
    router.get('/:id', function(req, res) {
        controller.readApplicationById(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    
    router.post('/', function(req, res) {
        var checker = server.helpers.mendatoryFieldsError(req.body, {
            name: /^[\w\s]*$/
        });
        if (!checker) {
            controller.createApplication(req.body, function(err, data) {
                server.helpers.response(req, res, err, data, {message: {success: 'Application created'}});
            });
        } else {
             server.helpers.response(req, res, checker, null);
        }
    });
    
    router.delete('/:id', function (req, res) {
        controller.deleteApplication(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, null, {message: {success: 'Application deleted'}});
        });
    });
    
    router.put('/:id', function (req, res) {
        controller.updateApplication(req.params.id, {
            name: req.body.name
        }, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'Application updated'}});
        });
    });
    
    return router;
};