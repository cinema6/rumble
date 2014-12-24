define(function() {
    'use strict';

    var mockRequire = jasmine.createSpy('require()').and.callFake(function(modules, callback) {
        mockRequire.pendingCalls.push({
            modules: modules,
            callback: callback
        });
    });
    mockRequire.cache = {};
    mockRequire.pendingCalls = [];

    mockRequire.whenLoad = function(module) {
        return {
            provide: function(value) {
                mockRequire.cache[module] = value;
            }
        };
    };

    mockRequire.flush = function() {
        var call;

        function resolveModule(module) {
            var value = mockRequire.cache[module];

            if (!value) {
                throw new Error('Unexpected module load: ' + module + '.');
            }

            return value;
        }

        while ((call = mockRequire.pendingCalls.shift())) {
            call.callback.apply(null, call.modules.map(resolveModule));
        }
    };

    return mockRequire;
});
