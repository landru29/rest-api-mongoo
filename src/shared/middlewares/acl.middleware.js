/*global module, require*/
module.exports = function (server) {
    'use strict';

    
    var _ = require('lodash');

    return function (req, res, next) {
        server.log.info('Acl middleware in action');
        var routeDesc = server.helpers.getRouteDescriptor(req);
        if (routeDesc) {
            server.log.info('  *', 'Route', routeDesc.route, 'URL', routeDesc.url);
        } else {
            server.log.info('  *', 'No ACL on', req.method.toUpperCase(), req.url);
            return res.status(403).send({message: 'No ACL'});
        }
        var acl = routeDesc.descriptor.acl;
        if (acl) {
            if (!_.isArray(acl.role)) {
                acl.role = [acl.role];
            }
            if ('undefined' === typeof acl.authenticated) {
                acl.authenticated = true;
            }
            server.log.info('  *', 'Allow', acl.role);
            req.acl = acl;
            req.hasRole = function(role){
                return (acl.role.indexOf(role) !==-1);
            };
            next();
        } else {
            return res.status(403).send({message: 'Bad ACL'});
        }
    };
};