(function() {
  'use strict';

  var assert = require('chai').assert;
  var testFrame = require('../../test-frame.js');
  var fixtures = require('./user-confirm.fixture.json');
  var userFixtures = require('./user.fixture.json');
  var _ = require('lodash');
  var waterfall = require('promise-waterfall');
  var currentTokens;


  describe('User-confirm: Controller', function() {

    beforeEach(function(done) {
      currentTokens = [];
      var tasks = userFixtures.map(function(user) {
        return function() {
          return testFrame().controllers.user.createUser(user);
        }
      }).concat(fixtures.map(function(email) {
        return function(token) {
          currentTokens.push(token);
          return testFrame().controllers.userConfirm.createToken(email.email);
        };
      }));

      waterfall(tasks).then(function(lastToken) {
        currentTokens.push(lastToken);
        currentTokens.splice(0,1);
        done();
      }, function(err) {
        done(err || 'beforeEach');
      });
    });

    describe('#createToken', function() {
      it('Should create a token', function(done) {
        assert.isDefined(currentTokens[0].token);
        done();
      });
    });

    describe('#findByToken', function() {
      it('Should find a token', function(done) {
        var oneToken = currentTokens[1];
        testFrame().controllers.userConfirm.findByToken(oneToken.token).then(
          function(data) {
            assert.isDefined(data.email);
            assert.isDefined(data.token);
            done();
          },
          function(err) {
            done(err);
          });
      });
    });

    describe('#cleanTokens', function() {
      it('Should clean the out-of-date token', function(done) {
        done();
      });
    });

  });
})();
