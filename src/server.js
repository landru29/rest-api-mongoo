/*global module, require, process */

var serverApp = function () {
    'use strict';
    var express = require('express'); // call express
    var app = express(); // define our app using express
    var bodyParser = require('body-parser');
    var mongoose = require('mongoose');


    // CONFIGURE THE SERVER
    // =============================================================================
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    var globals = require('./global-loader.js')({
        app: app
    });

    var port = process.env.PORT || globals.config.server.port;
    
    // REGISTER OUR ROUTES
    // =============================================================================
    app.use(function(req, res, next) {
        globals.log.info(req.method.toUpperCase(), req.url);
        next();
    });
    app.use(globals.middlewares.acl);
    require('./server.route.js')(globals);

    // START THE SERVER
    // =============================================================================
    app.listen(port);
    globals.log.info('Server is listening on port ' + port);
};

serverApp();
module.exports = serverApp;