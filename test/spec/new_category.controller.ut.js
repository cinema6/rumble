(function() {
    'use strict';

    define(['manager'], function() {
        describe('NewCategoryController', function() {
            var $rootScope,
                $scope,
                $controller,
                NewCtrl,
                NewCategoryCtrl;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    NewCtrl = $scope.NewCtrl = {};
                    $scope.$apply(function() {
                        NewCategoryCtrl = $controller('NewCategoryController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(NewCategoryCtrl).toEqual(jasmine.any(Object));
            });

            describe('$watchers', function() {
                describe('mode', function() {
                    it('should data-bind to the "category" property of the NewCtrl', function() {
                        $scope.$apply(function() {
                            NewCategoryCtrl.mode = 'lightbox';
                        });
                        expect(NewCtrl.category).toBe('lightbox');

                        $scope.$apply(function() {
                            NewCategoryCtrl.mode = 'bar';
                        });
                        expect(NewCtrl.category).toBe('bar');
                    });
                });
            });
        });
    });
}());
