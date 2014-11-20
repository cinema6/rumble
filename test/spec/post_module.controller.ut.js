define(['minireel','modules/post'], function(minireelModule, postModule) {
    'use strict';

    describe('PostModuleController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            PostModuleCtrl;

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

            module(minireelModule.name);
            module(postModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');

                BallotService = $injector.get('BallotService');
                spyOn(BallotService, 'vote').and.returnValue($q.defer().promise);

                $scope = $rootScope.$new();
                $scope.cardId = 'rc-76tfg5467ug';
                $scope.ballot = {
                    prompt: 'How did it go?',
                    choices: [
                        'Catchy',
                        'Lame'
                    ]
                };

                PostModuleCtrl = $controller('PostModuleController', { $scope: $scope });
            });
        });

        it('should exist', function() {
            expect(PostModuleCtrl).toEqual(jasmine.any(Object));
        });

        describe('@public', function() {
            describe('methods', function() {
                describe('vote(index, ballot, electionId)', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').and.callThrough();
                    });

                    it('should emit "<post-module>:vote"', function() {
                        PostModuleCtrl.vote(1);
                        expect($scope.$emit).toHaveBeenCalledWith('<post-module>:vote', 1);

                        PostModuleCtrl.vote(0);
                        expect($scope.$emit).toHaveBeenCalledWith('<post-module>:vote', 0);
                    });

                    describe('when the card has a custom election ID', function() {
                        it('should pass it as third parameter to BallotService.vote()', function() {
                            $scope.ballot.election = 'el-1234567';
                            PostModuleCtrl.vote(1);

                            expect(BallotService.vote).toHaveBeenCalledWith($scope.cardId, 1, 'el-1234567');
                        });
                    });

                    describe('when the card does not have a custom election ID', function() {
                        it('should persist the vote', function() {
                            PostModuleCtrl.vote(1);

                            expect(BallotService.vote).toHaveBeenCalledWith($scope.cardId, 1, undefined);
                        });
                    });
                });
            });
        });
    });
});
