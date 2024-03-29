define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.ui.tableOfContents', [])
        .directive('tableOfContents', ['assetFilter',
        function                      ( assetFilter ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/table_of_contents.html', 'views'),
                controller: 'TableOfContentsController',
                controllerAs: 'Ctrl',
                scope: {
                    cards: '=',
                    onSelect: '&',
                    onExit: '&',
                    title: '@'
                }
            };
        }])

        .controller('TableOfContentsController', ['$scope',
        function                                 ( $scope ) {
            this.select = function(card) {
                $scope.onSelect({ card: card });
                $scope.onExit();
            };
        }]);
});
