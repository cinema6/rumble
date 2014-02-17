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

        .directive('miniReelCard', ['c6UrlMaker','c6Profile',
        function                   ( c6UrlMaker , c6Profile ) {
            return {
                restrict: 'E',
                templateUrl : c6UrlMaker('views/directives/mini_reel_card' +
                                        ((c6Profile.device === 'phone') ? '--mobile' : '') +
                                        '.html'),
                controller: 'MiniReelCardController',
                controllerAs: 'Ctrl'
            };
        }]);
}());
