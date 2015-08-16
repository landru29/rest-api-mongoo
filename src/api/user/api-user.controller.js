module.exports = function (server) {
    'use strict';
    var User = require('./api-user.model.js');

    function readUsers(callback) {
        User.find(callback);
    }

    function readUserById(id, callback) {
        User.findById(id, callback);
    }

    function createUser(userData, callback) { 
        var user = new User();
        user.name = userData.name;
        user.email = userData.email;
        user.save(callback);
    }

    function deleteUser(id, callback) {
        User.remove({
            _id: id
        }, callback);
    }

    function updateUser(id, userData, callback) {
        User.findById(id, function (err, user) {
            if (err) {
                return callback(err);
            }

            user.name = userData.name;
            user.save(callback);
        });
    }


    return {
        readUsers: readUsers,
        createUser: createUser,
        deleteUser: deleteUser,
        updateUser: updateUser,
        readUserById: readUserById
    };
};