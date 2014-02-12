(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('BallotVoteModuleController', function() {
            var $rootScope,
                $scope,
                $controller,
                BallotVoteModuleCtrl;

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

                    BallotVoteModuleCtrl = $controller('BallotVoteModuleController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(BallotVoteModuleCtrl).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('vote(index)', function() {
                        it('should set $scope.vote to the provided value', function() {
                            BallotVoteModuleCtrl.vote(1);
                            expect($scope.vote).toBe(1);

                            BallotVoteModuleCtrl.vote(0);
                            expect($scope.vote).toBe(0);

                            BallotVoteModuleCtrl.vote(3);
                            expect($scope.vote).toBe(3);
                        });
                    });
                });
            });
        });
    });
}());
