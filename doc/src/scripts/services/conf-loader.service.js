angular.module('Documentation').service('ConfLoader', function ($resource, appConfiguration, $q) {
    return function() {
        return $q(function(resolve, reject) {
            $resource(appConfiguration.url).get().$promise.then(
                function (data) {
                    var result = {};
                    Object.keys(data.routes).forEach(function(route){
                        var mainRoute = route.replace(/\/?api/, '');
                        
                        result[mainRoute] = data.routes[route];
                    });
                    resolve(result);
                }, reject
            );
        });
    };
});