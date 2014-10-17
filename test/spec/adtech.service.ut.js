define(['services', 'adtech', 'c6_defines'], function(servicesModule, adtech, c6Defines) {
    'use strict';

    describe('AdTechService', function() {
        var $window,
            AdTechService;

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
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

                $provide.value('c6AppData', {
                    experience: {
                        data: {
                            adConfig: {
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }
                        }
                    }
                });
            });

            inject(function($injector) {
                spyOn(adtech, 'loadAd');
                $window = $injector.get('$window');
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
                var adLoadPromise,
                    adLoadThenSpy;

                beforeEach(function() {
                    adLoadThenSpy = jasmine.createSpy('adLoadThenSpy()');
                    adLoadPromise = AdTechService.loadAd({id: 'container', placementId: '111111'});
                    adLoadPromise.then(adLoadThenSpy);
                });

                it('should return a promise', function() {
                    expect(adLoadPromise.then).toBeDefined();
                });

                it('should call ADTECH.loadAd()', function() {
                    expect(adtech.loadAd).toHaveBeenCalledWith({
                        secure: false,
                        network: '5473.1',
                        server: 'adserver.adtechus.com',
                        placement: 111111,
                        adContainerId: 'container',
                        debugMode: true,
                        kv: { mode: 'cinema6' },
                        complete: jasmine.any(Function)
                    });
                });

                it('should resolve the promise when complete', function() {
                    adtech.loadAd.mostRecentCall.args[0].complete();

                    expect(adLoadThenSpy).toHaveBeenCalled();
                });

                it('should use https: when detected', function() {
                    c6Defines.kProtocol = 'https:';

                    AdTechService.loadAd({id: 'container', placementId: '222222'});

                    expect(adtech.loadAd.mostRecentCall.args[0]).toEqual({
                        secure: true,
                        network: '5473.1',
                        server: 'adserver.adtechus.com',
                        placement: 222222,
                        adContainerId: 'container',
                        debugMode: true,
                        kv: { mode: 'cinema6' },
                        complete: jasmine.any(Function)
                    });

                    c6Defines.kProtocol = 'http:';
                });

                it('should set debugMode to false if not on localhost', function() {
                    $window.location.hostname = '';
                    $window.parent.location.hostname = 'parent.com';

                    AdTechService.loadAd({id: 'container', placementId: '1234567'});

                    expect(adtech.loadAd.mostRecentCall.args[0]).toEqual({
                        secure: false,
                        network: '5473.1',
                        server: 'adserver.adtechus.com',
                        placement: 1234567,
                        adContainerId: 'container',
                        debugMode: false,
                        kv: { mode: 'cinema6' },
                        complete: jasmine.any(Function)
                    });
                });
            });
        });
    });
});
