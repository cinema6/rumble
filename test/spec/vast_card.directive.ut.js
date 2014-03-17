(function() {
    'use strict';

    define(['vast_card'], function() {
        describe('<vast-card></vast-card>', function() {
            var $rootScope,
                $scope,
                $compile,
                $timeout,
                $log;

            function C6Video() {
                var self = this,
                    eventHandlers = {};

                this.player = {
                    play: jasmine.createSpy('player.play()'),
                    pause: jasmine.createSpy('player.pause()'),
                    load: jasmine.createSpy('player.load()'),
                    currentTime: 0,
                    ended: false,
                    duration: NaN,
                    paused: true
                };

                this.fullscreen = jasmine.createSpy('c6Video.fullscreen()');

                this.bufferedPercent = jasmine.createSpy('c6Video.bufferedPercent()')
                    .andReturn(0);

                this.on = jasmine.createSpy('c6Video.on()')
                    .andCallFake(function(event, handler) {
                        var handlers = eventHandlers[event] = (eventHandlers[event] || []);

                        handlers.push(handler);

                        return self;
                    });

                this.off = jasmine.createSpy('c6Video.off()')
                    .andCallFake(function(event, handler) {
                        var handlers = (eventHandlers[event] || []);

                        handlers.splice(handlers.indexOf(handler), 1);
                    });

                this.trigger = function(event) {
                    var handlers = (eventHandlers[event] || []);

                    $rootScope.$apply(function() {
                        handlers.forEach(function(handler) {
                            handler({ target: self.player }, self);
                        });
                    });
                };
            }

            beforeEach(function() {
                module('c6.ui', function($provide) {
                    $provide.factory('c6VideoDirective', function() {
                        return {};
                    });
                });

                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', {
                        mode: 'mobile'
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $timeout = $injector.get('$timeout');
                    $log = $injector.get('$log');

                    $rootScope.config = {
                        data: {
                            src: 'foo.mp4'
                        }
                    };

                    $scope = $rootScope.$new();
                    $log.context = function() { return $log; };
                });
            });

            describe('initialization', function() {
                beforeEach(function() {
                    spyOn($scope, '$emit').andCallThrough();

                    $scope.$apply(function() {
                        $compile('<vast-card></vast-card>')($scope);
                    });
                });

                it('should $emit the "playerAdd" event', function() {
                    expect($scope.$emit).toHaveBeenCalledWith('playerAdd', jasmine.any(Object));
                });
            });

            describe('when "c6video-ready" is $emitted', function() {
                var iface;

                beforeEach(function() {
                    $scope.$on('playerAdd', function(event, playerInterface) {
                        iface = playerInterface;
                    });

                    $scope.$apply(function() {
                        $compile('<vast-card></vast-card>')($scope);
                    });

                    spyOn(iface, 'emit').andCallThrough();

                    expect(iface.isReady()).not.toBe(true);
                    expect(iface.emit).not.toHaveBeenCalled();

                    $scope.$emit('c6video-ready', new C6Video());
                });

                it('should set iface.ready to true', function() {
                    expect(iface.isReady()).toBe(true);
                });

                it('should emit the "ready" event on the iface in a timeout', function() {
                    $timeout.flush();

                    expect(iface.emit).toHaveBeenCalledWith('ready', iface);
                });
            });

            describe('playerInterface', function() {
                var iface;

                beforeEach(function() {
                    $scope.$on('playerAdd', function(event, playerInterface) {
                        iface = playerInterface;
                    });

                    $scope.$apply(function() {
                        $compile('<vast-card></vast-card>')($scope);
                    });
                });

                describe('properties', function() {
                    describe('currentTime', function() {
                        describe('getting', function() {
                            describe('if the player is not ready', function() {
                                it('should be 0', function() {
                                    expect(iface.currentTime).toBe(0);
                                });
                            });

                            describe('if the player is ready', function() {
                                var c6Video;

                                beforeEach(function() {
                                    c6Video = new C6Video();

                                    $scope.$emit('c6video-ready', c6Video);
                                });

                                it('should proxy to the player\'s currentTime', function() {
                                    c6Video.player.currentTime = 10;
                                    expect(iface.currentTime).toBe(10);

                                    c6Video.player.currentTime = 20;
                                    expect(iface.currentTime).toBe(20);

                                    c6Video.player.currentTime = 30;
                                    expect(iface.currentTime).toBe(30);
                                });
                            });
                        });

                        describe('setting', function() {
                            describe('if the player is not ready', function() {
                                it('should do nothing', function() {
                                    expect(function() {
                                        iface.currentTime = 10;
                                    }).not.toThrow();
                                });
                            });

                            describe('if the player is ready', function() {
                                var c6Video;

                                beforeEach(function() {
                                    c6Video = new C6Video();

                                    $scope.$emit('c6video-ready', c6Video);
                                });

                                it('should proxy to the player\'s currentTime', function() {
                                    iface.currentTime = 10;
                                    expect(c6Video.player.currentTime).toBe(10);

                                    iface.currentTime = 20;
                                    expect(c6Video.player.currentTime).toBe(20);

                                    iface.currentTime = 30;
                                    expect(c6Video.player.currentTime).toBe(30);
                                });
                            });
                        });
                    });

                    describe('paused property', function() {
                        describe('getting', function() {
                            describe('if the player is not ready', function() {
                                it('should be true', function() {
                                    expect(iface.paused).toBe(true);
                                });
                            });

                            describe('if the player is ready', function() {
                                var c6Video;

                                beforeEach(function() {
                                    c6Video = new C6Video();

                                    $scope.$emit('c6video-ready', c6Video);
                                });

                                it('should proxy to the video player\'s property', function() {
                                    expect(iface.paused).toBe(true);

                                    c6Video.player.paused = false;
                                    expect(iface.paused).toBe(false);

                                    c6Video.player.paused = true;
                                    expect(iface.paused).toBe(true);
                                });
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically settable', function() {
                                expect(function() {
                                    iface.paused = false;
                                }).toThrow();
                            });
                        });
                    });

                    describe('duration', function() {
                        describe('getting', function() {
                            describe('if the player is not ready', function() {
                                it('should be NaN', function() {
                                    expect(iface.duration).toBeNaN();
                                });
                            });

                            describe('if the player is ready', function() {
                                var c6Video;

                                beforeEach(function() {
                                    c6Video = new C6Video();

                                    $scope.$emit('c6video-ready', c6Video);
                                });

                                it('should proxy to the player\'s duration', function() {
                                    expect(iface.duration).toBeNaN();

                                    c6Video.player.duration = 45;
                                    expect(iface.duration).toBe(45);

                                    c6Video.player.duration = 30;
                                    expect(iface.duration).toBe(30);
                                });
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically settable', function() {
                                expect(function() {
                                    iface.duration = 20;
                                }).toThrow();
                            });
                        });
                    });

                    describe('ended', function() {
                        describe('getting', function() {
                            describe('before the player is ready', function() {
                                it('should be false', function() {
                                    expect(iface.ended).toBe(false);
                                });
                            });

                            describe('if the player is ready', function() {
                                var c6Video;

                                beforeEach(function() {
                                    c6Video = new C6Video();

                                    $scope.$emit('c6video-ready', c6Video);
                                });

                                it('should proxy to the player\'s ended property', function() {
                                    expect(iface.ended).toBe(false);

                                    c6Video.player.ended = true;
                                    expect(iface.ended).toBe(true);
                                });
                            });
                        });

                        describe('setting', function() {
                            it('should not be settable', function() {
                                expect(function() {
                                    iface.ended = true;
                                }).toThrow();
                            });
                        });
                    });

                    describe('twerked', function() {
                        describe('getting', function() {
                            it('should be false', function() {
                                expect(iface.twerked).toBe(false);
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically settable', function() {
                                expect(function() {
                                    iface.twerked = true;
                                }).toThrow();
                            });
                        });
                    });
                });

                describe('methods', function() {
                    describe('getType()', function() {
                        it('should return "video"', function() {
                            expect(iface.getType()).toBe('vast');
                        });
                    });

                    describe('getVideoId()', function() {
                        it('should be undefined', function() {
                            expect(iface.getVideoId()).toBeUndefined();
                        });
                    });

                    describe('isReady()', function() {
                        describe('before getting the c6Video', function() {
                            it('should be false', function() {
                                expect(iface.isReady()).toBe(false);
                            });
                        });

                        describe('after getting the c6Video', function() {
                            beforeEach(function() {
                                $scope.$emit('c6video-ready', new C6Video());
                            });

                            it('should be true', function() {
                                expect(iface.isReady()).toBe(true);
                            });
                        });
                    });

                    describe('play()', function() {
                        describe('before getting the c6Video', function() {
                            it('should do nothing', function() {
                                expect(function() {
                                    iface.play();
                                }).not.toThrow();
                            });
                        });

                        describe('after getting the c6Video', function() {
                            var c6Video;

                            beforeEach(function() {
                                c6Video = new C6Video();

                                $scope.$emit('c6video-ready', c6Video);
                            });

                            it('should play the video player', function() {
                                iface.play();

                                expect(c6Video.player.play).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('pause()', function() {
                        describe('before getting the c6Video', function() {
                            it('should do nothing', function() {
                                expect(function() {
                                    iface.pause();
                                }).not.toThrow();
                            });
                        });

                        describe('after getting the c6Video', function() {
                            var c6Video;

                            beforeEach(function() {
                                c6Video = new C6Video();

                                $scope.$emit('c6video-ready', c6Video);
                            });

                            it('should play the video player', function() {
                                iface.pause();

                                expect(c6Video.player.pause).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('twerk()', function() {
                        var success,
                            failure;

                        beforeEach(function() {
                            success = jasmine.createSpy('promise success');
                            failure = jasmine.createSpy('promise failure');
                        });

                        it('should return a promise', function() {
                            expect(iface.twerk().then).toEqual(jasmine.any(Function));
                        });

                        describe('before getting the c6Video', function() {
                            it('should reject the promise', function() {
                                $scope.$apply(function() {
                                    iface.twerk().catch(failure);
                                });

                                expect(failure).toHaveBeenCalledWith('Cannot twerk because the video is not ready.');
                            });
                        });

                        describe('after getting the c6Video', function() {
                            var c6Video;

                            beforeEach(function() {
                                c6Video = new C6Video();

                                $scope.$emit('c6video-ready', c6Video);
                                $timeout.flush();
                            });

                            describe('if 0 is passed in', function() {
                                beforeEach(function() {
                                    iface.twerk(0);
                                });

                                it('should not set a $timeout', function() {
                                    expect(function() {
                                        $timeout.flush();
                                    }).toThrow();
                                });
                            });

                            describe('if no value is passed in', function() {
                                beforeEach(function() {
                                    iface.twerk();
                                });

                                it('should set a $timeout', function() {
                                    expect(function() {
                                        $timeout.flush();
                                    }).not.toThrow();
                                });
                            });

                            describe('if a value is passed in', function() {
                                beforeEach(function() {
                                    iface.twerk(500);
                                });

                                it('should set a $timeout', function() {
                                    expect(function() {
                                        $timeout.flush();
                                    }).not.toThrow();
                                });
                            });

                            it('should call "load" on the player', function() {
                                iface.twerk();

                                expect(c6Video.player.load).toHaveBeenCalled();
                            });

                            it('should resolve the promise if bufferedPercent is 1', function() {
                                c6Video.bufferedPercent.andReturn(1);
                                spyOn($timeout, 'cancel').andCallThrough();

                                $scope.$apply(function() {
                                    iface.twerk().then(success);
                                });

                                expect(success).toHaveBeenCalledWith(iface);
                                expect($timeout.cancel).toHaveBeenCalledWith(jasmine.any(Object));
                                expect(c6Video.off).toHaveBeenCalledWith('progress', c6Video.on.mostRecentCall.args[1]);
                            });

                            it('should listen for the "progress" event', function() {
                                iface.twerk();

                                expect(c6Video.on).toHaveBeenCalledWith('progress', jasmine.any(Function));
                            });

                            describe('when "progress" is emitted', function() {
                                beforeEach(function() {
                                    spyOn($timeout, 'cancel').andCallThrough();

                                    iface.twerk().then(success);

                                    c6Video.trigger('progress');
                                });

                                it('should resolve the promise', function() {
                                    expect(success).toHaveBeenCalledWith(iface);
                                });

                                it('should cancel the $timeout', function() {
                                    expect($timeout.cancel).toHaveBeenCalledWith(jasmine.any(Object));
                                });

                                it('should not cancel the timeout if one was never set', function() {
                                    iface.twerk(0);
                                    c6Video.trigger('progress');

                                    expect($timeout.cancel.callCount).toBe(1);
                                });

                                it('should stop listening for "progress"', function() {
                                    expect(c6Video.off).toHaveBeenCalledWith('progress', c6Video.on.mostRecentCall.args[1]);
                                });
                            });

                            describe('if the $timeout goes off', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        iface.twerk().catch(failure);
                                    });

                                    $timeout.flush();
                                });

                                it('should remove the "progress" listener', function() {
                                    expect(c6Video.off).toHaveBeenCalledWith('progress', c6Video.on.mostRecentCall.args[1]);
                                });

                                it('should reject the promise', function() {
                                    expect(failure).toHaveBeenCalledWith('Twerk timed out after 1000ms.');
                                });
                            });

                            describe('if twerking succeeds', function() {
                                beforeEach(function() {
                                    iface.twerk();
                                    c6Video.trigger('progress');
                                });

                                it('should set "twerked" to true', function() {
                                    expect(iface.twerked).toBe(true);
                                });
                            });

                            describe('twerking twice', function() {
                                var onCallCount;

                                beforeEach(function() {
                                    iface.twerk();
                                    c6Video.trigger('progress');

                                    onCallCount = c6Video.on.callCount;

                                    $scope.$apply(function() {
                                        iface.twerk().catch(failure);
                                    });
                                });

                                it('should reject the promise', function() {
                                    expect(failure).toHaveBeenCalledWith('Video has already been twerked.');

                                    expect(c6Video.player.load.callCount).toBe(1);
                                    expect(c6Video.on.callCount).toBe(onCallCount);
                                    expect(function() {
                                        $timeout.flush();
                                    }).toThrow();
                                });
                            });
                        });
                    });
                });

                describe('events', function() {
                    var c6Video;

                    beforeEach(function() {
                        spyOn(iface, 'emit').andCallThrough();

                        c6Video = new C6Video();

                        $scope.$emit('c6video-ready', c6Video);
                    });

                    describe('play', function() {
                        it('should emit "play" when the video emits "play"', function() {
                            c6Video.trigger('play');

                            expect(iface.emit).toHaveBeenCalledWith('play', iface);
                        });
                    });

                    describe('pause', function() {
                        it('should emit "pause" when the video emits "pause"', function() {
                            c6Video.trigger('pause');

                            expect(iface.emit).toHaveBeenCalledWith('pause', iface);
                        });
                    });

                    describe('ended', function() {
                        beforeEach(function() {
                            c6Video.trigger('ended');
                        });

                        it('should emit "ended" when the video emits "ended"', function() {
                            expect(iface.emit).toHaveBeenCalledWith('ended', iface);
                        });

                        it('should un-fullscreen the player when the video is done', function() {
                            expect(c6Video.fullscreen).toHaveBeenCalledWith(false);
                        });
                    });

                    describe('timeupdate', function() {
                        it('should emit "timeupdate" when the video emits "timeupdate"', function() {
                            var calls;

                            c6Video.trigger('timeupdate');
                            expect(iface.emit).toHaveBeenCalledWith('timeupdate', iface);

                            calls = iface.emit.callCount;

                            c6Video.trigger('timeupdate');
                            expect(iface.emit.callCount).toBe(calls + 1);

                            c6Video.trigger('timeupdate');
                            expect(iface.emit.callCount).toBe(calls + 2);
                        });
                    });
                });
            });
        });
    });
}());
