/*global module, require */

module.exports = function (server) {
    'use strict';
    var configuration = require('./config.json');
    var _ = require('lodash');
    var bunyan = require('bunyan');
    var packageJson = require('../package.json');
    var mongoose = require('mongoose');

    var log = bunyan.createLogger({
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

    var transporter = _.extend({
        config: configuration,
        helpers: helpers,
        mongoose: mongoose,
        log: log,
        middlewares: middlewares,
        mongoosePlugins: mongoosePlugins,
        models: models,
        controllers: controllers,
        acl: require('./api/acl.json')
    }, server);




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
    loader(__dirname + '/shared/schemas', /\.schema\.js$/, function (file) {
        var name = _.capitalize(_.camelCase(file.filename.replace(/\..*/, '')));
        var schema = require(file.fullPathname)(transporter);
        log.info('MODELS: Loading ' + name);
        helpers.mongoosePlugin(schema);
        models[name] = mongoose.model(name, schema);
    });
    
    // LOAD CONTROLLERS
    // =============================================================================
    loader(__dirname + '/shared/controllers', /\.controller\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        log.info('CONTROLLERS: Loading ' + name);
        controllers[name] = require(file.fullPathname)(transporter);
    });

    return transporter;
};