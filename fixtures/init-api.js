(function () {
    'use strict';
    var q = require('q');
    var chalk = require('chalk');
    var globals = require('../src/global-loader.js')({
        options: {
            logQuiet: true
        }
    });
    var config = require('./config.json');
    
    // DEFINE FIXTURES
    // =============================================================================
    
    var firstUserCreation = function() {
        return q.promise(function(resolve, reject){
            var userCreate = globals.controllers.user.createUser(config.user);
            var applicationCreate = globals.controllers.application.createApplication(config.application);

            q.all([userCreate, applicationCreate]).then(
                function(data){
                    var user = data[0];
                    var application= data[1];
                    globals.controllers.user.updateUser(user._id, {
                        addAppId: application._id
                    }).then(
                        function(data) {
                            resolve({
                                message: 'User created',
                                data: config.user
                            });
                        }, function(err) {
                            reject(err);
                        }
                    );
                    
                }, 
                function(err){
                    reject(err);
                }
            );
            
        });
    };
    
    
    
    // LAUNCH ALL FIXTURES
    // =============================================================================
    q.all([
        firstUserCreation()
    ]).then(
        function(data) {
            console.log(chalk.green('SUCCESS'), data);
            globals.mongoose.disconnect();
        }, 
        function(err){
            console.log(chalk.red('ERROR'), err);
            globals.mongoose.disconnect();
        }
    );

})();