(function() {
    'use strict';

    define(['app'], function() {
        describe('NewCategoryState', function() {
            var $injector,
                c6State,
                ManagerNewState,
                NewCategoryState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    ManagerNewState = c6State.get('manager.new');
                    NewCategoryState = c6State.get('manager.new.category');
                });
            });

            it('should exist', function() {
                expect(NewCategoryState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
