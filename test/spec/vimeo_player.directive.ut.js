(function() {
    'use strict';

    define(['players'], function() {
        describe('<vimeo-player>', function() {
            var $rootScope,
                $scope,
                c6EventEmitter,
                $compile;

            var VimeoPlayerService,
                players,
                player;

            var $vimeo;

            beforeEach(function() {
                players = [];

                module('c6.mrmaker', function($provide) {
                    $provide.value('VimeoPlayerService', {
                        Player: jasmine.createSpy('VimeoPlayerService.Player')
                            .and.callFake(function($iframe) {
                                expect($iframe[0].tagName).toBe('IFRAME');

                                c6EventEmitter(this);

                                player = this;
                            })
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    c6EventEmitter = $injector.get('c6EventEmitter');

                    VimeoPlayerService = $injector.get('VimeoPlayerService');

                    $scope = $rootScope.$new();
                });
            });

            describe('initialization', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $vimeo = $compile('<vimeo-player id="rc-1" videoid="abc123"></vimeo-player>')($scope);
                    });
                });

                it('should create a vimeo iframe', function() {
                    var $iframe = $vimeo.find('iframe');

                    expect($iframe.length).toBe(1);
                    expect($iframe.attr('src')).toBe('http://player.vimeo.com/video/abc123?api=1&player_id=rc-1');
                });
            });

            describe('video interface', function() {
                var video;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $vimeo = $compile('<vimeo-player id="foo" videoid="abc123"></vimeo-player>')($scope);
                    });
                    video = $vimeo.data('video');
                });

                it('should be accessible via jqLite .data()', function() {
                    expect(video).toEqual(jasmine.any(Object));
                });

                describe('events', function() {
                    describe('ready', function() {
                        it('should be emitted when the player is ready', function() {
                            var ready = jasmine.createSpy('ready');

                            video.on('ready', ready);
                            expect(ready).not.toHaveBeenCalled();

                            player.emit('ready');
                            expect(ready).toHaveBeenCalled();
                        });
                    });

                    describe('canplay', function() {
                        it('should be emitted the first time the "loadProgress" event is emitted', function() {
                            var canplay = jasmine.createSpy('canplay');

                            video.on('canplay', canplay);

                            player.emit('loadProgress', {});
                            expect(canplay).toHaveBeenCalled();

                            player.emit('loadProgress', {});
                            expect(canplay.calls.count()).toBe(1);
                        });
                    });

                    describe('canplaythrough', function() {
                        it('should be emitted after the video buffers 25%', function() {
                            var canplaythrough = jasmine.createSpy('canplaythrough');

                            function loadProgress(percent) {
                                player.emit('loadProgress', {
                                    percent: percent.toString()
                                });
                            }

                            video.on('canplaythrough', canplaythrough);

                            loadProgress(0.01);
                            loadProgress(0.1);
                            loadProgress(0.15);
                            loadProgress(0.2);
                            expect(canplaythrough).not.toHaveBeenCalled();

                            loadProgress(0.3);
                            expect(canplaythrough).toHaveBeenCalled();

                            loadProgress(0.5);
                            expect(canplaythrough.calls.count()).toBe(1);
                        });
                    });

                    describe('ended', function() {
                        it('should be emitted when the player is finished', function() {
                            var ended = jasmine.createSpy('ended');

                            video.on('ended', ended);

                            player.emit('finish');
                            expect(ended).toHaveBeenCalled();
                        });
                    });

                    describe('loadedmetadata', function() {
                        it('should be emitted when the player is ready', function() {
                            var loadedmetadata = jasmine.createSpy('loadedmetadata');

                            video.on('loadedmetadata', loadedmetadata);

                            player.emit('ready');
                            expect(loadedmetadata).toHaveBeenCalled();
                        });
                    });

                    describe('loadstart', function() {
                        it('should be emitted once on the first "loadProgress" event', function() {
                            var loadstart = jasmine.createSpy('loadstart');

                            video.on('loadstart', loadstart);

                            player.emit('loadProgress', {});
                            expect(loadstart).toHaveBeenCalled();

                            player.emit('loadProgress', {});
                            expect(loadstart.calls.count()).toBe(1);
                        });
                    });

                    describe('pause', function() {
                        it('should be emitted on every "pause" event', function() {
                            var pause = jasmine.createSpy('pause');

                            video.on('pause', pause);

                            player.emit('pause');
                            expect(pause).toHaveBeenCalled();

                            player.emit('pause');
                            expect(pause.calls.count()).toBe(2);
                        });
                    });

                    describe('play', function() {
                        it('should be emitted after the video resumes', function() {
                            var play = jasmine.createSpy('play');

                            video.on('play', play);

                            player.emit('play');
                            expect(play).not.toHaveBeenCalled();

                            player.emit('pause');
                            player.emit('play');
                            expect(play).toHaveBeenCalled();

                            player.emit('play');
                            expect(play.calls.count()).toBe(2);
                        });
                    });

                    describe('playing', function() {
                        it('should be emitted on every play', function() {
                            var playing = jasmine.createSpy('playing');

                            video.on('playing', playing);

                            player.emit('play');
                            expect(playing).toHaveBeenCalled();

                            player.emit('play');
                            expect(playing.calls.count()).toBe(2);
                        });
                    });

                    describe('progress', function() {
                        it('should be emitted for every "loadProgress" event', function() {
                            var progress = jasmine.createSpy('progress');

                            video.on('progress', progress);

                            player.emit('loadProgress', {});
                            expect(progress).toHaveBeenCalled();

                            player.emit('loadProgress', {});
                            expect(progress.calls.count()).toBe(2);
                        });
                    });

                    describe('seeked', function() {
                        it('should be emitted when the video finishes seeking', function() {
                            var seeked = jasmine.createSpy('seeked');

                            video.on('seeked', seeked);

                            player.emit('seek', {});
                            expect(seeked).toHaveBeenCalled();

                            player.emit('seek', {});
                            expect(seeked.calls.count()).toBe(2);
                        });
                    });

                    describe('seeking', function() {
                        it('should be emitted when the video starts seeking', function() {
                            var seeking = jasmine.createSpy('seeking');

                            video.on('seeking', seeking);

                            video.currentTime = 15;
                            expect(seeking).toHaveBeenCalled();

                            video.currentTime = 30;
                            expect(seeking.calls.count()).toBe(2);
                        });
                    });

                    describe('timeupdate', function() {
                        it('should be emitted on every "playProgress" event', function() {
                            var timeupdate = jasmine.createSpy('timeupdate');

                            video.on('timeupdate', timeupdate);

                            player.emit('playProgress', {});
                            expect(timeupdate).toHaveBeenCalled();

                            player.emit('playProgress', {});
                            expect(timeupdate.calls.count()).toBe(2);
                        });
                    });
                });
            });
        });
    });
}());
