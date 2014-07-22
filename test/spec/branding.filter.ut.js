define(['app'], function(appModule) {
    'use strict';

    describe('branding filter', function() {
        var branding,
            c6UrlMaker;

        var c6AppData;

        beforeEach(function() {
            module(appModule.name, function($provide) {
                $provide.value('c6AppData', {
                    mode: null
                });
            });

            inject(function($injector) {
                branding = $injector.get('brandingFilter');
                c6UrlMaker = $injector.get('c6UrlMaker');

                c6AppData = $injector.get('c6AppData');
            });
        });

        it('should exist', function() {
            expect(branding).toEqual(jasmine.any(Function));
        });

        describe('if a falsy url is passed in', function() {
            it('should return null', function() {
                expect(branding(undefined, 'assets')).toBeNull();
            });
        });

        describe('if there is no mode', function() {
            beforeEach(function() {
                c6AppData.mode = null;
                c6AppData.experience = {
                    data: {
                        branding: 'urbantimes'
                    }
                };
            });

            it('should be null', function() {
                expect(branding('directives/test.html', 'assets')).toBeNull();
                expect(branding('minireel.css', 'styles')).toBeNull();
            });
        });

        describe('if there is no experience branding', function() {
            beforeEach(function() {
                c6AppData.mode = 'light';
            });

            it('should be null', function() {
                expect(branding('foo.jpg')).toBeNull();
                expect(branding('hello/foo.css')).toBeNull();
            });
        });

        describe('if there is a mode and branding', function() {
            beforeEach(function() {
                c6AppData.mode = 'full';
                c6AppData.experience = {
                    data: {
                        branding: 'elitedaily'
                    }
                };
            });

            it('should load assets for the configured mode', function() {
                expect(branding('directives/test.html', 'assets')).toBe(c6UrlMaker('branding/elitedaily/assets/full/directives/test.html', 'collateral'));
                expect(branding('minireel.css', 'styles')).toBe(c6UrlMaker('branding/elitedaily/styles/full/minireel.css', 'collateral'));

                c6AppData.mode = 'light';
                c6AppData.experience.data.branding = 'urbantimes';
                expect(branding('directives/test.html', 'assets')).toBe(c6UrlMaker('branding/urbantimes/assets/light/directives/test.html', 'collateral'));
                expect(branding('minireel.css', 'styles')).toBe(c6UrlMaker('branding/urbantimes/styles/light/minireel.css', 'collateral'));

                c6AppData.mode = 'foo';
                c6AppData.experience.data.branding = 'upworthy';
                expect(branding('directives/test.html', 'assets')).toBe(c6UrlMaker('branding/upworthy/assets/foo/directives/test.html', 'collateral'));
                expect(branding('minireel.css', 'styles')).toBe(c6UrlMaker('branding/upworthy/styles/foo/minireel.css', 'collateral'));
            });
        });
    });
});
