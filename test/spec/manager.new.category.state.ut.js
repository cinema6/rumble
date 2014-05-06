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

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    ManagerNewState.cModel = {
                        minireel: {},
                        modes: []
                    };

                    result = $injector.invoke(NewCategoryState.model, NewCategoryState);
                });

                it('should return the modes model of the parent', function() {
                    expect(result).toBe(ManagerNewState.cModel.modes);
                });
            });

            describe('updateControllerModel()', function() {
                var controller, model,
                    minireel;

                function invoke() {
                    $injector.invoke(NewCategoryState.updateControllerModel, NewCategoryState, {
                        controller: controller,
                        model: model
                    });
                }

                beforeEach(function() {
                    controller = {};
                    model = [
                        {
                            value: 'lightbox',
                            modes: [
                                {
                                    value: 'lightbox'
                                },
                                {
                                    value: 'lightbox-ads'
                                }
                            ]
                        },
                        {
                            value: 'inline',
                            modes: [
                                {
                                    value: 'light'
                                },
                                {
                                    value: 'full'
                                }
                            ]
                        }
                    ];

                    minireel = {
                        data: {}
                    };

                    ManagerNewState.cModel = {
                        minireel: minireel
                    };

                    invoke();
                });

                it('should set the model as the controller\'s model', function() {
                    expect(controller.model).toBe(model);
                });

                describe('controller.mode', function() {
                    it('should be the first mode value in the model if the minireel has no mode', function() {
                        expect(controller.mode).toBe(model[0].value);
                    });

                    it('should be the category of the model\'s mode if it has one', function() {
                        minireel.data.mode = 'lightbox'; invoke();
                        expect(controller.mode).toBe('lightbox');

                        minireel.data.mode = 'lightbox-ads'; invoke();
                        expect(controller.mode).toBe('lightbox');

                        minireel.data.mode = 'light'; invoke();
                        expect(controller.mode).toBe('inline');

                        minireel.data.mode = 'full';
                        expect(controller.mode).toBe('inline');
                    });
                });
            });
        });
    });
}());
