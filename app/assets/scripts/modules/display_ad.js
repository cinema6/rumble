define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.modules.displayAd', [])
        .directive('displayAdModule', ['assetFilter','AdTechService',
        function                      ( assetFilter , AdTechService ) {
            function link(scope) {
                scope.$watch('active', function(active) {
                    if (active) {
                        AdTechService.loadAd(scope.config);
                    }
                });
            }

            return {
                templateUrl: assetFilter('directives/display_ad_module.html', 'views'),
                restrict: 'E',
                scope: {
                    active: '=',
                    config: '='
                },
                link: link
            };
        }]);
});
