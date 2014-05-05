(function() {
    'use strict';

    define(['app'], function() {
        describe('EditorSplashState', function() {
            var $injector,
                c6State,
                EditorState,
                EditorSplashState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');

                    EditorState = c6State.get('editor');
                    EditorSplashState = c6State.get('editor.splash');
                });
            });

            it('should exist', function() {
                expect(EditorSplashState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    EditorState.cModel = {};
                });

                it('should return a reference to its parent\'s model', function() {
                    expect($injector.invoke(EditorSplashState.model, EditorSplashState)).toBe(EditorState.cModel);
                });
            });
        });
    });
}());
