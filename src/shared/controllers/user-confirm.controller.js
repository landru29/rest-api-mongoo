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
    
    
    function cleanTokens(/*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return User.remove({
            expire: {$gt: new Date()}
        }, callback);
    }

   
    /**
     * Create a token
     * @param {Object}   email User email
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function createToken(email /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        var token = new UserConfirm();
        token.email = email;
        return q.promise(function (resolve, reject) {
            token.save(function (err, createdToken) {
                if (!err) {
                    resolve(createdToken);
                    callback(null, createdToken);
                } else {
                    reject(err);
                    callback(err);
                }
            });
        });
    }

    /**
     * Delete a token
     * @param {String}   token Validation token
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteToken(token /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return UserConfirm.remove({
            token: token
        }, callback);
    }


    return {
        findByToken: findByToken,
        createToken: createToken,
        deleteToken: deleteToken,
        cleanTokens: cleanTokens
    };
};