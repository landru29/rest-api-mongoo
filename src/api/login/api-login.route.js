module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = server.controllers.user;
    var fileServerCtrl = server.controllers.fileServer;

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
    
    /**
     * Password renew page
     * @name /renew-password/:token
     * @method GET
     * @role -
     * @param {String} token    @url @required token provided by email
     * @public
     */
    router.get('/renew-password/:token', function(req, res) {
        fileServerCtrl.loginRenew(req.params.token, function(err, data) {
            res.header('Content-Type', 'text/html; charset=UTF-8');
            res.status(err ? err : 200).send(data);
        });
    });
    
    /**
     * Password renew action
     * @name /renew-password/:token
     * @method POST
     * @role -
     * @param {String} token    @url @required token provided by email
     * @public
     */
    router.post('/renew-password/:token', function(req, res) {
        server.helpers.response(req, res, null, req.body);
    });
    
    return router;
};