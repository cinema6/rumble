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
                        .toEqual('https://www.youtube.com/embed/x123?html5=1');
                });
                it('should format with params', function(){
                    expect(youtube.formatPlayerSrc('x123',{ autoPlay : 1, loop: 1}))
                        .toEqual('https://www.youtube.com/embed/x123?html5=1&autoplay=1&loop=1');
                });
            });

            describe('isReady',function(){
                it('returns true if the YT var is set',function(){
                    $window.YT = {};
                    expect(youtube.isReady()).toEqual(true);
                    delete $window.YT;
                });

                it('returns false if the YT var is not set',function(){
                    expect(youtube.isReady()).toEqual(false);
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
                    it('when the YT var is not ready',function(){
                        expect(function(){
                            youtube.createPlayer('player1',{
                                width: 100,
                                height: 100,
                                videoId: 'xyz'
                            });
                        }).toThrow('Youtube has not been initialized');
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
                            width: 100,
                            height: 100,
                            videoId: 'x123'
                        },angularElementMock);

                        expect(youtube.formatPlayerSrc)
                            .toHaveBeenCalledWith('x123',undefined);
                        expect(angular.element.calls[0].args[0]).toEqual('<iframe id="player1" src="http://www.youtube.com/embed/x123?enablejsapi=1" width="100" height="100"></iframe>');
                        expect(angular.element.calls[1].args[0]).toEqual(angularElementMock);

                        expect(angularElementMock.append)
                            .toHaveBeenCalledWith(angularElementMock);

                        expect($window.YT.Player.calls[0].args[0]).toEqual('player1');
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
                            setSize     : jasmine.createSpy('YT.setSize') 
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

