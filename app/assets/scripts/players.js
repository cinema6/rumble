(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .service('VimeoPlayerService', [function() {
            var service = this;

            this.players = {};

            this.Player = function(id) {
                this.call = function(method) {

                };

                service.players[id] = this;
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
                            publicTime = null,
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
