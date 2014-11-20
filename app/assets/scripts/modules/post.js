define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.modules.post', [])
        .directive('postModule', ['assetFilter',
        function                 ( assetFilter ) {
            return {
                restrict: 'E',
                controller: 'PostModuleController',
                controllerAs: 'Ctrl',
                scope: {
                    active: '=',
                    onReplay: '&',
                    sponsorHref: '@',
                    onDismiss: '&',
                    ballot: '=',
                    cardId: '@'
                },
                templateUrl: assetFilter('directives/post_module.html', 'views')
            };
        }])

        .controller('PostModuleController', ['$scope','BallotService','$log',
        function                            ( $scope , BallotService , $log ) {
            $log = $log.context('PostModuleController');

            this.vote = function(index) {
                $log.info('Submitting vote for card %1: %2', $scope.cardId, $scope.ballot.choices[index]);

                BallotService.vote($scope.cardId, index, $scope.ballot.election)
                    .catch(function(error) {
                        $log.error(error);
                    });

                $scope.$emit('<post-module>:vote', index);
            };
        }]);
});
