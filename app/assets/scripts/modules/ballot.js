define (['angular','services'],
function( angular , services ) {
    'use strict';

    return angular.module('c6.rumble.modules.ballot', [services.name])
        .directive('ballotVoteModule', ['assetFilter','$animate',
        function                       ( assetFilter , $animate ) {
            return {
                restrict: 'E',
                templateUrl: assetFilter('directives/ballot_vote_module.html', 'views'),
                controller: 'BallotVoteModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    vote: '=',
                    ballot: '=',
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

        .controller('BallotVoteModuleController', ['$scope','BallotService','$log',
        function                                  ( $scope , BallotService , $log ) {
            $log = $log.context('BallotVoteModuleController');

            this.vote = function(index) {
                $scope.vote = index;

                $log.info('Submitting vote for card %1: %2', $scope.cardId, $scope.ballot.choices[index]);
                BallotService.vote($scope.cardId, $scope.vote)
                    .catch(function(error) {
                        $log.error(error);
                    });

                $scope.$emit('<ballot-vote-module>:vote', index);
            };

            this.pass = function() {
                $scope.vote = -1;
                $scope.$emit('<ballot-vote-module>:vote', -1);
            };
        }])

        .controller('BallotResultsModuleController', ['$scope','BallotService','$log',
        function                                     ( $scope , BallotService , $log ) {
            var self = this;

            $log = $log.context('BallotResultsModuleController');

            this.ballot = null;

            $scope.$watch('fetchWhen', function(shouldFetch) {
                if (!shouldFetch) { return; }

                $log.info('Fetching ballot for card: %1', $scope.cardId);
                BallotService.getBallot($scope.cardId)
                    .then(function(ballot) {
                        $log.info('Got ballot for card: ' + $scope.cardId, ballot);
                        self.ballot = ballot;
                    })
                    .catch(function(error) {
                        $log.error(error);
                    });
            });
        }]);
});
