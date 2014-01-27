(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('ballotModule', ['c6UrlMaker',
        function                   ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/ballot_module.html'),
                controller: 'BallotModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    ballot: '=',
                    vote: '='
                }
            };
        }])

        .controller('BallotModuleController', ['$scope',
        function                              ( $scope ) {
            this.vote = function(vote) {
                $scope.vote = vote;
            };
        }]);
}());
