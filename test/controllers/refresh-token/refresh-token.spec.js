(function() {
  'use strict';

  var assert = require('chai').assert;
  var testFrame = require('../../test-frame.js');
  var fixtures = require('./refresh-token.fixture.json');
  var _ = require('lodash');
  var waterfall = require('promise-waterfall');


  describe('Refresh-token: Controller', function() {

    beforeEach(function(done) {
      waterfall(
        fixtures.map(function(user) {
          return function() {
            return testFrame().controllers.user.createUser(user);
          };
        })
      ).then(function() {
        done();
      }, function(err) {
        done(err || 'beforeEach');
      });
    });

    describe('#generateAccessToken', function() {
      it('Should generate an accesstoken', function(done) {
        waterfall([
          function() {
            return testFrame().controllers.user.checkUser(_.first(fixtures).email, _.first(fixtures).password);
          },
          function(userLogin) {
            return testFrame().controllers.refreshToken.generateAccessToken(userLogin['refresh-token']);
          }
        ]).then(function(token) {
          assert.isDefined(token['access-token']);
          done();
        }, function(err) {
          done(err);
        });
      });
    });
  });
})();
