module.exports = function (server) {
    'use strict';
    var User = server.models.User;
    var _ = require('lodash');
    var q = require('q');
    var Mailjet = require('mailjet-sendemail');
    var mailjet = new Mailjet(server.config.mailjet.key, server.config.mailjet.secret);

    /**
     * Generate an oauth refresh token
     * @param   {Object} user Mongoose User
     * @returns {String}      Refresh token
     */
    function generateRefreshToken(user) {
        user.created = new Date().getTime();
        return server.helpers.oauth.encrypt({
            _id: user._id,
            name: user.name
        }, 'refresh-token');
    }

    /**
     * Read all users
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readUsers(callback) {
        return User.find(callback);
    }

    /**
     * Get a user by ID
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readUserById(id, callback) {
        return User.findById(id, callback);
    }

    /**
     * Create a user
     * @param {Object}   userData User {name, email, password}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function createUser(userData, callback) {
        var user = new User();
        user.name = userData.name;
        user.email = userData.email;
        user.password = userData.password;
        user.active = true;
        if (userData.role) {
            user.role = userData.role;
        }
        return q.promise(function (resolve, reject) {
            user.save(function (err, createdUser) {
                if (!err) {
                    resolve(_.extend({
                            'refresh-token': generateRefreshToken(createdUser)
                        },
                        createdUser._doc
                    ));
                    callback(null, _.extend({
                            'refresh-token': generateRefreshToken(createdUser)
                        },
                        createdUser._doc
                    ));
                } else {
                    reject(err);
                    callback(err);
                }
            });
        });
    }

    /**
     * Delete a user
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteUser(id, callback) {
        return User.remove({
            _id: id
        }, callback);
    }

    /**
     * Update a user
     * @param {String} id         User Identifier
     * @param {Object}   userData User {name, email, password, delAppId, addAppId}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function updateUser(id, userData, callback) {
        return q.promise(function (resolve, reject)  {
            User.findById(id, function (err, user) {
                if (err) {
                    return callback(err);
                }
                if (userData.name) {
                    user.name = userData.name;
                }
                if (userData.password) {
                    user.password = userData.password;
                }
                if (userData.role) {
                    user.role = userData.role;
                }
                if (userData.delAppId) {
                    var index = user.applications.indexOf(userData.addAppId);
                    if (index > -1) {
                        user.applications.splice(userData.delAppId, 1);
                    }
                }
                if (userData.addAppId) {
                    server.controllers.application.readApplicationById(userData.addAppId).then(
                        function (app) {
                            var index = user.applications.indexOf(app._id);
                            if (index < 0) {
                                user.applications.push(app);
                            }
                            user.save(callback).then(function (data) {
                                resolve(data);
                            }, function (err) {
                                reject(err);
                            });
                        },
                        function (err) {
                            reject(err);
                            if (callback) {
                                callback(err);
                            }
                        });
                } else {
                    user.save(callback).then(function (data) {
                        resolve(data);
                    }, function (err) {
                        reject(err);
                    });
                }
            });
        });
    }

    /**
     * Check a user with its email and password
     * @param   {String} email    User email
     * @param   {String} password User password
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function checkUser(email, password, callback) {
        return q.promise(function (resolve, reject) {
            User.find({
                email: email
            }, function (err, data) {
                if (data.length !== 1) {
                    reject('Failed to login');
                    return callback('Failed to login');
                } else {
                    if (_.first(data).comparePassword(password)) {
                        resolve({
                            'refresh-token': generateRefreshToken(_.first(data))
                        });
                        return callback(null, {
                            'refresh-token': generateRefreshToken(_.first(data))
                        });
                    } else {
                        reject('Failed to login');
                        return callback('Failed to login');
                    }
                }
            });
        });
    }

    /**
     * Get User by email
     * @param   {String} email User email
     * @returns {Object} Promise
     */
    function findUserByEmail(email, callback) {
        return q.promise(function (resolve, reject) {
            User.find({
                email: email
            }).then(
                function (data) {
                    if (data.length === 1) {
                        resolve(data);
                        if (callback) {
                            callback(null, data);
                        }
                    } else {
                        reject('User not found');
                        if (callback) {
                            callback('User not found');
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

    /**
     * Send a recovery email
     * @param   {String} email User email
     * @returns {Object} Promise
     */
    function sendRecovery(email, callback) {
        return q.promise(function (resolve, reject) {
            findUserByEmail(email).then(
                function (user) {
                    server.controller.userConfirm.createToken(user.email).then(
                        function (token) {
                            mailjet.sendContent(
                                server.config.mailjet.sender, 
                                [user.email],
                                server.config.mailjet.subject,
                                'html',
                                '<p>Your recovery token</p>' + token.token
                            );
                            resolve(token);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                function (err) {
                    reject(err);
                }
            );
        });
    }


    return {
        readUsers: readUsers,
        createUser: createUser,
        deleteUser: deleteUser,
        updateUser: updateUser,
        readUserById: readUserById,
        checkUser: checkUser,
        findUserByEmail: findUserByEmail,
        sendRecovery: sendRecovery
    };
};