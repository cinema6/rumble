(function() {
    'use strict';

    define(['manager'], function() {
        describe('ManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
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

                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    ManagerCtrl = $controller('ManagerController', { $scope: $scope, cModel: model });
                });
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
                describe('edit(minireel)', function() {
                    beforeEach(function() {
                        ManagerCtrl.edit({ id: 'e-59c8519cc4c54f' });
                    });

                    it('should transition to the "editor" state and provide the id of the minireel', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor', { minireelId: 'e-59c8519cc4c54f' });
                    });
                });

                describe('makeActive(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            status: 'pending'
                        };
                    });

                    it('should make the minireel\'s status "active"', function() {
                        ManagerCtrl.makeActive(minireel);

                        expect(minireel.status).toBe('active');
                    });
                });

                describe('makePending(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            status: 'active'
                        };
                    });

                    it('should make the minireel\'s status "pending"', function() {
                        ManagerCtrl.makePending(minireel);

                        expect(minireel.status).toBe('pending');
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
