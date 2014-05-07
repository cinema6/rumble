(function() {
    'use strict';

    define(['rumble'], function() {
        /* global angular:true */
        var copy = angular.copy,
            noop = angular.noop;

        describe('MiniReelService', function() {
            var CommentsService,
                MiniReelService,
                $rootScope,
                $q;

            var VideoThumbService,
                c6ImagePreloader;

            beforeEach(function() {
                module('c6.ui', function($provide) {
                    $provide.value('c6ImagePreloader', {
                        load: jasmine.createSpy('c6ImagePreloader.load()')
                    });
                });

                module('c6.rumble', function($provide) {
                    $provide.value('rumbleVotes', {
                        mockReturnsData: noop
                    });

                    $provide.value('VideoThumbService', {
                        getThumbs: jasmine.createSpy('VideoThumbService.getThumb()')
                            .andCallFake(function() {
                                return $q.defer().promise;
                            })
                    });
                });

                inject(function($injector) {
                    MiniReelService = $injector.get('MiniReelService');
                    CommentsService = $injector.get('CommentsService');
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    CommentsService.init('r-738c2403d83ddc');

                    VideoThumbService = $injector.get('VideoThumbService');
                    c6ImagePreloader = $injector.get('c6ImagePreloader');
                });
            });

            it('should exist', function() {
                expect(MiniReelService).toBeDefined();
            });

            describe('@public', function() {
                describe('methods: ', function() {
                    describe('createDeck(mrData)', function() {
                        var mrData,
                            result;

                        beforeEach(function() {
                            mrData = {
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
                                deck: [
                                    {
                                        id: 'rc-22119a8cf9f755',
                                        type: 'youtube',
                                        title: 'Did someone say FOX?',
                                        note: 'Thought so',
                                        voting: [ 100, 50, 10 ],
                                        data: {
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
                                        id: 'rc-2d46a04b21b073',
                                        type: 'vast',
                                        ad: true,
                                        modules: [
                                            'displayAd'
                                        ],
                                        data: {
                                            autoplay: true
                                        },
                                        displayAd: 'http://2.bp.blogspot.com/-TlM_3FT89Y0/UMzLr7kVykI/AAAAAAAACjs/lKrdhgp6OQg/s1600/brad-turner.jpg'
                                    },
                                    {
                                        id: 'rc-4770a2d7f85ce0',
                                        type: 'dailymotion',
                                        title: 'Kristen Stewart for Channel',
                                        note: 'Psychotic glamour',
                                        voting: [ 200, 50, 10 ],
                                        data: {
                                            videoid: 'x18b09a',
                                            related: 0
                                        },
                                        ballotId: 'rb-dddd8635eb6db3',
                                        commentGroupId: 'rc-90db37d7af97a7'
                                    },
                                    {
                                        id: 'rc-e489d1c6359fb3',
                                        type: 'vimeo',
                                        title: 'Aquatic paradise',
                                        note: 'How may we help you?',
                                        voting: [ 300, 50, 10 ],
                                        data: {
                                            type: 'vimeo',
                                            videoid: '81766071',
                                            start: 35,
                                            end: 45
                                        },
                                        ballotId: 'rb-01eb03bc062c15',
                                        commentGroupId: 'rc-1d98e6113fd436'
                                    },
                                    {
                                        id: 'rc-e2947c9bec017e',
                                        type: 'youtube',
                                        title: 'Geek cool',
                                        note: 'Doctor Who #11 meets #4',
                                        voting: [ 400, 50, 10 ],
                                        data: {
                                            videoid: 'Cn9yJrrm2tk',
                                            rel: 0,
                                            modestbranding: 1,
                                            end: 18
                                        },
                                        ballotId: 'rb-dddd8635eb6db3',
                                        commentGroupId: 'rc-90db37d7af97a7'
                                    },
                                    {
                                        id: 'rc-df011e0f447867',
                                        type: 'recap',
                                        title: 'Recap',
                                        note: null,
                                        data: {}
                                    }
                                ]
                            };

                            VideoThumbService.getThumbs.andCallFake(function(type, id) {
                                switch (id) {

                                case 'jofNR_WkoCE':
                                    return $q.when({
                                        small: 'http://img.youtube.com/vi/gy1B3agGNxw/2.jpg',
                                        large: 'http://img.youtube.com/vi/gy1B3agGNxw/0.jpg'
                                    });
                                case 'x18b09a':
                                    return $q.when({
                                        small: 'http://s2.dmcdn.net/Dm9Np/x120-6Xz.jpg',
                                        large: 'http://s2.dmcdn.net/Dm9Np/x720-6Xz.jpg'
                                    });
                                case '81766071':
                                    return $q.when({
                                        small: 'http://b.vimeocdn.com/ts/462/944/462944068_100.jpg',
                                        large: 'http://b.vimeocdn.com/ts/462/944/462944068_600.jpg'
                                    });
                                case 'Cn9yJrrm2tk':
                                    return $q.when({
                                        small: 'http://img.youtube.com/vi/Cn9yJrrm2tk/2.jpg',
                                        large: 'http://img.youtube.com/vi/Cn9yJrrm2tk/0.jpg'
                                    });

                                default:
                                    return $q.reject('Unknown video type: ' + type + '.');

                                }
                            });

                            spyOn(angular, 'copy').andCallFake(function(value) {
                                var result = copy(value);

                                angular.copy.mostRecentCall.result = result;

                                return result;
                            });

                            result = MiniReelService.createDeck(mrData);
                        });

                        it('should return a copy of the deck', function() {
                            expect(angular.copy).toHaveBeenCalledWith(mrData.deck);
                            expect(result).toBe(angular.copy.mostRecentCall.result);
                        });

                        it('should resolve any properties ending in "Id" to a reference to the object it\'s pointing to', function() {
                            var video1 = result[0],
                                video2 = result[2],
                                video3 = result[3],
                                video4 = result[4],
                                ballot1 = mrData.ballots[0],
                                ballot2 = mrData.ballots[1],
                                commentGroup1 = mrData.commentGroups[0],
                                commentGroup2 = mrData.commentGroups[1],
                                note1 = mrData.notes[0];

                            expect(video1.ballot).toBe(ballot1);
                            expect(video1.ballotId).toBeUndefined();
                            expect(video1.commentGroup).toBe(commentGroup2);
                            expect(video1.commentGroupId).toBeUndefined();
                            expect(video1.data.note).toBe(note1);
                            expect(video1.data.noteId).toBeUndefined();

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

                        it('should give each video a "null" player', function() {
                            result.forEach(function(video) {
                                expect(video.player).toBeNull();
                            });
                        });

                        describe('getting thumbnails', function() {
                            it('should make every thumbnail null at first', function() {
                                result.forEach(function(card) {
                                    expect(card.thumbs).toBeNull('card:' + card.id);
                                });
                            });

                            it('should get a thumbnail for every video', function() {
                                result.forEach(function(card) {
                                    if (card.type === 'recap') { return; }

                                    expect(VideoThumbService.getThumbs).toHaveBeenCalledWith(card.type, card.data.videoid);
                                });
                            });

                            it('should update the thumb if a thumbnail is returned', function() {
                                $rootScope.$digest();

                                expect(result[0].thumbs).toEqual({
                                    small: 'http://img.youtube.com/vi/gy1B3agGNxw/2.jpg',
                                    large: 'http://img.youtube.com/vi/gy1B3agGNxw/0.jpg'
                                });
                                expect(result[1].thumbs).toBeNull();
                                expect(result[2].thumbs).toEqual({
                                    small: 'http://s2.dmcdn.net/Dm9Np/x120-6Xz.jpg',
                                    large: 'http://s2.dmcdn.net/Dm9Np/x720-6Xz.jpg'
                                });
                                expect(result[3].thumbs).toEqual({
                                    small: 'http://b.vimeocdn.com/ts/462/944/462944068_100.jpg',
                                    large: 'http://b.vimeocdn.com/ts/462/944/462944068_600.jpg'
                                });
                                expect(result[4].thumbs).toEqual({
                                    small: 'http://img.youtube.com/vi/Cn9yJrrm2tk/2.jpg',
                                    large: 'http://img.youtube.com/vi/Cn9yJrrm2tk/0.jpg'
                                });
                            });

                            it('should preload all of the small images', function() {
                                $rootScope.$digest();

                                expect(c6ImagePreloader.load.callCount).toBe(4);

                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://img.youtube.com/vi/gy1B3agGNxw/2.jpg']);
                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://s2.dmcdn.net/Dm9Np/x120-6Xz.jpg']);
                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://b.vimeocdn.com/ts/462/944/462944068_100.jpg']);
                                expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://img.youtube.com/vi/Cn9yJrrm2tk/2.jpg']);
                            });

                            describe('for the recap card', function() {
                                describe('if there are no collateral assets', function() {
                                    it('should be null', function() {
                                        expect(result[5].thumbs).toBeNull();
                                    });
                                });

                                describe('if there is a splash image', function() {
                                    beforeEach(function() {
                                        mrData.collateral = {
                                            splash: '/collateral/mysplash.jpg'
                                        };

                                        result = MiniReelService.createDeck(mrData);
                                    });

                                    it('should make both thumbnails the fully-resolved splash image', function() {
                                        expect(result[5].thumbs).toEqual({
                                            small: 'http://foo.cinema6.com/collateral/mysplash.jpg',
                                            large: 'http://foo.cinema6.com/collateral/mysplash.jpg'
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
