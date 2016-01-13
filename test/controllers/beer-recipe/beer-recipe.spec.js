(function () {
    'use strict';

    var assert = require('chai').assert;
    var testFrame = require('../../test-frame.js');
    var fixtures = require('./beer-recipe.fixture.json');
    var _ = require('lodash');
    var user;

    describe('BeerRecipe: Controller', function () {

        beforeEach(function (done) {
            var doInOrder = testFrame().helpers.doInOrder;
            var tasks = [
                doInOrder.next(
                    function() {
                        return testFrame().controllers.user.readUsers();
                    }
                )
            ];

            fixtures.forEach(function (recipeData) {
                tasks.push(doInOrder.next(
                    function() {
                        user = _.first(arguments[arguments.length-1]);
                        return testFrame().controllers.beerRecipe.createRecipe(user._id, recipeData);
                    }
                ));
            });

            doInOrder.execute(tasks).then(function () {
                done();
            }, function (err) {
                done(err || 'beforeEach');
            });
        });

        describe('#readRecipes', function () {
            it('Should read a recipe', function (done) {
                testFrame().controllers.beerRecipe.readRecipes().then(
                    function (recipeData) {
                        assert.isArray(recipeData);
                        recipeData.forEach(function(elt) {
                          assert.isArray(elt.steps);
                          assert.isString(elt.author);
                        });
                        assert.equal(recipeData.length, fixtures.length);
                        done()
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });

        describe('#deleteecipe', function () {
            it('Should delete a recipe', function (done) {
                var doInOrder = testFrame().helpers.doInOrder;
                doInOrder.execute([
                    doInOrder.next(
                        function() {
                            return testFrame().controllers.beerRecipe.readRecipes(user._id)
                        }
                    ),
                    doInOrder.next(
                        function (recipeData) {
                            return testFrame().controllers.beerRecipe.deleteRecipe(user._id, recipeData[0]._id);
                        }
                    ),
                    doInOrder.next(
                        function() {
                            return testFrame().controllers.beerRecipe.readRecipes(user._id);
                        }
                    )
                ]).then(function (data) {
                    var recipes = _.first(data);
                    assert.equal(recipes.length, fixtures.length - 1);
                    done();
                }, function (err) {
                    done(err);
                });

            });
        });

    });
})();
