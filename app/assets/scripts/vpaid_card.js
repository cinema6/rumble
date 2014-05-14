(function(){
    'use strict';

    angular.module('c6.rumble')
        .controller('VpaidCardController', ['$scope', '$log', 'ModuleService', 'EventService', '$interval',
        function                            ($scope ,  $log ,  ModuleService ,  EventService ,  $interval) {
            $log = $log.context('VpaidCardController');
            var self = this,
                config = $scope.config,
                _data = config._data = config._data || {
                    playerEvents: {},
                    modules: {
                        displayAd: {
                            active: false
                        }
                    }
                },
                data = config.data,
                player;

            Object.defineProperties(this, {
                showVideo: {
                    get: function() {
                        return $scope.active && !_data.modules.displayAd.active;
                    }
                },
                showPlay: {
                    get: function() {
                        return !!player && player.paused && !_data.modules.displayAd.active;
                    }
                }
            });

            this.reset = function() {
                // this is basically just a resumeAd() call
                // in order to play another ad we need to re-initialize the whole player
                _data.modules.displayAd.active = false;

                player.play();
            };

            this.playVideo = function() {
                player.play();
            };

            this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

            this.enablePlayButton = !$scope.profile.touch &&
                !config.data.autoplay;

            $scope.$watch('onDeck', function(onDeck) {
                if(onDeck) {
                    _data.modules.displayAd.src = config.displayAd;
                }
            });

            $scope.$on('playerAdd', function(event, iface) {
                function controlNavigation(controller) {
                    var autoplay = data.autoplay,
                        mustWatchEntireAd = data.skip === false,
                        canSkipAnyTime = data.skip === true,
                        waitTime, timer;

                    function getWaitTime() {
                        return mustWatchEntireAd ?
                            (iface.duration || 0) : data.skip;
                    }

                    function cleanup() {
                        controller.enabled(true);
                        $interval.cancel(timer);
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

                    function doTimeUpdates() {
                        timer = $interval(function() {
                            if (iface.currentTime) {
                                tickNav();
                            }
                        }, 500);
                    }

                    if (canSkipAnyTime) { return; }

                    waitTime = getWaitTime();
                    controller.enabled(false);

                    if (waitTime) {
                        controller.tick(waitTime);
                    }

                    if (mustWatchEntireAd) {
                        doTimeUpdates();

                        iface.once('ended', cleanup);

                        return;
                    }

                    if (autoplay) {
                        return doTimeUpdates();
                    }

                    $interval(function() {
                        controller.tick(--waitTime);

                        if (!waitTime) {
                            controller.enabled(true);
                        }
                    }, 1000, waitTime);
                }

                player = iface;

                _data.playerEvents = EventService.trackEvents(iface, ['play', 'pause']);

                iface.on('ended', function() {
                    if (_data.modules.displayAd.src) {
                        _data.modules.displayAd.active = true;
                    } else {
                        $scope.$emit('<vpaid-card>:contentEnd', config);
                    }
                });

                iface.on('play', function() {
                    _data.modules.displayAd.active = false;
                });

                iface.on('pause', function() {
                    if (self.hasModule('displayAd')) {
                        _data.modules.displayAd.active = true;
                    }
                });

                iface.on('getCompanions', function(_player) {
                    // this doesn't work yet
                    self.companions = _player.getDisplayBanners();
                });

                $scope.$watch('active', function(active, wasActive) {
                    if (active === wasActive) { return; }

                    if (active) {
                        if (_data.playerEvents.play.emitCount < 1) {
                            $scope.$emit('<vpaid-card>:init', controlNavigation);
                            if (data.autoplay) {
                                iface.play();
                            }
                        }
                    } else {
                        if (!iface.paused) {
                            iface.pause();
                        }
                        _data.modules.displayAd.active = true;
                    }
                });
            });
        }])

        .directive('vpaidCard', ['$log', 'assetFilter', 'VPAIDService', 'playerInterface', '$q',
        function                ( $log ,  assetFilter ,  VPAIDService ,  playerInterface ,  $q ) {
            $log = $log.context('<vpaid-card>');
            return {
                restrict: 'E',
                controller: 'VpaidCardController',
                controllerAs: 'Ctrl',
                templateUrl: assetFilter('directives/vpaid_card.html', 'views'),
                link: function(scope, $element, $attr) {
                    var iface = playerInterface(),
                        _iface = {
                            paused: true,
                            ended: false,
                            duration: NaN
                        },
                        playerIsReady = false,
                        adIsReady = false,
                        adIsLoaded = false,
                        shouldPause = false,
                        hasStarted = false,
                        player;

                    Object.defineProperties(iface, {
                        currentTime: {
                            get: function() {
                                return playerIsReady ? player.currentTime : 0;
                            }
                        },
                        duration: {
                            get: function() {
                                return _iface.duration;
                            }
                        },
                        paused: {
                            get: function() {
                                return _iface.paused;
                            }
                        },
                        ended: {
                            get: function() {
                                return _iface.ended;
                            }
                        }
                    });

                    iface.getType = function() {
                        // returning 'ad' instead of 'vpaid' allows the rumble controller to find the card
                        return 'ad';
                    };

                    iface.getVideoId = function() {
                        return $attr.videoid;
                    };

                    iface.isReady = function() {
                        return playerIsReady;
                    };

                    iface.play = function() {
                        if(playerIsReady && adIsReady) {
                            if(hasStarted) {
                                player.resumeAd();
                            } else {
                                player.loadAd();
                                hasStarted = true;
                            }
                        }
                    };

                    iface.pause = function() {
                        if (playerIsReady && adIsLoaded) {
                            player.pause();
                        } else {
                            shouldPause = true;
                        }
                    };

                    iface.destroy = function() {
                        if(playerIsReady) {
                            player.destroy();
                        }
                    };

                    // not needed
                    iface.twerk = function() {
                        return $q.reject('Twerking is not supported in the VPAID player.');
                    };
                    iface.webHref = null;
                    iface.twerked = false;
                    // end of not needed

                    scope.$emit('playerAdd', iface);

                    function createPlayer() {
                        player = VPAIDService.createPlayer(scope.config.id, scope.config, $element.find('.mr-player'));

                        player.on('ready', function() {
                            // this fires when the flash object exists and responds to isCinema6player()
                            playerIsReady = true;

                            iface.emit('ready', iface);

                            player.on('adLoaded', function() {
                                if(shouldPause) {
                                    player.pause();
                                }
                                adIsLoaded = true;
                                shouldPause = false;
                            });

                            player.on('adReady', function() {
                                adIsReady = true;
                            });

                            player.on('ended', function() {
                                _iface.ended = true;
                                iface.emit('ended', iface);
                            });

                            player.on('play', function() {
                                _iface.paused = false;
                                _iface.duration = player.getDuration();
                                iface.emit('play', iface);
                            });

                            player.on('pause', function() {
                                _iface.paused = true;
                                iface.emit('pause', iface);
                            });

                            player.on('companionsReady', function() {
                                iface.emit('getCompanions', player);
                            });
                        });

                        player.insertHTML().then(function(result) {
                            $log.info(result);
                        }, function(error) {
                            $log.error(error);
                        });
                    }

                    createPlayer();

                }
            };
        }]);
}());