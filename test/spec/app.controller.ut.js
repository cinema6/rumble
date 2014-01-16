(function(){
    'use strict';

    define(['app', 'templates'], function() {
        describe('AppController', function() {
            var $rootScope,
                $scope,
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
                var setupResult,
                    srcResult;

                beforeEach(function() {
                    var setup = cinema6.init.mostRecentCall.args[0].setup;

                    srcResult = {};
                    spyOn(AppCtrl, 'src').andReturn(srcResult);

                    appData.experience.img.hero = {};
                    appData.experience.data = { playList : [] };

                    setupResult = setup(appData);
                });

                it('should initialize a session with the site', function() {
                    expect(cinema6.init).toHaveBeenCalled();
                });

                it('should setup the session', function() {
                    expect(AppCtrl.experience).toBe(appData.experience);
                    expect(AppCtrl.profile).toBe(appData.profile);

                    expect(setupResult).toBe(c6ImagePreloader._.loadResult);
                    expect(AppCtrl.src).toHaveBeenCalledWith(appData.experience.img.hero);
                    expect(c6ImagePreloader.load.mostRecentCall.args[0][0]).toBe(srcResult);
                });

                it('should configure gsap', function() {
                    expect(gsap.TweenLite.ticker.useRAF).toHaveBeenCalledWith(appData.profile.raf);
                });
            });
            
            describe('@public', function() {
                describe('methods', function() {
                    describe('img(src)', function() {
                        it('should append a different modifier based on different profile properties', function() {
                            var src = 'test/foo.jpg';

                            AppCtrl.profile = appData.profile;
                            expect(AppCtrl.src()).toBe(null);

                            AppCtrl.profile = undefined;
                            expect(AppCtrl.src(src)).toBe(null);

                            AppCtrl.profile = appData.profile;

                            appData.profile.speed = 'slow';
                            appData.profile.webp = false;
                            expect(AppCtrl.src(src)).toBe('test/foo--low.jpg');

                            appData.profile.speed = 'average';
                            expect(AppCtrl.src(src)).toBe('test/foo--med.jpg');

                            appData.profile.speed = 'fast';
                            expect(AppCtrl.src(src)).toBe('test/foo--high.jpg');

                            appData.profile.speed = 'slow';
                            appData.profile.webp = true;
                            expect(AppCtrl.src(src)).toBe('test/foo--low.jpg');

                            appData.profile.speed = 'average';
                            expect(AppCtrl.src(src)).toBe('test/foo--med.webp');

                            appData.profile.speed = 'fast';
                            expect(AppCtrl.src(src)).toBe('test/foo--high.webp');
                        });
                    });
                });
            });
        });
    });
}());
