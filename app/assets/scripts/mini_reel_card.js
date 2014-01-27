(function() {
    'use strict';

    angular.module('c6.rumble')
        .controller('MiniReelCardController', ['$scope','cinema6',
        function                              ( $scope , cinema6 ) {
            var self = this,
                config = $scope.config,
                data = config.data;

            this.miniReels = null;

            $scope.$watch('onDeck', function(onDeck) {
                if (onDeck) {
                    cinema6.db.find(data.query)
                        .then(function(miniReels) {
                            self.miniReels = miniReels;
                        });
                }
            });
        }])

        .directive('miniReelCard', ['c6UrlMaker',
        function                   ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/mini_reel_card.html'),
                controller: 'MiniReelCardController',
                controllerAs: 'Ctrl'
            };
        }]);
}());
