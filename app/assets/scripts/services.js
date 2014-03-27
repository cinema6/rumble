(function() {
    'use strict';

    angular.module('c6.rumble.services', ['c6.ui'])
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

            this.$get = ['$log', '$http','$window', 'c6ImagePreloader',
            function    ( $log ,  $http , $window ,  c6ImagePreloader ) {
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

        .provider('VPAIDService', [function() {
            var _provider = {};

            this.adServerUrl = function(url) {
                _provider.serverUrl = url;
            };

            this.$get = ['$log', '$q', '$window', '$interval', 'c6EventEmitter', 'c6UrlMaker',
            function    ( $log ,  $q ,  $window ,  $interval ,  c6EventEmitter ,  c6UrlMaker ) {
                var service = {},
                    _service = {};

                $log = $log.context('VPAIDService');

                service.createPlayer = function(playerId, config, $parentElement) {
                    var $playerElement = angular.element('<div style="text-align:center;"></div>');

                    if(!$parentElement) {
                        throw new Error('Parent element is required for vpaid.createPlayer');
                    }

                    $log.info(config); // do we need to use config for width and height???

                    $parentElement.prepend($playerElement);

                    _service.VPAIDPlayer = function(element$, playerId, $win) {
                        var self = this;

                        c6EventEmitter(self);

                        function getParamCode(obj, param, defaultValue, isFirst, prefix) {
                            var amp = '&';
                            var pre = '';
                            if (isFirst) { amp = ''; }
                            if (prefix) { pre = prefix; }

                            if (obj && obj[param]){
                                if (typeof obj[param] === 'string' && obj[param].length > 0){
                                    return amp + pre + param + '=' + encodeURIComponent(obj[param]);
                                } else if (typeof (obj[param] === 'object')){
                                    var value = '';
                                    var firstInObj = true;
                                    for (var i=0;i<obj[param].length;i++){
                                        if (firstInObj){
                                            firstInObj = false;
                                        }else{
                                            value += '||';
                                        }
                                        value += obj[param][i];
                                    }

                                    return amp + pre + param + '=' + encodeURIComponent(value);
                                }
                            }

                            if (defaultValue){
                                return amp + pre + param + '=' + defaultValue;
                            }

                            return '';
                        }

                        function getPlayerHTML() {
                            // set up all the html and return it for embedding
                            // IE requires the classid attribute and the movie param
                            return [
                                '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="__WIDTH__" id="c6VPAIDplayer_ie" height="__HEIGHT__">',
                                '   <param name="movie" value="__SWF__" />',
                                '   <param name="quality" value="high" />',
                                '   <param name="bgcolor" value="#000000" />',
                                '   <param name="play" value="false" />',
                                '   <param name="loop" value="false" />',
                                '   <param name="wmode" value="opaque" />',
                                '   <param name="scale" value="noscale" />',
                                '   <param name="salign" value="lt" />',
                                '   <param name="flashvars" value="__FLASHVARS__" />',
                                '   <param name="allowScriptAccess" value="always" />',
                                '   <param name="allowFullscreen" value="true" />',
                                '   <!--[if !IE]>-->',
                                '       <object type="application/x-shockwave-flash" data="__SWF__" id="c6VPAIDplayer" width="__WIDTH__" height="__HEIGHT__">',
                                '           <param name="movie" value="__SWF__" />',
                                '           <param name="quality" value="high" />',
                                '           <param name="bgcolor" value="#000000" />',
                                '           <param name="play" value="false" />',
                                '           <param name="loop" value="false" />',
                                '           <param name="wmode" value="opaque" />',
                                '           <param name="scale" value="noscale" />',
                                '           <param name="salign" value="lt" />',
                                '           <param name="flashvars" value="__FLASHVARS__" />',
                                '           <param name="allowScriptAccess" value="always" />',
                                '           <param name="allowFullscreen" value="true" />',
                                '       </object>',
                                '   <!--<![endif]-->',
                                '</object>'
                            ].join('\n');
                        }

                        function emitReady() {
                            var current = 0,
                                limit = 5000,
                                check = $interval(function() {
                                    if(self.player && self.player.isCinema6player()) {
                                        $interval.cancel(check);
                                        self.emit('ready', self);
                                    } else {
                                        current += 100;
                                        if(current > limit) {
                                            $interval.cancel(check);
                                        }
                                    }
                                }, 100);
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
                                    return self.player.getAdProperties().adCurrentTime;
                                }
                            }
                        });

                        self.insertHTML = function() {
                            // currently the ad starts right when html is inserted
                            // we need to add a vast prefetcher to the swf
                            element$.prepend(self.setup());
                            emitReady();
                            // self.emit('ready', self);
                        };

                        self.loadAd = function() {
                            // starts the prefetched ad at a later time
                            self.player.loadAd();
                        };

                        self.setup = function() {
                            var obj = {
                                params: {},
                                playerId: playerId,
                                swf: c6UrlMaker('swf/player.swf'),
                                width: 640,
                                height: 360,
                                adXmlUrl: _provider.serverUrl
                            };

                            var html = getPlayerHTML().replace(/__SWF__/g, obj.swf);
                            html = html.replace(/__WIDTH__/g, obj.width);
                            html = html.replace(/__HEIGHT__/g, obj.height);

                            var flashvars = '';

                            flashvars += getParamCode(obj, 'adXmlUrl');
                            flashvars += getParamCode(obj, 'playerId');

                            if (obj.params){
                                for (var i in obj.params){
                                    flashvars += getParamCode(obj.params, i, null, false, 'params.');
                                }
                            }

                            html = html.replace(/__FLASHVARS__/g, flashvars);

                            return html;
                        };

                        // self.play = function() {
                        //     self.player.play();
                        // };

                        self.pause = function() {
                            self.player.pauseAd();
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
                            self.player.resumeAd();
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
                                    case 'AdStarted':
                                        {
                                            self.emit('play', self);
                                            break;
                                        }
                                    case 'AdPaused':
                                        {
                                            self.emit('pause', self);
                                            break;
                                        }
                                    case 'AdVideoComplete':
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
