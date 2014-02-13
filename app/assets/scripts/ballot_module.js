(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('ballotVoteModule', ['c6UrlMaker','$animate',
        function                   ( c6UrlMaker , $animate ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/ballot_vote_module.html'),
                controller: 'BallotVoteModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    ballot: '=',
                    vote: '=',
                    active: '=',
                    onDismiss: '&'
                },
                link: function(scope, element) {
                    scope.$watch('active', function(active) {
                        $animate[(active ? 'removeClass' : 'addClass')](element, 'ng-hide');
                    });
                }
            };
        }])

        .directive('ballotResultsModule', ['c6UrlMaker','$animate',
        function                   ( c6UrlMaker , $animate ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/ballot_results_module.html'),
                controller: 'BallotResultsModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    ballot: '=',
                    vote: '=',
                    cardId: '@',
                    active: '=',
                    fetchWhen: '='
                },
                link: function(scope, element) {
                    scope.$watch('active', function(active) {
                        $animate[(active ? 'removeClass' : 'addClass')](element, 'ng-hide');
                    });
                }
            };
        }])

        .controller('BallotVoteModuleController', ['$scope',
        function                                  ( $scope  ) {
            this.vote = function(vote) {
                $scope.vote = vote;
            };

            this.pass = function() {
                $scope.vote = -1;
            };
        }])

        .controller('BallotResultsModuleController', ['$scope','rumbleVotes',
        function                                     ( $scope , rumbleVotes ) {
            var self = this;

            this.results = null;

            $scope.$watch('fetchWhen', function(shouldFetch) {
                if (!shouldFetch) { return; }

                rumbleVotes.getReturnsForItem($scope.cardId)
                    .then(function(results) {
                        self.results = results;
                    });
            });
        }]);
}());
