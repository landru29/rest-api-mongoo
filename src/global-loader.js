/*global module, require */
module.exports = function (server) {
    'use strict';
    var configuration = require('./config.json');
    var _ = require('lodash');
    var bunyan = require('bunyan');
    var packageJson = require('../package.json');
    var mongoose = require('mongoose');
    var path = require('path');

    var log = server.log ? server.log : bunyan.createLogger({
        name: packageJson.name
    });

    // CONNECT TO DATABASE
    // =============================================================================
    mongoose.connect('mongodb://' +
        configuration.application.database.host + ':' +
        configuration.application.database.port + '/' +
        configuration.application.database.name
    );

    // PROCESS OPTIONS
    // =============================================================================
    if (server.options) {
        if (server.options.logQuiet) {
            log = {
                trace: function(){},
                debug: function(){},
                info: function(){},
                warn: function(){},
                error: function(){},
                fatal: function(){}
            };
        }
    }

    // PREPARE THE DATA TO LOAD
    // =============================================================================
    var middlewares = {};
    var models = {};
    var mongoosePlugins = {};
    var helpers = {};
    var controllers = {};
    var loader = require('./shared/helpers/load.js');
    var routes = {};

    var transporter = _.extend({
        config: configuration,
        helpers: helpers,
        mongoose: mongoose,
        log: log,
        middlewares: middlewares,
        mongoosePlugins: mongoosePlugins,
        models: models,
        controllers: controllers,
        meta: {
            routes: routes
        }
    }, server);


    // LOAD API META
    // =============================================================================

    var loadRoute = function(node, baseRoute, collection) {
        if ('string' !== typeof node) {
            for (var subPath in node) {
                if (node.hasOwnProperty(subPath)) {
                    if (!(/^@/).test(subPath)) {
                        loadRoute(node[subPath], path.join(baseRoute, subPath), collection);
                    } else {
                        var method = subPath.replace(/^@/, '').toLowerCase();
                        log.info('   *', 'META', baseRoute, method.toUpperCase());
                        if (!collection[baseRoute]) {
                            collection[baseRoute] = {};
                        }
                        collection[baseRoute][method] = node[subPath];
                    }
                }
            }
        }
    };

    var scanPath = path.parse(server.metaScanFile ? server.metaScanFile : './api/api.json');
    if (scanPath.ext === '.json') {
        log.info('Getting meta from JSON');
        loadRoute(require('./api/api.json').endpoints, '/', routes);
    } else {
        log.info('Getting meta from source code');
        transporter.meta = {routes:require('./meta-loader')(transporter)};
    }

    // LOAD HELPERS
    // =============================================================================
    log.info('HELPERS: Loading load');
    helpers.loader = loader;
    loader(__dirname + '/shared/helpers', /\.helper\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        log.info('HELPERS: Loading ' + name);
        helpers[name] = require(file.fullPathname)(transporter);
    });

    // LOAD MIDDLEWARES
    // =============================================================================
    loader(__dirname + '/shared/middlewares', /\.middleware\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        log.info('MIDDLEWARES: Loading ' + name);
        middlewares[name] = require(file.fullPathname)(transporter);
    });

    // LOAD MONGOOSE PLUGINS
    // =============================================================================
    loader(__dirname + '/shared/mongoose-plugins', /\.plugin\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        log.info('MONGOOSE PLUGIN: Loading ' + name);
        mongoosePlugins[name] = require(file.fullPathname)(transporter);
    });


    // LOAD MODELS
    // =============================================================================
    var schemas = {};
    loader(__dirname + '/shared/schemas', /\.schema\.js$/, function (file) {
        var name = _.capitalize(_.camelCase(file.filename.replace(/\..*/, '')));
        var schemaDescriptor = require(file.fullPathname)(transporter);
        log.info('MODELS: Loading ' + name);
        helpers.mongoosePlugin(schemaDescriptor.schema);
        schemas[name] = schemaDescriptor;
        //models[name] = mongoose.model(name, schema);
    });
    for(var name in schemas) {
        if (schemas[name].postLoad) {
            schemas[name].postLoad();
        }
    }
    for(var schName in schemas) {
        models[schName] = mongoose.model(schName, schemas[schName].schema);
    }
    
    // LOAD CONTROLLERS
    // =============================================================================
    loader(__dirname + '/shared/controllers', /\.controller\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        log.info('CONTROLLERS: Loading ' + name);
        controllers[name] = require(file.fullPathname)(transporter);
    });

    return transporter;
};