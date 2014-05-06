(function() {
    'use strict';

    define(['app'], function() {
        describe('EditCardCopyState', function() {
            var $injector,
                c6State,
                EditCardState,
                EditCardCopyState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    EditCardState = c6State.get('editor.editCard');
                    EditCardCopyState = c6State.get('editor.editCard.copy');
                });
            });

            it('should exist', function() {
                expect(EditCardCopyState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    EditCardState.cModel = {};

                    result = $injector.invoke(EditCardCopyState.model, EditCardCopyState);
                });

                it('should return a reference to the parent\'s model', function() {
                    expect(result).toBe(EditCardState.cModel);
                });
            });
        });
    });
}());
