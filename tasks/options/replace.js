module.exports = {
    dist: {
        src: ['<%= settings.distDir %>/<%= buildMode %>.html'],
        dest: '<%= settings.distDir %>/<%= buildMode %>.html',
        replacements: [
            {
                from: /<base href="?(.+?)"?\/?>/,
                to: function(match, index, text, matches) {
                    'use strict';

                    var grunt = require('grunt');

                    return match.replace(matches[0], grunt.config('_version') + '/' + grunt.config('buildMode') + '/');
                }
            }
        ]
    }
};
