define (['angular','services'],
function( angular , services ) {
    'use strict';

    return angular.module('c6.rumble.cards.recap', [services.name])
        .controller('RecapCardController', ['$rootScope','$scope','$log','c6AppData',
                                            'MiniReelService','BallotService','ModuleService',
        function                           ( $rootScope , $scope , $log , c6AppData ,
                                             MiniReelService , BallotService , ModuleService ) {
            var config = $scope.config,
                self = this,
                _deck;

            this.deck = [];

            this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

            function setupDeck(deck) {
                deck.forEach(function(card) {
                    if(card.type === 'ad' || card.type === 'recap') { return; }

                    card.hasModule = ModuleService.hasModule.bind(ModuleService, card.modules);

                    if(card.hasModule('ballot')) {
                        BallotService.getBallot(card.id)
                            .then(function(ballot) {
                                card.ballot.results = ballot;
                            })
                            .catch(function(error) {
                                $log.error(error);
                            });
                    }

                    self.deck.push(card);
                });
                return deck;
            }


            this.jumpTo = function(card) {
                function getIndex(card) {
                    var index;
                    _deck.forEach(function(el, i) {
                        if(el.id === card.id) {
                            index = i;
                        }
                    });
                    return index;
                }

                $scope.$emit('<recap-card>:jumpTo', getIndex(card));
            };

            $scope.$on('$destroy',function(){
                if(c6AppData.experience.data.mode === 'lightbox') {
                    $rootScope.$broadcast('resize');
                }
            });

            $scope.$watch('active', function(isActive) {
                if(isActive) {
                    self.deck = [];
                    _deck = setupDeck(MiniReelService.createDeck(c6AppData.experience.data));
                    self.title = c6AppData.experience.data.title;
                }

                if(c6AppData.experience.data.mode === 'lightbox') {
                    $rootScope.$broadcast('resize');
                }
            });
        }])

        .directive('recapCard', [function() {
            return {
                restrict: 'E',
                template: [
                    '<ng-include src="config.templateUrl || (\'directives/recap_card.html\' | asset:\'views\')"></ng-include>'
                ].join('\n'),
                controller: 'RecapCardController',
                controllerAs: 'Ctrl'
            };
        }]);
});
