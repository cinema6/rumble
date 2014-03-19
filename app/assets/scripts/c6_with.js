(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .directive('c6With', [function() {
            return {
                restrict: 'EAC',
                scope: true,
                link: function(scope, element, attrs) {
                    var config = (attrs.c6With || '').split(/\s+as\s+/),
                        myProp = config[1] || attrs.as,
                        parentValue = config[0] || attrs.model;

                    scope.$parent.$watch(parentValue, function(model) {
                        scope[myProp] = model;
                    });
                }
            };
        }]);
}());
