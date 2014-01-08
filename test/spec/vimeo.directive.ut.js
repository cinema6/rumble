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
                        var mockPlayer = {};
                        mockPlayer.on       = jasmine.createSpy('vimeoPlayer.on');
                        mockPlayer.once     = jasmine.createSpy('vimeoPlayer.once');
                        mockPlayer.setSize  = jasmine.createSpy('vimeoPlayer.setSize');
                        mockPlayer.play     = jasmine.createSpy('vimeoPlayer.play');
                        mockPlayer.pause    = jasmine.createSpy('vimeoPlayer.pause');
                        mockPlayer.seekTo   = jasmine.createSpy('vimeoPlayer.seekTo');

                        mockPlayer._on = {};
                        mockPlayer._onOnce = {};

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
                    expect(vimeo.createPlayer.calls[0].args[0]).toEqual('abc123');
                    expect(vimeo.createPlayer.calls[0].args[1]).toEqual({
                        videoId: 'abc123',
                        width: '1',
                        height: '2',
                        params: {},
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

                it('will emit playerAdd and playerRemove at create and destroy.',function(){
                    var addSpy      = jasmine.createSpy('playerAdd'),
                        removeSpy   = jasmine.createSpy('playerRemove');
                    $scope.$on('playerAdd',addSpy);
                    $scope.$on('playerRemove',removeSpy);
                    $compile(
                        '<vimeo-player videoid="abc123" width="{{width}}" height="{{height}}" ></vimeo-player>'
                    )($scope);
                    $timeout.flush();
                    $scope.$destroy();
                    expect(addSpy).toHaveBeenCalled();
                    expect(removeSpy).toHaveBeenCalled();
                   
                    expect(addSpy.calls[0].args[1].getType()).toEqual('vimeo');
                    expect(addSpy.calls[0].args[1].getVideoId()).toEqual('abc123');
                    expect(addSpy.calls[0].args[1].play).toBeDefined();
                    expect(addSpy.calls[0].args[1].pause).toBeDefined();
                    expect(addSpy.calls[0].args[1].rewind).toBeDefined();
                    expect(removeSpy.calls[0].args[1]).toBe(addSpy.calls[0].args[1]); 
                });
            });
            /* -- end describe('initialization' */
            describe('playerInterface',function(){
                var iface;
                beforeEach(function(){
                    $scope.$on('playerAdd',function(event,playerInterface){
                        iface = playerInterface;
                    });
                    $compile(
                        '<vimeo-player videoid="abc123" width="1" height="2" start="{{start}}" end="{{end}}"></vimeo-player>'
                    )($scope);
                    $timeout.flush();
                });

                describe('when player is not ready',function(){
                    it('will not play',function(){
                        iface.play();
                        expect(mockPlayers[0].play).not.toHaveBeenCalled();
                    });

                    it('will not pause',function(){
                        iface.pause();
                        expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                    });

                    it('will not rewind',function(){
                        iface.rewind();
                        expect(mockPlayers[0].seekTo).not.toHaveBeenCalled();
                    });
                });

                describe('when player is ready',function(){
                    beforeEach(function(){
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
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

                    describe('rewind method',function(){
                        it('proxies to seekTo with 0 if no start param is set',function(){
                            expect(mockPlayers[0].seekTo).not.toHaveBeenCalled();
                            iface.rewind();
                            expect(mockPlayers[0].seekTo).toHaveBeenCalledWith(0);
                        });

                        it('proxies to seekTo with start param if set',function(){
                            $scope.start=10;
                            $scope.$digest();
                            iface.rewind();
                            expect(mockPlayers[0].seekTo).toHaveBeenCalledWith(10);
                        });
                    });
                });
            });
            /* -- end describe('playerInterface' */
        });
    });
}());
