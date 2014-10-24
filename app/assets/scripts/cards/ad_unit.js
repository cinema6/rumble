define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.cards.adUnit', [])
        .controller('AdUnitCardController', ['$scope','c6ImagePreloader','compileAdTag',
                                             '$interval',
        function                            ( $scope , c6ImagePreloader , compileAdTag ,
                                              $interval ) {
            var self = this,
                config = $scope.config,
                profile = $scope.profile,
                data = config.data,
                _data = config._data || (config._data = {
                    hasPlayed: false,
                    modules: {
                        displayAd: {
                            active: false
                        }
                    }
                });

            function playerReady(player) {
                self.player = player;

                function controlNav(NavController) {
                    var canSkipAnytime = data.skip === true,
                        mustWatchEntireVideo = data.skip === false;

                    function tickNav() {
                        var remaining = Math.max((data.skip || player.duration) - player.currentTime, 0);

                        NavController.tick(remaining);

                        if (!remaining) {
                            NavController.enabled(true);
                            player.removeListener('timeupdate', tickNav);
                        }
                    }

                    if (canSkipAnytime) { return; }

                    NavController.enabled(false)
                        .tick(data.skip || player.duration);

                    if (data.autoplay || mustWatchEntireVideo) {
                        return player.on('timeupdate', tickNav)
                            .once('ended', function() {
                                NavController.enabled(true);
                                player.removeListener('timeupdate', tickNav);
                            });
                    }

                    $interval(function() {
                        NavController.tick(--data.skip);

                        if (!data.skip) {
                            NavController.enabled(true);
                        }
                    }, 1000, data.skip);
                }

                function prepareCard() {
                    player.load();

                    if (config.thumbs) {
                        c6ImagePreloader.load([config.thumbs.large]);
                    }
                }

                function activateCard() {
                    if (data.autoplay) {
                        player.play();
                    }

                    if (!_data.hasPlayed) {
                        $scope.$emit('<mr-card>:init', controlNav);
                    }
                }

                function deactivateCard() {
                    player.pause();
                }

                player.once('play', function() {
                    _data.hasPlayed = true;
                });

                $scope.$watch('onDeck', function(onDeck) {
                    if (onDeck) {
                        prepareCard();
                    }
                });

                $scope.$watch('active', function(active, wasActive) {
                    if (active) {
                        activateCard();
                    } else if (wasActive) {
                        deactivateCard();
                    }
                });
            }

            function playerInit($event, player) {
                player
                    .once('ready', function() {
                        playerReady(player);
                    })
                    .on('play', function() {
                        self.postModuleActive = false;
                    })
                    .on('ended', function() {
                        self.postModuleActive = true;

                        if (!$scope.hasModule('post')) {
                            $scope.$emit('<mr-card>:contentEnd', $scope.config);
                        }
                    });
            }

            this.player = null;
            this.adType = (profile.flash && !!data.vpaid) ? 'vpaid' : 'vast';
            this.adTag = compileAdTag(data[this.adType]);
            this.enablePlay = !profile.touch;
            this.postModuleActive = false;
            Object.defineProperties(this, {
                showPlay: {
                    get: function() {
                        return !!this.player && (_data.hasPlayed || !data.autoplay) && this.player.paused;
                    }
                },
                flyAway: {
                    get: function() {
                        return !$scope.active || ($scope.hasModule('post') && this.postModuleActive);
                    }
                }
            });

            ['<vpaid-player>:init', '<vast-player>:init'].forEach(function($event) {
                $scope.$on($event, playerInit);
            });
        }])

        .directive('adUnitCard',[function() {

            return {
                restrict: 'E',
                controller: 'AdUnitCardController',
                controllerAs: 'Ctrl',
                template: [
                    '<ng-include src="config.templateUrl || (\'directives/ad_unit_card.html\' | asset:\'views\')"></ng-include>'
                ].join('\n')
            };
        }]);

});
