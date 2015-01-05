define(['angular', 'app', 'services', 'minireel'], function(angular, appModule, servicesModule, minireelModule) {
    'use strict';

    var copy = angular.copy,
        extend = angular.extend,
        forEach = angular.forEach;

    describe('<mr-video-player>', function() {
        var $rootScope,
            $compile,
            $http,
            $q,
            compileAdTag,
            $scope,
            $videoPlayer;

        var c6AppData,
            config,
            adTag;

        beforeEach(function() {
            config = {};

            module('ng', function($provide) {
                $provide.value('$window', {
                    Date: window.Date,
                    location: window.location,
                    navigator: window.navigator,
                    document: {
                        createElement: function(type) {
                            switch (type.toLowerCase()) {
                            case 'video':
                                return {
                                    canPlayType: function() {
                                        return 'probably';
                                    }
                                };
                            default:
                                return window.document.createElement.apply(window.document, arguments);
                            }
                        }
                    },
                    addEventListener: function() {
                        return window.addEventListener.apply(window, arguments);
                    }
                });
            });

            module(servicesModule.name, function($provide) {
                $provide.decorator('compileAdTag', function($delegate) {
                    return jasmine.createSpy('compileAdTag()')
                        .and.callFake(function() {
                            return (adTag = $delegate.apply(null, arguments));
                        });
                });
            });

            module(minireelModule.name);

            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    profile: {
                        autoplay: true,
                        touch: false
                    }
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $http = $injector.get('$http');
                $q = $injector.get('$q');
                compileAdTag = $injector.get('compileAdTag');

                spyOn($http, 'get').and.returnValue($q.defer().promise);

                c6AppData = $injector.get('c6AppData');

                $scope = $rootScope.$new();
                $scope.id = 'the-id';
                $scope.config = config;
                $scope.$apply(function() {
                    $videoPlayer = $compile('<mr-video-player config="config" class="a-class" id="{{id}}"></mr-video-player>')($scope);
                });
            });
        });

        ['youtube', 'vimeo', 'dailymotion', 'rumble'].forEach(function(type) {
            describe('with type: ' + type, function() {
                var $player;

                beforeEach(function() {
                    $scope.$apply(function() {
                        copy({
                            id: 'rc-195bc8f47b1b16',
                            type: type,
                            data: {
                                controls: false,
                                videoid: 'abc123'
                            }
                        }, config);
                    });

                    $player = $videoPlayer.find(type + '-player');
                });

                it('should create a child player for the provided type', function() {
                    expect($player.length).toBe(1);
                });

                it('should copy the attributes of the parent', function() {
                    forEach($videoPlayer.prop('attributes'), function(attr) {
                        expect($player.attr(attr.name)).toBe(attr.value);
                    });
                });

                it('should respect bindings', function() {
                    $scope.$apply(function() {
                        $scope.id = 'new-id';
                    });

                    expect($player.attr('id')).toBe('new-id');
                });

                it('should add the videoid attribute', function() {
                    expect($player.attr('videoid')).toBe(config.data.videoid);
                });

                describe('if controls should be on', function() {
                    beforeEach(function() {
                        config.data.controls = true;
                        $scope.$apply(function() {
                            $videoPlayer = $compile('<mr-video-player config="config" class="a-class" id="{{id}}"></mr-video-player>')($scope);
                        });
                        $player = $videoPlayer.find(type + '-player');
                    });

                    it('should have the controls attribute', function() {
                        expect($player.attr('controls')).toBe('controls');
                    });
                });

                describe('if the controls should be off', function() {
                    beforeEach(function() {
                        config.data.controls = false;
                        $scope.$apply(function() {
                            $videoPlayer = $compile('<mr-video-player config="config" class="a-class" id="{{id}}"></mr-video-player>')($scope);
                        });
                        $player = $videoPlayer.find(type + '-player');
                    });

                    it('should not have the controls attribute', function() {
                        expect($player.attr('controls')).toBeUndefined();
                    });
                });
            });
        });

        describe('withType: adUnit', function() {
            var $player;

            function init(data) {
                $scope.$apply(function() {
                    extend(config, {
                        id: 'rc-d623e32ac49d7d',
                        type: 'adUnit',
                        data: {
                            vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                            vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                        }
                    }, data || {});
                });
                $player = $videoPlayer.children();
            }

            describe('if the browser supports flash', function() {
                beforeEach(function() {
                    c6AppData.profile.flash = true;
                });

                describe('if there is a vpaid tag', function() {
                    beforeEach(function() {
                        init();
                    });

                    it('should create a vpaid player', function() {
                        expect($player.prop('tagName')).toBe('VPAID-PLAYER');
                    });

                    it('should use the vpaid tag', function() {
                        expect(compileAdTag).toHaveBeenCalledWith(config.data.vpaid);
                        expect($player.attr('ad-tag')).toBe(adTag);
                    });

                    it('should add a videoid attribute', function() {
                        expect($player.attr('videoid')).toBe(config.id + '-player');
                    });
                });

                describe('if there is no vpaid tag', function() {
                    beforeEach(function() {
                        init({
                            data: {
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            }
                        });
                    });

                    it('should create a vast player', function() {
                        expect($player.prop('tagName')).toBe('VAST-PLAYER');
                    });

                    it('should use the vast tag', function() {
                        expect(compileAdTag).toHaveBeenCalledWith(config.data.vast);
                        expect($player.attr('ad-tag')).toBe(adTag);
                    });

                    it('should add a videoid attribute', function() {
                        expect($player.attr('videoid')).toBe(config.id + '-player');
                    });
                });
            });

            describe('if the browser does not support flash', function() {
                beforeEach(function() {
                    c6AppData.profile.flash = false;

                    init();
                });

                it('should create a vast player', function() {
                    expect($player.prop('tagName')).toBe('VAST-PLAYER');
                });

                it('should use the vast tag', function() {
                    expect(compileAdTag).toHaveBeenCalledWith(config.data.vast);
                    expect($player.attr('ad-tag')).toBe(adTag);
                });

                it('should add a videoid attribute', function() {
                    expect($player.attr('videoid')).toBe(config.id + '-player');
                });
            });
        });

        describe('with type: embedded', function() {
            var $player;

            beforeEach(function() {
                $scope.$apply(function() {
                    copy({
                        id: 'rc-d999ea176ab39e',
                        type: 'embedded',
                        data: {
                            code: '<p id="hello">I am code!</p>'
                        }
                    }, config);
                });
                $player = $videoPlayer.find('embedded-player');
            });

            it('should create an embedded-player', function() {
                expect($player.length).toBe(1);
            });

            it('should give the player an embed code', function() {
                expect($player.attr('code')).toBe(config.data.code);
            });
        });
    });
});
