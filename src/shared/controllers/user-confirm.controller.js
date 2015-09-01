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
    function findByToken(token, callback) {
        return q.promise(function (resolve, reject) {
            UserConfirm.find({
                token: token,
                expire: {$gt: new Date()}
            }).then(
                function (data) {
                    if (data.length === 1) {
                        resolve(data);
                        if (callback) {
                            callback(null, data);
                        }
                    } else {
                        reject('Token not found');
                        if (callback) {
                            callback('Token not found');
                        }
                    }
                },
                function (err) {
                    reject(err);
                    if (callback) {
                        callback(err);
                    }
                }
            );
        });
    }
    
    
    function cleanTokens(callback) {
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
    function createToken(email, callback) {
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
    function deleteToken(token, callback) {
        return User.remove({
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