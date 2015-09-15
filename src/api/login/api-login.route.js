module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var userCtrl = server.controllers.user;
    var fileServerCtrl = server.controllers.fileServer;
    var userConfirm = server.controllers.userConfirm;

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
        userCtrl.checkUser(req.body.email, req.body.password, function(err, data) {
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
        userConfirm.findByToken(req.params.token, function(err, data) {
            if (!err) {
                fileServerCtrl.loginRenew(req.params.token, false, function(err, data) {
                    res.header('Content-Type', 'text/html; charset=UTF-8');
                    res.status(err ? err : 200).send(data);
                });
            } else {
                res.status(404).json({
                    status: 'error',
                    message: 'token not found'
                });
            }
        });
    });
    
    /**
     * Password renew action
     * @name /renew-password/:token
     * @method POST
     * @role -
     * @param {String} tokenUri  @url @required token provided by email
     * @param {String} token     @body @optional token
     * @param {String} password1 @body @required new password
     * @param {String} password1 @body @required new password again
     * @public
     */
    router.post('/renew-password/:tokenUri', function(req, res) {
        server.helpers.response(req, res, null, req.body);
    });
    
    /**
     * Password renew action
     * @name /renew-password
     * @method POST
     * @role -
     * @param {String} email  @body @required email to send the renewal
     * @public
     */
    router.post('/renew-password', function(req, res) {
        userCtrl.sendRecovery(req.body.email, function(err, data) {
            if (err) {
                res.status(404).json({
                    status: 'error',
                    message: 'email not found',
                    err: err
                });
            } else {
                server.helpers.response(req, res, err, {message: 'email sent'});
            }
        });
    });
    
    return router;
};