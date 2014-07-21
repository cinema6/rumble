define(['app', 'c6ui', 'angular'], function(appModule, c6uiModule, angular) {
    'use strict';

    describe('timestampFilter', function() {
        var timestampFilter;

        var $window,
            currentTime = 1391005994000;

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.factory('$window', function() {
                    var $window = {};

                    function MockDate(arg1) {
                        if (arguments.length > 0) {
                            return new angular.mock.TzDate(-19, arg1);
                        }

                        return new angular.mock.TzDate(-19, currentTime);
                    }
                    MockDate.now = function() {
                        return currentTime;
                    };

                    $window.Date = MockDate;

                    return $window;
                });
            });

            module(c6uiModule.name, function($provide) {
                $provide.value('cinema6', {});
            });

            module(appModule.name);

            inject(function($injector) {
                timestampFilter = $injector.get('timestampFilter');

                $window = $injector.get('$window');
            });
        });

        it('should exist', function() {
            expect(timestampFilter).toEqual(jasmine.any(Function));
        });

        describe('when the date is today', function() {
            it('should return the time', function() {
                expect(timestampFilter(1390980533)).toBe('2:28 am');

                expect(timestampFilter(1391037353)).toBe('6:15 pm');
            });
        });

        describe('when the date is not today', function() {
            it('should return how many since today', function() {
                expect(timestampFilter(1390919534)).toBe('1 day ago');

                expect(timestampFilter(1390962734)).toBe('1 day ago');

                expect(timestampFilter(1390854734)).toBe('2 days ago');

                expect(timestampFilter(1390761134)).toBe('3 days ago');
            });
        });
    });
});
