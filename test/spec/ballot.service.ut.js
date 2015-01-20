define(['app'], function(appModule) {
    'use strict';

    describe('BallotService', function() {
        var $rootScope,
            $q,
            $win,
            BallotService;

        var $httpBackend;

        var elData, elDataOld, ballotMap, oneThird = Math.round((1/3) * 100) / 100 ;

        beforeEach(function() {
            ballotMap = {
                'rc-22119a8cf9f755': [ 'Catchy','Painful' ],
                'rc-4770a2d7f85ce0': [ 'Funny', 'Lame' ],
                'rc-e489d1c6359fb3': [ 'Cute','Ugly' ],
                'rc-e2947c9bec017e': [ 'Cool','Geeky' ],
                'rc-99b87ea709d7ac': [ 'Funny','Gross','Strange'],
                'rc-2c8875ab60d386': [ 'Hot','Not' ]
            };

            elDataOld = {
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
                        'Gross': 0,
                        'Strange': 0
                    }
                }
            };

            elData = {
                id: 'e-38fb0b1af9b047',
                ballot: {
                    'rc-22119a8cf9f755': [ 0.5, 0.5 ],
                    'rc-4770a2d7f85ce0': [ 0, 1 ],
                    'rc-e489d1c6359fb3': [ 0, 0 ],
                    'rc-e2947c9bec017e': [ 0, 0 ],
                    'rc-99b87ea709d7ac': [ 0, 0, 0 ],
                    'rc-2c8875ab60d386': null
                }
            };

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');

                $httpBackend = $injector.get('$httpBackend');

                BallotService = $injector.get('BallotService');

                $win = $injector.get('$window');

                $win.c6Tracker = jasmine.createSpy('c6Tracker');
            });
        });

        it('should exist', function() {
            expect(BallotService).toEqual(jasmine.any(Object));
        });

        it('should return rejected promises if it is never initialized', function() {
            var fail = jasmine.createSpy('fail');

            $rootScope.$apply(function() {
                BallotService.getElection().catch(fail);
                BallotService.getBallot('abc').catch(fail);
                BallotService.vote('abc', 'Too Far').catch(fail);
            });

            expect(fail.calls.count()).toBe(3);
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

                    beforeEach(function(){
                        success = jasmine.createSpy('getElection() success');
                        failure = jasmine.createSpy('getElection() failure');
                    });

                    describe('legacy election data',function(){
                        beforeEach(function() {
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elDataOld.id)
                                .respond(200, elDataOld);
                        });

                        it('should resolve with the processed results of the election', function() {
                            BallotService.init(elDataOld.id,ballotMap);
                            BallotService.getElection().then(success, failure);
                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith({
                                'rc-22119a8cf9f755': [ { name : 'Catchy', votes : 0.5}, 
                                                       { name : 'Painful', votes : 0.5 } ],
                                'rc-4770a2d7f85ce0': [ { name : 'Funny', votes : 0 },
                                                       { name : 'Lame', votes : 1 }],
                                'rc-e489d1c6359fb3': [ { name : 'Cute', votes: 0.5},
                                                       { name : 'Ugly', votes: 0.5} ],
                                'rc-e2947c9bec017e': [ { name : 'Cool', votes: 0.5},
                                                       { name : 'Geeky', votes: 0.5} ],
                                'rc-99b87ea709d7ac': [ { name : 'Funny', votes: oneThird}, 
                                                       { name : 'Gross', votes: oneThird},
                                                       { name : 'Strange', votes: oneThird} ]
                            });
                        });

                        it('should cache the election for the getBallot() method', function() {
                            success = jasmine.createSpy('getBallot() success');
                            BallotService.init(elDataOld.id,ballotMap);
                            BallotService.getElection().then(success, failure);
                            $httpBackend.flush();

                            expect(function() {
                                $rootScope.$apply(function() {
                                    BallotService.getBallot('rc-4770a2d7f85ce0')
                                        .then(success);
                                });
                            }).not.toThrow();

                            expect(success).toHaveBeenCalledWith(
                                [ { name : 'Funny', votes : 0 },
                                  { name : 'Lame', votes : 1 }]
                            );
                        });
                        
                        it('should work when choice labels have changed', function() {
                            success = jasmine.createSpy('getBallot() success');

                            elDataOld.ballot['rc-4770a2d7f85ce0']= {
                                'Funny': 0,
                                'Corny': 1
                            };
                            
                            BallotService.init(elDataOld.id,ballotMap);
                            BallotService.getElection().then(success, failure);
                            $httpBackend.flush();

                            expect(function() {
                                $rootScope.$apply(function() {
                                    BallotService.getBallot('rc-4770a2d7f85ce0')
                                        .then(success);
                                });
                            }).not.toThrow();

                            expect(success).toHaveBeenCalledWith(
                                [ { name : 'Funny', votes : 0 },
                                  { name : 'Lame', votes : 1 }]
                            );
                        });
                    });

                    describe('election data', function(){
                        beforeEach(function() {
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elData.id)
                                .respond(200, elData);

                            BallotService.init(elData.id,ballotMap);
                            BallotService.getElection().then(success, failure);
                        });

                        it('should make a request to the vote service', function() {
                            $httpBackend.flush();
                        });

                        it('should not set the _legacy flag', function(){
                            $httpBackend.flush();
                            expect(BallotService._legacy).not.toBeDefined(); 
                        });

                        it('should resolve with the processed results of the election', function() {
                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith({
                                'rc-22119a8cf9f755': [ { name : 'Catchy', votes : 0.5}, 
                                                       { name : 'Painful', votes : 0.5 } ],
                                'rc-4770a2d7f85ce0': [ { name : 'Funny', votes : 0 },
                                                       { name : 'Lame', votes : 1 }],
                                'rc-e489d1c6359fb3': [ { name : 'Cute', votes: 0.5},
                                                       { name : 'Ugly', votes: 0.5} ],
                                'rc-e2947c9bec017e': [ { name : 'Cool', votes: 0.5},
                                                       { name : 'Geeky', votes: 0.5} ],
                                'rc-99b87ea709d7ac': [ { name : 'Funny', votes: oneThird}, 
                                                       { name : 'Gross', votes: oneThird},
                                                       { name : 'Strange', votes: oneThird} ],
                                'rc-2c8875ab60d386': [ { name : 'Hot', votes: 0.5},
                                                       { name : 'Not', votes: 0.5} ],
                            });
                        });

                        it('should cache the election for the getBallot() method', function() {
                            success = jasmine.createSpy('getBallot() success');

                            $httpBackend.flush();

                            expect(function() {
                                $rootScope.$apply(function() {
                                    BallotService.getBallot('rc-4770a2d7f85ce0')
                                        .then(success);
                                });
                            }).not.toThrow();

                            expect(success).toHaveBeenCalledWith(
                                [ { name : 'Funny', votes : 0 },
                                  { name : 'Lame', votes : 1 }]
                            );
                        });
                    });
                    
                });

                describe('getBallot(id)', function() {
                    var success, failure;

                    beforeEach(function(){
                        success = jasmine.createSpy('getBallot() success');
                        failure = jasmine.createSpy('getBallot() failure');
                    });

                    describe('legacy election data',function(){
                        beforeEach(function() {
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elDataOld.id)
                                .respond(200, elDataOld);

                        });

                        it('should return an object with the requested data', function() {
                            BallotService.init(elDataOld.id,ballotMap);

                            BallotService.getBallot('rc-4770a2d7f85ce0')
                                .then(success, failure);

                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith(
                                [ { name : 'Funny', votes : 0 },
                                  { name : 'Lame', votes : 1 }]
                            );
                        });

                        it('should split the votes evenly if the vote percentages are 0',
                            function() {
                            BallotService.init(elDataOld.id,ballotMap);

                            BallotService.getBallot('rc-4770a2d7f85ce0')
                                .then(success, failure);

                            $httpBackend.flush();
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elDataOld.id)
                                .respond(200, elDataOld);

                            $rootScope.$apply(function() {
                                BallotService.getBallot('rc-e489d1c6359fb3')
                                    .then(success, failure);
                            });

                            expect(success).toHaveBeenCalledWith([ 
                                { name : 'Cute', votes: 0.5},
                                { name : 'Ugly', votes: 0.5} 
                            ]);
                            success.calls.reset();

                            $rootScope.$apply(function() {
                                BallotService.getBallot('rc-99b87ea709d7ac')
                                    .then(success, failure);
                            });

                            expect(success).toHaveBeenCalledWith([
                                { name : 'Funny', votes: oneThird}, 
                                { name : 'Gross', votes: oneThird},
                                { name : 'Strange', votes: oneThird} 
                            ]);
                        });

                        it('should split votes if election data doesnt add up',function(){
                            elDataOld.ballot['rc-4770a2d7f85ce0']= {
                                'Funny': 0.10,
                                'Corny': 0.10,
                                'Weird': 0.80 
                            };
                            
                            BallotService.init(elDataOld.id,ballotMap);

                            BallotService.getBallot('rc-4770a2d7f85ce0')
                                .then(success, failure);

                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith(
                                [ { name : 'Funny', votes : 0.5 },
                                  { name : 'Lame', votes : 0.5 }]
                            );
                        

                        });
                    });
                    
                    describe('election data',function(){
                        beforeEach(function() {
                            BallotService.init(elData.id,ballotMap);

                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elData.id)
                                .respond(200, elData);

                            BallotService.getBallot('rc-4770a2d7f85ce0')
                                .then(success, failure);

                            $httpBackend.flush();
                        });

                        it('should return an object with the requested data', function() {
                            expect(success).toHaveBeenCalledWith(
                                [ { name : 'Funny', votes : 0 },
                                  { name : 'Lame', votes : 1 }]
                            );
                        });

                        it('should split the votes evenly if the vote percentages are 0',
                            function() {
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elData.id)
                                .respond(200, elData);

                            $rootScope.$apply(function() {
                                BallotService.getBallot('rc-e489d1c6359fb3')
                                    .then(success, failure);
                            });

                            expect(success).toHaveBeenCalledWith([ 
                                { name : 'Cute', votes: 0.5},
                                { name : 'Ugly', votes: 0.5} 
                            ]);

                            success.calls.reset();
                            $rootScope.$apply(function() {
                                BallotService.getBallot('rc-99b87ea709d7ac')
                                    .then(success, failure);
                            });

                            expect(success).toHaveBeenCalledWith([
                                { name : 'Funny', votes: oneThird}, 
                                { name : 'Gross', votes: oneThird},
                                { name : 'Strange', votes: oneThird} 
                            ]);
                        });
                    });
                });

                describe('vote(id, name, idOverride)', function() {
                    var success, failure;

                    beforeEach(function(){
                        success = jasmine.createSpy('vote() success');
                        failure = jasmine.createSpy('vote() failure');
                    });

                    describe('legacy data',function(){
                        beforeEach(function() {
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elDataOld.id)
                                .respond(200, elDataOld);
                        });

                        it('should resolve with "true"', function() {
                            BallotService.init(elDataOld.id,ballotMap);
                            BallotService.getElection();
                            $httpBackend.flush();
                            
                            $httpBackend.expectPOST('http://portal.cinema6.com/api/public/vote', {
                                election: elDataOld.id,
                                ballotItem: 'rc-22119a8cf9f755',
                                vote: 'Painful'
                            }).respond(200, 'OK');
                            
                            BallotService.vote('rc-22119a8cf9f755', 1)
                                .then(success, failure);
                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith(true);
                        });
                        
                        it('should work when ballotMap and election data have different labels', function() {
                            ballotMap['rc-22119a8cf9f755'] = [ 'Catchy','Crappy' ];
                            BallotService.init(elDataOld.id,ballotMap);
                            BallotService.getElection();
                            $httpBackend.flush();
                            
                            $httpBackend.expectPOST('http://portal.cinema6.com/api/public/vote', {
                                election: elDataOld.id,
                                ballotItem: 'rc-22119a8cf9f755',
                                vote: 'Painful'
                            }).respond(200, 'OK');
                            
                            BallotService.vote('rc-22119a8cf9f755', 1)
                                .then(success, failure);
                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith(true);
                        });
                    });
                    
                    describe('data',function(){
                        beforeEach(function() {
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elData.id)
                                .respond(200, elData);

                            BallotService.init(elData.id,ballotMap);
                            BallotService.getElection();
                            $httpBackend.flush();
                            
                            $httpBackend.expectPOST('http://portal.cinema6.com/api/public/vote', {
                                election: elData.id,
                                ballotItem: 'rc-22119a8cf9f755',
                                vote: 1 
                            }).respond(200, 'OK');
                            
                        });

                        it('should post the vote to the api', function() {
                            BallotService.vote('rc-22119a8cf9f755', 1)
                                .then(success, failure);
                            $httpBackend.flush();
                        });

                        it('should resolve with "true"', function() {
                            BallotService.vote('rc-22119a8cf9f755', 1)
                                .then(success, failure);
                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith(true);
                        });

                        it('should send an eventTrack',function(){
                            BallotService.vote('rc-22119a8cf9f755', 1)
                                .then(success, failure);
                            $httpBackend.flush();
                        });
                    });

                    describe('overriding the electionID', function() {
                        beforeEach(function() {
                            $httpBackend.expectGET('http://portal.cinema6.com/api/public/election/' + elData.id)
                                .respond(200, elData);

                            BallotService.init(elData.id,ballotMap);
                            BallotService.getElection();
                            $httpBackend.flush();

                            $httpBackend.expectPOST('http://portal.cinema6.com/api/public/vote', {
                                election: 'e-123-override',
                                ballotItem: 'rc-22119a8cf9f755',
                                vote: 1
                            }).respond(200, 'OK');

                        });

                        it('should post the vote to the api', function() {
                            BallotService.vote('rc-22119a8cf9f755', 1, 'e-123-override')
                                .then(success, failure);
                            $httpBackend.flush();
                        });

                        it('should resolve with "true"', function() {
                            BallotService.vote('rc-22119a8cf9f755', 1, 'e-123-override')
                                .then(success, failure);
                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith(true);
                        });
                        
                        it('should send an eventTrack',function(){
                            BallotService.vote('rc-22119a8cf9f755', 1, 'e-123-override')
                                .then(success, failure);
                            $httpBackend.flush();
                        });
                    });
                });
            });
        });
    });
});
