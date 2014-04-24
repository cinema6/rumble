(function() {
    'use strict';

    define(['app'], function() {
        describe('ManagerEmbedState', function() {
            var $injector,
                c6State,
                c6StateParams,
                ManagerEmbedState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');

                    ManagerEmbedState = c6State.get('manager.embed');
                });
            });

            it('should exist', function() {
                expect(ManagerEmbedState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    c6StateParams.minireelId = 'e-9b5c930e646069';

                    result = $injector.invoke(ManagerEmbedState.model, ManagerEmbedState);
                });

                it('should be the state params minireelId', function() {
                    expect(result).toBe(c6StateParams.minireelId);
                });
            });
        });
    });
}());
