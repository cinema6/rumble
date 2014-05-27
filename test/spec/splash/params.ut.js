(function() {
    'use strict';
    /* global waitsFor:true, runs: true */

    define(['jquery'], function($) {
        describe('params.js', function() {
            var $frame;

            beforeEach(function() {
                $frame = $('<iframe src="about:blank"></iframe>');

                $('body').append($frame);
            });

            describe('when there are no params', function() {
                beforeEach(function() {
                    var loaded = false;

                    runs(function() {
                        $frame.prop('src', '/base/test/spec/splash/params.html')
                            .on('load', function() {
                                loaded = true;
                            });
                    });

                    waitsFor(function() {
                        return loaded;
                    });
                });

                it('should set window.params as an empty object', function() {
                    runs(function() {
                        expect($frame.prop('contentWindow').params).toEqual({});
                    });
                });
            });

            describe('when there are params', function() {
                beforeEach(function() {
                    var loaded = false;

                    runs(function() {
                        $frame.prop('src', '/base/test/spec/splash/params.html?title=This%20is%20a%20Test&splash=%2Fcollateral%2Fe-123%2Fsplash.jpg')
                            .on('load', function() {
                                loaded = true;
                            });
                    });

                    waitsFor(function() {
                        return loaded;
                    });
                });

                it('should set params as an object with the key-value pairs', function() {
                    runs(function() {
                        var params = $frame.prop('contentWindow').params;

                        expect(params).toEqual({
                            title: 'This is a Test',
                            splash: '/collateral/e-123/splash.jpg'
                        });
                    });
                });
            });

            afterEach(function() {
                $frame.remove();
            });
        });
    });
}());
