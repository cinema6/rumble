define(['services'], function(servicesModule) {
    'use strict';

    describe('VideoTrackerService', function() {
        var c6EventEmitter,
            VideoTrackerService;

        function Player() {
            this.play = jasmine.createSpy('player.play()');
            this.pause = jasmine.createSpy('player.pause()');
            this.load = jasmine.createSpy('player.load()');
            this.reload = jasmine.createSpy('player.reload()');
            this.getCompanions = jasmine.createSpy('player.getCompanions()')
                .and.returnValue(null);

            this.paused = true;
            this.currentTime = 0;
            this.duration = 0;
            this.ended = false;

            c6EventEmitter(this);
        }

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                c6EventEmitter = $injector.get('c6EventEmitter');
                VideoTrackerService = $injector.get('VideoTrackerService');
            });
        });

        it('should exist', function() {
            expect(VideoTrackerService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('trackQuartiles(id, player, cb)', function() {
                var id, player, cb;

                function timeupdate(time) {
                    player.currentTime = time;
                    player.emit('timeupdate');
                }

                beforeEach(function() {
                    id = 'rc-198214061fbe0f';
                    player = new Player();
                    cb = jasmine.createSpy('cb()');

                    player.duration = 100;

                    VideoTrackerService.trackQuartiles(id, player, cb);
                });

                describe('if the video has no duration', function() {
                    beforeEach(function() {
                        player.duration = 0;

                        [0, 1].forEach(timeupdate);
                    });

                    it('should not callback', function() {
                        expect(cb).not.toHaveBeenCalled();
                    });
                });

                describe('when the video has not been played 25%', function() {
                    beforeEach(function() {
                        [0, 1, 2, 4, 7.3, 24.4].forEach(timeupdate);
                    });

                    it('should not call the callback', function() {
                        expect(cb).not.toHaveBeenCalled();
                    });
                });

                describe('when the video has been played at least 25%', function() {
                    beforeEach(function() {
                        [24.5, 26, 27].forEach(timeupdate);
                    });

                    it('should track a single video event for the first quartile', function() {
                        expect(cb).toHaveBeenCalledWith(1);
                        expect(cb.calls.count()).toBe(1);
                    });
                });

                describe('when the video has been played at least 50%', function() {
                    beforeEach(function() {
                        [49.7, 51, 54, 56].forEach(timeupdate);
                    });

                    it('should track a single video event for the second quartile', function() {
                        expect(cb).toHaveBeenCalledWith(2);
                        expect(cb.calls.count()).toBe(1);
                    });
                });

                describe('when the video has been played at least 75%', function() {
                    beforeEach(function() {
                        [74.7, 75, 76, 78, 83].forEach(timeupdate);
                    });

                    it('should track a single video event for the third quartile', function() {
                        expect(cb).toHaveBeenCalledWith(3);
                        expect(cb.calls.count()).toBe(1);
                    });
                });

                describe('when the video has been played at least 95%', function() {
                    beforeEach(function() {
                        [94.5, 95, 96, 101].forEach(timeupdate);
                    });

                    it('should track a single video event for the fourth quartile', function() {
                        expect(cb).toHaveBeenCalledWith(4);
                        expect(cb.calls.count()).toBe(1);
                    });
                });

                describe('if called again with the same id', function() {
                    beforeEach(function() {
                        var second = 0;

                        for ( ; second < 100; second++) {
                            timeupdate(second);
                        }

                        expect(cb.calls.count()).toBe(4);
                        cb = jasmine.createSpy('cb()');

                        VideoTrackerService.trackQuartiles(id, player, cb);

                        for (second = 0; second < 100; second++) {
                            timeupdate(second);
                        }
                    });

                    it('should not call the callback again', function() {
                        expect(cb).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
