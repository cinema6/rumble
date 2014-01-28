(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('ballotModule', ['c6UrlMaker','$animate',
        function                   ( c6UrlMaker , $animate ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/ballot_module.html'),
                controller: 'BallotModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    ballot: '=',
                    vote: '=',
                    cardId: '@',
                    active: '=',
                    fetchResultsWhen: '='
                },
                link: function(scope, element) {
                    scope.$watch('active', function(active) {
                        $animate[(active ? 'removeClass' : 'addClass')](element, 'ng-hide');
                    });
                }
            };
        }])

        .controller('BallotModuleController', ['$scope','rumbleVotes',
        function                              ( $scope , rumbleVotes ) {
            var self = this;

            this.results = null;

            this.vote = function(vote) {
                $scope.vote = vote;
            };

            $scope.$watch('fetchResultsWhen', function(shouldFetch) {
                if (!shouldFetch) { return; }

                rumbleVotes.getReturnsForItem($scope.cardId)
                    .then(function(results) {
                        self.results = results;
                    });
            });
        }]);
}());
