(function() {
    'use strict';

    angular.module('c6.rumble')
        .controller('RecapCardController', ['$rootScope','$scope','$log', 'c6AppData', 'MiniReelService', 'BallotService', 'ModuleService',
        function                           ( $rootScope , $scope , $log ,  c6AppData ,  MiniReelService ,  BallotService ,  ModuleService ) {
            var config = $scope.config,
                self = this,
                _deck;

            this.deck = [];

            this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

            function setupDeck(deck) {
                deck.forEach(function(card) {
                    if(card.type === 'ad' || card.type === 'recap') { return; }

                    switch (card.type) {
                        case 'youtube':
                            card.webHref = 'https://www.youtube.com/watch?v=' + card.data.videoid;
                            break;
                        case 'dailymotion':
                            card.webHref = 'http://www.dailymotion.com/video/' + card.data.videoid;
                            break;
                        case 'vimeo':
                            card.webHref = 'http://vimeo.com/' + card.data.videoid;
                            break;
                    }

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

            $scope.$watch('active', function(isActive, wasActive) {
                if(isActive === wasActive) { return; }
                
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

        .directive('recapCard', ['c6UrlMaker','assetFilter',
        function                ( c6UrlMaker , assetFilter ) {
            return {
                restrict: 'E',
                templateUrl : assetFilter('directives/recap_card.html', 'views'),
                controller: 'RecapCardController',
                controllerAs: 'Ctrl'
            };
        }]);
}());
