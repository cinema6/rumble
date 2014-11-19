define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.cards.ad', [])
        .controller('AdCardController', ['$scope','c6AppData','adTags','$interval','$rootScope',
                                         'MiniReelService','compileAdTag',
        function                        ( $scope , c6AppData , adTags , $interval , $rootScope ,
                                          MiniReelService , compileAdTag ) {
            var AdCardCtrl = this,
                profile = $scope.profile,
                config = $scope.config,
                data = config.data,
                _data = config._data || (config._data = {
                    hasPlayed: false,
                    companion: null,
                    tracking: {
                        clickFired: false,
                        countFired: false,
                        quartiles: [false, false, false, false]
                    }
                }),
                shouldGoForward = false;

            function goForward() {
                AdCardCtrl.player.pause();
                $scope.$emit('<mr-card>:contentEnd', config.meta || config);
            }

            function playerInit($event, player) {
                player.once('ready', function() {
                    playerReady(player);
                });
            }

            function playerReady(player) {
                AdCardCtrl.player = player;

                function controlNav(NavController) {
                    var canSkipAnytime = data.skip === true;

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

                    return player.on('timeupdate', tickNav)
                        .once('ended', function() {
                            NavController.enabled(true);
                            player.removeListener('timeupdate', tickNav);
                        });
                }

                function prepareCard() {
                    player.load();
                }

                function activateCard() {
                    if (config.meta) {
                        config.meta._data = _data;
                    }

                    if (shouldGoForward) {
                        return goForward();
                    }

                    if (data.autoplay && c6AppData.profile.autoplay) {
                        player.play();
                    }

                    $scope.$emit('<mr-card>:init', controlNav);
                }

                function deactivateCard() {
                    player.pause();
                }

                player
                    .once('companionsReady', function() {
                        var companions = player.getCompanions(300, 250);

                        _data.companion = companions && companions[0];
                    })
                    .on('play', function() {
                        _data.hasPlayed = true;
                    })
                    .on('ended', function() {
                        if ($scope.active) {
                            goForward();
                        } else {
                            shouldGoForward = true;
                        }
                    })
                    .on('error', function() {
                        if ($scope.active) {
                            goForward();
                        } else {
                            shouldGoForward = true;
                        }
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

            Object.defineProperties(this, {
                showPlay: {
                    get: function() {
                        return !!AdCardCtrl.player && AdCardCtrl.player.paused && (_data.hasPlayed || !data.autoplay);
                    }
                }
            });

            this.player = null;
            this.adType = profile.flash ? 'vpaid' : 'vast';
            this.adTag = compileAdTag(adTags[this.adType][data.source]);

            [
                '<vast-player>:init',
                '<vpaid-player>:init'
            ].forEach(function($event) {
                $scope.$on($event, playerInit);
            });
        }])

        .directive('adCard',['assetFilter',function(assetFilter) {

            return {
                restrict: 'E',
                controller: 'AdCardController',
                controllerAs: 'Ctrl',
                templateUrl: assetFilter('directives/ad_card.html','views')
            };
        }]);

});
