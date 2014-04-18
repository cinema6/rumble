(function() {
    'use strict';

    define(['app'], function() {
        describe('NewCardState', function() {
            var $injector,
                c6State,
                MiniReelService,
                NewCardState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    MiniReelService = $injector.get('MiniReelService');
                });

                NewCardState = c6State.get('editor.newCard');
            });

            it('should exist', function() {
                expect(NewCardState).toEqual(jasmine.any(Object));
            });

            describe('updateControllerModel()', function() {
                var newCard;

                beforeEach(function() {
                    newCard = {};

                    spyOn(MiniReelService, 'createCard').and.returnValue(newCard);
                });

                describe('if the state doesn\'t have a model', function() {
                    beforeEach(function() {
                        $injector.invoke(NewCardState.updateControllerModel, NewCardState);
                    });

                    it('should make the card the state\'s model', function() {
                        expect(NewCardState.cModel).toBe(newCard);
                    });
                });

                describe('if the state already has a model', function() {
                    it('should use the existing model', function() {
                        var model = {};

                        NewCardState.cModel = model;

                        $injector.invoke(NewCardState.updateControllerModel, NewCardState);

                        expect(NewCardState.cModel).toBe(model);
                    });
                });
            });
        });
    });
}());
