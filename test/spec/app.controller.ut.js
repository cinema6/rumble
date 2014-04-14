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
                c6AppData,
                AppCtrl,
                $httpBackend;

            var cinema6,
                c6ImagePreloader,
                gsap,
                googleAnalytics,
                $stateProvider,
                $state,
                $animate,
                $document,
                myFrame$,
                appData,
                siteSession,
                session;

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
                
                session = {
                    on : jasmine.createSpy('session.on')
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
                            init: jasmine.createSpy('cinema6.init()').andReturn(session),
                            getSession: jasmine.createSpy('cinema6.getSiteSession()').andCallFake(function() {
                                return cinema6._.getSessionResult.promise;
                            }),
                            requestTransitionState: jasmine.createSpy('cinema6.requestTransitionState()').andCallFake(function() {
                                return cinema6._.requestTransitionStateResult.promise;
                            }),
                            fullscreen: jasmine.createSpy('cinema6.fullscreen()'),
                            getAppData: jasmine.createSpy('cinema6.getAppData()')
                                .andReturn($q.defer().promise),
                            _: {
                                getSessionResult: $q.defer(),
                                requestTransitionStateResult: $q.defer()
                            },
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
                    c6AppData = $injector.get('c6AppData');
                    $httpBackend = $injector.get('$httpBackend');
                    $httpBackend.whenGET('assets/config/responsive.json').respond({});


                    $document = $injector.get('$document');
                    myFrame$ = $injector.get('myFrame$');
                    $animate = $injector.get('$animate');
                    spyOn($animate, 'enabled');

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

            it('should disable animations', function() {
                expect($animate.enabled).toHaveBeenCalledWith(false);
            });

            describe('site integration', function() {
                it('should initialize a session with the site', function() {
                    expect(cinema6.init).toHaveBeenCalled();
                });
            });

            describe('app', function() {
                describe('data', function() {
                    it('should be a reference to the appData', function() {
                        expect($scope.app.data).toBe(c6AppData);
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

                    it('should enable animations', function() {
                        expect($animate.enabled).toHaveBeenCalledWith(true);
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
            });

            describe('google analytics initialization',function(){
                beforeEach(function(){
                    $window.c6MrGa = jasmine.createSpy('$window.c6MrGa');
                });

                it('app will look for initAnalytics',function(){
                    expect(cinema6.init).toHaveBeenCalled();
                    expect(session.on.calls[0].args[0]).toEqual('initAnalytics');
                });

                it('will use initAnalytics cb to init ga',function(){
                    c6AppData.experience = {
                        id : 'exp1'
                    };
                    var cb = session.on.calls[0].args[1];
                    cb({
                        accountId : 'abc',
                        clientId  : '123'
                    });
                    expect($window.c6MrGa.callCount).toEqual(2);
                    
                    expect($window.c6MrGa.calls[0].args[0]).toEqual('create');
                    expect($window.c6MrGa.calls[0].args[1]).toEqual('abc');
                    expect($window.c6MrGa.calls[0].args[2]).toEqual({
                        'name'          : 'c6-mr',
                        'clientId'      : '123',
                        'cookieDomain'  : 'none',
                        'storage'       : 'none'
                    });

                    expect($window.c6MrGa.calls[1].args[0]).toEqual('c6-mr.send');
                    expect($window.c6MrGa.calls[1].args[1]).toEqual('pageview');
                    expect($window.c6MrGa.calls[1].args[2]).toEqual({
                        'page'      : '/mr/load?experienceId=exp1',
                        'title'     : 'Minireel App Load'
                    });
                });
            });
        });
    });
}());
