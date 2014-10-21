define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.cards.adUnit', [])
        .controller('AdUnitCardController', ['$rootScope','$scope','$log','$interval','ModuleService','EventService','c6AppData',
        function                            ( $rootScope , $scope , $log , $interval , ModuleService , EventService , c6AppData ) {
            var self = this,
                config = $scope.config,
                profile = $scope.profile,
                _data = config._data = config._data || {
                    playerEvents: {},
                    textMode: true,
                    modules: {
                        ballot: {
                            ballotActive: false,
                            resultsActive: false,
                            vote: null
                        },
                        displayAd: {
                            active: false
                        }
                    }
                },
                data = config.data,
                hasStarted = !data.autoplay,
                shouldPlay = false,
                shouldGoForward = false,
                shouldLoadAd = false,
                adHasBeenCalledFor = false,
                ballotTargetPlays = 0,
                resultsTargetPlays = 0,
                player;

            function goForward() {
                $scope.$emit('<mr-card>:contentEnd', config.meta || config);
            }

            function handleIface(event, iface) {
                function controlNavigation(controller) {
                    var autoplay = data.autoplay,
                        mustWatchEntireAd = data.skip === false,
                        canSkipAnyTime = data.skip === true,
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
                        return iface.on('timeupdate', tickNav);
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

                Object.defineProperties(_data.modules.ballot, {
                    ballotActive: {
                        configurable: true,
                        get: function() {
                            var playing = (!iface.paused && !iface.ended),
                                voted = angular.isNumber(_data.modules.ballot.vote),
                                hasPlayed = _data.playerEvents.play.emitCount > ballotTargetPlays;

                            return !voted && !playing && hasPlayed;
                        }
                    },
                    resultsActive: {
                        get: function() {
                            var playing = (!iface.paused && !iface.ended),
                                voted = angular.isNumber(this.vote),
                                hasPlayed = _data.playerEvents.play.emitCount > resultsTargetPlays;

                            if (c6AppData.behaviors.inlineVoteResults) {
                                return voted;
                            }

                            return voted && !playing && hasPlayed;
                        }
                    }
                });

                player.on('ready', function() {
                    if (shouldLoadAd) {
                        player.load();
                    }
                    if (shouldPlay) {
                        player.play();
                    }
                });

                player.on('ended', function() {
                    if (!self.hasModule('ballot')) {
                        if ($scope.active) {
                            goForward();
                        } else {
                            shouldGoForward = true;
                        }
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
                    _data.modules.displayAd.active = false;
                });

                player.on('pause', function() {
                    if (self.hasModule('displayAd') && self.enableDisplayAd) {
                        _data.modules.displayAd.active = true;
                    }
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

                    if (c6AppData.experience.data.mode === 'lightbox') {
                        $rootScope.$broadcast('resize');
                    }

                    if (active) {
                        if (shouldGoForward) {
                            goForward();
                        } else if (_data.playerEvents.play.emitCount < 1) {
                            $scope.$emit('<vpaid-card>:init', controlNavigation);
                            if (data.autoplay) {
                                shouldPlay = true;
                                adHasBeenCalledFor = true;
                                player.play().then(null, goForward);
                            }
                        }
                    } else {
                        if (!player.paused) {
                            shouldPlay = false;
                            player.pause();
                        }
                        // _data.modules.displayAd.active = true;
                    }
                });
            }

            Object.defineProperties(this, {
                flyAway: {
                    get: function() {
                        var ballot = $scope.config._data.modules.ballot,
                            behaviors = c6AppData.behaviors;

                        if (!$scope.active) { return true; }

                                /* If we have a ballot:  If the ballot is being show.   If the results are a modal and they're being shown. */
                        return (this.hasModule('ballot') && (ballot.ballotActive || (ballot.resultsActive && !behaviors.inlineVoteResults))) ||
                            /* If there is a separate view for text, and if that mode is active: */
                            (behaviors.separateTextView && _data.textMode) ||
                            /* If this is a click-to-play minireel, it hasn't been played yet and the play button is enabled */
                            (!config.data.autoplay && !(_data.playerEvents.play || {}).emitCount && this.enablePlayButton);
                    }
                },
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

            this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

            this.enablePlayButton = !$scope.profile.touch;

            this.playVideo = function() {
                player.play();
            };

            this.dismissBallot = function() {
                ballotTargetPlays = _data.playerEvents.play.emitCount;
            };

            this.dismissBallotResults = function() {
                resultsTargetPlays = _data.playerEvents.play.emitCount;
            };

            this.showText = function() {
                player.pause();
                _data.textMode = true;
            };

            this.hideText = function() {
                if (profile.autoplay) {
                    player.play();
                }

                _data.textMode = false;
            };

            $scope.$watch('onDeck', function(shouldLoad) {
                if (shouldLoad) {
                    _data.modules.displayAd.src = config.displayAd;

                    if (!adHasBeenCalledFor) {
                        adHasBeenCalledFor = true;
                        if (!player || !player.load) {
                            shouldLoadAd = true;
                        } else {
                            player.load();
                        }
                    }
                }
            });

            $scope.$watch('config._data.modules.ballot.vote', function(vote, prevVote) {
                if (vote === prevVote) { return; }

                self.showText();
            });

            $scope.$watch('config._data.textMode', function(textMode, wasTextMode) {
                if (textMode === wasTextMode) { return; }

                self.dismissBallot();
            });

            $scope.$on('<vpaid-player>:init', handleIface);
            $scope.$on('<vast-player>:init', handleIface);

            $scope.$on('$destroy', function() {
                if (c6AppData.experience.data.mode === 'lightbox') {
                    $rootScope.$broadcast('resize');
                }
            });
        }])

        .directive('adUnitCard',['$log','$compile','assetFilter','compileAdTag',
        function                ( $log , $compile , assetFilter , compileAdTag ) {
            $log = $log.context('<ad-unit-card>');

            function fnLink(scope) {
                scope.adType = scope.profile.flash ? 'vpaid' : 'vast';

                scope.adTag = compileAdTag(scope.config.data[scope.adType]);
            }

            return {
                restrict: 'E',
                link: fnLink,
                controller: 'AdUnitCardController',
                controllerAs: 'Ctrl',
                templateUrl: assetFilter('directives/ad_unit_card.html', 'views')
            };
        }]);

});
