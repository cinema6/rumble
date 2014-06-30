(function(){
    'use strict';

    angular.module('c6.rumble')
        .controller('VpaidCardController', ['$scope','$log','ModuleService','EventService',
                                            '$interval','c6AppData','$rootScope',
        function                            ($scope , $log , ModuleService , EventService ,
                                             $interval , c6AppData , $rootScope ) {
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
                hasStarted = !data.autoplay,
                shouldGoForward = false,
                adHasBeenCalledFor = false,
                player;

            Object.defineProperties(this, {
                showVideo: {
                    get: function() {
                        return $scope.active && !_data.modules.displayAd.active;
                    }
                },
                showPlay: {
                    get: function() {
                        return !!player && player.paused && !_data.modules.displayAd.active && hasStarted;
                    }
                },
                enableDisplayAd: {
                    get: function() {
                        return (!!player && player.ended) || !$scope.profile.inlineVideo;
                    }
                }
            });

            function goForward() {
                $scope.$emit('<vpaid-card>:contentEnd', config);
            }

            this.reset = function() {
                // this is basically just a resumeAd() call
                // in order to play another ad we need to re-initialize the whole player
                player.play();
            };

            this.playVideo = function() {
                player.play().then(null, goForward);
            };

            this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

            this.enablePlayButton = !$scope.profile.touch;

            $scope.$watch('onDeck', function(shouldLoad) {
                if (shouldLoad) {
                    _data.modules.displayAd.src = config.displayAd;

                    if (!adHasBeenCalledFor) {
                        adHasBeenCalledFor = true;
                        player.loadAd();
                    }
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
                    // if (self.companion) {
                    //     _data.modules.displayAd.active = true;
                    // } else {
                    if ($scope.active) {
                        goForward();
                    } else {
                        shouldGoForward = true;
                    }
                    // }
                });

                iface.on('play', function() {
                    hasStarted = true;
                    _data.modules.displayAd.active = false;
                });

                iface.on('pause', function() {
                    if (self.hasModule('displayAd') && self.enableDisplayAd) {
                        _data.modules.displayAd.active = true;
                    }
                });

                iface.on('getCompanions', function(_player) {
                    var _companions = _player.getDisplayBanners();

                    angular.forEach(_companions, function(val) {
                        if (parseInt(val.width) === 300 && parseInt(val.height) === 250) {
                            self.companion = val;
                        }
                    });
                });

                $scope.$watch('active', function(active, wasActive) {
                    if (!active && !wasActive) { return; }

                    if (c6AppData.experience.data.mode === 'lightbox') {
                        $rootScope.$broadcast('resize');
                    }

                    if (active) {
                        if (shouldGoForward) {
                            goForward();
                        } else if (_data.playerEvents.play.emitCount < 1) {
                            $scope.$emit('<vpaid-card>:init', controlNavigation);
                            if (data.autoplay) {
                                adHasBeenCalledFor = true;
                                iface.play().then(null, goForward);
                            }
                        }
                    } else {
                        if (!iface.paused) {
                            iface.pause();
                        }
                        // _data.modules.displayAd.active = true;
                    }
                });
            });

            $scope.$on('$destroy', function() {
                if (c6AppData.experience.data.mode === 'lightbox') {
                    $rootScope.$broadcast('resize');
                }
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
                        playerReady = false,
                        hasLoadAdBeenCalled = false,
                        hasStarted = false,
                        player;

                    Object.defineProperties(iface, {
                        currentTime: {
                            get: function() {
                                return playerReady ? player.currentTime : 0;
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
                        return playerReady;
                    };

                    iface.loadAd = function() {
                        hasLoadAdBeenCalled = true;
                        return player.loadAd();
                    };

                    iface.play = function() {
                        if (!hasLoadAdBeenCalled) {
                            iface.loadAd();
                        }

                        if (hasStarted) {
                            return player.resumeAd();
                        } else {
                            hasStarted = true;
                            return player.startAd();
                        }
                    };

                    iface.pause = function() {
                        return player.pause();
                    };

                    iface.destroy = function() {
                        if (playerReady) {
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
                            playerReady = true;

                            iface.emit('ready', iface);

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
                            iface.emit('ended', iface);
                        });
                    }

                    createPlayer();

                }
            };
        }]);
}());
