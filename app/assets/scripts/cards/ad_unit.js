define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.cards.adUnit', [])
        .controller('AdUnitCardController', ['$rootScope','$scope','$log','$interval','ModuleService','EventService','c6AppData','compileAdTag','c6ImagePreloader',
        function                            ( $rootScope , $scope , $log , $interval , ModuleService , EventService , c6AppData , compileAdTag , c6ImagePreloader ) {
            var self = this,
                profile = $scope.profile,
                config = $scope.config,
                data = config.data,
                _data = config._data = config._data || {
                    playerEvents: {},
                    modules: {
                        displayAd: {
                            active: false
                        }
                    }
                },
                hasStarted = !data.autoplay,
                adHasBeenCalledFor = false,
                shouldGoForward = false,
                shouldLoadAd = false,
                shouldPlay = false,
                player;


            function goForward() {
                $scope.$emit('<mr-card>:contentEnd', config.meta || config);
            }

            function resetState() {
                _data.playerEvents.play.emitCount = 0;
                hasStarted = !data.autoplay;
                adHasBeenCalledFor = false;
                shouldGoForward = false;
                shouldLoadAd = false;
                shouldPlay = false;
            }

            function handleIface(event, iface) {
                function controlNavigation(controller) {
                    var autoplay = data.autoplay,
                        mustWatchEntireAd = data.skip === false,
                        canSkipAnyTime = !data.skip || data.skip === true,
                        waitTime;

                    function getWaitTime() {
                        return mustWatchEntireAd ?
                            (iface.duration || 0) : data.skip;
                    }

                    function cleanup() {
                        controller.enabled(true);
                        iface.removeListener('timeupdate', tickNav);
                    }

                    function tickNav() {
                        var remaining;

                        if (!waitTime) {
                            if (!(waitTime = getWaitTime())) {
                                return;
                            }
                        }

                        remaining = Math.max((waitTime - iface.currentTime), 0);

                        controller.tick(remaining);

                        if (!remaining) {
                            cleanup();
                        }
                    }

                    if (canSkipAnyTime) { return; }

                    waitTime = getWaitTime();
                    controller.enabled(false);

                    if (waitTime) {
                        controller.tick(waitTime);
                    }

                    if (mustWatchEntireAd) {
                        iface
                            .on('timeupdate', tickNav)
                            .once('ended', cleanup);

                        return;
                    }

                    if (autoplay) {
                        // there are no timeupdates coming from the VPAID player! ARRGHHH
                        // return iface.on('timeupdate', tickNav);
                    }

                    $interval(function() {
                        controller.tick(--waitTime);

                        if (!waitTime) {
                            controller.enabled(true);
                        }
                    }, 1000, waitTime);
                }

                player = iface;

                _data.playerEvents = EventService.trackEvents(iface, ['play']);

                player.on('ready', function() {
                    if ($scope.adType === 'vpaid' && shouldLoadAd) {
                        player.load();
                    }
                    if (shouldPlay) {
                        player.play();
                    }
                });

                player.on('ended', function() {
                    if ($scope.active) {
                        goForward();
                    } else {
                        shouldGoForward = true;
                    }
                });

                player.on('error', function() {
                    if ($scope.active) {
                        goForward();
                    } else {
                        shouldGoForward = true;
                    }
                });

                player.on('play', function() {
                    hasStarted = true;
                    if (!$scope.active || !shouldPlay) {
                        player.pause();
                    }
                });

                player.on('canplay', function() {
                    // not coming through from VPAID
                });

                player.on('timeupdate', function() {
                    // not coming through from VPAID
                });

                player.on('companionsReady', function() {
                    var companions = player.getCompanions();

                    angular.forEach(companions, function(val) {
                        if (parseInt(val.width) === 300 && parseInt(val.height) === 250) {
                            self.companion = val;
                        }
                    });
                });

                $scope.$watch('active', function(active, wasActive) {
                    if (!active && !wasActive) { return; }

                    if (active) {
                        if (shouldGoForward) {
                            goForward();
                            return;
                        }

                        if (player.ended || _data.playerEvents.play.emitCount < 1) {
                            if (player.ended) {
                                resetState();
                            }
                            $scope.$emit('<mr-card>:init', controlNavigation);
                            if (data.autoplay) {
                                adHasBeenCalledFor = true;
                                shouldPlay = true;
                                player.play();
                            }
                        }
                    } else {
                        shouldPlay = false;
                        player.pause();
                    }
                });
            }

            Object.defineProperties(this, {
                showPlay: {
                    get: function() {
                        return !!player && player.paused && hasStarted;
                    }
                }
            });

            this.enablePlayButton = !$scope.profile.touch;

            this.playVideo = function() {
                player.play();
            };

            $scope.adType = profile.flash ? 'vpaid' : 'vast';
            $scope.adTag = compileAdTag(config.data[$scope.adType]);

            $scope.$watch('onDeck', function(onDeck) {
                if (onDeck) {
                    if (!adHasBeenCalledFor) {
                        adHasBeenCalledFor = true;

                        if (player && player.load) {
                            player.load();
                        } else {
                            shouldLoadAd = true;
                        }
                    }

                    if (config.thumbs) {
                        c6ImagePreloader.load([config.thumbs.large]);
                    }
                }
            });

            $scope.$on('<vpaid-player>:init', handleIface);
            $scope.$on('<vast-player>:init', handleIface);

            $scope.$on('$destroy', function() {
                if (c6AppData.experience.data.mode === 'lightbox') {
                    $rootScope.$broadcast('resize');
                }
            });
        }])

        .directive('adUnitCard',['$log','assetFilter',
        function                ( $log , assetFilter ) {
            $log = $log.context('<ad-unit-card>');

            return {
                restrict: 'E',
                controller: 'AdUnitCardController',
                controllerAs: 'Ctrl',
                templateUrl: assetFilter('directives/ad_unit_card.html', 'views')
            };
        }]);

});
