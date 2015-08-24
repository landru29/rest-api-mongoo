/*global module*/
module.exports = function (server) {
    'use strict';

    return function (req, res, next) {
        server.log.info('OAuth middleware in action');
        var accessToken = req.headers['access-token'] || '';
        server.helpers.oauth.decrypt(accessToken, 'access-token', function (err, data) {
            if (!err) {
                req.user = data;
                server.log.info(req.acl.role + ' - ' + data.role);
                if ((req.acl.role.indexOf('*') !==-1) || (req.acl.role.indexOf(data.role) !==-1)) {
                    return next();
                } else {
                    res.status(401).json({
                    status: 'unauthorized',
                    reason: 'ACL Blocked'
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