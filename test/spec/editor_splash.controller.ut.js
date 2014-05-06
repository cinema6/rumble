(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorSplashController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                FileService,
                CollateralService,
                EditorSplashCtrl;

            var EditorCtrl;

            var minireel;

            beforeEach(function() {
                minireel = {
                    data: {
                        collateral: {
                            splash: 'foo.jpg'
                        }
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    CollateralService = $injector.get('CollateralService');
                    c6State = $injector.get('c6State');

                    FileService = $injector.get('FileService');
                    spyOn(FileService, 'open').and.callThrough();

                    $scope = $rootScope.$new();
                    $scope.EditorCtrl = EditorCtrl = {
                        model: {
                            data: {
                                collateral: {
                                    splash: null
                                }
                            }
                        }
                    };
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
                describe('maxFileSize', function() {
                    it('should be 204800', function() {
                        expect(EditorSplashCtrl.maxFileSize).toBe(204800);
                    });
                });

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

                describe('fileTooBig', function() {
                    beforeEach(function() {
                        EditorSplashCtrl.maxFileSize = 204800;
                    });

                    it('should not throw any errors if there is no file', function() {
                        expect(function() {
                            return EditorSplashCtrl.fileTooBig;
                        }).not.toThrow();
                    });

                    describe('if there is a file', function() {
                        beforeEach(function() {
                            EditorSplashCtrl.splash = {
                                size: 102400
                            };
                        });

                        it('should be true if the file\'s size is greater than the max size', function() {
                            function tooBig() {
                                return EditorSplashCtrl.fileTooBig;
                            }

                            expect(tooBig()).toBe(false);

                            EditorSplashCtrl.splash.size = 204800;
                            expect(tooBig()).toBe(false);

                            EditorSplashCtrl.splash.size = 204801;
                            expect(tooBig()).toBe(true);
                        });
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

                describe('save', function() {
                    var originalData;

                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        originalData = EditorCtrl.model.data;
                        EditorSplashCtrl.save();
                    });

                    it('should copy the collateral hash of its model to the EditorCtrl\'s model', function() {
                        expect(EditorCtrl.model.data.collateral).toEqual(minireel.data.collateral);
                        expect(EditorCtrl.model.data).toBe(originalData);
                    });

                    it('should transition back to the editor', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor');
                    });

                    it('should create a collateral object on the original if it has none', function() {
                        delete EditorCtrl.model.data.collateral;

                        EditorSplashCtrl.save();
                        expect(EditorCtrl.model.data.collateral).toEqual(minireel.data.collateral);
                    });
                });
            });

            describe('events', function() {
                describe('$destroy', function() {
                    function trigger() {
                        $scope.$emit('$destroy');
                    }

                    describe('if the user did not select an image', function() {
                        beforeEach(trigger);

                        it('should do nothing', function() {
                            expect(FileService.open).not.toHaveBeenCalled();
                        });
                    });

                    describe('if the user did select an image', function() {
                        var wrapper;

                        beforeEach(function() {
                            wrapper = {
                                close: jasmine.createSpy('wrapper.close()')
                            };

                            EditorSplashCtrl.splash = {};
                            FileService.open.and.returnValue(wrapper);

                            trigger();
                        });

                        it('should close the file', function() {
                            expect(FileService.open).toHaveBeenCalledWith(EditorSplashCtrl.splash);
                            expect(wrapper.close).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('this.splash', function() {
                    it('should close a file if it is no longer the user-selected file', function() {
                        var file,
                            wrapper = {
                                close: jasmine.createSpy('wrapper.close()')
                            };

                        expect(FileService.open).not.toHaveBeenCalled();

                        $scope.$apply(function() {
                            EditorSplashCtrl.splash = file = {};
                        });

                        expect(FileService.open).not.toHaveBeenCalled();

                        FileService.open.and.returnValue(wrapper);
                        $scope.$apply(function() {
                            EditorSplashCtrl.splash = {};
                        });
                        expect(FileService.open).toHaveBeenCalledWith(file);
                        expect(wrapper.close).toHaveBeenCalled();
                    });
                });
            });
        });
    });
}());
