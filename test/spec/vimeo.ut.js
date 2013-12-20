(function(){
    'use strict';
    
    define(['vimeo'], function() {
        var $log, $window, $document, vimeo;
                
        describe('vimeo', function() {
            beforeEach(function(){
                module('c6.rumble');
                
                inject(['$log','$window','$document',function(_$log,_$window,_$document) {
                    $window      = _$window;
                    $document    = _$document;
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
                var angularElementMock;

                beforeEach(function(){
                    angular._element = angular.element;
                    angularElementMock = {
                        css         : jasmine.createSpy('elt.css'),
                        replaceWith : jasmine.createSpy('elt.replaceWith'),
                        remove      : jasmine.createSpy('elt.remove')
                    };
                    
                    spyOn(angular,'element').andCallFake(function(elt){
                            return angularElementMock; 
                    });
                });

                afterEach(function(){
                    angular.element = angular._element;
                    delete angular._element;
                });

                describe('should fail', function(){

                    it('when it cannot find element with id', function(){
                        spyOn($document[0], 'getElementById').andCallFake(function(id) {
                            return null;
                        });
                        
                        expect(function(){
                            vimeo.createPlayer('badId',{
                                width: 100,
                                height: 100,
                                videoId: 'xyz'
                            });
                        }).toThrow('Invalid tag id: badId');
                    });

                });

                describe('should succeed',function(){
                    it('when it can find the old element', function(){
                        var result;
                        spyOn($document[0], 'getElementById').andCallFake(function(id) {
                            return 'oldElt';
                        });

                        spyOn(vimeo, 'formatPlayerSrc')
                            .andCallFake(function(videoId,playerId,params){
                                return 'http://player.vimeo.com/x123?api=1&player_id=player1';
                            });

                        result = vimeo.createPlayer('player1',{
                            width: 100,
                            height: 100,
                            videoId: 'x123'
                        });

                        expect(vimeo.formatPlayerSrc)
                            .toHaveBeenCalledWith('x123','player1',undefined);
                        expect(angular.element.calls[0].args[0]).toEqual('<iframe id="player1" src="http://player.vimeo.com/x123?api=1&player_id=player1" width="100" height="100"></iframe>');
                        expect(angular.element.calls[1].args[0]).toEqual(angularElementMock);
                    });
                });

                describe('returns a VimeoPlayer that',function(){
                    var player;
                    beforeEach(function(){
                        spyOn($document[0], 'getElementById').andCallFake(function(id) {
                            return 'oldElt';
                        });

                        player = vimeo.createPlayer('player1',{
                            width: 100,
                            height: 100,
                            videoId: 'x123'
                        });
                    });

                    it('has a getPlayerId method',function(){
                        expect(player.getPlayerId()).toEqual('player1');
                    });

                    it('has a getIframe method', function(){
                        expect(player.getIframe()).toEqual(angularElementMock);
                    });

                    it('has a setSize method', function(){
                        player.setSize(200,200);
                        expect(angularElementMock.css)
                            .toHaveBeenCalledWith({ width: 200, height: 200});

                    });

                    it('has a destroy method', function(){
                        player.destroy();
                        expect(angular.element.calls[2].args[0]).toEqual('oldElt');
                       
                        expect(angularElementMock.replaceWith).toHaveBeenCalled();
                        expect(angularElementMock.remove).toHaveBeenCalled();
                    });

                });
            });
        });
    });
}());
