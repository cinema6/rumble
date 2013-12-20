(function(){
    'use strict';
    
    define(['iframe'], function() {
        var iframe;
                
        describe('iframe', function() {
            beforeEach(function(){
                module('c6.rumble');
                
                inject(['iframe',function(_iframe) {
                    iframe = _iframe;
                }]);
                
            });

            describe('formatIframe',function(){
                it('should work with no attrs',function(){
                    expect(iframe.formatIframe('player1','http://test'))
                        .toEqual('<iframe id="player1" src="http://test"></iframe>');
                });
                
                it('should work with attrs with vals',function(){
                    expect(iframe.formatIframe('player1','http://test', {
                        width: 100, height: 100
                    })).toEqual('<iframe id="player1" src="http://test" width="100" height="100"></iframe>');
                });
                
                it('should work with attrs with no vals',function(){
                    expect(iframe.formatIframe('player1','http://test', {
                        webKitAllowFullscreen: true
                    })).toEqual('<iframe id="player1" src="http://test" webkitallowfullscreen></iframe>');
                });

                it('should work with mixxed attrs', function(){
                    expect(iframe.formatIframe('player1','http://test', {
                        Width: 100, heiGht: 100, webKitAllowFullscreen: true
                    })).toEqual('<iframe id="player1" src="http://test" width="100" height="100" webkitallowfullscreen></iframe>');
                });
            });

            describe('create', function(){
                beforeEach(function(){
                    angular._element = angular.element;
                });

                afterEach(function(){
                    angular.element = angular._element;
                    delete angular._element;
                });

                it('should create an iframe element', function(){
                    var mockElt = { tagName : 'iframe' };
                    spyOn(angular, 'element').andCallFake(function(html) {
                        return mockElt;
                    });
                    
                    expect(iframe.create('player1','http://test')).toBe(mockElt);
                    expect(angular.element).toHaveBeenCalledWith('<iframe id="player1" src="http://test"></iframe>');
                });
            });
        });
    });
}());
