/*global module*/
module.exports = function (server) {
    'use strict';

    return function (req, res, next) {

        req.isAllowedApplication = function() {
            var applicationRequester = this.headers['client-application'] || '';
            var allowedApplications = (this.user && this.user.applications) ? this.user.applications : [];
            return (allowedApplications.indexOf(applicationRequester) !==-1 );
        };

        server.log.info('OAuth middleware in action');
        if (false === req.acl.authenticated) {
            server.log.info('  *', 'No authntication required');
            return next();
        }
        var accessToken = req.headers['access-token'] || '';
        server.helpers.oauth.decrypt(accessToken, 'access-token', function (err, data) {
            if (!err) {
                req.user = data;
                server.log.info('  *', 'roles', 'USER:' + req.acl.role + ' - RES:' + data.role);
                if ((req.acl.role.indexOf('*') !==-1) || ((req.hasRole(data.role)) && (req.isAllowedApplication()))) {
                    return next();
                } else {
                    res.status(401).json({
                    status: 'unauthorized',
                    reason: 'ACL Blocked',
                    level:  ([(!req.isAllowedApplication() ? 'Application not allowed' : ''),  (!req.hasRole(data.role) ? 'User not allowed' : '')]).join(' / ')
                });
                }
            } else {
                res.status(401).json({
                    status: 'unauthorized',
                    reason: err
                });
            }
        });
    };
};