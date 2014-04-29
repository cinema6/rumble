(function() {
    'use strict';

    define(['recap_card'], function() {
        describe('RecapCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                RecapCardCtrl;

            var MiniReelService,
                c6AppData,
                BallotService;

            c6AppData = {
                experience: {
                    title: 'Test Title',
                    data: {
                        deck: [
                            {
                                id: '1',
                                title: 'Card 1',
                                type: 'youtube',
                                source: 'YouTube',
                                thumbs: {
                                    large: 'http://foo.com/bar.jpg'
                                },
                                ballot: {
                                    prompt: 'What do you think?',
                                    choices: ['Catchy', 'Lame']
                                },
                                modules: ['ballot'],
                                data: {
                                    videoid: '1234'
                                }
                            },
                            {
                                id: '4',
                                type: 'ad',
                            },
                            {
                                id: '2',
                                title: 'Card 2',
                                type: 'dailymotion',
                                source: 'DailyMotion',
                                thumbs: {
                                    large: 'http://foo.com/bar.jpg'
                                },
                                ballot: {},
                                modules: ['displayAd'],
                                data: {
                                    videoid: '1234'
                                }
                            },
                            {
                                id: '3',
                                title: 'Card 3',
                                type: 'vimeo',
                                source: 'Vimeo',
                                thumbs: {
                                    large: 'http://foo.com/bar.jpg'
                                },
                                data: {
                                    videoid: '1234'
                                }
                            },
                            {
                                id: '5',
                                type: 'recap'
                            }
                        ]
                    }
                }
            };

            beforeEach(function() {

                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', c6AppData);

                    $provide.service('MiniReelService', function() {
                        this.createDeck = jasmine.createSpy('MiniReelService.createDeck()')
                            .andCallFake(function() {
                                return c6AppData.experience.data.deck;
                            });
                    });

                    $provide.service('BallotService', function($q) {
                        var deferred = $q.defer();
                        this.resolve = function() {
                            deferred.resolve([{votes:0.60},{votes:0.40}]);
                        };
                        this.getBallot = jasmine.createSpy('BallotService.getBallot()')
                            .andCallFake(function() {
                                return deferred.promise;
                            });
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    MiniReelService = $injector.get('MiniReelService');
                    BallotService = $injector.get('BallotService');

                    $scope = $rootScope.$new();
                    RecapCardCtrl = $controller('RecapCardController', { $scope: $scope });
                });

                $scope.$apply(function() {
                    BallotService.resolve();
                });
            });

            it('should exist', function() {
                expect(RecapCardCtrl).toBeDefined();
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('title', function() {
                        it('should be come form the experience', function() {
                            expect(RecapCardCtrl.title).toEqual(c6AppData.experience.title);
                        });
                    });
                    
                    describe('deck', function() {
                        it('should create the deck from the experience data', function() {
                            expect(MiniReelService.createDeck).toHaveBeenCalledWith(c6AppData.experience.data);
                        });

                        it('should get the ballot results for each card with a ballot module', function() {
                            expect(BallotService.getBallot).toHaveBeenCalledWith(c6AppData.experience.data.deck[0].id);
                            expect(BallotService.getBallot.callCount).toBe(1);
                        });

                        it('should not add ballot results to cards without a ballot module', function() {
                            expect(RecapCardCtrl.deck[1].ballot.results).toBeUndefined();
                        });

                        it('should add ballot results to cards with a ballot module', function() {
                            expect(RecapCardCtrl.deck[0].ballot.results[0].votes).toBe(0.60);
                        });

                        it('should only add video cards to the public deck', function() {
                            expect(RecapCardCtrl.deck.length).toBe(3);
                        });

                        it('should set the webHref for each card', function() {
                            expect(RecapCardCtrl.deck[0].webHref).toBe('https://www.youtube.com/watch?v=1234');
                            expect(RecapCardCtrl.deck[1].webHref).toBe('http://www.dailymotion.com/video/1234');
                            expect(RecapCardCtrl.deck[2].webHref).toBe('http://vimeo.com/1234');
                        });
                    });
                });

                describe('methods', function() {
                    describe('jumpTo', function() {
                        it('should emit an event and pass the index from the experience, not the filtered deck', function() {
                            spyOn($scope, '$emit').andReturn(undefined);

                            RecapCardCtrl.jumpTo(RecapCardCtrl.deck[1]);
                            expect($scope.$emit).toHaveBeenCalledWith('<recap-card>:jumpTo',2);

                            RecapCardCtrl.jumpTo(RecapCardCtrl.deck[0]);
                            expect($scope.$emit).toHaveBeenCalledWith('<recap-card>:jumpTo',0);
                        });
                    });
                });
            });
        });
    });
}());
