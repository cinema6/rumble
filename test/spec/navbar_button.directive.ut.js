(function() {
    'use strict';

    describe('<navbar-button>', function() {
        var $rootScope,
            $scope,
            $compile,
            button$,
            scope;

        beforeEach(function() {
            module('c6.rumble', function($provide) {
                $provide.value('c6AppData', {
                    mode: 'full'
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
                $scope.index = 2;
                $scope.currentIndex = 1;
                $scope.card = {
                    thumb: null
                };
            });

            $scope.$apply(function() {
                button$ = $compile('<navbar-button index="index" current-index="currentIndex" card="card"></navbar-button>')($scope);
            });
            scope = button$.children().scope();
        });

        describe('$scope.thumb', function() {
            describe('if the card thumb is null', function() {
                it('should be ""', function() {
                    expect(scope.thumb).toBe('');
                });
            });

            describe('if the card thumb has a value', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.card.thumbs = {
                            small: 'hello.jpg',
                            large: 'hello--large.jpg'
                        };
                    });
                });

                it('should return the small card thumb formated as css background', function() {
                    expect(scope.thumb).toBe('url(hello.jpg)');

                    $scope.$apply(function() {
                        $scope.card.thumbs.small = 'foo.jpg';
                    });
                    expect(scope.thumb).toBe('url(foo.jpg)');
                });
            });
        });

        describe('active', function() {
            describe('if index === currentIndex', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.index = 1;
                    });
                });

                it('should be true', function() {
                    expect(scope.active).toBe(true);
                });
            });

            describe('if index !== currentIndex', function() {
                describe('if hover is false or undefined', function() {
                    it('should be false', function() {
                        expect(scope.active).toBe(false);
                    });
                });

                describe('if hover is true', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            scope.hover = true;
                        });
                    });

                    it('should be true', function() {
                        expect(scope.active).toBe(true);
                    });
                });
            });
        });
    });
}());
