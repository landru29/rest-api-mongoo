angular.module('Documentation').controller('MainCtrl', function($scope, ConfLoader) {
    'use strict';
    var self = this;
    
    
    this.init = function() {
        ConfLoader.get().$promise.then(function(data) {
            self.endpoints = data.endpoints;//{root: '/', endP:data.endpoints};
            console.log(self.endpoints);
        });
    };
    
    this.init();
});