(function() {
    'use strict';

    angular.module('c6.rumble.services', [])
        .service('ControlsService', [function() {
            var _private = {};

            _private.target = null;

            function handlePlay() {

            }

            function handlePause() {

            }

            function handleTimeupdate() {

            }

            this.init = function() {
                var noop = angular.noop;

                return {
                    controller: {
                        play: noop,
                        pause: noop,
                        progress: noop,
                        volumeChange: noop,
                        muteChange: noop,
                        buffer: noop,
                        repositionNodes: noop,
                        setButtonDisabled: noop,
                        ready: false
                    },
                    delegate: {},
                    enabled: true
                };
            };

            this.bindTo = function(iface) {
                _private.target = iface;

                iface
                    .on('play', handlePlay)
                    .on('pause', handlePause)
                    .on('timeupdate', handleTimeupdate);
            };

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .service('CommentsService', ['$cacheFactory','$q','$window',
        function                    ( $cacheFactory , $q , $window ) {
            var _private = {};

            _private.mrId = null;

            _private.cache = $cacheFactory('comments');

            this.init = function(id) {
                _private.mrId = id;

                _private.cache.put(id, $cacheFactory('comments:' + id));
            };

            this.push = function(id, comments) {
                _private.cache.get(_private.mrId).put(id, comments);
            };

            this.fetch = function(id) {
                var deferred = $q.defer(),
                    mrId = _private.mrId,
                    cache = _private.cache.get(mrId),
                    comments;

                if (!cache) {
                    deferred.reject('Service has not been initialized with CommentsService.init(id)!');
                    return deferred.promise;
                }

                comments = cache.get(id);

                if (!comments) {
                    deferred.reject({ code: 404, message: 'Could not find comments with id: ' + id + '.' });
                }

                deferred.resolve(comments);

                return deferred.promise;
            };

            this.post = function(id, message) {
                var cache = _private.cache.get(_private.mrId),
                    comments = cache.put(id, (cache.get(id) || []));

                comments.unshift({
                    user: {
                        pic: 'anonymous.png',
                        name: 'Anonymous'
                    },
                    date: Math.floor($window.Date.now() / 1000),
                    message: message
                });
            };

            if (window.c6.kHasKarma) { this._private = _private; }
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

        .service('InflectorService', [function() {
            var exceptions = [];

            this.pluralize = function(word) {
                var plural = (function() {
                    var result;

                    exceptions.some(function(exception) {
                        if (exception.singular === word) {
                            return !!(result = exception.plural);
                        }
                    });

                    return result;
                }());

                return plural || (word + 's');
            };

            this.singularize = function(word) {
                var singular = (function() {
                    var result;

                    exceptions.some(function(exception) {
                        if (exception.plural === word) {
                            return !!(result = exception.singular);
                        }
                    });

                    return result;
                }());

                return singular || word.replace(/s$/, '');
            };

            this.capitalize = function(word) {
                return word.charAt(0).toUpperCase() + word.substring(1);
            };

            this.getWords = function(string) {
                var result = [],
                    word, character, index, length;

                function isDelimiter(char) {
                    return !!char.match(/-|_|[A-Z]| /);
                }

                function isLetter(char) {
                    return !!char.match(/[A-Za-z]/);
                }

                function pushWord(word) {
                    result.push(word.toLowerCase());
                }

                if (angular.isArray(string)) { return string; }

                word = string.charAt(0);
                length = string.length;

                for (index = 1; index < length; index++) {
                    character = string.charAt(index);

                    if (isDelimiter(character) && word) {
                        pushWord(word);
                        word = isLetter(character) ? character : '';

                        continue;
                    }

                    word += character;
                }

                pushWord(word);

                return result;
            };

            this.toCamelCase = function(words) {
                var self = this;

                return this.getWords(words).map(function(word, index) {
                    if (index === 0) { return word; }

                    return self.capitalize(word);
                }).join('');
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
}());
