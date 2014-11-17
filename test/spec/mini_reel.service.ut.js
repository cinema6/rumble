define(['app', 'minireel', 'c6uilib', 'angular'], function(appModule, minireelModule, c6uilibModule, angular) {
    'use strict';

    var copy = angular.copy,
        noop = angular.noop;

    describe('MiniReelService', function() {
        var MiniReelService,
            playerInterface,
            $rootScope,
            $q;

        var VideoThumbService,
            c6ImagePreloader,
            c6AppData;

        beforeEach(function() {
            module(c6uilibModule.name, function($provide) {
                $provide.value('c6ImagePreloader', {
                    load: jasmine.createSpy('c6ImagePreloader.load()')
                });
            });

            module(minireelModule.name, function($provide) {
                $provide.value('rumbleVotes', {
                    mockReturnsData: noop
                });

                $provide.value('VideoThumbService', {
                    getThumbs: jasmine.createSpy('VideoThumbService.getThumb()')
                        .and.callFake(function() {
                            return $q.defer().promise;
                        })
                });
            });
            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    experience: {
                        id: 'e-f1d70de8336974',
                        data: {
                            title: 'My Awesome MiniReel'
                        }
                    }
                });
            });

            inject(function($injector) {
                MiniReelService = $injector.get('MiniReelService');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                playerInterface = $injector.get('playerInterface');

                VideoThumbService = $injector.get('VideoThumbService');
                c6ImagePreloader = $injector.get('c6ImagePreloader');
                c6AppData = $injector.get('c6AppData');
            });
        });

        it('should exist', function() {
            expect(MiniReelService).toBeDefined();
        });

        describe('@public', function() {
            describe('methods: ', function() {
                describe('getTrackingData(card, index, params)', function() {
                    var card, params,
                        result;

                    beforeEach(function() {
                        card = {
                            id: 'rc-dec185bad0c8ee',
                            title: 'The Very Best Video'
                        };

                        params = {
                            action: 'foo',
                            label: 'bar'
                        };

                        result = MiniReelService.getTrackingData(card, 3, params);
                    });

                    it('should return something containing the params', function() {
                        expect(result).toEqual(jasmine.objectContaining(params));
                    });

                    it('should return something containing additional data', function() {
                        expect(result).toEqual(jasmine.objectContaining({
                            page: '/mr/' + c6AppData.experience.id + '/' + card.id,
                            title: c6AppData.experience.data.title + ' - ' + card.title,
                            slideIndex: 3,
                            slideId: card.id,
                            slideTitle: card.title
                        }));
                    });

                    describe('if no params are provided', function() {
                        beforeEach(function() {
                            result = MiniReelService.getTrackingData(card, 2);
                        });

                        it('should still work', function() {
                            expect(result).toEqual({
                                page: '/mr/' + c6AppData.experience.id + '/' + card.id,
                                title: c6AppData.experience.data.title + ' - ' + card.title,
                                slideIndex: 2,
                                slideId: card.id,
                                slideTitle: card.title
                            });
                        });
                    });

                    describe('if no card is provided', function() {
                        beforeEach(function() {
                            result = MiniReelService.getTrackingData(null, -1);
                        });

                        it('should return data for the MiniReel', function() {
                            expect(result).toEqual({
                                page: '/mr/' + c6AppData.experience.id + '/',
                                title: c6AppData.experience.data.title,
                                slideIndex: -1,
                                slideId: 'null',
                                slideTitle: 'null'
                            });
                        });
                    });
                });

                describe('createSocialLinks(links)', function() {
                    var links, result;

                    beforeEach(function() {
                        links = {
                            'Website': 'http://www.cinema6.com',
                            'Facebook': 'http://facebook.com/387r9hd3',
                            'Twitter': 'http://www.twitter.com/938r9df',
                            'Pinterest': 'http://www.pinterest.com/38rh94',
                            'Custom': 'custom.html',
                            'YouTube': 'http://www.youtube.com/839rhfi3',
                            'Vimeo': 'http://www.vimeo.com/0398rhd3'
                        };

                        result = MiniReelService.createSocialLinks(links);
                    });

                    it('should be an array of results', function() {
                        expect(result).toEqual([
                            {
                                type: 'facebook',
                                label: 'Facebook',
                                href: links.Facebook
                            },
                            {
                                type: 'twitter',
                                label: 'Twitter',
                                href: links.Twitter
                            },
                            {
                                type: 'pinterest',
                                label: 'Pinterest',
                                href: links.Pinterest
                            },
                            {
                                type: 'youtube',
                                label: 'YouTube',
                                href: links.YouTube
                            },
                            {
                                type: 'vimeo',
                                label: 'Vimeo',
                                href: links.Vimeo
                            }
                        ]);
                    });

                    it('should return an empty array if called with a non-object', function() {
                        expect(MiniReelService.createSocialLinks(undefined)).toEqual([]);
                    });
                });

                describe('createDeck(mrData)', function() {
                    var mrData,
                        result;

                    beforeEach(function() {
                        mrData = {
                            placementId: 'r2398fnfr',
                            deck: [
                                {
                                    id: 'rc-c539bacdb79a14',
                                    type: 'text',
                                    title: 'This is the MiniReel',
                                    note: 'Hello somebody',
                                    thumbs: {},
                                    data: {}
                                },
                                {
                                    id: 'rc-22119a8cf9f755',
                                    type: 'youtube',
                                    title: 'Did someone say FOX?',
                                    note: 'Thought so',
                                    voting: [ 100, 50, 10 ],
                                    placementId: null,
                                    data: {
                                        autoadvance: false,
                                        skip: 6,
                                        videoid: 'jofNR_WkoCE',
                                        start: 10,
                                        end: 20,
                                        rel: 0,
                                        modestbranding: 1,
                                        noteId: 'rn-abe1698644256e'
                                    }
                                },
                                {
                                    id: 'rc-2d46a04b21b073',
                                    type: 'vast',
                                    ad: true,
                                    modules: [
                                        'displayAd'
                                    ],
                                    placementId: null,
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
                                    placementId: '3948thfguf43',
                                    links: {
                                        'Action': 'foo.html',
                                        'Website': 'bar.html',
                                        'Facebook': 'fb.html',
                                        'Twitter': 'twitter.html'
                                    },
                                    data: {
                                        skip: null,
                                        autoadvance: null,
                                        autoplay: false,
                                        videoid: 'x18b09a',
                                        related: 0
                                    }
                                },
                                {
                                    id: 'rc-e489d1c6359fb3',
                                    type: 'vimeo',
                                    title: 'Aquatic paradise',
                                    note: 'How may we help you?',
                                    voting: [ 300, 50, 10 ],
                                    placementId: 'c849f4324r',
                                    links: {
                                        'Facebook': 'facebook.html',
                                        'Twitter': 'twitter.html',
                                        'YouTube': 'yt.html',
                                        'Vimeo': 'vimeo.html',
                                        'Pinterest': 'pinit.html'
                                    },
                                    data: {
                                        skip: true,
                                        autoplay: true,
                                        type: 'vimeo',
                                        videoid: '81766071',
                                        start: 35,
                                        end: 45
                                    }
                                },
                                {
                                    id: 'rc-e2947c9bec017e',
                                    type: 'youtube',
                                    title: 'Geek cool',
                                    note: 'Doctor Who #11 meets #4',
                                    voting: [ 400, 50, 10 ],
                                    placementId: null,
                                    thumbs: {
                                        small: 'matt-smith--small.jpg',
                                        large: 'matt-smith--large.jpg'
                                    },
                                    data: {
                                        skip: false,
                                        autoadvance: true,
                                        autoplay: null,
                                        videoid: 'Cn9yJrrm2tk',
                                        rel: 0,
                                        modestbranding: 1,
                                        end: 18
                                    }
                                },
                                {
                                    id: 'rc-979f2665b8ec21',
                                    type: 'displayAd',
                                    title: 'By Ubisoft',
                                    note: null,
                                    thumbs: {
                                        small: 'http://upload.wikimedia.org/wikipedia/en/8/8c/Ubisoft.png',
                                        large: 'http://upload.wikimedia.org/wikipedia/en/8/8c/Ubisoft.png'
                                    },
                                    placementId: '98fun3u4',
                                    data: {}
                                },
                                {
                                    id: 'rc-df011e0f447867',
                                    type: 'recap',
                                    title: 'Recap',
                                    note: null,
                                    data: {}
                                },
                                {
                                    id: 'rc-774a0ebe4d56a6',
                                    type: 'adUnit',
                                    title: 'Geek cool',
                                    note: 'Doctor Who #11 meets #4',
                                    voting: [ 400, 50, 10 ],
                                    placementId: null,
                                    thumbs: {},
                                    data: {
                                        skip: false,
                                        autoadvance: true,
                                        autoplay: null
                                    }
                                },
                                {
                                    id: 'rc-fa90ca8024631a',
                                    type: 'embedded',
                                    title: '49ers, Bucs Medical Staffs Checked by DEA',
                                    note: 'Federal drug enforcement agents showed up unannounced Sunday to check at least two visiting NFL teams\' medical staffs as part of an investigation into former players\' claims that teams mishandled prescription drugs.',
                                    placementId: null,
                                    thumbs: {},
                                    data: {
                                        skip: false,
                                        autoadvance: true,
                                        autoplay: null,
                                        service: 'aol',
                                        videoid: '49ers--bucs-medical-staffs-checked-by-dea-518518161'
                                    }
                                },
                                {
                                    id: 'rc-2cd95fe1ff1603',
                                    type: 'embedded',
                                    title: 'Raw: Video Captures MH17 Crash Aftermath',
                                    note: 'New video shows the aftermath of the Malaysian Airlines crash after it was shot down in rebel-held territory in eastern Ukraine.',
                                    placementId: null,
                                    thumbs: {},
                                    data: {
                                        skip: false,
                                        autoadvance: true,
                                        autoplay: null,
                                        service: 'yahoo',
                                        videoid: 'raw-video-captures-mh17-crash-172602605'
                                    }
                                }
                            ]
                        };

                        VideoThumbService.getThumbs.and.callFake(function(type, id) {
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

                        spyOn(angular, 'copy').and.callFake(function(value) {
                            var result = copy(value);

                            angular.copy.calls.mostRecent().result = result;

                            return result;
                        });

                        result = MiniReelService.createDeck(mrData);
                    });

                    it('should return a copy of the deck', function() {
                        expect(angular.copy).toHaveBeenCalledWith(mrData.deck);
                        expect(result).toBe(angular.copy.calls.mostRecent().result);
                    });

                    it('should give each video a player', function() {
                        result.forEach(function(video) {
                            expect(video.player).toBeNull();
                        });
                    });

                    describe('social', function() {
                        it('should create an array of social links from the links hash', function() {
                            expect(result[0].social).toEqual([]);
                            expect(result[1].social).toEqual([]);
                            expect(result[2].social).toEqual([]);
                            expect(result[3].social).toEqual([
                                {
                                    label: 'Facebook',
                                    type: 'facebook',
                                    href: 'fb.html'
                                },
                                {
                                    label: 'Twitter',
                                    type: 'twitter',
                                    href: 'twitter.html'
                                }
                            ]);
                            expect(result[4].social).toEqual([
                                {
                                    label: 'Facebook',
                                    type: 'facebook',
                                    href: 'facebook.html'
                                },
                                {
                                    label: 'Twitter',
                                    type: 'twitter',
                                    href: 'twitter.html'
                                },
                                {
                                    label: 'YouTube',
                                    type: 'youtube',
                                    href: 'yt.html'
                                },
                                {
                                    label: 'Vimeo',
                                    type: 'vimeo',
                                    href: 'vimeo.html'
                                },
                                {
                                    label: 'Pinterest',
                                    type: 'pinterest',
                                    href: 'pinit.html'
                                }
                            ]);
                            expect(result[5].social).toEqual([]);
                            expect(result[6].social).toEqual([]);
                            expect(result[7].social).toEqual([]);
                        });
                    });

                    describe('inheriting defaults:', function() {
                        function indicesWhere(predicate) {
                            return mrData.deck.map(function(card, index) {
                                return index;
                            }).filter(function(index) {
                                var card = mrData.deck[index];

                                return predicate(card, index);
                            });
                        }

                        function isVideo(card) {
                            return (/^(youtube|vimeo|dailymotion|adUnit)$/).test(card.type);
                        }

                        function isSet(object, prop) {
                            return ((prop in object) && object[prop] !== null);
                        }

                        describe('autoplay', function() {
                            var indicesOfAutoplaylessCards,
                                indicesOfAutoplayCards;

                            beforeEach(function() {
                                indicesOfAutoplaylessCards = indicesWhere(function(card) {
                                    return isVideo(card) && !isSet(card.data, 'autoplay');
                                });
                                expect(indicesOfAutoplaylessCards.length).toBeGreaterThan(0);

                                indicesOfAutoplayCards = indicesWhere(function(card, index) {
                                    return indicesOfAutoplaylessCards.indexOf(index) < 0;
                                });
                                expect(indicesOfAutoplayCards.length).toBeGreaterThan(0);
                            });

                            describe('if not set on the experience', function() {
                                beforeEach(function() {
                                    delete mrData.autoplay;

                                    result = MiniReelService.createDeck(mrData);
                                });

                                it('should make all video cards with null or undefined autoplay properties true', function() {
                                    indicesOfAutoplaylessCards.forEach(function(index) {
                                        var card = result[index];

                                        expect(card.data.autoplay).toBe(true);
                                    });
                                    indicesOfAutoplayCards.forEach(function(index) {
                                        expect(mrData.deck[index].data.autoplay).toBe(result[index].data.autoplay);
                                    });
                                });
                            });

                            describe('if set on the experience', function() {
                                beforeEach(function() {
                                    mrData.autoplay = false;

                                    result = MiniReelService.createDeck(mrData);
                                });

                                it('should make all video cards with null or undefined autoplay properties whatver the minireel\'s setting is', function() {
                                    indicesOfAutoplaylessCards.forEach(function(index) {
                                        var card = result[index];

                                        expect(card.data.autoplay).toBe(mrData.autoplay);
                                    });
                                    indicesOfAutoplayCards.forEach(function(index) {
                                        expect(mrData.deck[index].data.autoplay).toBe(result[index].data.autoplay);
                                    });
                                });
                            });
                        });

                        describe('autoadvance', function() {
                            var indicesOfAutoadvanceCards,
                                indicesOfAutoadvancelessCards;

                            beforeEach(function() {
                                indicesOfAutoadvancelessCards = indicesWhere(function(card) {
                                    return !isSet(card.data, 'autoadvance');
                                });
                                expect(indicesOfAutoadvancelessCards.length).toBeGreaterThan(0);

                                indicesOfAutoadvanceCards = indicesWhere(function(card, index) {
                                    return indicesOfAutoadvancelessCards.indexOf(index) < 0;
                                });
                                expect(indicesOfAutoadvanceCards.length).toBeGreaterThan(0);
                            });

                            describe('if not set on the experience', function() {
                                beforeEach(function() {
                                    delete mrData.autoadvance;

                                    result = MiniReelService.createDeck(mrData);
                                });

                                it('should make all videos with a null or undefined autoadvance property true', function() {
                                    indicesOfAutoadvancelessCards.forEach(function(index) {
                                        var card = result[index];

                                        expect(card.data.autoadvance).toBe(true);
                                    });
                                    indicesOfAutoadvanceCards.forEach(function(index) {
                                        expect(result[index].data.autoadvance).toBe(mrData.deck[index].data.autoadvance);
                                    });
                                });
                            });

                            describe('if set on the experience', function() {
                                beforeEach(function() {
                                    mrData.autoadvance = false;

                                    result = MiniReelService.createDeck(mrData);
                                });

                                it('should make all videos with a null or undefined autoadvance property the same as the minireel', function() {
                                    indicesOfAutoadvancelessCards.forEach(function(index) {
                                        var card = result[index];

                                        expect(card.data.autoadvance).toBe(mrData.autoadvance);
                                    });
                                    indicesOfAutoadvanceCards.forEach(function(index) {
                                        expect(result[index].data.autoadvance).toBe(mrData.deck[index].data.autoadvance);
                                    });
                                });
                            });
                        });

                        describe('skip', function() {
                            var indicesOfSkipCards,
                                indicesOfSkiplessCards;

                            beforeEach(function() {
                                indicesOfSkiplessCards = indicesWhere(function(card) {
                                    return isVideo(card) && !isSet(card.data, 'skip');
                                });
                                expect(indicesOfSkiplessCards.length).toBeGreaterThan(0);

                                indicesOfSkipCards = indicesWhere(function(card, index) {
                                    return indicesOfSkiplessCards.indexOf(index) < 0;
                                });
                                expect(indicesOfSkipCards.length).toBeGreaterThan(0);
                            });

                            it('should not change the value if set', function() {
                                indicesOfSkipCards.forEach(function(index) {
                                    expect(result[index].data.skip).toBe(mrData.deck[index].data.skip);
                                });
                            });

                            it('should be true if the value is not set', function() {
                                indicesOfSkiplessCards.forEach(function(index) {
                                    expect(result[index].data.skip).toBe(true);
                                });
                            });
                        });

                        describe('placementId', function() {
                            var indicesOfPlacementIdlessCards,
                                indicesOfPlacementIdCards;

                            beforeEach(function() {
                                indicesOfPlacementIdlessCards = indicesWhere(function(card) {
                                    return !isSet(card, 'placementId');
                                });
                                expect(indicesOfPlacementIdlessCards.length).toBeGreaterThan(0);
                                indicesOfPlacementIdCards = indicesWhere(function(card) {
                                    return isSet(card, 'placementId');
                                });
                                expect(indicesOfPlacementIdCards.length).toBeGreaterThan(0);
                            });

                            it('should make all cards without a placementId have the same placementId as the minireel', function() {
                                indicesOfPlacementIdlessCards.forEach(function(index) {
                                    var card = result[index];

                                    expect(card.placementId).toBe(mrData.placementId);
                                });
                                indicesOfPlacementIdCards.forEach(function(index) {
                                    expect(result[index].placementId).toBe(mrData.deck[index].placementId);
                                });
                            });
                        });
                    });

                    describe('webHref', function() {
                        var youtube, vimeo, dailymotion, aol, yahoo, others;

                        beforeEach(function() {
                            youtube = result.filter(function(card) {
                                return card.type === 'youtube';
                            });
                            vimeo = result.filter(function(card) {
                                return card.type === 'vimeo';
                            });
                            dailymotion = result.filter(function(card) {
                                return card.type === 'dailymotion';
                            });
                            aol = result.filter(function(card) {
                                return card.data.service === 'aol';
                            });
                            yahoo = result.filter(function(card) {
                                return card.data.service === 'yahoo';
                            });
                            others = result.filter(function(card) {
                                return !(/^(youtube|vimeo|dailymotion|embedded)$/).test(card.type);
                            });
                        });

                        it('should set a webHref for the youtube cards', function() {
                            youtube.forEach(function(card) {
                                expect(card.webHref).toBe('https://www.youtube.com/watch?v=' + card.data.videoid);
                            });
                        });

                        it('should set a webHref for the vimeo cards', function() {
                            vimeo.forEach(function(card) {
                                expect(card.webHref).toBe('http://vimeo.com/' + card.data.videoid);
                            });
                        });

                        it('should set a webHref for the dailymotion cards', function() {
                            dailymotion.forEach(function(card) {
                                expect(card.webHref).toBe('http://www.dailymotion.com/video/' + card.data.videoid);
                            });
                        });

                        it('should set a webHref for the aol cards', function() {
                            aol.forEach(function(card) {
                                expect(card.webHref).toBe('http://on.aol.com/video/' + card.data.videoid);
                            });
                        });

                        it('should set a webHref for the yahoo cards', function() {
                            yahoo.forEach(function(card) {
                                expect(card.webHref).toBe('https://screen.yahoo.com/' + card.data.videoid + '.html');
                            });
                        });

                        it('should set webHref to null for other cards', function() {
                            others.forEach(function(card) {
                                expect(card.webHref).toBeNull();
                            });
                        });
                    });

                    describe('getting thumbnails', function() {
                        it('should make every thumbnail null at first', function() {
                            mrData.deck.filter(function(card) {
                                return !card.thumbs && !(/^(text|recap)$/).test(card.type);
                            }).forEach(function(card) {
                                expect(result[mrData.deck.indexOf(card)].thumbs).toBeNull('card:' + card.id);
                            });
                        });

                        it('should get a thumbnail for every video', function() {
                            mrData.deck.filter(function(card) {
                                return !card.thumbs && !(/^(text|recap)$/).test(card.type);
                            }).forEach(function(card) {
                                expect(VideoThumbService.getThumbs).toHaveBeenCalledWith(card.type, card.data.videoid);
                            });
                        });

                        it('should update the thumb if a thumbnail is returned', function() {
                            $rootScope.$digest();

                            expect(result[1].thumbs).toEqual({
                                small: 'http://img.youtube.com/vi/gy1B3agGNxw/2.jpg',
                                large: 'http://img.youtube.com/vi/gy1B3agGNxw/0.jpg'
                            });
                            expect(result[2].thumbs).toBeNull();
                            expect(result[3].thumbs).toEqual({
                                small: 'http://s2.dmcdn.net/Dm9Np/x120-6Xz.jpg',
                                large: 'http://s2.dmcdn.net/Dm9Np/x720-6Xz.jpg'
                            });
                            expect(result[4].thumbs).toEqual({
                                small: 'http://b.vimeocdn.com/ts/462/944/462944068_100.jpg',
                                large: 'http://b.vimeocdn.com/ts/462/944/462944068_600.jpg'
                            });
                            expect(result[5].thumbs).toEqual(mrData.deck[5].thumbs);
                        });

                        it('should preload all of the small images', function() {
                            $rootScope.$digest();

                            expect(c6ImagePreloader.load.calls.count()).toBe(5);

                            expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://img.youtube.com/vi/gy1B3agGNxw/2.jpg']);
                            expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://s2.dmcdn.net/Dm9Np/x120-6Xz.jpg']);
                            expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://b.vimeocdn.com/ts/462/944/462944068_100.jpg']);
                            expect(c6ImagePreloader.load).toHaveBeenCalledWith(['matt-smith--small.jpg']);
                            expect(c6ImagePreloader.load).toHaveBeenCalledWith(['http://upload.wikimedia.org/wikipedia/en/8/8c/Ubisoft.png']);
                        });

                        describe('for a text card', function() {
                            describe('if there are already thumbs', function() {
                                it('should be the same object', function() {
                                    expect(result[0].thumbs).toEqual(mrData.deck[0].thumbs);
                                });
                            });

                            describe('if there are not already thumbs', function() {
                                beforeEach(function() {
                                    delete mrData.deck[0].thumbs;
                                });

                                describe('if there are no collateral assets', function() {
                                    beforeEach(function() {
                                        result = MiniReelService.createDeck(mrData);
                                    });

                                    it('should be null', function() {
                                        expect(result[0].thumbs).toBeNull();
                                    });
                                });

                                describe('if there are collateral assets', function() {
                                    var nowMethod,
                                        now;

                                    beforeEach(function() {
                                        nowMethod = Date.now;
                                        now = Date.now();

                                        mrData.collateral = {
                                            splash: '/collateral/mysplash.jpg'
                                        };

                                        spyOn(Date, 'now').and.returnValue(now);

                                        result = MiniReelService.createDeck(mrData);
                                    });

                                    afterEach(function() {
                                        Date.now = nowMethod;
                                    });

                                    it('should make both thumbnails the fully-resolved splash image', function() {
                                        expect(result[0].thumbs).toEqual({
                                            small: 'http://portal.cinema6.com/collateral/mysplash.jpg?cb=' + now,
                                            large: 'http://portal.cinema6.com/collateral/mysplash.jpg?cb=' + now
                                        });
                                    });

                                    describe('if the splash is a local blob', function() {
                                        beforeEach(function() {
                                            mrData.collateral.splash = 'blob:http%3A//localhost%3A9000/d1a849e5-4afb-40fd-8c06-e853a55ace10';

                                            result = MiniReelService.createDeck(mrData);
                                        });

                                        it('should make both thumbnails the unchanged blob', function() {
                                            expect(result[0].thumbs).toEqual({
                                                small: mrData.collateral.splash,
                                                large: mrData.collateral.splash
                                            });
                                        });
                                    });
                                });
                            });
                        });

                        describe('for a displayAd card', function() {
                            it('should have the thumbs it already had', function() {
                                expect(result[6].thumbs).toEqual(mrData.deck[6].thumbs);
                            });
                        });

                        describe('for a adUnit card', function() {
                            it('should have the thumbs it already had', function() {
                                expect(result[8].thumbs).toEqual(mrData.deck[8].thumbs);
                            });
                        });

                        describe('for the recap card', function() {
                            describe('if there are no collateral assets', function() {
                                it('should be null', function() {
                                    expect(result[7].thumbs).toBeNull();
                                });
                            });

                            describe('if there is a splash image', function() {
                                var nowMethod,
                                    now;

                                beforeEach(function() {
                                    nowMethod = Date.now;
                                    now = Date.now();

                                    spyOn(Date, 'now').and.returnValue(now);

                                    mrData.collateral = {
                                        splash: '/collateral/mysplash.jpg'
                                    };

                                    result = MiniReelService.createDeck(mrData);
                                });

                                afterEach(function() {
                                    Date.now = nowMethod;
                                });

                                it('should make both thumbnails the fully-resolved splash image', function() {
                                    expect(result[7].thumbs).toEqual({
                                        small: 'http://portal.cinema6.com/collateral/mysplash.jpg?cb=' + now,
                                        large: 'http://portal.cinema6.com/collateral/mysplash.jpg?cb=' + now
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
