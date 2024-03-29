define(['services','angular'], function(servicesModule, angular) {
    'use strict';

    var noop = angular.noop;

    describe('compileAdTag(tag)', function() {
        var compileAdTag;

        var $window;

        var tag = 'http://u-ads.adap.tv/a/h/jSmRYUB6OAinZ1YEc6FP2eOeZCYQ_JsM?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.value('$window', {
                    parent: {
                        location: {
                            href: 'http://www.urbantimes.com/minireels/bestvideos'
                        }
                    },
                    addEventListener: noop,
                    Date: {
                        now: jasmine.createSpy('Date.now()')
                            .and.returnValue(Date.now())
                    }
                });
            });

            module(servicesModule.name);

            inject(function($injector) {
                compileAdTag = $injector.get('compileAdTag');

                $window = $injector.get('$window');
            });
        });

        it('should exist', function() {
            expect(compileAdTag).toEqual(jasmine.any(Function));
        });

        it('should compile an ad tag with the url of the page and a cachebuster', function() {
            var now = $window.Date.now();

            expect(compileAdTag(tag)).toBe('http://u-ads.adap.tv/a/h/jSmRYUB6OAinZ1YEc6FP2eOeZCYQ_JsM?cb=' + now + '&pageUrl=' + encodeURIComponent($window.parent.location.href) + '&eov=eov');
        });

        it('should handle having undefined passed in', function() {
            expect(compileAdTag()).toBe('');
        });
    });
});
