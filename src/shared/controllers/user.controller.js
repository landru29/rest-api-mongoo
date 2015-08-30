module.exports = function (server) {
    'use strict';
    var User = server.models.User;
    var _ = require('lodash');
    
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
     */
    function readUsers(callback) {
        User.find(callback);
    }

    /**
     * Get a user by ID
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     */
    function readUserById(id, callback) {
        User.findById(id, callback);
    }

    /**
     * Create a user
     * @param {Object}   userData User {name, email, password}
     * @param {function} callback Callback function
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
        user.save(function(err, createdUser) {
            if (!err) {
                callback(null, _.extend(
                    {
                        'refresh-token': generateRefreshToken(createdUser)
                    },
                    createdUser._doc
                ));
            } else {
                 callback(err);
            }
        });
    }

    /**
     * Delete a user
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     */
    function deleteUser(id, callback) {
        User.remove({
            _id: id
        }, callback);
    }

    /**
     * [[Description]]
     * @param {String} id         User Identifier
     * @param {Object}   userData User {name, email, password}
     * @param {function} callback Callback function
     */
    function updateUser(id, userData, callback) {
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
            user.save(callback);
        });
    }
    
    /**
     * Check a user with its email and password
     * @param   {String} email    User email
     * @param   {String} password User password
     * @param {function} callback Callback function
     */
    function checkUser(email, password, callback) {
        User.find({
            email: email
        }, function(err, data){
            if (data.length !== 1) {
                return callback('Failed to login');
            } else {
                if (_.first(data).comparePassword(password)) {
                    return callback(null, {'refresh-token': generateRefreshToken(_.first(data))});
                } else {
                    return callback('Failed to login');
                }
            }
        });
    }


    return {
        readUsers: readUsers,
        createUser: createUser,
        deleteUser: deleteUser,
        updateUser: updateUser,
        readUserById: readUserById,
        checkUser: checkUser
    };
};