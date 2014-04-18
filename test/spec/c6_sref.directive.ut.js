(function() {
    'use strict';

    define(['c6_state'], function() {
        describe('c6-sref=""', function() {
            var $rootScope,
                $scope,
                $compile,
                c6State;

            var $sref;

            beforeEach(function() {
                module('c6.state');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                });

                spyOn(c6State, 'goTo')
                    .and.callFake(function() {
                        expect(function() {
                            $rootScope.$digest();
                        }).toThrow();
                    });

                $scope.state = 'home';
                $scope.$apply(function() {
                    $sref = $compile('<a c6-sref="{{state}}" params="params">Click Me</a>')($scope);
                });
            });

            it('should call goTo with the given state and params when clicked', function() {
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('home', undefined);

                $scope.$apply(function() {
                    $scope.state = 'home.users';
                });
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('home.users', undefined);

                $scope.$apply(function() {
                    $scope.params = { id: 'foo' };
                });
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('home.users', $scope.params);
            });

            it('should give anchor tags an empty href property', function() {
                expect($sref.attr('href')).toBe('');
            });

            it('should not give non-anchor tags an href property', function() {
                $scope.$apply(function() {
                    $sref = $compile('<button c6-sref="{{state}}">Button</button>')($scope);
                });
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('home', undefined);

                expect($sref.attr('href')).toBeUndefined();
            });
        });
    });
}());
