/*global angular*/
angular.module('Documentation').directive('endpointList', function() {
    'use strict';
    return {
        retrict: 'AE',
        template: '<ul class="endpoint-sublist"><li data-ng-repeat="(endpoint, children) in endpointList.endP" endpoint-item="{root: endpointList.root, name: endpoint, children:children}" data-ng-click="endpointClick(children);$event.stopPropagation();"></li></ul>',
        scope: {
            endpointList: '='
        },
        link: function(scope) {
        },
        replace: true,
        controller: function($scope, $rootScope) {
            $scope.endpointClick = function(endpoint) {
                endpoint.$visible = !endpoint.$visible;
            };
        }
    };
})

.directive('endpointItem', function($compile) {
        'use strict';
    return {
        retrict: 'AE',
        templateUrl: 'views/endpoint.directive.html',
        scope: {
            endpointItem: '='
        },
        replace: false,
        link: function(scope, element) {
            if ((/^\@/).test(scope.endpointItem.name)) {
                element.append('<div data-ng-show="endpointItem.children.$visible" endpoint-descriptor="endpointItem"></div>');
            } else {
                scope.fullRoot = (scope.endpointItem.root + '/' + scope.endpointItem.name).replace(/\/\//g, '/');
                element.append('<div endpoint-list="{root:fullRoot, endP:endpointItem.children}" data-ng-show="endpointItem.children.$visible"></div>');
            }
            $compile(element.contents())(scope);
        }
    };
})

.directive('endpointDescriptor', function() {
    'use strict';
    return {
        retrict: 'AE',
        templateUrl: 'views/endpoint-descriptor.directive.html',
        scope: {
            endpointDescriptor: '='
        },
        link: function(scope) {
            
        },
        replace: true,
        controller: function($scope) {
            $scope.method = $scope.endpointDescriptor.name.replace(/^@/, '').toUpperCase();
            $scope.data = $scope.endpointDescriptor.children;
            $scope.url = $scope.endpointDescriptor.root;
            console.log('DESCRIPTOR', $scope);
        }
    };
});
