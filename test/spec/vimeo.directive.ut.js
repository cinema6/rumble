define(['cards/vimeo', 'services', 'app', 'angular'], function(vimeoModule, servicesModule, appModule, angular) {
    'use strict';

    describe('vimeoPlayer directive',function(){
        var $compile,
            $timeout,
            $log,
            $q,
            $rootScope,
            $scope,
            mockPlayers,
            vimeo = {};

        beforeEach(function() {
            mockPlayers = [];
            module(servicesModule.name, function($provide) {
                $provide.value('ControlsService', {
                    bindTo: angular.noop
                });
            });
            module(appModule.name,function($provide){
                $provide.value('c6AppData', {
                    mode: 'mobile',
                    behaviors: {},
                    experience: {
                        data: {
                            autoplay: true
                        }
                    },
                    profile: {
                        touch: true
                    }
                });

                vimeo.createPlayer = jasmine.createSpy('vimeo.createPlayer')
                .and.callFake(function(playerId,config,$parentElement){
                    var mockPlayer = {
                        on                  : jasmine.createSpy('vimeoPlayer.on'),
                        once                : jasmine.createSpy('vimeoPlayer.once'),
                        emit                : jasmine.createSpy('vimeoPlayer.emit'),
                        removeListener      : jasmine.createSpy('vimeoPlayer.removeListener'),
                        setSize             : jasmine.createSpy('vimeoPlayer.setSize'),
                        destroy             : jasmine.createSpy('vimeoPlayer.destroy'),
                        post                : jasmine.createSpy('vimeoPlayer.post'),
                        play                : jasmine.createSpy('vimeoPlayer.play'),
                        pause               : jasmine.createSpy('vimeoPlayer.pause'),
                        seekTo              : jasmine.createSpy('vimeoPlayer.seekTo'),
                        getCurrentTimeAsync : jasmine.createSpy('VimeoPlayer.getCurrentTimeAsync()'),
                        getDurationAsync    : jasmine.createSpy('VimeoPlayer.getDurationAsync()'),
                        getPlayerId         : jasmine.createSpy('VimeoPlayer.getPlayerId()'),

                        _on                 : {},
                        _once               : {},
                        _removes            : {}
                    };

                    mockPlayer.on.and.callFake(function(eventName,handler){
                        if (mockPlayer._on[eventName] === undefined){
                            mockPlayer._on[eventName] = [];
                        }
                        mockPlayer._on[eventName].push(handler);
                    });

                    mockPlayer.once.and.callFake(function(eventName,handler){
                        if (mockPlayer._once[eventName] === undefined){
                            mockPlayer._once[eventName] = [];
                        }
                        mockPlayer._once[eventName].push(handler);
                    });

                    mockPlayer.removeListener.and.callFake(function(eventName,listener){
                        var ons = mockPlayer._on[eventName] || [],
                            onces = mockPlayer._once[eventName] || [],
                            onIndex = ons.indexOf(listener),
                            onceIndex = onces.indexOf(listener);

                        if (mockPlayer._removes[eventName] === undefined){
                            mockPlayer._removes[eventName] = [];
                        }

                        ons.splice(onIndex, ((onIndex > -1) ? 1 : 0));
                        onces.splice(onceIndex, ((onceIndex > -1) ? 1 : 0));

                        mockPlayer._removes[eventName].push(listener);
                    });

                    mockPlayer.getDurationAsync.and.returnValue($q.defer().promise);

                    mockPlayer.getPlayerId.and.returnValue('68160950');

                    mockPlayers.push(mockPlayer);
                    return mockPlayer;
                });
                $provide.value('vimeo', vimeo);
            });
            module(vimeoModule.name);

            inject(function($injector) {
                $timeout    = $injector.get('$timeout');
                $compile    = $injector.get('$compile');
                $rootScope  = $injector.get('$rootScope');
                $log        = $injector.get('$log');
                $q          = $injector.get('$q');
                
                $log.context = jasmine.createSpy('$log.context');
                $log.context.and.callFake(function() { return $log; });

                $rootScope.config = {};
                $scope = $rootScope.$new();
                $scope.width = 100;
                $scope.height = 100;
                $scope.config = {
                    data: {
                        videoid: 'foo'
                    }
                };
                $scope.profile = {};
            });
        });

        describe('initialization',function(){
            it('will fail without a videoid',function(){
                expect(function(){
                    $scope.$apply(function() {
                        $compile('<vimeo-card></vimeo-card>')($scope);
                    });
                }).toThrow(new Error('<vimeo-card> requires the videoid attribute to be set.'));
            });

            it('will create a player',function(){
                $compile(
                    '<vimeo-card videoid="abc123" width="1" height="2"></vimeo-card>'
                )($scope);
                $timeout.flush();
                expect($log.context).toHaveBeenCalledWith('<vimeo-card>');
                expect(mockPlayers.length).toEqual(1);
                expect(vimeo.createPlayer.calls.argsFor(0)[0]).toEqual('vm_abc123');
                expect(vimeo.createPlayer.calls.argsFor(0)[1]).toEqual({
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
                    '<vimeo-card videoid="abc123" width="{{width}}" height="{{height}}"></vimeo-card>'
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
                addSpy.and.callFake(function(event,playerInterface){
                    iface = playerInterface;
                });

                $scope.$on('playerAdd'      ,addSpy);
                
                $compile(
                    '<vimeo-card videoid="abc123" width="1" height="2" start="{{start}}" end="{{end}}"></vimeo-card>'
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
                        expect(iface.webHref).toBe('http://vimeo.com/abc123');
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
                            player._on.playProgress[0](player, { seconds: 10 });
                            expect(iface.currentTime).toBe(10);

                            player._on.playProgress[0](player, { seconds: 20 });
                            expect(iface.currentTime).toBe(20);

                            player._on.playProgress[0](player, { seconds: 30 });
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

                    describe('if a start time is specified', function() {
                        beforeEach(function() {
                            $compile(
                                '<vimeo-card videoid="abc1234" width="1" height="2" start="10"></vimeo-card>'
                            )($scope);
                            $timeout.flush();

                            player = mockPlayers[1];

                            player._on.ready[0]({},player);
                            $timeout.flush();
                            player._on.playProgress[0](player, { seconds: 10 });
                        });

                        describe('getting', function() {
                            it('should subtract the start time in its calculation', function() {
                                expect(iface.currentTime).toBe(0);

                                player._on.playProgress[0](player, { seconds: 20 });
                                expect(iface.currentTime).toBe(10);

                                player._on.playProgress[0](player, { seconds: 30 });
                                expect(iface.currentTime).toBe(20);
                            });

                            it('should never go below 0', function() {
                                player._on.playProgress[0](player, { seconds: 5 });

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

                        it('should become false when the "play" event is emitted', function() {
                            player._on.play[0](player);

                            expect(iface.paused).toBe(false);
                        });

                        it('should go back to true when the "pause" event is emitted', function() {
                            player._on.play[0](player);
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
                            var duration;

                            beforeEach(function() {
                                duration = $q.defer();

                                $scope.start = 30;

                                $compile(
                                    '<vimeo-card videoid="abc1234" width="1" height="2" start="{{start}}"></vimeo-card>'
                                )($scope);
                                $timeout.flush();

                                player = mockPlayers[1];
                                player.getDurationAsync.and.returnValue(duration.promise);

                                player._on.ready[0]({},player);
                                $timeout.flush();
                            });

                            it('should be NaN at first', function() {
                                expect(iface.duration).toBeNaN();
                            });

                            it('should update after the deferred resolves', function() {
                                expect(iface.duration).toBeNaN();

                                $scope.$apply(function() {
                                    duration.resolve(60);
                                });
                                expect(iface.duration).toBe(30);

                                $scope.$apply(function() {
                                    $scope.start = 20;
                                });
                                expect(iface.duration).toBe(40);
                            });
                        });

                        describe('if there is an end time', function() {
                            beforeEach(function() {
                                $scope.end = 30;

                                $compile(
                                    '<vimeo-card videoid="abc1234" width="1" height="2" end="{{end}}"></vimeo-card>'
                                )($scope);
                                $timeout.flush();

                                player = mockPlayers[1];

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
                            var duration;

                            beforeEach(function() {
                                duration = $q.defer();

                                $compile(
                                    '<vimeo-card videoid="abc1234" width="1" height="2"></vimeo-card>'
                                )($scope);
                                $timeout.flush();

                                player = mockPlayers[1];
                                player.getDurationAsync.and.returnValue(duration.promise);

                                player._on.ready[0]({},player);
                                $timeout.flush();
                            });

                            it('should be NaN at first', function() {
                                expect(iface.duration).toBeNaN();
                            });

                            it('should be the video\'s duration after the deferred is resolved', function() {
                                expect(iface.duration).toBeNaN();

                                $scope.$apply(function() {
                                    duration.resolve(25);
                                });

                                expect(iface.duration).toBe(25);
                            });
                        });

                        describe('if the player duration is 0', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.start = 10;
                                    $scope.end = 10;
                                });
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

                    describe('when the player emits finish', function() {
                        beforeEach(function() {
                            expect(iface.ended).toBe(false);

                            player._on.finish[0](player);
                        });

                        it('should set ended to true', function() {
                            expect(iface.ended).toBe(true);
                        });
                    });

                    describe('playing after ended', function() {
                        describe('if no start is provided', function() {
                            beforeEach(function() {
                                player._on.play[0](player);
                                expect(player.seekTo).not.toHaveBeenCalled();

                                player._on.finish[0](player);

                                player._on.play[0](player);
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
                                    '<vimeo-card videoid="abc1234" width="1" height="2" start="10"></vimeo-card>'
                                )($scope);
                                $timeout.flush();

                                player = mockPlayers[1];

                                player._on.ready[0]({},player);
                                $timeout.flush();

                                player._on.finish[0](player);
                                player._on.play[0](player);
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
                                '<vimeo-card videoid="abc123" width="1" height="2"></vimeo-card>'
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

                        $scope.$apply(function() {
                            $compile(
                                '<vimeo-card videoid="abc123" width="1" height="2" twerk="1"></vimeo-card>'
                            )($scope);
                        });
                        spyOn(iface, 'twerk').and.callFake(function() {
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
                    resolveSpy = jasmine.createSpy('twerk.resolve');
                    rejectSpy  = jasmine.createSpy('twerk.reject');
                    
                    $compile(
                        '<vimeo-card videoid="abc123" width="1" height="2"></vimeo-card>'
                    )($scope);
                    $timeout.flush();
                });

                it('will remove the "playProgress" listener', function() {
                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                    $timeout.flush();
                    iface.twerk();

                    expect(mockPlayers[0].removeListener).toHaveBeenCalledWith('playProgress', jasmine.any(Function));
                });

                it('will remove its "play" listener', function() {
                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                    $timeout.flush();
                    iface.twerk();

                    expect(mockPlayers[0].removeListener).toHaveBeenCalledWith('play', jasmine.any(Function));
                });

                it('will remove its "pause" listener', function() {
                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                    $timeout.flush();
                    iface.twerk();

                    expect(mockPlayers[0].removeListener).toHaveBeenCalledWith('pause', jasmine.any(Function));
                });

                it('will reject if the player is not ready',function(){
                    expect(iface.isReady()).toEqual(false);
                    iface.twerk().then(resolveSpy,rejectSpy);
                    $scope.$digest();
                    expect(resolveSpy).not.toHaveBeenCalled();
                    expect(rejectSpy).toHaveBeenCalledWith(new Error('Player is not ready to twerk'));
                    expect(iface.twerked).toBe(false);
                });

                it('will resolve when playing starts',function(){
                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                    $timeout.flush();
                    iface.twerk().then(resolveSpy,rejectSpy);
                    
                    mockPlayers[0]._once.playProgress[0]({},mockPlayers[0]);
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
                    expect(rejectSpy).toHaveBeenCalledWith(new Error('Player twerk timed out'));
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
                    expect(rejectSpy).toHaveBeenCalledWith(new Error('Player twerk timed out'));
                    expect(iface.twerked).toBe(false);
                });

                it('will reject if the player has already been twerked', function() {
                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                    $timeout.flush();
                    iface.twerk().then(resolveSpy,rejectSpy);
                    
                    mockPlayers[0]._once.playProgress[0]({},mockPlayers[0]);
                    $scope.$digest();

                    $scope.$apply(function() {
                        iface.twerk().then(resolveSpy, rejectSpy);
                    });
                    expect(rejectSpy).toHaveBeenCalledWith(new Error('Player has already been twerked'));
                    expect(mockPlayers[0].play.calls.count()).toBe(1);
                    expect(mockPlayers[0]._on.playProgress.length).toBe(1);
                });

                it('will not timeout if timeout passed is 0',function(){
                    mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                    $timeout.flush();
                    iface.twerk(0).then(resolveSpy,rejectSpy);
                    
                    expect(function(){$timeout.flush();}).toThrow();
                    expect(resolveSpy).not.toHaveBeenCalled();
                    expect(rejectSpy).not.toHaveBeenCalled();
                });

                describe('if twerking fails', function() {
                    var player;

                    beforeEach(function() {
                        player = mockPlayers[0];

                        spyOn(iface, 'emit');
                        player._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk(5000);
                        $timeout.flush(5000);
                    });

                    it('will setup the playProgress listener again', function() {
                        expect(mockPlayers[0]._on.playProgress.length).toBe(1);
                    });

                    it('will set up the "play" listener again', function() {
                        player._on.play[0](player);
                        expect(iface.emit).toHaveBeenCalledWith('play', iface);
                    });

                    it('will set up the "pause" listener again', function() {
                        player._on.pause[0](player);
                        expect(iface.emit).toHaveBeenCalledWith('pause', iface);
                    });
                });

                describe('if twerking succeeds', function() {
                    var player;

                    beforeEach(function() {
                        player = mockPlayers[0];

                        spyOn(iface, 'emit');
                        mockPlayers[0]._on.ready[0]({},mockPlayers[0]);
                        $timeout.flush();
                        iface.twerk();
                        player._once.playProgress[0]({},mockPlayers[0]);
                        $scope.$digest();
                    });

                    it('will setup the playProgress listener again', function() {
                        expect(mockPlayers[0]._on.playProgress.length).toBe(1);
                    });

                    it('will set up the "play" listener again', function() {
                        player._on.play[0](player);
                        expect(iface.emit).toHaveBeenCalledWith('play', iface);
                    });

                    it('will set up the "pause" listener again', function() {
                        player._on.pause[0](player);
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
                it('is emitted when the player is ready if twerking is off',function(){
                    var readySpy = jasmine.createSpy('playerIsReady');
                    $compile(
                        '<vimeo-card videoid="a" width="1" height="2"></vimeo-card>'
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
                        $compile('<vimeo-card videoid="a"></vimeo-card>')($scope);
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

            describe('playing', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $compile('<vimeo-card videoid="a"></vimeo-card>')($scope);
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

                        player._on.play[0](player);
                        expect(iface.emit).toHaveBeenCalledWith('play', iface);
                        callCount = iface.emit.calls.count();

                        player._on.play[0](player);
                        expect(iface.emit.calls.count()).toBe(callCount + 1);
                    });
                });
            });

            describe('start',function(){
                it('will seekTo start value if set',function(){
                    $compile(
                        '<vimeo-card videoid="a" start="10"></vimeo-card>'
                    )($scope);
                    $timeout.flush();

                    //simulate the firing of the ready event
                    mockPlayers[0]._on.ready[0](mockPlayers[0]);
                    $timeout.flush();

                    //simulate the firing of the playProgress event
                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 20 });
                    expect(mockPlayers[0].seekTo).not.toHaveBeenCalled();

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 3 });
                    expect(mockPlayers[0].seekTo).toHaveBeenCalledWith(10);
                });

                // On some devices *COUGH*android*COUGH*, seeking to a time results in the video seeking
                // to a few seconds before that time. Our code must be forgiving of inaccuracy.
                it('will forgive the player if it seeks a few seconds before the start time', function() {
                    $compile(
                        '<vimeo-card videoid="a" start="10"></vimeo-card>'
                    )($scope);
                    $timeout.flush();

                    //simulate the firing of the ready event
                    mockPlayers[0]._on.ready[0](mockPlayers[0]);
                    $timeout.flush();

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 0.2 });
                    expect(mockPlayers[0].seekTo).toHaveBeenCalledWith(10);

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 10 });
                    expect(mockPlayers[0].seekTo.calls.count()).toBe(1);

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 7 });
                    expect(mockPlayers[0].seekTo.calls.count()).toBe(1);

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 8 });
                    expect(mockPlayers[0].seekTo.calls.count()).toBe(1);

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 9 });
                    expect(mockPlayers[0].seekTo.calls.count()).toBe(1);
                });
            });

            describe('timeupdate', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $compile('<vimeo-card videoid="a"></youtube-player>')($scope);
                    });
                    $timeout.flush();
                    mockPlayers[0]._on.ready[0](mockPlayers[0]);
                    $timeout.flush();
                    spyOn(iface, 'emit');
                });

                it('should emit timeupdate when playProgress is emitted', function() {
                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 10 });
                    expect(iface.emit).toHaveBeenCalledWith('timeupdate', iface);

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 20 });
                    expect(iface.emit.calls.count()).toBe(2);

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds: 30 });
                    expect(iface.emit.calls.count()).toBe(3);
                });
            });

            describe('end',function(){

                it('vimeo finish event will triger ended',function(){
                    var endedSpy = jasmine.createSpy('playerHasEnded');
                    $compile(
                        '<vimeo-card videoid="a"></vimeo-card>'
                    )($scope);
                    $timeout.flush();
                    iface.on('ended' ,endedSpy);
                    //simulate the firing of the ready event
                    mockPlayers[0]._on.ready[0](mockPlayers[0]);
                    $timeout.flush();

                    //simulate the firing of the finish event
                    mockPlayers[0]._on.finish[0](mockPlayers[0]);
                    expect(endedSpy).toHaveBeenCalledWith(iface);

                });

                it('end param will trigger finish based on playProgress',function(){
                    $compile(
                        '<vimeo-card videoid="a" end="10"></vimeo-card>'
                    )($scope);
                    $timeout.flush();

                    expect(mockPlayers[0]._on.finish).not.toBeDefined();

                    //simulate the firing of the ready event
                    mockPlayers[0]._on.ready[0](mockPlayers[0]);
                    $timeout.flush();
                  
                    expect(mockPlayers[0]._on.finish).toBeDefined();
                    expect(mockPlayers[0].pause).not.toHaveBeenCalled();

                    //simulate the firing of the playProgress event
                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds : 0 });
                    expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                    expect(mockPlayers[0].emit).not.toHaveBeenCalled();

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds : 5 });
                    expect(mockPlayers[0].pause).not.toHaveBeenCalled();
                    expect(mockPlayers[0].emit).not.toHaveBeenCalled();

                    mockPlayers[0]._on.playProgress[0](mockPlayers[0], { seconds : 10 });
                    expect(mockPlayers[0].pause).toHaveBeenCalled();
                    expect(mockPlayers[0].emit.calls.mostRecent().args[0]).toEqual('finish');
                });

                it('will not regenerate the player by default', function(){
                    $compile(
                        '<vimeo-card videoid="a" end="10"></vimeo-card>'
                    )($scope);
                    $timeout.flush();
                    
                    //simulate the firing of the ready event
                    mockPlayers[0]._on.ready[0](mockPlayers[0]);
                    $timeout.flush();
                    expect(mockPlayers.length).toEqual(1);
                    expect(iface.isReady()).toEqual(true);
                    expect(mockPlayers[0].destroy.calls.count()).toEqual(0);

                    //simulate the firing of the finish event
                    mockPlayers[0]._on.finish[0](mockPlayers[0]);
                    expect(function(){$timeout.flush();}).toThrow();
                    expect(mockPlayers.length).toEqual(1);
                    expect(mockPlayers[0].destroy.calls.count()).toEqual(0);
                    expect(iface.isReady()).toEqual(true);
                });

                it('will regenerate the player if regenerate param is set',function(){
                    $compile(
                        '<vimeo-card videoid="a" regenerate="1"></vimeo-card>'
                    )($scope);
                    $timeout.flush();
                    //simulate the firing of the ready event
                    mockPlayers[0]._on.ready[0](mockPlayers[0]);
                    $timeout.flush();
                    expect(mockPlayers.length).toEqual(1);
                    expect(iface.isReady()).toEqual(true);
                    expect(mockPlayers[0].destroy.calls.count()).toEqual(0);

                    //simulate the firing of the finish event
                    mockPlayers[0]._on.finish[0](mockPlayers[0]);
                    $timeout.flush();
                    expect(mockPlayers.length).toEqual(2);
                    expect(mockPlayers[0].destroy.calls.count()).toEqual(1);
                    expect(iface.isReady()).toEqual(false);
                });
            });
        });
        /* -- end describe('events' */
    });
});
