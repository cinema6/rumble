define(['app'], function(appModule) {
    'use strict';

    describe('TextCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            c6AppData,
            ModuleService,
            AdTechService,
            TextCardCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6AppData = $injector.get('c6AppData');
                ModuleService = $injector.get('ModuleService');
                AdTechService = $injector.get('AdTechService');

                $scope = $rootScope.$new();
            });

            $scope.active = false;
            $scope.config = {
                modules: []
            };

            spyOn(ModuleService, 'hasModule').andCallThrough();
            spyOn(AdTechService, 'loadAd');

            spyOn($rootScope, '$broadcast').andCallThrough();
            $scope.$apply(function() {
                TextCardCtrl = $controller('TextCardController', { $scope: $scope });
            });
        });

        it('should exist', function() {
            expect(TextCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('$watchers', function() {
            describe('active', function() {
                describe('if the mode is "lightbox"', function() {
                    beforeEach(function() {
                        c6AppData.mode = 'lightbox';
                    });

                    describe('on initializaion', function() {
                        beforeEach(function() {
                            $rootScope.$broadcast = jasmine.createSpy('$broadcast');
                            $scope.$apply(function() {
                                TextCardCtrl = $controller('TextCardController', { $scope: $scope });
                            });
                        });

                        it('should not $broadcast resize', function() {
                            expect($rootScope.$broadcast).not.toHaveBeenCalled();
                        });
                    });

                    describe('when true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should $broadcast resize', function() {
                            expect($rootScope.$broadcast).toHaveBeenCalledWith('resize');
                        });
                    });

                    describe('when false', function() {
                        beforeEach(function() {
                            [true, false].forEach(function(bool) {
                                $scope.$apply(function() {
                                    $scope.active = bool;
                                });
                            });
                        });

                        it('should $broadcast resize', function() {
                            expect($rootScope.$broadcast).toHaveBeenCalledWith('resize');
                        });
                    });
                });

                ['lightbox-ads', 'light', 'full'].forEach(function(mode) {
                    describe('if the mode is "' + mode + '"', function() {
                        beforeEach(function() {
                            c6AppData.mode = mode;
                        });

                        describe('when false', function() {
                            beforeEach(function() {
                                [true, false].forEach(function(bool) {
                                    $scope.$apply(function() {
                                        $scope.active = bool;
                                    });
                                });
                            });

                            it('should not $broadcast resize', function() {
                                expect($rootScope.$broadcast).not.toHaveBeenCalledWith('resize');
                            });
                        });
                    });
                });
            });
        });
    });
});
