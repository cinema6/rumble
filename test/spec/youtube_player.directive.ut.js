(function() {
    'use strict';

    define(['players'], function() {
        describe('<youtube-player>', function() {
            var $rootScope,
                $scope,
                $compile,
                $interval;

            var youtube,
                players,
                player;

            var $player;

            beforeEach(function() {
                players = [];

                module('c6.mrmaker', function($provide) {
                    $provide.value('youtube', {
                        Player: jasmine.createSpy('youtube.Player')
                            .and.callFake(function(iframe, config) {
                                this.getCurrentTime = jasmine.createSpy('youtube.getCurrentTime()')
                                    .and.returnValue(0);

                                this._trigger = function(name, event) {
                                    config.events[name](event);
                                };

                                players.push(this);
                                player = this;
                            }),
                        PlayerState: {
                            ENDED: 0,
                            PLAYING: 1,
                            PAUSED: 2,
                            BUFFERING: 3,
                            CUED: 4
                        }
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $interval = $injector.get('$interval');

                    youtube = $injector.get('youtube');

                    $scope = $rootScope.$new();
                });
            });

            describe('initialization', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $player = $compile('<youtube-player videoid="gy1B3agGNxw"></youtube-player>')($scope);
                    });
                });

                it('should create a youtube iframe', function() {
                    var $iframe = $player.find('iframe');

                    expect($iframe.length).toBe(1);
                    expect($iframe.attr('src')).toBe('//www.youtube.com/embed/gy1B3agGNxw?rel=0&enablejsapi=1');
                });

                it('should create a YouTube player with the iframe', function() {
                    var iframe = $player.find('iframe')[0];

                    expect(youtube.Player).toHaveBeenCalledWith(iframe, jasmine.any(Object));
                });
            });

            describe('player interface', function() {
                var video;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $player = $compile('<youtube-player videoid="gy1B3agGNxw"></youtube-player>')($scope);
                    });
                    video = $player.data('video');
                });

                it('should be accessible via jqLite .data()', function() {
                    expect(video).toEqual(jasmine.any(Object));
                });

                it('should have an interface that is as identical to the HTML5 video interface as possible', function() {
                    expect(video).toEqual(jasmine.objectContaining({
                        currentTime: 0,
                        duration: 0,
                        ended: false,
                        paused: true,
                        readyState: -1,
                        seeking: false,
                        videoid: 'gy1B3agGNxw'
                    }));
                });

                describe('events', function() {
                    beforeEach(function() {
                        expect(player).toBeDefined();
                    });

                    describe('ready', function() {
                        it('should be emitted when the player is ready', function() {
                            var readySpy = jasmine.createSpy('ready');

                            video.on('ready', readySpy);

                            player._trigger('onReady', {});
                            expect(readySpy).toHaveBeenCalled();
                        });
                    });

                    describe('loadedmetadata', function() {
                        it('should be emitted the first time the video plays', function() {
                            var metadataSpy = jasmine.createSpy('loadedmetadata');

                            video.on('loadedmetadata', metadataSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(metadataSpy).toHaveBeenCalled();

                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(metadataSpy.calls.count()).toBe(1);
                        });
                    });

                    describe('canplay', function() {
                        it('should be emitted the first time the video plays', function() {
                            var canplaySpy = jasmine.createSpy('canplay');

                            video.on('canplay', canplaySpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(canplaySpy).toHaveBeenCalled();

                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(canplaySpy.calls.count()).toBe(1);
                        });
                    });

                    describe('ended', function() {
                        it('should be emitted when the video ends', function() {
                            var endedSpy = jasmine.createSpy('ended');

                            video.on('ended', endedSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            player._trigger('onStateChange', { data: youtube.PlayerState.ENDED });

                            expect(endedSpy).toHaveBeenCalled();
                        });
                    });

                    describe('pause', function() {
                        it('should be emitted when the player is paused', function() {
                            var pauseSpy = jasmine.createSpy('pause');

                            video.on('pause', pauseSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });

                            expect(pauseSpy).toHaveBeenCalled();
                        });
                    });

                    describe('play', function() {
                        it('should be emitted after the video is resumed', function() {
                            var playSpy = jasmine.createSpy('play');

                            video.on('play', playSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(playSpy).not.toHaveBeenCalled();

                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });

                            expect(playSpy).toHaveBeenCalled();
                        });
                    });

                    describe('playing', function() {
                        it('should be emitted after the video plays, no matter what', function() {
                            var playingSpy = jasmine.createSpy('playing');

                            video.on('playing', playingSpy);

                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });
                            expect(playingSpy).toHaveBeenCalled();

                            player._trigger('onStateChange', { data: youtube.PlayerState.PAUSED });
                            player._trigger('onStateChange', { data: youtube.PlayerState.PLAYING });

                            expect(playingSpy.calls.count()).toBe(2);
                        });
                    });

                    describe('seeked', function() {
                        beforeEach(function() {
                            player._trigger('onReady', {});
                        });

                        it('should be emitted after the video finishes seeking', function() {
                            var seekedSpy = jasmine.createSpy('seeked');

                            video.on('seeked', seekedSpy);

                            player.getCurrentTime.and.returnValue(1);
                            $interval.flush(250);
                            player.getCurrentTime.and.returnValue(1.25);
                            $interval.flush(250);
                            player.getCurrentTime.and.returnValue(1.5);
                            $interval.flush(250);

                            expect(seekedSpy).not.toHaveBeenCalled();

                            video.currentTime = 10;

                            $interval.flush(250);
                            expect(seekedSpy).not.toHaveBeenCalled();

                            $interval.flush(250);
                            expect(seekedSpy).not.toHaveBeenCalled();

                            player.getCurrentTime.and.returnValue(11);
                            $interval.flush(250);
                            expect(seekedSpy).toHaveBeenCalled();
                            seekedSpy.calls.reset();

                            player.getCurrentTime.and.returnValue(11.25);
                            $interval.flush(250);
                            expect(seekedSpy).not.toHaveBeenCalled();
                        });
                    });

                    describe('seeking', function() {
                        beforeEach(function() {
                            player._trigger('onReady', {});
                        });

                        it('should be emitted when the video is seeked', function() {
                            var seekingSpy = jasmine.createSpy('seeking');

                            video.on('seeking', seekingSpy);

                            video.currentTime = 25;
                            expect(seekingSpy).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
