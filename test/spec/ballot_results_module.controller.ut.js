(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('BallotResultsModuleController', function() {
            var $rootScope,
                $scope,
                $controller,
                BallotResultsModuleCtrl;

            var rumbleVotes;

            beforeEach(function() {
                module('c6.rumble', function($provide) {
                    $provide.service('rumbleVotes', ['$q',
                    function                        ( $q ) {
                        var self = this;

                        this.getReturnsForItem = jasmine.createSpy('rumbleVotes.getReturnsForItem()')
                            .andCallFake(function() {
                                return self._.getReturnsForItemDeferred.promise;
                            });

                        this._ = {
                            getReturnsForItemDeferred: $q.defer()
                        };
                    }]);
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    rumbleVotes = $injector.get('rumbleVotes');

                    $scope = $rootScope.$new();
                    $scope.cardId = 'rc-76tfg5467ug';
                    $scope.fetchWhen = false;

                    BallotResultsModuleCtrl = $controller('BallotResultsModuleController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(BallotResultsModuleCtrl).toEqual(jasmine.any(Object));
            });

            describe('$watchers', function() {
                describe('fetchWhen', function() {
                    beforeEach(function() {
                        expect(rumbleVotes.getReturnsForItem).not.toHaveBeenCalled();

                        $scope.$apply(function() {
                            $scope.fetchWhen = true;
                        });
                    });

                    it('should get vote results', function() {
                        var votes = [0.44, 0.22, 0.99];

                        expect(rumbleVotes.getReturnsForItem).toHaveBeenCalledWith($scope.cardId);

                        $scope.$apply(function() {
                            rumbleVotes._.getReturnsForItemDeferred.resolve(votes);
                        });

                        expect(BallotResultsModuleCtrl.results).toBe(votes);
                    });
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('results', function() {
                        it('should be initialized as null', function() {
                            expect(BallotResultsModuleCtrl.results).toBeNull();
                        });
                    });
                });
            });
        });
    });
}());
