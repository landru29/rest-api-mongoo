/*global module, require, process */

module.exports = function (options) {
    'use strict';
    var express = require('express'); // call express
    var expressApp = express(); // define our app using express
    var bodyParser = require('body-parser');
    var _ = require('lodash');


    // CONFIGURE THE SERVER
    // =============================================================================
    expressApp.use(bodyParser.urlencoded({
        extended: true
    }));
    expressApp.use(bodyParser.json());
    
    var App = require('./app.js');
    
    var application = new App(_.extend({
            app: expressApp,
            metaScanFile: __filename
        },
        options
    ));
    
    application.bootstrap(function(err) {
        var port = options.port || process.env.PORT;

        // REGISTER OUR ROUTES
        // =============================================================================
        expressApp.use(application.middlewares.cors);
        expressApp.use(require('serve-favicon')(__dirname + '/shared/public/favicon.ico'));
        expressApp.use(function (req, res, next) {
            application.log.info(req.method.toUpperCase(), req.url);
            next();
        });
        expressApp.use(application.middlewares.acl);
        expressApp.use(application.middlewares.requiredFields);

        /**
         * @followRoute ./server.route.js
         */
        require('./server.route.js')(application);

        // START THE SERVER
        // =============================================================================
        application.log.info('Launching server');

        try {
            expressApp.listen(port, function () {
                application.log.info('Server is listening on port ' + port);
            });
        } catch (error) {
            application.log.fatal('Port ' + port + ' is not free for use');
            throw error;
        }
    });

};