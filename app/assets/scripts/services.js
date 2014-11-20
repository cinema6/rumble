define (['angular','c6uilib','adtech','c6_defines'],
function( angular , c6uilib , adtech , c6Defines  ) {
    'use strict';

    return angular.module('c6.rumble.services', [c6uilib.name])
        .service('VideoTrackerService', [function() {
            var quartilesCache = {};

            this.trackQuartiles = function(id, player, cb) {
                var quartiles = quartilesCache[id] ||
                    (quartilesCache[id] = [false, false, false, false]);

                function trackVideoPlayback() {
                    var duration = player.duration,
                        currentTime = Math.min(player.currentTime, duration),
                        percent = (Math.round((currentTime / duration) * 100) / 100),
                        quartile = (function() {
                            if (percent >= 0.95) { return 3; }

                            return Math.floor(percent * 4) - 1;
                        }());

                    if (quartile > -1 && !quartiles[quartile]) {
                        cb(quartile + 1);
                        quartiles[quartile] = true;
                    }
                }

                player.on('timeupdate', trackVideoPlayback);
            };
        }])

        .service('VideoThumbService', ['$http','$q','c6UrlMaker',
        function                      ( $http , $q , c6UrlMaker ) {
            var _private = {};

            _private.getFromYoutube = function(id) {
                return $q.when({
                    small: c6UrlMaker('img.youtube.com/vi/' + id + '/2.jpg', 'protocol'),
                    large: c6UrlMaker('img.youtube.com/vi/' + id + '/0.jpg', 'protocol')
                });
            };

            _private.getFromVimeo = function(id) {
                return $http.get(c6UrlMaker('vimeo.com/api/v2/video/' + id + '.json', 'protocol'))
                    .then(function(response) {
                        /* jshint camelcase:false */
                        var data = response.data[0];

                        return {
                            small: data.thumbnail_small,
                            large: data.thumbnail_large
                        };
                    });
            };

            _private.getFromDailymotion = function(id) {
                return $http.get('https://api.dailymotion.com/video/' +
                        id +
                        '?fields=thumbnail_120_url,thumbnail_720_url' +
                        (c6Defines.kProtocol === 'https:' ? '&ssl_assets=1' : '')
                    )
                    .then(function(response) {
                        /* jshint camelcase:false */
                        var data = response.data;

                        return {
                            small: data.thumbnail_120_url,
                            large: data.thumbnail_720_url
                        };
                    });
            };

            this.getThumbs = function(type, id) {
                switch (type) {

                case 'youtube':
                    return _private.getFromYoutube(id);
                case 'vimeo':
                    return _private.getFromVimeo(id);
                case 'dailymotion':
                    return _private.getFromDailymotion(id);

                default:
                    return $q.reject('Unknown video type: ' + type + '.');

                }
            };

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .factory('compileAdTag', ['$window',
        function                 ( $window ) {
            var url = c6Defines.kLocal ?
                'http://www.mutantplayground.com' :
                (function() {
                    try {
                        return $window.parent.location.href;
                    } catch(e) {
                        return $window.location.href;
                    }
                }());

            return function(tag) {
                var encode = encodeURIComponent;

                return (tag || '')
                    .replace(/{cachebreaker}/g, encode($window.Date.now()))
                    .replace(/{pageUrl}/g, encode(url));
            };
        }])

        .service('AdTechService', ['$window', '$q', '$rootScope', 'c6AppData',
        function                  ( $window ,  $q ,  $rootScope ,  c6AppData ) {
            function getDomain() {
                var domain = $window.location.hostname;

                if (!domain){
                    try {
                        domain = $window.parent.location.hostname;
                    }
                    catch (e){}
                }

                if (domain) {
                    domain = (domain.indexOf('localhost') > -1) ? 'localhost'
                        : (domain.split('.').filter(function(v,i,a){return i===a.length-2;})[0]);
                }

                return domain;
            }

            this.loadAd = function(config) {
                var adLoadDeferred = $q.defer();

                adtech.loadAd({
                    secure: (c6Defines.kProtocol === 'https:'),
                    network: '5473.1',
                    server: 'adserver.adtechus.com',
                    placement: parseInt(config.placementId),
                    adContainerId: config.id,
                    debugMode: (getDomain() === 'localhost'),
                    kv: { mode: (c6AppData.experience.data.adConfig.display.waterfall || 'default') },
                    complete: function() {
                        $rootScope.$apply(function() {
                            adLoadDeferred.resolve();
                        });
                    }
                });

                return adLoadDeferred.promise;
            };
        }])

        .service('ModuleService', [function() {
            this.hasModule = function(modules, module) {
                return ((modules || []).indexOf(module) > -1);
            };
        }])

        .service('EventService', [function() {
            this.trackEvents = function(emitter, events) {
                var tracker = {};

                angular.forEach(events, function(event) {
                    var eventObj = tracker[event] = {
                        emitCount: 0
                    };

                    emitter.on(event, function() {
                        eventObj.emitCount++;
                    });
                });

                return tracker;
            };
        }])

        // TODO: Cleanup this code
        .service('InflectorService', [function() {
            var exceptions = [];

            this.pluralize = function(word) {
                return exceptions.reduce(function(result, exception) {
                    return exception.singular === word ? exception.plural : result;
                }, word + 's');
            };

            this.singularize = function(word) {
                return exceptions.reduce(function(result, exception) {
                    return exception.plural === word ? exception.singular : result;
                }, word.replace(/s$/, ''));
            };

            this.capitalize = function(word) {
                return word.charAt(0).toUpperCase() + word.substring(1);
            };

            this.getWords = function(string) {
                if (angular.isArray(string)) { return string; }

                return string.match(/[A-Z]?[^-|_| |A-Z]+|[A-Z]/g)
                    .map(function(word) { return word.toLowerCase(); });
            };

            this.toCamelCase = function(words) {
                return this.getWords(words).map(function(word, index) {
                    return index ? this.capitalize(word) : word;
                }, this).join('');
            };

            this.toConstructorCase = function(words) {
                return this.capitalize(this.toCamelCase(words));
            };

            this.toSnakeCase = function(words) {
                return this.getWords(words).join('_');
            };

            this.dasherize = function(words) {
                return this.getWords(words).join('-');
            };

            this.toSentence = function(words) {
                return this.getWords(words).join(' ');
            };

            this.addException = function(exception) {
                exceptions.push(exception);
            };
        }]);
});
