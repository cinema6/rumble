(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('displayAdModule', ['assetFilter',
        function                      ( assetFilter ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/display_ad_module.html', 'views'),
                scope: {
                    adSrc: '@',
                    adResource: '=',
                    active: '='
                },
                link: function(scope) {
                    if(scope.adResource) {
                        scope.adType = scope.adResource.adType;
                        scope.fileURI = scope.adResource.fileURI;
                    }
                }
            };
        }]);
}());
