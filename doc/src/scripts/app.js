angular.module('Documentation', [
    'ui.router',
    'ngStorage',
    'ngResource',
    'ui.bootstrap',
    'ngAnimate',
    'doc.config'
]);

angular.module('Documentation').config(function($urlRouterProvider, $locationProvider) {
        'use strict';
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    });