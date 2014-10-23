define(['app','modules/ballot'], function(appModule, ballotModule) {
    'use strict';

    describe('<ballot-results-module>', function() {
        var $rootScope,
            $scope,
            $compile;

        var $animate;

        beforeEach(function() {
            module(function($provide) {
                $provide.value('$log', {
                    context: function() {
                        return {
                            info: function() {},
                            error: function() {}
                        };
                    }
                });
            });

            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: 'mobile'
                });
            });
            module(ballotModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $animate = $injector.get('$animate');

                $scope = $rootScope.$new();
            });
        });

        describe('$watchers', function() {
            describe('active', function() {
                var ballot$;

                beforeEach(function() {
                    $scope.active = false;
                    $scope.$apply(function() {
                        ballot$ = $compile('<ballot-results-module active="active"></ballot-results-module>')($scope);
                    });
                });

                describe('when it is not active', function() {
                    it('should add the "ng-hide" class', function() {
                        expect(ballot$.hasClass('ng-hide')).toBe(true);
                    });
                });

                describe('when it is active', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                    });

                    it('should remove the "ng-hide" class', function() {
                        expect(ballot$.hasClass('ng-hide')).toBe(false);
                    });
                });
            });
        });
    });
});
