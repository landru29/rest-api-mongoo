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
     * @param {String} email    @body @mendatory User email
     * @param {String} password @body @mendatory User password
     * @public
     */
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