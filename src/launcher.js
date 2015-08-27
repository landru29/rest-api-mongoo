#!/usr/bin/env node
(function () {
    'use strict';
    var cluster = require('cluster');
    var config = require('./config.json');
    var packageJson = require('../package.json');
    var bunyan = require('bunyan');
    var _ = require('lodash');
    
    var log = bunyan.createLogger({
            name: packageJson.name
        });

    if (cluster.isMaster) {
        
        var apiProcessList = [];
        var launcher = config.launcher;
        
        for (var key in launcher) {
            if (launcher.hasOwnProperty(key)) {
                var forks = launcher[key]['nb-forks'];
                log.info('Creating ' + forks + ' processes of ' + key);
                var options = launcher[key].options;
                for (var i = 0; i < forks; i++) {
                    apiProcessList.push({
                        pid: cluster.fork({
                            file: key,
                            options: JSON.stringify(options)
                        }).process.pid,
                        file: key,
                        options: JSON.stringify(options)
                    });
                }
            }
        }
        
        /**
         * Check which process died and relaunch it
         */
        var checkForRelaunch = function(processList, worker) {
            var index = _.findIndex(processList, {pid: worker.process.pid});
            if (index > -1) {
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
        };

        // relaunch process if dying
        cluster.on('exit', function (worker) {
            log.warn('Worker ' + worker.process.pid + ' died :(');
            checkForRelaunch(apiProcessList, worker);
        });

    } else {
        require(process.env.file)(JSON.parse(process.env.options));
    }
})();