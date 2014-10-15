define(['app'], function(appModule) {
    'use strict';

    describe('<display-ad-module>', function() {
        var $rootScope,
            $compile,
            AdTechService,
            $scope,
            $displayAdModule;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                AdTechService = $injector.get('AdTechService');
            });

            spyOn(AdTechService, 'loadAd');

            $scope = $rootScope.$new();

            $scope.active = false;
            $scope.config = {
                id: 'rc-808a64d53e3a48',
                data: {}
            };
            $scope.$apply(function() {
                $displayAdModule = $compile('<display-ad-module active="active" config="config"></display-ad-module>')($scope);
            });
        });

        describe('$watchers', function() {
            describe('active', function() {
                describe('when false', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = false;
                        });
                    });

                    it('should not load an ad', function() {
                        expect(AdTechService.loadAd).not.toHaveBeenCalled();
                    });
                });

                describe('when true', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                    });

                    it('should load an ad', function() {
                        expect(AdTechService.loadAd).toHaveBeenCalledWith($scope.config);
                    });

                    describe('if there is no config', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                                $scope.config = null;
                            });
                            AdTechService.loadAd = jasmine.createSpy('loadAd()');
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not load an ad', function() {
                            expect(AdTechService.loadAd).not.toHaveBeenCalledWith($scope.config);
                        });
                    });
                });
            });

            describe('config', function() {
                describe('if the config changes', function() {
                    describe('if the module is not active', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                $scope.config = {
                                    id: 'rc-b15f7fb9750557',
                                    data: {}
                                };
                            });
                        });

                        it('should not load an ad', function() {
                            expect(AdTechService.loadAd).not.toHaveBeenCalled();
                        });
                    });

                    describe('if the module is active', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                            AdTechService.loadAd = jasmine.createSpy('loadAd()');
                            $scope.$apply(function() {
                                $scope.config = {
                                    id: 'rc-b15f7fb9750557',
                                    data: {}
                                };
                            });
                        });

                        it('should load a new ad', function() {
                            expect(AdTechService.loadAd).toHaveBeenCalledWith($scope.config);
                        });

                        describe('if the config becomes falsy', function() {
                            beforeEach(function() {
                                AdTechService.loadAd = jasmine.createSpy('loadAd()');
                                $scope.$apply(function() {
                                    $scope.config = null;
                                });
                            });

                            it('should not load an ad', function() {
                                expect(AdTechService.loadAd).not.toHaveBeenCalled();
                            });
                        });
                    });
                });
            });
        });
    });
});
