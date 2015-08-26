angular.module('Documentation').service('ConfLoader', function($resource, appConfiguration) {
    return $resource(appConfiguration.url);
});