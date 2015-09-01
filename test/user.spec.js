(function () {
    'use strict';

    var application = require('./application.js');
    var assert = require('chai').assert;

    describe('User: Controller', function () {
        describe('#createUser', function () {
            it('Should create a user', function (done) {
                application().controllers.user.createUser({
                    name: 'mickey',
                    email: 'mickey@mouse.com',
                    password: 'plutot'
                }).then(
                    function (user) {
                        try {
                            assert.isDefined(user);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    },
                    function (err) {
                        done(err);
                    });
            });
            it('Should reject the creation of the same user', function (done) {
                application().controllers.user.createUser({
                    name: 'mickey',
                    email: 'mickey@mouse.com',
                    password: 'plutot'
                }).then(
                    function (user1) {
                        try {
                            assert.isDefined(user1);
                        } catch (e) {
                            done(e);
                        }
                        application().controllers.user.createUser({
                            name: 'minnie',
                            email: user1.email,
                            password: 'dingo'
                        }).then(
                            function (user2) {
                                done('Should not create the second user');
                            },
                            function (err) {
                                try {
                                    assert.isDefined(err);
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            });
                    },
                    function (err) {
                        done(err);
                    });
            });
        });
    });
})();