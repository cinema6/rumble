(function() {
    'use strict';

    define(['services'], function() {
        describe('AdTechService', function() {
            var $rootScope,
                $window,
                $q,
                AdTechService;

            beforeEach(function() {
                module('c6.rumble.services', function($provide) {
                    $provide.value('$window', {
                        location: {
                            hostname: 'localhost'
                        },
                        parent: {
                            location: {
                                hostname: 'test.com'
                            }
                        }
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $window = $injector.get('$window');
                    $window.ADTECH = {
                        loadAd: jasmine.createSpy('window.ADTECH.loadAd()')
                    };
                    AdTechService = $injector.get('AdTechService');
                });
            });

            describe('the service', function() {
                it('should exist', function() {
                    expect(AdTechService).toEqual(jasmine.any(Object));
                });
            });

            describe('method', function() {
                describe('loadAd()', function() {
                    describe('when AdTech id is not defined', function() {
                        var adLoadPromise,
                            adLoadThenSpy;

                        beforeEach(function() {
                            adLoadThenSpy = jasmine.createSpy('adLoadThenSpy()');
                            adLoadPromise = AdTechService.loadAd({id: 'container', displayAdSource: 'waterfall'});
                            adLoadPromise.then(adLoadThenSpy);
                        });

                        it('should return a promise', function() {
                            expect(adLoadPromise.then).toBeDefined();
                        });

                        it('should first call ADTECH.loadAd() with the master placement id', function() {
                            expect($window.ADTECH.loadAd).toHaveBeenCalledWith({
                                network: '5072',
                                server: 'adserver.adtechus.com',
                                placement: 3214274,
                                adContainerId: 'adtechPlacement',
                                kv: { weburl: 'localhost' },
                                complete: jasmine.any(Function)
                            });
                        });

                        it('should only call ADTECH.loadAd() once at this point', function() {
                            expect($window.ADTECH.loadAd.calls.length).toBe(1);
                        });

                        describe('when the publisher placement is returned', function() {
                            beforeEach(function() {
                                $window.c6AdtechPlacementId = 123456;
                                $window.ADTECH.loadAd.calls[0].args[0].complete();

                                $rootScope.$digest();
                            });

                            it('should resolve the init() promise and call ADTECH.loadAd() again', function() {
                                expect($window.ADTECH.loadAd).toHaveBeenCalledWith({
                                    network: '5072',
                                    server: 'adserver.adtechus.com',
                                    placement: 123456,
                                    adContainerId: 'container',
                                    debugMode: true,
                                    kv: { mode: 'waterfall' },
                                    complete: jasmine.any(Function)
                                });

                                expect($window.ADTECH.loadAd.calls.length).toBe(2);
                            });

                            it('should resolve the loadAd() promise', function() {
                                $window.ADTECH.loadAd.mostRecentCall.args[0].complete();

                                $rootScope.$digest();

                                expect(adLoadThenSpy).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when AdTech id is defined', function() {
                        beforeEach(function() {
                            AdTechService.loadAd({id: 'container', displayAdSource: 'waterfall'});
                            $window.c6AdtechPlacementId = 123456;
                            $window.ADTECH.loadAd.calls[0].args[0].complete();
                            $rootScope.$digest();
                        });

                        it('should call ADTECH.loadAd() immediately', function() {
                            var loadAdCallCount = $window.ADTECH.loadAd.calls.length;

                            AdTechService.loadAd({id: 'container2', displayAdSource: 'waterfall2'});

                            $rootScope.$digest();

                            expect($window.ADTECH.loadAd.calls.length).toBe(loadAdCallCount + 1);

                            expect($window.ADTECH.loadAd.mostRecentCall.args[0]).toEqual({
                                network: '5072',
                                server: 'adserver.adtechus.com',
                                placement: 123456,
                                adContainerId: 'container2',
                                debugMode: true,
                                kv: { mode: 'waterfall2' },
                                complete: jasmine.any(Function)
                            });
                        });
                    });

                    describe('when there is no hostname', function() {
                        it('should get the hostname of the parent window', function() {
                            $window.location.hostname = '';
                            $window.parent.location.hostname = 'parent.com';

                            AdTechService.loadAd({id: 'container', displayAdSource: 'waterfall'});

                            expect($window.ADTECH.loadAd).toHaveBeenCalledWith({
                                network: '5072',
                                server: 'adserver.adtechus.com',
                                placement: 3214274,
                                adContainerId: 'adtechPlacement',
                                kv: { weburl: 'parent' },
                                complete: jasmine.any(Function)
                            });
                        });
                    });
                });
            });
        });
    });
}());