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

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    ManagerNewState.cModel = {
                        minireel: {},
                        modes: [
                            {
                                value: 'inline',
                                modes: []
                            },
                            {
                                value: 'lightbox',
                                modes: []
                            }
                        ]
                    };
                    c6StateParams.newModeValue = 'lightbox';

                    result = $injector.invoke(NewModeState.model, NewModeState);
                });

                it('should return a object with the subset of modes and the minireel', function() {
                    expect(result).toEqual({
                        minireel: ManagerNewState.cModel.minireel,
                        modes: ManagerNewState.cModel.modes[1].modes
                    });
                });
            });

            describe('updateControllerModel()', function() {
                var model, controller;

                function invoke() {
                    $injector.invoke(NewModeState.updateControllerModel, NewModeState, {
                        controller: controller,
                        model: model
                    });
                }

                beforeEach(function() {
                    controller = {};
                    model = {
                        minireel: {},
                        modes: [
                            {
                                value: 'foo'
                            },
                            {
                                value: 'bar'
                            }
                        ]
                    };

                    invoke();
                });

                it('should set the "model" property on the controller', function() {
                    expect(controller.model).toBe(model);
                });

                it('should set the mode to be the value of the first mode in the model\'s modes', function() {
                    expect(controller.mode).toBe('foo');
                });

                it('should be the MiniReel\'s mode if it has one', function() {
                    model.minireel.mode = 'bar';
                    invoke();

                    expect(controller.mode).toBe('bar');
                });

                it('should set the mode to be the value of the first mode in the model\'s modes if the minireel\'s mode is not a member of the model\'s modes', function() {
                    model.minireel.mode = 'foo';
                    invoke();
                    expect(controller.mode).toBe('foo');

                    model.minireel.mode = 'lightbox';
                    invoke();
                    expect(controller.mode).toBe('foo');

                    model.minireel.mode = 'bar';
                    invoke();
                    expect(controller.mode).toBe('bar');

                    model.minireel.mode = 'lightbox-ads';
                    invoke();
                    expect(controller.mode).toBe('foo');
                });
            });
        });
    });
}());
