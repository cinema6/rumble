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
                    adObject: '=',
                    active: '='
                },
                link: function(scope, $element) {
                    scope.$watchCollection('adObject', function(curr) {
                        if(curr) {
                            scope.adType = scope.adObject.adType;
                            scope.fileURI = scope.adObject.fileURI;
                            if(curr.sourceCode) {
                                scope.vpaidCompanion = true;
                                $element.find('.vpaidCompanion')[0].innerHTML = curr.sourceCode;
                            }
                        }
                    });
                }
            };
        }]);
}());
