(function() {
    'use strict';

    define(['rumble'], function() {
        describe('DeckController', function() {
            var $rootScope,
                $scope,
                $controller,
                DeckCtrl;

            var c6AppData;

            function AdCard(id) {
                this.id = 'rc-advertisement' + id;
                this.type = 'ad';
                this.ad = true;
                this.modules = ['displayAd'];
                this.data = {
                    autoplay: true,
                    skip: c6AppData.experience.data.adConfig.video.skip,
                    source: c6AppData.experience.data.adConfig.video.waterfall
                }
            }

            beforeEach(function() {
                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', {
                        experience: {
                            data: {
                                adConfig: {
                                    video: {
                                        waterfall: 'cinema6',
                                        skip: 6
                                    }
                                }
                            }
                        }
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6AppData = $injector.get('c6AppData');

                    $scope = $rootScope.$new();
                });

                $scope.deck = [];
                $scope.currentCard = null;

                $scope.$apply(function() {
                    DeckCtrl = $controller('DeckController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(DeckCtrl).toEqual(jasmine.any(Object));
            });

            describe('properites', function() {
                describe('decks', function() {
                    it('should be an array with two objects', function() {
                        expect(DeckCtrl.decks).toEqual([jasmine.any(Object), jasmine.any(Object)]);
                    });

                    describe('[0]', function() {
                        var item;

                        beforeEach(function() {
                            item = DeckCtrl.decks[0];
                        });

                        it('should be the video deck', function() {
                            expect(item).toEqual(jasmine.objectContaining({
                                id: 'video',
                                active: false,
                                index: -1,
                                cards: [],
                            }));
                        });

                        describe('methods', function() {
                            describe('includeCard(card)', function() {
                                it('should be false if card.ad is truthy', function() {
                                    expect(item.includeCard({ ad: true })).toBe(false);
                                });

                                it('should be true if card.ad is falsy', function() {
                                    expect(item.includeCard({})).toBe(true);
                                });
                            });

                            describe('findCard(card)', function() {
                                beforeEach(function() {
                                    item.cards.push(
                                        {},
                                        {},
                                        {}
                                    );
                                });

                                it('should return the card if it is in the deck', function() {
                                    expect(item.findCard(item.cards[0])).toBe(item.cards[0]);
                                    expect(item.findCard(item.cards[2])).toBe(item.cards[2]);
                                });

                                it('should return undefined if the card is not in the deck', function() {
                                    expect(item.findCard({})).toBeUndefined();
                                });
                            });
                        });
                    });

                    describe('[1]', function() {
                        var item;

                        beforeEach(function() {
                            item = DeckCtrl.decks[1];
                        });

                        it('should be the ad deck', function() {
                            expect(item).toEqual(jasmine.objectContaining({
                                id: 'ad',
                                active: false,
                                index: -1,
                                cards: []
                            }));
                        });

                        it('should be removing the ad cards as it goes', function() {
                            var originalCards;

                            $scope.$emit('adOnDeck', new AdCard(1));
                            originalCards = item.cards.concat();

                            item.moveTo(item.cards[0]);
                            expect(item.cards).toEqual(originalCards);

                            $scope.$emit('adOnDeck', new AdCard(2));
                            item.moveTo(item.cards[1]);

                            expect(item.cards.length).toBe(1);
                            expect(item.cards).toEqual([
                                {
                                    id: 'rc-advertisement2',
                                    type: 'ad',
                                    ad: true,
                                    modules: [
                                        'displayAd'
                                    ],
                                    data: {
                                        autoplay: true,
                                        skip: c6AppData.experience.data.adConfig.video.skip,
                                        source: c6AppData.experience.data.adConfig.video.waterfall
                                    }
                                }
                            ]);
                            expect(item.index).toBe(0);

                            originalCards = item.cards.concat();

                            $scope.$emit('adOnDeck', new AdCard(3));
                            item.moveTo(item.cards[1]);
                            expect(item.cards).toEqual([
                                {
                                    id: 'rc-advertisement3',
                                    type: 'ad',
                                    ad: true,
                                    modules: [
                                        'displayAd'
                                    ],
                                    data: {
                                        autoplay: true,
                                        skip: c6AppData.experience.data.adConfig.video.skip,
                                        source: c6AppData.experience.data.adConfig.video.waterfall
                                    }
                                }
                            ]);
                            expect(item.index).toBe(0);
                        });

                        it('should be adding ad cards when adOnDeck is emitted', function() {
                            expect(item.cards.length).toBe(0);

                            $scope.$emit('adOnDeck', new AdCard(1));

                            expect(item.cards.length).toBe(1);

                            expect(item.cards[0]).toEqual({
                                id: 'rc-advertisement1',
                                type: 'ad',
                                ad: true,
                                modules: [
                                    'displayAd'
                                ],
                                data: {
                                    autoplay: true,
                                    skip: c6AppData.experience.data.adConfig.video.skip,
                                    source: c6AppData.experience.data.adConfig.video.waterfall
                                }
                            });

                            $scope.$emit('adOnDeck', new AdCard(2));

                            expect(item.cards.length).toBe(2);

                            expect(item.cards[1]).toEqual({
                                id: 'rc-advertisement2',
                                type: 'ad',
                                ad: true,
                                modules: [
                                    'displayAd'
                                ],
                                data: {
                                    autoplay: true,
                                    skip: c6AppData.experience.data.adConfig.video.skip,
                                    source: c6AppData.experience.data.adConfig.video.waterfall
                                }
                            });

                        });

                        describe('methods', function() {
                            describe('includeCard(card)', function() {
                                it('should return false', function() {
                                    expect(item.includeCard()).toBe(false);
                                });
                            });

                            describe('config.findCard(card)', function() {
                                var first, second;

                                beforeEach(function() {
                                    item.update([{}, {}]);
                                    first = item.cards[0];
                                    second = item.cards[1];
                                });

                                it('should return the next card in the deck if an ad card', function() {
                                    expect(item.findCard({ ad: true })).toBe(first);

                                    item.moveTo(item.cards[0]);
                                    expect(item.findCard({ ad: true })).toBe(second);
                                });

                                it('should return undefined for non-ad cards', function() {
                                    expect(item.findCard({ ad: false })).toBeUndefined();
                                });

                                it('should return undefined if the card is null', function() {
                                    expect(item.findCard(null)).toBeUndefined();
                                });

                                it('should put a meta reference to the provided card on the returned one', function() {
                                    var orig = { ad: true };

                                    expect(item.findCard(orig)).toBe(first);
                                    expect(first.meta).toBe(orig);
                                });
                            });
                        });
                    });

                    [0, 1].forEach(function(index) {
                        describe('[' + index + ']', function() {
                            var item;

                            beforeEach(function() {
                                item = DeckCtrl.decks[index];
                                item.removeAllListeners();
                            });

                            describe('methods', function() {
                                describe('moveTo(item)', function() {
                                    beforeEach(function() {
                                        item.cards.push(
                                            {},
                                            {},
                                            {}
                                        );
                                    });

                                    it('should set the index', function() {
                                        item.moveTo(item.cards[0]);
                                        expect(item.index).toBe(0);

                                        item.moveTo(item.cards[2]);
                                        expect(item.index).toBe(2);
                                    });

                                    it('should emit the "activateCard" event with the card that is becoming active', function() {
                                        var activate = jasmine.createSpy('activate');

                                        item.on('activateCard', activate);

                                        item.moveTo(item.cards[0]);
                                        expect(activate).toHaveBeenCalledWith(item.cards[0]);

                                        item.moveTo({});
                                        expect(activate).toHaveBeenCalledWith(null);
                                    });

                                    it('should emit the "deactivateCard" event with the card that is becoming non-active', function() {
                                        var deactivate = jasmine.createSpy('deactivate');

                                        item.on('deactivateCard', deactivate);

                                        item.moveTo(item.cards[0]);
                                        expect(deactivate).toHaveBeenCalledWith(null);

                                        item.moveTo(item.cards[1]);
                                        expect(deactivate).toHaveBeenCalledWith(item.cards[0]);
                                    });

                                    it('should only emit events if the card is actually changing', function() {
                                        var activate = jasmine.createSpy('activate'),
                                            deactivate = jasmine.createSpy('deactivate');

                                        item.moveTo(item.cards[0]);
                                        item.on('activateCard', activate);
                                        item.on('deactivateCard', deactivate);

                                        item.moveTo(item.cards[0]);
                                        [activate, deactivate].forEach(function(spy) {
                                            expect(spy).not.toHaveBeenCalled();
                                        });
                                    });

                                    it('should return itself', function() {
                                        expect(item.moveTo(null)).toBe(item);
                                        expect(item.moveTo(item.cards[1])).toBe(item);
                                    });
                                });

                                describe('activate()', function() {
                                    var activate;

                                    beforeEach(function() {
                                        activate = jasmine.createSpy('activate');

                                        item.on('activate', activate);

                                        item.activate();
                                    });

                                    it('should set active to true', function() {
                                        expect(item.active).toBe(true);
                                    });

                                    it('should emit the "activate" event', function() {
                                        expect(activate).toHaveBeenCalled();
                                    });

                                    it('should only emit activate if it goes from active to not active', function() {
                                        item.activate();
                                        expect(activate.callCount).toBe(1);
                                    });

                                    it('should return itself', function() {
                                        expect(item.activate()).toBe(item);
                                    });
                                });

                                describe('deactivate()', function() {
                                    var deactivate;

                                    beforeEach(function() {
                                        deactivate = jasmine.createSpy('deactivate');

                                        item.on('deactivate', deactivate);

                                        item.active = true;
                                        item.deactivate();
                                    });

                                    it('should set active to false', function() {
                                        expect(item.active).toBe(false);
                                    });

                                    it('should emit the "deactivate" event', function() {
                                        expect(deactivate).toHaveBeenCalled();
                                    });

                                    it('should only emit deactivate if it goes from active to not active', function() {
                                        item.deactivate();
                                        expect(deactivate.callCount).toBe(1);
                                    });

                                    it('should return itself', function() {
                                        expect(item.deactivate()).toBe(item);
                                    });
                                });

                                describe('reset()', function() {
                                    var activate, deactivate;

                                    beforeEach(function() {
                                        activate = jasmine.createSpy('activate');
                                        deactivate = jasmine.createSpy('deactivate');

                                        item.on('activateCard', activate);
                                        item.on('deactivateCard', deactivate);

                                        item.cards = [
                                            {},
                                            {},
                                            {}
                                        ];

                                        item.moveTo(item.cards[2]);
                                        item.reset();
                                    });

                                    it('should set the index back to -1', function() {
                                        expect(item.index).toBe(-1);
                                    });

                                    it('should emit activateCard event', function() {
                                        expect(activate).toHaveBeenCalledWith(null);
                                    });

                                    it('should emit the deactivateCard event', function() {
                                        expect(deactivate).toHaveBeenCalledWith(item.cards[2]);
                                    });

                                    it('should return itself', function() {
                                        expect(item.reset()).toBe(item);
                                    });
                                });

                                describe('update(cards)', function() {
                                    var newCards, oldCards;

                                    beforeEach(function() {
                                        newCards = [{}, {}, {}];

                                        oldCards = item.cards = [{}, {}, {}];
                                        item.moveTo(oldCards[1]);

                                        item.update(newCards);
                                    });

                                    it('should replace the members of the cards array with new cards', function() {
                                        expect(item.cards).toBe(oldCards);
                                        expect(item.cards.length).toBe(newCards.length);

                                        newCards.forEach(function(card, index) {
                                            expect(item.cards[index]).toBe(card);
                                        });
                                    });

                                    it('should try to set iteself to the card it was previously on', function() {
                                        expect(item.activeCard).toBeNull();
                                        expect(item.index).toBe(-1);

                                        item.moveTo(newCards[1]);
                                        item.update([newCards[1], newCards[0]]);

                                        expect(item.activeCard).toBe(newCards[1]);
                                        expect(item.index).toBe(0);
                                    });

                                    it('should not do anything if the array provided is empty', function() {
                                        item.update([]);

                                        expect(item.cards).toEqual(newCards);
                                    });
                                });

                                describe('pop()', function() {
                                    beforeEach(function() {
                                        item.cards = [
                                            {},
                                            {},
                                            {}
                                        ];
                                    });

                                    it('should throw an error if you try to pop the active card', function() {
                                        item.moveTo(item.cards[2]);

                                        expect(function() {
                                            item.pop();
                                        }).toThrow(new Error('The active card cannot be popped.'));
                                    });

                                    it('should remove the last card from the deck and return it', function() {
                                        var lastCard = item.cards[2];

                                        expect(item.pop()).toBe(lastCard);

                                        expect(item.cards.indexOf(lastCard)).toBeLessThan(0);
                                    });
                                });

                                describe('push()', function() {
                                    var card;

                                    beforeEach(function() {
                                        card = {};

                                        item.cards = [
                                            {},
                                            {},
                                            {}
                                        ];

                                        item.push(card);
                                    });

                                    it('should add the item to the deck', function() {
                                        expect(item.cards[3]).toBe(card);
                                    });
                                });

                                describe('shift()', function() {
                                    beforeEach(function() {
                                        item.cards = [
                                            {},
                                            {},
                                            {}
                                        ];
                                    });

                                    it('should throw an error if you try to shift the active card', function() {
                                        item.moveTo(item.cards[0]);

                                        expect(function() {
                                            item.shift();
                                        }).toThrow(new Error('The active card cannot be shifted.'));
                                    });

                                    it('should remove the first card from the deck and return it', function() {
                                        var firstCard = item.cards[0];

                                        expect(item.shift()).toBe(firstCard);

                                        expect(item.cards.indexOf(firstCard)).toBeLessThan(0);
                                    });

                                    it('should make sure the index stays up-to-date so the current card does not change', function() {
                                        var activateCard = jasmine.createSpy('activateCard'),
                                            deactivateCard = jasmine.createSpy('deactivateCard');

                                        item.moveTo(item.cards[2]);
                                        item.on('activateCard', activateCard);
                                        item.on('deactivateCard', deactivateCard);

                                        item.shift();

                                        expect(item.index).toBe(1);

                                        [activateCard, deactivateCard].forEach(function(spy) {
                                            expect(spy).not.toHaveBeenCalled();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('currentCard', function() {
                    var videoDeck, adDeck;

                    function setCurrentCard(card) {
                        $scope.$apply(function() {
                            $scope.currentCard = card;
                        });
                    }

                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.deck = [
                                /* jshint quotmark:false */
                                {
                                    "id": "rc-22119a8cf9f755",
                                    "type": "youtube",
                                    "title": "Epic Sax Guy",
                                    "note": "He's back, and saxier than ever.",
                                    "source": "YouTube",
                                    "modules": [
                                        "ballot",
                                        "comments"
                                    ],
                                    "ballot": {
                                        "prompt": "What did you think of this video?",
                                        "choices": [
                                            "Catchy",
                                            "Painful"
                                        ]
                                    },
                                    "data": {
                                        "videoid": "gy1B3agGNxw",
                                        "start": 42,
                                        "end": 130,
                                        "rel": 0,
                                        "modestbranding": 1
                                    },
                                    "conversationId": "rcv-f9efca48d85143"
                                },
                                {
                                    "id": "rc-2d46a04b21b073",
                                    "type": "ad",
                                    "ad": true,
                                    "modules": [
                                        "displayAd"
                                    ],
                                    "data": {
                                        "autoplay": true,
                                        "skip": 6,
                                        "source": "cinema6"
                                    }
                                },
                                {
                                    "id": "rc-4770a2d7f85ce0",
                                    "type": "dailymotion",
                                    "title": "Kristen Stewart for Channel",
                                    "note": "Psychotic glamour",
                                    "source": "DailyMotion",
                                    "modules": [
                                        "ballot"
                                    ],
                                    "ballot": {
                                        "prompt": "What did you think of this video?",
                                        "choices": [
                                            "Funny",
                                            "Lame"
                                        ]
                                    },
                                    "data": {
                                        "videoid": "x18b09a",
                                        "related": 0
                                    }
                                },
                                {
                                    "id": "rc-e489d1c6359fb3",
                                    "type": "vimeo",
                                    "title": "Aquatic paradise",
                                    "note": "How may we help you?",
                                    "source": "Vimeo",
                                    "modules": [
                                        "ballot"
                                    ],
                                    "ballot": {
                                        "prompt": "What did you think of this video?",
                                        "choices": [
                                            "Cute",
                                            "Ugly"
                                        ]
                                    },
                                    "data": {
                                        "videoid": "81766071",
                                        "start": 35,
                                        "end": 45
                                    }
                                },
                                {
                                    "id": "rc-e2947c9bec017e",
                                    "type": "youtube",
                                    "title": "Geek cool",
                                    "note": "Doctor Who #11 meets #4",
                                    "source": "YouTube",
                                    "modules": [
                                        "ballot"
                                    ],
                                    "ballot": {
                                        "prompt": "What did you think of this video?",
                                        "choices": [
                                            "Cool",
                                            "Geeky"
                                        ]
                                    },
                                    "data": {
                                        "videoid": "Cn9yJrrm2tk",
                                        "rel": 0,
                                        "modestbranding": 1,
                                        "end": 18
                                    }
                                },
                                {
                                    "id": "rc-99b87ea709d7ac",
                                    "type": "dailymotion",
                                    "title": "Farting dogs",
                                    "note": "Enough said",
                                    "source": "DailyMotion",
                                    "modules": [
                                        "ballot"
                                    ],
                                    "ballot": {
                                        "prompt": "What did you think of this video?",
                                        "choices": [
                                            "Funny",
                                            "Gross"
                                        ]
                                    },
                                    "data": {
                                        "videoid": "xorbb7",
                                        "related": 0
                                    }
                                },
                                {
                                    "id": "rc-235d41cde02032",
                                    "type": "recap",
                                    "title": "Recap of Rumble Video",
                                    "modules": [],
                                    "data": {}
                                }
                                /* jshint quotmark:single */
                            ];
                        });

                        videoDeck = DeckCtrl.decks[0];
                        adDeck = DeckCtrl.decks[1];

                        DeckCtrl.decks.forEach(function(deck) {
                            ['activate', 'deactivate', 'moveTo'].forEach(function(method) {
                                spyOn(deck, method).andCallThrough();
                            });
                        });
                    });

                    it('should go to the first card', function() {
                        setCurrentCard($scope.deck[0]);
                        expect(videoDeck.activate).toHaveBeenCalled();
                        expect(adDeck.deactivate).toHaveBeenCalled();
                        expect(videoDeck.moveTo).toHaveBeenCalledWith($scope.deck[0]);
                        expect(adDeck.moveTo).not.toHaveBeenCalled();
                    });

                    it('should go to the second card', function() {
                        $scope.$emit('adOnDeck', new AdCard(1));
                        setCurrentCard($scope.deck[1]);
                        expect(videoDeck.deactivate).toHaveBeenCalled();
                        expect(adDeck.activate).toHaveBeenCalled();
                        expect(adDeck.moveTo).toHaveBeenCalledWith(adDeck.cards[0]);
                        expect(videoDeck.moveTo).not.toHaveBeenCalled();
                    });

                    it('should go to the third card', function() {
                        setCurrentCard($scope.deck[2]);
                        expect(videoDeck.activate).toHaveBeenCalled();
                        expect(adDeck.deactivate).toHaveBeenCalled();
                        expect(videoDeck.moveTo).toHaveBeenCalledWith($scope.deck[2]);
                        expect(adDeck.moveTo).not.toHaveBeenCalled();
                    });

                    it('should go back to the beginning', function() {
                        setCurrentCard($scope.deck[0]);
                        setCurrentCard(null);

                        expect(videoDeck.deactivate).toHaveBeenCalled();
                        expect(adDeck.deactivate.callCount).toBe(2);
                        expect(videoDeck.moveTo).toHaveBeenCalledWith(null);
                        expect(adDeck.moveTo).not.toHaveBeenCalled();
                    });
                });

                describe('deck', function() {
                    beforeEach(function() {
                        spyOn(DeckCtrl.decks[0], 'update').andCallThrough();

                        $scope.$apply(function() {
                            $scope.deck = [
                                {},
                                {},
                                {
                                    ad: true
                                },
                                {},
                                {},
                                {
                                    ad: true
                                },
                                {}
                            ];
                        });
                    });

                    it('should sort the cards into the correct deck', function() {
                        var videos = $scope.deck.filter(function(card) {
                            return !card.ad;
                        });

                        videos.forEach(function(card, index) {
                            expect(DeckCtrl.decks[0].cards[index]).toBe(card);
                        });
                        expect(DeckCtrl.decks[1].cards).toEqual([]);

                        expect(DeckCtrl.decks[0].update).toHaveBeenCalledWith(videos);
                    });
                });
            });
        });
    });
}());
