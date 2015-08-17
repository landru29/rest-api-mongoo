module.exports = function (server) {
    'use strict';
    var User = server.models.User;

    function generateAccessToken(refreshToken, callback) {
        console.log(refreshToken)
        server.helpers.oauth.decrypt(refreshToken, 'refresh-token', function (err, data) {
            if (!err) {
                User.findById(data._id, function (err, userData) {
                    if ((!err) && (userData) && (userData.isActive())) {
                        data.created = new Date().getTime();
                        var accessToken = server.helpers.oauth.encrypt(data, 'access-token');
                        callback(null, {
                            'access-token': accessToken
                        });
                    } else {
                        callback('User is not allowed to use the application anymore');
                    }
                });
            } else {
                callback(err);
            }
        });

    }

    return {
        generateAccessToken: generateAccessToken
    };
};