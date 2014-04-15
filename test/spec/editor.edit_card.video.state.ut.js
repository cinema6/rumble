(function() {
    'use strict';

    define(['app'], function() {
        describe('VideoState', function() {
            var $injector,
                c6State,
                EditCardState,
                VideoState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    EditCardState = c6State.get('editor.editCard');
                    VideoState = c6State.get('editor.editCard.video');
                });

                EditCardState.cModel = {};
            });

            it('should exist', function() {
                expect(VideoState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var model;

                beforeEach(function() {
                    model = $injector.invoke(VideoState.model, VideoState);
                });

                it('should inherit its parent\'s model', function() {
                    expect(model).toBe(EditCardState.cModel);
                });
            });
        });
    });
}());
