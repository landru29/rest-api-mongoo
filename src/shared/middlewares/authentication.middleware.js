module.exports = function (server) {
    

    return function (req, res, next) {
        server.log.info('OAuth middleware in action');
        var accessToken = req.headers['access-token'] ? req.headers['access-token'] : '';
        server.helpers.oauth.decrypt(accessToken, 'access-token', function (err, data) {
            if (!err) {
                req.user = data;
                next();
            } else  {
                res.status(401).json({
                    status: 'unauthorized',
                    reason: err
                });
            }
        });
    }
};