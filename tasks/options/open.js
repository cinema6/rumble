(function() {
    'use strict';

    module.exports = {
        server: {
            url: 'http://localhost:<%= settings.sandboxPort %>/embed.html',
            app: '<%= settings.openBrowser %>'
        }
    };
})();
