(function () {
    'use strict';
    var chalk = require('chalk');
    var App = require('../src/app.js');
    var application = new App({
        options: {
            logQuiet: true
        }
    });

    application.bootstrap(function () {

        var controller = application.controllers.application;
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
                controller.createApplication(args, function (err, data) {
                    if (err) {
                        console.log(chalk.red('ERROR'), err);
                    } else {
                        console.log(chalk.green('SUCCESS'), data);
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
            case 'read':
                console.log(chalk.blue('Read'), args);
                controller.readApplications(function (err, data) {
                    if (err) {
                        console.log(chalk.red('ERROR'), err);
                    } else {
                        console.log(chalk.green('SUCCESS'), data);
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
            case 'delete':
                console.log(chalk.blue('Delete'), args);
                controller.deleteApplication(args.id, function (err) {
                    if (!err) {
                        console.log(chalk.green('SUCCESS'), 'Application deleted');
                    } else {
                        console.log(chalk.red('ERROR'), err);
                    }
                    application.mongoose.instance.disconnect();;
                });
                break;
            case 'update':
                console.log(chalk.blue('Delete'), args);
                var id = args.id;
                delete args.id;
                controller.updateApplication(id, args, function (err, data) {
                    if (!err) {
                        console.log(chalk.green('SUCCESS'), 'Application updated', data);
                    } else {
                        console.log(chalk.red('ERROR'), err);
                    }
                    application.mongoose.instance.disconnect();
                });
                break;
            default:
                application.mongoose.instance.disconnect();
            }
        } else {
            console.log(chalk.red('Missing action=insert|read|delete|update'));
            application.mongoose.instance.disconnect();
        }
    });

})();