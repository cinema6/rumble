(function() {
    'use strict';

    define(['services'], function() {
        describe('ControlsService', function() {
            var c6EventEmitter,
                $timeout,
                ControlsService,
                _private;

            function Iface() {
                this.duration = NaN;
                this.currentTime = 0;
                this.paused = true;

                this.play = jasmine.createSpy('iface.play()');
                this.pause = jasmine.createSpy('iface.pause()');

                c6EventEmitter(this);
                spyOn(this, 'on').andCallThrough();
                spyOn(this, 'removeListener').andCallThrough();
                spyOn(this, 'once').andCallThrough();
            }

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    $timeout = $injector.get('$timeout');

                    ControlsService = $injector.get('ControlsService');
                    _private = ControlsService._private;
                });
            });

            it('should exist', function() {
                expect(ControlsService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('init()', function() {
                        it('should return an interface object', function() {
                            var noop = angular.noop;

                            expect(ControlsService.init()).toEqual({
                                controller: {
                                    play: noop,
                                    pause: noop,
                                    progress: noop,
                                    volumeChange: noop,
                                    muteChange: noop,
                                    buffer: noop,
                                    repositionNodes: noop,
                                    setButtonDisabled: noop,
                                    ready: false
                                },
                                delegate: {
                                    play: jasmine.any(Function),
                                    pause: jasmine.any(Function),
                                    seek: jasmine.any(Function),
                                    seekStart: jasmine.any(Function),
                                    seekStop: jasmine.any(Function)
                                },
                                enabled: true
                            });
                        });
                    });

                    describe('bindTo(iface)', function() {
                        var iface,
                            interfaceObj,
                            controller;

                        beforeEach(function() {
                            iface = new Iface();

                            interfaceObj = ControlsService.init();
                            controller = interfaceObj.controller;

                            for (var method in controller) {
                                spyOn(controller, method);
                            }

                            ControlsService.bindTo(iface);
                        });

                        it('should make the provided object the target', function() {
                            expect(_private.target).toBe(iface);
                        });

                        it('should reset the controls', function() {
                            expect(_private.iface.controller.progress).toHaveBeenCalledWith(0);
                            expect(_private.iface.controller.pause).toHaveBeenCalled();
                        });

                        it('should listen for video events on the target', function() {
                            ['play', 'pause', 'timeupdate'].forEach(function(event) {
                                expect(iface.on).toHaveBeenCalledWith(event, jasmine.any(Function));
                            });
                        });

                        it('should remove events from the old target if there is one', function() {
                            var target1 = new Iface(),
                                target2 = new Iface();

                            function callForEvent(calls, event) {
                                return calls.filter(function(call) {
                                    return call.args[0] === event;
                                })[0];
                            }

                            ControlsService.bindTo(target1);
                            ControlsService.bindTo(target2);

                            expect(target1.removeListener).toHaveBeenCalledWith('play', callForEvent(target1.on.calls, 'play').args[1]);
                            expect(target1.removeListener).toHaveBeenCalledWith('pause', callForEvent(target1.on.calls, 'pause').args[1]);
                            expect(target1.removeListener).toHaveBeenCalledWith('timeupdate', callForEvent(target1.on.calls, 'timeupdate').args[1]);

                            expect(target2.removeListener).not.toHaveBeenCalled();
                        });

                        describe('when events are emitted', function() {
                            describe('when "play" is emitted', function() {
                                beforeEach(function() {
                                    iface.emit('play', iface);
                                });

                                it('should call "play" on the controller', function() {
                                    expect(controller.play).toHaveBeenCalled();
                                });
                            });

                            describe('when "pause" is emitted', function() {
                                beforeEach(function() {
                                    iface.emit('pause');
                                });

                                it('should call "pause" on the controller', function() {
                                    expect(controller.pause).toHaveBeenCalled();
                                });
                            });

                            describe('when "timeupdate" is emitted', function() {
                                describe('if the duration is NaN', function() {
                                    it('should do nothing', function() {
                                        iface.emit('timeupdate', iface);

                                        expect(controller.progress).not.toHaveBeenCalledWith(NaN);
                                    });
                                });

                                describe('if there is a duration', function() {
                                    beforeEach(function() {
                                        iface.duration = 60;
                                    });

                                    it('should call progress with the percentage of the video completed', function() {
                                        function timeupdate(time) {
                                            iface.currentTime = time;
                                            iface.emit('timeupdate', iface);
                                        }

                                        timeupdate(0);
                                        expect(controller.progress).toHaveBeenCalledWith(0);

                                        timeupdate(15);
                                        expect(controller.progress).toHaveBeenCalledWith(25);

                                        timeupdate(30);
                                        expect(controller.progress).toHaveBeenCalledWith(50);

                                        timeupdate(45);
                                        expect(controller.progress).toHaveBeenCalledWith(75);

                                        timeupdate(60);
                                        expect(controller.progress).toHaveBeenCalledWith(100);
                                    });
                                });
                            });
                        });

                        describe('when delegate functions are called', function() {
                            var delegate;

                            beforeEach(function() {
                                delegate = _private.iface.delegate;
                            });

                            describe('play()', function() {
                                beforeEach(function() {
                                    delegate.play();
                                });

                                it('should call play on the target', function() {
                                    expect(_private.target.play).toHaveBeenCalled();
                                });
                            });

                            describe('pause()', function() {
                                beforeEach(function() {
                                    delegate.pause();
                                });

                                it('should call pause on the target', function() {
                                    expect(_private.target.pause).toHaveBeenCalled();
                                });
                            });

                            describe('seekStart()', function() {
                                beforeEach(function() {
                                    delegate.seekStart({
                                        percent: 0
                                    });
                                });

                                it('should pause the target', function() {
                                    expect(_private.target.pause).toHaveBeenCalled();
                                });
                            });

                            describe('seek()', function() {
                                beforeEach(function() {
                                    delegate.seekStart({
                                        percent: 0
                                    });
                                });

                                it('should call "progress" on the controller in a $timeout with the percent', function() {
                                    function seek(percent) {
                                        delegate.seek({
                                            percent: percent
                                        });
                                        $timeout.flush();
                                    }

                                    seek(10);
                                    expect(controller.progress).toHaveBeenCalledWith(10);

                                    seek(25);
                                    expect(controller.progress).toHaveBeenCalledWith(25);

                                    seek(40);
                                    expect(controller.progress).toHaveBeenCalledWith(40);
                                });
                            });

                            describe('seekStop', function() {
                                beforeEach(function() {
                                    _private.target.duration = 60;
                                });

                                describe('if the video was playing', function() {
                                    beforeEach(function() {
                                        _private.target.paused = false;

                                        delegate.seekStart({
                                            percent: 0
                                        });
                                        delegate.seek({
                                            percent: 50
                                        });
                                    });

                                    it('should seek to the correct time and play the video', function() {
                                        delegate.seekStop({
                                            percent: 50
                                        });
                                        expect(_private.target.currentTime).toBe(30);
                                        expect(_private.target.play).toHaveBeenCalled();
                                    });
                                });

                                describe('if the video was paused', function() {
                                    beforeEach(function() {
                                        delegate.seekStart({
                                            percent: 0
                                        });
                                        delegate.seek({
                                            percent: 25
                                        });
                                    });

                                    it('should seek to the correct time and nothing else', function() {
                                        delegate.seekStop({
                                            percent: 25
                                        });
                                        expect(_private.target.currentTime).toBe(15);
                                        expect(_private.target.play).not.toHaveBeenCalled();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            describe('@private', function() {
                describe('properties', function() {
                    describe('target', function() {
                        it('should be null', function() {
                            expect(_private.target).toBeNull();
                        });
                    });
                });
            });
        });
    });
}());
