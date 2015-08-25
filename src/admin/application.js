(function () {
    'use strict';
    var globals = require('../global-loader.js')({
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
                console.log('Insert', args);
                controller.createApplication(args, function(err, data){
                    console.log(err, data);
                    globals.mongoose.disconnect();
                });
                break;
            case 'read':
                controller.readApplications(function(err, data) {
                    console.log(err, data);
                    globals.mongoose.disconnect();
                });
                break;
            case 'delete':
                controller.deleteApplication(args.id, function(err) {
                    if (!err) {
                        console.log('Application deleted');
                    } else {
                        console.log(err);
                    }
                    globals.mongoose.disconnect();
                });
                break;
            case 'update':
                var id = args.id;
                delete args.id;
                controller.updateApplication(id, args, function(err, data){
                    if (!err) {
                        console.log('Application updated', data);
                    } else {
                        console.log(err);
                    }
                    globals.mongoose.disconnect();
                });
                break;
            default:
                globals.mongoose.disconnect();
        }
    } else {
        globals.mongoose.disconnect();
    }

})();