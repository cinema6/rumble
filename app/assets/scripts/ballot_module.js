(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('ballotVoteModule', ['assetFilter','$animate',
        function                       ( assetFilter , $animate ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/ballot_vote_module.html', 'views'),
                controller: 'BallotVoteModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    vote: '=',
                    cardId: '@',
                    active: '=',
                    fetchWhen: '=',
                    onDismiss: '&'
                },
                link: function(scope, element) {
                    scope.$watch('active', function(active) {
                        $animate[(active ? 'removeClass' : 'addClass')](element, 'ng-hide');
                    });
                }
            };
        }])

        .directive('ballotResultsModule', ['assetFilter','$animate',
        function                          ( assetFilter , $animate ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/ballot_results_module.html', 'views'),
                controller: 'BallotResultsModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    vote: '=',
                    cardId: '@',
                    active: '=',
                    fetchWhen: '=',
                    onDismiss: '&'
                },
                link: function(scope, element) {
                    scope.$watch('active', function(active) {
                        $animate[(active ? 'removeClass' : 'addClass')](element, 'ng-hide');
                    });
                }
            };
        }])

        .controller('BallotVoteModuleController', ['$scope','BallotService',
        function                                  ( $scope , BallotService ) {
            var self = this;

            this.vote = function(vote) {
                $scope.vote = vote;

                BallotService.vote($scope.cardId, (self.ballot[vote] || {}).name);

                $scope.$emit('<ballot-vote-module>:vote', vote);
            };

            this.pass = function() {
                $scope.vote = -1;
            };

            $scope.$watch('fetchWhen', function(shouldFetch) {
                if (!shouldFetch) { return; }

                BallotService.getBallot($scope.cardId)
                    .then(function(ballot) {
                        self.ballot = ballot;
                    });
            });
        }])

        .controller('BallotResultsModuleController', ['$scope','BallotService',
        function                                     ( $scope , BallotService ) {
            var self = this;

            this.ballot = null;

            $scope.$watch('fetchWhen', function(shouldFetch) {
                if (!shouldFetch) { return; }

                BallotService.getBallot($scope.cardId)
                    .then(function(ballot) {
                        self.ballot = ballot;
                    });
            });
        }]);
}());
