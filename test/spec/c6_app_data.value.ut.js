(function() {
    'use strict';

    define(['app'], function() {
        describe('c6AppData', function() {
            var $rootScope,
                c6AppDataProvider;

            var cinema6,
                appData,
                deferreds;

            beforeEach(function() {
                appData = {
                    experience: {
                        id: 'foo',
                        data: {}
                    },
                    profile: {
                        device: 'desktop',
                        touch: false
                    }
                };

                deferreds = {
                    getAppData: null
                };

                module('c6.ui', function($provide) {
                    $provide.provider('cinema6', function() {
                        this.adapters = {
                            fixture: {}
                        };

                        this.useAdapter = function() {};

                        this.$get = function($q) {
                            function Cinema6() {
                                this.getAppData = jasmine.createSpy('cinema6.getAppData()')
                                    .andCallFake(function() {
                                        deferreds.getAppData = $q.defer();

                                        return deferreds.getAppData.promise;
                                    });
                            }

                            return new Cinema6();
                        };
                    });
                });

                module('c6.rumble', function($injector) {
                    c6AppDataProvider = $injector.get('c6AppDataProvider');
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');

                    cinema6 = $injector.get('cinema6');
                });
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

            describe('behaviors', function() {
                function c6AppData(mode) {
                    var svc;

                    appData.experience.mode = mode;

                    inject(function($injector) {
                        svc = $injector.invoke(c6AppDataProvider.$get);
                    });

                    $rootScope.$apply(function() {
                        deferreds.getAppData.resolve(appData);
                    });

                    return svc;
                }

                describe('autoplay', function() {
                    it('should be set based on the mode', function() {
                        expect(c6AppData('full').behaviors.autoplay).toBe(false);
                        expect(c6AppData('mobile').behaviors.autoplay).toBe(false);
                        expect(c6AppData('light').behaviors.autoplay).toBe(true);
                    });
                });

                describe('inlineVoteResults', function() {
                    it('should be set based on the mode', function() {
                        expect(c6AppData('full').behaviors.inlineVoteResults).toBe(true);
                        expect(c6AppData('mobile').behaviors.inlineVoteResults).toBe(true);
                        expect(c6AppData('light').behaviors.inlineVoteResults).toBe(false);
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
                        appData.experience.mode = 'full';

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
                        appData.experience.mode = 'light';

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
}());