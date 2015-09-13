/*global module, require */
(function () {
    'use strict';

    var _ = require('lodash');
    var bunyan = require('bunyan');
    var packageJson = require('../package.json');
    var mongoose = require('mongoose');
    var path = require('path');

    // PREPARE THE DATA TO LOAD
    // =============================================================================
    var loader = require('./shared/helpers/load.js');

    var App = function (server) {
        _.extend(this, server);
        this.config = require('./config.json');
        this.helpers = {};
        this.log = server.log ? server.log : bunyan.createLogger({
            name: packageJson.name
        });
        this.mongoose = {
            plugins: [],
            schemas: {},
            instance: null
        };
        this.rootFolder = __dirname;
        this.middlewares = {};
        this.controllers = {};
        this.meta = {
            routes: {}
        };
        this.getModel = function (modelName) {
            return this.mongoose.instance.model(modelName);
        };
        if (!this.options) {
            this.options = {};
        }
    };
    
    App.prototype.bootstrap = function(ready) {
        var self = this;
        this.connectDb(
            function(mongoErr) {
                self.loadAll(mongoErr, ready);
            }
        );
    };


    // CONNECT TO DATABASE
    // =============================================================================

    App.prototype.connectDb = function (callback) {
        var mongooseConnectionChain = 'mongodb://' +
            this.config.application.database.host + ':' +
            this.config.application.database.port + '/' +
            this.config.application.database.name;
        this.mongoose.instance = mongoose.connect(this.options.mongooseConnectionChain ? this.options.mongooseConnectionChain : mongooseConnectionChain, callback);
    };


    App.prototype.reloadModels = function () {
        for (var model in this.mongoose.instance.model) {
            if (this.mongoose.instance.model.hasOwnProperty(model)) {
                delete this.mongoose.instance.model[model];
            }
        }
        for (var name in this.mongoose.schemas) {
            if (this.mongoose.schemas.hasOwnProperty(name)) {
                this.mongoose.instance.model(name, this.mongoose.schemas[name].schema);
            }
        }
    };


    App.prototype.loadAll = function (mongooseErr, ready) {
        
        var self = this;

        // PROCESS OPTIONS
        // =============================================================================
        if (this.options.logQuiet) {
            this.log = {
                trace: function () {},
                debug: function () {},
                info: function () {},
                warn: function () {},
                error: function () {},
                fatal: function () {}
            };
        }


        // LOAD API META
        // =============================================================================

        var loadRoute = function (node, baseRoute, collection) {
            if ('string' !== typeof node) {
                for (var subPath in node) {
                    if (node.hasOwnProperty(subPath)) {
                        if (!(/^@/).test(subPath)) {
                            loadRoute(node[subPath], path.join(baseRoute, subPath), collection);
                        } else {
                            var method = subPath.replace(/^@/, '').toLowerCase();
                            self.log.info('   *', 'META', baseRoute, method.toUpperCase());
                            if (!collection[baseRoute]) {
                                collection[baseRoute] = {};
                            }
                            collection[baseRoute][method] = node[subPath];
                        }
                    }
                }
            }
        };

        var scanPath = path.parse(this.metaScanFile ? this.metaScanFile : './api/api.json');
        if (scanPath.ext === '.json') {
            this.log.info('Getting meta from JSON');
            loadRoute(require('./api/api.json').endpoints, '/', this.meta.routes);
        } else {
            this.log.info('Getting meta from source code');
            this.meta = {
                routes: require('./meta-loader')(this)
            };
        }

        // LOAD HELPERS
        // =============================================================================
        this.log.info('HELPERS: Loading load');
        this.helpers.loader = loader;
        loader(__dirname + '/shared/helpers', /\.helper\.js$/, function (file) {
            var name = _.camelCase(file.filename.replace(/\..*/, ''));
            self.log.info('HELPERS: Loading ' + name);
            self.helpers[name] = require(file.fullPathname)(self);
        });

        // LOAD MIDDLEWARES
        // =============================================================================
        loader(__dirname + '/shared/middlewares', /\.middleware\.js$/, function (file) {
            var name = _.camelCase(file.filename.replace(/\..*/, ''));
            self.log.info('MIDDLEWARES: Loading ' + name);
            self.middlewares[name] = require(file.fullPathname)(self);
        });

        // LOAD MONGOOSE PLUGINS
        // =============================================================================
        loader(__dirname + '/shared/mongoose-plugins', /\.plugin\.js$/, function (file) {
            var name = _.camelCase(file.filename.replace(/\..*/, ''));
            self.log.info('MONGOOSE PLUGIN: Loading ' + name);
            self.mongoose.plugins[name] = require(file.fullPathname)(self);
        });


        // LOAD MODELS
        // =============================================================================
        loader(__dirname + '/shared/schemas', /\.schema\.js$/, function (file) {
            var name = _.capitalize(_.camelCase(file.filename.replace(/\..*/, '')));
            var schemaDescriptor = require(file.fullPathname)(self);
            self.log.info('MODELS: Loading ' + name);
            self.helpers.mongoosePlugin(schemaDescriptor.schema);
            self.mongoose.schemas[name] = schemaDescriptor;
        });
        for (var name in this.mongoose.schemas) {
            if (this.mongoose.schemas[name].postLoad) {
                this.mongoose.schemas[name].postLoad();
            }
        }

        this.reloadModels();

        // LOAD CONTROLLERS
        // =============================================================================
        loader(__dirname + '/shared/controllers', /\.controller\.js$/, function (file) {
            var name = _.camelCase(file.filename.replace(/\..*/, ''));
            self.log.info('CONTROLLERS: Loading ' + name);
            self.controllers[name] = require(file.fullPathname)(self);
        });


        if (ready) {
            ready(mongooseErr);
        }
    };

    module.exports =  App;
})();