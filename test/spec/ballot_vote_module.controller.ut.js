define(['minireel','modules/ballot'], function(minireelModule, ballotModule) {
    'use strict';

    describe('BallotVoteModuleController', function() {
        var $rootScope,
            $scope,
            $controller,
            BallotVoteModuleCtrl;

        var BallotService;

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.value('$log', {
                    context: function() {
                        return {
                            info: function() {},
                            error: function() {}
                        };
                    }
                });
            });

            module(minireelModule.name, function($provide) {
                $provide.service('BallotService', ['$q',
                function                          ( $q ) {
                    var self = this;

                    this.getBallot = jasmine.createSpy('BallotService.getBallot()')
                        .and.callFake(function() {
                            return self._.getBallotDeferred.promise;
                        });

                    this.vote = jasmine.createSpy('BallotService.vote()')
                        .and.returnValue($q.defer().promise);

                    this._ = {
                        getBallotDeferred: $q.defer()
                    };
                }]);
            });
            module(ballotModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                BallotService = $injector.get('BallotService');

                $scope = $rootScope.$new();
                $scope.cardId = 'rc-76tfg5467ug';
                $scope.ballot = {
                    prompt: 'How did it go?',
                    choices: [
                        'Catchy',
                        'Lame'
                    ]
                };

                BallotVoteModuleCtrl = $controller('BallotVoteModuleController', { $scope: $scope });
            });
        });

        it('should exist', function() {
            expect(BallotVoteModuleCtrl).toEqual(jasmine.any(Object));
        });

        describe('@public', function() {
            describe('methods', function() {
                describe('vote(index, ballot)', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').and.callThrough();
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

                        expect(BallotService.vote).toHaveBeenCalledWith($scope.cardId, 1);
                    });
                });

                describe('pass()', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').and.callThrough();
                    });

                    it('should set the vote to -1', function() {
                        expect($scope.vote).not.toBe(-1);

                        BallotVoteModuleCtrl.pass();
                        expect($scope.vote).toBe(-1);
                    });

                    it('should emit "<ballot-vote-module>:vote"', function() {
                        BallotVoteModuleCtrl.pass();
                        expect($scope.$emit).toHaveBeenCalledWith('<ballot-vote-module>:vote', -1);
                    });
                });
            });
        });
    });
});
