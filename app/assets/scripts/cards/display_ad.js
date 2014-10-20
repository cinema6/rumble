define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.cards.displayAd', [])
        .directive('displayAdCard', ['assetFilter',
        function                    ( assetFilter ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/display_ad_card.html', 'views')
            };
        }]);
});
