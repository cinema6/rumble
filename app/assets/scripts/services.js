define (['angular','c6ui','adtech','c6_defines'],
function( angular , c6ui , adtech , c6Defines  ) {
    'use strict';

    return angular.module('c6.rumble.services', [c6ui.name])
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

        .provider('VASTService', [function() {
            var _provider = {};

            this.adTags = function(tags) {
                _provider.adTags = tags;
            };

            this.$get = ['$log','$http','$window','c6ImagePreloader','compileAdTag','$q',
                         'c6VideoService',
            function    ( $log , $http , $window , c6ImagePreloader , compileAdTag , $q ,
                          c6VideoService ) {
                var service = {},
                    _service = {};

                _service.VAST = function(xml) {
                    var $ = xml.querySelectorAll.bind(xml),
                        self = this;

                    this.video = {
                        duration: _service.getSecondsFromTimestamp($('Linear Duration')[0].childNodes[0].nodeValue),
                        mediaFiles: []
                    };

                    this.companions = [];
                    this.clickThrough = [];
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
                        companionCreativeView: [],
                        playing: [],
                        companionDisplay: [],
                        companionClick: [],
                        loaded: [],
                        stopped: [],
                        linearChange: []
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

                        self.companions.push({
                            adType : adType,
                            fileURI : companionNode.firstChild.nodeValue
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
                        self.clickThrough.push(clickThrough.firstChild.nodeValue);
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

                };

                _service.VAST.prototype = {
                    getVideoSrc: function(_type) {
                        var type = _type || c6VideoService.bestFormat(
                            this.video.mediaFiles.map(function(mediaFile) {
                                return mediaFile.type;
                            })
                        );

                        return this.video.mediaFiles.reduce(function(result, mediaFile) {
                            return mediaFile.type === type ? mediaFile.url : result;
                        }, null);
                    },
                    getCompanion: function() {
                        // this just returns the first one
                        // probably want to have some logic here
                        // maybe we want to pass in a size?
                        return this.companions.length ? this.companions[0] : null;
                    },
                    firePixels: function(event) {
                        $log.info('Event Pixel: ', event);
                        c6ImagePreloader.load(this.pixels[event]);
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

                service.getVAST = function(source) {
                    // make an xml container for all the vast responses, including wrappers
                    var parser = new $window.DOMParser(),
                        combinedVast = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><container></container>', 'text/xml'),
                        url = compileAdTag(_provider.adTags[source]);

                    function fetchVAST(url) {
                        function recurse(response) {
                            var vast = response.data,
                                uriNodes = vast.querySelectorAll('VASTAdTagURI');

                            // append the VAST node to the xml container
                            combinedVast.firstChild.appendChild(vast.querySelectorAll('VAST')[0]);

                            if (uriNodes.length > 0) {
                                return fetchVAST(uriNodes[0].firstChild.nodeValue);
                            }

                            if(!combinedVast.querySelectorAll('MediaFiles').length) {
                                return $q.reject('No video ad!');
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

                    return fetchVAST(url).then(createVast);
                };

                if (window.c6.kHasKarma) { service._private = _service; }

                return service;
            }];

            if (window.c6.kHasKarma) { this._private = _provider; }
        }])

        .provider('VPAIDService', [function() {
            var _provider = {};

            this.adTags = function(tags) {
                _provider.adTags = tags;

                return this;
            };

            this.$get = ['$log','$http','$q','$window','$interval','$templateCache','c6EventEmitter','compileAdTag','$timeout','$rootScope',
            function    ( $log , $http , $q , $window , $interval , $templateCache , c6EventEmitter , compileAdTag , $timeout , $rootScope ) {
                var service = {},
                    _service = {};

                $log = $log.context('VPAIDService');

                service.createPlayer = function(playerId, config, $parentElement) {
                    var $playerElement = angular.element('<div class="mr-adVideo__videoHolder"></div>');

                    if(!$parentElement) {
                        throw new Error('Parent element is required for vpaid.createPlayer');
                    }

                    $log.info(config);

                    $parentElement.prepend($playerElement);

                    _service.VPAIDPlayer = function(element$, playerId, $win) {
                        var self = this,
                            adPlayerDeferred = $q.defer(),
                            adDeferred = $q.defer(),
                            actualAdDeferred = $q.defer(),
                            adStarted = false,
                            adVideoStart = false;

                        c6EventEmitter(self);

                        function getPlayerTemplate() {
                            return $http({
                                method: 'GET',
                                url: 'views/vpaid_object_embed.html',
                                cache: $templateCache
                            });
                        }

                        function emitReady() {
                            var deferred = $q.defer();

                            var current = 0,
                                limit = 5000,
                                check = $interval(function() {
                                    if(self.player && self.player.isCinema6player()) {
                                        $interval.cancel(check);
                                        self.emit('ready', self);
                                        return deferred.resolve('successfully inserted and loaded player');
                                    } else {
                                        current += 100;
                                        if(current > limit) {
                                            $interval.cancel(check);
                                            $log.error('VPAID player never responded');
                                            return deferred.reject('error, do something');
                                        }
                                    }
                                }, 100);

                            return deferred.promise;
                        }

                        function setup(template) {
                            var html,
                                flashvars = '';

                            html = template.data.replace(/__SWF__/g, 'swf/player.swf');

                            flashvars += 'adXmlUrl=' + encodeURIComponent(compileAdTag(_provider.adTags[config.data.source]));
                            flashvars += '&playerId=' + encodeURIComponent(playerId);

                            html = html.replace(/__FLASHVARS__/g, flashvars);

                            element$.prepend(html);

                            return emitReady();
                        }

                        Object.defineProperties(this, {
                            player : {
                                get: function() {
                                    var obj = element$.find('#c6VPAIDplayer')[0],
                                        val;

                                    try {
                                        val = obj.isCinema6player();

                                        if (val){ return obj; }

                                    } catch(e) {}

                                    obj = element$.find('#c6VPAIDplayer_ie')[0];

                                    try {
                                        val = obj.isCinema6player();

                                        if (val) { return obj; }

                                    } catch(e) {}

                                    return null;
                                }
                            },
                            currentTime : {
                                get: function() {
                                    return self.player.getAdProperties ?
                                        self.player.getAdProperties().adCurrentTime : 0;
                                }
                            }
                        });

                        function initTimer() {
                            var check = $interval(function() {
                                    if (self.player.getAdProperties) {
                                        if (self.player.getAdProperties().adCurrentTime > 0 &&
                                            adStarted && adVideoStart) {
                                            actualAdDeferred.resolve();
                                        }
                                    }
                                }, 300);

                            $timeout(function() {
                                adPlayerDeferred.reject();
                                adDeferred.reject();
                                actualAdDeferred.reject();
                                $interval.cancel(check);
                            }, 3000);
                        }

                        self.insertHTML = function() {
                            return getPlayerTemplate().then(setup);
                        };

                        self.loadAd = function() {
                            return adPlayerDeferred.promise.then(function() {
                                self.player.loadAd();
                                return adDeferred.promise;
                            });
                        };

                        self.startAd = function() {
                            initTimer();

                            return adDeferred.promise.then(function() {
                                self.player.startAd();
                                return actualAdDeferred.promise;
                            });
                        };

                        self.pause = function() {
                            return actualAdDeferred.promise.then(function() {
                                self.player.pauseAd();
                            });
                        };

                        self.getAdProperties = function() {
                            return self.player.getAdProperties();
                        };

                        self.getDisplayBanners = function() {
                            return self.player.getDisplayBanners();
                        };

                        self.setVolume = function(volume) {
                            self.player.setVolume(volume);
                        };

                        self.resumeAd = function() {
                            return actualAdDeferred.promise.then(function() {
                                self.player.resumeAd();
                            });
                        };

                        self.stopAd = function() {
                            self.player.stopAd();
                        };

                        self.isC6VpaidPlayer = function() {
                            return self.player.isCinema6player();
                        };

                        self.getCurrentTime = function() {
                            return self.player.getAdProperties().adCurrentTime;
                        };

                        self.getDuration = function() {
                            return self.player.getAdProperties().adDuration;
                        };

                        self.destroy = function() {
                            // TO DO: graceful way to destroy and rebuild
                            // this will depend on whether we actually want to re-initialize a new vpaid ad

                            // self.player.stopAd();
                            // element$[0].removeChild(element$[0].childNodes[0]);
                            // self.insertHTML();
                        };

                        function handlePostMessage(e) {
                            // this player interface doesn't fire timeupdates
                            // we're relying on the events coming from the Player instead
                            // we have no controls on this player so the only thing time-related
                            // will be firing our own tracking pixels for reporting/analytics
                            try {
                                var data = JSON.parse(e.data);

                                if(!data.__vpaid__ || (data.__vpaid__.id !== playerId)) { return; }

                                $log.info('EVENT: ', data.__vpaid__.type);

                                switch(data.__vpaid__.type) {
                                    case 'onAdResponse':
                                        {
                                            // we have the Adap swf but no ad
                                            self.emit('adPlayerReady', self);
                                            $rootScope.$apply(function() {
                                                adPlayerDeferred.resolve();
                                            });
                                            break;
                                        }
                                    case 'AdLoaded':
                                        {
                                            // we SHOULD have the ad, but some people lie
                                            self.emit('adLoaded', self);
                                            $rootScope.$apply(function() {
                                                adDeferred.resolve();
                                            });
                                            break;
                                        }
                                    case 'AdStarted':
                                        {
                                            // we DEFINITELY have an ACTUAL ad
                                            self.emit('play', self);
                                            adStarted = true;
                                            break;
                                        }
                                    case 'AdVideoStart':
                                        {
                                            // another event that indicates we should DEFINITELY have an ACTUAL ad
                                            adVideoStart = true;
                                            break;
                                        }
                                    case 'AdPlaying':
                                        {
                                            self.emit('play', self);
                                            break;
                                        }
                                    case 'AdPaused':
                                        {
                                            self.emit('pause', self);
                                            break;
                                        }
                                    case 'displayBanners':
                                        {
                                            self.emit('companionsReady', self);
                                            break;
                                        }
                                    case 'AdError':
                                    case 'AdStopped':
                                    case 'AdVideoComplete':
                                    case 'onAllAdsCompleted':
                                        {
                                            self.emit('ended', self);
                                            break;
                                        }
                                }

                                self.emit(data.__vpaid__.type, self);
                            } catch (err) {}
                        }

                        $win.addEventListener('message', handlePostMessage, false);

                    }; // end _service.VPAIDPlayer()

                    return new _service.VPAIDPlayer($playerElement, playerId, $window);
                };

                if (window.c6.kHasKarma) { service._private = _service; }

                return service;
            }]; // end $get

            if (window.c6.kHasKarma) { this._private = _provider; }

        }])

        .service('AdTechService', ['$window', '$q', '$rootScope',
        function                  ( $window ,  $q ,  $rootScope ) {
            var domain, placementId;

            function getPlacementId() {
                if (placementId) {
                    return placementId.promise;
                }

                placementId = $q.defer();
                domain = $window.location.hostname;

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

                adtech.loadAd({
                    secure: (c6Defines.kProtocol === 'https:'),
                    network: '5473.1',
                    server: 'adserver.adtechus.com',
                    placement: 3220577,
                    adContainerId: 'adtechPlacement',
                    kv: { weburl: domain },
                    complete: function() {
                        $rootScope.$apply(function() {
                            placementId.resolve($window.c6AdtechPlacementId);
                        });
                    }
                });

                return placementId.promise;
            }

            this.loadAd = function(config) {
                var adLoadDeferred = $q.defer();

                getPlacementId().then(function(id) {
                    adtech.loadAd({
                        secure: (c6Defines.kProtocol === 'https:'),
                        network: '5473.1',
                        server: 'adserver.adtechus.com',
                        placement: id,
                        adContainerId: config.id,
                        debugMode: (domain === 'localhost'),
                        kv: { mode: (config.displayAdSource || 'default') },
                        complete: function() {
                            $rootScope.$apply(function() {
                                adLoadDeferred.resolve();
                            });
                        }
                    });
                });

                return adLoadDeferred.promise;
            };
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
});
