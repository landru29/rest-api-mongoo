(function () {
    'use strict';

    var assert = require('chai').assert;
    var testFrame = require('../../test-frame.js');
    var fixtures = require('./application.fixture.json');



    describe('Application: Controller', function () {

        beforeEach(function (done) {
            var doInOrder = testFrame().helpers.doInOrder;
            var tasks = fixtures.map(function (appli) {
                return doInOrder.next(
                    testFrame().controllers.application.createApplication,
                    appli
                );
            });
            doInOrder.execute(tasks).then(function () {
                done();
            }, function (err) {
                done(err || 'beforeEach');
            });
        });

        describe('#createApplication', function () {
            it('Should create an application', function (done) {
                testFrame().controllers.application.createApplication({
                    name: 'mickey'
                }).then(
                    function (appli) {
                        try {
                            assert.isDefined(appli);
                            assert.isDefined(appli.name);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    },
                    function (err) {
                        done(err);
                    });
            });
            it('Should reject the creation of the same application', function (done) {
                testFrame().controllers.application.createApplication({
                    name: 'mickey'
                }).then(
                    function (appli1) {
                        try {
                            assert.isDefined(appli1);
                        } catch (e) {
                            done(e);
                        }
                        testFrame().controllers.application.createApplication({
                            name: 'mickey',
                        }).then(
                            function (appli2) {
                                done('Should not create the second application');
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

        describe('#readApplications', function () {
            it('Should read an application', function (done) {
                testFrame().controllers.application.readApplications().then(
                    function (appli) {
                        assert.isArray(appli);
                        assert.equal(appli.length, fixtures.length);
                        done()
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });

        describe('#deleteApplication', function () {
            it('Should delete an application', function (done) {
                var doInOrder = testFrame().helpers.doInOrder;
                doInOrder.execute([
                    doInOrder.next(testFrame().controllers.application.readApplications),
                    doInOrder.next(
                        function (applis) {
                            return testFrame().controllers.application.deleteApplication(applis[0]._id);
                        }
                    ),
                    doInOrder.next(testFrame().controllers.application.readApplications, null)
                ]).then(function (data) {
                    assert.equal(data.length, fixtures.length - 1);
                    done();
                }, function (err) {
                    done(err);
                });

            });
        });

        describe('#updateApplication', function () {
            it('Should update an application', function (done) {
                var doInOrder = testFrame().helpers.doInOrder;
                var newName = 'rococo';
                doInOrder.execute([
                    doInOrder.next(testFrame().controllers.application.readApplications),
                    doInOrder.next(
                        function (applis) {
                            return testFrame().controllers.application.updateApplication(applis[0]._id, {
                                name: newName
                            });
                        }
                    ),
                    doInOrder.next(
                        function (updateStatus, applis) {
                            return testFrame().controllers.application.readApplicationById(applis[0]._id);
                        }
                    )
                ]).then(function (updatedAppli) {
                    assert.equal(updatedAppli.name, newName);
                    done();
                }, function (err) {
                    done(err);
                });

            });
        });


    });
})();