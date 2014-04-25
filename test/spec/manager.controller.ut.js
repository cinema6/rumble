(function() {
    'use strict';

    define(['manager'], function() {
        describe('ManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                ConfirmDialogService,
                MiniReelService,
                ManagerCtrl;

            var model,
                c6State;

            beforeEach(function() {
                model = [];

                module('c6.state', function($provide) {
                    $provide.provider('c6State', function() {
                        this.$get = function() {
                            return {
                                goTo: jasmine.createSpy('c6State.transitionTo()')
                            };
                        };

                        this.state = function() { return this; };
                        this.index = function() { return this; };
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    $q = $injector.get('$q');

                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    ManagerCtrl = $controller('ManagerController', { $scope: $scope, cModel: model });
                });

                spyOn(ConfirmDialogService, 'display');
                spyOn(ConfirmDialogService, 'close');
            });

            it('should exist', function() {
                expect(ManagerCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('filter', function() {
                    it('should be initialized as "all"', function() {
                        expect(ManagerCtrl.filter).toBe('all');
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

                describe('copy(minireelId)', function() {
                    var minireel,
                        newMiniReel;

                    beforeEach(function() {
                        minireel = {};
                        newMiniReel = {
                            id: 'e-a48e32a8c1a87f'
                        };

                        spyOn(MiniReelService, 'open').and.returnValue($q.when(minireel));
                        spyOn(MiniReelService, 'create').and.returnValue(newMiniReel);

                        $scope.$apply(function() {
                            ManagerCtrl.copy('e-abc');
                        });
                    });

                    it('should not create a minireel', function() {
                        expect(MiniReelService.create).not.toHaveBeenCalled();
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
                            $scope.$apply(function() {
                                dialog().onAffirm();
                            });
                        });

                        it('should open the minireel with the id provided, create a new one based on it, and go to the editor with that minireel', function() {
                            expect(MiniReelService.open).toHaveBeenCalledWith('e-abc');
                            expect(MiniReelService.create).toHaveBeenCalledWith(minireel);
                            expect(c6State.goTo).toHaveBeenCalledWith('editor.setMode.category', { minireelId: 'e-a48e32a8c1a87f' });
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                });

                describe('edit(minireel)', function() {
                    beforeEach(function() {
                        ManagerCtrl.edit({ id: 'e-59c8519cc4c54f' });
                    });

                    it('should transition to the "editor" state and provide the id of the minireel', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor', { minireelId: 'e-59c8519cc4c54f' });
                    });
                });

                describe('makePublic(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            status: 'pending'
                        };

                        spyOn(MiniReelService, 'publish');
                        ManagerCtrl.makePublic(minireel);
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
                            expect(MiniReelService.publish).toHaveBeenCalledWith(minireel);
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });
                });

                describe('makePrivate(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            status: 'active'
                        };

                        spyOn(MiniReelService, 'unpublish');
                        ManagerCtrl.makePrivate(minireel);
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

                        it('should unpublish the minireel', function() {
                            expect(MiniReelService.unpublish).toHaveBeenCalledWith(minireel);
                        });
                    });
                });

                describe('remove(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {};

                        ManagerCtrl.remove(minireel);
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
                });

                describe('determineInclusionWithFilter(minireel)', function() {
                    var active, pending,
                        fn;

                    beforeEach(function() {
                        active = { status: 'active' };
                        pending = { status: 'pending' };

                        fn = ManagerCtrl.determineInclusionWithFilter;
                    });

                    describe('if the filter is "all"', function() {
                        beforeEach(function() {
                            ManagerCtrl.filter = 'all';
                        });

                        it('should always be true', function() {
                            expect(fn(active)).toBe(true);
                            expect(fn(pending)).toBe(true);
                        });
                    });

                    describe('if the filter is "active"', function() {
                        beforeEach(function() {
                            ManagerCtrl.filter = 'active';
                        });

                        it('should return true only for active minireels', function() {
                            expect(fn(active)).toBe(true);
                            expect(fn(pending)).toBe(false);
                        });
                    });

                    describe('if the filter is "pending"', function() {
                        beforeEach(function() {
                            ManagerCtrl.filter = 'pending';
                        });

                        it('should return true only for pending minireels', function() {
                            expect(fn(active)).toBe(false);
                            expect(fn(pending)).toBe(true);
                        });
                    });
                });
            });
        });
    });
}());
