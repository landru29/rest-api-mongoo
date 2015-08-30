module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = server.controllers.user;

    /**
     * Login a user
     * @name /
     * @method POST
     * @role -
     * @param {String} email    @body @required User email
     * @param {String} password @body @required User password
     * @public
     */
    router.post('/', function(req, res) {
        controller.checkUser(req.body.email, req.body.password, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    
    return router;
};