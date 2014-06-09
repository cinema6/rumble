describe('splash.js', function() {
    'use strict';

    var splashJS,
        c6, settings,
        splash, loader, start;

    beforeEach(function() {
        splash = document.createElement('div');
        splash.innerHTML = [
            '<div class="c6js-loader">',
                'loader',
            '</div>',
            '<button class="c6js-start">',
                'Start',
            '</button>'
        ].join('\n');
        loader = splash.querySelectorAll('.c6js-loader')[0];
        start = splash.querySelectorAll('.c6js-start')[0];

        c6 = {
            loadExperience: jasmine.createSpy('c6.loadExperience(settings)')
        };

        settings = {
            load: false,
            config: {}
        };

        splashJS = require('../../../c6Content/splash/splash.js');
    });

    it('should exist', function() {
        expect(splashJS).toEqual(jasmine.any(Function));
    });

    describe('when run', function() {
        var delegate;

        beforeEach(function() {
            delegate = splashJS(c6, settings, splash);
        });

        describe('when the start is clicked', function() {
            beforeEach(function() {
                var event = document.createEvent('MouseEvents');

                event.initMouseEvent('click');

                loader.style.display = 'none';

                start.dispatchEvent(event);
            });

            it('should show the loader', function() {
                expect(loader.style.display).toBe('');
            });

            it('should load the experience', function() {
                expect(c6.loadExperience).toHaveBeenCalledWith(settings);
            });

            describe('if there is no loader', function() {
                beforeEach(function() {
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click');

                    splash.removeChild(loader);

                    delegate = splashJS(c6, settings, splash);


                    start.dispatchEvent(event);
                });

                it('should still work', function() {
                    expect(c6.loadExperience).toHaveBeenCalledWith(settings);
                });
            });
        });

        describe('the delegate', function() {
            it('should exist', function() {
                expect(delegate).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('didHide()', function() {
                    beforeEach(function() {
                        delegate.didHide();
                    });

                    it('should hide the loader', function() {
                        expect(loader.style.display).toBe('none');
                    });

                    describe('if there is no loader', function() {
                        beforeEach(function() {
                            splash.removeChild(loader);

                            delegate = splashJS(c6, settings, splash);

                        });

                        it('should not throw errors', function() {
                            expect(function() {
                                delegate.didHide();
                            }).not.toThrow();
                        });
                    });
                });
            });
        });
    });
});
