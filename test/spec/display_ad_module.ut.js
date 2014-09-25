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
                });
            });
        });
    });
});
