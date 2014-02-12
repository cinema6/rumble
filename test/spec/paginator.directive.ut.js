(function() {
    'use strict';

    define(['paginator'], function() {
        describe('<mr-paginator>', function() {
            var $rootScope,
                $scope,
                $compile;

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });
            });

            describe('attributes', function() {
                describe('length', function() {
                    var paginator$;

                    beforeEach(function() {
                        $scope.length = 5;

                        $scope.$apply(function() {
                            paginator$ = $compile('<mr-paginator length="length"></mr-paginator>')($scope);
                        });
                    });

                    it('should have a "span" for every item', function() {
                        expect(paginator$.find('span').length).toBe(5);
                    });
                });

                describe('current', function() {
                    var paginator$;

                    beforeEach(function() {
                        $scope.length = 4;
                        $scope.current = -1;

                        $scope.$apply(function() {
                            paginator$ = $compile('<mr-paginator length="length" current="current"></mr-paginator>')($scope);
                        });
                    });

                    it('should add the "ui-icon__page--active" class to the corrent span', function() {
                        function assertHasClass(targetIndex) {
                            angular.forEach(paginator$.find('span'), function(span, index) {
                                var hasClass = $(span).hasClass('ui-icon__page--active'),
                                    shouldBeMe = (targetIndex === index);

                                expect(hasClass).toBe(shouldBeMe);
                            });
                        }

                        expect(paginator$.find('span.ui-icon__page--active').length).toBe(0);

                        $scope.$apply(function() {
                            $scope.current = 0;
                        });
                        assertHasClass(0);

                        $scope.$apply(function() {
                            $scope.current = 2;
                        });
                        assertHasClass(2);

                        $scope.$apply(function() {
                            $scope.current = 3;
                        });
                        assertHasClass(3);
                    });
                });
            });
        });
    });
}());
