/*global module, require*/
module.exports = function (server) {
    'use strict';

    var pathToRegexp = require('path-to-regexp');
    var _ = require('lodash');


    var getAcl = function(resource) {
        var routes = server.meta.routes;
        for (var route in routes) {
            if (routes.hasOwnProperty(route)) {
                var thisRouteMeta = routes[route];
                if ((pathToRegexp(route).test(resource.url)) && (thisRouteMeta[resource.method])) {
                    return {
                        acl: thisRouteMeta[resource.method].acl,
                        route: route,
                        url: resource.url
                    };
                }
            }
        }
        return false;
    };

    return function (req, res, next) {
        server.log.info('Acl middleware in action');
        var routeAcl = getAcl({url: req.url, method: req.method.toLowerCase()});
        server.log.info('  *', 'Route', routeAcl.route, 'URL', routeAcl.url);
        if (!routeAcl) {
            return res.status(403).send({message: 'No ACL'});
        }
        var acl = routeAcl.acl;
        if (acl) {
            if (!_.isArray(acl.role)) {
                acl.role = [acl.role];
            }
            if ('undefined' === typeof acl.authenticated) {
                acl.authenticated = true;
            }
            server.log.info('  *', 'Allow', acl.role);
            req.acl = acl;
            next();
        } else {
            return res.status(403).send({message: 'Bad ACL'});
        }
    };
};