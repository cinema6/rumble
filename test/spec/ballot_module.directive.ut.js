(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('<ballot-module>', function() {
            var $rootScope,
                $scope,
                $compile;

            var $animate;

            beforeEach(function() {
                module('c6.rumble', function($provide) {
                    $provide.value('rumbleVotes', {

                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $animate = $injector.get('$animate');

                    spyOn($animate, 'addClass');
                    spyOn($animate, 'removeClass');

                    $scope = $rootScope.$new();
                });
            });

            describe('$watchers', function() {
                describe('active', function() {
                    var ballot$;

                    beforeEach(function() {
                        $scope.active = false;
                        $scope.$apply(function() {
                            ballot$ = $compile('<ballot-module active="active"></ballot-module>')($scope);
                        });
                    });

                    describe('when it is not active', function() {
                        it('should add the "ng-hide" class', function() {
                            expect($animate.addClass).toHaveBeenCalledWith(jasmine.any(Object), 'ng-hide');
                            expect($animate.addClass.mostRecentCall.args[0][0]).toBe(ballot$[0]);
                        });
                    });

                    describe('when it is active', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should remove the "ng-hide" class', function() {
                            expect($animate.removeClass).toHaveBeenCalledWith(jasmine.any(Object), 'ng-hide');
                            expect($animate.removeClass.mostRecentCall.args[0][0]).toBe(ballot$[0]);
                        });
                    });
                });
            });
        });
    });
}());
