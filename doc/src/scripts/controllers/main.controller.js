angular.module('Documentation').controller('MainCtrl', function($scope, ConfLoader) {
    'use strict';
    
    this.init = function() {
        ConfLoader.get().$promise.then(function(data) {
            console.log(data);
        });
    };
    
    this.init();
});