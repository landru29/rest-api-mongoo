(function () {
    'use strict';
    var chalk = require('chalk');
    var globals = require('../src/global-loader.js')({
        options: {
            logQuiet: true
        }
    });
    
    var controller = globals.controllers.application;
    var args = {};

    process.argv.forEach(function (val, index, array) {
        var arg = val.split('=');
        if (arg[1]) {
            args[arg[0]] = arg[1];
        }
    });
    
    if (args.action) {
        var action = args.action;
        delete args.action;
        switch (action) {
            case 'insert': 
                console.log(chalk.blue('Insert'), args);
                controller.createApplication(args, function(err, data){
                    if (err) {
                        console.log(chalk.red('ERROR'), err);
                    } else {
                        console.log(chalk.green('SUCCESS'), data);
                    }
                    globals.mongoose.disconnect();
                });
                break;
            case 'read':
                console.log(chalk.blue('Read'), args);
                controller.readApplications(function(err, data) {
                    if (err) {
                        console.log(chalk.red('ERROR'), err);
                    } else {
                        console.log(chalk.green('SUCCESS'), data);
                    }
                    globals.mongoose.disconnect();
                });
                break;
            case 'delete':
                console.log(chalk.blue('Delete'), args);
                controller.deleteApplication(args.id, function(err) {
                    if (!err) {
                        console.log(chalk.green('SUCCESS'), 'Application deleted');
                    } else {
                        console.log(chalk.red('ERROR'),err);
                    }
                    globals.mongoose.disconnect();
                });
                break;
            case 'update':
                console.log(chalk.blue('Delete'), args);
                var id = args.id;
                delete args.id;
                controller.updateApplication(id, args, function(err, data){
                    if (!err) {
                        console.log(chalk.green('SUCCESS'), 'Application updated', data);
                    } else {
                        console.log(chalk.red('ERROR'),err);
                    }
                    globals.mongoose.disconnect();
                });
                break;
            default:
                globals.mongoose.disconnect();
        }
    } else {
        console.log(chalk.red('Missing action=insert|read|delete|update'));
        globals.mongoose.disconnect();
    }

})();