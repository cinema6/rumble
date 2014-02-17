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
                $controller,
                c6EventEmitter,
                $window,
                AppCtrl;

            var cinema6,
                c6ImagePreloader,
                gsap,
                googleAnalytics,
                $stateProvider,
                $state,
                $document,
                myFrame$,
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
                        raf: {},
                        device: 'desktop'
                    }
                };

                module('ng', function($provide) {
                    $provide.value('$document', {
                        height: jasmine.createSpy('$document.height()')
                            .andReturn(600)
                    });
                });

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
                            fullscreen: jasmine.createSpy('cinema6.fullscreen()'),
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
                    $provide.value('myFrame$', {
                        height: jasmine.createSpy('myFrame$.height()')
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    $log = $injector.get('$log');
                    $location = $injector.get('$location');
                    $timeout = $injector.get('$timeout');
                    $controller = $injector.get('$controller');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    $window = $injector.get('$window');

                    $document = $injector.get('$document');
                    myFrame$ = $injector.get('myFrame$');

                    $scope = $rootScope.$new();
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

                it('should copy the profile onto the c6Profile injectable', inject(function(c6Profile) {
                    expect(c6Profile).toEqual(appData.profile);
                }));
            });

            describe('methods', function() {
                describe('resize', function() {
                    it('should set the height of myFrame$ to the height of the document contents in a timeout.', function() {
                        AppCtrl.resize();
                        $timeout.flush();
                        expect(myFrame$.height).toHaveBeenCalledWith(600);

                        $document.height.andReturn(1000);
                        AppCtrl.resize();
                        $timeout.flush();
                        expect(myFrame$.height).toHaveBeenCalledWith(1000);
                    });
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

                describe('views', function() {
                    it('should have null locations for experience and deck', function() {
                        expect($scope.app.views).toEqual({
                            experience: null,
                            deck: null
                        });
                    });

                    describe('if the device is not a phone', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                cinema6.init.mostRecentCall.args[0].setup(appData);
                            });
                        });

                        it('should load desktop views', function() {
                            expect($scope.app.views).toEqual({
                                experience: 'assets/views/experience.html',
                                deck: 'assets/views/deck.html'
                            });
                        });
                    });

                    describe('if the device is a phone', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                appData.profile.device = 'phone';
                                cinema6.init.mostRecentCall.args[0].setup(appData);
                            });
                        });

                        it('should load mobile views', function() {
                            expect($scope.app.views).toEqual({
                                experience: 'assets/views/experience--mobile.html',
                                deck: 'assets/views/deck--mobile.html'
                            });
                        });
                    });
                });
            });

            describe('handling events', function() {
                describe('reelStart', function() {
                    beforeEach(function() {
                        $childScope.$emit('reelStart');
                    });

                    it('should change to the "deck" state', function() {
                        expect($scope.app.state).toBe('deck');
                    });
                });

                describe('reelReset', function() {
                    beforeEach(function() {
                        $childScope.$emit('reelStart');
                        $childScope.$emit('reelReset');
                    });

                    it('should change to the "splash" state', function() {
                        expect($scope.app.state).toBe('splash');
                    });

                    it('should exit fullscreen mode', function() {
                        expect(cinema6.fullscreen).toHaveBeenCalledWith(false);
                    });
                });

                describe('<ballot-vote-module>:vote', function() {
                    var window$;

                    beforeEach(function() {
                        spyOn(AppCtrl, 'resize');

                        cinema6.init.mostRecentCall.args[0].setup(appData);
                    });

                    describe('if not on a phone', function() {
                        it('should call AppCtrl.resize() debounced', function() {
                            $childScope.$emit('<ballot-vote-module>:vote', 0);
                            expect(AppCtrl.resize).toHaveBeenCalled();

                            $childScope.$emit('<ballot-vote-module>:vote', 2);
                            expect(AppCtrl.resize.callCount).toBe(2);
                        });
                    });

                    describe('if on a phone', function() {
                        beforeEach(function() {
                            appData.profile.device = 'phone';

                            $scope = $rootScope.$new();
                            AppCtrl = $controller('AppController', { $scope: $scope });
                            spyOn(AppCtrl, 'resize');

                            cinema6.init.mostRecentCall.args[0].setup(appData);
                        });

                        it('should do nothing', function() {
                            $childScope.$emit('<ballot-vote-module>:vote', 0);
                            expect(AppCtrl.resize).not.toHaveBeenCalled();

                            $childScope.$emit('<ballot-vote-module>:vote', 0);
                            expect(AppCtrl.resize).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('$window.parent resize', function() {
                    var window$;

                    beforeEach(function() {
                        spyOn(AppCtrl, 'resize');

                        window$ = angular.element($window.parent);
                        cinema6.init.mostRecentCall.args[0].setup(appData);
                    });

                    describe('if not on a phone', function() {
                        it('should call AppCtrl.resize() debounced', function() {
                            window$.trigger('resize');
                            $timeout.flush();
                            expect(AppCtrl.resize).toHaveBeenCalled();

                            window$.trigger('resize');
                            $timeout.flush();
                            expect(AppCtrl.resize.callCount).toBe(2);
                        });
                    });

                    describe('if on a phone', function() {
                        beforeEach(function() {
                            appData.profile.device = 'phone';

                            $scope = $rootScope.$new();
                            AppCtrl = $controller('AppController', { $scope: $scope });
                            spyOn(AppCtrl, 'resize');

                            cinema6.init.mostRecentCall.args[0].setup(appData);
                        });

                        it('should do nothing', function() {
                            window$.trigger('resize');
                            $timeout.flush();
                            expect(AppCtrl.resize).not.toHaveBeenCalled();

                            window$.trigger('resize');
                            $timeout.flush();
                            expect(AppCtrl.resize).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
