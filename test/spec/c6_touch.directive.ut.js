define(['app'], function(appModule) {
    'use strict';

    describe('c6-touch=""', function() {
        var $rootScope,
            $scope,
            $compile;

        var $link;

        beforeEach(function() {
            module(appModule.name, function($provide) {
                $provide.factory('c6AppData',function(){
                    return {
                        profile: {
                            touch: false
                        }
                    };
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
                $scope.spy = jasmine.createSpy('$scope.spy()')
                    .andCallFake(function(event) {
                        expect(event.isDefaultPrevented()).toBe(true);
                        expect(function() { $rootScope.$digest(); }).toThrow();
                    });
                $scope.atTail = false;
            });

            $scope.$apply(function() {
                $link = $compile('<a href="" c6-touch="spy($event)" ng-disabled="atTail">Foo</a>')($scope);
            });
        });

        it('should evaluate the expression when the touch ends', function() {
            $link.trigger('touchstart');
            $link.trigger('touchend');
            expect($scope.spy).toHaveBeenCalledWith(jasmine.any(Object));
        });

        it('should not evaluate the expression if the user leaves the area during the touch or cancels the touch', function() {
            $link.trigger('touchstart');
            $link.trigger('touchleave');
            $link.trigger('touchend');

            expect($scope.spy).not.toHaveBeenCalled();

            $link.trigger('touchstart');
            $link.trigger('touchcancel');
            $link.trigger('touchend');

            expect($scope.spy).not.toHaveBeenCalled();
        });

        it('should evaluate the expression if the user re-enters the area after leaving it', function() {
            $link.trigger('touchstart');
            $link.trigger('touchleave');
            $link.trigger('touchenter');
            $link.trigger('touchend');

            expect($scope.spy).toHaveBeenCalledWith(jasmine.any(Object));
        });

        it('should evaluate the expression on click if touch is not supported on the device', function() {
            $link.trigger('click');
            expect($scope.spy).toHaveBeenCalled();
        });

        it('should not evaluate the expression if button is disabled', function() {
            $scope.$apply(function() {
                $scope.atTail = true;
            });
            
            $link.trigger('touchstart');
            $link.trigger('touchend');
            expect($scope.spy).not.toHaveBeenCalled();
        });
    });
});
