define(['services'], function(servicesModule) {
    'use strict';

    describe('EventService', function() {
        var $rootScope,
            c6EventEmitter,
            EventService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6EventEmitter = $injector.get('c6EventEmitter');
                EventService = $injector.get('EventService');
            });
        });

        it('should exist', function() {
            expect(EventService).toBeDefined();
        });

        describe('@public', function() {
            describe('methods', function() {
                describe('trackEvents(emitter, events)', function() {
                    var emitter;

                    beforeEach(function() {
                        emitter = c6EventEmitter({});

                        spyOn(emitter, 'on').andCallThrough();
                    });

                    it('should attach a listener for every event', function() {
                        EventService.trackEvents(emitter, ['hello', 'okay']);

                        expect(emitter.on).toHaveBeenCalledWith('hello', jasmine.any(Function));
                        expect(emitter.on).toHaveBeenCalledWith('okay', jasmine.any(Function));
                    });

                    it('should increment the emitCount when events are emitted', function() {
                        var tracker = EventService.trackEvents(emitter, ['test', 'foo']);

                        emitter.emit('test');
                        expect(tracker.test.emitCount).toBe(1);

                        emitter.emit('foo');
                        expect(tracker.foo.emitCount).toBe(1);

                        emitter.emit('test');
                        emitter.emit('test');
                        expect(tracker.test.emitCount).toBe(3);

                        emitter.emit('foo');
                        expect(tracker.foo.emitCount).toBe(2);
                    });

                    describe('the returned value', function() {
                        var result;

                        beforeEach(function() {
                            result = EventService.trackEvents(emitter, [
                                'test',
                                'foo',
                                'okay'
                            ]);
                        });

                        it('should be an object', function() {
                            expect(result).toEqual(jasmine.any(Object));
                        });

                        it('should have an object for every event', function() {
                            expect(result.test).toEqual(jasmine.any(Object));
                            expect(result.foo).toEqual(jasmine.any(Object));
                            expect(result.okay).toEqual(jasmine.any(Object));
                        });

                        it('should give each event object an emitCount property of 0', function() {
                            expect(result.test.emitCount).toBe(0);
                            expect(result.foo.emitCount).toBe(0);
                            expect(result.okay.emitCount).toBe(0);
                        });
                    });
                });
            });
        });
    });
});
