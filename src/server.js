/*global module, require, process */

module.exports = function (options) {
    'use strict';
    var express = require('express'); // call express
    var app = express(); // define our app using express
    var bodyParser = require('body-parser');
    var _ = require('lodash');


    // CONFIGURE THE SERVER
    // =============================================================================
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    var globals = require('./global-loader.js')(
        _.extend({
                app: app,
                metaScanFile: __filename
            },
            options
        )
    );

    var port = options.port || process.env.PORT;

    // REGISTER OUR ROUTES
    // =============================================================================
    app.use(globals.middlewares.cors);
    app.use(function (req, res, next) {
        globals.log.info(req.method.toUpperCase(), req.url);
        next();
    });
    app.use(globals.middlewares.acl);
    
    /**
     * @followRoute ./server.route.js
     */
    require('./server.route.js')(globals);

    // START THE SERVER
    // =============================================================================
    globals.log.info('Launching server');

    try {
        app.listen(port, function () {
            globals.log.info('Server is listening on port ' + port);
        });
    } catch (err) {
        globals.log.fatal('Port ' + port + ' is not free for use');
        throw err;
    }

};