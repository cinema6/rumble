(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorSplashController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                CollateralService,
                EditorSplashCtrl;

            var minireel;

            beforeEach(function() {
                minireel = {};

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    CollateralService = $injector.get('CollateralService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        EditorSplashCtrl = $controller('EditorSplashController', { $scope: $scope });
                        EditorSplashCtrl.model = minireel;
                    });
                });
            });

            it('should exist', function() {
                expect(EditorSplashCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('splash', function() {
                    it('should be null', function() {
                        expect(EditorSplashCtrl.splash).toBeNull();
                    });
                });

                describe('currentUpload', function() {
                    it('should be null', function() {
                        expect(EditorSplashCtrl.splash).toBeNull();
                    });
                });
            });

            describe('methods', function() {
                describe('upload()', function() {
                    var setDeferred;

                    beforeEach(function() {
                        setDeferred = $q.defer();

                        spyOn(CollateralService, 'set')
                            .and.returnValue(setDeferred.promise);

                        EditorSplashCtrl.splash = {};

                        $scope.$apply(function() {
                            EditorSplashCtrl.upload();
                        });
                    });

                    it('should set the user-selected file as the minireel\'s splash image', function() {
                        expect(CollateralService.set).toHaveBeenCalledWith('splash', EditorSplashCtrl.splash, minireel);
                    });

                    it('should put the result of the set method on iteself', function() {
                        expect(EditorSplashCtrl.currentUpload).toBe(setDeferred.promise);
                    });

                    describe('after the upload completes', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                setDeferred.resolve(minireel);
                            });
                        });

                        it('should null-out the currentUpload property', function() {
                            expect(EditorSplashCtrl.currentUpload).toBeNull();
                        });
                    });

                    describe('if the upload fails', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                setDeferred.reject({});
                            });
                        });

                        it('should null-out the currentUpload property', function() {
                            expect(EditorSplashCtrl.currentUpload).toBeNull();
                        });
                    });
                });
            });
        });
    });
}());
