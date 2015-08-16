// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var mongoose      = require('mongoose');
var configuration = require('./config.json');
var _             = require('lodash');
var bunyan        = require('bunyan');
var package       = require('../package.json');

var log = bunyan.createLogger({name: package.name});

// CONNECT TO DATABASE
// =============================================================================
mongoose.connect('mongodb://' + 
                 configuration.application.database.host + ':' + 
                 configuration.application.database.port + '/' + 
                 configuration.application.database.name
                );

// CONFIGURE THE SERVER
// =============================================================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || configuration.server.port;


// LOAD HELPERS
// =============================================================================
log.info('HELPERS: Loading load');
var loader = require('./shared/helpers/load.js');
var helpers = {loader:loader};
loader(__dirname + '/shared/helpers', /\.helper\.js$/, function(file) {
    var name = _.camelCase(file.filename.replace(/\..*/, ''));
    helpers[name] = require(file.fullPathname)({
        app:app, 
        mongoose:mongoose,
        config: configuration,
        helpers: helpers,
        log: log
    });
    log.info('HELPERS: Loading ' + name);
});

// LOAD MIDDLEWARES
// =============================================================================
var middlewares = {};
loader(__dirname + '/shared/middlewares', /\.middleware\.js$/, function(file) {
    var name = _.camelCase(file.filename.replace(/\..*/, ''));
    middlewares[name] = require(file.fullPathname)({
        app:app, 
        mongoose:mongoose,
        config: configuration,
        helpers: helpers,
        log: log
    });
    log.info('MIDDLEWARES: Loading ' + name);
});

// REGISTER OUR ROUTES
// =============================================================================
require('./server.route.js')({
    app:app, 
    mongoose:mongoose,
    config: configuration,
    helpers: helpers,
    log: log,
    middlewares: middlewares
});

// START THE SERVER
// =============================================================================
app.listen(port);
log.info('Server is listening on port ' + port);