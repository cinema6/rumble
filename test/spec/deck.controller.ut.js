(function() {
    'use strict';

    define(['rumble'], function() {
        ddescribe('DeckController', function() {
            var $rootScope,
                $scope,
                $controller,
                DeckCtrl;

            var c6AppData;

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
                                cards: [
                                    {
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
                                    },
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
                                ]
                            }));
                        });

                        describe('methods', function() {
                            describe('includeCard(card)', function() {
                                it('should return false', function() {
                                    expect(item.includeCard()).toBe(false);
                                });
                            });

                            describe('config.findCard(card)', function() {
                                beforeEach(function() {
                                    item.cards.push({});
                                });

                                it('should return the first card in the deck if an ad card', function() {
                                    expect(item.findCard({ ad: true })).toBe(item.cards[0]);
                                });

                                it('should return undefined for non-ad cards', function() {
                                    expect(item.findCard({ ad: false })).toBeUndefined();
                                });
                            });
                        });
                    });

                    [0, 1].forEach(function(index) {
                        describe('[' + index + ']', function() {
                            var item;

                            beforeEach(function() {
                                item = DeckCtrl.decks[index];
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

                                        item.index = 2;
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
                                });
                            });
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('deck', function() {
                    beforeEach(function() {
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
                        expect(DeckCtrl.decks[1].cards).toEqual([jasmine.any(Object), jasmine.any(Object)]);
                    });
                });
            });
        });
    });
}());
