(function () {
    'use strict';

    var assert = require('chai').assert;
    var testFrame = require('../../test-frame.js');
    var fixtures = require('./refresh-token.fixture.json');
    var _ = require('lodash');


    describe('Refresh-token: Controller', function () {

        beforeEach(function (done) {
            var doInOrder = testFrame().helpers.doInOrder;
            var tasks = fixtures.map(function (user) {
                return doInOrder.next(
                    testFrame().controllers.user.createUser,
                    user
                );
            });
            doInOrder.execute(tasks).then(function () {
                done();
            }, function (err) {
                done(err || 'beforeEach');
            });
        });

        describe('#generateAccessToken', function () {
            it('Should generate an accesstoken', function (done) {
                var doInOrder = testFrame().helpers.doInOrder;
                doInOrder.execute([
                    doInOrder.next(function () {
                        return testFrame().controllers.user.checkUser(fixtures[0].email, fixtures[0].password);
                    }),
                    doInOrder.next(function (userLogin) {
                        return testFrame().controllers.refreshToken.generateAccessToken(userLogin['refresh-token']);
                    })
                ]).then(function (data) {
                    var token = _.first(data);
                    assert.isDefined(token['access-token']);
                    done();
                }, function (err) {
                    done(err);
                });
            });
        });
    });
})();