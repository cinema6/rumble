(function() {
    'use strict';

    angular.module('c6.rumble.services', [])
        .service('VideoThumbService', ['$http','$q',
        function                      ( $http , $q ) {
            var _private = {};

            _private.getFromYoutube = function(id) {
                return $q.when({
                    small: 'http://img.youtube.com/vi/' + id + '/2.jpg',
                    large: 'http://img.youtube.com/vi/' + id + '/0.jpg'
                });
            };

            _private.getFromVimeo = function(id) {
                return $http.get('http://vimeo.com/api/v2/video/' + id + '.json')
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
                return $http.get('https://api.dailymotion.com/video/' + id + '?fields=thumbnail_120_url,thumbnail_720_url')
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

        .provider('VASTService', [function() {
            var _provider = {};

            this.adServerUrl = function(url) {
                _provider.serverUrl = url;
            };

            this.$get = ['$http','$window',
            function    ( $http , $window ) {
                var service = {},
                    _service = {};
                    // _service = {
                    //     wrappers: []
                    // };

                _service.VAST = function(xml) {
                    var $ = xml.querySelectorAll.bind(xml),
                        self = this;
                    // window.console.log(xml);

                    // if(!$('Wrapper')[0]) {
                    //     this.wrappers = _service.wrappers;
                    // }

                    // this.video = {
                    //     duration: $('Linear Duration')[0] ? _service.getSecondsFromTimestamp($('Linear Duration')[0].childNodes[0].nodeValue) : null,
                    //     mediaFiles: []
                    // };

                    this.video = {
                        duration: _service.getSecondsFromTimestamp($('Linear Duration')[0].childNodes[0].nodeValue),
                        mediaFiles: []
                    };

                    this.companions = [];
                    this.pixels = {
                        // this does not include non-linear tracking
                        errorPixel: [],
                        impression: [],
                        creativeView: [],
                        start: [],
                        firstQuartile: [],
                        midpoint: [],
                        thirdQuartile: [],
                        complete: [],
                        mute: [],
                        unmute: [],
                        pause: [],
                        rewind: [],
                        resume: [],
                        fullscreen: [],
                        expand: [],
                        collapse: [],
                        acceptInvitation: [],
                        close: [],
                        videoClickThrough: [],
                        videoClickTracking: [],
                        videoCustomClick: [],
                        companionCreativeView: []
                    };

                    angular.forEach($('MediaFiles MediaFile'), function(mediaFile) {
                        var file = {};

                        angular.forEach(mediaFile.attributes, function(attribute) {
                            file[attribute.name] = attribute.value;
                        });

                        file.url = mediaFile.firstChild.nodeValue;

                        self.video.mediaFiles.push(file);
                    });

                    angular.forEach($('CompanionAds Companion'), function(companion) {
                        // this assumes that there's only one adType in each <Companion>
                        // it also assumes a specific xml structure
                        // might want to do a query for each adType instead

                        var adType,
                            fileURI,
                            companionNode = companion.firstChild;

                        switch (companionNode.tagName) {
                        case 'IFrameResource':
                            adType = 'iframe';
                            break;
                        case 'StaticResource':
                            adType = 'image';
                            break;
                        case 'HTMLResource':
                            adType = 'html';
                            break;
                        }

                        fileURI = companionNode.firstChild.nodeValue.replace(/\s/g, '');

                        self.companions.push({
                            adType : adType,
                            fileURI : fileURI
                        });
                    });

                    angular.forEach($('Error'), function(error) {
                        self.pixels.errorPixel.push(error.firstChild.nodeValue);
                    });

                    angular.forEach($('Impression'), function(impression) {
                        self.pixels.impression.push(impression.firstChild.nodeValue);
                    });

                    angular.forEach($('Linear Tracking'), function(tracking) {
                        var eventName;

                        angular.forEach(tracking.attributes, function(attribute) {
                            if(attribute.name === 'event') {
                                eventName = attribute.value;
                            }
                        });

                        self.pixels[eventName].push(tracking.firstChild.nodeValue);
                    });

                    angular.forEach($('VideoClicks ClickThrough'), function(clickThrough) {
                        self.pixels.videoClickThrough.push(clickThrough.firstChild.nodeValue);
                    });

                    angular.forEach($('VideoClicks ClickTracking'), function(clickTracking) {
                        self.pixels.videoClickTracking.push(clickTracking.firstChild.nodeValue);
                    });

                    angular.forEach($('VideoClicks CustomClick'), function(customClick) {
                        self.pixels.videoCustomClick.push(customClick.firstChild.nodeValue);
                    });

                    angular.forEach($('Companion Tracking'), function(companionTracking) {
                        // creativeView is the only event supported for companion tracking, so no need to read the event attr
                        self.pixels.companionCreativeView.push(companionTracking.firstChild.nodeValue);
                    });

                    // window.console.log(this);
                };

                _service.VAST.prototype = {
                    getVideoSrc: function(type) {
                        var src = null;

                        this.video.mediaFiles.some(function(mediaFile) {
                            if (mediaFile.type === type) {
                                src = mediaFile.url;
                                return true;
                            }
                        });

                        return src;
                    },
                    getCompanion: function() {
                        // this just returns the first one
                        // probably want to have some logic here
                        // maybe we want to pass in a size?
                        return this.companions.length ? this.companions[0] : null;
                    },
                    fireImpressionPixels: function() {
                        window.console.log('fired impression pixel');
                    },
                    firePausePixels: function() {
                        window.console.log('fired pause pixels');
                    },
                    fireFirstQuartilePixels: function() {
                        window.console.log('fired firstQuartile pixels');
                    },
                    fireMidpointPixels: function() {
                        window.console.log('fired midpoint pixels');
                    },
                    fireThirdQuartilePixels: function() {
                        window.console.log('fired thirdQuartile pixels');
                    }
                };

                _service.getSecondsFromTimestamp = function(timestamp) {
                    var timeArray = timestamp.split(':'),
                        total = 0;

                    total += parseInt(timeArray[0], 10) * 60 * 60;
                    total += parseInt(timeArray[1], 10) * 60;
                    total += parseInt(timeArray[2], 10);

                    return total;
                };

                _service.getXML = function(string) {
                    var parser = new $window.DOMParser();

                    return parser.parseFromString(string.replace(/\n/g, '').replace(/>\s+</g, '><'), 'text/xml');
                };

                service.getVAST = function(url) {
                    // make an xml container for all the vast responses, including wrappers
                    var parser = new $window.DOMParser(),
                        combinedVast = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><container></container>', 'text/xml');

                    function fetchVAST(url) {
                        function recurse(response) {
                            var vast = response.data,
                                uriNodes = vast.querySelectorAll('VASTAdTagURI');

                            // append the VAST node to the xml container
                            combinedVast.firstChild.appendChild(vast.querySelectorAll('VAST')[0]);

                            if (uriNodes.length > 0) {
                                return fetchVAST(uriNodes[0].firstChild.nodeValue);
                            }

                            // after we've recursed through all the wrappers return
                            // the xml container with all the vast data
                            return combinedVast;

                        }

                        return $http.get(url, {
                            transformResponse: _service.getXML,
                            responseType: 'text'
                        }).then(recurse);
                    }


                    function createVast(vast) {
                        return new _service.VAST(vast);
                    }

                    return fetchVAST((url || _provider.serverUrl)).then(createVast);
                };

                if (window.c6.kHasKarma) { service._private = _service; }

                return service;
            }];

            if (window.c6.kHasKarma) { this._private = _provider; }
        }])

        .service('ControlsService', ['$timeout',
        function                    ( $timeout ) {
            var _private = {};

            _private.target = null;
            _private.iface = null;

            function handlePlay() {
                _private.iface.controller.play();
            }

            function handlePause() {
                _private.iface.controller.pause();
            }

            function handleTimeupdate(player) {
                var duration = player.duration,
                    currentTime = player.currentTime;

                if (isNaN(duration)) { return; }

                _private.iface.controller.progress((currentTime / duration) * 100);
            }

            this.init = function() {
                var noop = angular.noop,
                    wasPlaying;

                _private.iface = {
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
                    delegate: {
                        play: function() {
                            _private.target.play();
                        },
                        pause: function() {
                            _private.target.pause();
                        },
                        seekStart: function() {
                            wasPlaying = !_private.target.paused;

                            _private.target.pause();
                        },
                        seek: function(event) {
                            $timeout(function() {
                                _private.iface.controller.progress(event.percent);
                            });
                        },
                        seekStop: function(event) {
                            var percent = event.percent,
                                duration = _private.target.duration;

                            _private.target.currentTime = ((percent * duration) / 100);

                            if (wasPlaying) {
                                _private.target.play();
                            }
                        }
                    },
                    enabled: true
                };

                return _private.iface;
            };

            this.bindTo = function(iface) {
                _private.iface.controller.progress(0);
                _private.iface.controller.pause();

                if (_private.target) {
                    _private.target
                        .removeListener('play', handlePlay)
                        .removeListener('pause', handlePause)
                        .removeListener('timeupdate', handleTimeupdate);
                }

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
