define(['app','c6uilib'], function(appModule, c6uilibModule) {
    'use strict';

    describe('c6AppData', function() {
        var $injector,
            $rootScope,
            c6AppDataProvider;

        var cinema6,
            $httpBackend,
            appData,
            deferreds,
            responsive, responsive1,
            session;

        beforeEach(function() {
            session = {
                ping: jasmine.createSpy('session.ping()'),
                on: jasmine.createSpy('session.on()')
            };

            responsive = {
                full: {
                    width: '50%',
                    height: '100px'
                },
                light: {
                    minHeight: '75%',
                    padding: '200px'
                }
            };

            responsive1 = {
                full: {
                    'padding-top': '50%',
                    height: '100px',
                    overflow: 'hidden'
                },
                light: {
                    'padding-top': '60%',
                    height: '20px'
                }
            };

            appData = {
                experience: {
                    id: 'foo',
                    data: {
                        adConfig: {}
                    }
                },
                profile: {
                    device: 'desktop',
                    touch: false
                }
            };

            deferreds = {
                getAppData: null
            };

            module(c6uilibModule.name, function($provide) {
                $provide.provider('cinema6', function() {
                    this.adapters = {
                        fixture: {}
                    };

                    this.useAdapter = function() {};

                    this.$get = function($q) {
                        function Cinema6() {
                            this.getAppData = jasmine.createSpy('cinema6.getAppData()')
                                .and.callFake(function() {
                                    deferreds.getAppData = $q.defer();

                                    return deferreds.getAppData.promise;
                                });

                            this.getSession = jasmine.createSpy('cinema6.getSession()')
                                .and.callFake(function() {
                                    deferreds.getSession = $q.defer();

                                    return deferreds.getSession.promise;
                                });
                        }

                        return new Cinema6();
                    };
                });
            });

            module(appModule.name, function($injector) {
                c6AppDataProvider = $injector.get('c6AppDataProvider');
            });

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                cinema6 = $injector.get('cinema6');
            });

            $httpBackend.expectGET('config/responsive-0.json')
                .respond(200, responsive);
        });

        it('should exist', inject(function(c6AppData) {
            expect(c6AppData).toEqual({ mode: null });
        }));

        it('should get the appData from cinema6', inject(function(c6AppData) {
            expect(c6AppData).toBeDefined();
            expect(cinema6.getAppData).toHaveBeenCalled();
        }));

        it('should copy the app data to itself when it gets it', inject(function(c6AppData) {
            $rootScope.$apply(function() {
                deferreds.getAppData.resolve(appData);
            });

            expect(c6AppData).toEqual(jasmine.objectContaining(appData));
        }));

        it('should create an adConfig if one is not present', inject(function(c6AppData) {
            delete appData.experience.data.adConfig;

            $rootScope.$apply(function() {
                deferreds.getAppData.resolve(appData);
            });

            expect(c6AppData.experience.data.adConfig).toEqual({
                video: {
                    firstPlacement: 1,
                    frequency: 3,
                    waterfall: 'cinema6',
                    skip: 6
                },
                display: {
                  waterfall: 'cinema6'
                }
            });
        }));

        it('should set the version to 0 if there is none', inject(function(c6AppData) {
            $rootScope.$apply(function() {
                deferreds.getAppData.resolve(appData);
            });

            expect(c6AppData.version).toBe(0);
        }));

        it('should not overwrite a version if there is one', inject(function(c6AppData) {
            appData.version = 1;

            $httpBackend.resetExpectations();
            $httpBackend.expectGET('config/responsive-1.json')
                .respond(200, responsive1);

            $rootScope.$apply(function() {
                deferreds.getAppData.resolve(appData);
            });

            expect(c6AppData.version).toBe(1);
        }));

        describe('providing responsive styles', function() {
            beforeEach(function() {
                appData.experience.data.mode = 'full';
            });

            it('should ping cinema6 with responsive styles based on mode', inject(function(c6AppData) {
                /* jshint unused:false */
                $rootScope.$apply(function() {
                    deferreds.getAppData.resolve(appData);
                });
                $httpBackend.flush();
                $rootScope.$apply(function() {
                    deferreds.getSession.resolve(session);
                });

                expect(session.ping).toHaveBeenCalledWith('responsiveStyles', responsive.full);
            }));

            it('should send an empty object if there are no styles', inject(function(c6AppData) {
                /* jshint unused:false */

                appData.experience.data.mode = 'foo';

                $rootScope.$apply(function() {
                    deferreds.getAppData.resolve(appData);
                });
                $httpBackend.flush();
                $rootScope.$apply(function() {
                    deferreds.getSession.resolve(session);
                });

                expect(session.ping).toHaveBeenCalledWith('responsiveStyles', null);
            }));

            describe('if an api version is provided', function() {
                beforeEach(function() {
                    appData.version = 1;

                    $httpBackend.resetExpectations();
                    $httpBackend.expectGET('config/responsive-1.json')
                        .respond(200, responsive1);

                    $injector.get('c6AppData');

                    $rootScope.$apply(function() {
                        deferreds.getAppData.resolve(appData);
                    });
                    $httpBackend.flush();
                    $rootScope.$apply(function() {
                        deferreds.getSession.resolve(session);
                    });
                });

                it('should ping cinema6 with responsive styles based on the mode', function() {
                    expect(session.ping).toHaveBeenCalledWith('responsiveStyles', responsive1.full);
                });
            });
        });

        describe('updating the experience', function() {
            it('should change the c6AppData.experience', inject(function(c6AppData) {
                var callback;

                $rootScope.$apply(function() {
                    deferreds.getAppData.resolve(appData);
                });
                $httpBackend.flush();
                $rootScope.$apply(function() {
                    deferreds.getSession.resolve(session);
                });

                callback = session.on.calls.argsFor(0)[1];

                callback({data:'foo'});

                expect(session.on).toHaveBeenCalled();
                expect(c6AppData.experience).toEqual({data:'foo'});
            }));
        });

        describe('behaviors', function() {
            function c6AppData(mode) {
                var svc;

                appData.experience.data.mode = mode;

                $httpBackend.whenGET('config/responsive-0.json')
                    .respond(200, {});

                inject(function($injector) {
                    svc = $injector.invoke(c6AppDataProvider.$get);
                });

                $rootScope.$apply(function() {
                    deferreds.getAppData.resolve(appData);
                });

                return svc;
            }

            describe('canAutoplay', function() {
                it('should be set based on the mode', function() {
                    expect(c6AppData('full').behaviors.canAutoplay).toBe(true);
                    expect(c6AppData('mobile').behaviors.canAutoplay).toBe(false);
                    expect(c6AppData('light').behaviors.canAutoplay).toBe(true);
                    expect(c6AppData('lightbox').behaviors.canAutoplay).toBe(true);
                    expect(c6AppData('lightbox-playlist').behaviors.canAutoplay).toBe(true);
                });
            });

            describe('inlineVoteResults', function() {
                it('should be set based on the mode', function() {
                    expect(c6AppData('full').behaviors.inlineVoteResults).toBe(false);
                    expect(c6AppData('mobile').behaviors.inlineVoteResults).toBe(true);
                    expect(c6AppData('light').behaviors.inlineVoteResults).toBe(false);
                    expect(c6AppData('lightbox').behaviors.inlineVoteResults).toBe(false);
                    expect(c6AppData('lightbox-playlist').behaviors.inlineVoteResults).toBe(false);
                });
            });

            describe('separateTextView', function() {
                it('should be set based on the mode', function() {
                    expect(c6AppData('full').behaviors.separateTextView).toBe(false);
                    expect(c6AppData('mobile').behaviors.separateTextView).toBe(false);
                    expect(c6AppData('light').behaviors.separateTextView).toBe(false);
                    expect(c6AppData('lightbox').behaviors.separateTextView).toBe(false);
                    expect(c6AppData('lightbox-playlist').behaviors.separateTextView).toBe(false);
                });
            });

            describe('fullscreen', function() {
                it('should be set based on the mode', function() {
                    expect(c6AppData('full').behaviors.fullscreen).toBe(true);
                    expect(c6AppData('mobile').behaviors.fullscreen).toBe(true);
                    expect(c6AppData('light').behaviors.fullscreen).toBe(false);
                    expect(c6AppData('lightbox').behaviors.fullscreen).toBe(true);
                    expect(c6AppData('lightbox-playlist').behaviors.fullscreen).toBe(true);
                });
            });

            describe('showsCompanionWithVideoAd', function() {
                it('should be set based on the mode', function() {
                    ['full', 'mobile', 'light'].forEach(function(mode) {
                        expect(c6AppData(mode).behaviors.showsCompanionWithVideoAd).toBe(false);
                    });
                    ['lightbox', 'lightbox-playlist', 'solo-ads'].forEach(function(mode) {
                        expect(c6AppData(mode).behaviors.showsCompanionWithVideoAd).toBe(true);
                    });
                });
            });
        });

        describe('mode', function() {
            it('should be initialized as null', inject(function(c6AppData) {
                expect(c6AppData.mode).toBeNull();
            }));

            describe('if the device is a phone', function() {
                var c6AppData;

                beforeEach(function() {
                    appData.profile.device = 'phone';
                    appData.experience.data.mode = 'full';

                    inject(function($injector) {
                        c6AppData = $injector.get('c6AppData');
                    });

                    $rootScope.$apply(function() {
                        deferreds.getAppData.resolve(appData);
                    });
                });

                it('should be "mobile"', function() {
                    expect(c6AppData.mode).toBe('mobile');
                });
            });

            describe('if the experience has no mode', function() {
                var c6AppData;

                beforeEach(function() {
                    inject(function($injector) {
                        c6AppData = $injector.get('c6AppData');
                    });

                    $rootScope.$apply(function() {
                        deferreds.getAppData.resolve(appData);
                    });
                });

                it('should be "full"', function() {
                    expect(c6AppData.mode).toBe('full');
                });
            });

            describe('if the experience has a mode set', function() {
                var c6AppData;

                beforeEach(function() {
                    appData.experience.data.mode = 'light';

                    inject(function($injector) {
                        c6AppData = $injector.get('c6AppData');
                    });

                    $rootScope.$apply(function() {
                        deferreds.getAppData.resolve(appData);
                    });
                });

                it('should use the explicitly set mode', function() {
                    expect(c6AppData.mode).toBe('light');
                });
            });
        });
    });
});
