angular.module('Documentation').controller('MainCtrl', function($scope, ConfLoader, appConfiguration, $http) {
    'use strict';
    var self = this;
    
    
    this.init = function() {
        ConfLoader.get().$promise.then(function(data) {
            self.endpoints = data.routes;//{root: '/', endP:data.endpoints};
            console.log(self.endpoints);
        });
    };
    
    this.parseParameters = function(parameters) {
         var params = {};
        for (var name in parameters) {
            var where = parameters[name].where;
            if (! params[where]) {
                params[where] = {};
            }
            params[where][name] = parameters[name].value;
        }
        return params;
    };
    
    this.buildUrl = function(route, params) {
        var thisParams = JSON.parse(JSON.stringify(params ? params : {}));
        var uri = route.replace(/:(\w*)/g, function(replacement, key){
            if (thisParams[key]) {
                var value = thisParams[key];
                delete thisParams[key];
                return value;
            } else {
                return replacement;
            }
        });
        var rest = [];
        for (var key in thisParams) {
            rest.push(encodeURIComponent(key) + '=' + encodeURIComponent(thisParams[key]));
        }
        uri += rest.length ? '?' + rest.join('&') : '';
        return appConfiguration.url + uri.replace(/^\/api\//, '');
    }
    
    this.request = function(route, method, metadata) {
        var params = self.parseParameters(metadata.parameters);
        var req = {
            method: method.toUpperCase(),
            url: self.buildUrl(route, params.url),
            data: params.body,
            headers: params.headers
        };
        metadata.result = {
            error:'',
            success: ''
        };
        
        $http(req).then(
            function(data){
                metadata.result.success = data.data;
            }, 
            function(err){
                metadata.result.error = err.data;
            }
        );
    };
    
    this.init();
});