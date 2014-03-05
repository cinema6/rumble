(function() {
    'use strict';

    define(['app'], function() {
        describe('asset filter', function() {
            var asset,
                c6UrlMaker;

            var c6AppData;

            beforeEach(function() {
                module('c6.rumble', function($provide) {
                    $provide.value('c6AppData', {});
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

            describe('if there is no device profile', function() {
                it('should return null', function() {
                    expect(asset('directives/foo.html', 'styles')).toBeNull();
                });
            });

            describe('if the device is a phone', function() {
                beforeEach(function() {
                    c6AppData.profile = {
                        device: 'phone'
                    };
                    c6AppData.experience = {
                        data: {
                            mode: 'light'
                        }
                    };
                });

                it('should resolve to mobile assets', function() {
                    expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/mobile/directives/test.html'));
                    expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/mobile/minireel.css'));
                });
            });

            describe('if there is no mode configured', function() {
                beforeEach(function() {
                    c6AppData.profile = {
                        device: 'desktop'
                    };

                    c6AppData.experience = {
                        data: {}
                    };
                });

                it('should be full', function() {
                    expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/full/directives/test.html'));
                    expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/full/minireel.css'));
                });
            });

            describe('if there is a mode configured', function() {
                beforeEach(function() {
                    c6AppData.profile = {
                        device: 'desktop'
                    };

                    c6AppData.experience = {
                        data: {
                            mode: 'full'
                        }
                    };
                });

                it('should load assets for the configured mode', function() {
                    expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/full/directives/test.html'));
                    expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/full/minireel.css'));

                    c6AppData.experience.data.mode = 'light';
                    expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/light/directives/test.html'));
                    expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/light/minireel.css'));

                    c6AppData.experience.data.mode = 'foo';
                    expect(asset('directives/test.html', 'assets')).toBe(c6UrlMaker('assets/foo/directives/test.html'));
                    expect(asset('minireel.css', 'styles')).toBe(c6UrlMaker('styles/foo/minireel.css'));
                });
            });
        });
    });
}());
