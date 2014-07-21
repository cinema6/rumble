define(['cards/video', 'services'], function(videoModule, servicesModule) {
    'use strict';

    describe('VideoCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            c6EventEmitter,
            $q,
            VideoCardCtrl;

        var ModuleService,
            ControlsService,
            $log;

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
                $provide.value('ModuleService', {
                    hasModule: jasmine.createSpy('ModuleService.hasModule()')
                });

                $provide.value('$log', {
                    warn: jasmine.createSpy('$log.warn()')
                });

                $provide.value('ControlsService', {
                    bindTo: jasmine.createSpy('ControlsService.bindTo()')
                });
            });

            module(videoModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6EventEmitter = $injector.get('c6EventEmitter');
                $q = $injector.get('$q');

                ModuleService = $injector.get('ModuleService');
                ControlsService = $injector.get('ControlsService');
                $log = $injector.get('$log');

                $scope = $rootScope.$new();
                $scope.config = {
                    data: {
                        autoplay: false
                    }
                };
                $scope.onDeck = false;
                $scope.active = false;
                VideoCardCtrl = $controller('VideoCardController', { $scope: $scope });
            });
        });

        it('should exist', function() {
            expect(VideoCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('initialization', function() {
            describe('if the config already has _data', function() {
                var origData;

                beforeEach(function() {
                    origData = $scope.config._data = {};

                    VideoCardCtrl = $controller('VideoCardController', { $scope: $scope });
                });

                it('should not overwrite the data', function() {
                    expect($scope.config._data).toBe(origData);
                });
            });

            describe('if the config has no _data', function() {
                it('should create some data', function() {
                    expect($scope.config._data).toEqual({
                        playerEvents: {},
                        modules: {
                            ballot: {
                                active: false,
                                vote: null
                            },
                            displayAd: {
                                active: false
                            }
                        }
                    });
                });
            });
        });

        describe('events', function() {
            describe('playerAdd', function() {
                var iface;

                beforeEach(function() {
                    iface = c6EventEmitter({
                        twerk: jasmine.createSpy('iface.twerk()'),
                        play: jasmine.createSpy('iface.play()'),
                        pause: jasmine.createSpy('iface.pause()')
                    });

                    spyOn(iface, 'once').andCallThrough();

                    $scope.$emit('playerAdd', iface);
                });

                it('should attach a listener to the "play" event', function() {
                    expect(iface.once).toHaveBeenCalledWith('play', jasmine.any(Function));
                });

                describe('config._data.modules.ballot.active', function() {
                    var ballot;

                    beforeEach(function() {
                        ballot = $scope.config._data.modules.ballot;
                    });

                    it('should be a computed property that is true when the video is paused or ended and false when there are votes or the video is playing', function() {
                        $scope.$apply(function() {
                            $scope.active = true;
                            iface.paused = true;
                            iface.ended = false;
                        });
                        expect(ballot.active).toBe(false);

                        $scope.$apply(function() {
                            iface.emit('play', iface);
                            iface.paused = false;
                            iface.ended = false;
                        });
                        expect(ballot.active).toBe(false);

                        $scope.$apply(function() {
                            iface.ended = true;
                        });
                        expect(ballot.active).toBe(true);

                        $scope.$apply(function() {
                            iface.paused = true;
                            iface.ended = false;
                        });
                        expect(ballot.active).toBe(true);

                        $scope.$apply(function() {
                            $scope.active = false;
                        });
                        expect(ballot.active).toBe(false);

                        $scope.$apply(function() {
                            $scope.active = true;
                            ballot.vote = 0;
                        });
                        expect(ballot.active).toBe(false);
                    });

                    it('should be temporarily overrideable by VideoCardCtrl.dismissBallot()', function() {
                        $scope.$apply(function() {
                            $scope.active = true;
                            iface.emit('play', iface);
                            iface.emit('play', iface);
                            iface.paused = true;
                            iface.ended = false;
                        });
                        expect(ballot.active).toBe(true);

                        $scope.$apply(function() {
                            VideoCardCtrl.dismissBallot();
                        });
                        expect(ballot.active).toBe(false);

                        $scope.$apply(function() {
                            iface.paused = false;
                            iface.emit('play', iface);
                        });
                        expect(ballot.active).toBe(false);

                        $scope.$apply(function() {
                            iface.ended = true;
                        });
                        expect(ballot.active).toBe(true);
                    });
                });

                describe('when "play" is emitted', function() {
                    beforeEach(function() {
                        iface.emit('play', iface);
                    });

                    it('should set _data.modules.displayAd.active to true', function() {
                        expect($scope.config._data.modules.displayAd.active).toBe(true);
                    });
                });

                it('should attach a listener to the "ready" event', function() {
                    expect(iface.once).toHaveBeenCalledWith('ready', jasmine.any(Function));
                });

                describe('when "ready" is emitted', function() {
                    beforeEach(function() {
                        spyOn($scope, '$watch').andCallThrough();

                        iface.emit('ready', iface);
                    });

                    it('should $watch to see if it is on deck', function() {
                        expect($scope.$watch).toHaveBeenCalledWith('onDeck', jasmine.any(Function));
                    });

                    describe('if onDeck is true', function() {
                        var twerkDeferred;

                        beforeEach(function() {
                            twerkDeferred = $q.defer();

                            iface.twerk.andReturn(twerkDeferred.promise);

                            expect(iface.twerk).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });
                        });

                        it('should twerk the video', function() {
                            expect(iface.twerk).toHaveBeenCalled();
                        });

                        it('should log a warning if the twerk fails', function() {
                            var error = {};

                            $scope.$apply(function() {
                                twerkDeferred.reject(error);
                            });

                            expect($log.warn).toHaveBeenCalledWith(error);
                        });
                    });

                    it('should $watch to see if it is active', function() {
                        expect($scope.$watch).toHaveBeenCalledWith('active', jasmine.any(Function));
                    });

                    describe('active initialization', function() {
                        beforeEach(function() {
                            $rootScope.$digest();
                        });

                        it('should do nothing', function() {
                            expect(iface.play).not.toHaveBeenCalled();
                            expect(iface.pause).not.toHaveBeenCalled();
                        });
                    });

                    describe('when active is true', function() {
                        describe('regardless of autoplay', function() {
                            beforeEach(function() {
                                $scope.$digest();
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                            });

                            it('should bind to the controls', function() {
                                expect(ControlsService.bindTo).toHaveBeenCalledWith(iface);
                            });
                        });

                        describe('if autoplay is false', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                            });

                            it('should not play the video', function() {
                                expect(iface.play).not.toHaveBeenCalled();
                            });
                        });

                        describe('if autoplay is true', function() {
                            beforeEach(function() {
                                $scope.config.data.autoplay = true;
                                $scope.$digest();

                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                            });

                            it('should play the video', function() {
                                expect(iface.play).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when active is false', function() {
                        beforeEach(function() {
                            $scope.$digest();
                            $scope.$apply(function() {
                                $scope.active = true;
                            });

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should pause the video', function() {
                            expect(iface.pause).toHaveBeenCalled();
                        });

                        it('should not bind to the controls', function() {
                            expect(ControlsService.bindTo.callCount).toBe(1);
                        });
                    });
                });
            });
        });

        describe('@public', function() {
            describe('methods', function() {
                describe('hasModule(module)', function() {
                    it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                        VideoCardCtrl.hasModule('ballot');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'ballot');

                        VideoCardCtrl.hasModule('comments');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'comments');
                    });
                });
            });
        });
    });
});
