/*global module, require, process */

var serverApp = function () {
    'use strict';
    var express = require('express'); // call express
    var app = express(); // define our app using express
    var bodyParser = require('body-parser');
    var mongoose = require('mongoose');
    var configuration = require('./config.json');
    var _ = require('lodash');
    var bunyan = require('bunyan');
    var packageJson = require('../package.json');

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

    // CONFIGURE THE SERVER
    // =============================================================================
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    var port = process.env.PORT || configuration.server.port;


    var middlewares = {};
    var models = {};
    var mongoosePlugins = {};
    var helpers = {};
    var loader = require('./shared/helpers/load.js');

    var transporter = {
        app: app,
        mongoose: mongoose,
        config: configuration,
        helpers: helpers,
        log: log,
        middlewares: middlewares,
        mongoosePlugins: mongoosePlugins,
        models: models,
        acl: require('./api/acl.json')
    };

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

    // REGISTER OUR ROUTES
    // =============================================================================
    app.use(function(req, res, next) {
        log.info(req.method.toUpperCase(), req.url);
        next();
    });
    app.use(middlewares.acl);
    require('./server.route.js')(transporter);

    // START THE SERVER
    // =============================================================================
    app.listen(port);
    log.info('Server is listening on port ' + port);
};

serverApp();
module.exports = serverApp;