(function(){
    'use strict';
    
    define(['vimeo'], function() {
        var $log, $window, vimeo;
                
        describe('vimeo', function() {
            beforeEach(function(){
                module('c6.rumble');
                
                inject(['$log','$window',function(_$log,_$window) {
                    $window      = _$window;
                    $log         = _$log;
                    $log.context = function() { return $log; };
                }]);
                
                inject(['vimeo',function(_vimeo) {
                    vimeo = _vimeo;
                }]);
                
            });

            describe('formatPlayerSrc',function(){
                it('should format without playerId',function(){
                    expect(vimeo.formatPlayerSrc('x123'))
                        .toEqual('http://player.vimeo.com/video/x123?api=1');
                });
                it('should format with playerId',function(){
                    expect(vimeo.formatPlayerSrc('x123','player1'))
                        .toEqual('http://player.vimeo.com/video/x123?api=1&player_id=player1');
                });
                it('should format without playerId but with params', function(){
                    expect(vimeo.formatPlayerSrc('x123',null,{ autoPlay : 1, loop: 1}))
                        .toEqual('http://player.vimeo.com/video/x123?api=1&autoplay=1&loop=1');
                });
                it('should format with playerId and with params', function(){
                    expect(vimeo.formatPlayerSrc('x123','player1',{ autoPlay : 1, loop: 1}))
                        .toEqual('http://player.vimeo.com/video/x123?api=1&player_id=player1&autoplay=1&loop=1');
                });
            });

            describe('createPlayer', function(){
                var angularElementMock, msgListener;

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

                    it('when it is not provided with a parentElement', function(){
                        expect(function(){
                            vimeo.createPlayer('player1',{
                                width: 100,
                                height: 100,
                                videoId: 'xyz'
                            });
                        }).toThrow('Parent element is required for vimeo.createPlayer');
                    });

                });

                describe('should succeed',function(){
                    it('when it can find the old element', function(){
                        var result;

                        spyOn(vimeo, 'formatPlayerSrc')
                            .andCallFake(function(videoId,playerId,params){
                                return 'http://player.vimeo.com/x123?api=1&player_id=player1';
                            });

                        result = vimeo.createPlayer('player1',{
                            width: 100,
                            height: 100,
                            videoId: 'x123'
                        },angularElementMock);

                        expect(vimeo.formatPlayerSrc)
                            .toHaveBeenCalledWith('x123','player1',undefined);
                        expect(angular.element.calls[0].args[0]).toEqual('<iframe id="player1" src="http://player.vimeo.com/x123?api=1&player_id=player1" width="100" height="100"></iframe>');
                        expect(angular.element.calls[1].args[0]).toEqual(angularElementMock);

                        expect(angularElementMock.append)
                            .toHaveBeenCalledWith(angularElementMock);
                        expect($window.addEventListener.calls[0].args[0]).toEqual('message');
                    });
                });

                describe('returns a VimeoPlayer with',function(){
                    var player;
                    beforeEach(function(){
                    
                        spyOn(angularElementMock,'attr').andCallFake(function(name){
                            return (name === 'src') ? 
                                'http://player.vimeo.com/x123?api=1&player_id=player1' : '';
                        });

                        player = vimeo.createPlayer('player1',{
                            width: 100,
                            height: 100,
                            videoId: 'x123'
                        },angularElementMock);
                    });

                    describe('method', function(){
                        it('toString',function(){
                            expect(player.toString()).toEqual('VimeoPlayer#player1');
                        });

                        it('getPlayerId',function(){
                            expect(player.getPlayerId()).toEqual('player1');
                        });

                        it('getIframe', function(){
                            expect(player.getIframe()).toEqual(angularElementMock);
                        });

                        it('getUrl', function(){
                            expect(player.getUrl()).toEqual('http://player.vimeo.com/x123');
                        });

                        it('setSize', function(){
                            player.setSize(200,200);
                            expect(angularElementMock.css)
                                .toHaveBeenCalledWith({ width: 200, height: 200});

                        });

                        it('post', function(){
                            player.post('addEventListener','pause');
                            expect(angularElementMock[0].contentWindow.postMessage)
                                .toHaveBeenCalledWith(
                                    '{"method":"addEventListener","value":"pause"}',
                                    'http://player.vimeo.com/x123'
                                );
                        });

                        it('on', function(){
                            player.on('finish',function(){ });
                            expect(angularElementMock[0].contentWindow.postMessage)
                                .toHaveBeenCalledWith(
                                    '{"method":"addEventListener","value":"finish"}',
                                    'http://player.vimeo.com/x123'
                                );
                        });

                        it('play', function(){
                            player.play();
                            expect(angularElementMock[0].contentWindow.postMessage)
                                .toHaveBeenCalledWith(
                                    '{"method":"play"}',
                                    'http://player.vimeo.com/x123'
                                );
                        });

                        it('pause', function(){
                            player.pause();
                            expect(angularElementMock[0].contentWindow.postMessage)
                                .toHaveBeenCalledWith(
                                    '{"method":"pause"}',
                                    'http://player.vimeo.com/x123'
                                );
                        });

                        it('destroy', function(){
                            player.destroy();
                            expect(angularElementMock.remove).toHaveBeenCalled();
                            expect($window.removeEventListener.calls[0].args[0]).toEqual('message');
                        });
                    });

                    describe('event', function(){
                        var readySpy;
                        beforeEach(function(){
                            readySpy = jasmine.createSpy('readySpy');
                            player.on('ready',readySpy);
                        });

                        it('filters on origin',function(){
                            msgListener({
                                origin : 'https://www.youtube.com',
                                data : '{ "event" : "ready", "player_id" : "player1" }'
                            });
                            expect(readySpy).not.toHaveBeenCalled();
                        });
                        it('filters on player',function(){
                            msgListener({
                                origin : 'http://player.vimeo.com',
                                data : '{ "event" : "ready"}'
                            });
                            expect(readySpy).not.toHaveBeenCalled();
                        });
                        it('ready', function(){
                            msgListener({
                                origin : 'http://player.vimeo.com',
                                data : '{ "event" : "ready", "player_id" : "player1" }'
                            });
                            expect(readySpy).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
