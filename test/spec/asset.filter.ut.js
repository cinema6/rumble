define(['app'], function(appModule) {
    'use strict';

    describe('asset filter', function() {
        var asset,
            c6UrlMaker;

        var c6AppData;

        beforeEach(function() {
            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: null
                });
            });

            inject(function($injector) {
                asset = $injector.get('assetFilter');
                c6UrlMaker = $injector.get('c6UrlMaker');

                c6AppData = $injector.get('c6AppData');
            });
        });

        it('should exist', function() {
            expect(asset).toEqual(jasmine.any(Function));
        });

        describe('if a falsy url is passed in', function() {
            it('should return null', function() {
                expect(asset(undefined, 'assets')).toBeNull();
            });
        });

        describe('if there is no mode', function() {
            beforeEach(function() {
                c6AppData.mode = null;
            });

            it('should be null', function() {
                expect(asset('directives/test.html', 'assets')).toBeNull();
                expect(asset('minireel.css', 'styles')).toBeNull();
            });
        });

        describe('if there is a mode', function() {
            beforeEach(function() {
                c6AppData.mode = 'full';
            });

            it('should load assets for the configured mode', function() {
                expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/full/directives/test.html'));
                expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/full/minireel.css'));

                c6AppData.mode = 'light';
                expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/light/directives/test.html'));
                expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/light/minireel.css'));

                c6AppData.mode = 'foo';
                expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/foo/directives/test.html'));
                expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/foo/minireel.css'));
            });
        });
    });
});
