/*global module, require*/
module.exports = function (server) {
    'use strict';
    
    var Acl = require('acl');
    var path = require('path');
    var pathToRegexp = require('path-to-regexp');
    var acl = new Acl(new Acl.memoryBackend());
    var _ = require('lodash');
    var routes = {};
    
    
    var loadRoute = function(node, baseRoute, collection) {
        for (var subPath in node) {
            if (node.hasOwnProperty(subPath)) {
                if (!(/^\$/).test(subPath)) {
                    loadRoute(node[subPath], path.join(baseRoute, subPath), collection);
                } else {
                    var method = subPath.replace(/^\$/, '').toLowerCase();
                    server.log.info(' -', 'ACL', baseRoute, method.toUpperCase());
                    if (!collection[baseRoute]) {
                        collection[baseRoute] = {};
                    }
                    collection[baseRoute][method] = node[subPath];
                }
            }
        }
    };
        
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
    
    
    loadRoute(server.acl, '/', routes);

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
        if ('undefined' === typeof acl.authenticated) {
            acl.authenticated = true;
        }
        server.log.info('  *', 'Allow', acl.role);
        req.acl = acl;
        next();
    };
};