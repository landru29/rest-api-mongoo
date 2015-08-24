/*global module, require*/
module.exports = function (server) {
    'use strict';
    
    var Acl = require('acl');
    var path = require('path');
    var pathToRegexp = require('path-to-regexp');
    var acl = new Acl(new Acl.memoryBackend());
    var _ = require('lodash');
    var routes = {};
    
    
    var readRoute = function(node, baseRoute, collection) {
        for (var subPath in node) {
            if (node.hasOwnProperty(subPath)) {
                if (!(/^\$/).test(subPath)) {
                    readRoute(node[subPath], path.join(baseRoute, subPath), collection);
                } else {
                    if (!collection[baseRoute]) {
                        collection[baseRoute] = {};
                    }
                    collection[baseRoute][subPath.replace(/^\$/, '').toLowerCase()] = node[subPath];
                }
            }
        }
    };

    readRoute(server.acl, '/', routes);
        
    var getAcl = function(resource) {
        for (var route in routes) {
            if (routes.hasOwnProperty(route)) {
                var re = pathToRegexp(route);
                if ((pathToRegexp(route).test(resource.url)) && (routes[route][resource.method])) {
                    return {
                        acl: routes[route][resource.method],
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
        if (!_.isArray(acl.role)) {
            acl.role = [acl.role];
        }
        server.log.info('  *', 'Allow', acl.role);
        req.acl = acl;
        next();
    };
};