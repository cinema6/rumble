(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorController', function() {
            var $rootScope,
                $scope,
                $childScope,
                $controller,
                $q,
                $timeout,
                $log,
                c6State,
                cinema6,
                MiniReelService,
                ConfirmDialogService,
                AppCtrl,
                EditorCtrl;

            var cModel;

            beforeEach(function() {
                cModel = {
                    id: 'e-53ae461c63b015',
                    mode: 'lightbox',
                    data: {
                        deck: [
                            {
                                id: 'rc-e91e76c0ce486a'
                            },
                            {
                                id: 'rc-2ba11eda2b2300'
                            },
                            {
                                id: 'rc-968f823aa61637'
                            }
                        ]
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');
                    $q = $injector.get('$q');
                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    $timeout = $injector.get('$timeout');
                    cinema6 = $injector.get('cinema6');
                    $log = $injector.get('$log');
                    $log.context = function() { return $log; };

                    $scope = $rootScope.$new();
                    AppCtrl = $scope.AppCtrl = {
                        config: null
                    };
                    $childScope = $scope.$new();
                    $scope.$apply(function() {
                        EditorCtrl = $controller('EditorController', { $scope: $scope, cModel: cModel });
                        EditorCtrl.model = cModel;
                    });
                });

                spyOn(ConfirmDialogService, 'display');
                spyOn(ConfirmDialogService, 'close');
            });

            it('should exist', function() {
                expect(EditorCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('preview', function() {
                    it('should be false', function() {
                        expect(EditorCtrl.preview).toBe(false);
                    });
                });

                describe('editTitle', function() {
                    it('should be false', function() {
                        expect(EditorCtrl.editTitle).toBe(false);
                    });
                });

                describe('prettyMode', function() {
                    describe('if the AppCtrl has no config', function() {
                        it('should be null', function() {
                            expect(EditorCtrl.prettyMode).toBeNull();
                        });
                    });

                    describe('if the AppCtrl has a config', function() {
                        beforeEach(function() {
                            AppCtrl.config = {
                                data: {
                                    modes: [
                                        {
                                            modes: [
                                                {
                                                    name: 'Lightbox',
                                                    value: 'lightbox'
                                                },
                                                {
                                                    name: 'Lightbox, with Companion Ad',
                                                    value: 'lightbox-ads'
                                                }
                                            ]
                                        },
                                        {
                                            modes: [
                                                {
                                                    name: 'Light Text',
                                                    value: 'light'
                                                },
                                                {
                                                    name: 'Heavy Text',
                                                    value: 'full'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            };
                        });

                        it('should find the "name" for the mode\'s value', function() {
                            expect(EditorCtrl.prettyMode).toBe('Lightbox');

                            cModel.mode = 'lightbox-ads';
                            expect(EditorCtrl.prettyMode).toBe('Lightbox, with Companion Ad');

                            cModel.mode = 'light';
                            expect(EditorCtrl.prettyMode).toBe('Light Text');

                            cModel.mode = 'full';
                            expect(EditorCtrl.prettyMode).toBe('Heavy Text');
                        });
                    });
                });
            });

            describe('methods', function() {
                function assertDialogPresented() {
                    expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                        prompt: jasmine.any(String),
                        affirm: jasmine.any(String),
                        cancel: jasmine.any(String),
                        onAffirm: jasmine.any(Function),
                        onCancel: jasmine.any(Function)
                    });
                }

                function dialog() {
                    return ConfirmDialogService.display.calls.mostRecent().args[0];
                }

                describe('publish()', function() {
                    var publishDeferred;

                    beforeEach(function() {
                        publishDeferred = $q.defer();

                        spyOn(MiniReelService, 'publish')
                            .and.returnValue(publishDeferred.promise);

                        EditorCtrl.publish();
                    });

                    it('should not publish the minireel', function() {
                        expect(MiniReelService.publish).not.toHaveBeenCalled();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should publish the minireel', function() {
                            expect(MiniReelService.publish).toHaveBeenCalledWith(cModel.id);
                        });

                        it('should set the model\'s status to active after publishing', function() {
                            $scope.$apply(function() {
                                publishDeferred.resolve({});
                            });

                            expect(cModel.status).toBe('active');
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });
                });

                describe('makePrivate()', function() {
                    var unpublishDeferred;

                    beforeEach(function() {
                        unpublishDeferred = $q.defer();

                        spyOn(MiniReelService, 'unpublish')
                            .and.returnValue(unpublishDeferred.promise);

                        EditorCtrl.makePrivate();
                    });

                    it('should not unpublish the minireel', function() {
                        expect(MiniReelService.unpublish).not.toHaveBeenCalled();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should set the model\'s status to pending after unpublishing', function() {
                            $scope.$apply(function() {
                                unpublishDeferred.resolve({});
                            });

                            expect(cModel.status).toBe('pending');
                        });

                        it('should unpublish the minireel', function() {
                            expect(MiniReelService.unpublish).toHaveBeenCalledWith(cModel.id);
                        });
                    });
                });

                describe('editCard(card)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        EditorCtrl.editCard({ id: 'rc-c98312239510db' });
                    });

                    it('should transition to the editor.editCard.video state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.editCard.copy', { cardId: 'rc-c98312239510db' });
                    });
                });

                describe('newCard(insertionIndex)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        EditorCtrl.newCard(3);
                    });

                    it('should transition to the editor.newCard.type state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.newCard', { insertionIndex: 3 });
                    });
                });

                describe('deleteCard(card)', function() {
                    var card;

                    beforeEach(function() {
                        card = cModel.data.deck[1];

                        EditorCtrl.deleteCard(card);
                    });

                    it('should not remove the card from the deck', function() {
                        expect(cModel.data.deck.length).toBe(3);
                        expect(cModel.data.deck).toContain(card);
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should remove the provided card from the deck', function() {
                            expect(cModel.data.deck.length).toBe(2);
                            expect(cModel.data.deck).not.toContain(card);
                        });
                    });
                });

                describe('deleteMinireel()', function() {
                    beforeEach(function() {
                        EditorCtrl.deleteMinireel();
                    });

                    it('should display a confirmation', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        var eraseDeferred;

                        beforeEach(function() {
                            eraseDeferred = $q.defer();

                            spyOn(c6State, 'goTo');
                            spyOn(MiniReelService, 'erase').and.returnValue(eraseDeferred.promise);

                            dialog().onAffirm();
                        });

                        it('should erase the minireel', function() {
                            expect(MiniReelService.erase).toHaveBeenCalledWith(cModel.id);
                        });

                        it('should close the confirmation', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should go back to the manager after the deletion', function() {
                            expect(c6State.goTo).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                eraseDeferred.resolve(null);
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('manager');
                        });
                    });
                });

                describe('previewMode(card)', function() {
                    var session;

                    beforeEach(function() {
                        session = {
                            ping: jasmine.createSpy('session.ping()')
                        };

                        spyOn($scope, '$broadcast');
                        spyOn(cinema6, 'getSession').and.returnValue($q.when(session));
                    });
                    it('should set preview mode to true', function() {
                        EditorCtrl.previewMode();
                        expect(EditorCtrl.preview).toBe(true);
                    });

                    it('should ping the parent with the "stateChange" event', function() {
                        $scope.$apply(function() {
                            EditorCtrl.previewMode();
                        });

                        expect(session.ping).toHaveBeenCalledWith('stateChange', { name: 'editor.preview' });
                    });

                    describe('without a card', function() {
                        it('should $broadcast the experience without a card', function() {
                            EditorCtrl.previewMode();
                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[1]).toBe(cModel);
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(undefined);
                        });
                    });

                    describe('with a card', function() {
                        it('should $broadcast the experience with a card', function() {
                            var card = {};
                            EditorCtrl.previewMode(card);
                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[1]).toBe(cModel);
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(card);
                        });
                    });
                });

                describe('closePreview()', function() {
                    it('should set preview mode to false', function() {
                        spyOn($scope, '$broadcast');
                        EditorCtrl.closePreview();
                        expect(EditorCtrl.preview).toBe(false);
                        expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:reset');
                    });
                });

                describe('save()', function() {
                    beforeEach(function() {
                        spyOn(MiniReelService, 'save').and.returnValue($q.when({}));
                    });

                    it('should call MiniReelService.save()', function() {
                        EditorCtrl.save();
                        expect(MiniReelService.save).toHaveBeenCalled();

                        EditorCtrl.save();
                        expect(MiniReelService.save.calls.count()).toBe(2);
                    });
                });
            });

            describe('events', function() {
                describe('addCard', function() {
                    var card;

                    beforeEach(function() {
                        card = {};

                        $childScope.$emit('addCard', card, 1);
                    });

                    it('should insert the card into the deck at the provided index', function() {
                        var deck = cModel.data.deck;

                        expect(deck[1]).toBe(card);
                    });
                });

                describe('updateCard', function() {
                    var card;

                    beforeEach(function() {
                        card = {
                            id: 'rc-2ba11eda2b2300',
                            title: 'foo',
                            note: 'bar',
                            data: {
                                videoid:'abc',
                                service: 'vimeo'
                            }
                        };

                        $scope.$emit('updateCard', card);
                    });

                    it('should copy the properties of the provided card to the actual card in the deck', function() {
                        expect(cModel.data.deck[1]).toEqual(card);
                        expect(cModel.data.deck[1]).not.toBe(card);
                    });
                });

                describe('$destroy', function() {
                    beforeEach(function() {
                        MiniReelService.opened.player = {};
                        MiniReelService.opened.editor = {};

                        spyOn(MiniReelService, 'close').and.callThrough();
                        spyOn(MiniReelService, 'save').and.callFake(function() {
                            if (!MiniReelService.opened.player || !MiniReelService.opened.editor) {
                                throw new Error('Can\'t save if there\'s nothing open.');
                            }

                            return $q.when({});
                        });
                        spyOn(EditorCtrl, 'save').and.callThrough();

                        $scope.$emit('$destroy');
                    });

                    it('should save the minireel', function() {
                        expect(EditorCtrl.save).toHaveBeenCalled();
                    });

                    it('should close the current MiniReel', function() {
                        expect(MiniReelService.close).toHaveBeenCalled();
                    });

                    describe('if the minireel is active', function() {
                        beforeEach(function() {
                            MiniReelService.opened.player = {};
                            MiniReelService.opened.editor = {};
                            EditorCtrl.save.calls.reset();

                            cModel.status = 'active';

                            $scope.$emit('$destroy');
                        });

                        it('should not save the minireel', function() {
                            expect(EditorCtrl.save).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('mode and autoplay', function() {
                    it('should broadcast mrPreview:updateMode and send experience', function() {
                        spyOn($scope, '$broadcast');
                        $scope.$digest();
                        EditorCtrl.model.mode = 'full';
                        $scope.$digest();

                        expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateMode');
                        expect($scope.$broadcast.calls.argsFor(0)[1].mode).toEqual('full');

                        EditorCtrl.model.data.autoplay = true;
                        $scope.$digest();

                        expect($scope.$broadcast.calls.argsFor(1)[0]).toBe('mrPreview:updateMode');
                        expect($scope.$broadcast.calls.argsFor(1)[1].data.autoplay).toBe(true);
                    });
                });

                describe('model', function() {
                    beforeEach(function() {
                        spyOn(EditorCtrl, 'save');
                    });

                    it('should save the minireel (debounced) every time it is changed', function() {
                        $scope.$apply(function() {
                            cModel.title = 'Foo!';
                        });
                        $timeout.flush();
                        expect(EditorCtrl.save).toHaveBeenCalled();

                        $scope.$apply(function() {
                            cModel.data.deck[0].videoid = '4fh3944f';
                        });
                        $timeout.flush();
                        expect(EditorCtrl.save.calls.count()).toBe(2);
                    });

                    describe('if the minireel is active', function() {
                        beforeEach(function() {
                            EditorCtrl.save.calls.reset();

                            $scope.$apply(function() {
                                cModel.status = 'active';
                            });
                        });

                        it('should not autosave', function() {
                            expect(function() {
                                $timeout.flush();
                            }).toThrow();
                            expect(EditorCtrl.save).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                cModel.data.deck[1].title = 'Bar';
                            });
                            expect(function() {
                                $timeout.flush();
                            }).toThrow();
                            expect(EditorCtrl.save).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
