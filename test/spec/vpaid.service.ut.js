(function() {
    'use strict';

    define(['services'], function() {
        describe('VPAIDService', function() {
            var VPAIDService,
                VPAIDServiceProvider,
                $rootScope,
                $window,
                $log,
                $httpBackend,
                c6EventEmitter;

            var _provider,
                _service;

            var isCinema6playerMock = true;

            function MockFlashPlayer() {
                c6EventEmitter(this);

                this.loadAd = jasmine.createSpy('player.loadAd()');
                this.pauseAd = jasmine.createSpy('player.pause()');
                this.getDisplayBanners = jasmine.createSpy('player.getDisplayBanners()');
                this.setVolume = jasmine.createSpy('player.setVolume()');
                this.resumeAd = jasmine.createSpy('player.resumeAd()');
                this.stopAd = jasmine.createSpy('player.resumeAd()');
                this.isCinema6player = function() { return isCinema6playerMock; };
                this.getAdProperties = jasmine.createSpy('player.getAdProperties()').andReturn({
                    width: 640,
                    height: 360,
                    adLinear: true,
                    adExpanded: false,
                    adRemainingTime: 3,
                    adVolume: 50,
                    adCurrentTime: 2,
                    adDuration: 5
                });
            }

            beforeEach(function() {
                module('c6.ui');

                module('c6.rumble.services', function($injector) {
                    VPAIDServiceProvider = $injector.get('VPAIDServiceProvider');

                    _provider = VPAIDServiceProvider._private;
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $window = $injector.get('$window');
                    $log = $injector.get('$log');
                    $log.context = function() { return $log; };
                    $httpBackend = $injector.get('$httpBackend');

                    VPAIDService = $injector.get('VPAIDService');
                    c6EventEmitter = $injector.get('c6EventEmitter');

                    _service = VPAIDService._private;
                });

            });

            describe('the provider', function() {
                it('should exist', function() {
                    expect(VPAIDServiceProvider).toEqual(jasmine.any(Object));
                });

                it('should publish its _private object for testing', function() {
                    expect(_provider).toEqual(jasmine.any(Object));
                });

                describe('@public methods', function() {
                    describe('adServerUrl(url)', function() {
                        it('should set _private.serverUrl to the provided URL', function() {
                            VPAIDServiceProvider.adServerUrl('http://www.foo.com/test');

                            expect(_provider.serverUrl).toBe('http://www.foo.com/test');
                        });
                    });
                });
            });

            describe('the service', function() {
                it('should exist', function() {
                    expect(VPAIDService).toEqual(jasmine.any(Object));
                });

                it('should publish its _private object for testing', function() {
                    expect(_service).toEqual(jasmine.any(Object));
                });

                describe('@public methods', function() {
                    describe('createPlayer()', function() {
                        var playerElementMock = [],
                            parentElementMock = [],
                            mockFlashPlayer,
                            messageHandler;

                        beforeEach(function() {
                            angular._element = angular.element;
                            mockFlashPlayer = new MockFlashPlayer();
                            parentElementMock.prepend = jasmine.createSpy('$parentElement.prepend()');
                            playerElementMock.prepend = jasmine.createSpy('element$.prepend()');
                            playerElementMock.find = jasmine.createSpy('element$.find()').andReturn([mockFlashPlayer]);

                            spyOn(angular, 'element').andCallFake(function(el) {
                                return playerElementMock;
                            });

                            spyOn($window, 'addEventListener').andCallFake(function(event, listener) {
                                messageHandler = listener;
                            });
                        });

                        afterEach(function() {
                            angular.element = angular._element;
                            delete angular._element;
                        })

                        it('should fail without parentElement', function() {
                            expect(function() {
                                VPAIDService.createPlayer('testId',{})
                            }).toThrow('Parent element is required for vpaid.createPlayer');
                        });

                        it('should succeed when passed a parentElement', function() {
                            var result = VPAIDService.createPlayer('testId',{},parentElementMock);

                            expect(parentElementMock.prepend).toHaveBeenCalledWith(playerElementMock);
                            expect($window.addEventListener).toHaveBeenCalled();
                        });

                        describe('player methods', function() {
                            var player;

                            beforeEach(function() {
                                VPAIDServiceProvider.adServerUrl('http://www.foo.com/test');
                                player = VPAIDService.createPlayer('testId',{},parentElementMock);
                            });

                            describe('insertHTML()', function() {
                                it('should return a promise', function() {
                                    expect(player.insertHTML().then).toEqual(jasmine.any(Function));
                                });

                                it('should insert HTML into the player element', function() {
                                    $httpBackend.expectGET('/views/vpaid_object_embed.html')
                                        .respond(200, '<object></object>');
                                    
                                    player.insertHTML();
                                    
                                    $httpBackend.flush();
                                    
                                    expect(playerElementMock.prepend).toHaveBeenCalledWith('<object></object>');
                                });
                            });

                            describe('loadAd()', function() {
                                it('should call loadAd() on the flash object', function() {
                                    player.loadAd();
                                    expect(mockFlashPlayer.loadAd).toHaveBeenCalled();
                                });
                            });

                            describe('pause()', function() {
                                it('should call pauseAd() on the flash object', function() {
                                    player.pause();
                                    expect(mockFlashPlayer.pauseAd).toHaveBeenCalled();
                                });
                            });

                            describe('getAdProperties()', function() {
                                it('should call getAdProperties() on the flash object', function() {
                                    player.getAdProperties();
                                    expect(mockFlashPlayer.getAdProperties).toHaveBeenCalled();
                                });
                            });

                            describe('getDisplayBanners()', function() {
                                it('should call getDisplayBanners() on the flash object', function() {
                                    player.getDisplayBanners();
                                    expect(mockFlashPlayer.getDisplayBanners).toHaveBeenCalled();
                                });
                            });

                            describe('setVolume()', function() {
                                it('should call setVolume() on the flash object', function() {
                                    player.setVolume(100);
                                    expect(mockFlashPlayer.setVolume).toHaveBeenCalledWith(100);
                                });
                            });

                            describe('resumeAd()', function() {
                                it('should call resumeAd() on the flash object', function() {
                                    player.resumeAd();
                                    expect(mockFlashPlayer.resumeAd).toHaveBeenCalled();
                                });
                            });

                            describe('stopAd()', function() {
                                it('should call stopAd() on the flash object', function() {
                                    player.stopAd();
                                    expect(mockFlashPlayer.stopAd).toHaveBeenCalled();
                                });
                            });

                            describe('isC6VpaidPlayer()', function() {
                                it('should call isCinema6player() on the flash object', function() {
                                    spyOn(mockFlashPlayer, 'isCinema6player').andCallThrough();
                                    player.isC6VpaidPlayer();
                                    expect(mockFlashPlayer.isCinema6player).toHaveBeenCalled();
                                });
                            });

                            describe('getCurrentTime()', function() {
                                it('should call getAdProperties().adCurrentTime on the flash object', function() {
                                    var time = player.getCurrentTime();
                                    expect(mockFlashPlayer.getAdProperties).toHaveBeenCalled();
                                    expect(time).toBe(2);
                                });
                            });

                            describe('getDuration()', function() {
                                it('should call getAdProperties.adDuration on the flash object', function() {
                                    var duration = player.getDuration();
                                    expect(mockFlashPlayer.getAdProperties).toHaveBeenCalled();
                                    expect(duration).toBe(5);
                                });
                            });
                        });

                        describe('player events', function() {
                            var player;

                            beforeEach(function() {
                                player = VPAIDService.createPlayer('testId',{},parentElementMock);
                                spyOn(player, 'emit').andCallThrough();
                            });

                            describe('ready', function() {
                                it('should emit when isCinema6player returns true', function() {
                                    var emitReady = function() {
                                        setInterval(function() {
                                            // console.log(player.isC6VpaidPlayer());
                                            if(player.player && player.player.isCinema6player()) {
                                                player.emit('ready', player);
                                            }
                                        }, 100);
                                    };

                                    jasmine.Clock.useMock();

                                    isCinema6playerMock = false;

                                    emitReady();
                                    expect(player.emit).not.toHaveBeenCalledWith('ready', player);

                                    jasmine.Clock.tick(110);
                                    expect(player.emit).not.toHaveBeenCalledWith('ready', player);

                                    isCinema6playerMock = true;
                                    jasmine.Clock.tick(210);
                                    expect(player.emit).toHaveBeenCalledWith('ready', player);
                                });

                                it('should not emit when id doesn\'t match', function() {
                                    var message = {
                                        data: '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "wrongId" } }',
                                    };

                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ready', player);
                                });

                                it('should not emit when event type is wrong', function() {
                                    var message = {};

                                    message.data = '{ "__vpaid__" : { "type" : "AdStarted", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ready', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ready', player);

                                    message.data = '{ "__vpaid__" : { "type" : "SomethingRandom", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ready', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ready', player);
                                });
                            });

                            describe('play', function() {
                                it('should emit when AdStarted is postMessaged', function() {
                                    var message = {
                                        data: '{ "__vpaid__" : { "type" : "AdStarted", "id" : "testId" } }',
                                    };

                                    messageHandler(message);

                                    expect(player.emit).toHaveBeenCalledWith('play', player);
                                });

                                it('should not emit when id doesn\'t match', function() {
                                    var message = {
                                        data: '{ "__vpaid__" : { "type" : "AdStarted", "id" : "wrongId" } }',
                                    };

                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('play', player);
                                });

                                it('should not emit when event type is wrong', function() {
                                    var message = {};

                                    message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('play', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('play', player);

                                    message.data = '{ "__vpaid__" : { "type" : "SomethingRandom", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('play', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('play', player);
                                });
                            });

                            describe('pause', function() {
                                it('should emit when AdStarted is postMessaged', function() {
                                    var message = {
                                        data: '{ "__vpaid__" : { "type" : "AdPaused", "id" : "testId" } }',
                                    };

                                    messageHandler(message);

                                    expect(player.emit).toHaveBeenCalledWith('pause', player);
                                });

                                it('should not emit when id doesn\'t match', function() {
                                    var message = {
                                        data: '{ "__vpaid__" : { "type" : "AdPaused", "id" : "wrongId" } }',
                                    };

                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('pause', player);
                                });

                                it('should not emit when event type is wrong', function() {
                                    var message = {};

                                    message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('pause', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('pause', player);

                                    message.data = '{ "__vpaid__" : { "type" : "SomethingRandom", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('pause', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('pause', player);
                                });
                            });

                            describe('ended', function() {
                                it('should emit when AdStarted is postMessaged', function() {
                                    var message = {
                                        data: '{ "__vpaid__" : { "type" : "AdVideoComplete", "id" : "testId" } }',
                                    };

                                    messageHandler(message);

                                    expect(player.emit).toHaveBeenCalledWith('ended', player);
                                });

                                it('should not emit when id doesn\'t match', function() {
                                    var message = {
                                        data: '{ "__vpaid__" : { "type" : "AdVideoComplete", "id" : "wrongId" } }',
                                    };

                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ended', player);
                                });

                                it('should not emit when event type is wrong', function() {
                                    var message = {};

                                    message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ended', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ended', player);

                                    message.data = '{ "__vpaid__" : { "type" : "SomethingRandom", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ended', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('ended', player);
                                });
                            });

                            describe('other VPAID events', function() {
                                it('should be emitted in addition to playerInterface events', function() {
                                    var message = {};

                                    message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).toHaveBeenCalledWith('AdLoaded', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).toHaveBeenCalledWith('AdClickThru', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdError", "id" : "testId" } }';
                                    messageHandler(message);

                                    expect(player.emit).toHaveBeenCalledWith('AdError', player);
                                });

                                it('should not be emitted when id doesn\'t match', function() {
                                    var message = {};

                                    message.data = '{ "__vpaid__" : { "type" : "AdLoaded", "id" : "wrongId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('AdLoaded', player);

                                    message.data = '{ "__vpaid__" : { "type" : "AdClickThru", "id" : "anotherWrongId" } }';
                                    messageHandler(message);

                                    expect(player.emit).not.toHaveBeenCalledWith('AdClickThru', player);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());