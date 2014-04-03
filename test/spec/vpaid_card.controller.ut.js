(function() {
    'use strict';

    define(['vpaid_card'], function() {
        describe('VpaidCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                VpaidCardController,
                c6EventEmitter;

            var ModuleService;

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
                this.loadAd = jasmine.createSpy('iface.loadAd()');

                c6EventEmitter(this);
            }

            beforeEach(function() {
                module('c6.rumble.services', function($provide) {
                    $provide.value('ModuleService', {
                        hasModule: jasmine.createSpy('ModuleService.hasModule()')
                    });
                });

                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $log = $injector.get('$log');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    ModuleService = $injector.get('ModuleService');

                    $log.context = function() { return $log; };
                    $scope = $rootScope.$new();
                    $scope.config = {
                        data: {
                            autoplay: true
                        }
                    };
                    $scope.$apply(function() {
                        VpaidCardController = $controller('VpaidCardController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(VpaidCardController).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                describe('if the config already has _data', function() {
                    it('should not overwrite the data', function() {
                        var origData = $scope.config._data = {};

                        VpaidCardController = $controller('VpaidCardController', { $scope: $scope });

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

            describe('@properties', function() {
                describe('showVideo', function() {
                    it('should be true if the card is active', function() {
                        $scope.active = true;
                        expect(VpaidCardController.showVideo).toBe(true);

                        $scope.active = false;
                        expect(VpaidCardController.showVideo).toBe(false);
                    });

                    it('should be false if the display ad is active', function() {
                        $scope.active = true;
                        expect(VpaidCardController.showVideo).toBe(true);

                        $scope.config._data.modules.displayAd.active = true;
                        expect(VpaidCardController.showVideo).toBe(false);
                    });
                });
            });

            describe('@methods', function() {
                describe('hasModule(module)', function() {
                    it('should call ModuleService.hasModule() with the configured modules and the provided module', function() {
                        VpaidCardController.hasModule('displayAd');
                        expect(ModuleService.hasModule).toHaveBeenCalledWith($scope.config.modules, 'displayAd');
                    });
                });

                describe('reset()', function() {
                    var iface;
                    
                    beforeEach(function() {
                        iface = new IFace();

                        $scope.$apply(function() {
                            $scope.$emit('playerAdd', iface);
                        });
                        
                        $scope.config._data.modules.displayAd.active = true;
                        iface.paused = true;

                        VpaidCardController.reset();
                    });
                    
                    it('should hide the displayAd', function() {
                        expect($scope.config._data.modules.displayAd.active).toBe(false);
                    });

                    it('should restart the video from the beginning', function() {
                        expect(iface.play).toHaveBeenCalled();
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

                    spyOn($scope, '$emit').andCallThrough();
                });

                describe('ended', function() {
                    describe('if there is a displayAd', function() {
                        beforeEach(function() {
                            $scope.config._data.modules.displayAd.src = 'foo.jpg';

                            iface.emit('ended', iface);
                        });
                        
                        it('should not $emit the contentEnd event', function() {
                            expect($scope.$emit).not.toHaveBeenCalledWith('<vpaid-card>:contentEnd', $scope.config);
                        });

                        it('should activate the display ad', function() {
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });

                    describe('if there is no displayAd', function() {
                        it('should emit the contentEnd event', function() {
                            iface.emit('ended', iface);

                            expect($scope.$emit).toHaveBeenCalledWith('<vpaid-card>:contentEnd', $scope.config);
                        });
                    });
                });

                describe('play', function() {
                    it('should deactivate the displayAd', function() {
                        iface.emit('play', iface);

                        expect($scope.config._data.modules.displayAd.active).toBe(false);
                    });
                });
            });

            describe('$watchers', function() {
                describe('active', function() {
                    var iface;

                    beforeEach(function() {
                        iface = new IFace();

                        $scope.$apply(function() {
                            $scope.$emit('playerAdd', iface);
                        });
                    });

                    describe('when initialized', function() {
                        it('should not call loadAd', function() {
                            expect(iface.play).not.toHaveBeenCalled();
                        });
                    });

                    describe('when true', function() {
                        it('should play the ad', function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                            expect(iface.play).toHaveBeenCalled();
                        });
                    });

                    describe('when false', function() {
                        it('should pause the ad', function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                            expect(iface.pause).toHaveBeenCalled();
                            expect($scope.config._data.modules.displayAd.active).toBe(true);
                        });
                    });
                });

                describe('onDeck', function() {
                    describe('when true should set the displayAd src', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });
                        });

                        it('to undefined if there is no display ad', function() {
                            expect($scope.config._data.modules.displayAd.src).toBe(undefined);
                        });

                        it('to the url from config', function() {
                            $scope.onDeck = false;
                            $scope.$digest();
                            
                            $scope.$apply(function() {
                                $scope.config.displayAd = 'htpp://test.com/image.jpg';
                                $scope.onDeck = true;
                            });     
                            
                            expect($scope.config._data.modules.displayAd.src).toBe('htpp://test.com/image.jpg');
                        });
                    });
                });
            });
        });
    });
}());