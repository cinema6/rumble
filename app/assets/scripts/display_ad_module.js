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
                    companion: '&',
                    active: '='
                },
                link: function(scope) {
                    scope.$watch(function() {
                        return scope.companion();
                    }, function(curr) {
                        if(curr) {
                            if (curr.adType) {
                                scope.adType = curr.adType;
                                scope.fileURI = curr.fileURI;
                            } else if (curr.sourceCode) {
                                scope.adType = 'html';
                                scope.fileURI = curr.sourceCode;
                            }
                        }
                    });
                }
            };
        }]);
}());
