define(['minireel','modules/ballot'], function(minireelModule, ballotModule) {
    'use strict';

    describe('BallotResultsModuleController', function() {
        var $rootScope,
            $scope,
            $controller,
            BallotResultsModuleCtrl;

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

            module(minireelModule.name, function($provide) {
                $provide.service('BallotService', ['$q',
                function                          ( $q ) {
                    var self = this;

                    this.getBallot = jasmine.createSpy('rumbleVotes.getReturnsForItem()')
                        .and.callFake(function() {
                            return self._.getBallotDeferred.promise;
                        });

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
                    expect(BallotService.getBallot).not.toHaveBeenCalled();

                    $scope.$apply(function() {
                        $scope.fetchWhen = true;
                    });
                });

                it('should get vote results', function() {
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

                    expect(BallotResultsModuleCtrl.ballot).toBe(ballot);
                });
            });
        });

        describe('@public', function() {
            describe('properties', function() {
                describe('ballot', function() {
                    it('should be initialized as null', function() {
                        expect(BallotResultsModuleCtrl.ballot).toBeNull();
                    });
                });
            });
        });
    });
});
