(function() {
    'use strict';

    angular.module('c6.mrmaker')
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
                    function VideoPlayer(id) {
                        var self = this,
                            hasPaused = false,
                            player = new youtube.Player($element.find('iframe')[0], {
                                events: {
                                    onReady: function onReady() {
                                        self.emit('ready');
                                    },
                                    onStateChange: function onStateChange(event) {
                                        var state = event.data,
                                            PlayerState = youtube.PlayerState;

                                        switch (state) {
                                        case PlayerState.PLAYING:
                                            if (self.readyState < 1) {
                                                self.readyState = 1;
                                                self.emit('loadedmetadata');
                                                self.emit('canplay');
                                            }

                                            if (hasPaused) {
                                                self.emit('play');
                                            }

                                            self.emit('playing');
                                            break;

                                        case PlayerState.ENDED:
                                            self.emit('ended');
                                            break;

                                        case PlayerState.PAUSED:
                                            self.emit('pause');
                                            hasPaused = true;
                                            break;
                                        }
                                    }
                                }
                            }),
                            seekStartTime = null,
                            state = {
                                currentTime: 0,
                                seeking: false
                            };

                        Object.defineProperties(this, {
                            currentTime: {
                                get: function() {
                                    return state.currentTime;
                                },
                                set: function() {
                                    seekStartTime = state.currentTime;
                                    state.seeking = true;
                                }
                            }
                        });

                        this.duration = 0;
                        this.ended = false;
                        this.paused = true;
                        this.readyState = -1;
                        this.seeking = false;
                        this.videoid = id;

                        $interval(function pollCurrentTime() {
                            state.currentTime = player.getCurrentTime();

                            if (state.seeking) {
                                if (state.currentTime !== seekStartTime) {
                                    state.seeking = false;
                                    self.emit('seeked');
                                }
                            }
                        }, 250);

                        c6EventEmitter(this);
                    }

                    scope.url = '//www.youtube.com/embed/' + scope.videoid + '?rel=0&enablejsapi=1';

                    $element.data('video', new VideoPlayer(scope.videoid));
                }
            };
        }]);
}());
