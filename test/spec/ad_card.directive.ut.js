define(['cards/ad','c6uilib'], function(adCardModule, c6uilibModule) {
    'use strict';

    describe('<ad-card></ad-card>', function() {
        var $rootScope,
            $scope,
            $compile,
            $log,
            $httpBackend;

        beforeEach(function() {
            module(c6uilibModule.name, function($provide) {
                $provide.factory('c6VideoDirective', function() {
                    return {};
                });
            });

            module(adCardModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: 'full'
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $log = $injector.get('$log');
                $httpBackend = $injector.get('$httpBackend');

                $scope = $rootScope.$new();
                $scope.config = {
                    data: {
                        type: 'ad'
                    }
                };
                $log.context = function() { return $log; };
            });
        });

        describe('initialization', function() {
            describe('with flash enabled', function() {
                it('should compile a vpaid-card', function() {
                    var element$;

                    $httpBackend.expectGET('assets/views/vpaid_object_embed.html')
                        .respond(200, '<vpaid-card></vpaid-card>');

                    $scope.$apply(function() {
                        $scope.profile = {
                            flash: true
                        };
                        element$ = $compile('<ad-card></ad-card>')($scope);
                    });

                    expect(element$.find('vpaid-card').length).toBe(1);
                });
            });

            describe('without flash enabled', function() {
                it('should compile a vast-card', function() {
                    var element$;

                    $scope.$apply(function() {
                        $scope.profile = {
                            flash: false
                        };
                        element$ = $compile('<ad-card></ad-card>')($scope);
                    });

                    expect(element$.find('vast-card').length).toBe(1);
                });
            });
        });

    });
});
