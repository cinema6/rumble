(function() {
    'use strict';

    define(['app'], function() {
        describe('myFrame$', function() {
            var myFrame$,
                $window;

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    myFrame$ = $injector.get('myFrame$');

                    $window = $injector.get('$window');
                });

                $window.frameElement = {};
            });

            it('should be the frame element of the $window wrapped in jqLite', function() {
                expect(myFrame$[0]).toBe($window.frameElement);
            });
        });
    });
}());
