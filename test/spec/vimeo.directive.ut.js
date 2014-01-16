(function(){
    'use strict';
    
    define(['vimeo'], function() {
        describe('vimeoPlayer directive',function(){
            var $compile,
                $timeout,
                $log,
                $rootScope,
                $scope,
                mockPlayers,
                vimeo = {};

            beforeEach(function() {
                mockPlayers = [];
                module('c6.rumble',function($provide){
                    vimeo.createPlayer = jasmine.createSpy('vimeo.createPlayer')
                    .andCallFake(function(playerId,config,$parentElement){
                        var mockPlayer = {
                            on              : jasmine.createSpy('vimeoPlayer.on'),
                            once            : jasmine.createSpy('vimeoPlayer.once'),
                            emit            : jasmine.createSpy('vimeoPlayer.emit'),
                            removeListener  : jasmine.createSpy('vimeoPlayer.removeListener'),
                            setSize         : jasmine.createSpy('vimeoPlayer.setSize'),
                            destroy         : jasmine.createSpy('vimeoPlayer.destroy'),
                            post            : jasmine.createSpy('vimeoPlayer.post'),
                            play            : jasmine.createSpy('vimeoPlayer.play'),
                            pause           : jasmine.createSpy('vimeoPlayer.pause'),
                            seekTo          : jasmine.createSpy('vimeoPlayer.seekTo'),

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
                    $provide.value('vimeo', vimeo);
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
                            $compile('<vimeo-player></vimeo-player>')($rootScope);
                        });
                    }).toThrow('vimeoPlayer requires the videoid attribute to be set.');
                });

                it('will create a player',function(){
                    $compile(
                        '<vimeo-player videoid="abc123" width="1" height="2"></vimeo-player>'
                    )($scope);
                    $timeout.flush();
                    expect($log.context).toHaveBeenCalledWith('vimeoPlayer');
                    expect(mockPlayers.length).toEqual(1);
                    expect(vimeo.createPlayer.calls[0].args[0]).toEqual('vm_abc123');
                    expect(vimeo.createPlayer.calls[0].args[1]).toEqual({
                        videoId: 'abc123',
                        width: '1',
                        height: '2',
                        params: {
                            badge: 0,
                            portrait: 0
                        },
                        frameborder: 0
                    });
                });

                it('will observe changes to width and height',function(){
                    var vimeoPlayer, scope;
                    vimeoPlayer = $compile(
                        '<vimeo-player videoid="abc123" width="{{width}}" height="{{height}}"></vimeo-player>'
                    )($scope);
                    scope = vimeoPlayer.scope();
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
                        '<vimeo-player videoid="abc123" width="1" height="2" start="{{start}}" end="{{end}}"></vimeo-player>'
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
                        expect(iface.getType()).toEqual('vimeo');
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

                    it('will not reset',function(){
                        expect(mockPlayers[0]._once.playProgress).not.toBeDefined();
                        expect(mockPlayers[0]._on.playProgress).not.toBeDefined();
                        iface.reset();
                        expect(mockPlayers[0]._once.playProgress).not.toBeDefined();
                        expect(mockPlayers[0]._on.playProgress).not.toBeDefined();
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

                    describe('reset method',function(){
                        it('sets startListener only if no end param is set',function(){
                            expect(mockPlayers[0]._once.playProgress).not.toBeDefined();
                            expect(mockPlayers[0]._on.playProgress).not.toBeDefined();
                            iface.reset();
                            expect(mockPlayers[0]._once.playProgress.length).toEqual(1);
                            expect(mockPlayers[0]._on.playProgress).not.toBeDefined();
                        });

                        it('sets start and end listener if both params are set',function(){
                            expect(mockPlayers[0]._once.playProgress).not.toBeDefined();
                            expect(mockPlayers[0]._on.playProgress).not.toBeDefined();
                            $scope.start=10;
                            $scope.end=20;
                            $scope.$digest();
                            iface.reset();
                            expect(mockPlayers[0]._once.playProgress.length).toEqual(1);
                            expect(mockPlayers[0]._on.playProgress.length).toEqual(1);
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
                        spyOn(iface,'reset');
                    });
                });

                describe('parameter',function(){
                    describe('when not turned on',function(){
                        beforeEach(function(){
                            $compile(
                                '<vimeo-player videoid="abc123" width="1" height="2"></vimeo-player>'
                            )($scope);
                            $timeout.flush();
                            $scope.$digest();
                        });

                        it('will not play/pause when player is ready',function(){
                            expect(iface.isReady()).toEqual(false);
                            expect(mockPlayers[0].play).not.toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            expect(iface.reset).not.toHaveBeenCalled();
                            expect(mockPlayers[0]._once.playProgress).not.toBeDefined();
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            $timeout.flush();
                            expect(iface.isReady()).toEqual(true);
                            expect(mockPlayers[0].play).not.toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            expect(iface.reset).not.toHaveBeenCalled();
                        });
                    });

                    describe('when turned on',function(){

                        beforeEach(function(){
                            $compile(
                                '<vimeo-player videoid="abc123" width="1" height="2" twerk="1"></vimeo-player>'
                            )($scope);
                            $timeout.flush();
                        });

                        it('will play when the player is ready',function(){
                            expect(iface.isReady()).toEqual(false);
                            expect(mockPlayers[0].play).not.toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            expect(iface.reset).not.toHaveBeenCalled();
                            expect(mockPlayers[0]._once.playProgress).not.toBeDefined();
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            expect(iface.isReady()).toEqual(false);
                            expect(mockPlayers[0]._once.playProgress).toBeDefined();
                            expect(mockPlayers[0].play).toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            expect(iface.reset).not.toHaveBeenCalled();
                        });

                        it('will pause and reset once the player starts playing',function(){
                            mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                            expect(mockPlayers[0].play).toHaveBeenCalled();
                            expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                            expect(iface.reset).not.toHaveBeenCalled();
                            
                            mockPlayers[0]._once.playProgress[0]({},mockPlayers[0]);
                            $scope.$digest();
                            expect(mockPlayers[0].pause).toHaveBeenCalled();
                            expect(iface.reset).not.toHaveBeenCalled();
                            expect(iface.isReady()).toEqual(true);
                        });

                    });
                });

                describe('method',function(){
                    var resolveSpy, rejectSpy;
                    beforeEach(function(){
                        resolveSpy = jasmine.createSpy('twerk.resolve');
                        rejectSpy  = jasmine.createSpy('twerk.reject');
                        
                        $compile(
                            '<vimeo-player videoid="abc123" width="1" height="2"></vimeo-player>'
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
                        
                        mockPlayers[0]._once.playProgress[0]({},mockPlayers[0]);
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
                            '<vimeo-player videoid="a" width="1" height="2"></vimeo-player>'
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
                            '<vimeo-player videoid="a" width="1" twerk="1"></vimeo-player>'
                        )($scope);
                        $timeout.flush();
                        iface.on('ready',readySpy);
                        expect(readySpy).not.toHaveBeenCalled();
                        expect(iface.isReady()).toEqual(false);
                        
                        //simulate the firing of the ready and play event
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        mockPlayers[0]._once.playProgress[0]({},mockPlayers[0]);

                        $scope.$digest();
                        
                        expect(readySpy).toHaveBeenCalledWith(iface);
                        expect(iface.isReady()).toEqual(true);
                    });
                });

                describe('start',function(){
                
                    it('will emit videoStarted on firt playProgress event',function(){
                        $compile(
                            '<vimeo-player videoid="a" width="1" height="2"></vimeo-player>'
                        )($scope);
                        var startedSpy = jasmine.createSpy('playerHasStarted');
                        iface.on('videoStarted',startedSpy);
                        $timeout.flush();

                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                     
                        iface.reset();

                        //simulate the firing of the playProgress event
                        mockPlayers[0]._once.playProgress[0]({},mockPlayers[0]);

                        expect(startedSpy).toHaveBeenCalledWith(iface);
                        
                        expect(mockPlayers[0].seekTo).not.toHaveBeenCalled();
                    });

                    it('will seekTo start value if set',function(){
                        $compile(
                            '<vimeo-player videoid="a" start="10"></vimeo-player>'
                        )($scope);
                        $timeout.flush();

                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                     
                        iface.reset();

                        //simulate the firing of the playProgress event
                        mockPlayers[0]._once.playProgress[0](mockPlayers[0]);

                        expect(mockPlayers[0].seekTo).toHaveBeenCalledWith(10);

                    });
                });

                describe('end',function(){

                    it('vimeo finish event will triger videoEnded',function(){
                        var endedSpy = jasmine.createSpy('playerHasEnded');
                        $compile(
                            '<vimeo-player videoid="a" end="10"></vimeo-player>'
                        )($scope);
                        $timeout.flush();
                        iface.on('videoEnded',endedSpy);
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();

                        //simulate the firing of the finish event
                        mockPlayers[0]._on.finish[0](mockPlayers[0]);
                        expect(endedSpy).toHaveBeenCalledWith(iface);

                    });

                    it('end param will trigger finish based on playProgress',function(){
                        $compile(
                            '<vimeo-player videoid="a" end="10"></vimeo-player>'
                        )($scope);
                        $timeout.flush();

                        expect(mockPlayers[0]._on.finish).not.toBeDefined();

                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                      
                        expect(mockPlayers[0]._on.finish).toBeDefined();
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();

                        iface.reset();

                        //simulate the firing of the playProgress event
                        mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds : 0 });
                        expect(function(){$timeout.flush()}).toThrow();
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                        expect(mockPlayers[0].emit).not.toHaveBeenCalled();

                        mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds : 5 });
                        expect(function(){$timeout.flush()}).toThrow();
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                        expect(mockPlayers[0].emit).not.toHaveBeenCalled();

                        mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds : 10 });
                        expect(function(){$timeout.flush()}).not.toThrow();
                        expect(mockPlayers[0].pause).toHaveBeenCalled();
                        expect(mockPlayers[0].emit.mostRecentCall.args[0]).toEqual('finish');
                    });

                    it('will not regenerate the player by default', function(){
                        $compile(
                            '<vimeo-player videoid="a" end="10"></vimeo-player>'
                        )($scope);
                        $timeout.flush();
                        
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(1);
                        expect(iface.isReady()).toEqual(true);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);

                        //simulate the firing of the finish event
                        mockPlayers[0]._on.finish[0](mockPlayers[0]);
                        expect(function(){$timeout.flush();}).toThrow();
                        expect(mockPlayers.length).toEqual(1);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);
                        expect(iface.isReady()).toEqual(true);
                    });

                    it('will regenerate the player if regenerate param is set',function(){
                        $compile(
                            '<vimeo-player videoid="a" regenerate="1"></vimeo-player>'
                        )($scope);
                        $timeout.flush();
                        //simulate the firing of the ready event
                        mockPlayers[0]._on.ready[0](mockPlayers[0]);
                        $timeout.flush();
                        expect(mockPlayers.length).toEqual(1);
                        expect(iface.isReady()).toEqual(true);
                        expect(mockPlayers[0].destroy.callCount).toEqual(0);

                        //simulate the firing of the finish event
                        mockPlayers[0]._on.finish[0](mockPlayers[0]);
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
