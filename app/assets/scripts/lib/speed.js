define(function() {
    'use strict';

    function sum(numbers) {
        return numbers.reduce(function(sum, number) {
            return sum + number;
        });
    }

    function pluck(prop, objects) {
        return objects.map(function(object) {
            return object[prop];
        });
    }

    function rounded(number, places) {
        var multiplier = Math.pow(10, places);

        return Math.round(number * multiplier) / multiplier;
    }

    function TestResult(elapsed, size) {
        var seconds = elapsed / 1000;

        this.time = elapsed;
        this.size = size;

        this.KBs = rounded(size / seconds, 2);
    }

    function SpeedPlugin() {
        this.results = [];
    }
    SpeedPlugin.prototype = {
        load: function(name, require, onload, config) {
            var results = this.results,
                start = Date.now();

            require([name], function(value) {
                var end = Date.now();

                results.push(new TestResult(end - start, config.config.speed[name]));
                onload(value);
            });
        },

        average: function() {
            if (this.results.length < 1) {
                return null;
            }

            return new TestResult(
                sum(pluck('time', this.results)),
                sum(pluck('size', this.results))
            );
        }
    };

    return new SpeedPlugin();
});
