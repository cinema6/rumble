(function() {
    'use strict';

    angular.module('c6.rumble')
        .controller('RecapCardController', ['$scope','$log', 'c6AppData', 'MiniReelService', 'BallotService', 'ModuleService',
        function                           ( $scope , $log ,  c6AppData ,  MiniReelService ,  BallotService ,  ModuleService ) {
            var self = this,
                _deck = MiniReelService.createDeck(c6AppData.experience.data);

            this.deck = [];
            this.title = c6AppData.experience.title;

            _deck.forEach(function(card) {
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
