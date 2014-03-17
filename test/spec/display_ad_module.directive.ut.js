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
                        mode: 'full',
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

            describe('$watcher', function() {
                var scope, adModule;

                beforeEach(function() {
                    $scope.$apply(function() {
                        adModule = $compile('<display-ad-module ad-object="adObject"></display-ad-module>')($scope);
                    });

                    scope = adModule.children().scope();
                });

                describe('when an adObject is loaded', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.adObject = {
                                adType: 'iframe',
                                fileURI: '//ads.adap.tv/c/companion?cck=cck&creativeId=110497&melaveId=42657&key=tribal360llc&adSourceId=208567&bidId=&afppId=159224&exSId=639284&cb=9874983758324475&pageUrl=http%3A%2F%2Fcinema6.com&eov=eov'
                            };
                        });
                    });

                    it('should set the adType and fileURI props', function() {
                        expect(scope.adType).toBe('iframe');
                        expect(scope.fileURI).toBe('//ads.adap.tv/c/companion?cck=cck&creativeId=110497&melaveId=42657&key=tribal360llc&adSourceId=208567&bidId=&afppId=159224&exSId=639284&cb=9874983758324475&pageUrl=http%3A%2F%2Fcinema6.com&eov=eov');
                    });

                });
            });
        });
    });
}());
