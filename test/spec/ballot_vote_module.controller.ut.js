(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('BallotVoteModuleController', function() {
            var $rootScope,
                $scope,
                $controller,
                BallotVoteModuleCtrl;

            var BallotService;

            beforeEach(function() {
                module(function($provide) {
                    $provide.value('$log', {
                        context: function() {
                            return {
                                info: function() {},
                                error: function() {}
                            };
                        }
                    });
                });

                module('c6.rumble', function($provide) {
                    $provide.service('BallotService', ['$q',
                    function                          ( $q ) {
                        var self = this;

                        this.getBallot = jasmine.createSpy('BallotService.getBallot()')
                            .andCallFake(function() {
                                return self._.getBallotDeferred.promise;
                            });

                        this.vote = jasmine.createSpy('BallotService.vote()')
                            .andReturn($q.defer().promise);

                        this._ = {
                            getBallotDeferred: $q.defer()
                        };
                    }]);
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    BallotService = $injector.get('BallotService');

                    $scope = $rootScope.$new();
                    $scope.cardId = 'rc-76tfg5467ug';
                    $scope.fetchWhen = false;

                    BallotVoteModuleCtrl = $controller('BallotVoteModuleController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(BallotVoteModuleCtrl).toEqual(jasmine.any(Object));
            });

            describe('$watchers', function() {
                describe('fetchWhen', function() {
                    beforeEach(function() {
                        expect(BallotService.getBallot).not.toHaveBeenCalled();

                        $scope.$apply(function() {
                            $scope.fetchWhen = true;
                        });
                    });

                    it('should get the ballot', function() {
                        var ballot = [
                            {
                                name: 'Foo',
                                votes: 0.25
                            },
                            {
                                name: 'Bar',
                                votes: 0.75
                            }
                        ];

                        expect(BallotService.getBallot).toHaveBeenCalledWith($scope.cardId);

                        $scope.$apply(function() {
                            BallotService._.getBallotDeferred.resolve(ballot);
                        });

                        expect(BallotVoteModuleCtrl.ballot).toBe(ballot);
                    });
                });
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('vote(index)', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.fetchWhen = true;
                            });
                            $scope.$apply(function() {
                                BallotService._.getBallotDeferred.resolve([
                                    {
                                        name: 'Too Cool',
                                        votes: 0.9
                                    },
                                    {
                                        name: 'Too Far',
                                        votes: 0.1
                                    }
                                ]);
                            });

                            spyOn($scope, '$emit').andCallThrough();
                        });

                        it('should set $scope.vote to the provided value', function() {
                            BallotVoteModuleCtrl.vote(1);
                            expect($scope.vote).toBe(1);

                            BallotVoteModuleCtrl.vote(0);
                            expect($scope.vote).toBe(0);

                            BallotVoteModuleCtrl.vote(3);
                            expect($scope.vote).toBe(3);
                        });

                        it('should emit "<ballot-vote-module>:vote"', function() {
                            BallotVoteModuleCtrl.vote(1);
                            expect($scope.$emit).toHaveBeenCalledWith('<ballot-vote-module>:vote', 1);

                            BallotVoteModuleCtrl.vote(0);
                            expect($scope.$emit).toHaveBeenCalledWith('<ballot-vote-module>:vote', 0);
                        });

                        it('should persist the vote', function() {
                            BallotVoteModuleCtrl.vote(1);

                            expect(BallotService.vote).toHaveBeenCalledWith($scope.cardId, 'Too Far');
                        });
                    });

                    describe('pass()', function() {
                        it('should set the vote to -1', function() {
                            expect($scope.vote).not.toBe(-1);

                            BallotVoteModuleCtrl.pass();
                            expect($scope.vote).toBe(-1);
                        });
                    });
                });
            });
        });
    });
}());
