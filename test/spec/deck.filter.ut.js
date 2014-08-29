define(['minireel'], function(minireelModule) {
    'use strict';

    describe('deckFilter(deck, index, buffer)', function() {
        var deckFilter;

        var deck,
            noopCard;

        beforeEach(function() {
            deck = [
                {
                    id: 'e-8ba07842d046f5'
                },
                {
                    id: 'e-17f1f8dd16a37a'
                },
                {
                    id: 'e-0063b877b0d8aa'
                },
                {
                    id: 'e-2cdc47df6071e5'
                },
                {
                    id: 'e-4f4d16b5b85672'
                }
            ];

            noopCard = {
                type: 'noop'
            };

            module(minireelModule.name);

            inject(function($injector) {
                deckFilter = $injector.get('deckFilter');
            });
        });

        it('should exist', function() {
            expect(deckFilter).toEqual(jasmine.any(Function));
        });

        describe('index', function() {
            it('should only put real cards around the current index', function() {
                expect(deckFilter(deck, -1, 1)).toEqual([deck[0], noopCard, noopCard, noopCard, noopCard]);
                expect(deckFilter(deck, 0, 1)).toEqual([deck[0], deck[1], noopCard, noopCard, noopCard]);
                expect(deckFilter(deck, 1, 1)).toEqual([deck[0], deck[1], deck[2], noopCard, noopCard]);
                expect(deckFilter(deck, 2, 1)).toEqual([noopCard, deck[1], deck[2], deck[3], noopCard]);
                expect(deckFilter(deck, 4, 1)).toEqual([noopCard, noopCard, noopCard, deck[3], deck[4]]);
            });

            it('should reuse instances of cards', function() {
                var set1 = deckFilter(deck, 1, 1), set2 = deckFilter(deck, 2, 1);

                set1.forEach(function(card1, index) {
                    var card2 = set2[index];

                    if (!card1.id && !card2.id) {
                        expect(card1).toBe(card2);
                    }

                    expect(card1).not.toBe(set1[index + 1]);
                    expect(card2).not.toBe(set2[index + 1]);
                });
            });
        });

        describe('buffer', function() {
            it('should change the amount of cards surrounding the index card', function() {
                expect(deckFilter(deck, 2, 0)).toEqual([noopCard, noopCard, deck[2], noopCard, noopCard]);
                expect(deckFilter(deck, 2, 1)).toEqual([noopCard, deck[1], deck[2], deck[3], noopCard]);
                expect(deckFilter(deck, 2, 2)).toEqual(deck);
                expect(deckFilter(deck, 2, 3)).toEqual(deck);
            });
        });
    });
});
