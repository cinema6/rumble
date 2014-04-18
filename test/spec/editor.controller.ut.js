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

            it('should set preview mode to false', function() {
                expect(EditorCtrl.preview).toBe(false);
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

                describe('previewMode(card)', function() {
                    beforeEach(function() {
                        spyOn($scope, '$broadcast');
                    });
                    it('should set preview mode to true', function() {
                        EditorCtrl.previewMode();
                        expect(EditorCtrl.preview).toBe(true);
                    });

                    describe('without a card', function() {
                        it('should $broadcast the experience without a card', function() {
                            EditorCtrl.previewMode();
                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[1]).toBe(cModel);
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(undefined);
                        });
                    });

                    describe('with a card', function() {
                        it('should $broadcast the experience with a card', function() {
                            var card = {};
                            EditorCtrl.previewMode(card);
                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[1]).toBe(cModel);
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(card);
                        });
                    });
                });

                describe('closePreview()', function() {
                    it('should set preview mode to false', function() {
                        EditorCtrl.closePreview();
                        expect(EditorCtrl.preview).toBe(false);
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
