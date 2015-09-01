(function () {
    'use strict';
    var q = require('q');
    var chalk = require('chalk');
    var App = require('../src/app.js');
    var config = require('./config.json');
    var thisApplication = new App({
        options: {
            logQuiet: true
        }
    });

    // DEFINE FIXTURES
    // =============================================================================

    var firstUserCreation = function () {
        return q.promise(function (resolve, reject) {
            var userCreate = thisApplication.controllers.user.createUser(config.user);
            var applicationCreate = thisApplication.controllers.application.createApplication(config.application);

            q.all([userCreate, applicationCreate]).then(
                function (data) {
                    var user = data[0];
                    var application = data[1];
                    thisApplication.controllers.user.updateUser(user._id, {
                        addAppId: application._id
                    }).then(
                        function (data) {
                            resolve({
                                message: 'User created',
                                data: config.user
                            });
                        },
                        function (err) {
                            reject(err);
                        }
                    );

                },
                function (err) {
                    reject(err);
                }
            );

        });
    };


    thisApplication.bootstrap(function () {

        // LAUNCH ALL FIXTURES
        // =============================================================================
        q.all(
            [
                firstUserCreation()
            ]
        ).then(
            function (data) {
                console.log(chalk.green('SUCCESS'), data);
                thisApplication.mongoose.instance.disconnect();
            },
            function (err) {
                console.log(chalk.red('ERROR'), err);
                thisApplication.mongoose.instance.disconnect();
            }
        );
    });

})();