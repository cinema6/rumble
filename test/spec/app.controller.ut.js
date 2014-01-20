(function(){
    'use strict';

    define(['app', 'templates'], function() {
        describe('AppController', function() {
            var $rootScope,
                $scope,
                $childScope,
                $location,
                $q,
                $log,
                $timeout,
                AppCtrl;

            var cinema6,
                c6ImagePreloader,
                gsap,
                googleAnalytics,
                $stateProvider,
                $state,
                appData,
                siteSession;

            beforeEach(function() {
                c6ImagePreloader = {
                    load: jasmine.createSpy('c6ImagePreloader.load()').andCallFake(function() {
                        return c6ImagePreloader._.loadResult;
                    }),
                    _: {
                        loadResult: {}
                    }
                };

                gsap = {
                    TweenLite: {
                        ticker: {
                            useRAF: jasmine.createSpy('gsap.TweenLite.ticker.useRAF()')
                        }
                    }
                };

                googleAnalytics = jasmine.createSpy('googleAnalytics');

                $stateProvider = {
                    state: jasmine.createSpy('$stateProvider.state()').andCallFake(function() {
                        return $stateProvider;
                    }),
                    $get: function() {
                        return $state;
                    }
                };

                $state = {
                    go: jasmine.createSpy('$state.go()')
                };

                appData = {
                    experience: {
                        img: {}
                    },
                    profile: {
                        raf: {}
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.factory('cinema6', function($q) {
                        cinema6 = {
                            init: jasmine.createSpy('cinema6.init()'),
                            getSession: jasmine.createSpy('cinema6.getSiteSession()').andCallFake(function() {
                                return cinema6._.getSessionResult.promise;
                            }),
                            requestTransitionState: jasmine.createSpy('cinema6.requestTransitionState()').andCallFake(function() {
                                return cinema6._.requestTransitionStateResult.promise;
                            }),
                            _: {
                                getSessionResult: $q.defer(),
                                requestTransitionStateResult: $q.defer()
                            }
                        };

                        return cinema6;
                    });
                    $provide.value('c6ImagePreloader', c6ImagePreloader);
                });

                module('c6.rumble', function($provide) {
                    $provide.value('gsap', gsap);
                    $provide.value('googleAnalytics', googleAnalytics);
                });

                inject(function(_$rootScope_, _$q_, _$timeout_, _$log_, _$location_,$controller, c6EventEmitter) {
                    $rootScope = _$rootScope_;
                    $q = _$q_;
                    $log = _$log_;
                    $location = _$location_;
                    $timeout = _$timeout_;
                    $scope = _$rootScope_.$new();
                    $childScope = $scope.$new();
                    $log.context = function() { return $log; };

                    AppCtrl = $controller('AppController', {
                        $scope: $scope,
                        $log: $log
                    });

                    siteSession = c6EventEmitter({});
                });
            });

            it('should exist',function() {
                expect(AppCtrl).toBeDefined();
            });

            describe('site integration', function() {
                beforeEach(function() {
                    cinema6.init.mostRecentCall.args[0].setup(appData);
                });

                it('should initialize a session with the site', function() {
                    expect(cinema6.init).toHaveBeenCalled();
                });

                it('should setup the session', function() {
                    expect($scope.app.data).toBe(appData);
                });
            });

            describe('app', function() {
                describe('data', function() {
                    it('should be null', function() {
                        expect($scope.app.data).toBeNull();
                    });
                });

                describe('state', function() {
                    it('should be splash', function() {
                        expect($scope.app.state).toBe('splash');
                    });

                    it('should not be publicly set-able', function() {
                        expect(function() {
                            $scope.app.state = 'foo';
                        }).toThrow();
                    });
                });
            });

            describe('handling events', function() {
                describe('reelStart', function() {
                    beforeEach(function() {
                        $childScope.$emit('reelStart');
                    });

                    it('should change to the "card" state', function() {
                        expect($scope.app.state).toBe('deck');
                    });
                });
            });
        });
    });
}());
