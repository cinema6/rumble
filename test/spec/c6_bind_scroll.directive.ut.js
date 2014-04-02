(function() {
    'use strict';

    define(['card_table'], function() {
        describe('c6-bind-scroll=""', function() {
            var $rootScope,
                $scope,
                $compile;

            var $scroller;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });

                $scope.scroll = {
                    x: 0,
                    y: 0
                };

                $scope.$apply(function() {
                    $scroller = $compile([
                        '<div style="width: 25px; height: 25px; overflow: scroll;" c6-bind-scroll="scroll">',
                        '    <div style="width: 100px; height: 100px;">&nbsp;</div>',
                        '</div>'
                    ].join('\n'))($scope);
                });
                $('body').append($scroller);
            });

            it('should bind from the data to the element', function() {
                expect($scroller.scrollLeft()).toBe(0);
                expect($scroller.scrollTop()).toBe(0);

                $scope.$apply(function() {
                    $scope.scroll.x = 10;
                    $scope.scroll.y = 25;
                });

                expect($scroller.scrollLeft()).toBe(10);
                expect($scroller.scrollTop()).toBe(25);

                $scope.$apply(function() {
                    $scope.scroll.x = 37;
                    $scope.scroll.y = 64;
                });

                expect($scroller.scrollLeft()).toBe(37);
                expect($scroller.scrollTop()).toBe(64);
            });

            it('should bind from the element to the data', function() {
                $scroller.scrollLeft(25);
                $scroller.trigger('scroll');
                expect($scope.scroll.x).toBe(25);

                $scroller.scrollTop(50);
                $scroller.trigger('scroll');
                expect($scope.scroll.y).toBe(50);

                $scroller.scrollLeft(44);
                $scroller.trigger('scroll');
                expect($scope.scroll.x).toBe(44);

                $scroller.scrollTop(63);
                $scroller.trigger('scroll');
                expect($scope.scroll.y).toBe(63);
            });

            it('should not allow the data to move further than the scroll position', function() {
                $scope.$apply(function() {
                    $scope.scroll.x = -10;
                });
                expect($scope.scroll.x).toBe(0);

                $scope.$apply(function() {
                    $scope.scroll.x = 100;
                });
                expect($scope.scroll.x).toBe(75);

                $scope.$apply(function() {
                    $scope.scroll.y = -25;
                });
                expect($scope.scroll.y).toBe(0);

                $scope.$apply(function() {
                    $scope.scroll.y = 200;
                });
                expect($scope.scroll.y).toBe(75);
            });

            afterEach(function() {
                $scroller.remove();
            });
        });
    });
}());
