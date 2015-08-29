angular.module('Documentation').service('Login', function ($http, appConfiguration, $q, OAuth) {
    
    var refreshToken = function(token) {
        return $q(function (resolve, reject) {
                $http.post(appConfiguration.url + 'user/refresh-token', {
                    'refresh-token': token
                }).then(function (response) {
                    OAuth.setToken(response.data.data['access-token']);
                    resolve(response.data);
                }, function (err) {
                    reject(err);
                });
            });
    };
    
    var login= function (email, password) {
            return $q(function (resolve, reject) {
                $http.post(appConfiguration.url + 'login', {
                    email: email,
                    password: password
                }).then(function (response) {
                    refreshToken(response.data.data['refresh-token']).then(function(data){
                        resolve(data);
                    }, function(err){
                        reject(err.data.message);
                    });
                }, function (err) {
                    reject(err.data.message);
                });
            });

        };
    
    var logout = function(){
        OAuth.setToken(null);
    };

    return {
        login: login,
        logout: logout,
        isLoggedIn: function() {
            return !!OAuth.getToken();
        }
    };
});