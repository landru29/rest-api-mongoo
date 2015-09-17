module.exports = function (server) {
    'use strict';
    var UserConfirm = server.getModel('UserConfirm');
    var _ = require('lodash');
    var q = require('q');
    
    /**
     * Get Token
     * @param   {String} token Validation token
     * @returns {Object} Promise
     */
    function findByToken(token /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            UserConfirm.find({
                token: token,
                expire: {$gt: new Date()}
            }).then(
                function (data) {
                    if (data.length === 1) {
                        resolve(_.first(data));
                        callback(null, data);
                    } else {
                        reject('Token not found');
                        callback('Token not found');
                    }
                },
                function (err) {
                    reject(err);
                    callback(err);
                }
            );
        });
    }
    
    /**
     * Update a password
     * @param   {String} token    Recieved by email
     * @param   {String} password New password
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function updatePassword(token, password /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        var userCtrl = server.controllers.user;
        return q.promise(function (resolve, reject) {
            findByToken(token).then(
                function(userToken) {
                    userCtrl.updateUser(
                        userToken.userId, 
                        {
                            password: password
                        }
                    ).then(function(data){
                        resolve(data);
                        callback(null, data);
                    }, function(err) {
                        reject(err);
                        callback(err);
                    });
                }, function(err) {
                    reject(err);
                    callback(err);
                }
            );
        });
    }

   
    /**
     * Create a token
     * @param {Object}   email User email
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function createToken(email /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
             var doInOrder = server.helpers.doInOrder;
            doInOrder.execute([
                
                doInOrder.next(
                    function () {
                        var userCtrl = server.controllers.user;
                        return userCtrl.findUserByEmail(email);
                    }
                ),
                
                doInOrder.next(
                    function (user) {
                        var token = new UserConfirm();
                        token.email = email;
                        token.userId = user._id;
                        return token.save();
                    }
                )
                
            ]).then(
                function(data) {
                    resolve({
                        email: data[0].email,
                        token: data[0].token
                    });
                }, 
                function(err) {
                    reject(err);
                }
            );
        });
    }


    return {
        findByToken: findByToken,
        createToken: createToken,
        updatePassword: updatePassword
    };
};