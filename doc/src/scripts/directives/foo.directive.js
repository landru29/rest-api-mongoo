angular.module('Documentation').directive('foo', function($compile) {
        'use strict';
    return {
        retrict: 'AE',
        templateUrl: 'views/foo.directive.html',
        scope: {
        },
        replace: true,
        link: function(scope, element) {
           
        }
    };
});