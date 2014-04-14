(function() {
    'use strict';

    define(['editor'], function() {
        describe('<video-preview>', function() {
            var $rootScope,
                $scope,
                $compile,
                $timeout,
                c6EventEmitter,
                $preview;

            beforeEach(function() {
                module('c6.mrmaker', function($provide) {
                    $provide.value('youtube', {
                        Player: function() {}
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    $timeout = $injector.get('$timeout');

                    $scope = $rootScope.$new();
                });

                $scope.service = null;
                $scope.videoid = null;

                $scope.$apply(function() {
                    $preview = $compile('<video-preview service="{{service}}" videoid="{{videoid}}" start="start" end="end"></video-preview>')($scope);
                });

                expect($preview.find('iframe').length).toBe(0);
            });

            describe('when the chosen player has an interface', function() {
                var video;

                function VideoInterface() {
                    var ready = false;

                    this.currentTime = 0;

                    this.pause = jasmine.createSpy('video.pause()');

                    c6EventEmitter(this);

                    this.once('ready', function() { ready = true; });

                    this.on('newListener', function(event) {
                        if (event.search(
                            /^(newListener|ready)$/
                        ) < 0 && !ready) {
                            throw new Error('Can\'t add a listener before the player is ready!');
                        }
                    });
                }

                function timeupdate(time) {
                    video.currentTime = time;
                    video.emit('timeupdate');
                }

                beforeEach(function() {
                    var $player = $('<mock-player></mock-player>');

                    video = new VideoInterface();
                    $player.data('video', video);

                    $scope.$apply(function() {
                        $scope.videoid = '85377978';
                    });
                    $preview.find('div').append($player);
                    $timeout.flush();

                    expect($preview.isolateScope().video).not.toBeDefined();
                    video.emit('ready');
                });

                it('should put the video on the scope', function() {
                    expect($preview.isolateScope().video).toBe(video);
                });

                describe('if there is no start/end specified', function() {
                    it('should not interfere with the video playback', function() {
                        timeupdate(0);
                        expect(video.currentTime).toBe(0);

                        timeupdate(1);
                        expect(video.currentTime).toBe(1);

                        timeupdate(2);
                        expect(video.currentTime).toBe(2);
                    });
                });

                describe('if there is a start/end time specified', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.start = 10;
                            $scope.end = 30;
                        });
                    });

                    it('should seek the video to the start time if there is a timeupdate and the currentTime is lower than the start', function() {
                        expect(video.currentTime).toBe(0);
                        timeupdate(1);

                        expect(video.currentTime).toBe(10);

                        timeupdate(10.1);
                        expect(video.currentTime).toBe(10.1);

                        timeupdate(8);
                        expect(video.currentTime).toBe(10);
                    });

                    it('should pause the video if it goes past or reaches the end time', function() {
                        timeupdate(25);
                        timeupdate(26);
                        timeupdate(27);
                        timeupdate(28);
                        timeupdate(29);
                        timeupdate(29.999);

                        expect(video.pause).not.toHaveBeenCalled();

                        timeupdate(30);
                        expect(video.pause).toHaveBeenCalled();

                        video.pause.calls.reset();

                        timeupdate(28);
                        timeupdate(29.5);
                        expect(video.pause).not.toHaveBeenCalled();

                        timeupdate(31);
                        expect(video.pause).toHaveBeenCalled();
                    });

                    it('should restart the video from the beginning if it is played after ending', function() {
                        timeupdate(15);
                        expect(video.currentTime).toBe(15);

                        video.emit('playing');
                        expect(video.currentTime).toBe(15);

                        timeupdate(31);

                        video.emit('playing');

                        expect(video.currentTime).toBe(10);

                        timeupdate(11);
                        timeupdate(12);

                        video.emit('playing');

                        expect(video.currentTime).toBe(12);
                    });
                });
            });

            describe('when the player has no interface', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.videoid = 'abc123';
                        $scope.service = 'dailymotion';
                    });
                });

                it('should not throw errors', function() {
                    expect(function() {
                        $timeout.flush();
                    }).not.toThrow();
                });
            });

            describe('youtube', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.service = 'youtube';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a youtube player when a videoid is provided', function() {
                    var $youtube;

                    $scope.$apply(function() {
                        $scope.videoid = 'gy1B3agGNxw';
                    });
                    $youtube = $preview.find('youtube-player');

                    expect($youtube.length).toBe(1);

                    expect($youtube.attr('videoid')).toBe('gy1B3agGNxw');
                });
            });

            describe('vimeo', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.service = 'vimeo';
                    });
                });

                it('should not create any player when there is no videoid', function() {
                    expect($preview.find('vimeo-player').length).toBe(0);
                });

                it('should create a vimeo player when a videoid is provided', function() {
                    var $vimeo;

                    $scope.$apply(function() {
                        $scope.videoid = '2424355';
                    });
                    $vimeo = $preview.find('vimeo-player');

                    expect($vimeo.length).toBe(1);

                    expect($vimeo.attr('id')).toBe('preview');
                    expect($vimeo.attr('videoid')).toBe('2424355');
                });
            });

            describe('dailymotion', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.service = 'dailymotion';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a vimeo embed iframe when a videoid is provided', function() {
                    var $iframe;

                    $scope.$apply(function() {
                        $scope.videoid = 'x199caf';
                    });
                    $iframe = $preview.find('iframe');

                    expect($iframe.length).toBe(1);

                    expect($iframe.attr('src')).toBe('http://www.dailymotion.com/embed/video/x199caf');
                });
            });
        });
    });
}());
