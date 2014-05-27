(function(window) {
    'use strict';

    var start = document.getElementById('start'),
        loader = document.getElementById('loader'),
        params = window.params,
        tb = window.tb;

    start.addEventListener('click', function() {
        loader.style.display = '';

        window.parent.postMessage(JSON.stringify({
            event: 'click',
            exp: params.exp
        }), '*');
    }, false);

    window.addEventListener('message', function(event) {
        var message = event.data;

        switch (message) {
        case 'hide':
            loader.style.display = 'none';
        }
    }, false);

    tb.parse(document.documentElement)(params);
}(window));
