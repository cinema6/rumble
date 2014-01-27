(function() {
    'use strict';

    define(['ballot_module'], function() {
        describe('BallotModuleController', function() {
            var $rootScope,
                $scope,
                $controller,
                BallotModuleCtrl;

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    BallotModuleCtrl = $controller('BallotModuleController', { $scope: $scope });
                });
            });

            it('should exist', function() {
                expect(BallotModuleCtrl).toEqual(jasmine.any(Object));
            });

            describe('events', function() {
                describe('onDeck', function() {
                    beforeEach(function() {
                        $rootScope.$broadcast('onDeck');
                    });

                    it('should get vote results', function() {
                        
                    });
                });
            });

            describe('@public', function() {
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
