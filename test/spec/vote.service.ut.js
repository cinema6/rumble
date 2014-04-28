(function() {
    'use strict';

    define(['services'], function() {
        /* global angular:true */
        var copy = angular.copy,
            extend = angular.extend;

        describe('VoteService', function() {
            var VoteService;

            var $httpBackend;

            var minireel;

            beforeEach(function() {
                /* jshint quotmark:false */
                minireel = {
                    "id": "e-80fcd03196b3d2",
                    "uri": "rumble",
                    "appUriPrefix": "<%= settings.appUrl %>",
                    "appUri": "rumble",
                    "title": "Rumble Video",
                    "subtitle": "You choose",
                    "summary": "Pick the best",
                    "img": {},
                    "org": "o-d1f0be2ea473cb",
                    "status": "pending",
                    "created": "2014-02-08T10:42:51+00:00",
                    "lastModified": "2014-04-18T14:07:20+00:00",
                    "mode": "light",
                    "data": {
                        "branding": "elitedaily",
                        "deck": [
                            {
                                "id": "rc-22119a8cf9f755",
                                "type": "youtube",
                                "title": "Epic Sax Guy",
                                "note": "He's back, and saxier than ever.",
                                "source": "YouTube",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Catchy",
                                        "Annoying"
                                    ]
                                },
                                "data": {
                                    "videoid": "gy1B3agGNxw",
                                    "start": 42,
                                    "end": 130,
                                    "rel": 0,
                                    "modestbranding": 1
                                }
                            },
                            {
                                "id": "rc-2d46a04b21b073",
                                "type": "ad",
                                "ad": true,
                                "modules": [
                                    "displayAd"
                                ],
                                "data": {
                                    "autoplay": true
                                },
                                "displayAd": "http://2.bp.blogspot.com/-TlM_3FT89Y0/UMzLr7kVykI/AAAAAAAACjs/lKrdhgp6OQg/s1600/brad-turner.jpg"
                            },
                            {
                                "id": "rc-4770a2d7f85ce0",
                                "type": "dailymotion",
                                "title": "Kristen Stewart for Channel",
                                "note": "Psychotic glamour",
                                "source": "DailyMotion",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Funny",
                                        "Lame"
                                    ]
                                },
                                "data": {
                                    "videoid": "x18b09a",
                                    "related": 0
                                }
                            },
                            {
                                "id": "rc-e489d1c6359fb3",
                                "type": "vimeo",
                                "title": "Aquatic paradise",
                                "note": "How may we help you?",
                                "source": "Vimeo",
                                "modules": [],
                                "data": {
                                    "videoid": "81766071",
                                    "start": 35,
                                    "end": 45
                                }
                            },
                            {
                                "id": "rc-89094f9b7f8c93",
                                "type": "vimeo",
                                "title": "ShapeShifter",
                                "note": "Pretty cool.",
                                "source": "Vimeo",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Cool",
                                        "Boring"
                                    ]
                                },
                                "data": {
                                    "videoid": "18439821"
                                }
                            },
                            {
                                "id": "rc-e2947c9bec017e",
                                "type": "youtube",
                                "title": "Geek cool",
                                "note": "Doctor Who #11 meets #4",
                                "source": "YouTube",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Too Cool",
                                        "Too Geeky"
                                    ]
                                },
                                "data": {
                                    "videoid": "Cn9yJrrm2tk",
                                    "rel": 0,
                                    "modestbranding": 1,
                                    "end": 18
                                }
                            },
                            {
                                "id": "rc-99b87ea709d7ac",
                                "type": "dailymotion",
                                "title": "Farting dogs",
                                "note": "Enough said",
                                "source": "DailyMotion",
                                "modules": [],
                                "data": {
                                    "videoid": "xorbb7",
                                    "related": 0
                                }
                            }
                        ]
                    }
                };
                /* jshint quotmark:single */

                module('c6.mrmaker');

                inject(function($injector) {
                    VoteService = $injector.get('VoteService');

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(VoteService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('initialize(minireel)', function() {
                    var success,
                        requestData,
                        response;

                    beforeEach(function() {
                        success = jasmine.createSpy('success');

                        requestData = {
                            ballot: {
                                'rc-22119a8cf9f755': {
                                    'Catchy': 0,
                                    'Annoying': 0
                                },
                                'rc-4770a2d7f85ce0': {
                                    'Funny': 0,
                                    'Lame': 0
                                },
                                'rc-89094f9b7f8c93': {
                                    'Cool': 0,
                                    'Boring': 0
                                },
                                'rc-e2947c9bec017e': {
                                    'Too Cool': 0,
                                    'Too Geeky': 0
                                }
                            }
                        };

                        response = extend(copy(requestData), { id: 'el-57048d8a02fdd6' });

                        $httpBackend.expectPOST('/api/election', copy(requestData))
                            .respond(201, response);

                        VoteService.initialize(minireel).then(success);

                        $httpBackend.flush();
                    });

                    it('should respond with the response', function() {
                        expect(success).toHaveBeenCalledWith(response);
                    });

                    it('should store the electionId on the minireel', function() {
                        expect(minireel.data.election).toBe(response.id);
                    });
                });

                describe('update(minireel)', function() {
                    var success,
                        requestData,
                        response,
                        election;

                    beforeEach(function() {
                        success = jasmine.createSpy('success');

                        election = {
                            id: 'el-6d75a6bc5b273b',
                            ballot: {
                                'rc-22119a8cf9f755': {
                                    'Catchy': 100,
                                    'Annoying': 200
                                },
                                'rc-4770a2d7f85ce0': {
                                    'Funny': 300,
                                    'Lame': 400
                                },
                                'rc-89094f9b7f8c93': {
                                    'Cool': 500,
                                    'Boring': 600
                                },
                                'rc-e2947c9bec017e': {
                                    'Too Cool': 700,
                                    'Too Geeky': 800
                                }
                            }
                        };

                        minireel.data.election = 'el-6d75a6bc5b273b';
                        minireel.data.deck.splice(2, 1);
                        minireel.data.deck.push(
                            {
                                id: 'rc-d9e637e92002cc',
                                modules: ['ballot'],
                                ballot: {
                                    choices: ['Stobered It', 'Minznered It']
                                }
                            },
                            {
                                id: 'rc-7f405190bc796e',
                                modules: []
                            }
                        );

                        requestData = {
                            ballot: {
                                'rc-22119a8cf9f755': {
                                    'Catchy': 100,
                                    'Annoying': 200
                                },
                                'rc-89094f9b7f8c93': {
                                    'Cool': 500,
                                    'Boring': 600
                                },
                                'rc-e2947c9bec017e': {
                                    'Too Cool': 700,
                                    'Too Geeky': 800
                                },
                                'rc-d9e637e92002cc': {
                                    'Stobered It': 0,
                                    'Minznered It': 0
                                }
                            }
                        };

                        response = extend(copy(requestData), { id: 'el-6d75a6bc5b273b' });

                        $httpBackend.expectGET('/api/election/el-6d75a6bc5b273b')
                            .respond(200, election);

                        $httpBackend.expectPUT('/api/election/el-6d75a6bc5b273b', copy(requestData))
                            .respond(200, response);

                        VoteService.update(minireel).then(success);

                        $httpBackend.flush();
                    });

                    it('should resolve to the updated election', function() {
                        expect(success).toHaveBeenCalledWith(response);
                    });
                });
            });
        });
    });
}());
