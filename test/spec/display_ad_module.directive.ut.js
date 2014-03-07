(function() {
    'use strict';

    define(['display_ad_module'], function() {
        describe('<display-ad-module>', function() {
            var $rootScope,
                $scope,
                $compile;

            beforeEach(function() {
                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', {
                        profile: {
                            device: 'desktop'
                        },
                        experience: {
                            data: {}
                        }
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });
            });

            describe('properties', function() {
                var scope, adModule;

                beforeEach(function() {
                    $scope.active = true;
                    $scope.adResource = {
                        adType: 'iframe',
                        fileURI: '//ads.adap.tv/c/companion?cck=cck&creativeId=110497&melaveId=42657&key=tribal360llc&adSourceId=208567&bidId=&afppId=159224&exSId=639284&cb=9874983758324475&pageUrl=http%3A%2F%2Fcinema6.com&eov=eov'
                    };
                    $scope.$apply(function() {
                        adModule = $compile('<display-ad-module ad-resource="adResource" active="active"></display-ad-module>')($scope);
                    });

                    scope = adModule.children().scope();
                });

                describe('active', function() {
                    it('should be fine', function() {
                        $scope.$apply(function() {
                            $scope.active = false;
                        });

                        expect(scope).toEqual($scope);
                    });

                });
            });
        });
    });
}());
