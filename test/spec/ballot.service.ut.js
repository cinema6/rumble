(function() {
    'use strict';

    define(['rumble'], function() {
        describe('BallotService', function() {
            var $rootScope,
                $q,
                BallotService;

            var $httpBackend;

            var id = 'e-a9af55ce25690c';

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    $httpBackend = $injector.get('$httpBackend');

                    BallotService = $injector.get('BallotService');
                });
            });

            it('should exist', function() {
                expect(BallotService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('init', function() {
                        it('should exist', function() {
                            expect(BallotService.init).toEqual(jasmine.any(Function));
                        });
                    });

                    describe('getElection()', function() {
                        var success, failure;

                        beforeEach(function() {
                            success = jasmine.createSpy('getElection() success');
                            failure = jasmine.createSpy('getElection() failure');

                            $httpBackend.expectGET('/api/election/' + id)
                                .respond(200, {
                                    id: 'e-80fcd03196b3d2',
                                    ballot: {
                                        'rc-22119a8cf9f755': {
                                            'Catchy': 0.5,
                                            'Painful': 0.5
                                        },
                                        'rc-4770a2d7f85ce0': {
                                            'Funny': 0,
                                            'Lame': 1
                                        },
                                        'rc-e489d1c6359fb3': {
                                            'Cute': 0,
                                            'Ugly': 0
                                        },
                                        'rc-e2947c9bec017e': {
                                            'Cool': 0,
                                            'Geeky': 0
                                        },
                                        'rc-99b87ea709d7ac': {
                                            'Funny': 0,
                                            'Gross': 0
                                        }
                                    }
                                });

                            BallotService.init(id);

                            BallotService.getElection().then(success, failure);
                        });

                        it('should make a request to the vote service', function() {
                            $httpBackend.flush();
                        });

                        it('should resolve with the processed results of the election', function() {
                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith({
                                'rc-22119a8cf9f755': [
                                    {
                                        name: 'Catchy',
                                        votes: 0.5
                                    },
                                    {
                                        name: 'Painful',
                                        votes: 0.5
                                    }
                                ],
                                'rc-4770a2d7f85ce0': [
                                    {
                                        name: 'Funny',
                                        votes: 0
                                    },
                                    {
                                        name: 'Lame',
                                        votes: 1
                                    }
                                ],
                                'rc-e489d1c6359fb3': [
                                    {
                                        name: 'Cute',
                                        votes: 0.5
                                    },
                                    {
                                        name: 'Ugly',
                                        votes: 0.5
                                    }
                                ],
                                'rc-e2947c9bec017e': [
                                    {
                                        name: 'Cool',
                                        votes: 0.5
                                    },
                                    {
                                        name: 'Geeky',
                                        votes: 0.5
                                    }
                                ],
                                'rc-99b87ea709d7ac': [
                                    {
                                        name: 'Funny',
                                        votes: 0.5
                                    },
                                    {
                                        name: 'Gross',
                                        votes: 0.5
                                    }
                                ]
                            });
                        });

                        it('should cache the election for the getBallot() method', function() {
                            success = jasmine.createSpy('getBallot() success');

                            $httpBackend.flush();

                            expect(function() {
                                $rootScope.$apply(function() {
                                    BallotService.getBallot('rc-4770a2d7f85ce0').then(success);
                                });
                            }).not.toThrow();

                            expect(success).toHaveBeenCalledWith([
                                {
                                    name: 'Funny',
                                    votes: 0
                                },
                                {
                                    name: 'Lame',
                                    votes: 1
                                }
                            ]);
                        });
                    });

                    describe('getBallot(id)', function() {
                        var success, failure;

                        beforeEach(function() {
                            success = jasmine.createSpy('getBallot() success');
                            failure = jasmine.createSpy('getBallot() failure');

                            BallotService.init(id);

                            $httpBackend.expectGET('/api/election/' + id + '/ballot/b1')
                                .respond(200, {
                                    id: id,
                                    ballot: {
                                        b1: {
                                            Cool: 0.25,
                                            Lame: 0.75
                                        }
                                    }
                                });

                            BallotService.getBallot('b1').then(success, failure);

                            $httpBackend.flush();
                        });

                        it('should return an object with the requested data', function() {
                            expect(success).toHaveBeenCalledWith([
                                {
                                    name: 'Cool',
                                    votes: 0.25
                                },
                                {
                                    name: 'Lame',
                                    votes: 0.75
                                }
                            ]);
                        });

                        it('should split the votes evenly if the vote percentages are 0', function() {
                            $httpBackend.expectGET('/api/election/' + id + '/ballot/b2')
                                .respond(200, {
                                    id: id,
                                    ballot: {
                                        b2: {
                                            'Too Funny': 0,
                                            'Too Far': 0
                                        }
                                    }
                                });

                            BallotService.getBallot('b2').then(success, failure);

                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith([
                                {
                                    name: 'Too Funny',
                                    votes: 0.5
                                },
                                {
                                    name: 'Too Far',
                                    votes: 0.5
                                }
                            ]);

                            $httpBackend.expectGET('/api/election/' + id + '/ballot/b3')
                                .respond(200, {
                                    id: id,
                                    ballot: {
                                        b3: {
                                            'Sweet': 0,
                                            'Sour': 0,
                                            'Savory': 0
                                        }
                                    }
                                });

                            BallotService.getBallot('b3').then(success, failure);

                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith([
                                {
                                    name: 'Sweet',
                                    votes: 1/3
                                },
                                {
                                    name: 'Sour',
                                    votes: 1/3
                                },
                                {
                                    name: 'Savory',
                                    votes: 1/3
                                }
                            ]);
                        });
                    });

                    describe('vote(id, name)', function() {
                        var success, failure;

                        beforeEach(function() {
                            success = jasmine.createSpy('vote() success');
                            failure = jasmine.createSpy('vote() failure');

                            BallotService.init(id);

                            $httpBackend.expectPOST('/api/vote', {
                                election: id,
                                ballotItem: 'b1',
                                vote: 'Cool'
                            }).respond(200, 'OK');

                            BallotService.vote('b1', 'Cool').then(success, failure);
                        });

                        it('should post the vote to the api', function() {
                            $httpBackend.flush();
                        });

                        it('should resolve with "true"', function() {
                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith(true);
                        });
                    });
                });
            });
        });
    });
}());