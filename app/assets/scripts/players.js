(function() {
    'use strict';

    var fromJson = angular.fromJson;

    angular.module('c6.mrmaker')
        .service('VimeoPlayerService', ['$q','$window','$rootScope','c6EventEmitter',
                                        'c6UrlParser',
        function                       ( $q , $window , $rootScope , c6EventEmitter ,
                                         c6UrlParser ) {
            var service = this;

            function delegateMessage(event) {
                var data = event.data,
                    player;

                if (event.origin !== 'http://player.vimeo.com') { return; }

                data = fromJson(data);

                /* jshint camelcase:false */
                player = service.players[data.player_id];
                /* jshint camelcase:true */

                if (!player) { return; }

                $rootScope.$apply(function() {
                    player._handleMessage(data);
                });
            }

            this.players = {};

            this.Player = function($iframe) {
                var self = this,
                    pending = {},
                    src = c6UrlParser($iframe.attr('src')),
                    id = (src.search.match(/player_id=((\w|-)+)/) || [])[1];

                if (!id) {
                    throw new Error(
                        'Provided iFrame has no player_id specified in the search params.'
                    );
                }

                this._handleMessage = function(data) {
                    var method = data.method,
                        event = data.event,
                        value = data.value;

                    if (method) {
                        pending[method].resolve(value);
                        delete pending[method];
                    }

                    if (event) {
                        this.emit(event, data.data);
                    }
                };

                this.call = function(method, data) {
                    var deferred = pending[method] || $q.defer(),
                        message = {
                            method: method
                        };

                    if (arguments.length > 1) {
                        message.value = data;
                    }

                    $iframe[0].contentWindow.postMessage(
                        angular.toJson(message),
                        '*'
                    );

                    switch (method) {
                    case 'play':
                    case 'pause':
                    case 'seekTo':
                    case 'unload':
                    case 'setColor':
                    case 'setLoop':
                    case 'setVolume':
                        deferred.resolve();
                        break;

                    default:
                        pending[method] = deferred;
                    }

                    return deferred.promise;
                };

                c6EventEmitter(this);

                this.on('newListener', function(event) {
                    if (event.search(
                        /^(ready|newListener|removeListener)$/
                    ) > -1) { return; }

                    self.call('addEventListener', event);
                });

                $iframe.on('$destroy', function() {
                    delete service.players[id];
                });

                service.players[id] = this;
            };

            $window.addEventListener('message', delegateMessage, false);
        }])

        .directive('vimeoPlayer', ['VimeoPlayerService','c6EventEmitter',
        function                  ( VimeoPlayerService , c6EventEmitter ) {
            return {
                restrict: 'E',
                template: [
                    '<iframe id="{{id}}"',
                    '    src="about:blank"',
                    '    width="100%"',
                    '    height="100%"',
                    '    frameborder="0"',
                    '    webkitAllowFullScreen',
                    '    mozallowfullscreen',
                    '    allowFullScreen>',
                    '</iframe>'
                ].join('\n'),
                scope: {
                    videoid: '@',
                    id: '@'
                },
                link: function(scope, $element) {
                    var $iframe = $element.find('iframe');

                    function VideoPlayer($iframe) {
                        var self = this,
                            player = new VimeoPlayerService.Player($iframe),
                            hasPaused = false,
                            state = {
                                buffered: 0,
                                currentTime: 0,
                                duration: 0,
                                ended: false,
                                paused: true,
                                readyState: -1,
                                seeking: false
                            };

                        function addEventListeners(player) {
                            player
                                .once('loadProgress', function() {
                                    state.readyState = 3;
                                    self.emit('canplay');
                                    self.emit('loadstart');
                                })
                                .on('loadProgress', function(data) {
                                    var percent = parseFloat(data.percent);

                                    if (percent >= 0.25) {
                                        state.readyState = 4;
                                        self.emit('canplaythrough');
                                        player.removeListener('loadProgress', this);
                                    }
                                })
                                .on('loadProgress', function(data) {
                                    var percent = parseFloat(data.percent);

                                    state.buffered = percent;
                                    self.emit('progress');
                                })
                                .on('finish', function() {
                                    state.ended = true;
                                    self.emit('ended');
                                })
                                .on('pause', function() {
                                    hasPaused = true;
                                    state.paused = true;

                                    self.emit('pause');
                                })
                                .on('play', function() {
                                    state.ended = false;
                                    state.paused = false;

                                    if (hasPaused) {
                                        self.emit('play');
                                    }

                                    self.emit('playing');
                                })
                                .on('seek', function() {
                                    state.seeking = false;
                                    self.emit('seeked');
                                })
                                .on('playProgress', function(data) {
                                    var time = parseFloat(data.seconds);

                                    state.currentTime = time;
                                    self.emit('timeupdate');
                                });
                        }

                        this.play = function() {
                            player.call('play');
                        };

                        this.pause = function() {
                            player.call('pause');
                        };

                        Object.defineProperties(this, {
                            buffered: {
                                get: function() {
                                    return state.buffered;
                                }
                            },
                            currentTime: {
                                get: function() {
                                    return state.currentTime;
                                },
                                set: function(time) {
                                    state.seeking = true;
                                    self.emit('seeking');
                                    player.call('seekTo', time);
                                }
                            },
                            duration: {
                                get: function() {
                                    return state.duration;
                                }
                            },
                            ended: {
                                get: function() {
                                    return state.ended;
                                }
                            },
                            paused: {
                                get: function() {
                                    return state.paused;
                                }
                            },
                            readyState: {
                                get: function() {
                                    return state.readyState;
                                }
                            },
                            seeking: {
                                get: function() {
                                    return state.seeking;
                                }
                            }
                        });

                        player.on('ready', function() {
                            state.readyState = 0;
                            self.emit('ready');
                            addEventListeners(player);

                            player.call('getDuration')
                                .then(function getDuration(duration) {
                                    state.readyState = 1;
                                    state.duration = duration;
                                    self.emit('loadedmetadata');
                                });
                        });

                        c6EventEmitter(this);
                    }

                    // We can't rely on angular bindings to set the iframe src because it needs to
                    // be set before it is passed to the constructor below.
                    $iframe.attr('src', 'http://player.vimeo.com/video/' +
                        scope.videoid +
                        '?api=1&player_id=' +
                        scope.id);

                    $element.data('video', new VideoPlayer($iframe));
                }
            };
        }])

        .directive('youtubePlayer', ['youtube','c6EventEmitter','$interval',
        function                    ( youtube , c6EventEmitter , $interval ) {
            return {
                restrict: 'E',
                scope: {
                    videoid: '@'
                },
                template: [
                    '<iframe width="100%"',
                    '    height="100%"',
                    '    src="{{url}}"',
                    '    frameborder="0"',
                    '    allowfullscreen>',
                    '</iframe>'
                ].join('\n'),
                link: function(scope, $element) {
                    function VideoPlayer(id, $iframe) {
                        var self = this,
                            hasPaused = false,
                            currentTimeInterval = null,
                            player = new youtube.Player($iframe[0], {
                                events: {
                                    onReady: function onReady() {
                                        state.readyState = 0;
                                        self.emit('ready');

                                        currentTimeInterval = $interval(function pollCurrentTime() {
                                            state.currentTime = player.getCurrentTime();

                                            if (state.currentTime !== publicTime) {
                                                publicTime = state.currentTime;
                                                self.emit('timeupdate');
                                            }

                                            if (state.seeking) {
                                                if (state.currentTime !== seekStartTime) {
                                                    state.seeking = false;
                                                    self.emit('seeked');
                                                }
                                            }
                                        }, 250);
                                    },
                                    onStateChange: function onStateChange(event) {
                                        var PlayerState = youtube.PlayerState;

                                        switch (event.data) {
                                        case PlayerState.PLAYING:
                                            state.ended = false;
                                            state.paused = false;

                                            if (state.readyState < 1) {
                                                state.readyState = 3;
                                                self.emit('loadedmetadata');
                                                self.emit('canplay');
                                            }

                                            if (hasPaused) {
                                                self.emit('play');
                                            }

                                            self.emit('playing');
                                            break;

                                        case PlayerState.ENDED:
                                            state.paused = true;
                                            state.ended = true;
                                            self.emit('ended');
                                            break;

                                        case PlayerState.PAUSED:
                                            state.paused = true;
                                            self.emit('pause');
                                            hasPaused = true;
                                            break;
                                        }
                                    }
                                }
                            }),
                            seekStartTime = null,
                            publicTime = 0,
                            state = {
                                currentTime: 0,
                                ended: false,
                                paused: true,
                                seeking: false,
                                readyState: -1
                            };

                        Object.defineProperties(this, {
                            currentTime: {
                                get: function() {
                                    return state.currentTime;
                                },
                                set: function(time) {
                                    if (self.readyState < 1) {
                                        throw new Error(
                                            'Can\'t seek video. Haven\'t loaded metadata.'
                                        );
                                    }

                                    seekStartTime = state.currentTime;
                                    state.seeking = true;
                                    self.emit('seeking');
                                    player.seekTo(time);
                                }
                            },
                            duration: {
                                get: function() {
                                    return player.getDuration();
                                }
                            },
                            ended: {
                                get: function() {
                                    return state.ended;
                                }
                            },
                            paused: {
                                get: function() {
                                    return state.paused;
                                }
                            },
                            readyState: {
                                get: function() {
                                    return state.readyState;
                                }
                            },
                            seeking: {
                                get: function() {
                                    return state.seeking;
                                }
                            },
                            videoid: {
                                value: id
                            }
                        });

                        this.pause = function() {
                            player.pauseVideo();
                        };

                        this.play = function() {
                            player.playVideo();
                        };

                        c6EventEmitter(this);

                        $iframe.on('$destroy', function() {
                            $interval.cancel(currentTimeInterval);
                            player.destroy();
                            self.emit('destroy');
                        });
                    }

                    scope.url = '//www.youtube.com/embed/' + scope.videoid + '?rel=0&enablejsapi=1';

                    $element.data('video', new VideoPlayer(scope.videoid, $element.find('iframe')));
                }
            };
        }]);
}());
