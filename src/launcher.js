#!/usr/bin/env node

(function () {
    var cluster = require('cluster');
    var config = require('./config.json');
    var packageJson = require('../package.json');
    var bunyan = require('bunyan');
    var _ = require('lodash');
    
    var log = bunyan.createLogger({
            name: packageJson.name
        });

    if (cluster.isMaster) {
        
        var processList = [];
        var launcher = config.launcher;
        
        for (var key in launcher) {
            var forks = launcher[key]['nb-forks'];
            log.info('Creating ' + forks + ' processes of ' + key);
            var options = launcher[key].options;
            for (var i=0; i< forks; i++) {
                processList.push({
                    pid:cluster.fork({
                            file: key,
                            options: JSON.stringify(options)
                        }).process.pid,
                    file: key,
                    options: JSON.stringify(options)
                });
            }
        }
        
        /**
         * Check which process died and relaunch it
         */
        var checkForRelaunch = function(processList, worker) {
            var index = _.findIndex(processList, {pid: worker.process.pid})
            if (index > -1) {
                var options = processList[index].options;
                var file = processList[index].file;
                processList[index] = {
                    file: processList[index].file,
                    options :processList[index].options,
                    pid: cluster.fork({
                        file: processList[index].file,
                        options :processList[index].options
                    })
                };
                return true;
            }
            return false;
        }

        // relaunch process if dying
        cluster.on('exit', function (worker) {
            var d = new Date();
            console.log(d.toISOString() + '[' + process.pid + ']: > Worker ' + worker.process.pid + ' died :(');
            // check if this is a server process
            checkForRelaunch(serverProcesses, worker);
        });

    } else {
        require(process.env.file)(JSON.parse(process.env.options));
    }
})();