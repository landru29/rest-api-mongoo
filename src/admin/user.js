(function () {
    'use strict';
    var globals = require('../global-loader.js')({
        options: {
            logQuiet: true
        }
    });
    
    var controller = globals.controllers.user;
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
                controller.createUser(args, function(err, data){
                    console.log(err, data);
                    globals.mongoose.disconnect();
                });
                break;
            case 'read':
                controller.readUsers(function(err, data) {
                    console.log(err, data);
                    globals.mongoose.disconnect();
                });
                break;
            case 'delete':
                controller.deleteUser(args.id, function(err) {
                    if (!err) {
                        console.log('User deleted');
                    } else {
                        console.log(err);
                    }
                    globals.mongoose.disconnect();
                });
                break;
            case 'update':
                var id = args.id;
                delete args.id;
                controller.updateUser(id, args, function(err, data){
                    if (!err) {
                        console.log('User updated', data);
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