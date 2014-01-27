(function() {
    'use strict';

    define(['mini_reel_card'], function() {
        describe('MiniReelCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                MiniReelCardCtrl;

            var cinema6;

            beforeEach(function() {
                cinema6 = {
                    db: {
                        find: jasmine.createSpy('cinema6.db.find()'),
                        _: {
                            mocks: {
                                '{"id":["1","2","3"]}': []
                            }
                        },
                        mock: jasmine.createSpy('cinema6.db.mock')
                            .andCallFake(function() {
                                return cinema6.db;
                            })
                    }
                };

                module('c6.rumble', function($provide) {
                    $provide.factory('cinema6', function($q) {
                        cinema6.db.find.andCallFake(function(query) {
                            var deferred = $q.defer(),
                                mock = cinema6.db._.mocks[angular.toJson(query)];

                            if (mock) {
                                deferred.resolve(mock);
                            } else {
                                deferred.reject({ code: 404 });
                            }

                            return deferred.promise;
                        });

                        return cinema6;
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $rootScope.config = {
                        id: 'rc-235d41cde02032',
                        data: {
                            query: {
                                id: ['1', '2', '3']
                            }
                        }
                    };
                    $rootScope.active = false;
                    $rootScope.onDeck = false;
                    $scope = $rootScope.$new();
                    MiniReelCardCtrl = $controller('MiniReelCardController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(MiniReelCardCtrl).toBeDefined();
            });

            describe('$watchers on', function() {
                describe('onDeck', function() {
                    describe('when false', function() {
                        beforeEach(function() {
                            $rootScope.$digest();
                        });

                        it('should not fetch experiences', function() {
                            expect(cinema6.db.find).not.toHaveBeenCalled();
                        });
                    });

                    describe('when true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $rootScope.onDeck = true;
                            });
                        });

                        it('should fetch the experiences', function() {
                            expect(cinema6.db.find).toHaveBeenCalledWith($rootScope.config.data.query);
                            expect(MiniReelCardCtrl.miniReels).toBe(cinema6.db._.mocks['{"id":["1","2","3"]}']);
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('miniReels', function() {
                        it('should be null', function() {
                            expect(MiniReelCardCtrl.miniReels).toBeNull();
                        });
                    });
                });
            });
        });
    });
}());
