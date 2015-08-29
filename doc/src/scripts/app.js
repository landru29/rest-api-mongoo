angular.module('Documentation', [
    'ui.router',
    'ngStorage',
    'ngResource',
    'ui.bootstrap',
    'ngAnimate',
    'doc.config',
    'flash',
    'ngStorage'
]);

angular.module('Documentation').config(function($urlRouterProvider, $locationProvider, $httpProvider) {
        'use strict';
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('OAuthInterceptor');
    });