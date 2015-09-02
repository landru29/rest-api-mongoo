(function () {
    'use strict';

    var assert = require('chai').assert;
    var application = require('../../application.js');
    var fixtures = require('./user.fixture.json');
    
    beforeEach(function (done) {
        var doInOrder = application().helpers.doInOrder;
        var tasks = fixtures.map(function (user) {
            return doInOrder.next(
                application().controllers.user.createUser,
                user
            );
        });
        doInOrder.execute(tasks).then(function () {
            done();
        }, function (err) {
            done(err || 'beforeEach');
        });
    });

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

        describe('#readUsers', function () {
            it('Should read a user', function (done) {
                application().controllers.user.readUsers().then(
                    function (users) {
                        assert.isArray(users);
                        assert.equal(users.length, fixtures.length);
                        done()
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });

        describe('#deleteUser', function () {
            it('Should delete a user', function (done) {
                var doInOrder = application().helpers.doInOrder;
                doInOrder.execute([
                    doInOrder.next(application().controllers.user.readUsers),
                    doInOrder.next(
                        function(users) {
                            return application().controllers.user.deleteUser(users[0]._id);
                        }
                    ),
                    doInOrder.next(application().controllers.user.readUsers, null)
                ]).then(function(data) {
                    assert.equal(data.length, fixtures.length - 1);
                    done();
                }, function(err){
                    done(err);
                });
                
            });
        });

        describe('#updateUser', function () {
            it('Should update a user', function (done) {
                var doInOrder = application().helpers.doInOrder;
                var newName = 'rococo';
                doInOrder.execute([
                    doInOrder.next(application().controllers.user.readUsers),
                    doInOrder.next(
                        function(users) {
                            return application().controllers.user.updateUser(users[0]._id, {
                                name: newName
                            });
                        }
                    ),
                    doInOrder.next(
                        function(updateStatus, users) {
                            return application().controllers.user.readUserById(users[0]._id);
                        }
                    )
                ]).then(function(updatedUser) {
                    assert.equal(updatedUser.name, newName);
                    done();
                }, function(err){
                    done(err);
                });
                
            });
        });
        
        describe('#checkUser', function () {
            it('Should check a user', function (done) {
                application().controllers.user.checkUser(fixtures[0].email, fixtures[0].password).then(
                    function(data) {
                        assert.isDefined(data['refresh-token']);
                        done();
                    },
                    function(err){
                        done(err);
                    }
                );
            });
        });
        
        describe('#findUserByEmail', function () {
            it('Should find a user with its email', function (done) {
                application().controllers.user.findUserByEmail(fixtures[0].email).then(
                    function(data) {
                        assert.isDefined(data.name);
                        done();
                    },
                    function(err){
                        done(err);
                    }
                );
            });
        });
    });
})();