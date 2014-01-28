(function() {
    'use strict';

    define(['services'], function() {
        describe('ModuleService', function() {
            var ModuleService;

            beforeEach(function() {
                module('c6.rumble');

                inject(function($injector) {
                    ModuleService = $injector.get('ModuleService');
                });
            });

            it('should exist', function() {
                expect(ModuleService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('hasModule(modules, module)', function() {
                        it('should return true if the module is in the provided list', function() {
                            expect(ModuleService.hasModule(['test', 'foo', 'okay'], 'foo')).toBe(true);
                            expect(ModuleService.hasModule(['hey', 'how', 'are', 'you'], 'are')).toBe(true);
                        });

                        it('should return false if the module is not in the provided list', function() {
                            expect(ModuleService.hasModule(['josh', 'evan'], 'howard')).toBe(false);
                            expect(ModuleService.hasModule(['moo'], 'steph')).toBe(false);
                            expect(ModuleService.hasModule(undefined, 'test')).toBe(false);
                        });
                    });
                });
            });
        });
    });
}());
