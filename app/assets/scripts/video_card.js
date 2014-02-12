(function() {
    'use strict';

    angular.module('c6.rumble')
        .controller('VideoCardController', ['$scope','ModuleService','$log','ControlsService','EventService',
        function                           ( $scope , ModuleService , $log , ControlsService , EventService ) {
            var config = $scope.config,
                _data = config._data = config._data || {
                    playerEvents: {},
                    modules: {
                        ballot: {
                            active: false,
                            vote: null
                        },
                        displayAd: {
                            active: false
                        }
                    }
                };

            function watchState(player) {
                $scope.$watch('onDeck', function(onDeck) {
                    if (onDeck) {
                        player.twerk()
                            .catch(function(error) {
                                $log.warn(error);
                            });
                    }
                });

                $scope.$watch('active', function(active, wasActive) {
                    if (active === wasActive) { return; }

                    if (active) {
                        ControlsService.bindTo(player);

                        if (config.data.autoplay) {
                            player.play();
                        }
                    } else {
                        player.pause();
                    }
                });
            }

            this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

            $scope.$on('playerAdd', function(event, player) {
                _data.playerEvents = EventService.trackEvents(player, ['play']);

                Object.defineProperty(_data.modules.ballot, 'active', {
                    get: function() {
                        var playing = (!player.paused && !player.ended),
                            voted = angular.isNumber(_data.modules.ballot.vote),
                            hasPlayed = _data.playerEvents.play.emitCount > 0;

                        return !voted && !playing && hasPlayed && $scope.active;
                    }
                });

                player.once('ready', watchState.bind(null, player));

                player.once('play', function() {
                    _data.modules.displayAd.active = true;
                });
            });
        }])

        .directive('videoCard', ['playerInterface','$q','$timeout','c6UrlMaker',
        function                ( playerInterface , $q , $timeout , c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_card.html'),
                controller: 'VideoCardController',
                controllerAs: 'Ctrl',
                link: function(scope) {
                    var iface = playerInterface(),
                        _iface = {
                            twerked: false
                        },
                        c6Video;

                    Object.defineProperties(iface, {
                        currentTime: {
                            get: function() {
                                return c6Video ? c6Video.player.currentTime : 0;
                            },
                            set: function(time) {
                                if (!c6Video) { return; }

                                c6Video.player.currentTime = time;
                            }
                        },
                        ended: {
                            get: function() {
                                return c6Video ? c6Video.player.ended : false;
                            }
                        },
                        twerked: {
                            get: function() {
                                return _iface.twerked;
                            }
                        },
                        duration: {
                            get: function() {
                                return c6Video ? c6Video.player.duration : NaN;
                            }
                        },
                        paused: {
                            get: function() {
                                return !c6Video || c6Video.player.paused;
                            }
                        }
                    });

                    iface.isReady = function() {
                        return !!c6Video;
                    };

                    iface.getType = function() {
                        return 'video';
                    };

                    iface.play = function() {
                        if (!c6Video) { return; }

                        c6Video.player.play();
                    };

                    iface.pause = function() {
                        if (!c6Video) { return; }

                        c6Video.player.pause();
                    };

                    iface.twerk = function(wait) {
                        var deferred = $q.defer(),
                            promise = deferred.promise,
                            waitTimer;

                        function resolve() {
                            c6Video.off('progress', resolve);

                            deferred.resolve(iface);

                            if (waitTimer) {
                                $timeout.cancel(waitTimer);
                            }
                        }

                        if (!c6Video) {
                            deferred.reject('Cannot twerk because the video is not ready.');
                            return promise;
                        }

                        if (iface.twerked) {
                            deferred.reject('Video has already been twerked.');
                            return promise;
                        }

                        if (angular.isUndefined(wait)) {
                            wait = 1000;
                        }

                        if (wait) {
                            waitTimer = $timeout(function() {
                                c6Video.off('progress', resolve);
                                deferred.reject('Twerk timed out after ' + wait + 'ms.');
                            }, wait);
                        }

                        c6Video.player.load();
                        c6Video.on('progress', resolve);

                        if (c6Video.bufferedPercent() === 1) {
                            resolve();
                        }

                        promise.then(function() {
                            _iface.twerked = true;
                        });

                        return promise;
                    };

                    scope.$emit('playerAdd', iface);

                    scope.$on('c6video-ready', function(event, video) {
                        c6Video = video;

                        angular.forEach(['play', 'pause', 'timeupdate'], function(event) {
                            video.on(event, function() {
                                iface.emit(event, iface);
                            });
                        });

                        video.on('ended', function() {
                            iface.emit('ended', iface);
                            video.fullscreen(false);
                        });

                        $timeout(function() {
                            iface.emit('ready', iface);
                        });
                    });
                }
            };
        }]);
}());
