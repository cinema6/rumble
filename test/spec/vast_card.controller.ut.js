(function() {
    'use strict';

    define(['vast_card'], function() {
        describe('VastCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6EventEmitter,
                VastCardCtrl;

            var VASTService,
                ControlsService,
                ModuleService,
                vast;

            function IFace() {
                var self = this;

                this.play = jasmine.createSpy('iface.play()')
                    .andCallFake(function() {
                        self.emit('play', self);
                    });
                this.pause = jasmine.createSpy('iface.pause()')
                    .andCallFake(function() {
                        self.emit('pause', self);
                    });

                c6EventEmitter(this);
            }

            beforeEach(function() {
                vast = {
                    video : {
                        mediaFiles:[]
                    },
                    getVideoSrc : jasmine.createSpy('getVideoSrc()').andReturn('http://www.videos.com/video.mp4')
                };

                module('c6.rumble.services', function($provide) {
                    $provide.provider('VASTService', function() {
                        this.$get = function($q) {
                            return {
                                getVAST : jasmine.createSpy('getVAST()').andReturn($q.when(vast))
                            };
                        };

                        this.adServerUrl = angular.noop;
                    });

                    $provide.value('ModuleService', {
                        hasModule: jasmine.createSpy('ModuleService.hasModule()')
                    });

                    $provide.value('ControlsService', {
                        bindTo: jasmine.createSpy('ControlsService.bindTo()')
                    });
                });
                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6EventEmitter = $injector.get('c6EventEmitter');

                    VASTService = $injector.get('VASTService');
                    ControlsService = $injector.get('ControlsService');
                    ModuleService = $injector.get('ModuleService');

                    $scope = $rootScope.$new();
                    $scope.onDeck = false;
                    $scope.active = false;
                    $scope.config = {
                        data: {
                            autoplay: false
                        },
                        displayAd: 'http://2.bp.blogspot.com/-TlM_3FT89Y0/UMzLr7kVykI/AAAAAAAACjs/lKrdhgp6OQg/s1600/brad-turner.jpg'
                    };

                    $scope.$apply(function() {
                        VastCardCtrl = $controller('VastCardController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(VastCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                describe('if the config already has _data', function() {
                    var origData;

                    beforeEach(function() {
                        origData = $scope.config._data = {};

                        VastCardCtrl = $controller('VastCardController', { $scope: $scope });
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

            describe('@properties', function() {
                describe('videoSrc', function() {
                    it('should be null', function() {
                        expect(VastCardCtrl.videoSrc).toBeNull();
                    });
                });

                describe('showVideo', function() {
                    it('should be true if the card is active', function() {
                        $scope.active = true;
                        expect(VastCardCtrl.showVideo).toBe(true);

                        $scope.active = false;
                        expect(VastCardCtrl.showVideo).toBe(false);
                    });

                    it('should also be false if the displayAd module is active', function() {
                        $scope.active = true;
                        expect(VastCardCtrl.showVideo).toBe(true);

                        $scope.config._data.modules.displayAd.active = true;
                        expect(VastCardCtrl.showVideo).toBe(false);
                    });
                });
            });

            describe('@methods', function() {
                var iface;

                beforeEach(function() {
                    iface = new IFace();

                    $scope.$apply(function() {
                        $scope.$emit('playerAdd', iface);
                    });
                });

                describe('reset()', function() {
                    beforeEach(function() {
                        $scope.config._data.modules.displayAd.active = true;
                        iface.currentTime = 20;

                        VastCardCtrl.reset();
                    });

                    it('should hide the displayAd', function() {
                        expect($scope.config._data.modules.displayAd.active).toBe(false);
                    });

                    it('should restart the video from the beginning', function() {
                        expect(iface.currentTime).toBe(0);
                        expect(iface.play).toHaveBeenCalled();
                    });
                });

                describe('hasModule(module)', function() {
                    it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                        VastCardCtrl.hasModule('ballot');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'ballot');

                        VastCardCtrl.hasModule('comments');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'comments');
                    });
                });
            });

            describe('player events', function() {
                var iface;

                beforeEach(function() {
                    iface = new IFace();

                    $scope.$apply(function() {
                        $scope.$emit('playerAdd', iface);
                    });
                });

                describe('ended', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').andCallThrough();
                    });

                    describe('if there is a displayAd', function() {
                        beforeEach(function() {
                            $scope.config._data.modules.displayAd.src = 'foo.jpg';

                            iface.emit('ended', iface);
                        });

                        it('should not $emit the contentEnd event', function() {
                            expect($scope.$emit).not.toHaveBeenCalledWith('<vast-card>:contentEnd', $scope.config);
                        });
                    });

                    describe('if there is no displayAd', function() {
                        beforeEach(function() {
                            iface.emit('ended', iface);
                        });

                        it('should emit the contentEnd event', function() {
                            expect($scope.$emit).toHaveBeenCalledWith('<vast-card>:contentEnd', $scope.config);
                        });
                    });
                });

                describe('pause', function() {
                    describe('if the displayAd module is present', function() {
                        beforeEach(function() {
                            spyOn(VastCardCtrl, 'hasModule')
                                .andCallFake(function(module) {
                                    if (module === 'displayAd') { return true; }

                                    return false;
                                });

                            iface.emit('pause', iface);
                        });

                        it('should activate the displayAd', function() {
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });

                    describe('if the displayAd module is not present', function() {
                        beforeEach(function() {
                            spyOn(VastCardCtrl, 'hasModule')
                                .andCallFake(function(module) {
                                    if (module === 'displayAd') { return false; }

                                    return true;
                                });

                            iface.emit('pause', iface);
                        });

                        it('should not activate the displayAd', function() {
                            expect($scope.config._data.modules.displayAd.active).not.toBe(true);
                        });
                    });
                });

                describe('play', function() {
                    beforeEach(function() {
                        iface.emit('play', iface);
                    });

                    it('should deactivate the displayAd', function() {
                        iface.emit('pause', iface);
                        iface.emit('play', iface);

                        expect($scope.config._data.modules.displayAd.active).toBe(false);
                    });
                });
            });

            describe('$watchers', function() {
                describe('active', function() {
                    describe('if there is no iface', function() {
                        it('should not to do anything destructive', function() {
                            expect(function() {
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                            }).not.toThrow();
                        });
                    });

                    describe('if there is an iface', function() {
                        var iface;

                        beforeEach(function() {
                            iface = new IFace();

                            $scope.$apply(function() {
                                $scope.$emit('playerAdd', iface);
                            });
                        });

                        describe('when initialized', function() {
                            it('should not pause the player', function() {
                                expect(iface.pause).not.toHaveBeenCalled();
                            });
                        });

                        describe('when true', function() {
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

                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });
                                });

                                it('should play the video', function() {
                                    expect(iface.play).toHaveBeenCalled();
                                });

                                it('should only autoplay the video once', function() {
                                    $scope.$apply(function() {
                                        $scope.active = false;
                                    });

                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });

                                    expect(iface.play.callCount).toBe(1);
                                });
                            });

                            describe('in either case', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });
                                });

                                it('should bind the interface to the controls', function() {
                                    expect(ControlsService.bindTo).toHaveBeenCalledWith(iface);
                                });
                            });
                        });

                        describe('when false', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                $scope.$apply(function() {
                                    $scope.active = false;
                                });
                            });

                            it('should pause the player', function() {
                                expect(iface.pause).toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('onDeck', function() {
                    describe('when true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });
                        });

                        it('should call getVAST on the vast service', function() {
                            expect(VASTService.getVAST).toHaveBeenCalled();
                        });

                        // TODO: Fetch displayAd from the ad server
                        it('should copy the displayAd src to the private data', function() {
                            expect($scope.config._data.modules.displayAd.src).toBe('http://2.bp.blogspot.com/-TlM_3FT89Y0/UMzLr7kVykI/AAAAAAAACjs/lKrdhgp6OQg/s1600/brad-turner.jpg');
                        });

                        describe('after the promise is resolved', function() {
                            it('should set videoSrc to vast video ad url', function() {
                                expect(vast.getVideoSrc).toHaveBeenCalledWith('video/mp4');
                                expect(VastCardCtrl.videoSrc).toBe('http://www.videos.com/video.mp4');
                            });
                        });
                    });

                    describe('when false', function() {
                        it('should not getVAST on the vast service', function() {
                            expect(VASTService.getVAST).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
