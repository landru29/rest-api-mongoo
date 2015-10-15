module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var fs = require('fs');
    var publicFolder = __dirname + '/data';
    var notFound = '/404.html';
    
    router.get('/*', function (req, res) {
        
        var requestedUrl = (req.url) && (req.url.length > 1) ? req.url.replace(/\.\./g, '') : notFound;
        var filename = publicFolder + requestedUrl;
        // check if a specific file was requested
        if ((!fs.existsSync(filename))) {
            requestedUrl = notFound;
        }
        
        if (requestedUrl === notFound) {
            res.status(404);
        }
        
        res.sendFile(requestedUrl, {
            root: publicFolder
        });
    });

    return router;
};