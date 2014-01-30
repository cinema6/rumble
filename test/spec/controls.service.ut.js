(function() {
    'use strict';

    define(['services'], function() {
        describe('ControlsService', function() {
            var c6EventEmitter,
                ControlsService,
                _private;

            function Iface() {
                c6EventEmitter(this);
            }

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    c6EventEmitter = $injector.get('c6EventEmitter');

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
                                delegate: {},
                                enabled: true
                            });
                        });
                    });

                    describe('bindTo(iface)', function() {
                        var iface,
                            interfaceObj;

                        beforeEach(function() {
                            iface = new Iface();

                            spyOn(iface, 'on').andCallThrough();

                            interfaceObj = ControlsService.init();

                            ControlsService.bindTo(iface);
                        });

                        it('should make the provided object the target', function() {
                            expect(_private.target).toBe(iface);
                        });

                        it('should listen for video events on the target', function() {
                            ['play', 'pause', 'timeupdate'].forEach(function(event) {
                                expect(iface.on).toHaveBeenCalledWith(event, jasmine.any(Function));
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
