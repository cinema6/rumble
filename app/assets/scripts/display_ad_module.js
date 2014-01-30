(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('displayAdModule', ['c6UrlMaker',
        function                      ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/display_ad_module.html'),
                scope: {
                    adSrc: '@',
                    active: '='
                }
            };
        }]);
}());
