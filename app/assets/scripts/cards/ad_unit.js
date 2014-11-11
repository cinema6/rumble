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
                    companion: null,
                    tracking: {
                        clickFired: false,
                        countFired: false
                    },
                    modules: {
                        displayAd: {
                            active: false
                        }
                    }
                }),
                lastTime = null,
                elapsedTime = 0;

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

                // If it's a sponsored card, set up handlers to fire AdCount and Click pixels
                if (config.campaign) {
                    // Fire the Click pixel after the first play
                    if (config.campaign.clickUrl && !_data.tracking.clickFired) {
                        player.once('play', function() {
                            _data.tracking.clickFired = true;
                            c6ImagePreloader.load([config.campaign.clickUrl]);
                        });
                    }

                    // Fire the AdCount pixel after minViewTime, by tracking the elapsed time
                    if (config.campaign.countUrl && config.campaign.minViewTime &&
                                                    !_data.tracking.countFired) {
                        player.on('timeupdate', function fireMinViewPixel() {
                            if (lastTime === null) {
                                lastTime = player.currentTime;
                                return;
                            }

                            // if diff > 1 sec, it's probably a skip, and don't increment elapsed
                            if (Math.abs(player.currentTime - lastTime) <= 1) {
                                elapsedTime += player.currentTime - lastTime;
                            }
                            lastTime = player.currentTime;

                            if (elapsedTime >= config.campaign.minViewTime && !_data.tracking.countFired) {
                                _data.tracking.countFired = true;
                                c6ImagePreloader.load([config.campaign.countUrl]);
                                player.removeListener('timeupdate', fireMinViewPixel);
                            }
                        });
                    }
                }
            }

            function playerInit($event, player) {
                player
                    .once('ready', function() {
                        playerReady(player);
                    })
                    .once('companionsReady', function() {
                        var companions = player.getCompanions(300, 250);

                        _data.companion = companions && companions[0];
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
