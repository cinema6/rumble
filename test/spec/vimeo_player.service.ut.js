(function() {
    'use strict';

    define(['players'], function() {
        /* global angular:true */

        describe('VimeoPlayerService', function() {
            var VimeoPlayerService,
                $q,
                $rootScope;

            var $window;

            var iframe;

            function Window() {
                this._handlers = {};
            }
            Window.prototype = {
                postMessage: jasmine.createSpy('window.postMessage()')
            };

            function IFrame() {
                this.contentWindow = new Window();

                iframe = this;
            }

            beforeEach(function() {
                module('ng', function($provide) {
                    $provide.value('$window', {
                        _handlers: {},
                        addEventListener: function(event, handler) {
                            var handlers = this._handlers[event] = this._handlers[event] || [];

                            handlers.push(handler);
                        },
                        trigger: function(event, data) {
                            var handlers = this._handlers[event] || [];

                            handlers.forEach(function(handler) {
                                handler(data);
                            });
                        }
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $q = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');

                    $window = $injector.get('$window');

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
                            vimeo = new VimeoPlayerService.Player('rc-1', angular.element(new IFrame()));
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

                            describe('with data', function() {
                                it('should send a message to the iframe', function() {
                                    vimeo.call('seekTo', 30);
                                    expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(JSON.stringify({
                                        method: 'seekTo',
                                        value: 30
                                    }), '*');
                                });
                            });

                            describe('methods that don\'t return a value', function() {
                                it('should return a promise that resolves to undefined', function() {
                                    var play = jasmine.createSpy('play'),
                                        pause = jasmine.createSpy('pause'),
                                        seekTo = jasmine.createSpy('seekTo'),
                                        unload = jasmine.createSpy('unload'),
                                        setColor = jasmine.createSpy('setColor'),
                                        setLoop = jasmine.createSpy('setLoop'),
                                        setVolume = jasmine.createSpy('setVolume');

                                    $rootScope.$apply(function() {
                                        vimeo.call('play').then(play);
                                        vimeo.call('pause').then(pause);
                                        vimeo.call('seekTo').then(seekTo);
                                        vimeo.call('unload').then(unload);
                                        vimeo.call('setColor').then(setColor);
                                        vimeo.call('setLoop').then(setLoop);
                                        vimeo.call('setVolume').then(setVolume);
                                    });

                                    expect(play).toHaveBeenCalledWith(undefined);
                                    expect(pause).toHaveBeenCalledWith(undefined);
                                    expect(seekTo).toHaveBeenCalledWith(undefined);
                                    expect(unload).toHaveBeenCalledWith(undefined);
                                    expect(setColor).toHaveBeenCalledWith(undefined);
                                    expect(setLoop).toHaveBeenCalledWith(undefined);
                                    expect(setVolume).toHaveBeenCalledWith(undefined);
                                });
                            });

                            describe('methods that return a value', function() {
                                it('should return a promise that resolves to the value of the response', function() {
                                    var paused = jasmine.createSpy('paused'),
                                        getCurrentTime = jasmine.createSpy('getCurrentTime'),
                                        getDuration = jasmine.createSpy('getDuration'),
                                        getVideoEmbedCode = jasmine.createSpy('getVideoEmbedCode'),
                                        getVideoHeight = jasmine.createSpy('getVideoHeight'),
                                        getVideoWidth = jasmine.createSpy('getVideoWidth'),
                                        getVideoUrl = jasmine.createSpy('getVideoUrl'),
                                        getColor = jasmine.createSpy('getColor'),
                                        getVolume = jasmine.createSpy('getVolume');

                                    function postMessage(method, value, id) {
                                        $window.trigger('message', {
                                            data: {
                                                player_id: id || 'rc-1',
                                                method: method,
                                                value: value
                                            }
                                        });
                                    }

                                    $rootScope.$apply(function() {
                                        vimeo.call('paused').then(paused);
                                        vimeo.call('getCurrentTime').then(getCurrentTime);
                                        vimeo.call('getDuration').then(getDuration);
                                        vimeo.call('getVideoEmbedCode').then(getVideoEmbedCode);
                                        vimeo.call('getVideoHeight').then(getVideoHeight);
                                        vimeo.call('getVideoWidth').then(getVideoWidth);
                                        vimeo.call('getVideoUrl').then(getVideoUrl);
                                        vimeo.call('getColor').then(getColor);
                                        vimeo.call('getVolume').then(getVolume);
                                    });

                                    postMessage('paused', false, '48yfh9');
                                    expect(paused).not.toHaveBeenCalled();

                                    postMessage('paused', false);
                                    expect(paused).toHaveBeenCalledWith(false);

                                    postMessage('getCurrentTime', 12.2, '489rhf439');
                                    expect(getCurrentTime).not.toHaveBeenCalled();

                                    postMessage('getCurrentTime', 10);
                                    expect(getCurrentTime).toHaveBeenCalledWith(10);

                                    postMessage('getDuration', 60);
                                    expect(getDuration).toHaveBeenCalledWith(60);

                                    postMessage('getVideoEmbedCode', 'f7438fh4');
                                    expect(getVideoEmbedCode).toHaveBeenCalledWith('f7438fh4');

                                    postMessage('getVideoHeight', 400, '4938h4');
                                    expect(getVideoHeight).not.toHaveBeenCalled();

                                    postMessage('getVideoHeight', 400);
                                    expect(getVideoHeight).toHaveBeenCalledWith(400);

                                    postMessage('getVideoWidth', 800);
                                    expect(getVideoWidth).toHaveBeenCalledWith(800);

                                    postMessage('getVideoUrl', 'http://foo.com/');
                                    expect(getVideoUrl).toHaveBeenCalledWith('http://foo.com/');

                                    postMessage('getColor', 'red');
                                    expect(getColor).toHaveBeenCalledWith('red');

                                    postMessage('getVolume', 0.75, 'rc-2');
                                    expect(getVolume).not.toHaveBeenCalled();

                                    postMessage('getVolume', 0);
                                    expect(getVolume).toHaveBeenCalledWith(0);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
