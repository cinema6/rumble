define( ['angular','services'],
function( angular , services ) {
    'use strict';

    return angular.module('c6.rumble.cards.text', [services.name])
        .directive('textCard', [function() {
            return {
                restrict: 'E',
                template: [
                    '<ng-include src="config.templateUrl || (\'directives/text_card.html\' | asset:\'views\')"></ng-include>'
                ].join('\n'),
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
