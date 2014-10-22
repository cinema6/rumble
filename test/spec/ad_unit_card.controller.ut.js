define(['minireel', 'services'], function(minireelModule) {
    'use strict';

    describe('AdUnitCardController', function() {
        var $rootScope,
            $scope,
            $controller,
            c6EventEmitter,
            AdUnitCardCtrl;

        var ModuleService,
            c6ImagePreloader,
            c6AppData;



        function Player() {
            var self = this;

            this.play = jasmine.createSpy('iface.play()')
                .andCallFake(function() {
                    self.emit('play', self);
                });
            this.pause = jasmine.createSpy('iface.pause()')
                .andCallFake(function() {
                    self.emit('pause', self);
                });
            this.load = jasmine.createSpy('iface.loadAd()');
            this.isReady = jasmine.createSpy('iface.isReady()');
            this.paused = true;
            this.currentTime = 0;
            this.duration = 0;
            this.ended = false;

            c6EventEmitter(this);
        }

        beforeEach(function() {
            module(minireelModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: null,
                    profile: {
                        autoplay: true,
                        touch: false
                    },
                    experience: {
                        data: {
                            title: 'Foo'
                        }
                    },
                    behaviors: {
                        canAutoplay: true,
                        separateTextView: false
                    }
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6EventEmitter = $injector.get('c6EventEmitter');

                ModuleService = $injector.get('ModuleService');
                spyOn(ModuleService, 'hasModule').andCallThrough();
                c6ImagePreloader = $injector.get('c6ImagePreloader');
                spyOn(c6ImagePreloader, 'load');
                c6AppData = $injector.get('c6AppData');

                $rootScope.config = {
                    modules: ['displayAd'],
                    data: {
                        autoplay: true,
                        videoid: 'gy1B3agGNxw'
                    },
                    thumbs: {
                        small: 'small.jpg',
                        large: 'large.jpg'
                    }
                };
                $rootScope.profile = {
                    autoplay: true,
                    touch: false
                };
                $scope = $rootScope.$new();
                AdUnitCardCtrl = $controller('AdUnitCardController', { $scope: $scope });
            });
        });

        it('should exist', function() {
            expect(AdUnitCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('initialization', function() {
            describe('if the config already has _data', function() {
                var origData;

                beforeEach(function() {
                    origData = $rootScope.config._data = {};

                    AdUnitCardCtrl = $controller('AdUnitCardController', { $scope: $scope });
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
                            displayAd: {
                                active: false
                            }
                        }
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('onDeck', function() {
                describe('when true', function() {
                    function applyOnDeck() {
                        $scope.$apply(function() {
                            $scope.onDeck = true;
                        });
                    }

                    it('should preload the large thumbnail', function() {
                        applyOnDeck();
                        expect(c6ImagePreloader.load).toHaveBeenCalledWith(['large.jpg']);
                    });

                    it('should not preload anything if there are no thumbs', function() {
                        $rootScope.config.thumbs = null;
                        applyOnDeck();
                        expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                    });

                    it('should call load() if its a VPAID player', function() {
                        var iface = new Player();
                        $scope.$emit('<vpaid-player>:init', iface);
                        applyOnDeck();
                        expect(iface.load).toHaveBeenCalled();
                    });
                });

                describe('when false', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.onDeck = false;
                        });
                    });

                    it('should not preload the large image', function() {
                        expect(c6ImagePreloader.load).not.toHaveBeenCalled();
                    });
                });
            });

            describe('active', function() {
                var iface;

                beforeEach(function() {
                    iface = new Player();
                    $rootScope.$broadcast('<vpaid-player>:init', iface);
                });

                describe('when initialized', function() {
                    beforeEach(function() {
                        $rootScope.$digest();
                    });

                    it('should not play or paused the player', function() {
                        expect(iface.play).not.toHaveBeenCalled();
                    });
                });

                describe('when not active', function() {
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

                describe('when active', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = false;
                        });

                        $scope.$apply(function() {
                            $scope.active = true;
                        });
                    });

                    describe('if the behavior can autoplay and the experience is set to autoplay', function() {
                        it('should play the video', function() {
                            expect(iface.play).toHaveBeenCalled();
                        });
                    });

                    describe('if the experience is set not to autoplay', function() {
                        var currentPlayCalls;

                        beforeEach(function() {
                            currentPlayCalls = iface.play.callCount;

                            $scope.config.data.autoplay = false;

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not play the video', function() {
                            expect(iface.play.callCount).toBe(currentPlayCalls);
                        });
                    });

                    describe('if the device does not support autoplay', function() {
                        var currentPlayCalls;

                        beforeEach(function() {
                            currentPlayCalls = iface.play.callCount;

                            c6AppData.profile.autoplay = false;

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not play the video', function() {
                            expect(iface.play.callCount).toBe(currentPlayCalls);
                        });
                    });

                    describe('if the behavior is not to autoplay', function() {
                        var currentPlayCalls;

                        beforeEach(function() {
                            currentPlayCalls = iface.play.callCount;

                            c6AppData.behaviors.canAutoplay = false;

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not play the video', function() {
                            expect(iface.play.callCount).toBe(currentPlayCalls);
                        });
                    });
                });
            });
        });
    });
});