(function() {
    'use strict';

    module.exports = {
        html: {
            pattern: 'assets',
            replacement: '<%= _version %>',
            path: [
                '.tmp/templates.js',
                '<%= settings.distDir %>/index.html'
            ]
        }
    };
}());
