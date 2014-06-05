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
                    active: '=',
                    adContainerId: '@'
                },
                link: function(scope) {
                    scope.$watch('companion()', function(curr) {
                        if(curr) {
                            if (curr.adType) {
                                // we have a VAST companion
                                scope.adType = curr.adType;
                                scope.fileURI = curr.fileURI;
                            } else if (curr.sourceCode) {
                                // we have a VPAID companion
                                scope.adType = 'html';
                                scope.fileURI = curr.sourceCode;
                            }
                        }
                    });
                }
            };
        }]);
}());
