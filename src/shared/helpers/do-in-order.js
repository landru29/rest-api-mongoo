/*global module*/
module.exports = function (server) {
    var q = require('q');

    function doNext(fn /*, arguments*/ ) {
        var args = Array.prototype.splice.call(arguments, 1);
        return function () {
            args = args.concat(Array.prototype.slice.call(arguments));
            return fn.apply(null, args);
        };
    }

    function doInOrder(tasks, commonData) {
        if (!commonData) {
            commonData = [];
        }
        return q.promise(function (resolve, reject) {
            if (tasks.length) {
                var currentTask = tasks[0];
                q.when(currentTask.apply(null, commonData)).then(
                    function (data) {
                        commonData.unshift(data);
                        doInOrder(tasks.slice(1), commonData).then(
                            function (data) {
                                resolve(data);
                            },
                            function (err) {
                                reject(err);
                            }
                        );

                    },
                    function (err) {
                        reject(err);
                    });
            } else {
                resolve();
            }
        });
    }
    
    return {
        doInOrder: doInOrder,
        doNext: doNext
    };

};