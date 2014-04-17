(function() {
    'use strict';

    define(['editor'], function() {
        describe('PreviewController', function() {
            var $rootScope,
                $scope,
                $controller,
                PreviewController,
                MiniReelService,
                c6EventEmitter,
                c6BrowserInfo,
                postMessage;

            var responseCallback,
                experience,
                session,
                iframe,
                player;

            beforeEach(function() {
                c6BrowserInfo = {
                    profile: {
                        flash: true,
                        autoplay: true,
                        device: 'desktop'
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.value('c6BrowserInfo',c6BrowserInfo);
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    MiniReelService = $injector.get('MiniReelService');
                    postMessage = $injector.get('postMessage');
                    c6EventEmitter = $injector.get('c6EventEmitter');

                    $scope = $rootScope.$new();

                    PreviewController = $controller('PreviewController', { $scope: $scope });
                });

                experience = {
                    id: 'foo',
                    data: {
                        deck: [
                            {
                                id: '1'
                            },
                            {
                                id: '2'
                            },
                            {
                                id: '3'
                            }
                        ]
                    }
                };

                player = {};

                iframe = {
                    prop: jasmine.createSpy('iframe.prop()')
                        .and.returnValue(player)
                };

                session = {
                    ping: jasmine.createSpy('session.ping()')
                };

                c6EventEmitter(session);

                spyOn(postMessage, 'createSession').and.returnValue(session);
                spyOn(session, 'on').and.callThrough();

                responseCallback = jasmine.createSpy('responseCallback()');
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(PreviewController).toEqual(jasmine.any(Object));
                });

                it('should set the default mode to full', function() {
                    expect(PreviewController.device).toBe('desktop');
                });
            });

            describe('$scope listeners', function() {
                describe('mrPreview:initExperience', function() {
                    var dataSentToPlayer;

                    beforeEach(function() {
                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        $scope.$emit('mrPreview:initExperience', experience, iframe);
                    });

                    it('should create a session with the iframe that\'s sent', function() {
                        expect(iframe.prop).toHaveBeenCalled();
                        expect(postMessage.createSession).toHaveBeenCalledWith(player);
                    });

                    it('should convert the experience and add it to the session', function() {
                        expect(MiniReelService.convertForPlayer).toHaveBeenCalled();
                        expect(session.experience).toEqual(experience);
                    });

                    it('should register two session listeners', function() {
                        expect(session.on).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Function));
                        expect(session.on.calls.count()).toBe(2);
                    });

                    describe('handshake request', function() {
                        it('should respond with appData for the player', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer.success).toBe(true);
                            expect(dataSentToPlayer.appData.experience).toEqual(experience);
                            expect(dataSentToPlayer.appData.profile).toEqual(c6BrowserInfo.profile);
                        });
                    });

                    describe('mrPreview:getCard request', function() {
                        it('should return undefined until a specific card has been selected', function() {
                            session.emit('mrPreview:getCard', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer).toBe(undefined);
                        });
                    });
                });

                describe('mrPreview:updateExperience', function() {
                    var newCard;

                    beforeEach(function() {
                        newCard = {
                            id: 'new'
                        };

                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        spyOn(MiniReelService, 'convertCard').and.returnValue(newCard);

                        $scope.$emit('mrPreview:initExperience', experience, iframe);
                    });

                    it('should convert the experience', function() {
                        $scope.$emit('mrPreview:updateExperience', experience);
                        expect(MiniReelService.convertForPlayer).toHaveBeenCalled();
                    });

                    describe('when the experience has changed', function() {
                        it('should send the experience to the player', function() {
                            experience.data.deck.push(newCard);

                            $scope.$emit('mrPreview:updateExperience', experience, newCard);

                            expect(experience).not.toEqual(session.experience);
                            expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                        });
                    });

                    describe('when there\'s a card to jump to', function() {
                        it('should convert the card and tell the player to jump to the card', function() {
                            $scope.$emit('mrPreview:updateExperience', experience, newCard);

                            expect(MiniReelService.convertCard).toHaveBeenCalled();
                            expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:jumpToCard');
                        });
                    });

                    describe('when there\'s no card to jump to', function() {
                        it('should tell the player to reset', function() {
                            $scope.$emit('mrPreview:updateExperience', experience);

                            expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:reset');
                        });
                    });
                });
            });

            describe('$watcher', function() {
                describe('device', function() {
                    describe('when the device has been changed', function() {
                        var dataSentToPlayer;

                        beforeEach(function() {
                            spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                            $scope.$emit('mrPreview:initExperience', experience, iframe);

                            $scope.$apply(function() {
                                PreviewController.device = 'desktop';
                            });

                            $scope.$apply(function() {
                                PreviewController.device = 'phone';
                            });
                        });

                        it('should tell the player to reload', function() {
                            expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:updateMode');
                        });

                        it('should send an updated profile to the player after it reloads', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer.appData.profile.device).toBe('phone');
                        });
                    });
                });
            });
        });
    });
}());