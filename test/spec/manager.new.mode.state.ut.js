(function() {
    'use strict';

    define(['app'], function() {
        describe('NewModeState', function() {
            var $injector,
                c6State,
                c6StateParams,
                ManagerNewState,
                NewModeState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');
                    ManagerNewState = c6State.get('manager.new');
                    NewModeState = c6State.get('manager.new.mode');
                });
            });

            it('should exist', function() {
                expect(NewModeState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
