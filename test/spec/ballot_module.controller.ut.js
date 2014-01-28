(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('BallotModuleController', function() {
            var $rootScope,
                $scope,
                $controller,
                BallotModuleCtrl;

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
                    $scope.fetchResultsWhen = false;

                    BallotModuleCtrl = $controller('BallotModuleController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(BallotModuleCtrl).toEqual(jasmine.any(Object));
            });

            describe('$watchers', function() {
                describe('fetchResultsWhen', function() {
                    beforeEach(function() {
                        expect(rumbleVotes.getReturnsForItem).not.toHaveBeenCalled();

                        $scope.$apply(function() {
                            $scope.fetchResultsWhen = true;
                        });
                    });

                    it('should get vote results', function() {
                        var votes = [0.44, 0.22, 0.99];

                        expect(rumbleVotes.getReturnsForItem).toHaveBeenCalledWith($scope.cardId);

                        $scope.$apply(function() {
                            rumbleVotes._.getReturnsForItemDeferred.resolve(votes);
                        });

                        expect(BallotModuleCtrl.results).toBe(votes);
                    });
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('results', function() {
                        it('should be initialized as null', function() {
                            expect(BallotModuleCtrl.results).toBeNull();
                        });
                    });
                });

                describe('methods', function() {
                    describe('vote(index)', function() {
                        it('should set $scope.vote to the provided value', function() {
                            BallotModuleCtrl.vote(1);
                            expect($scope.vote).toBe(1);

                            BallotModuleCtrl.vote(0);
                            expect($scope.vote).toBe(0);

                            BallotModuleCtrl.vote(3);
                            expect($scope.vote).toBe(3);
                        });
                    });
                });
            });
        });
    });
}());
