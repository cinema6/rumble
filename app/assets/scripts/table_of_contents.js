(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('tableOfContents', ['c6UrlMaker',
        function                      ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/table_of_contents.html'),
                controller: 'TableOfContentsController',
                controllerAs: 'Ctrl',
                scope: {
                    cards: '=',
                    onSelect: '&',
                    onExit: '&'
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
}());
