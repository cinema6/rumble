define( ['version'],
function( version ) {
    'use strict';

    var c6 = (window.c6 = window.location.search.substring(1).split('&')
        .map(function(pair) {
            return pair.split('=')
                .map(decodeURIComponent);
        })
        .filter(function(pair) {
            return [
                'kCollateralUrl','kDebug','kApiUrl','kDevMode','kDevice','kMode','kEnvUrlRoot'
            ].indexOf(pair[0]) > -1;
        })
        .reduce(function(c6, pair) {
            c6[pair[0]] = convertValue(pair[1]);
            return c6;
        }, window.c6 || {}));

    function convertValue(value) {
        if ((/^(true|false)$/).test(value)) {
            return value === 'true';
        }

        if (value === 'undefined') {
            return undefined;
        }

        if (value === 'null') {
            return null;
        }

        if ((/^\d+.?\d+?$/).test(value)) {
            return parseFloat(value);
        }

        return value;
    }

    function setDefault(object, prop, value) {
        if (!object.hasOwnProperty(prop)) {
            object[prop] = value;
        }
    }

    function c6Default(prop, value) {
        return setDefault(c6, prop, value);
    }

    c6Default('kMode', 'full');
    c6Default('kLocal', false);
    c6Default('kDebug', false);
    c6Default('kAppName', 'MiniReel');
    c6Default('kAppId', 'com.cinema6.minireel');
    c6Default('kAppVersion', version);
    c6Default('kHasKarma', false);
    c6Default('kLogFormats', c6.kDebug);
    c6Default('kLogLevels', c6.kDebug ? ['error','warn','log','info'] : []);
    c6Default('kProtocol', 'http:');
    c6Default('kEnvUrlRoot', c6.kProtocol + '//portal.cinema6.com');
    c6Default('kCollateralUrl', !c6.kLocal ?
        (c6.kEnvUrlRoot + '/collateral') : '/__dirname/c6Content');
    c6Default('kApiUrl', c6.kEnvUrlRoot + '/api');
    c6Default('kHref', (function() {
        try {
            return  (window.location.protocol.search(/^https?/) > -1) ?
                window.location.href : window.parent.location.href;
        }
        catch(e){
            return '';
        }
    }()));
    c6Default('html5Videos', []);

    return c6;
});
