(function(){
    'use strict';
    
    define(['youtube'], function() {
        var $log, $window, youtube;
                
        describe('youtube', function() {
            beforeEach(function(){
                module('c6.rumble');
                
                inject(['$log','$window',
                    function(_$log,_$window,_$q,_$rootScope) {
                    $window      = _$window;
                    $log         = _$log;
                    $log.context = function() { return $log; };
                }]);
                
                inject(['youtube',function(_youtube) {
                    youtube = _youtube;
                }]);
                
            });

            describe('formatPlayerSrc',function(){
                it('should format without params',function(){
                    expect(youtube.formatPlayerSrc('x123'))
                        .toEqual('https://www.youtube.com/embed/x123?html5=1&wmode=opaque');
                });
                it('should format with params', function(){
                    expect(youtube.formatPlayerSrc('x123',{ autoPlay : 1, loop: 1}))
                        .toEqual('https://www.youtube.com/embed/x123?html5=1&wmode=opaque&autoplay=1&loop=1');
                });
            });

            describe('isReady',function(){
                it('returns true if the YT.Player var is set',function(){
                    $window.YT = {
                        Player: function() {}
                    };
                    expect(youtube.isReady()).toEqual(true);
                    delete $window.YT;
                });

                it('returns false if the YT.Player var is not set',function(){
                    $window.YT = {};
                    expect(youtube.isReady()).toEqual(false);
                    delete $window.YT;
                });
            });

            describe('createPlayer',function(){
                var angularElementMock, msgListener ;
                
                beforeEach(function(){
                    angular._element = angular.element;
                    angularElementMock = [ {
                        contentWindow : {
                            postMessage : jasmine.createSpy('elt.contentWindow.postMessage')
                        }
                    }];
                    
                    angularElementMock.append      = jasmine.createSpy('elt.append');
                    angularElementMock.prepend     = jasmine.createSpy('elt.prepend');
                    angularElementMock.css         = jasmine.createSpy('elt.css');
                    angularElementMock.replaceWith = jasmine.createSpy('elt.replaceWith');
                    angularElementMock.remove      = jasmine.createSpy('elt.remove');
                    angularElementMock.attr        = function (name) { return name; };
                    
                    spyOn(angular,'element').andCallFake(function(elt){
                        return angularElementMock; 
                    });

                    spyOn($window,'addEventListener').andCallFake(function(ename,listener){
                        msgListener = listener;       
                    });

                    spyOn($window,'removeEventListener');
                });

                afterEach(function(){
                    angular.element = angular._element;
                    delete angular._element;
                });

                describe('should fail', function(){

                    afterEach(function(){
                        delete $window.YT;
                    });
                    it('when it is not provided with a parentElement', function(){
                        $window.YT = {};
                        expect(function(){
                            youtube.createPlayer('player1',{
                                width: 100,
                                height: 100,
                                videoId: 'xyz'
                            });
                        }).toThrow('Parent element is required for youtube.createPlayer');
                    });

                });
                
                describe('should succeed',function(){
                    beforeEach(function(){
                        $window.YT = { Player : {} };
                        spyOn($window.YT,'Player').andCallFake(function(videoId,params){
                            return { };
                        });
                    });

                    afterEach(function(){
                        delete $window.YT;
                    });
                    
                    it('when it has a parent element', function(){
                        var result;

                        spyOn(youtube, 'formatPlayerSrc')
                            .andCallFake(function(videoId,params){
                                return 'http://www.youtube.com/embed/x123?enablejsapi=1';
                            });

                        result = youtube.createPlayer('player1',{
                            videoId: 'x123'
                        },angularElementMock);

                        expect(youtube.formatPlayerSrc)
                            .toHaveBeenCalledWith('x123',undefined);
                        expect(angular.element.calls[0].args[0]).toEqual('<iframe id="player1" src="http://www.youtube.com/embed/x123?enablejsapi=1"></iframe>');
                        expect(angular.element.calls[1].args[0]).toEqual(angularElementMock);

                        expect(angularElementMock.prepend)
                            .toHaveBeenCalledWith(angularElementMock);

                        expect($window.YT.Player.calls[0].args[0]).toEqual('player1');
                    });
                });

                describe('when the Youtube API is not loaded', function() {
                    var player;

                    beforeEach(function() {
                        $window.YT = {};

                        delete $window.onYouTubeIframeAPIReady;

                        player = youtube.createPlayer('player1', {}, angularElementMock);
                    });

                    it('should return a player', function() {
                        expect(player).toEqual(jasmine.any(Object));
                    });

                    it('should create the YT.Player() when YT calls the onYouTubeIframeAPIReady() function', function() {
                        $window.YT.Player = jasmine.createSpy('YT.Player()');
                        $window.onYouTubeIframeAPIReady();
                        expect($window.onYouTubeIframeAPIReady).not.toBeDefined();

                        expect($window.YT.Player).toHaveBeenCalledWith('player1', {
                            events: {
                                onReady: jasmine.any(Function),
                                onStateChange: jasmine.any(Function),
                                onError: jasmine.any(Function)
                            }
                        });
                    });
                });

                describe('when the Youtube API is loaded', function() {
                    var player;

                    beforeEach(function() {
                        delete $window.onYouTubeIframeAPIReady;

                        $window.YT = {
                            Player: jasmine.createSpy('YT.Player()')
                        };

                        player = youtube.createPlayer('player1', {}, angularElementMock);
                        expect($window.onYouTubeIframeAPIReady).not.toBeDefined();
                    });

                    it('should return a player', function() {
                        expect(player).toEqual(jasmine.any(Object));
                    });

                    it('should create the YT.Player() immediately', function() {
                        expect($window.YT.Player).toHaveBeenCalledWith('player1', {
                            events: {
                                onReady: jasmine.any(Function),
                                onStateChange: jasmine.any(Function),
                                onError: jasmine.any(Function)
                            }
                        });
                    });
                });

                describe('returns a YoutubePlayer with',function(){
                    var player, ytPlayerSpy;
                    beforeEach(function(){
                        $window.YT = { 
                            Player : {}, 
                            PlayerState : {
                                ENDED       : 0,
                                PLAYING     : 1,
                                PAUSED      : 2,
                                BUFFERING   : 3,
                                CUED        : 5
                            }
                        };
                        ytPlayerSpy = {
                            playVideo   : jasmine.createSpy('YT.playVideo'),
                            pauseVideo  : jasmine.createSpy('YT.pauseVideo'),
                            destroy     : jasmine.createSpy('YT.destroy'),
                            setSize     : jasmine.createSpy('YT.setSize'),
                            getDuration : jasmine.createSpy('YT.getDuration').andReturn(10)
                        };
                        spyOn($window.YT,'Player').andCallFake(function(videoId,params){
                            ytPlayerSpy.events = params.events;
                            return ytPlayerSpy;
                        });
                        
                        player = youtube.createPlayer('player1',{
                            width: 100,
                            height: 100,
                            videoId: 'x123'
                        },angularElementMock);
                    });

                    afterEach(function(){
                        delete $window.YT;
                    });
                    
                    describe('method', function(){
                        it('toString',function(){
                            expect(player.toString()).toEqual('YoutubePlayer#player1');
                        });

                        it('getPlayerId',function(){
                            expect(player.getPlayerId()).toEqual('player1');
                        });

                        it('getIframe', function(){
                            expect(player.getIframe()).toEqual(angularElementMock);
                        });
                        
                        it('setSize', function(){
                            player.setSize(200,200);
                            expect(ytPlayerSpy.setSize).toHaveBeenCalledWith(200,200);
                        });
                        
                        it('play', function(){
                            player.play();
                            expect(ytPlayerSpy.playVideo).toHaveBeenCalled();
                        });

                        it('pause', function(){
                            player.pause();
                            expect(ytPlayerSpy.pauseVideo).toHaveBeenCalled();
                        });

                        it('destroy', function(){
                            player.destroy();
                            expect(ytPlayerSpy.destroy).toHaveBeenCalled();
                        });

                        it('getDuration', function() {
                            expect(player.getDuration()).toBe(10);
                            expect(ytPlayerSpy.getDuration).toHaveBeenCalled();
                        });
                    });

                    describe('events',function(){
                        it('ready',function(){
                            var readySpy = jasmine.createSpy('player.ready');
                            expect(ytPlayerSpy.events.onReady).toBeDefined();
                            player.on('ready',readySpy);
                            ytPlayerSpy.events.onReady();
                            expect(readySpy).toHaveBeenCalledWith(player);
                        });
                        it('playing',function(){
                            var playingSpy = jasmine.createSpy('player.playing');
                            expect(ytPlayerSpy.events.onStateChange).toBeDefined();
                            player.on('playing',playingSpy);
                            ytPlayerSpy.events.onStateChange( { target : player, data : 1 });
                            expect(playingSpy).toHaveBeenCalledWith(player);
                        });
                        it('paused',function(){
                            var pausedSpy = jasmine.createSpy('player.paused');
                            expect(ytPlayerSpy.events.onStateChange).toBeDefined();
                            player.on('paused',pausedSpy);
                            ytPlayerSpy.events.onStateChange( { target : player, data : 2 });
                            expect(pausedSpy).toHaveBeenCalledWith(player);
                        });
                        it('buffering',function(){
                            var bufferingSpy = jasmine.createSpy('player.buffering');
                            expect(ytPlayerSpy.events.onStateChange).toBeDefined();
                            player.on('buffering',bufferingSpy);
                            ytPlayerSpy.events.onStateChange( { target : player, data : 3 });
                            expect(bufferingSpy).toHaveBeenCalledWith(player);
                        });
                        it('ended',function(){
                            var endedSpy = jasmine.createSpy('player.ended');
                            expect(ytPlayerSpy.events.onStateChange).toBeDefined();
                            player.on('ended',endedSpy);
                            ytPlayerSpy.events.onStateChange( { target : player, data : 0 });
                            expect(endedSpy).toHaveBeenCalledWith(player);
                        });
                        it('error - known',function(){
                            var errorSpy = jasmine.createSpy('player.error');
                            expect(ytPlayerSpy.events.onError).toBeDefined();
                            player.on('error',errorSpy);
                            ytPlayerSpy.events.onError( { target : player, data : 2 });
                            expect(errorSpy).toHaveBeenCalled();
                            expect(errorSpy.mostRecentCall.args[0]).toBe(player);
                            expect(errorSpy.mostRecentCall.args[1].code).toEqual(2);
                            expect(errorSpy.mostRecentCall.args[1].message)
                                .toEqual('Invalid request parameter.');
                        });
                        it('error - unknown',function(){
                            var errorSpy = jasmine.createSpy('player.error');
                            expect(ytPlayerSpy.events.onError).toBeDefined();
                            player.on('error',errorSpy);
                            ytPlayerSpy.events.onError( { target : player, data : 999 });
                            expect(errorSpy).toHaveBeenCalled();
                            expect(errorSpy.mostRecentCall.args[0]).toBe(player);
                            expect(errorSpy.mostRecentCall.args[1].code).toEqual(999);
                            expect(errorSpy.mostRecentCall.args[1].message)
                                .toEqual('Unknown error.');
                        });
                    });
                });
            });
        });
    });
}());

