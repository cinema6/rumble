(function(){
    'use strict';
    
    define(['dailymotion'], function() {
        describe('dailymotionPlayer directive',function(){
            var $compile,
                $timeout,
                $log,
                $rootScope,
                $scope,
                mockPlayers,
                dailymotion = {};

            beforeEach(function() {
                mockPlayers = [];
                module('c6.rumble.services', function($provide) {
                    $provide.value('ControlsService', {
                        bindTo: angular.noop
                    });
                });
                module('c6.rumble',function($provide){
                    $provide.value('c6AppData', {
                        profile: {
                            device: 'phone'
                        },
                        experience: {
                            data: {}
                        }
                    });

                    dailymotion.createPlayer = jasmine.createSpy('dm.createPlayer')
                    .andCallFake(function(playerId,config,$parentElement){
                        var mockPlayer = {
                            on              : jasmine.createSpy('dmPlayer.on'),
                            once            : jasmine.createSpy('dmPlayer.once'),
                            emit            : jasmine.createSpy('dmPlayer.emit'),
                            removeListener  : jasmine.createSpy('dmPlayer.removeListener'),
                            setSize         : jasmine.createSpy('dmPlayer.setSize'),
                            destroy         : jasmine.createSpy('dmPlayer.destroy'),
                            post            : jasmine.createSpy('dmPlayer.post'),
                            play            : jasmine.createSpy('dmPlayer.play'),
                            pause           : jasmine.createSpy('dmPlayer.pause'),
                            seekTo          : jasmine.createSpy('dmPlayer.seekTo'),
                            getPlayerId     : jasmine.createSpy('dmPlayer.getPlayerId'),

                            _on             : {},
                            _once           : {},
                            _removes        : {}
                        }

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

                        mockPlayer.getPlayerId.andReturn('x1bx4ir');

                        mockPlayers.push(mockPlayer);
                        return mockPlayer;
                    });
                    $provide.value('dailymotion', dailymotion);
                });

                inject(function($injector) {
                    $timeout    = $injector.get('$timeout');
                    $compile    = $injector.get('$compile');
                    $rootScope  = $injector.get('$rootScope');
                    $log        = $injector.get('$log');
                    
                    $log.context = jasmine.createSpy('$log.context');
                    $log.context.andCallFake(function() { return $log; });

                    $rootScope.config = {};
                    $scope = $rootScope.$new();
                    $scope.width = 100;
                    $scope.height = 100;
                    $scope.profile = {
                        device: 'desktop'
                    };
                    $scope.config = {
                        data: {
                            videoid: 'foo'
                        }
                    };
                });
            });

            describe('initialization',function(){
                it('will fail without a videoid',function(){
                    expect(function(){
                        $scope.$apply(function() {
                            $compile('<dailymotion-card></dailymotion-card>')($scope);
                        });
                    }).toThrow('<dailymotion-card> requires the videoid attribute to be set.');
                });

                it('will create a player',function(){
                    $compile(
                        '<dailymotion-card videoid="abc123" width="1" height="2"></dailymotion-card>'
                    )($scope);
                    $timeout.flush();
                    expect($log.context).toHaveBeenCalledWith('<dailymotion-card>');
                    expect(mockPlayers.length).toEqual(1);
                    expect(dailymotion.createPlayer.calls[0].args[0]).toEqual('dm_abc123');
                    expect(dailymotion.createPlayer.calls[0].args[1]).toEqual({
                        videoId: 'abc123',
                        width: '1',
                        height: '2',
                        params: {
                            related: 0
                        },
                        frameborder: 0
                    });
                });

                it('will observe changes to width and height',function(){
                    var dailymotionPlayer, scope;
                    dailymotionPlayer = $compile(
                        '<dailymotion-card videoid="abc123" width="{{width}}" height="{{height}}"></dailymotion-card>'
                    )($scope);
                    scope = dailymotionPlayer.scope();
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
                        '<dailymotion-card videoid="abc123" width="1" height="2" start="{{start}}" end="{{end}}"></dailymotion-card>'
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
                });

                describe('when player is not ready',function(){
                    it('will have ts videoId',function(){
                        expect(iface.getVideoId()).toEqual('abc123');
                    });

                    it('will have type information',function(){
                        expect(iface.getType()).toEqual('dailymotion');
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

                    describe('webHref property', function() {
                        it('should be computed based on the video\'s id', function() {
                            expect(iface.webHref).toBe('http://www.dailymotion.com/video/abc123');
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
                            it('should return the latest update from the playProgress event', function() {
                                player._on.timeupdate[0](player, { time: '10' });
                                expect(iface.currentTime).toBe(10);

                                player._on.timeupdate[0](player, { time: '20.12' });
                                expect(iface.currentTime).toBe(20.12);

                                player._on.timeupdate[0](player, { time: '30' });
                                expect(iface.currentTime).toBe(30);
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

                            it('should go back to true when the "pause" event is emitted', function() {
                                player._on.playing[0](player);
                                player._on.pause[0](player);

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
                            it('should be initialized as NaN', function() {
                                expect(iface.duration).toBeNaN();
                            });

                            it('should be updated with the duration when the "durationchange" event is fired', function() {
                                player._on.durationchange[0](player, { duration: '45.2sc' });
                                expect(iface.duration).toBe(45.2);

                                player._on.durationchange[0](player, { duration: '20sc' });
                                expect(iface.duration).toBe(20);
                            });
                        });

                        describe('setting', function() {
                            it('should not be publically settable', function() {
                                expect(function() {
                                    iface.duration = 20;
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
                                '<dailymotion-card videoid="abc123" width="1" height="2"></dailymotion-card>'
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
                    var iface;

                    beforeEach(function() {
                        $scope.$on('playerAdd',function(event,playerInterface){
                            iface = playerInterface;
                        });

                        $scope.$apply(function() {
                            $scope.active = false;

                            $compile(
                                '<dailymotion-card videoid="abc123" width="1" height="2"></dailymotion-card>'
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

                    it('should regenerate the player', function() {
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(2);
                        expect(mockPlayers[0].destroy.callCount).toEqual(1);
                        expect(iface.isReady()).toEqual(false);
                    });
                });
            });

            describe('autoplay', function() {
                describe('if off', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.active = true;

                            $compile(
                                '<dailymotion-card videoid="abc123" width="1" height="2"></dailymotion-card>'
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
                                '<dailymotion-card videoid="abc123" width="1" height="2" autoplay="1"></dailymotion-card>'
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

            xdescribe('twerking',function(){
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
                            $compile(
                                '<dailymotion-card videoid="abc123" width="1" height="2"></dailymotion-card>'
                            )($scope);
                            $timeout.flush();
                        });

                        it('will not play/pause when player is ready',function(){
                            expect(iface.isReady()).toEqual(false);
                            expect(mockPlayers[0].play).not.toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            expect(mockPlayers[0]._once.playing).not.toBeDefined();
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            $timeout.flush();
                            expect(iface.isReady()).toEqual(true);
                            expect(mockPlayers[0].play).not.toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                        });
                    });

                    describe('when turned on',function(){

                        beforeEach(function(){
                            $compile(
                                '<dailymotion-card videoid="abc123" width="1" height="2" twerk="1"></dailymotion-card>'
                            )($scope);
                            $timeout.flush();
                        });

                        it('will play when the player is ready',function(){
                            expect(iface.isReady()).toEqual(false);
                            expect(mockPlayers[0].play).not.toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            expect(mockPlayers[0]._once.playing).not.toBeDefined();
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            expect(iface.isReady()).toEqual(false);
                            expect(mockPlayers[0]._once.playing).toBeDefined();
                            expect(mockPlayers[0].play).toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                        });

                        it('will pause once the player starts playing',function(){
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            expect(mockPlayers[0].play).toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();

                            mockPlayers[0]._once.playing[0]({},mockPlayers[0]);
                            $scope.$digest();
                            expect(mockPlayers[0].pause).toHaveBeenCalled();
                            expect(iface.isReady()).toEqual(true);
                        });

                    });

                describe('method',function(){
                    var resolveSpy, rejectSpy;
                    beforeEach(function(){
                        resolveSpy = jasmine.createSpy('twerk.resolve');
                        rejectSpy  = jasmine.createSpy('twerk.reject');
                        
                        $compile(
                            '<dailymotion-card videoid="abc123" width="1" height="2"></dailymotion-card>'
                        )($scope);
                        $timeout.flush();
                    });

                    it('will reject if the player is not ready',function(){
                        expect(iface.isReady()).toEqual(false);
                        iface.twerk().then(resolveSpy,rejectSpy);
                        $scope.$digest();
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).toHaveBeenCalledWith({
                            message : 'Player is not ready to twerk'
                        });
                    });

                    it('will resolve when playing starts',function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk().then(resolveSpy,rejectSpy);
                        
                        mockPlayers[0]._once.playing[0]({},mockPlayers[0]);
                        $scope.$digest();

                        expect(resolveSpy).toHaveBeenCalled();
                        expect(rejectSpy).not.toHaveBeenCalled();
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
                    });

                    it('will not timeout if timeout passed is 0',function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk(0).then(resolveSpy,rejectSpy);
                        
                        expect(function(){$timeout.flush()}).toThrow();
                        expect(resolveSpy).not.toHaveBeenCalled();
                        expect(rejectSpy).not.toHaveBeenCalled();
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
                    it('is emitted when the player is ready if twerking is off',function(){
                        var readySpy = jasmine.createSpy('playerIsReady');
                        $compile(
                            '<dailymotion-card videoid="a" width="1" height="2"></dailymotion-card>'
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

                    xit('is emitted when the twerk is done if twerking is on',function(){
                        var readySpy = jasmine.createSpy('playerIsReady');
                        $compile(
                            '<dailymotion-card videoid="a" width="1" twerk="1"></dailymotion-card>'
                        )($scope);
                        $timeout.flush();
                        iface.on('ready',readySpy);
                        expect(readySpy).not.toHaveBeenCalled();
                        expect(iface.isReady()).toEqual(false);
                        
                        //simulate the firing of the ready and play event
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        mockPlayers[0]._once.playing[0]({},mockPlayers[0]);
                       
                        $scope.$digest();
                        expect(readySpy).toHaveBeenCalledWith(iface);
                        expect(iface.isReady()).toEqual(true);
                    });
                });

                describe('playing', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile('<dailymotion-card videoid="a"></dailymotion-card>')($scope);
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

                describe('pause', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile('<dailymotion-card videoid="a"></dailymotion-card>')($scope);
                        });
                        $timeout.flush();
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        spyOn(iface, 'emit');
                    });

                    it('should emit "pause" on the interface', function() {
                        var player = mockPlayers[0];

                        player._on.pause[0](player);

                        expect(iface.emit).toHaveBeenCalledWith('pause', iface);
                    });
                });

                describe('timeupdate', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile('<dailymotion-card videoid="a"></dailymotion-card>')($scope);
                        });
                        $timeout.flush();
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        spyOn(iface, 'emit');
                    });

                    it('should emit timeupdate when timeupdate is emitted', function() {
                        mockPlayers[0]._on.timeupdate[0](mockPlayers[0], { time: '10' });
                        expect(iface.emit).toHaveBeenCalledWith('timeupdate', iface);

                        mockPlayers[0]._on.timeupdate[0](mockPlayers[0], { time: '20' });
                        expect(iface.emit.callCount).toBe(2);

                        mockPlayers[0]._on.timeupdate[0](mockPlayers[0], { time: '30' });
                        expect(iface.emit.callCount).toBe(3);
                    });
                });

                describe('end',function(){
                    it('dailymotion ended event will triger ended',function(){
                        var endedSpy = jasmine.createSpy('playerHasEnded');
                        $compile(
                            '<dailymotion-card videoid="a"></dailymotion-card>'
                        )($scope);
                        $timeout.flush();
                        iface.on('ended',endedSpy);
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();

                        //simulate the firing of the ended event
                        mockPlayers[0]._on.ended[0](mockPlayers[0]);
                        expect(endedSpy).toHaveBeenCalledWith(iface);
                    });

                    it('will not regenerate the player by default', function(){
                        $compile(
                            '<dailymotion-card videoid="a" end="10"></dailymotion-card>'
                        )($scope);
                        $timeout.flush();
                        
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(1);
                        expect(iface.isReady()).toEqual(true);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);

                        //simulate the firing of the ended event
                        mockPlayers[0]._on.ended[0](mockPlayers[0]);
                        expect(function(){$timeout.flush();}).toThrow();
                        expect(mockPlayers.length).toEqual(1);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);
                        expect(iface.isReady()).toEqual(true);
                    });

                    it('will regenerate the player if regenerate param is set',function(){
                        $compile(
                            '<dailymotion-card videoid="a" regenerate="1"></dailymotion-card>'
                        )($scope);
                        $timeout.flush();
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(1);
                        expect(iface.isReady()).toEqual(true);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);

                        //simulate the firing of the ended event
                        mockPlayers[0]._on.ended[0](mockPlayers[0]);
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(2);
                        expect(mockPlayers[0].destroy.callCount).toEqual(1);
                        expect(iface.isReady()).toEqual(false);
                    });
                });
            });
            /* -- end describe('events' */
        });
    });
}());
