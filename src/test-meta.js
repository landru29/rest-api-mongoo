var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'test'
});

var meta = require('./meta-loader.js')(
    {
        metaScanFile: __dirname + '/server.js',
        log : log
    }
);

console.log(JSON.stringify(meta, null, 4));