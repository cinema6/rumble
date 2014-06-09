(function() {
    'use strict';

    module.exports = {
        splash: {
            options: {
                transform: function(orig) {
                    return 'module.exports = ' + orig + ';';
                }
            },
            expand: true,
            cwd: '.tmp/collateral/',
            src: ['**/*.html'],
            dest: '.tmp/collateral/',
            ext: '.js',
            extDot: 'last'
        }
    };
}());
