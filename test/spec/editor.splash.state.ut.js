(function() {
    'use strict';

    define(['app'], function() {
        describe('EditorSplashState', function() {
            var $injector,
                c6State,
                EditorSplashState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');

                    EditorSplashState = c6State.get('editor.splash');
                });
            });

            it('should exist', function() {
                expect(EditorSplashState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
