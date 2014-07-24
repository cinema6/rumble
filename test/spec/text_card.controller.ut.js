define(['cards/text'], function(textCardModule) {
    'use strict';

    describe('TextCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            ModuleService,
            AdTechService,
            TextCardCtrl;

        beforeEach(function() {
            module(textCardModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
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

            $scope.$apply(function() {
                TextCardCtrl = $controller('TextCardController', { $scope: $scope });
            });
        });

        it('should exist', function() {
            expect(TextCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('hasModule(module)', function() {
                it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                    TextCardCtrl.hasModule('ballot');
                    expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'ballot');

                    TextCardCtrl.hasModule('comments');
                    expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'comments');
                });
            });
        });

        describe('$watchers', function() {
            describe('active', function() {
                describe('without a displayAd', function() {
                    beforeEach(function() {
                        $scope.config.modules.length = 0;
                    });

                    [true, false].forEach(function(bool) {
                        describe('if ' + bool, function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = bool;
                                });
                            });

                            it('should not load a displayAd', function() {
                                expect(AdTechService.loadAd).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('with a displayAd', function() {
                    beforeEach(function() {
                        $scope.config.modules.push('displayAd');
                    });

                    describe('if false', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should not load a displayAd', function() {
                            expect(AdTechService.loadAd).not.toHaveBeenCalled();
                        });
                    });

                    describe('if true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should load a displayAd', function() {
                            expect(AdTechService.loadAd).toHaveBeenCalledWith($scope.config);
                        });
                    });
                });
            });
        });
    });
});
