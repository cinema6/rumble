define(['app', 'minireel', 'c6ui', 'angular'], function(appModule, minireelModule, c6uiModule, angular) {
    'use strict';

    var copy = angular.copy,
        noop = angular.noop;

    describe('MiniReelService', function() {
        var MiniReelService,
            playerInterface,
            $rootScope,
            $q;

        var VideoThumbService,
            c6ImagePreloader;

        beforeEach(function() {
            module(c6uiModule.name, function($provide) {
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
                        .andCallFake(function() {
                            return $q.defer().promise;
                        })
                });
            });
            module(appModule.name);

            inject(function($injector) {
                MiniReelService = $injector.get('MiniReelService');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                playerInterface = $injector.get('playerInterface');

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
                                    data: {
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
                                    data: {
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
                                    data: {
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

                    it('should give each video a player', function() {
                        result.forEach(function(video) {
                            expect(video.player).toBeNull();
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
                            return (/^(youtube|vimeo|dailymotion)$/).test(card.type);
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
                                    return isVideo(card) && !isSet(card.data, 'autoadvance');
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
                        var youtube, vimeo, dailymotion, others;

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
                            others = result.filter(function(card) {
                                return !(/^(youtube|vimeo|dailymotion)$/).test(card.type);
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

                        it('should set webHref to null for other cards', function() {
                            others.forEach(function(card) {
                                expect(card.webHref).toBeNull();
                            });
                        });
                    });

                    describe('getting thumbnails', function() {
                        it('should make every thumbnail null at first', function() {
                            result.filter(function(card) {
                                return !(/^(recap|text|displayAd)$/).test(card.type);
                            }).forEach(function(card) {
                                expect(card.thumbs).toBeNull('card:' + card.id);
                            });
                        });

                        it('should get a thumbnail for every video', function() {
                            result.filter(function(card) {
                                return !(/^(recap|text|displayAd)$/).test(card.type);
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
                            expect(result[5].thumbs).toEqual({
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

                                        spyOn(Date, 'now').andReturn(now);

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

                                    spyOn(Date, 'now').andReturn(now);

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
