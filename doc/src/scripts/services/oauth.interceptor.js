angular.module('Documentation').factory('OAuthInterceptor', function (OAuth) {
    return {
        'request': function (config) {
            var accessToken = OAuth.getToken();
            if (accessToken) {
                 config.headers['access-token'] = accessToken;
            }
            return config;
        }
    };
});