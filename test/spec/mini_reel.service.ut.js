(function() {
    'use strict';

    define(['services'], function() {
        describe('MiniReelService', function() {
            var MiniReelService;

            var minireel;

            beforeEach(function() {
                minireel = {
                    id: 'e-15aa87f5da34c3',
                    title: 'My MiniReel',
                    subtitle: 'I <3 Turtles',
                    summary: 'I AM THE TURTLE MONSTER!',
                    type: 'minireel',
                    mode: 'lightbox',
                    theme: 'ed-videos',
                    data: {
                        deck: [
                            {
                                id: 'rc-c9cf24e87307ac',
                                type: 'youtube',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
                                modules: [],
                                data: {
                                    videoid: '47tfg8734',
                                    start: 10,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0
                                }
                            },
                            {
                                id: 'rc-17721b74ce2584',
                                type: 'vimeo',
                                title: 'The Ugliest Turtle',
                                note: 'Blah blah blah',
                                modules: ['ballot'],
                                data: {
                                    videoid: '48hfrei49'
                                }
                            },
                            {
                                id: 'rc-1c7a46097a5d4a',
                                type: 'ad',
                                ad: true,
                                data: {
                                    autoplay: true,
                                    publisher: true
                                }
                            },
                            {
                                id: 'rc-61fa9683714e13',
                                type: 'dailymotion',
                                title: 'The Smartest Turtle',
                                note: 'Blah blah blah',
                                modules: ['ballot'],
                                data: {
                                    videoid: 'vfu85f5',
                                    related: 0
                                }
                            },
                            {
                                id: 'rc-d8ebd5461ba524',
                                type: 'youtube',
                                title: 'The Dumbest Turtle',
                                note: 'Blah blah blah',
                                modules: [],
                                data: {
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0
                                }
                            },
                            {
                                id: 'rc-f31cabb9193ef9',
                                type: 'ad',
                                ad: true,
                                data: {
                                    autoplay: false,
                                    publisher: false
                                }
                            },
                            {
                                id: 'rc-25c1f60b933186',
                                type: 'links',
                                title: 'If You Love Turtles',
                                note: 'Blah blah blah',
                                data: {
                                    links: [
                                        {
                                            title: 'Lizards',
                                            href: 'http://lizards.com',
                                            thumb: 'http://lizards.com/img.jpg'
                                        },
                                        {
                                            title: 'Snakes',
                                            href: 'http://snakes.com',
                                            thumb: 'http://snakes.com/img.jpg'
                                        },
                                        {
                                            title: 'Geckos',
                                            href: 'http://geico.com',
                                            thumb: 'http://geico.com/img.jpg'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    MiniReelService = $injector.get('MiniReelService');
                });
            });

            it('should exist', function() {
                expect(MiniReelService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('open(minireel)', function() {
                        it('should not mutate the minireel', function() {
                            var copy = angular.copy(minireel);

                            MiniReelService.open(minireel);

                            expect(minireel).toEqual(copy);
                        });

                        it('should return an object with all the non-data content of the original', function() {
                            expect(MiniReelService.open(minireel)).toEqual({
                                id: 'e-15aa87f5da34c3',
                                title: 'My MiniReel',
                                subtitle: 'I <3 Turtles',
                                summary: 'I AM THE TURTLE MONSTER!',
                                type: 'minireel',
                                mode: 'lightbox',
                                theme: 'ed-videos',
                                data: jasmine.any(Object)
                            });
                        });

                        it('should insert an intro card', function() {
                            var deck = MiniReelService.open(minireel).data.deck;

                            expect(deck[0]).toEqual({
                                id: jasmine.any(String),
                                type: 'intro'
                            });
                        });

                        it('should transpile the various video cards into two cards', function() {
                            var deck = MiniReelService.open(minireel).data.deck;

                            expect(deck[1]).toEqual({
                                id: 'rc-c9cf24e87307ac',
                                type: 'video',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
                                ad: false,
                                data: {
                                    service: 'youtube',
                                    videoid: '47tfg8734',
                                    start: 10,
                                    end: 40
                                }
                            });

                            expect(deck[2]).toEqual({
                                id: 'rc-17721b74ce2584',
                                type: 'videoBallot',
                                title: 'The Ugliest Turtle',
                                note: 'Blah blah blah',
                                ad: false,
                                data: {
                                    service: 'vimeo',
                                    videoid: '48hfrei49',
                                    start: null,
                                    end: null,
                                    ballot: []
                                }
                            });

                            expect(deck[4]).toEqual({
                                id: 'rc-61fa9683714e13',
                                type: 'videoBallot',
                                title: 'The Smartest Turtle',
                                note: 'Blah blah blah',
                                ad: false,
                                data: {
                                    service: 'dailymotion',
                                    videoid: 'vfu85f5',
                                    start: undefined,
                                    end: undefined,
                                    ballot: []
                                }
                            });

                            expect(deck[5]).toEqual({
                                id: 'rc-d8ebd5461ba524',
                                type: 'video',
                                title: 'The Dumbest Turtle',
                                note: 'Blah blah blah',
                                ad: false,
                                data: {
                                    service: 'youtube',
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40
                                }
                            });
                        });

                        it('should transpile the ad cards', function() {
                            var deck = MiniReelService.open(minireel).data.deck;

                            expect(deck[3]).toEqual({
                                id: 'rc-1c7a46097a5d4a',
                                type: 'ad',
                                title: null,
                                note: null,
                                ad: true,
                                data: {
                                    autoplay: true,
                                    publisher: true
                                }
                            });
                            expect(deck[6]).toEqual({
                                id: 'rc-f31cabb9193ef9',
                                type: 'ad',
                                title: null,
                                note: null,
                                ad: true,
                                data: {
                                    autoplay: false,
                                    publisher: false
                                }
                            });
                        });

                        it('should transpile the links cards', function() {
                            var deck = MiniReelService.open(minireel).data.deck;

                            expect(deck[7]).toEqual({
                                id: 'rc-25c1f60b933186',
                                type: 'links',
                                title: 'If You Love Turtles',
                                note: 'Blah blah blah',
                                ad: false,
                                data: minireel.data.deck[6].data
                            });

                            expect(deck[7].data.links).not.toBe(minireel.data.deck[6].data.links);
                        });
                    });
                });
            });
        });
    });
}());
