(function() {
    'use strict';

    define(['vpaid_card'], function() {
        describe('<vpaid-card></vpaid-card>', function() {
            var $rootScope,
                $scope,
                $compile,
                $log,
                $q,
                VPAIDService,
                c6EventEmitter;

            function MockPlayer() {
                var self = this,
                    deferred = $q.defer();

                c6EventEmitter(self);

                Object.defineProperties(this, {
                    currentTime: {
                        get: function() {
                            return self.getCurrentTime();
                        }
                    }
                });

                this.play = jasmine.createSpy('player.play()');
                this.pause = jasmine.createSpy('player.pause()');
                this.loadAd = jasmine.createSpy('player.loadAd()');
                this.startAd = jasmine.createSpy('player.startAd()');
                this.insertHTML = jasmine.createSpy('player.insertHTML()')
                    .andReturn(deferred.promise);
                this.getCurrentTime = function() { return 2; };
                this.getDuration = function() { return 5; };
                this.getAdProperties = function() {};
                this.getDisplayBanners = function() {};
                this.setVolume = function(volume) {};
                this.resumeAd = jasmine.createSpy('player.resumeAd()');
                this.stopAd = jasmine.createSpy('player.stopAd()');
                this.destroy = jasmine.createSpy('player.destroy()');
                this.isC6VpaidPlayer = function() {};
            }

            beforeEach(function() {
                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', {
                        mode: 'full'
                    });

                    $provide.provider('VPAIDService', function() {
                        this.$get = [function() {
                            var service = {};
                            service.createPlayer = function() {
                                return new MockPlayer();
                            };
                            return service;
                        }];

                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    VPAIDService = $injector.get('VPAIDService');

                    $scope = $rootScope.$new();
                    $scope.config = {
                        data: {}
                    };
                    $scope.profile = {
                        touch: false
                    };
                    $log.context = function() { return $log; };
                });
            });

            describe('initialization', function() {
                it('should $emit the playerAdd event with an interface', function() {
                    spyOn($scope, '$emit').andCallThrough();

                    $scope.$apply(function() {
                        $compile('<vpaid-card></vpaid-card>')($scope);
                    });

                    expect($scope.$emit).toHaveBeenCalledWith('playerAdd', jasmine.any(Object));
                });

                it('should create the player', function() {
                    var _player = VPAIDService.createPlayer();

                    spyOn(VPAIDService, 'createPlayer').andReturn(_player);

                    $scope.$apply(function() {
                        $compile('<vpaid-card></vpaid-card>')($scope);
                    });

                    expect(VPAIDService.createPlayer).toHaveBeenCalled();
                    expect(_player.insertHTML).toHaveBeenCalled();
                });
            });

            describe('when player says it\'s ready', function() {
                var iface,
                    _player;

                beforeEach(function() {
                    _player = VPAIDService.createPlayer();

                    spyOn(VPAIDService, 'createPlayer').andReturn(_player);

                    $scope.$on('playerAdd', function(event, playerInterface) {
                        iface = playerInterface;
                    });

                    $scope.$apply(function() {
                        $compile('<vpaid-card></vpaid-card>')($scope);
                    });

                    spyOn(iface, 'emit').andCallThrough();

                    _player.emit('ready', _player);
                });

                it('the iface should emit ready', function() {
                    expect(iface.emit).toHaveBeenCalledWith('ready', iface);
                });

                describe('and when the player fires "play"', function() {
                    beforeEach(function() {
                        spyOn(_player, 'getDuration').andCallThrough();

                        _player.emit('play', _player);
                    });

                    it('should set the iface.paused to false', function() {
                        expect(iface.paused).toBe(false);
                    });

                    it('should getDuration', function() {
                        expect(_player.getDuration).toHaveBeenCalled();
                        expect(iface.duration).toBe(5);
                    });

                    it('the iface should emit "play"', function() {
                        expect(iface.emit).toHaveBeenCalledWith('play', iface);
                    });
                });

                describe('and when the player fires "pause"', function() {
                    beforeEach(function() {
                        _player.emit('pause', _player);
                    });

                    it('should set the iface.paused to true', function() {
                        expect(iface.paused).toBe(true);
                    });

                    it('the iface should emit "pause"', function() {
                        expect(iface.emit).toHaveBeenCalledWith('pause', iface);
                    });
                });

                describe('and when the player fires "ended"', function() {
                    beforeEach(function() {
                        _player.emit('ended', _player);
                    });

                    it('should set the iface.ended to true', function() {
                        expect(iface.ended).toBe(true);
                    });

                    it('the iface should emit "ended"', function() {
                        expect(iface.emit).toHaveBeenCalledWith('ended', iface);
                    });
                });

                describe('and when the player fires "companionsReady"', function() {
                    it('the iface should emit "ended"', function() {
                        _player.emit('companionsReady', _player);
                        expect(iface.emit).toHaveBeenCalledWith('getCompanions', _player);
                    });
                });
            });

            describe('playerInterface', function() {
                var iface,
                    _player;

                beforeEach(function() {
                    _player = VPAIDService.createPlayer();

                    spyOn(VPAIDService, 'createPlayer').andReturn(_player);
                    spyOn(_player, 'on').andCallThrough();

                    $scope.$on('playerAdd', function(event, playerInterface) {
                        iface = playerInterface;
                    });

                    $scope.$apply(function() {
                        $compile('<vpaid-card></vpaid-card>')($scope);
                    });
                });

                describe('currentTime', function() {
                    describe('getting', function() {
                        describe('if the player is not ready', function() {
                            it('should return 0', function() {
                                expect(iface.currentTime).toBe(0);
                            });
                        });

                        describe('if the player is ready', function() {
                            it('should return the current time', function() {
                                _player.emit('ready', _player);
                                expect(iface.currentTime).toBe(2);
                            });
                        });
                    });
                    describe('setting', function() {
                        it('should throw an error cuz you can\'t set the time on VPAID ads', function() {
                            expect(function() {
                                iface.currentTime = 3;
                            }).toThrow('setting a property that has only a getter');

                            _player.emit('ready', _player);

                            expect(function() {
                                iface.currentTime = 3;
                            }).toThrow('setting a property that has only a getter');
                        });
                    });
                });

                describe('duration', function() {
                    describe('getting', function() {
                        describe('if the player is not ready', function() {
                            it('should return NaN', function() {
                                expect(iface.duration).toBeNaN();
                            });
                        });

                        describe('if the player is ready and an ad has loaded', function() {
                            it('should return the duration', function() {
                                _player.emit('ready', _player);
                                _player.emit('play', _player);
                                expect(iface.duration).toBe(5);
                            });
                        });
                    });
                    describe('setting', function() {
                        it('should throw an error cuz you can\'t set the duration on VPAID ads', function() {
                            expect(function() {
                                iface.duration = 3;
                            }).toThrow('setting a property that has only a getter');
                        });
                    });
                });

                describe('paused', function() {
                    describe('getting', function() {
                        it('should be true by default', function() {
                            expect(iface.paused).toBe(true);
                        });

                        describe('if the player is ready and an ad has been paused', function() {
                            it('should return true', function() {
                                _player.emit('ready', _player);
                                _player.emit('pause', _player);
                                expect(iface.paused).toBe(true);
                            });
                        });
                    });
                    describe('setting', function() {
                        it('should throw an error cuz it\'s not publicly accessible', function() {
                            expect(function() {
                                iface.paused = true;
                            }).toThrow('setting a property that has only a getter');
                        });
                    });
                });

                describe('ended', function() {
                    describe('getting', function() {
                        describe('if the player is not ready', function() {
                            it('should return false', function() {
                                expect(iface.ended).toBe(false);
                            });
                        });

                        describe('if the player is ready and an ad has ended', function() {
                            it('should return the duration', function() {
                                _player.emit('ready', _player);
                                _player.emit('ended', _player);
                                expect(iface.ended).toBe(true);
                            });
                        });
                    });
                    describe('setting', function() {
                        it('should throw an error cuz it\'s not publicly accessible', function() {
                            expect(function() {
                                iface.ended = true;
                            }).toThrow('setting a property that has only a getter');
                        });
                    });
                });

                describe('getType', function() {
                    it('should return "ad"', function() {
                        expect(iface.getType()).toBe('ad');
                    });
                });

                describe('getVideoId', function() {
                    it('should return the id from the directive attribute', function() {
                        expect(iface.getVideoId()).toBe(undefined);

                        $scope.$apply(function() {
                            $compile('<vpaid-card videoid="testId"></vpaid-card>')($scope);
                        });

                        expect(iface.getVideoId()).toBe('testId');
                    });
                });

                describe('isReady', function() {
                    it('should return false if player hasn\'t emitted "ready"', function() {
                        expect(iface.isReady()).toBe(false);
                    });

                    it('should return true once player has emitted "ready"', function() {
                        _player.emit('ready', _player);
                        expect(iface.isReady()).toBe(true);
                    });
                });

                describe('play', function() {
                    beforeEach(function() {
                        _player.emit('ready', _player);
                        spyOn(iface, 'loadAd').andCallThrough();
                        iface.play();
                    });

                    it('should not call startAd() if the adLoaded promise has not resolved', function() {
                        expect(_player.startAd).not.toHaveBeenCalled();
                    });

                    it('should call startAd() on the player when promise is resolved', function() {
                        $scope.$apply(function() {
                            _player.emit('adLoaded', _player);
                        });
                        expect(_player.startAd).toHaveBeenCalled();
                    });

                    it('should call resumeAd() if the player is paused', function() {
                        $scope.$apply(function() {
                            _player.emit('adLoaded', _player);
                            iface.pause();
                            iface.play();
                        });
                        expect(_player.resumeAd).toHaveBeenCalled();
                    });

                    it('should call loadAd if it has not been called yet', function() {
                        expect(iface.loadAd).toHaveBeenCalled();
                    });

                    it('should not call loadAd if it has already been called', function() {
                        iface.play();
                        iface.play();
                        iface.play();
                        expect(iface.loadAd.callCount).toBe(1);
                    });
                });

                describe('pause', function() {
                    beforeEach(function() {
                        _player.emit('ready', _player);
                        iface.pause();
                    });

                    it('should not call pause() if ad is not loaded', function() {
                        expect(_player.pause).not.toHaveBeenCalled();
                    });

                    it('should call pause() if ad is loaded', function() {
                        $scope.$apply(function() {
                            _player.emit('adLoaded', _player);
                        });
                        expect(_player.pause).toHaveBeenCalled();
                    });
                });

                describe('loadAd', function() {
                    beforeEach(function() {
                        _player.emit('ready', _player);
                        iface.loadAd();
                    });

                    it('should not call loadAd() if player is not ready', function() {
                        expect(_player.pause).not.toHaveBeenCalled();
                    });

                    it('should call loadAd() if player is ready', function() {
                        $scope.$apply(function() {
                            _player.emit('adPlayerReady', _player);
                        });
                        expect(_player.loadAd).toHaveBeenCalled();
                    });
                });

                describe('destroy', function() {
                    it('should not call destroy() on the player if player isn\'t ready', function() {
                        iface.destroy();
                        expect(_player.destroy).not.toHaveBeenCalled();
                    });

                    it('should call destroy() on the player if it\'s ready', function() {
                        _player.emit('ready', _player);
                        iface.destroy();
                        expect(_player.destroy).toHaveBeenCalled();
                    });
                });

                describe('twerk', function() {
                    var success = jasmine.createSpy('promise success'),
                        failure = jasmine.createSpy('promise failure');

                    it('should return a promise', function() {
                        expect(iface.twerk().then).toEqual(jasmine.any(Function));
                    });

                    it('should reject the promise', function() {
                        $scope.$apply(function() {
                            iface.twerk().catch(failure);
                        });

                        expect(failure).toHaveBeenCalledWith('Twerking is not supported in the VPAID player.');
                    });

                    it('should never successfully return', function() {
                        $scope.$apply(function() {
                            iface.twerk().then(success);
                        });

                        expect(success).not.toHaveBeenCalled();
                    });
                });

                describe('webHref', function() {
                    it('should always be null cuz we never get one', function() {
                        expect(iface.webHref).toBe(null);
                        _player.emit('ready', _player);
                        _player.emit('play', _player);
                        expect(iface.webHref).toBe(null);
                    });
                });

                describe('twerked', function() {
                    it('should always be false cuz twerking isn\'t supported with Flash', function() {
                        expect(iface.twerked).toBe(false);
                        _player.emit('ready', _player);
                        _player.emit('play', _player);
                        expect(iface.twerked).toBe(false);
                    });
                });
            });
        });
    });
}());
