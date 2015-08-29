module.exports = function(server) {
    'use strict';
    var express = require('express'); 
    var router = express.Router();
    var controller = server.controllers.user;
    
    /**
     * @followRoute ./refresh-token/api-user-refresh-token.route.js
     * @name        refresh-token
     */ 
    router.use('/refresh-token', require('./refresh-token/api-user-refresh-token.route.js')(server));

    
    /**
     * Read All users
     * @name /
     * @method GET
     * @role admin
     */
    router.get('/', function (req, res) {
        controller.readUsers(function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    
    /**
     * Read one user
     * @name /:id
     * @method GET
     * @param {String} id @url @mendatory User ID
     * @role admin
     */
    router.get('/:id', function(req, res) {
        controller.readUserById(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });
    
    /**
     * Create a user
     * @name /
     * @method POST
     * @param {String} name     @body            User name
     * @param {String} email    @body @mendatory User email
     * @param {String} password @body @mendatory User password
     * @role admin
     */
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
    
    /**
     * Delete a user
     * @name /:id
     * @method DELETE
     * @param {String} id @url @mendatory User ID
     * @role admin
     */
    router.delete('/:id', function (req, res) {
        controller.deleteUser(req.params.id, function(err, data) {
            server.helpers.response(req, res, err, null, {message: {success: 'User deleted'}});
        });
    });
    
    /**
     * Update a user
     * @name /:id
     * @method PUT
     * @param {String} id       @url  @mendatory User ID
     * @param {String} name     @body            User name
     * @param {String} email    @body            User email
     * @param {String} password @body            User password
     * @role admin
     */
    router.put('/:id', function (req, res) {
        controller.updateUser(req.params.id, {
            name: req.body.name
        }, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'User updated'}});
        });
    });
    
    return router;
};