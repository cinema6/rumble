(function() {
    'use strict';

    define(['c6_with'], function() {
        describe('<div c6-with="">', function() {
            var $rootScope,
                $scope,
                $compile;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });
            });

            it('should create a new scope with the parent scope property mapped correctly', function() {
                var $with,
                    scope;

                $scope.Ctrl = {
                    model: {
                        user: {
                            name: 'Josh'
                        }
                    }
                };

                $scope.$apply(function() {
                    $with = $compile('<div c6-with="Ctrl.model.user as user">{{user.name}}</div>')($scope);
                });
                scope = $with.contents().scope();

                expect(scope).not.toBe($scope);
                expect(scope.user).toBe($scope.Ctrl.model.user);
                expect($with.text()).toBe('Josh');
            });

            it('should work if the model is undefined', function() {
                var $with,
                    scope;

                $scope.Ctrl = {
                    model: null
                };

                $scope.$apply(function() {
                    $with = $compile('<div c6-with="Ctrl.model.user as user">{{user.name}}</div>')($scope);
                });
                scope = $with.contents().scope();

                expect($with.text()).toBe('');

                $scope.$apply(function() {
                    $scope.Ctrl.model = {
                        user: {
                            name: 'Josh'
                        }
                    };
                });

                expect($with.text()).toBe('Josh');
            });

            it('should work with an alternate element syntax', function() {
                var $c6With,
                    scope;

                $scope.Ctrl = {
                    data: {
                        results: [
                            {
                                value: 'foo'
                            }
                        ]
                    }
                };

                $scope.$apply(function() {
                    $c6With = $compile('<c6-with model="Ctrl.data.results" as="results">{{results[0].value}}</c6-with>')($scope);
                });
                scope = $c6With.contents().scope();

                expect(scope).not.toBe($scope);
                expect(scope.results).toBe($scope.Ctrl.data.results);
                expect($c6With.text()).toBe('foo');
            });
        });
    });
}());
