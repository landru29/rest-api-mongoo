/*global module*/
module.exports = function (server) {
    'use strict';
    var User = server.getModel('User');
    var q = require('q');

    /**
     * Generate an access token
     * @param     {String} refreshToken Refresh token
     * @param   {Function} callback     Callback function
     * @returns {Object} Promise
     */
    function generateAccessToken(refreshToken /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function (resolve, reject) {
            server.helpers.oauth.decrypt(refreshToken, 'refresh-token', function (err, data) {
                if (!err) {
                    User.findById(data._id, function (err, userData) {
                        if ((!err) && (userData) && (userData.isActive())) {
                            data.created = new Date().getTime();
                            data.role = userData.role;
                            data.applications = userData.applications;
                            var accessToken = server.helpers.oauth.encrypt(data, 'access-token');
                            resolve({
                                'access-token': accessToken
                            });
                            callback(null, {
                                'access-token': accessToken
                            });
                        } else {
                            reject('User is not allowed to use the application anymore');
                            callback('User is not allowed to use the application anymore');
                        }
                    });
                } else {
                    reject(err);
                    callback(err);
                }
            });
        });

    }

    return {
        generateAccessToken: generateAccessToken
    };
};