(function () {
    'use strict';
    var mongoose = require('mongoose');
    var configuration = require('../config.json');
    var loader = require('../shared/helpers/load.js');
    var _ = require('lodash');
    mongoose.connect('mongodb://' +
        configuration.application.database.host + ':' +
        configuration.application.database.port + '/' +
        configuration.application.database.name
    );
    var userSchema = require('../shared/schemas/user.schema.js')();
    var data = {
        models: {
            User: mongoose.model('User', userSchema)
        },
        helpers: {},
        config: configuration
    }
    
    loader(__dirname + '/../shared/helpers', /\.helper\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        data.helpers[name] = require(file.fullPathname)(data);
    });
    
    var controller = require('../api/user/api-user.controller.js')(data);
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
                console.log('insert', args);
                controller.createUser(args, function(err, data){
                    console.log(err, data);
                    mongoose.disconnect();
                });
                break;
            case 'read':
                controller.readUsers(function(err, data) {
                    console.log(err, data);
                    mongoose.disconnect();
                });
                break;
            case 'delete':
                controller.deleteUser(args.id, function(err) {
                    if (!err) {
                        console.log('User deleted');
                    } else {
                        console.log(err);
                    }
                    mongoose.disconnect();
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
                    mongoose.disconnect();
                });
                break;
            default:
                mongoose.disconnect();
        }
    } else {
        mongoose.disconnect();
    }

})();