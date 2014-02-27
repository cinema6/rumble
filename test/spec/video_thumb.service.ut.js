(function() {
    'use strict';

    define(['services'], function() {
        describe('VideoThumbService', function() {
            var $rootScope,
                $httpBackend,
                $q,
                VideoThumbService,
                _private;

            beforeEach(function() {
                module('c6.rumble.services');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    $httpBackend = $injector.get('$httpBackend');

                    VideoThumbService = $injector.get('VideoThumbService');
                    _private = VideoThumbService._private;
                });
            });

            it('should exist', function() {
                expect(VideoThumbService).toEqual(jasmine.any(Object));
            });

            it('should publish its _private object under test', function() {
                expect(_private).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {
                describe('methods', function() {
                    describe('getFromYoutube(id)', function() {
                        it('should return the constructed url in a promise', function() {
                            var spy = jasmine.createSpy('getFromYoutube spy');

                            $rootScope.$apply(function() {
                                _private.getFromYoutube('abcd').then(spy);
                            });
                            expect(spy).toHaveBeenCalledWith({
                                small: 'http://img.youtube.com/vi/abcd/2.jpg',
                                large: 'http://img.youtube.com/vi/abcd/0.jpg'
                            });

                            $rootScope.$apply(function() {
                                _private.getFromYoutube('1234').then(spy);
                            });
                            expect(spy).toHaveBeenCalledWith({
                                small: 'http://img.youtube.com/vi/1234/2.jpg',
                                large: 'http://img.youtube.com/vi/1234/0.jpg'
                            });

                            $rootScope.$apply(function() {
                                _private.getFromYoutube('abc123').then(spy);
                            });
                            expect(spy).toHaveBeenCalledWith({
                                small: 'http://img.youtube.com/vi/abc123/2.jpg',
                                large: 'http://img.youtube.com/vi/abc123/0.jpg'
                            });
                        });
                    });

                    describe('getFromVimeo(id)', function() {
                        var json1,
                            json2;

                        beforeEach(function() {
                            json1 = [
                                {
                                    'id': 81766071,
                                    'title': 'Harley',
                                    'description': 'Harley is the short film I created for my Intermediate Production class at the Dodge College of Film and Media Arts. I\'ve poured more than 200 hours into this project and couldn\'t be happier with how it turned out. It was a blast creating this short all the way from conceptualization to the final screening, thank you so much to everyone who helped me make this a reality. Enjoy!<br />\r\n<br />\r\nFacebook Page: https://www.facebook.com/TellerDigital<br />\r\nYoutube Version: http://www.youtube.com/watch?v=4-ENd7SEH5w<br />\r\n<br />\r\n© 2013 Tom Teller | www.TellerDigital.com',
                                    'url': 'http://vimeo.com/81766071',
                                    'upload_date': '2013-12-12 18:44:23',
                                    'mobile_url': 'http://vimeo.com/m/81766071',
                                    'thumbnail_small': 'http://b.vimeocdn.com/ts/457/952/457952450_100.jpg',
                                    'thumbnail_medium': 'http://b.vimeocdn.com/ts/457/952/457952450_200.jpg',
                                    'thumbnail_large': 'http://b.vimeocdn.com/ts/457/952/457952450_640.jpg',
                                    'user_id': 2628326,
                                    'user_name': 'Tom Teller',
                                    'user_url': 'http://vimeo.com/tomteller',
                                    'user_portrait_small': 'http://b.vimeocdn.com/ps/568/569/5685693_30.jpg',
                                    'user_portrait_medium': 'http://b.vimeocdn.com/ps/568/569/5685693_75.jpg',
                                    'user_portrait_large': 'http://b.vimeocdn.com/ps/568/569/5685693_100.jpg',
                                    'user_portrait_huge': 'http://b.vimeocdn.com/ps/568/569/5685693_300.jpg',
                                    'stats_number_of_likes': 3258,
                                    'stats_number_of_plays': 553976,
                                    'stats_number_of_comments': 112,
                                    'duration': 223,
                                    'width': 1920,
                                    'height': 1080,
                                    'tags': 'harley, animation, tom teller, goldfish, fish, vfx, short, shortfilm, animated, pixar, 3ds max, animated short',
                                    'embed_privacy': 'anywhere'
                                }
                            ];
                            json2 = [
                                {
                                    'id': 85509673,
                                    'title': 'Iijima Hiroki : Portrait of a Kendama Samurai',
                                    'description': 'With stylish dancing and precision consistency, Iijima Hiroki is redefining kendama, an ancient Japanese skill toy.<br />\r\n<br />\r\nIji is the newest professional for KROM Kendama, and he is also part of Zoomadanke (A kendama performance duo in Japan) and EFK (Exciting Freestyle Kendama).<br />\r\n<br />\r\nfacebook.com/KromKendama<br />\r\nfacebook.com/zoomadanke<br />\r\nfacebook.com/KendamaEFK<br />\r\n<br />\r\nDirector Cinematographer Editor / Matthew Ballard<br />\r\nCinematographer / Thorkild May<br />\r\nLocation / Nara, Japan<br />\r\nSpecial Thanks / Tamotsu Kubota & Hajime Ishibashi',
                                    'url': 'http://vimeo.com/85509673',
                                    'upload_date': '2014-01-31 02:09:02',
                                    'mobile_url': 'http://vimeo.com/m/85509673',
                                    'thumbnail_small': 'http://b.vimeocdn.com/ts/462/944/462944068_100.jpg',
                                    'thumbnail_medium': 'http://b.vimeocdn.com/ts/462/944/462944068_200.jpg',
                                    'thumbnail_large': 'http://b.vimeocdn.com/ts/462/944/462944068_640.jpg',
                                    'user_id': 1231340,
                                    'user_name': 'Matthew Ballard',
                                    'user_url': 'http://vimeo.com/matthewballard',
                                    'user_portrait_small': 'http://b.vimeocdn.com/ps/683/777/6837771_30.jpg',
                                    'user_portrait_medium': 'http://b.vimeocdn.com/ps/683/777/6837771_75.jpg',
                                    'user_portrait_large': 'http://b.vimeocdn.com/ps/683/777/6837771_100.jpg',
                                    'user_portrait_huge': 'http://b.vimeocdn.com/ps/683/777/6837771_300.jpg',
                                    'stats_number_of_likes': 161,
                                    'stats_number_of_plays': 8963,
                                    'stats_number_of_comments': 17,
                                    'duration': 498,
                                    'width': 1920,
                                    'height': 1080,
                                    'tags': 'iji, ijima, hiroki, portrait, of, a, kendama, samurai, matt, matthew, ballard, count, me, in, hd, action, spots, cinema, cinematic',
                                    'embed_privacy': 'anywhere'
                                }
                            ];
                        });

                        it('should return a promise that resolves to a small thumbnail', function() {
                            var spy = jasmine.createSpy('getFromVimeo spy');

                            $httpBackend.expectGET('http://vimeo.com/api/v2/video/81766071.json')
                                .respond(200, json1);
                            _private.getFromVimeo('81766071').then(spy);
                            $httpBackend.flush();
                            expect(spy).toHaveBeenCalledWith({
                                small: 'http://b.vimeocdn.com/ts/457/952/457952450_100.jpg',
                                large: 'http://b.vimeocdn.com/ts/457/952/457952450_640.jpg'
                            });

                            $httpBackend.expectGET('http://vimeo.com/api/v2/video/85509673.json')
                                .respond(200, json2);
                            _private.getFromVimeo('85509673').then(spy);
                            $httpBackend.flush();
                            expect(spy).toHaveBeenCalledWith({
                                small: 'http://b.vimeocdn.com/ts/462/944/462944068_100.jpg',
                                large: 'http://b.vimeocdn.com/ts/462/944/462944068_640.jpg'
                            });
                        });
                    });

                    describe('getFromDailymotion(id)', function() {
                        var json1,
                            json2;

                        beforeEach(function() {
                            json1 = {
                                'thumbnail_120_url': 'http://s1.dmcdn.net/ATQ1h/x120-Zw_.jpg',
                                'thumbnail_720_url': 'http://s1.dmcdn.net/ATQ1h/x720-qJQ.jpg'
                            };
                            json2 = {
                                'thumbnail_120_url': 'http://s2.dmcdn.net/Dm9Np/x120-6Xz.jpg',
                                'thumbnail_720_url': 'http://s2.dmcdn.net/Dm9Np/x720-lyL.jpg'
                            };
                        });

                        it('should return the 120px thumbnail url in a promise', function() {
                            var spy = jasmine.createSpy('getFromDailymotion spy');

                            $httpBackend.expectGET('https://api.dailymotion.com/video/xjfn0s?fields=thumbnail_120_url,thumbnail_720_url')
                                .respond(200, json1);
                            _private.getFromDailymotion('xjfn0s').then(spy);
                            $httpBackend.flush();
                            expect(spy).toHaveBeenCalledWith({
                                small: 'http://s1.dmcdn.net/ATQ1h/x120-Zw_.jpg',
                                large: 'http://s1.dmcdn.net/ATQ1h/x720-qJQ.jpg'
                            });

                            $httpBackend.expectGET('https://api.dailymotion.com/video/x1bxmgq?fields=thumbnail_120_url,thumbnail_720_url')
                                .respond(200, json2);
                            _private.getFromDailymotion('x1bxmgq').then(spy);
                            $httpBackend.flush();
                            expect(spy).toHaveBeenCalledWith({
                                small: 'http://s2.dmcdn.net/Dm9Np/x120-6Xz.jpg',
                                large: 'http://s2.dmcdn.net/Dm9Np/x720-lyL.jpg'
                            });
                        });
                    });
                });
            });


            describe('@public', function() {
                describe('methods', function() {
                    describe('getThumbs(type, id)', function() {
                        var youtubePromise,
                            vimeoPromise,
                            dailymotionPromise;

                        beforeEach(function() {
                            youtubePromise = $q.defer().promise;
                            vimeoPromise = $q.defer().promise;
                            dailymotionPromise = $q.defer().promise;

                            spyOn(_private, 'getFromYoutube').andReturn(youtubePromise);
                            spyOn(_private, 'getFromVimeo').andReturn(vimeoPromise);
                            spyOn(_private, 'getFromDailymotion').andReturn(dailymotionPromise);
                        });

                        it('should delegate to the appropriate private method', function() {
                            expect(VideoThumbService.getThumbs('youtube', 'abc123')).toBe(youtubePromise);
                            expect(_private.getFromYoutube).toHaveBeenCalledWith('abc123');

                            expect(VideoThumbService.getThumbs('vimeo', '123abc')).toBe(vimeoPromise);
                            expect(_private.getFromVimeo).toHaveBeenCalledWith('123abc');

                            expect(VideoThumbService.getThumbs('dailymotion', 'cba321')).toBe(dailymotionPromise);
                            expect(_private.getFromDailymotion).toHaveBeenCalledWith('cba321');
                        });

                        it('should reject the promise if an unknown type is passed in', function() {
                            var spy = jasmine.createSpy('getThumb fail');

                            $rootScope.$apply(function() {
                                VideoThumbService.getThumbs('video', '1234').catch(spy);
                            });
                            expect(spy).toHaveBeenCalledWith('Unknown video type: video.');

                            $rootScope.$apply(function() {
                                VideoThumbService.getThumbs('vast', 'abcd').catch(spy);
                            });
                            expect(spy).toHaveBeenCalledWith('Unknown video type: vast.');
                        });
                    });
                });
            });
        });
    });
}());
