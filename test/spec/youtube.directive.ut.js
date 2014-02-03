(function(){
    'use strict';
    
    define(['youtube'], function() {
        describe('youtubePlayer directive',function(){
            var $compile,
                interval,
                $interval,
                $timeout,
                $log,
                $rootScope,
                $scope,
                $q,
                mockPlayers,
                youtube = {};

            beforeEach(function() {
                mockPlayers = [];
                module('c6.rumble.services', function($provide) {
                    $provide.value('ControlsService', {
                        bindTo: angular.noop
                    });
                });

                module('c6.rumble',function($provide){
                    youtube.createPlayer = jasmine.createSpy('youtube.createPlayer')
                    .andCallFake(function(playerId,config,$parentElement){
                        var mockPlayer = {
                            on              : jasmine.createSpy('youtubePlayer.on'),
                            once            : jasmine.createSpy('youtubePlayer.once'),
                            emit            : jasmine.createSpy('youtubePlayer.emit'),
                            removeListener  : jasmine.createSpy('youtubePlayer.removeListener'),
                            setSize         : jasmine.createSpy('youtubePlayer.setSize'),
                            destroy         : jasmine.createSpy('youtubePlayer.destroy'),
                            play            : jasmine.createSpy('youtubePlayer.play'),
                            pause           : jasmine.createSpy('youtubePlayer.pause'),
                            seekTo          : jasmine.createSpy('youtubePlayer.seekTo'),
                            getCurrentTime  : jasmine.createSpy('youtubePlayer.getCurrentTime'),
                            isPlaying       : jasmine.createSpy('YoutubePlayer.isPlaying'),
                            getDuration     : jasmine.createSpy('YoutubePlayer.getDuration'),

                            _on             : {},
                            _once           : {},
                            _removes        : {}
                        }

                        mockPlayer.getCurrentTime.andCallFake(function(){
                            return 0;
                        });

                        mockPlayer.on.andCallFake(function(eventName,handler){
                            if (mockPlayer._on[eventName] === undefined){
                                mockPlayer._on[eventName] = [];
                            }
                            mockPlayer._on[eventName].push(handler);
                        });

                        mockPlayer.once.andCallFake(function(eventName,handler){
                            if (mockPlayer._once[eventName] === undefined){
                                mockPlayer._once[eventName] = [];
                            }
                            mockPlayer._once[eventName].push(handler);
                        });

                        mockPlayer.removeListener.andCallFake(function(eventName,listener){
                            if (mockPlayer._removes[eventName] === undefined){
                                mockPlayer._removes[eventName] = [];
                            }
                            mockPlayer._removes[eventName].push(listener);
                        });

                        mockPlayer.isPlaying.andReturn(false);

                        mockPlayer.pause.andCallFake(function() {
                            mockPlayer.isPlaying.andReturn(false);
                        });

                        mockPlayer.play.andCallFake(function() {
                            mockPlayer.isPlaying.andReturn(true);
                        });

                        mockPlayers.push(mockPlayer);
                        return mockPlayer;
                    });
                    $provide.value('youtube', youtube);
                });

                inject(function($injector) {
                    $timeout    = $injector.get('$timeout');
                    $interval   = $injector.get('$interval');
                    $compile    = $injector.get('$compile');
                    $rootScope  = $injector.get('$rootScope');
                    $log        = $injector.get('$log');
                    $q          = $injector.get('$q');

                    $log.context = jasmine.createSpy('$log.context');
                    $log.context.andCallFake(function() { return $log; });

                    $rootScope.config = {};

                    $scope = $rootScope.$new();
                    $scope.width = 100;
                    $scope.height = 100;
                });
            });

            describe('initialization',function(){
                it('will fail without a videoid',function(){
                    expect(function(){
                        $scope.$apply(function() {
                            $compile('<youtube-card></youtube-card>')($rootScope);
                        });
                    }).toThrow('<youtube-card> requires the videoid attribute to be set.');
                });

                it('will create a player',function(){
                    $compile(
                        '<youtube-card videoid="abc123" width="1" height="2"></youtube-card>'
                    )($scope);
                    $timeout.flush();
                    expect($log.context).toHaveBeenCalledWith('<youtube-card>');
                    expect(mockPlayers.length).toEqual(1);
                    expect(youtube.createPlayer.calls[0].args[0]).toEqual('yt_abc123');
                    expect(youtube.createPlayer.calls[0].args[1]).toEqual({
                        videoId: 'abc123',
                        width: '1',
                        height: '2',
                        params: {
                            rel             : 0,
                            enablejsapi     : 1,
                            modestbranding  : 1,
                            controls        : 0
                        },
                        frameborder: 0
                    });
                });

                it('will observe changes to width and height',function(){
                    var youtubePlayer, scope;
                    youtubePlayer = $compile(
                        '<youtube-card videoid="abc123" width="{{width}}" height="{{height}}"></youtube-card>'
                    )($scope);
                    scope = youtubePlayer.scope();
                    $timeout.flush();
                    expect(mockPlayers[0].setSize).not.toHaveBeenCalled();
                    $scope.width  = 200;
                    $scope.height = 300;
                    scope.$digest();
                    expect(mockPlayers[0].setSize).toHaveBeenCalledWith('200','300');
                });

            });
            /* -- end describe('initialization' */

            describe('playerInterface',function(){
                var iface,addSpy;
                beforeEach(function(){
                    iface = null, addSpy = null;
                    addSpy = jasmine.createSpy('playerAdd');
                    addSpy.andCallFake(function(event,playerInterface){
                        iface = playerInterface;
                    });

                    $scope.$on('playerAdd'      ,addSpy);
                    
                    $compile(
                        '<youtube-card videoid="abc123" width="1" height="2" start="{{start}}" end="{{end}}"></youtube-card>'
                    )($scope);
                    $timeout.flush();
                });

                describe('scope',function(){
                    it('should emit with playerAdd when the directive is linked',function(){
                        expect(addSpy).toHaveBeenCalled();
                    });

                    it('should emit with playerRemove when the scope is destroyed',function(){
                        var removeSpy   = jasmine.createSpy('playerRemove');
                        $scope.$on('playerRemove'   ,removeSpy);
                        $scope.$destroy();
                        expect(removeSpy).toHaveBeenCalled();
                    });

                    describe('the interval', function() {
                        beforeEach(function() {
                            spyOn($interval, 'cancel');
                        });

                        describe('if running', function() {
                            beforeEach(function() {
                                mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                                $timeout.flush();
                                $scope.$destroy();
                            });

                            it('should cancel the interval', function() {
                                expect($interval.cancel).toHaveBeenCalled();
                            });
                        });

                        describe('if not running', function() {
                            beforeEach(function() {
                                $scope.$destroy();
                            });

                            it('should do nothing', function() {
                                expect($interval.cancel).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('when player is not ready',function(){
                    it('will have ts videoId',function(){
                        expect(iface.getVideoId()).toEqual('abc123');
                    });

                    it('will have type information',function(){
                        expect(iface.getType()).toEqual('youtube');
                    });

                    it('isReady will return false',function(){
                        expect(iface.isReady()).toEqual(false);
                    });

                    it('will not play',function(){
                        iface.play();
                        expect(mockPlayers[0].play).not.toHaveBeenCalled();
                    });

                    it('will not pause',function(){
                        iface.pause();
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                    });

                    it('will have a currentTime of 0', function() {
                        expect(iface.currentTime).toBe(0);
                    });

                    it('will not be seekable', function() {
                        expect(function() {
                            iface.currentTime = 10;
                        }).toThrow();
                    });
                });

                describe('when player is ready',function(){
                    beforeEach(function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                    });

                    describe('isReady method',function(){
                        it('should return true',function(){
                            expect(iface.isReady()).toEqual(true);
                        });
                    });

                    describe('play method',function(){
                        it('proxies to the internal player\'s play method',function(){
                            expect(mockPlayers[0].play).not.toHaveBeenCalled();
                            iface.play();
                            expect(mockPlayers[0].play).toHaveBeenCalled();
                        });
                    });

                    describe('pause method',function(){
                        it('proxies to the internal player\'s pause method',function(){
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            iface.pause();
                            expect(mockPlayers[0].pause).toHaveBeenCalled();
                        });
                    });

                    describe('twerked property', function() {
                        describe('getting', function() {
                            it('should be initialized as false', function() {
                                expect(iface.twerked).toBe(false);
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically set-able', function() {
                                expect(function() {
                                    iface.twerked = true;
                                }).toThrow();
                            });
                        });
                    });

                    describe('currentTime property', function() {
                        var player;

                        beforeEach(function() {
                            player = mockPlayers[0];
                        });

                        describe('getting', function() {
                            it('should proxy to player.getCurrentTime()', function() {
                                player.getCurrentTime.andReturn(10);
                                expect(iface.currentTime).toBe(10);

                                player.getCurrentTime.andReturn(20);
                                expect(iface.currentTime).toBe(20);

                                player.getCurrentTime.andReturn(30);
                                expect(iface.currentTime).toBe(30);

                                expect(player.getCurrentTime.callCount).toBe(3);
                            });
                        });

                        describe('setting', function() {
                            it('should proxy to player.seekTo()', function() {
                                iface.currentTime = 10;
                                expect(player.seekTo).toHaveBeenCalledWith(10);

                                iface.currentTime = 20;
                                expect(player.seekTo).toHaveBeenCalledWith(20);

                                iface.currentTime = 30;
                                expect(player.seekTo).toHaveBeenCalledWith(30);
                            });
                        });

                        describe('if a start time is specified', function() {
                            beforeEach(function() {
                                $compile(
                                    '<youtube-card videoid="abc1234" width="1" height="2" start="10"></youtube-card>'
                                )($scope);
                                $timeout.flush();

                                player = mockPlayers[1];

                                player._on.ready[0]({},player);
                                $timeout.flush();
                                player.getCurrentTime.andReturn(10);
                            });

                            describe('getting', function() {
                                it('should subtract the start time in its calculation', function() {
                                    expect(iface.currentTime).toBe(0);

                                    player.getCurrentTime.andReturn(20);
                                    expect(iface.currentTime).toBe(10);

                                    player.getCurrentTime.andReturn(30);
                                    expect(iface.currentTime).toBe(20);
                                });

                                it('should never go below 0', function() {
                                    player.getCurrentTime.andReturn(5);

                                    expect(iface.currentTime).toBe(0);
                                });
                            });

                            describe('setting', function() {
                                it('should add the start time when calling seekTo()', function() {
                                    iface.currentTime = 10;
                                    expect(player.seekTo).toHaveBeenCalledWith(20);

                                    iface.currentTime = 20;
                                    expect(player.seekTo).toHaveBeenCalledWith(30);

                                    iface.currentTime = 30;
                                    expect(player.seekTo).toHaveBeenCalledWith(40);
                                });

                                it('should never seek before the start time', function() {
                                    iface.currentTime = -5;
                                    expect(player.seekTo).toHaveBeenCalledWith(10);
                                });
                            });
                        });
                    });

                    describe('paused property', function() {
                        var player;

                        beforeEach(function() {
                            player = mockPlayers[0];
                        });

                        describe('getting', function() {
                            it('should be initialized as true', function() {
                                expect(iface.paused).toBe(true);
                            });

                            it('should become false when the "playing" event is emitted', function() {
                                player._on.playing[0](player);

                                expect(iface.paused).toBe(false);
                            });

                            it('should go back to true when the "paused" event is emitted', function() {
                                player._on.playing[0](player);
                                player._on.paused[0](player);

                                expect(iface.paused).toBe(true);
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically settable', function() {
                                expect(function() {
                                    iface.paused = false;
                                }).toThrow();
                            });
                        });
                    });

                    describe('duration property', function() {
                        var player;

                        beforeEach(function() {
                            player = mockPlayers[0];
                        });

                        describe('getting', function() {
                            describe('if there is a start and end time', function() {
                                it('should return the difference between the end and start time', function() {
                                    $scope.$apply(function() {
                                        $scope.start = 10;
                                        $scope.end = 20;
                                    });
                                    expect(iface.duration).toBe(10);

                                    $scope.$apply(function() {
                                        $scope.end = 30;
                                    });
                                    expect(iface.duration).toBe(20);
                                });
                            });

                            describe('if there is a start time', function() {
                                beforeEach(function() {
                                    $scope.start = 0;

                                    $compile(
                                        '<youtube-card videoid="abc1234" width="1" height="2" start="{{start}}"></youtube-card>'
                                    )($scope);
                                    $timeout.flush();

                                    player = mockPlayers[1];
                                    player.getDuration.andReturn(30);

                                    player._on.ready[0]({},player);
                                    $timeout.flush();
                                });

                                it('should return the difference between the actual duration and the start time', function() {
                                    expect(iface.duration).toBe(30);

                                    $scope.$apply(function() {
                                        $scope.start = 10;
                                    });
                                    expect(iface.duration).toBe(20);

                                    $scope.$apply(function() {
                                        $scope.start = 30;
                                        player.getDuration.andReturn(40);
                                    });
                                    expect(iface.duration).toBe(10);
                                });
                            });

                            describe('if there is an end time', function() {
                                beforeEach(function() {
                                    $scope.end = 30;

                                    $compile(
                                        '<youtube-card videoid="abc1234" width="1" height="2" end="{{end}}"></youtube-card>'
                                    )($scope);
                                    $timeout.flush();

                                    player = mockPlayers[1];
                                    player.getDuration.andReturn(30);

                                    player._on.ready[0]({},player);
                                    $timeout.flush();
                                });

                                it('should return the end time', function() {
                                    expect(iface.duration).toBe(30);

                                    $scope.$apply(function() {
                                        $scope.end = 15;
                                    });
                                    expect(iface.duration).toBe(15);

                                    $scope.$apply(function() {
                                        $scope.end = 60;
                                    });
                                    expect(iface.duration).toBe(60);
                                });
                            });

                            describe('if there is no start or end time', function() {
                                beforeEach(function() {
                                    $compile(
                                        '<youtube-card videoid="abc1234" width="1" height="2"></youtube-card>'
                                    )($scope);
                                    $timeout.flush();

                                    player = mockPlayers[1];
                                    player.getDuration.andReturn(30);

                                    player._on.ready[0]({},player);
                                    $timeout.flush();
                                });

                                it('should return the duration of the player', function() {
                                    expect(iface.duration).toBe(30);

                                    player.getDuration.andReturn(24);
                                    expect(iface.duration).toBe(24);
                                });
                            });

                            describe('if the player duration is 0', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        $scope.start = undefined;
                                        $scope.end = undefined;
                                    });

                                    player.getDuration.andReturn(0);
                                });

                                it('should be NaN', function() {
                                    expect(iface.duration).toBeNaN();
                                });
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically settable', function() {
                                expect(function() {
                                    iface.duration = 30;
                                }).toThrow();
                            });
                        });
                    });

                    describe('ended property', function() {
                        var player;

                        beforeEach(function() {
                            player = mockPlayers[0];
                        });

                        describe('getting', function() {
                            it('should be initialized as false', function() {
                                expect(iface.ended).toBe(false);
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically set-able', function() {
                                expect(function() {
                                    iface.ended = true;
                                }).toThrow();
                            });
                        });

                        describe('when the player emits ended', function() {
                            beforeEach(function() {
                                expect(iface.ended).toBe(false);

                                player._on.ended[0](player);
                            });

                            it('should set ended to true', function() {
                                expect(iface.ended).toBe(true);
                            });
                        });

                        describe('playing after ended', function() {
                            describe('if no start is provided', function() {
                                beforeEach(function() {
                                    player._on.playing[0](player);
                                    expect(player.seekTo).not.toHaveBeenCalled();

                                    player._on.ended[0](player);

                                    player._on.playing[0](player);
                                });

                                it('should seek to the beginning of the video', function() {
                                    expect(player.seekTo).toHaveBeenCalledWith(0);
                                });

                                it('should set ended to false', function() {
                                    expect(iface.ended).toBe(false);
                                });
                            });

                            describe('if start is provided', function() {
                                beforeEach(function() {
                                    $compile(
                                        '<youtube-card videoid="abc1234" width="1" height="2" start="10"></youtube-card>'
                                    )($scope);
                                    $timeout.flush();

                                    player = mockPlayers[1];

                                    player._on.ready[0]({},player);
                                    $timeout.flush();

                                    player._on.ended[0](player);
                                    player._on.playing[0](player);
                                });

                                it('should seek to the start time', function() {
                                    expect(player.seekTo).toHaveBeenCalledWith(10);
                                });

                                it('should set ended to false', function() {
                                    expect(iface.ended).toBe(false);
                                });
                            });
                        });
                    });
                });
            });
            /* -- end describe('playerInterface' */
            describe('when the card becomes inavtive', function() {
                describe('initialization', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = false;

                            $compile(
                                '<youtube-card videoid="abc123" width="1" height="2"></youtube-card>'
                            )($scope);
                        });

                        $timeout.flush();
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                    });

                    it('should not pause the player', function() {
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                    });
                });

                describe('when going from active to inactive', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = false;

                            $compile(
                                '<youtube-card videoid="abc123" width="1" height="2"></youtube-card>'
                            )($scope);
                        });

                        $timeout.flush();
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();

                        $scope.$apply(function() {
                            $scope.active = true;
                        });

                        $scope.$apply(function() {
                            $scope.active = false;
                        });
                    });

                    it('should pause the player', function() {
                        expect(mockPlayers[0].pause).toHaveBeenCalled();
                    });
                });
            });

            describe('autoplay', function() {
                describe('if off', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = true;

                            $compile(
                                '<youtube-card videoid="abc123" width="1" height="2"></youtube-card>'
                            )($scope);
                        });

                        $timeout.flush();
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                    });

                    it('should not play the player', function() {
                        expect(mockPlayers[0].play).not.toHaveBeenCalled();
                    });
                });

                describe('if on, when becoming active', function() {
                    var player;

                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile(
                                '<youtube-card videoid="abc123" width="1" height="2" autoplay="1"></youtube-card>'
                            )($scope);
                        });
                        $timeout.flush();

                        player = mockPlayers[0];
                    });

                    describe('before becoming active', function() {
                        beforeEach(function() {
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            $timeout.flush();
                        });

                        it('should not play the player', function() {
                            expect(player.play).not.toHaveBeenCalled();
                        });
                    });

                    describe('when not ready', function() {
                        beforeEach(function() {
                            spyOn($log, 'warn');
                        });

                        it('should log a warning if the player becomes active', function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });

                            expect(player.play).not.toHaveBeenCalled();
                            expect($log.warn).toHaveBeenCalledWith('Player cannot autoplay because it is not ready.');
                        });
                    });

                    describe(', when ready', function() {
                        beforeEach(function() {
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            $timeout.flush();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should play the player', function() {
                            expect(player.play).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('twerking',function(){
                var iface;
                beforeEach(function(){
                    iface = null;
                    $scope.$on('playerAdd',function(event,playerInterface){
                        iface = playerInterface;
                    });
                });

                describe('parameter',function(){
                    describe('when not turned on',function(){
                        beforeEach(function(){
                            $scope.$apply(function() {
                                $compile(
                                    '<youtube-card videoid="abc123" width="1" height="2"></youtube-card>'
                                )($scope);
                            });
                            spyOn(iface, 'twerk');
                            $timeout.flush();

                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            $timeout.flush();
                        });

                        it('will not twerk the player when it is "onDeck"',function(){
                            expect(iface.twerk).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                $scope.onDeck = true;
                            });

                            expect(iface.twerk).not.toHaveBeenCalled();
                        });
                    });

                    describe('when turned on',function(){
                        var twerkDeferred;

                        beforeEach(function(){
                            twerkDeferred = $q.defer();

                            spyOn($interval, 'cancel');
                            $scope.$apply(function() {
                                $compile(
                                    '<youtube-card videoid="abc123" width="1" height="2" twerk="1"></youtube-card>'
                                )($scope);
                            });
                            spyOn(iface, 'twerk').andCallFake(function() {
                                return twerkDeferred.promise;
                            });
                            $timeout.flush();
                        });

                        describe('when not "onDeck"', function() {
                            beforeEach(function() {
                                mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                                $timeout.flush();
                            });

                            it('will not twerk the player', function() {
                                expect(iface.twerk).not.toHaveBeenCalled();
                            });
                        });

                        describe('when "onDeck"', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.onDeck = true;
                                });
                            });

                            describe('if not ready', function() {
                                it('should not twerk the player', function() {
                                    expect(iface.twerk).not.toHaveBeenCalled();
                                });

                                it('should twerk the player after it is ready', function() {
                                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                                    $timeout.flush();

                                    expect(iface.twerk).toHaveBeenCalled();
                                });
                            });

                            describe('if ready', function() {
                                beforeEach(function() {
                                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                                    $timeout.flush();
                                });

                                it('should twerk the player', function() {
                                    expect(iface.twerk).toHaveBeenCalledWith(5000);
                                });
                            });
                        });
                    });
                });

                describe('method',function(){
                    var resolveSpy, rejectSpy;
                    beforeEach(function(){
                        spyOn($interval, 'cancel').andCallThrough();

                        resolveSpy = jasmine.createSpy('twerk.resolve');
                        rejectSpy  = jasmine.createSpy('twerk.reject');
                        
                        $compile(
                            '<youtube-card videoid="abc123" width="1" height="2"></youtube-card>'
                        )($scope);
                        $timeout.flush();
                    });

                    it('will cancel the $interval', function() {
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk();

                        expect($interval.cancel).toHaveBeenCalled();
                    });

                    it('will remove its "playing" listener', function() {
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk();

                        expect(mockPlayers[0].removeListener).toHaveBeenCalledWith('playing', jasmine.any(Function));
                    });

                    it('will remove its "paused" listener', function() {
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk();

                        expect(mockPlayers[0].removeListener).toHaveBeenCalledWith('paused', jasmine.any(Function));
                    });

                    it('will reject if the player is not ready',function(){
                        expect(iface.isReady()).toEqual(false);
                        iface.twerk().then(resolveSpy,rejectSpy);
                        $scope.$digest();
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).toHaveBeenCalledWith({
                            message : 'Player is not ready to twerk'
                        });
                        expect(iface.twerked).toBe(false);
                    });

                    it('will resolve when playing starts',function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk().then(resolveSpy,rejectSpy);
                        
                        mockPlayers[0]._once.playing[0]({},mockPlayers[0]);
                        $scope.$digest();

                        expect(resolveSpy).toHaveBeenCalled();
                        expect(rejectSpy).not.toHaveBeenCalled();
                        expect(iface.twerked).toBe(true);
                    });

                    it('will reject if playing event times out with default',function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk().then(resolveSpy,rejectSpy);
                        //default is 1000ms, so it should not be called after 100 
                        $timeout.flush(100);
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).not.toHaveBeenCalled();
                        
                        $timeout.flush(1000);
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).toHaveBeenCalledWith({
                            message : 'Player twerk timed out'
                        });
                        expect(iface.twerked).toBe(false);
                    });

                    it('will reject if playing event times out with specified wait',function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk(5000).then(resolveSpy,rejectSpy);
                        
                        $timeout.flush(1500);
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).not.toHaveBeenCalled();
                        
                        $timeout.flush(5000);
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).toHaveBeenCalledWith({
                            message : 'Player twerk timed out'
                        });
                        expect(iface.twerked).toBe(false);
                    });

                    it('will reject if the player has already been twerked', function() {
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk().then(resolveSpy,rejectSpy);
                        
                        mockPlayers[0]._once.playing[0]({},mockPlayers[0]);
                        $scope.$digest();

                        $scope.$apply(function() {
                            iface.twerk().then(resolveSpy, rejectSpy);
                        });
                        expect(rejectSpy).toHaveBeenCalledWith({
                            message: 'Player has already been twerked'
                        });
                        expect(mockPlayers[0].play.callCount).toBe(1);
                        expect($interval.cancel.callCount).toBe(1);
                    });

                    it('will not timeout if timeout passed is 0',function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk(0).then(resolveSpy,rejectSpy);

                        $timeout.flush();
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).not.toHaveBeenCalled();
                    });

                    describe('if twerking fails', function() {
                        var player;

                        beforeEach(function() {
                            spyOn(iface, 'emit');
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            $timeout.flush();
                            iface.twerk(5000);
                            $timeout.flush(5000);

                            player = mockPlayers[0];
                        });

                        it('will setup the $interval again', function() {
                            player.getCurrentTime.andReturn(10);
                            $interval.flush(500);
                            expect(iface.emit).toHaveBeenCalledWith('timeupdate', iface);
                        });

                        it('will set up the "play" listener again', function() {
                            player._on.playing[1](player);
                            expect(iface.emit).toHaveBeenCalledWith('play', iface);
                        });

                        it('will set up the "paused" listener again', function() {
                            player._on.paused[1](player);
                            expect(iface.emit).toHaveBeenCalledWith('pause', iface);
                        });
                    });

                    describe('if twerking succeeds', function() {
                        var player;

                        beforeEach(function() {
                            spyOn(iface, 'emit');
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            $timeout.flush();
                            iface.twerk();
                            mockPlayers[0]._once.playing[0]({},mockPlayers[0]);
                            $scope.$digest();

                            player = mockPlayers[0];
                        });

                        it('will setup the $interval again', function() {
                            player.getCurrentTime.andReturn(10);
                            $interval.flush(500);
                            expect(iface.emit).toHaveBeenCalledWith('timeupdate', iface);
                        });

                        it('will set up the "play" listener again', function() {
                            player._on.playing[1](player);
                            expect(iface.emit).toHaveBeenCalledWith('play', iface);
                        });

                        it('will set up the "paused" listener again', function() {
                            player._on.paused[1](player);
                            expect(iface.emit).toHaveBeenCalledWith('pause', iface);
                        });
                    });
                });
            });
            /* -- end describe('twerking' */
            
            describe('events',function(){
                var iface;
                beforeEach(function(){
                    iface = null;
                    $scope.$on('playerAdd',function(event,playerInterface){
                        iface = playerInterface;
                    });
                });
                
                describe('ready',function(){
                    it('is emitted when the player is ready',function(){
                        var readySpy = jasmine.createSpy('playerIsReady');
                        $compile(
                            '<youtube-card videoid="a" width="1" height="2"></youtube-card>'
                        )($scope);
                        $timeout.flush();
                        iface.on('ready',readySpy);
                        expect(readySpy).not.toHaveBeenCalled();
                        expect(iface.isReady()).toEqual(false);
                        
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        
                        expect(readySpy).toHaveBeenCalledWith(iface);
                        expect(iface.isReady()).toEqual(true);
                    });
                });


                describe('pause', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile('<youtube-card videoid="a"></youtube-card>')($scope);
                        });
                        $timeout.flush();
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        spyOn(iface, 'emit');
                    });

                    it('should emit "pause" on the interface', function() {
                        mockPlayers[0]._on.paused[0](mockPlayers[0]);

                        expect(iface.emit).toHaveBeenCalledWith('pause', iface);
                    });
                });


                describe('playing', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile('<youtube-card videoid="a"></youtube-card>')($scope);
                        });
                        $timeout.flush();
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        spyOn(iface, 'emit');
                    });

                    describe('when ready', function() {
                        it('should emit "play" on the interface', function() {
                            var player = mockPlayers[0],
                                callCount;

                            player._on.playing[0](player);
                            expect(iface.emit).toHaveBeenCalledWith('play', iface);
                            callCount = iface.emit.callCount;

                            player._on.playing[0](player);
                            expect(iface.emit.callCount).toBe(callCount + 1);
                        });
                    });
                });


                describe('start',function(){
                    it('will seekTo start value if currentTime is < start',function(){
                        var player;

                        $compile(
                            '<youtube-card videoid="a" start="10" end="20"></youtube-card>'
                        )($scope);
                        $timeout.flush();
                        player = mockPlayers[0];

                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();

                        $interval.flush(500);
                        expect(player.seekTo).not.toHaveBeenCalled();

                        player.isPlaying.andReturn(true);
                        $interval.flush(500);
                        expect(player.seekTo).toHaveBeenCalledWith(10);
                        player.getCurrentTime.andReturn(11);

                        $interval.flush(1000);
                        expect(player.seekTo.callCount).toBe(1);
                    });
                });

                describe('timeupdate', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile('<youtube-card videoid="a"></youtube-card>')($scope);
                        });
                        $timeout.flush();
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        spyOn(iface, 'emit');
                    });

                    it('should not emit timeupdate before the video time has changed', function() {
                        $interval.flush(500);
                        expect(iface.emit).not.toHaveBeenCalled();
                    });

                    it('should emit timeupdate when the currenttime changes', function() {
                        var player = mockPlayers[0];

                        player.getCurrentTime.andReturn(0);
                        $interval.flush(500);
                        expect(iface.emit).not.toHaveBeenCalled();

                        player.getCurrentTime.andReturn(10);
                        $interval.flush(1000);
                        expect(iface.emit).toHaveBeenCalledWith('timeupdate', iface);

                        $interval.flush(1000);
                        expect(iface.emit.callCount).toBe(1);

                        player.getCurrentTime.andReturn(20);
                        $interval.flush(1000);
                        expect(iface.emit.callCount).toBe(2);
                    });
                });

                describe('end',function(){

                    it('youtube ended event will triger ended',function(){
                        var endedSpy = jasmine.createSpy('playerHasEnded');
                        $compile(
                            '<youtube-card videoid="a" end="10"></youtube-card>'
                        )($scope);
                        $timeout.flush();
                        iface.on('ended',endedSpy);
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();

                        //simulate the firing of the finish event
                        mockPlayers[0]._on.ended[0](mockPlayers[0]);
                        expect(endedSpy).toHaveBeenCalledWith(iface);

                    });

                    it('end param will trigger ended based on playing',function(){
                        $compile(
                            '<youtube-card videoid="a" end="10"></youtube-card>'
                        )($scope);
                        $timeout.flush();

                        expect(mockPlayers[0]._on.ended).not.toBeDefined();

                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();

                        mockPlayers[0].play();

                        expect(mockPlayers[0]._on.ended).toBeDefined();
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();

                        $interval.flush(500);

                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                        expect(mockPlayers[0].emit).not.toHaveBeenCalled();

                        mockPlayers[0].getCurrentTime.andCallFake(function(){
                            return 5;
                        });
                        $interval.flush(500);
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                        expect(mockPlayers[0].emit).not.toHaveBeenCalled();

                        mockPlayers[0].getCurrentTime.andCallFake(function(){
                            return 10;
                        });
                        $interval.flush(500);

                        expect(mockPlayers[0].pause).toHaveBeenCalled();
                        expect(mockPlayers[0].emit.mostRecentCall.args[0]).toEqual('ended');

                        // Make sure nobody tries to access the player after this
                        expect(mockPlayers[0].isPlaying.callCount).toBe(3);
                        expect(mockPlayers[0].getCurrentTime.callCount).toBe(3);

                        $interval.flush(500);
                        expect(mockPlayers[0].emit.callCount).toBe(1);
                    });

                    it('will not regenerate the player by default', function(){
                        $compile(
                            '<youtube-card videoid="a" end="10"></youtube-card>'
                        )($scope);
                        $timeout.flush();
                        
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(1);
                        expect(iface.isReady()).toEqual(true);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);

                        //simulate the firing of the finish event
                        mockPlayers[0]._on.ended[0](mockPlayers[0]);
                        expect(function(){$timeout.flush();}).toThrow();
                        expect(mockPlayers.length).toEqual(1);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);
                        expect(iface.isReady()).toEqual(true);
                    });

                    it('will regenerate the player if regenerate param is set',function(){
                        spyOn($interval, 'cancel');
                        $compile(
                            '<youtube-card videoid="a" regenerate="1"></youtube-card>'
                        )($scope);
                        $timeout.flush();
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();

                        expect(mockPlayers.length).toEqual(1);
                        expect(iface.isReady()).toEqual(true);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);

                        //simulate the firing of the finish event
                        mockPlayers[0]._on.ended[0](mockPlayers[0]);
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(2);
                        expect(mockPlayers[0].destroy.callCount).toEqual(1);
                        expect(iface.isReady()).toEqual(false);
                        expect($interval.cancel).toHaveBeenCalled();
                    });
                });
            });
            /* -- end describe('events' */
        });
    });
}());
