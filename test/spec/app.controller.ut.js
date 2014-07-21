define(['app','c6ui','angular'], function(appModule, c6uiModule, angular) {
    'use strict';

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
            c6Defines,
            AppCtrl,
            $httpBackend;

        var cinema6,
            $animate,
            $document,
            myFrame$,
            session,
            trackerServiceSpy,
            trackerSpy;

        beforeEach(function() {
            trackerSpy = {
                create  : jasmine.createSpy('tracker.create'),
                set     : jasmine.createSpy('tracker.set')
            };
            trackerServiceSpy = jasmine.createSpy('trackerService').andReturn(trackerSpy);

            module(c6uiModule.name, function($provide) {
                $provide.factory('cinema6', function($q) {
                    cinema6 = {
                        init: jasmine.createSpy('cinema6.init()').andCallFake(function() {
                            return session;
                        }),
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
            });

            module(appModule.name, function($provide) {
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
                c6AppData = $injector.get('c6AppData');
                c6Defines = $injector.get('c6Defines');
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET('assets/config/responsive.json').respond({});

                session = c6EventEmitter({
                    ping: jasmine.createSpy('session.ping()')
                });
                spyOn(session, 'on').andCallThrough();


                $window = {
                    location : {
                        reload : angular.noop
                    }
                };
                c6AppData.experience = {
                    id : 'exp1',
                    title: 'Test Minireel'
                };

                c6Defines.kAppName      = 'testAppName';
                c6Defines.kAppId        = 'testAppID';
                c6Defines.kAppVersion   = 'testAppVersion';

                $document = $injector.get('$document');
                spyOn($document, 'height').andReturn(600);
                myFrame$ = $injector.get('myFrame$');
                $animate = $injector.get('$animate');
                spyOn($animate, 'enabled');

                $scope = $rootScope.$new();
                $childScope = $scope.$new();
                $log.context = function() { return $log; };

                AppCtrl = $controller('AppController', {
                    $window: $window,
                    $scope: $scope,
                    $log: $log,
                    c6Defines : c6Defines,
                    trackerService : trackerServiceSpy
                });
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
                expect(cinema6.init).toHaveBeenCalledWith({
                    setup: jasmine.any(Function)
                });
            });

            describe('events', function() {
                describe('show', function() {
                    beforeEach(function() {
                        spyOn($scope, '$broadcast');
                        session.emit('show');
                    });

                    it('should $emit shouldStart', function() {
                        expect($scope.$broadcast).toHaveBeenCalledWith('shouldStart');
                    });
                });
            });

            describe('setup()', function() {
                var success;

                beforeEach(function() {
                    var setup = cinema6.init.mostRecentCall.args[0].setup;

                    success = jasmine.createSpy('setup() success');

                    $scope.$apply(function() {
                        setup(c6AppData).then(success);
                    });
                });

                it('should return a promise that resolves when the players are ready', function() {
                    expect(success).not.toHaveBeenCalled();

                    $scope.$apply(function() {
                        $scope.$emit('ready');
                    });

                    expect(success).toHaveBeenCalled();
                });
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

                it('should ping cinema6 with "open"', function() {
                    expect(session.ping).toHaveBeenCalledWith('open');
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

                it('should ping cinema6 with "close"', function() {
                    expect(session.ping).toHaveBeenCalledWith('close');
                });
            });
        });

        describe('google analytics initialization',function(){
            it('app will look for initAnalytics',function(){
                expect(cinema6.init).toHaveBeenCalled();
                expect(session.on.calls[0].args[0]).toEqual('initAnalytics');
            });

            it('will use initAnalytics cb to init ga',function(){
                var cb = session.on.calls[0].args[1];
                $window.location.hostname = 'test';
                cb({
                    accountId : 'abc',
                    clientId  : '123'
                });
                
                expect(trackerSpy.create).toHaveBeenCalledWith('abc',{
                    'name'          : 'c6mr',
                    'clientId'      : '123',
                    'storage'       : 'none',
                    'cookieDomain'  : 'none'
                });

                expect(trackerSpy.set).toHaveBeenCalledWith({
                    'checkProtocolTask': angular.noop
                });
            });

            it('will use parent.hostname if window.hostname is blank',function(){
                $window.location.hostname = '';
                $window.parent = {
                    location : {
                        hostname : 'parent.host'
                     }
                };
                var cb = session.on.calls[0].args[1];
                cb({
                    accountId : 'abc',
                    clientId  : '123'
                });
                expect(trackerSpy.set).toHaveBeenCalledWith({
                    'checkProtocolTask' : angular.noop,
                    'hostname'          : 'parent.host'
                });
            });
            
            it('will use parent.hostname if window.hostname is null',function(){
                $window.location.hostname = null;
                $window.parent = {
                    location : {
                        hostname : 'parent.host'
                     }
                };
                var cb = session.on.calls[0].args[1];
                cb({
                    accountId : 'abc',
                    clientId  : '123'
                });
            
                expect(trackerSpy.set).toHaveBeenCalledWith({
                    'checkProtocolTask' : angular.noop,
                    'hostname'          : 'parent.host'
                });
            });
            
            it('will work if win.hostname is null + win.parent is undefined',function(){
                $window.location.hostname = null;
                delete $window.parent;
                var cb = session.on.calls[0].args[1];
                cb({
                    accountId : 'abc',
                    clientId  : '123'
                });
                expect(trackerSpy.set).toHaveBeenCalledWith({
                    'checkProtocolTask': angular.noop
                });
            });
        });

        describe('mrPreview session handler', function() {
            it('should register handler', function() {
                expect(session.on).toHaveBeenCalledWith('mrPreview:updateMode', jasmine.any(Function));
            });

            it('should refresh the page when the callback is called', function() {
                var cb = session.on.calls[1].args[1];
                spyOn($window.location, 'reload').andReturn(undefined);
                cb();
                expect($window.location.reload).toHaveBeenCalled();
            });
        });
    });
});
