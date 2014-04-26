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

                session = {
                    ping: jasmine.createSpy('session.ping()')
                };

                c6EventEmitter(session);

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
                        $scope.$emit('mrPreview:initExperience', experience, session);
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
                    var newCard,
                    dataSentToPlayer;

                    beforeEach(function() {
                        newCard = {
                            id: 'new'
                        };

                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        spyOn(MiniReelService, 'convertCard').and.returnValue(newCard);

                        $scope.$emit('mrPreview:initExperience', experience, session);
                    });

                    it('should convert the experience', function() {
                        experience.data.deck.push(newCard);

                        $scope.$emit('mrPreview:updateExperience', experience);
                        expect()
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

                describe('mrPreview:reset', function() {
                    it('should tell the player to reset', function() {
                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        $scope.$emit('mrPreview:initExperience', experience, session);
                        $scope.$emit('mrPreview:reset');
                        expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:reset');
                    });
                });

                describe('mrPreview:updateMode', function() {
                    it('should tell the player to reset', function() {
                        var dataSentToPlayer,
                            emitCount = 0,
                            updatedExperience = {
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
                                        },
                                        {
                                            id: 'new'
                                        }
                                    ]
                                }
                            };

                        spyOn($scope, '$emit').and.callThrough();
                        spyOn(MiniReelService, 'convertForPlayer').and.callFake(function() {
                            if((emitCount === 0) && $scope.$emit.calls.argsFor(0)[0] === 'mrPreview:initExperience') {
                                emitCount++;
                                return experience;
                            } else if($scope.$emit.calls.argsFor(1)[0] === 'mrPreview:updateMode') {
                                return updatedExperience;
                            }
                        });
                        $scope.$emit('mrPreview:initExperience', experience, session);
                        $scope.$emit('mrPreview:updateMode', updatedExperience);
                        expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:updateMode');

                        session.emit('handshake', {}, responseCallback);

                        dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                        expect(dataSentToPlayer.appData.experience).not.toEqual(session.experience);
                        expect(dataSentToPlayer.appData.experience).toEqual(updatedExperience);
                    });
                });
            });

            describe('$watcher', function() {
                describe('device', function() {
                    describe('when the device has been changed', function() {
                        var dataSentToPlayer, updatedExperience, emitCount;

                        beforeEach(function() {
                            updatedExperience = {
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
                                        },
                                        {
                                            id: 'new'
                                        }
                                    ]
                                }
                            };

                            emitCount = 0;

                            spyOn($scope, '$emit').and.callThrough();

                            spyOn(MiniReelService, 'convertForPlayer').and.callFake(function() {
                                if((emitCount === 0) && $scope.$emit.calls.argsFor(0)[0] === 'mrPreview:initExperience') {
                                    emitCount++;
                                    return experience;
                                } else if($scope.$emit.calls.argsFor(1)[0] === 'mrPreview:updateExperience') {
                                    return updatedExperience;
                                }
                            });

                            $scope.$emit('mrPreview:initExperience', experience, session);
                            $scope.$emit('mrPreview:updateExperience', updatedExperience);

                            $scope.$apply(function() {
                                PreviewController.device = 'desktop';
                            });

                            $scope.$apply(function() {
                                PreviewController.device = 'phone';
                            });
                        });

                        it('should tell the player to reload', function() {
                            expect(session.ping.calls.argsFor(2)[0]).toBe('mrPreview:updateMode');
                        });

                        it('should send an updated profile to the player after it reloads', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer.appData.profile.device).toBe('phone');
                        });
                        it('should send an updated experience to the player after it reloads', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer.appData.experience).not.toEqual(session.experience);
                            expect(dataSentToPlayer.appData.experience).toEqual(updatedExperience);
                        });
                    });
                });
            });
        });
    });
}());