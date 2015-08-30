/*global module, require*/
module.exports = function (server) {
    'use strict';

    
    var _ = require('lodash');

    return function (req, res, next) {
        server.log.info('Acl middleware in action');
        var routeDesc = server.helpers.getRouteDescriptor(req);
        server.log.info('  *', 'Route', routeDesc.route, 'URL', routeDesc.url);
        if (!routeDesc) {
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
            next();
        } else {
            return res.status(403).send({message: 'Bad ACL'});
        }
    };
};