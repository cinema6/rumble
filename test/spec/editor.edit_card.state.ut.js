(function() {
    'use strict';

    define(['app'], function() {
        describe('EditCardState', function() {
            var EditCardState,
                EditorState,
                $injector,
                c6StateParams,
                c6State;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');
                });

                EditorState = c6State.get('editor');
                EditCardState = c6State.get('editor.editCard');
            });

            it('should exist', function() {
                expect(EditCardState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    EditorState.cModel = {
                        data: {
                            deck: [
                                {
                                    id: 'rc-19437ee278914e'
                                },
                                {
                                    id: 'rc-4d812b28c4292b'
                                },
                                {
                                    id: 'rc-036a2e0b648f3d'
                                },
                                {
                                    id: 'rc-16044f64448e0f'
                                }
                            ]
                        }
                    };
                    c6StateParams.cardId = 'rc-036a2e0b648f3d';
                });

                it('should use the c6StateParams id to find the card in the deck of the editor\'s model', function() {
                    expect($injector.invoke(EditCardState.model, EditCardState)).toBe(EditorState.cModel.data.deck[2]);
                });
            });

            describe('updateControllerModel()', function() {
                var model, controller,
                    copy = {
                        name: 'Editorial Content',
                        sref: 'editor.editCard.copy'
                    },
                    ballot = {
                        name: 'Questionnaire',
                        sref: 'editor.editCard.ballot'
                    },
                    video = {
                        name: 'Video Content',
                        sref: 'editor.editCard.video'
                    };

                beforeEach(function() {
                    model = {
                        type: 'video'
                    };
                    controller = {};
                });

                function updateControllerModel() {
                    $injector.invoke(EditCardState.updateControllerModel, EditCardState, {
                        controller: controller,
                        model: model
                    });
                }

                describe('always', function() {
                    beforeEach(function() {
                        updateControllerModel();
                    });

                    it('should set the model as the controller\'s model property', function() {
                        expect(controller.model).toBe(model);
                    });
                });

                describe('on all cards', function() {
                    beforeEach(function() {
                        model.type = null;
                        updateControllerModel();
                    });

                    it('should only enable the "copy" tab', function() {
                        expect(controller.tabs).toEqual([copy]);
                    });
                });

                describe('on videoBallot cards', function() {
                    beforeEach(function() {
                        model.type = 'videoBallot';
                        updateControllerModel();
                    });

                    it('should enable the "copy", "ballot", and "video" tabs', function() {
                        expect(controller.tabs).toEqual([copy, video, ballot]);
                    });
                });

                describe('on video cards', function() {
                    beforeEach(function() {
                        model.type = 'video';
                        updateControllerModel();
                    });

                    it('should enable the "copy" and "video" tabs', function() {
                        expect(controller.tabs).toEqual([copy, video]);
                    });
                });
            });
        });
    });
}());
