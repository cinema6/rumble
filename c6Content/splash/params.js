(function(window) {
    'use strict';

    var params = {},
        search = window.location.search.replace(/^\?/, ''),
        keyValuePairs = search ? search.split('&') : [];

    keyValuePairs.forEach(function(kvPair) {
        var kvArray = kvPair.split('=');

        params[kvArray[0]] = decodeURIComponent(kvArray[1]);
    });

    window.params = params;
}(window));
