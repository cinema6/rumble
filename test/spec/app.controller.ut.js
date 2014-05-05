(function(){
    'use strict';

    define(['app', 'templates'], function() {
        describe('AppController', function() {
            var $rootScope,
                $scope,
                $q,
                c6State,
                AppCtrl,
                c6Defines,
                tracker;

            var cinema6,
                gsap,
                appData,
                cinema6Session;

            beforeEach(function() {
                gsap = {
                    TweenLite: {
                        ticker: {
                            useRAF: jasmine.createSpy('gsap.TweenLite.ticker.useRAF()')
                        }
                    }
                };
                
                c6Defines = {
                    kTracker : {
                        accountId : 'account1',
                        config    : 'auto'
                    }
                };

                tracker = {
                    create   :  jasmine.createSpy('tracker.create'),
                    send     :  jasmine.createSpy('tracker.send'),
                    event    :  jasmine.createSpy('tracker.event'),
                    pageview :  jasmine.createSpy('tracker.pageview')
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
                    $provide.provider('cinema6', function() {
                        this.adapters = {
                            fixture: [function() {}]
                        };

                        this.useAdapter = jasmine.createSpy('cinema6Provider.useAdapter()');

                        this.$get = function($q) {
                            cinema6 = {
                                init: jasmine.createSpy('cinema6.init()'),
                                getSession: jasmine.createSpy('cinema6.getSiteSession()').and.callFake(function() {
                                    return cinema6._.getSessionDeferred.promise;
                                }),
                                getAppData: jasmine.createSpy('cinema6.getAppData()')
                                    .and.callFake(function() {
                                        return cinema6._.getAppDataDeferred.promise;
                                    }),
                                _: {
                                    getSessionDeferred: $q.defer(),
                                    getAppDataDeferred: $q.defer()
                                }
                            };

                            return cinema6;
                        };
                    });
                });

                module('c6.mrmaker', function($provide) {
                    $provide.value('gsap', gsap);
                });

                inject(function($injector, $controller, c6EventEmitter) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    AppCtrl = $controller('AppController', {
                        tracker        : tracker,
                        c6Defines      : c6Defines,
                        $scope: $scope
                    });

                    cinema6Session = c6EventEmitter({
                        ping: jasmine.createSpy('session.ping()')
                    });
                });
            });

            it('should exist',function() {
                expect(AppCtrl).toBeDefined();
            });

            it('should publish itself to the $scope', function() {
                expect($scope.AppCtrl).toBe(AppCtrl);
            });

            describe('properties', function() {
                var appDataDeferred;

                beforeEach(function() {
                    appDataDeferred = $q.defer();
                });

                describe('config', function() {
                    it('should initially be null', function() {
                        expect(AppCtrl.config).toBeNull();
                    });

                    it('should be the experience when the appData is fetched', function() {
                        $scope.$apply(function() {
                            cinema6._.getAppDataDeferred.resolve(appData);
                        });

                        expect(AppCtrl.config).toBe(appData.experience);
                    });
                });
            });

            describe('cinema6 integration', function() {
                beforeEach(function() {
                    cinema6.init.calls.mostRecent().args[0].setup(appData);
                });

                it('should initialize a session with cinema6', function() {
                    expect(cinema6.init).toHaveBeenCalled();
                });

                it('should configure gsap', function() {
                    expect(gsap.TweenLite.ticker.useRAF).toHaveBeenCalledWith(appData.profile.raf);
                });
            });

            describe('events', function() {
                describe('c6State: stateChangeSuccess', function() {
                    it('should ping the session', function() {
                        expect(cinema6.getSession).not.toHaveBeenCalled();
                        c6State.emit('stateChangeSuccess', c6State.get('manager'), null);
                        $rootScope.$apply(function() {
                            cinema6._.getSessionDeferred.resolve(cinema6Session);
                        });
                        expect(cinema6Session.ping).toHaveBeenCalledWith('stateChange', { name: 'manager' });
                        cinema6.getSession.calls.reset();

                        $rootScope.$apply(function() {
                            c6State.emit('stateChangeSuccess', c6State.get('editor'), c6State.get('manager'));
                        });
                        expect(cinema6.getSession).toHaveBeenCalled();
                        expect(cinema6Session.ping).toHaveBeenCalledWith('stateChange', { name: 'editor' });
                    });
                });
            });

            describe('tracking',function(){
                describe('create',function(){
                    it('should initialize the tracker',function(){
                        expect(tracker.create).toHaveBeenCalledWith('account1','auto');

                    });
                });
                describe('sendPageview',function(){
                    it('does nothing if AppCtrl.config is null',function(){
                        AppCtrl.config = null;
                        AppCtrl.sendPageview('test','Test');
                        expect(tracker.pageview).not.toHaveBeenCalled();
                    });

                    it('calls tracker.pageview if config is set',function(){
                        AppCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        AppCtrl.sendPageview('test','Test');
                        expect(tracker.pageview)
                            .toHaveBeenCalledWith('/mini-reel-maker/test','Some Title - Test');
                    });
                });

                describe('sendEvent',function(){
                    it(' calls tracker.event',function(){
                        AppCtrl.sendEvent('Editor','Click','Add New');
                        expect(tracker.event).toHaveBeenCalledWith('Editor','Click','Add New');
                    });

                });
            });
        });
    });
}());
