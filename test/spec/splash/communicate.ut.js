(function() {
    'use strict';
    /* global runs:true, waitsFor:true */

    define(['jquery'], function($) {
        var postMessage = window.postMessage;

        describe('communicate.js', function() {
            var loaded,
                $frame,
                frameWindow,
                $start, $loader;

            beforeEach(function() {
                runs(function() {
                    loaded = false;

                    spyOn(window, 'postMessage');

                    $frame = $('<iframe src="/base/test/spec/splash/communicate.html"></iframe>')
                        .appendTo('body')
                        .on('load', function() {
                            frameWindow = $frame.prop('contentWindow');

                            $start = $frame.contents().find('#start');
                            $loader = $frame.contents().find('#loader');

                            loaded = true;
                        });
                });

                waitsFor(function() {
                    return loaded;
                });
            });

            it('should parse and compile the DOM with TwoBits.js', function() {
                runs(function() {
                    var tb = frameWindow.tb,
                        compile = frameWindow._tbCompile;

                    expect(tb.parse).toHaveBeenCalledWith(frameWindow.document.documentElement);
                    expect(compile).toHaveBeenCalledWith(frameWindow.params);
                });
            });

            describe('when the start is clicked', function() {
                function click(element) {
                    var event = frameWindow.document.createEvent('MouseEvent');

                    event.initMouseEvent('click', true, true, window);
                    element.dispatchEvent(event);
                }

                beforeEach(function() {
                    click($start[0]);
                });

                it('should show the loader', function() {
                    expect($loader.css('display')).toBe('block');
                });

                it('should send a message to the parent', function() {
                    expect(window.postMessage).toHaveBeenCalledWith(JSON.stringify({ event: 'click', exp: frameWindow.params.exp }), '*');
                });
            });

            describe('messages from the parent', function() {
                function postMessage(message) {
                    var event = frameWindow.document.createEvent('CustomEvent');

                    event.initCustomEvent('message', true, true, window);
                    event.data = message;

                    frameWindow.dispatchEvent(event);
                }

                beforeEach(function() {
                    $loader.css('display', '');
                });

                describe('when the splash page is hidden', function() {
                    beforeEach(function() {
                        postMessage('hide');
                    });

                    it('should hide the loader', function() {
                        expect($loader.css('display')).toBe('none');
                    });
                });

                describe('when the splash page is shown', function() {
                    beforeEach(function() {
                        postMessage('show');
                    });

                    it('should not hide the loader', function() {
                        expect($loader.css('display')).toBe('block');
                    });
                });
            });

            afterEach(function() {
                runs(function() {
                    $frame.remove();
                    window.postMessage = postMessage;
                });
            });
        });
    });
}());
