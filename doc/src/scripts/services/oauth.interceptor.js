angular.module('Documentation').factory('OAuthInterceptor', function (OAuth, appConfiguration) {
    return {
        'request': function (config) {
            var accessToken = OAuth.getToken();
            if (accessToken) {
                 config.headers['access-token'] = accessToken;
            }
            if (appConfiguration.applicationId) {
                config.headers['client-application'] = appConfiguration.applicationId;
            }
            return config;
        }
    };
});