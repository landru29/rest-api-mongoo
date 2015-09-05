(function () {
    'use strict';

    var assert = require('chai').assert;
    var testFrame = require('../../test-frame.js');
    var fixtures = require('./user-confirm.fixture.json');
    var _ = require('lodash');
    var currentTokens;


    describe('User-confirm: Controller', function () {

        beforeEach(function (done) {
            var doInOrder = testFrame().helpers.doInOrder;
            var tasks = fixtures.map(function (email) {
                return doInOrder.next(
                    function () {
                        return testFrame().controllers.userConfirm.createToken(email.email);
                    }
                );
            });
            doInOrder.execute(tasks).then(function (data) {
                currentTokens = data;
                done();
            }, function (err) {
                done(err || 'beforeEach');
            });
        });

        describe('#createToken', function () {
            it('Should create a token', function (done) {
                assert.isDefined(currentTokens[0].token);
                done();
            });

        });

        describe('#findByToken', function () {
            it('Should find a token', function (done) {
                var oneToken = currentTokens[1];
                testFrame().controllers.userConfirm.findByToken(oneToken.token).then(
                    function (data) {
                        assert.isDefined(data.email);
                        assert.isDefined(data.token);
                        done();
                    },
                    function (err) {
                        done(err);
                    });
            });
        });

        describe('#cleanTokens', function () {
            it('Should clean the out-of-date token', function (done) {
                done();
            });
        });

        describe('#deleteToken', function () {
            it('Should delete a token', function (done) {
                var doInOrder = testFrame().helpers.doInOrder;
                doInOrder.execute([
                    doInOrder.next(function() {
                        return testFrame().controllers.userConfirm.deleteToken(fixtures[0].token);
                    }),
                    doInOrder.next(function() {
                        return testFrame().controllers.userConfirm.findByToken(fixtures[0].token);
                    })
                ]).then(function (data) {
                    done('Should not find any token');
                }, function (err) {
                    assert.equal(err, 'Token not found');
                    done();
                });

            });
        });    

    });
})();