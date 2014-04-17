(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorController', function() {
            var $rootScope,
                $scope,
                $childScope,
                $controller,
                c6State,
                EditorCtrl;

            var cModel;

            beforeEach(function() {
                cModel = {
                    data: {
                        deck: [
                            {},
                            {},
                            {}
                        ]
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    $childScope = $scope.$new();
                    EditorCtrl = $controller('EditorController', { $scope: $scope, cModel: cModel });
                    EditorCtrl.model = cModel;
                });
            });

            it('should exist', function() {
                expect(EditorCtrl).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('editCard(card)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        EditorCtrl.editCard({ id: 'rc-c98312239510db' });
                    });

                    it('should transition to the editor.editCard.video state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.editCard.video', { cardId: 'rc-c98312239510db' });
                    });
                });

                describe('newCard()', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        EditorCtrl.newCard();
                    });

                    it('should transition to the editor.newCard.type state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.newCard.type');
                    });
                });
            });

            describe('events', function() {
                describe('addCard', function() {
                    var card;

                    beforeEach(function() {
                        card = {};

                        $childScope.$emit('addCard', card);
                    });

                    it('should push the card onto the deck', function() {
                        var deck = cModel.data.deck;

                        expect(deck[deck.length - 1]).toBe(card);
                    });
                });
            });
        });
    });
}());
