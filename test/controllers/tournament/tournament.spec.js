(function () {
    'use strict';

    var assert = require('chai').assert;
    var testFrame = require('../../test-frame.js');
    var fixtures = require('./tournament.fixture.json');
    var _ = require('lodash');
    var user;

    describe('Tournament: Controller', function () {
    
        beforeEach(function (done) {
            var doInOrder = testFrame().helpers.doInOrder;
            var tasks = [
                doInOrder.next(
                    function() {
                        return testFrame().controllers.user.readUsers();
                    }
                )
            ];
            
            fixtures.forEach(function (tournamentData) {
                tasks.push(doInOrder.next(
                    function() {
                        user = _.first(arguments[arguments.length-1]);
                        return testFrame().controllers.tournament.createTournament(user._id, tournamentData);
                    }
                ));
            });
            
            doInOrder.execute(tasks).then(function () {
                done();
            }, function (err) {
                done(err || 'beforeEach');
            });
        });
        
        describe('#readTournaments', function () {
            it('Should read a tournament', function (done) {
                testFrame().controllers.tournament.readTournaments().then(
                    function (tournamentData) {
                        assert.isArray(tournamentData);
                        assert.equal(tournamentData.length, fixtures.length);
                        done()
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });
        
        describe('#deleteTournament', function () {
            it('Should delete a tournament', function (done) {
                var doInOrder = testFrame().helpers.doInOrder;
                doInOrder.execute([
                    doInOrder.next(
                        function() {
                            return testFrame().controllers.tournament.readTournaments(user._id)
                        }
                    ),
                    doInOrder.next(
                        function (tournamentData) {
                            return testFrame().controllers.tournament.deleteTournament(user._id, tournamentData[0]._id);
                        }
                    ),
                    doInOrder.next(
                        function() {
                            return testFrame().controllers.tournament.readTournaments(user._id);
                        }
                    )
                ]).then(function (data) {
                    var tournaments = _.first(data);
                    assert.equal(tournaments.length, fixtures.length - 1);
                    done();
                }, function (err) {
                    done(err);
                });

            });
        });
    
    });
})();