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
                vast;

            function IFace() {
                this.play = jasmine.createSpy('iface.play()');
                this.pause = jasmine.createSpy('iface.pause()');

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

                    $scope = $rootScope.$new();
                    $scope.onDeck = false;
                    $scope.active = false;
                    $scope.config = {
                        data: {
                            autoplay: false
                        }
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
