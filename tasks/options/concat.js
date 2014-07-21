module.exports = {
    dist: {
        options: {
            banner: [
                "define( ['angular'],",
                "function( angular ) {",
                "    'use strict';",
                "    var myModule = angular.module('<%= settings.appModule %>.cache', []);"
            ].join('\n'),
            footer: [
                "    return myModule;",
                "});"
            ].join('\n')
        },
        src: ['.tmp/config/*.js'],
        dest: '.tmp/cache.js'
    }
};
