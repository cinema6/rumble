define(['../mocks/require.mock.js', 'jquery'], function(mockRequire, $) {
    'use strict';

    describe('speed requirejs plugin', function() {
        var speed;

        var RealDate;

        beforeEach(function(done) {
            RealDate = window.Date;

            window.Date = function() {

            };
            window.Date.prototype = {
                getTime: jasmine.createSpy('Date.getTime()')
                    .and.callFake(function() {
                        var date = new RealDate();

                        return date.getTime.apply(date, arguments);
                    })
            };
            window.Date.now = jasmine.createSpy('Date.now()')
                .and.returnValue(RealDate.now());

            require(['speed'], function(_speed) {
                speed = _speed;
                done();
            });
        });

        afterEach(function() {
            window.Date = RealDate;
            requirejs.undef('speed');
        });

        it('should exist', function() {
            expect(speed).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('results', function() {
                it('should be an array', function() {
                    expect(speed.results).toEqual([]);
                });
            });
        });

        describe('methods', function() {
            describe('load(name, require, onload, config)', function() {
                var onload, config,
                    startTime;

                beforeEach(function() {
                    onload = jasmine.createSpy('onload()');
                    config = {
                        config: {
                            speed: {
                                jquery: 81.6
                            }
                        }
                    };
                    mockRequire.whenLoad('jquery').provide($);

                    startTime = RealDate.now();

                    Date.now.and.returnValue(startTime);

                    speed.load('jquery', mockRequire, onload, config);
                });

                it('should load the module', function() {
                    expect(mockRequire).toHaveBeenCalledWith(['jquery'], jasmine.any(Function));
                });

                describe('when the module is loaded', function() {
                    beforeEach(function() {
                        Date.now.and.returnValue(startTime + 3000);

                        mockRequire.flush();
                    });

                    it('should call onload with the module', function() {
                        expect(onload).toHaveBeenCalledWith($);
                    });

                    it('should add a result to the results array', function() {
                        expect(speed.results).toEqual([
                            jasmine.objectContaining({
                                time: 3000,
                                size: 81.6,
                                KBs: 27.2
                            })
                        ]);
                    });
                });
            });

            describe('average()', function() {
                describe('if no tests have been run', function() {
                    it('should return null', function() {
                        expect(speed.average()).toBeNull();
                    });
                });

                describe('if there are some tests', function() {
                    beforeEach(function() {
                        speed.results.push.apply(speed.results, [
                            {
                                time: 3000,
                                size: 81.6
                            },
                            {
                                time: 2000,
                                size: 30.2
                            },
                            {
                                time: 300,
                                size: 20.3
                            }
                        ]);
                    });

                    it('should return an object that represents the average of all the test', function() {
                        expect(speed.average()).toEqual(jasmine.objectContaining({
                            time: 5300,
                            size: 132.1,
                            KBs: 24.92
                        }));
                    });
                });
            });
        });
    });
});
