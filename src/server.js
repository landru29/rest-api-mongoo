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
        _.extend(
            {
                app: app
            },
            options
        )
    );

    var port = options.port || process.env.PORT;
    
    // REGISTER OUR ROUTES
    // =============================================================================
    app.use(globals.middlewares.cors);
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
