define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.rumble.cards.video', [])
        .controller('VideoCardController', ['$scope','c6ImagePreloader','$interval','c6AppData',
                                            'trackerService','$q','MiniReelService',
                                            'VideoTrackerService','$timeout',
        function                           ( $scope , c6ImagePreloader , $interval , c6AppData ,
                                             trackerService , $q , MiniReelService ,
                                             VideoTrackerService , $timeout ) {
            var VideoCardCtrl = this,
                behaviors = c6AppData.behaviors,
                config = $scope.config,
                profile = $scope.profile,
                data = config.data,
                hasPlayed = false,
                hasModule = $scope.hasModule,
                _data = config._data || (config._data = {
                    hasPlayed: false,
                    companion: null,
                    tracking: {
                        clickFired: false,
                        countFired: false
                    },
                    modules: {
                        ballot: {
                            ballotActive: false,
                            resultsActive: false,
                            vote: null
                        },
                        post: {
                            active: false,
                            ballot: config.ballot
                        },
                        displayAd: {
                            active: behaviors.showsCompanionWithVideoAd
                        }
                    }
                }),
                tracker = trackerService('c6mr');

            function waitForPlay(player, timeout) {
                var deferred = $q.defer();

                if (timeout) {
                    $timeout(function() {
                        deferred.reject('Video play timed out.');
                    }, timeout);
                }

                player.once('play', function() {
                    deferred.resolve(player);
                });

                return deferred.promise;
            }

            function closeBallot() {
                ['closeBallot', 'closeBallotResults'].forEach(function(method) {
                    this[method]();
                }, VideoCardCtrl);
            }

            function trackPlayTiming(player) {
                var start = Date.now();

                waitForPlay(player).then(function() {
                    tracker.trackTiming(MiniReelService.getTrackingData(config, $scope.number - 1, {
                        timingCategory: 'Video',
                        timingVar: 'playDelay',
                        timingLabel: 'null',
                        timingValue: Date.now() - start
                    }));
                });
            }

            function playerReady(player) {
                function controlNav(NavController) {
                    var canSkipAnytime = data.skip === true || data.skip === 0,
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
                    // Because of $$$, we don't want to load the video unless it is NOT
                    // on the first card.
                    if (($scope.number - 1) > 0) {
                        player.load();
                    }

                    if (config.thumbs) {
                        c6ImagePreloader.load([config.thumbs.large]);
                    }
                }

                function activateCard() {
                    if (data.autoplay) {
                        waitForPlay(player, 5000).catch(function(error) {
                            trackVideoEvent('Error', true, error);
                        });

                        trackVideoEvent('AutoPlayAttempt', true);
                        player.play();
                        trackPlayTiming(player);
                    }

                    if (!_data.hasPlayed) {
                        $scope.$emit('<mr-card>:init', controlNav);
                    }
                }

                function deactivateCard() {
                    if (player.pause() instanceof Error) {
                        player.reload();
                    }

                    if (_data.modules.ballot.ballotActive) {
                        _data.modules.ballot.vote = -1;
                    }

                    closeBallot();
                }

                function trackVideoEvent(event, nonInteractive, label) {
                    tracker.trackEvent(MiniReelService.getTrackingData(config, $scope.number - 1, {
                        category: 'Video',
                        action: event,
                        label: label || config.webHref || 'null',
                        videoSource: config.source || config.type,
                        videoDuration: player.duration,
                        nonInteraction: (+ !!nonInteractive)
                    }));
                }

                trackVideoEvent('Ready', true);

                VideoCardCtrl.player = player;

                player
                    .once('companionsReady', function() {
                        var companions = player.getCompanions(300, 250);

                        _data.companion = companions && companions[0];
                    })
                    .on('play', function() {
                        _data.modules.post.active = false;
                        closeBallot();

                        if (hasModule('displayAd')) {
                            _data.modules.displayAd.active = behaviors.showsCompanionWithVideoAd;
                        }

                        trackVideoEvent('Play', config.data.autoplay);
                    })
                    .on('pause', function() {
                        var ballot = _data.modules.ballot,
                            hasVoted = ballot.vote !== null;

                        if (hasVoted) {
                            ballot.resultsActive = true;
                        } else {
                            ballot.ballotActive = true;
                        }

                        _data.modules.post.active = true;

                        trackVideoEvent('Pause');
                    })
                    .on('ended', function() {
                        _data.modules.post.active = true;

                        if (!profile.inlineVideo) {
                            if (player.minimize() instanceof Error) {
                                player.reload();
                            }
                        }

                        if (!(
                            hasModule('post') ||
                            hasModule('ballot') ||
                            (hasModule('displayAd') && !behaviors.showsCompanionWithVideoAd)
                        )) {
                            $scope.$emit('<mr-card>:contentEnd', $scope.config);
                        }

                        _data.modules.displayAd.active = true;

                        trackVideoEvent('End');
                    })
                    .on('error', function() {
                        var error = player.error;

                        trackVideoEvent(
                            'Error',
                            true,
                            (error && error.message) || 'An unknown error occurred.'
                        );
                    })
                    .once('play', function() {
                        _data.hasPlayed = true;
                        hasPlayed = true;
                    });

                VideoTrackerService.trackQuartiles(config.id, player, function(quartile) {
                    trackVideoEvent('Quartile ' + quartile);
                });

                $scope.$on('<ballot-vote-module>:vote', function($event, vote) {
                    VideoCardCtrl.closeBallot();
                    _data.modules.ballot.resultsActive = true;

                    if (vote > -1) {
                        trackVideoEvent('Vote', false, config.ballot.choices[vote]);
                    }
                });

                $scope.$on('<post-module>:vote', function($event, vote) {
                    var post = _data.modules.post;

                    post.active = false;
                    post.ballot = null;

                    trackVideoEvent('Vote', false, config.ballot.choices[vote]);

                    if (player.ended) {
                        $scope.$emit('<mr-card>:contentEnd', $scope.config);
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

                // If it's a sponsored card, set up handlers to fire AdCount and Click pixels
                if (config.campaign) {
                    // Fire the Click pixel after the first play
                    if (config.campaign.clickUrls && !_data.tracking.clickFired) {
                        player.once('play', function() {
                            _data.tracking.clickFired = true;
                            c6ImagePreloader.load(config.campaign.clickUrls);
                        });
                    }

                    (function() {
                        var campaign = config.campaign,
                            tracking = _data.tracking,
                            lastTime = null,
                            elapsedTime = 0;

                        // Fire the AdCount pixel after minViewTime, by tracking the elapsed time
                        if (campaign.countUrls && campaign.minViewTime && !tracking.countFired) {
                            player.on('timeupdate', function fireMinViewPixel() {
                                var minViewTime = campaign.minViewTime;

                                if (!player.duration) { return; }

                                function firePixel() {
                                    tracking.countFired = true;

                                    c6ImagePreloader.load(campaign.countUrls);
                                    trackVideoEvent('AdCount', true);

                                    player.removeListener('timeupdate', fireMinViewPixel);
                                }

                                if (minViewTime < 0) {
                                    if (player.currentTime >= (player.duration - 1) && !tracking.countFired) {
                                        firePixel();
                                    }
                                    return;
                                }

                                if (lastTime === null) {
                                    lastTime = player.currentTime;
                                    return;
                                }

                                // if diff > 1 sec, it's probably a skip, and don't increment elapsed
                                if (Math.abs(player.currentTime - lastTime) <= 1) {
                                    elapsedTime += player.currentTime - lastTime;
                                }
                                lastTime = player.currentTime;

                                if (elapsedTime >= minViewTime && !tracking.countFired) {
                                    firePixel();
                                }
                            });
                        }
                    }());
                }
            }

            function playerInit($event, player) {
                player.once('ready', function() {
                    playerReady(player);
                });
            }

            this.player = null;
            this.enablePlay = !profile.touch && !(/^(dailymotion|embedded)$/).test(config.type);
            Object.defineProperties(this, {
                showPlay: {
                    get: function() {
                        return !!this.player && hasPlayed && this.player.paused;
                    }
                },
                flyAway: {
                    get: function() {
                        var modules = _data.modules,
                            postModule = modules.post,
                            ballotModule = modules.ballot,
                            displayAdModule = modules.displayAd;

                        return !$scope.active ||
                            (
                                hasModule('post') && postModule.active
                            ) || (
                                hasModule('ballot') &&
                                    (
                                        ballotModule.ballotActive ||
                                            (ballotModule.resultsActive && !behaviors.inlineVoteResults)
                                    )
                            ) || (
                                hasModule('displayAd') &&
                                displayAdModule.active &&
                                !behaviors.showsCompanionWithVideoAd
                            );
                    }
                }
            });

            this.closeBallot = function() {
                _data.modules.ballot.ballotActive = false;
            };
            this.closeBallotResults = function() {
                _data.modules.ballot.resultsActive = false;
            };

            [
                '<vast-player>:init',
                '<vpaid-player>:init',
                '<youtube-player>:init',
                '<vimeo-player>:init',
                '<dailymotion-player>:init',
                '<rumble-player>:init',
                '<embedded-player>:init'
            ].forEach(function($event) {
                $scope.$on($event, playerInit);
            });
        }])

        .directive('videoCard',[function() {

            return {
                restrict: 'E',
                controller: 'VideoCardController',
                controllerAs: 'Ctrl',
                template: [
                    '<ng-include src="config.templateUrl || (\'directives/video_card.html\' | asset:\'views\')"></ng-include>'
                ].join('\n')
            };
        }]);

});
