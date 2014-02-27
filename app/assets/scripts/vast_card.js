(function() {
    'use strict';

    angular.module('c6.rumble')
        .controller('VastCardController', ['$scope','VASTService','ControlsService','EventService',
        function                          ( $scope , VASTService , ControlsService , EventService ) {
            var self = this,
                config = $scope.config,
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
                },
                data = config.data;

            this.videoSrc = null;

            $scope.$watch('onDeck', function(onDeck) {
                if(onDeck) {
                    VASTService.getVAST().then(function(vast) {
                        self.videoSrc = vast.getVideoSrc('video/mp4');
                    });
                }
            });

            $scope.$on('playerAdd', function(event, iface) {
                _data.playerEvents = EventService.trackEvents(iface, ['play']);

                iface.on('ended', function() {
                    if (!_data.modules.displayAd.src) {
                        $scope.$emit('<vast-card>:contentEnd', config);
                    }
                });

                $scope.$watch('active', function(active, wasActive) {
                    if (active === wasActive) { return; }

                    if (active) {
                        ControlsService.bindTo(iface);

                        if (data.autoplay && _data.playerEvents.play.emitCount < 1) {
                            iface.play();
                        }
                    } else {
                        iface.pause();
                    }
                });
            });
        }])

        .directive('vastCard', ['playerInterface','$q','$timeout','c6UrlMaker','c6Profile',
        function               ( playerInterface , $q , $timeout , c6UrlMaker , c6Profile ) {
            return {
                restrict: 'E',
                templateUrl : c6UrlMaker('views/directives/vast_card' +
                                        ((c6Profile.device === 'phone') ? '--mobile' : '') +
                                        '.html'),
                controller: 'VastCardController',
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
                        return 'vast';
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
