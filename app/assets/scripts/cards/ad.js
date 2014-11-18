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

                    if (mustWatchEntireVideo) {
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
                }

                function activateCard() {
                    if (c6AppData.experience.data.mode === 'lightbox') {
                        $rootScope.$broadcast('resize');
                    }

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
                    if (player.pause() instanceof Error) {
                        // player.reload();
                    }
                }

                function trackVideoEvent(/*event, nonInteractive, label*/) {
                    // tracker.trackEvent(MiniReelService.getTrackingData(config, $scope.number - 1, {
                    //     category: 'Ad',
                    //     action: event,
                    //     label: label || config.webHref,
                    //     videoSource: config.source || config.type,
                    //     videoDuration: player.duration,
                    //     nonInteraction: (+ !!nonInteractive)
                    // }));
                }

                function trackVideoPlayback() {
                    // var quartiles = _data.tracking.quartiles,
                    //     duration = player.duration,
                    //     currentTime = Math.min(player.currentTime, duration),
                    //     percent = (Math.round((currentTime / duration) * 100) / 100),
                    //     quartile = (function() {
                    //         if (percent >= 0.95) { return 3; }

                    //         return Math.floor(percent * 4) - 1;
                    //     }());

                    // if (quartile > -1 && !quartiles[quartile]) {
                    //     trackVideoEvent('Quartile ' + (quartile + 1));
                    //     quartiles[quartile] = true;
                    // }
                }

                player
                    .once('companionsReady', function() {
                        var companions = player.getCompanions(300, 250);

                        _data.companion = companions && companions[0];
                    })
                    .on('play', function() {
                        _data.hasPlayed = true;
                        trackVideoEvent('Play', config.data.autoplay);
                    })
                    .on('pause', function() {
                        trackVideoEvent('Pause');
                    })
                    .on('timeupdate', trackVideoPlayback)
                    .on('ended', function() {
                        if ($scope.active) {
                            goForward();
                        } else {
                            shouldGoForward = true;
                        }
                        trackVideoEvent('End');
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
