(function() {
    'use strict';

    define(['rumble'], function() {
        describe('MiniReelService', function() {
            var MiniReelService;

            var copy;

            beforeEach(function() {
                copy = angular.copy.bind(angular);

                module('c6.rumble', function($provide) {
                    $provide.value('rumbleVotes', {
                        mockReturnsData: angular.noop
                    });
                });

                inject(function($injector) {
                    MiniReelService = $injector.get('MiniReelService');
                });
            });

            it('should exist', function() {
                expect(MiniReelService).toBeDefined();
            });

            describe('@public', function() {
                describe('methods: ', function() {
                    describe('createPlaylist(mrData)', function() {
                        var mrData,
                            result;

                        beforeEach(function() {
                            mrData = {
                                id: 'r-738c2403d83ddc',
                                ballots: [
                                    {
                                        id: 'rb-01eb03bc062c15',
                                        choices: [
                                            {
                                                button: 'Good',
                                                most: 'The Goodest video'
                                            },
                                            {
                                                button: 'Bad',
                                                most: 'The Badest video'
                                            },
                                            {
                                                button: 'Ugly',
                                                most: 'The Ugliest video'
                                            }
                                        ]
                                    },
                                    {
                                        id: 'rb-dddd8635eb6db3',
                                        choices: [
                                            {
                                                button: 'Cool',
                                                most: 'The sweetest video'
                                            },
                                            {
                                                button: 'Lame',
                                                most: 'The lamest video'
                                            }
                                        ]
                                    }
                                ],
                                commentGroups: [
                                    {
                                        id: 'rc-90db37d7af97a7',
                                        comments: [
                                            'Hello',
                                            'What\'s up?'
                                        ]
                                    },
                                    {
                                        id: 'rc-1d98e6113fd436',
                                        comments: [
                                            'This video sucks!',
                                            'I love this video!'
                                        ]
                                    }
                                ],
                                notes: [
                                    {
                                        id: 'rn-abe1698644256e',
                                        text: 'Hello!'
                                    }
                                ],
                                playList: [
                                    {
                                        id: 'rv-22119a8cf9f755',
                                        title: 'Did someone say FOX?',
                                        note: 'Thought so',
                                        voting: [ 100, 50, 10 ],
                                        video: {
                                            player: 'youtube',
                                            videoid: 'jofNR_WkoCE',
                                            start: 10,
                                            end: 20,
                                            rel: 0,
                                            modestbranding: 1,
                                            noteId: 'rn-abe1698644256e'
                                        },
                                        ballotId: 'rb-01eb03bc062c15',
                                        commentGroupId: 'rc-1d98e6113fd436'
                                    },
                                    {
                                        id: 'rv-4770a2d7f85ce0',
                                        title: 'Kristen Stewart for Channel',
                                        note: 'Psychotic glamour',
                                        voting: [ 200, 50, 10 ],
                                        video: {
                                            player: 'dailymotion',
                                            videoid: 'x18b09a',
                                            related: 0
                                        },
                                        ballotId: 'rb-dddd8635eb6db3',
                                        commentGroupId: 'rc-90db37d7af97a7'
                                    },
                                    {
                                        id: 'rv-e489d1c6359fb3',
                                        title: 'Aquatic paradise',
                                        note: 'How may we help you?',
                                        voting: [ 300, 50, 10 ],
                                        video: {
                                            player: 'vimeo',
                                            videoid: '81766071',
                                            start: 35,
                                            end: 45
                                        },
                                        ballotId: 'rb-01eb03bc062c15',
                                        commentGroupId: 'rc-1d98e6113fd436'
                                    },
                                    {
                                        id: 'rv-e2947c9bec017e',
                                        title: 'Geek cool',
                                        note: 'Doctor Who #11 meets #4',
                                        voting: [ 400, 50, 10 ],
                                        video: {
                                            player: 'youtube',
                                            videoid: 'Cn9yJrrm2tk',
                                            rel: 0,
                                            modestbranding: 1,
                                            end: 18
                                        },
                                        ballotId: 'rb-dddd8635eb6db3',
                                        commentGroupId: 'rc-90db37d7af97a7'
                                    }
                                ]
                            };

                            spyOn(angular, 'copy').andCallFake(function(value) {
                                var result = copy(value);

                                angular.copy.mostRecentCall.result = result;

                                return result;
                            });

                            result = MiniReelService.createPlaylist(mrData);
                        });

                        it('should return a copy of the playlist', function() {
                            expect(angular.copy).toHaveBeenCalledWith(mrData.playList);
                            expect(result).toBe(angular.copy.mostRecentCall.result);
                        });

                        it('should resolve any properties ending in "Id" to a reference to the object it\'s pointing to', function() {
                            var video1 = result[0],
                                video2 = result[1],
                                video3 = result[2],
                                video4 = result[3],
                                ballot1 = mrData.ballots[0],
                                ballot2 = mrData.ballots[1],
                                commentGroup1 = mrData.commentGroups[0],
                                commentGroup2 = mrData.commentGroups[1],
                                note1 = mrData.notes[0];

                            expect(video1.ballot).toBe(ballot1);
                            expect(video1.ballotId).toBeUndefined();
                            expect(video1.commentGroup).toBe(commentGroup2);
                            expect(video1.commentGroupId).toBeUndefined();
                            expect(video1.video.note).toBe(note1);
                            expect(video1.video.noteId).toBeUndefined();

                            expect(video2.ballot).toBe(ballot2);
                            expect(video2.ballotId).toBeUndefined();
                            expect(video2.commentGroup).toBe(commentGroup1);
                            expect(video2.commentGroupId).toBeUndefined();

                            expect(video3.ballot).toBe(ballot1);
                            expect(video3.ballotId).toBeUndefined();
                            expect(video3.commentGroup).toBe(commentGroup2);
                            expect(video3.commentGroupId).toBeUndefined();

                            expect(video4.ballot).toBe(ballot2);
                            expect(video4.ballotId).toBeUndefined();
                            expect(video4.commentGroup).toBe(commentGroup1);
                            expect(video4.commentGroupId).toBeUndefined();
                        });

                        it('should give each video a "vote" and "view" state', function() {
                            result.forEach(function(video) {
                                var state = video.state;

                                expect(state.vote).toBe(-1);
                                expect(state.view).toBe('video');
                            });
                        });

                        it('should give each video a "null" player', function() {
                            result.forEach(function(video) {
                                expect(video.player).toBeNull();
                            });
                        });
                    });
                });
            });
        });
    });
}());
