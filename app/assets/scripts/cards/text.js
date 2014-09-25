define( ['angular','services'],
function( angular , services ) {
    'use strict';

    return angular.module('c6.rumble.cards.text', [services.name])
        .directive('textCard', ['assetFilter',
        function               ( assetFilter ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/text_card.html', 'views'),
                controller: 'TextCardController',
                controllerAs: 'Ctrl'
            };
        }])

        .controller('TextCardController', ['$scope','$rootScope','c6AppData',
        function                          ( $scope , $rootScope , c6AppData ) {
            $scope.$watch('active', function(active, wasActive) {
                if (active !== wasActive) {
                    if (c6AppData.mode === 'lightbox') {
                        $rootScope.$broadcast('resize');
                    }
                }
            });
        }]);
});
