module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = server.controllers.refreshToken;
    
    /**
     * Refresh an OAuth token
     * @public
     * @name /
     * @method POST
     * @role -
     * @param {String} refresh-token @body @mendatory Refresh token
     */
    router.post('/', function (req, res) {
        controller.generateAccessToken(req.body['refresh-token'], function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    
    return router;
};