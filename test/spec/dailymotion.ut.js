define(['cards/dailymotion','angular'], function(dailymotionCard, angular) {
    'use strict';

    var $log, $window, $q, $rootScope, dailymotion;
            
    describe('dailymotion', function() {
        beforeEach(function(){
            module(dailymotionCard.name);
            
            inject(['$log','$window','$q','$rootScope',
                function(_$log,_$window,_$q,_$rootScope) {
                $window      = _$window;
                $q           = _$q;
                $rootScope   = _$rootScope;
                $log         = _$log;
                $log.context = function() { return $log; };
            }]);
            
            inject(['dailymotion',function(_dailymotion) {
                dailymotion = _dailymotion;
            }]);
        });

        describe('parseEventData',function(){
            it('should parse a query string',function(){
                var data = dailymotion.parseEventData('event=apiready&id=dm-abc123');
                expect(data.event).toEqual('apiready');
                expect(data.id).toEqual('dm-abc123');
            });

            it('should return undefined for an empty qstring',function(){
                expect(dailymotion.parseEventData('')).not.toBeDefined();
            });
            
            it('should return undefined for an undefined parameter',function(){
                expect(dailymotion.parseEventData()).not.toBeDefined();
            });
        });
        
        describe('createPlayer', function(){
            var angularElementMock, msgListener ;
            
            beforeEach(function(){
                angular._element = angular.element;
                angularElementMock = [ {
                    contentWindow : {
                        postMessage : jasmine.createSpy('elt.contentWindow.postMessage')
                    }
                }];
                
                angularElementMock.append      = jasmine.createSpy('elt.append');
                angularElementMock.prepend      = jasmine.createSpy('elt.prepend');
                angularElementMock.css         = jasmine.createSpy('elt.css');
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
                        dailymotion.createPlayer('player1',{
                            width: 100,
                            height: 100,
                            videoId: 'xyz'
                        });
                    }).toThrow('Parent element is required for dailymotion.createPlayer');
                });

            });
            
            describe('should succeed',function(){
                it('when it can find the old element', function(){
                    var result;

                    spyOn(dailymotion, 'formatPlayerSrc')
                        .andCallFake(function(videoId,playerId,params){
                            return 'http://www.dailymotion.com/embed/video/x123?api=postMessage&id=player1';
                        });

                    result = dailymotion.createPlayer('player1',{
                        width: 100,
                        height: 100,
                        videoId: 'x123'
                    },angularElementMock);

                    expect(dailymotion.formatPlayerSrc)
                        .toHaveBeenCalledWith('x123','player1',undefined);
                    expect(angular.element.calls[0].args[0]).toEqual('<iframe id="player1" src="http://www.dailymotion.com/embed/video/x123?api=postMessage&id=player1" width="100" height="100"></iframe>');
                    expect(angular.element.calls[1].args[0]).toEqual(angularElementMock);

                    expect(angularElementMock.prepend)
                        .toHaveBeenCalledWith(angularElementMock);
                    expect($window.addEventListener.calls[0].args[0]).toEqual('message');
                });
            });
            describe('returns a DailyMotion with',function(){
                var player;
                beforeEach(function(){
                
                    spyOn(angularElementMock,'attr').andCallFake(function(name){
                        return (name === 'src') ? 
                            'http://www.dailymotion.com/embed/video/x123?api=postMessage&id=player1' : '';
                    });

                    player = dailymotion.createPlayer('player1',{
                        width: 100,
                        height: 100,
                        videoId: 'x123'
                    },angularElementMock);
                });
                
                describe('method', function(){
                    it('toString',function(){
                        expect(player.toString()).toEqual('DailymotionPlayer#player1');
                    });

                    it('getPlayerId',function(){
                        expect(player.getPlayerId()).toEqual('player1');
                    });

                    it('getIframe', function(){
                        expect(player.getIframe()).toEqual(angularElementMock);
                    });

                    it('getUrl', function(){
                        expect(player.getUrl()).toEqual('http://www.dailymotion.com/embed/video/x123');
                    });
                    

                    it('setSize', function(){
                        player.setSize(200,200);
                        expect(angularElementMock.css)
                            .toHaveBeenCalledWith({ width: 200, height: 200});

                    });

                    it('post', function(){
                        player.post('pause');
                        expect(angularElementMock[0].contentWindow.postMessage)
                            .toHaveBeenCalledWith(
                                'pause',
                                'http://www.dailymotion.com/embed/video/x123'
                            );
                    });

                    it('on', function(){
                        player.on('finish',function(){ });
                        expect(angularElementMock[0].contentWindow.postMessage)
                            .not.toHaveBeenCalled();
                    });

                    it('play', function(){
                        player.play();
                        expect(angularElementMock[0].contentWindow.postMessage)
                            .toHaveBeenCalledWith(
                                'play',
                                'http://www.dailymotion.com/embed/video/x123'
                            );
                    });

                    it('pause', function(){
                        player.pause();
                        expect(angularElementMock[0].contentWindow.postMessage)
                            .toHaveBeenCalledWith(
                                'pause',
                                'http://www.dailymotion.com/embed/video/x123'
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
                            data : 'event=apiready&id=player1'
                        });
                        expect(readySpy).not.toHaveBeenCalled();
                    });
                    it('filters on player',function(){
                        msgListener({
                            origin : 'http://www.dailymotion.com',
                            data : 'event=apiready'
                        });
                        expect(readySpy).not.toHaveBeenCalled();
                    });
                    it('ready', function(){
                        msgListener({
                            origin : 'http://www.dailymotion.com',
                            data : 'event=apiready&id=player1'
                        });
                        expect(readySpy).toHaveBeenCalled();
                    });

                    it('pause', function(){
                        var pauseSpy = jasmine.createSpy('pause');
                        player.on('pause',pauseSpy);
                        msgListener({
                            origin : 'http://www.dailymotion.com',
                            data : 'event=pause&id=player1'
                        });
                        expect(pauseSpy).toHaveBeenCalled();
                    });
                    
                    it('timeupdate', function(){
                        var timeupdateSpy = jasmine.createSpy('timeupdate');
                        player.on('timeupdate',timeupdateSpy);
                        msgListener({
                            origin : 'http://www.dailymotion.com',
                            data : 'event=timeupdate&id=player1&time=3.264'
                        });
                        expect(timeupdateSpy).toHaveBeenCalled();
                    });

                    it('durationchange', function(){
                        var durationchangeSpy = jasmine.createSpy('durationchange');
                        player.on('durationchange',durationchangeSpy);
                        msgListener({
                            origin : 'http://www.dailymotion.com',
                            data : 'event=durationchange&id=player1&duration=9.264'
                        });
                        expect(durationchangeSpy).toHaveBeenCalled();
                    });
                }); 
            });
        });
    });
});
