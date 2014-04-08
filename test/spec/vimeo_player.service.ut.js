(function() {
    'use strict';

    define(['players'], function() {
        describe('VimeoPlayerService', function() {
            var VimeoPlayerService,
                $q,
                $rootScope;

            var iframe;

            function Window() {}
            Window.prototype = {
                postMessage: jasmine.createSpy('window.postMessage()')
            };

            function IFrame() {
                this.contentWindow = new Window();

                iframe = this;
            }

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $q = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');

                    VimeoPlayerService = $injector.get('VimeoPlayerService');
                });
            });

            it('should exist', function() {
                expect(VimeoPlayerService).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('Player(id, $iframe)', function() {
                    it('should add itself to the players hash', function() {
                        var vimeo = new VimeoPlayerService.Player('rc-1', {});

                        expect(VimeoPlayerService.players['rc-1']).toBe(vimeo);
                    });

                    describe('methods', function() {
                        var vimeo;

                        beforeEach(function() {
                            vimeo = new VimeoPlayerService.Player('rc-1', new IFrame());
                        });

                        describe('call(method, data)', function() {
                            describe('without data', function() {
                                it('should send a message to the iframe', function() {
                                    vimeo.call('play');
                                    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(JSON.stringify({
                                        method: 'play'
                                    }), '*');

                                    vimeo.call('pause');
                                    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(JSON.stringify({
                                        method: 'pause'
                                    }), '*');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
