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
                module('c6.rumble',function($provide){
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
                    $scope = $rootScope.$new();
                    $scope.width = 100;
                    $scope.height = 100;
                });
            });

            describe('initialization',function(){
                it('will fail without a videoid',function(){
                    expect(function(){
                        $scope.$apply(function() {
                            $compile('<dailymotion-player></dailymotion-player>')($rootScope);
                        });
                    }).toThrow('dailymotionPlayer requires the videoid attribute to be set.');
                });

                it('will create a player',function(){
                    $compile(
                        '<dailymotion-player videoid="abc123" width="1" height="2"></dailymotion-player>'
                    )($scope);
                    $timeout.flush();
                    expect($log.context).toHaveBeenCalledWith('dailymotionPlayer');
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
                        '<dailymotion-player videoid="abc123" width="{{width}}" height="{{height}}"></dailymotion-player>'
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
                        '<dailymotion-player videoid="abc123" width="1" height="2" start="{{start}}" end="{{end}}"></dailymotion-player>'
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

                    describe('currentTime property', function() {
                        var player;

                        beforeEach(function() {
                            player = mockPlayers[0];
                        });

                        describe('getting', function() {
                            it('should return the latest update from the playProgress event', function() {
                                player._on.timeupdate[0](player, { time: 10 });
                                expect(iface.currentTime).toBe(10);

                                player._on.timeupdate[0](player, { time: 20 });
                                expect(iface.currentTime).toBe(20);

                                player._on.timeupdate[0](player, { time: 30 });
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
                            $compile(
                                '<dailymotion-player videoid="abc123" width="1" height="2"></dailymotion-player>'
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
                                '<dailymotion-player videoid="abc123" width="1" height="2" twerk="1"></dailymotion-player>'
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
                            '<dailymotion-player videoid="abc123" width="1" height="2"></dailymotion-player>'
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
                            '<dailymotion-player videoid="a" width="1" height="2"></dailymotion-player>'
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

                    it('is emitted when the twerk is done if twerking is on',function(){
                        var readySpy = jasmine.createSpy('playerIsReady');
                        $compile(
                            '<dailymotion-player videoid="a" width="1" twerk="1"></dailymotion-player>'
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

                describe('timeupdate', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $compile('<dailymotion-player videoid="a"></dailymotion-player>')($scope);
                        });
                        $timeout.flush();
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        spyOn(iface, 'emit');
                    });

                    it('should emit timeupdate when timeupdate is emitted', function() {
                        mockPlayers[0]._on.timeupdate[0](mockPlayers[0], { time: 10 });
                        expect(iface.emit).toHaveBeenCalledWith('timeupdate', iface);

                        mockPlayers[0]._on.timeupdate[0](mockPlayers[0], { time: 20 });
                        expect(iface.emit.callCount).toBe(2);

                        mockPlayers[0]._on.timeupdate[0](mockPlayers[0], { time: 30 });
                        expect(iface.emit.callCount).toBe(3);
                    });
                });

                describe('end',function(){
                    it('dailymotion ended event will triger ended',function(){
                        var endedSpy = jasmine.createSpy('playerHasEnded');
                        $compile(
                            '<dailymotion-player videoid="a"></dailymotion-player>'
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
                            '<dailymotion-player videoid="a" end="10"></dailymotion-player>'
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
                            '<dailymotion-player videoid="a" regenerate="1"></dailymotion-player>'
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
