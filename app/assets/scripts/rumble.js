(function(){
    'use strict';

    var forEach = angular.forEach;

    angular.module('c6.rumble')
    .animation('.slides__item',['$log', function($log){
        $log = $log.context('.slides__item');
        return {
            beforeAddClass: function(element,className,done) {
                $log.log('addClass setup:',className);
                element.css({ 'opacity' : 1, 'visibility' : 'visible' });
                $log.info('addClass start',className);
                element.animate({
                    opacity: 0
                }, 1, function() {
                    $log.info('addClass end',className);
                    element.css({'visibility' : 'hidden'});
                    done();
                });
            },
            removeClass: function(element,className,done) {
                $log.log('removeClass setup:',className);
                element.css({ 'opacity' : 0, 'visibility' : 'visible' });
                $log.info('removeClass start',className);
                element.delay(50).animate({
                    opacity: 1
                }, 400, function() {
                    $log.info('removeClass end',className);
                    done();
                });
            }
        };
    }])
    .animation('.ballot-module', ['$log', function($log) {
        $log = $log.context('.ballot-module');
        return {
            beforeAddClass: function(element,className,done) {
                $log.log('addClass setup:',className);
                element.css({opacity: 1, 'visibility': 'visible'});

                $log.info('addClass start',className);
                element.delay(250).animate({
                    opacity: 0
                }, 750, function() {
                    $log.info('addClass end',className);
                    element.css('visibility','hidden');
                    done();
                });
            },
            removeClass: function(element,className,done) {
                $log.log('removeClass setup:', className);
                element.css({opacity: 0, 'visibility':'visible'});

                $log.info('removeClass start',className);
                element.animate({
                    opacity: 1
                }, 750, function() {
                    $log.info('removeClass end', className);
                    done();
                });
            }
        };
    }])
    .service('MiniReelService', ['InflectorService','CommentsService','VideoThumbService',
                                 'c6ImagePreloader','envrootFilter',
    function                    ( InflectorService , CommentsService , VideoThumbService ,
                                  c6ImagePreloader , envrootFilter ) {
        this.createDeck = function(data) {
            var playlist = angular.copy(data.deck);

            function getObject(type, id) {
                var pluralType = InflectorService.pluralize(type),
                    collection = data[pluralType],
                    object;

                collection.some(function(item) {
                    if (item.id === id) {
                        object = item;
                    }
                });

                return object;
            }

            function resolve(object) {
                angular.forEach(object, function(value, prop) {
                    var words,
                        lastWord,
                        type;

                    if (angular.isObject(value)) {
                        resolve(value);
                        return;
                    }

                    if (!angular.isString(prop)) {
                        return;
                    }

                    words = InflectorService.getWords(prop);
                    lastWord = words[words.length - 1];

                    if ((lastWord === 'id') && (words.length > 1)) {
                        words.pop();
                        type = InflectorService.toCamelCase(words);

                        delete object[prop];
                        object[type] = getObject(type, value);
                    }
                });
            }

            function fetchThumb(card) {
                card.thumbs = null;

                switch (card.type) {
                case 'recap':
                    (function() {
                        var splash = (data.collateral || {}).splash ?
                            envrootFilter(data.collateral.splash) :
                            null;

                        card.thumbs = splash ? {
                            small: splash,
                            large: splash
                        } : null;
                    }());
                    break;
                default:
                    VideoThumbService.getThumbs(card.type, card.data.videoid)
                        .then(function(thumbs) {
                            card.thumbs = thumbs;
                            c6ImagePreloader.load([thumbs.small]);
                        });
                    break;
                }
            }

            angular.forEach(playlist, function(video) {
                resolve(video);
                fetchThumb(video);

                //TODO: remove this when the service works for real
                CommentsService.push(video.id, (video.conversation && video.conversation.comments));
                delete video.conversation;

                video.player = null;
            });

            return playlist;
        };
    }])
    .service('BallotService', ['$http','$cacheFactory','$q','c6UrlMaker',
    function                  ( $http , $cacheFactory , $q , c6UrlMaker ) {
        var service = this,
            electionId = null,
            ballotMap  = null,
            legacyBallotMap,
            electionCache = $cacheFactory('BallotService:elections');

        function processBallot(ballot,id){
            var choiceNames = ballotMap[id],
                choices = [],
                isBlank = (function() {
                    var t = 0;
                    angular.forEach(ballot, function(votes){
                        t += votes;
                    });
                    return (Math.round(t * 100) / 100) !== 1;
                }());

            angular.forEach(choiceNames, function(name,index) {
                choices.push({
                    'name'  : name,
                    'votes' : isBlank ?
                        (Math.round((1 / choiceNames.length)  * 100)/100) : ballot[index]
                });
            });
            return choices;
        }

        function processLegacyBallot(ballot,id) {
            var newBallot = [], expectedLength = ballotMap[id].length;
            if (!legacyBallotMap){
                legacyBallotMap = {};
            }
            legacyBallotMap[id] = [];
            angular.forEach(ballot, function(votes,name) {
                if (legacyBallotMap[id].length < expectedLength){
                    legacyBallotMap[id].push(name);
                    newBallot.push(votes ? votes : 0);
                }
            });
            return processBallot(newBallot,id);
        }

        function fail() {
            return $q.reject('The BallotService has not been initialized with an election id.');
        }

        this.init = function(id,bMap) {
            electionId = id;
            ballotMap = bMap;
        };

        this.getElection = function() {
            function process(response) {
                var data = response.data.ballot,
                    election = {};

                angular.forEach(data, function(ballot, id) {
                    if (!ballotMap[id]){
                        return;
                    }

                    if (ballot === null){
                        ballot = [];
                    }

                    if (angular.isArray(ballot)){
                        election[id] = processBallot(ballot,id);
                    } else {
                        election[id] = processLegacyBallot(ballot,id);
                    }
                });

                return election;
            }

            function cache(election) {
                return electionCache.put(electionId, election);
            }

            if (!electionId) {
                return fail();
            }

            return $http.get(c6UrlMaker(
                    ('public/election/' + electionId),
                    'api'
                ), { cache: true })
                .then(process)
                .then(cache);
        };

        this.getBallot = function(id) {
            function fetchFromCache() {
                var election = electionCache.get(electionId);

                return election ?
                    $q.when(election) :
                    $q.reject('Election ' + electionId + ' is not in the cache.');
            }

            function fetchFromService() {
                return service.getElection();
            }

            function getBallot(election) {
                return election[id];
            }

            if (!electionId) {
                return fail();
            }

            return fetchFromCache()
                .catch(fetchFromService)
                .then(getBallot);
        };

        this.vote = function(id, choiceIndex) {
            function process() {
                return true;
            }

            if (!electionId) {
                return fail();
            }

            if (legacyBallotMap){
                // need to convert numeric vote index to name
                (function(){
                    if (legacyBallotMap[id]){
                        choiceIndex = legacyBallotMap[id][choiceIndex];
                    }
                }());
            }

            return $http.post(c6UrlMaker('public/vote', 'api'), {
                election: electionId,
                ballotItem: id,
                vote: choiceIndex
            }).then(process);
        };
    }])
    .controller('RumbleController',['$log','$scope','$timeout','$interval','BallotService',
                                    'c6Computed','cinema6','MiniReelService','CommentsService',
                                    'ControlsService','trackerService','c6Defines',
    function                       ( $log , $scope , $timeout , $interval, BallotService ,
                                     c6Computed , cinema6 , MiniReelService , CommentsService ,
                                     ControlsService , trackerService , c6Defines ){
        var self    = this, readyTimeout,
            appData = $scope.app.data,
            id = appData.experience.id,
            election = appData.experience.data.election,
            videoAdConfig = appData.experience.data.adConfig.video,
            c = c6Computed($scope),
            tracker = trackerService('c6mr'),
            cancelTrackVideo = null,
            ballotMap = {},
            navController = null,
            MasterDeckCtrl,
            readyWatch = $scope.$watch('ready', function(ready) {
                if (ready) {
                    $scope.$emit('ready');
                    readyWatch();
                }
            });

        function MasterDeckController() {
            var index = null,
                previousCard = null,
                toCard = null,
                self = this,
                adController = {
                    adCount: 0,
                    videoCount: 0,
                    firstPlacement: videoAdConfig.firstPlacement,
                    frequency: videoAdConfig.frequency
                };

            Object.defineProperties(adController, {
                shouldLoadAd: {
                    get: function() {
                        return (this.videoCount + 1 - this.firstPlacement) % this.frequency === 0;
                    }
                },
                shouldPlayAd: {
                    get: function() {
                        return this.adCount <= ((this.videoCount - this.firstPlacement) / this.frequency);
                    }
                }
            });

            Object.defineProperties(this, {
                currentIndex: {
                    get: function() {
                        return index;
                    }
                },
                currentCard: {
                    get: function() {
                        return $scope.deck[index];
                    }
                }
            });

            this.showAd = function() {
                $scope.deck.splice(index, 0, { ad: true });
                $scope.currentIndex   = self.currentIndex;
                $scope.currentCard    = self.currentCard;
                adController.adCount++;
            };

            this.removeAd = function() {
                $scope.deck.splice($scope.deck.indexOf(previousCard), 1);
                index = Math.max(0,index-1);
            };

            this.adOnDeck = function() {
                $scope.$broadcast('onDeck', { ad: true });
            };

            if (adController.firstPlacement === 0) {
                self.adOnDeck();
            }

            $scope.$on('positionWillChange', function(event, i) {
                previousCard = $scope.currentCard;
                index = i;

                if (previousCard && previousCard.ad) {
                    self.removeAd();
                }

                toCard = $scope.deck[index] || null;

                if (toCard) {
                    if (!toCard.ad) {
                        if (adController.shouldLoadAd) {
                            self.adOnDeck();
                        }

                        if (adController.shouldPlayAd) {
                            event.preventDefault();
                            self.showAd();
                        } else {
                            adController.videoCount++;
                        }
                    } else {
                        adController.adCount++;
                    }
                }
            });

            $scope.$on('positionDidChange', function(event, i) {
                if (navController) {
                    navController.enabled(true);
                }

                $scope.atHead = $scope.currentIndex === 0;
                $scope.atTail = ($scope.currentIndex === ($scope.deck.length - 1));

                if ($scope.atHead) {
                    $scope.$emit('reelStart');
                }
                if ($scope.atTail) {
                    $scope.$emit('reelEnd');
                }
                if (i < 0) {
                    $scope.$emit('reelReset');
                } else if(!$scope.atHead && !$scope.atTail){
                    $scope.$emit('reelMove');
                }
            });

            $scope.$on('reelReset', function() {
                adController.adCount = 0;
                adController.videoCount = 0;
            });
        }

        function NavController(nav) {
            this.tick = function(time) {
                nav.wait = Math.round(time);

                return this;
            };

            this.enabled = function(bool) {
                if (!appData.profile.inlineVideo) {
                    return this;
                }

                nav.enabled = bool;

                if (!nav.enabled) {
                    nav.wait = null;
                }

                return this;
            };
        }

        function isAd(card) {
            return (card || null) && (card.ad && !card.sponsored);
        }

        function handleAdInit(event, provideNavController) {
            provideNavController(navController = new NavController($scope.nav));
        }

        $log = $log.context('RumbleCtrl');

        CommentsService.init(id);

        $scope.deviceProfile    = appData.profile;
        $scope.title            = appData.experience.data.title;

        $scope.controls         = ControlsService.init();

        $scope.deck             = MiniReelService.createDeck(appData.experience.data);

        MasterDeckCtrl = new MasterDeckController($scope.deck);

        if (election) {
            angular.forEach($scope.deck,function(card){
                if ((card.ballot) && (card.ballot.choices)){
                    ballotMap[card.id] = card.ballot.choices.concat();
                }
            });
            BallotService.init(election,ballotMap);
        }

        c($scope, 'players', function() {
            return this.deck.slice(0, (this.currentIndex + 3));
        }, ['currentIndex', 'deck']);
        c($scope, 'tocCards', function() {
            return this.deck.filter(function(card) {
                return !card.ad || card.sponsored;
            });
        }, ['deck']);
        c($scope, 'tocIndex', function() {
            return this.tocCards.indexOf(this.currentCard);
        }, ['currentCard', 'tocCards.length']);
        $scope.showTOC          = false;
        $scope.currentIndex     = -1;
        $scope.currentCard      = null;
        $scope.atHead           = null;
        $scope.atTail           = null;
        $scope.currentReturns   = null;
        $scope.ready            = false;
        c($scope, 'prevThumb', function() {
            var index = this.currentIndex - 1,
                card;

            for ( ; index > -1; index--) {
                card = this.deck[index];

                if (isAd(card)) { continue; }

                return (card || null) && card.thumbs.small;
            }

            return null;
        }, ['currentIndex']);
        c($scope, 'nextThumb', function() {
            var index = this.currentIndex + 1,
                length = this.deck.length,
                card;

            for ( ; index < length; index++) {
                card = this.deck[index];

                if (isAd(card)) { continue; }

                return (card || null) && card.thumbs.small;
            }

            return null;
        }, ['currentIndex']);
        c($scope, 'dockNav', function() {
            var card = this.currentCard,
                type = card && card.type;

            switch (type) {
                case 'video':
                case 'vast':
                case 'youtube':
                case 'dailymotion':
                case 'vimeo':
                    return false;
                default:
                    return true;
            }
        }, ['currentCard.type']);
        $scope.nav = {
            enabled: true,
            wait: null
        };

        $scope.$on('<ballot-vote-module>:vote', function(event,vote){
            var label;
            if ($scope.currentCard) {
                if (($scope.currentCard.ballot) && ($scope.currentCard.ballot.choices)){
                    label = $scope.currentCard.ballot.choices[vote];
                }
                self.trackVideoEvent($scope.currentCard.player,'Vote',label);
            }
        });

        $scope.$on('playerAdd',function(event,player){
            $log.log('Player added: %1 - %2',player.getType(),player.getVideoId());
            var card = self.findCardByVideo(player.getType(),player.getVideoId());

            if (!card){
                $log.error('Unable to locate item for player.');
                return;
            }

            card.player = player;

            player.on('ready',function(){
                $log.log('Player ready: %1 - %2',player.getType(),player.getVideoId());
                self.checkReady();
                player.removeListener('ready',this);
            });

            player.on('play', function(){
                self.startVideoTracking();
                self.trackVideoEvent(player,'Play');
            });
            
            player.on('pause', function(){
                self.stopVideoTracking();
                self.trackVideoEvent(player,'Pause');
            });
            
            player.on('ended', function(){
                self.stopVideoTracking();
                self.trackVideoEvent(player,'End');
            });
        });

        $scope.$on('<mr-card>:contentEnd', function(event, card) {
            if ($scope.currentCard === card) {
                self.goForward();
            }
        });

        $scope.$on('<vast-card>:init', handleAdInit);
        $scope.$on('<vpaid-card>:init', handleAdInit);

        $scope.$on('<recap-card>:jumpTo', function(event, index) {
            self.setPosition(index);
        });

        cinema6.getSession().then(function(session) {
            // When the RumbleController is loaded we need to set up
            // some listeners for messages from above (ie. the parent window).
            // All of the incoming instructions will update the current experience
            // and will NOT reload the page!
            //
            // we can be instructed to do a few things:
            // 1. update the experience
            // 2. go to a specific card
            // 3. start the experience from the beginning
            //
            // we are also going to check with our parent
            // to see if there's a card that we're supposed to go to
            // a specific card, since it's possible that the user was 
            // looking at something but wanted to change the mode,
            // which does require a reload

            function getCard(card) {
                return $scope.deck.filter(function(c) {
                    return c.id === card.id;
                })[0];
            }

            session.on('mrPreview:updateExperience', function(experience) {
                // we're being sent a new experience
                // so we update the deck
                $scope.deck = MiniReelService.createDeck(experience.data);
            });

            session.on('mrPreview:jumpToCard', function(card) {
                // we're being told to go to a specific card,
                // so if we're at the splash page then emit reelStart
                // otherwise, just jump to the card

                if($scope.currentIndex === -1) {
                    $scope.$emit('reelStart');
                }

                if (appData.behaviors.fullscreen) {
                    cinema6.fullscreen(true);
                }

                self.jumpTo(getCard(card));
            });

            session.on('mrPreview:reset', function() {
                // we're being told to reset the MR player
                // so we set the position to -1
                // which will load the splash page
                self.setPosition(-1);
            });

            session.request('mrPreview:getCard').then(function(card) {
                // when the player loads we ask
                // if there's a card to jumpTo
                if(card) {
                    // we'll have a card when a user
                    // was previewing a specific card
                    // and chose to change the mode,

                    if($scope.currentIndex === -1) {
                        $scope.$emit('reelStart');
                    }

                    if (appData.behaviors.fullscreen) {
                        cinema6.fullscreen(true);
                    }

                    self.jumpTo(getCard(card));
                }
            });
        });

        this.findCardByVideo = function(videoType,videoId){
            var result;
            $scope.deck.some(function(item){
                if (item.type !== videoType){
                    return false;
                }

                if (item.data.videoid !== videoId){
                    return false;
                }

                result = item;
                return true;
            });

            return result;
        };

        this.checkReady = function(){
            if ($scope.ready){
                return;
            }

            var result = true;
            $scope.players.some(function(item){
                if ((!item.player) || (!item.player.isReady())){
                    result = false;
                    return true;
                }
            });

            $scope.ready = result;

            if ($scope.ready){
                $log.info('MiniReel Player is ready!');
                $timeout.cancel(readyTimeout);
            }
        };

        this.startVideoTracking = function(){
            if (cancelTrackVideo === null) {
                $log.info('Start video tracking');
                cancelTrackVideo = $interval(function(){
                    self.trackVideoProgress();
                }, 1000);
            }
        };

        this.stopVideoTracking = function(){
            if (cancelTrackVideo !== null){
                $log.info('Stop video tracking');
                $interval.cancel(cancelTrackVideo);
                cancelTrackVideo = null;
            }
        };

        this.trackNavEvent = function(action,label){
            tracker.trackEvent(this.getTrackingData({
                category : 'Navigation',
                action   : action,
                label    : label
            }));
        };

        this.trackVideoEvent = function(player,eventName,eventLabel){
            var currentCard = $scope.currentCard;
            if ((!currentCard) || (!currentCard.player)){
                return;
            }

            if (player !== currentCard.player){
                return;
            }

            if (currentCard.type === 'ad'){
                tracker.trackEvent(this.getTrackingData({
                    category        : 'Ad',
                    action          : eventName,
                    label           : eventLabel || 'ad',
                    videoSource     : 'ad',
                    videoDuration   : Math.round(player.duration)
                }));
                return;
            }

            tracker.trackEvent(this.getTrackingData({
                category        : 'Video',
                action          : eventName,
                label           : eventLabel || player.webHref,
                videoSource     : player.source || player.type,
                videoDuration   : Math.round(player.duration)
            }));
        };

        this.trackVideoProgress = function(){
            var currentCard = $scope.currentCard, playedPct, currentTime, duration, quartile;
            if ((!currentCard) || (!currentCard.player)){
                return;
            }

            if (!currentCard.tracking){
                currentCard.tracking = {
                    quartiles : [ false, false, false, false ]
                };
            }

            currentTime = currentCard.player.currentTime;
            duration    = currentCard.player.duration;

            if (currentTime >= duration){
                playedPct = 1;
            } else
            if (!duration){
                playedPct = 0;
            } else {
                playedPct = (Math.round(( currentTime / duration) * 100) / 100);
            }

            quartile = (function(pct){
                if (pct >= 0.95) {
                    return 3;
                } else
                if (pct >= 0.75){
                    return 2;
                } else
                if (pct >= 0.5){
                    return 1;
                } else
                if (pct >= 0.25){
                    return 0;
                }
                return -1;
            }(playedPct));

            if ((quartile >= 0) && (!currentCard.tracking.quartiles[quartile])) {
                this.trackVideoEvent( currentCard.player,'Quartile ' + (quartile + 1));
                currentCard.tracking.quartiles[quartile] = true;
            }
        };
        
        this.getTrackingData = function(params){
            params = params || {};
            params.page  = '/mr/' + appData.experience.id + '/';
            params.title = appData.experience.data.title;
           
            params.slideIndex = $scope.currentIndex;
            if ($scope.currentCard){
                params.page  += $scope.currentCard.id;
                params.title += ' - ' + $scope.currentCard.title;
                params.slideId = $scope.currentCard.id;
                params.slideTitle = $scope.currentCard.title;
            } else {
                params.slideId = 'null';
                params.slideTitle = 'null';
            }

            return params;
        };

        this.setPosition = function(i){
            $log.info('setPosition: %1',i);

            if ($scope.$emit('positionWillChange', i).defaultPrevented) {
                return;
            }

            $scope.currentIndex   = MasterDeckCtrl.currentIndex;
            $scope.currentCard    = MasterDeckCtrl.currentCard;

            $log.info('Now on card:',$scope.currentCard);

            $scope.$emit('positionDidChange', $scope.currentIndex);
        };

        this.jumpTo = function(card) {
            this.setPosition($scope.deck.indexOf(card));
        };

        this.start = function() {
            this.goForward();
            this.trackNavEvent('Start','Start');
            if (appData.behaviors.fullscreen) {
                cinema6.fullscreen(true);
            }
        };

        this.goTo   = function(idx,src){
            self.setPosition(idx);
            this.trackNavEvent('Skip',src || 'auto');
        };

        this.goBack = function(src){
            self.setPosition($scope.currentIndex - 1);
            this.trackNavEvent('Previous',src || 'auto');
        };

        this.goForward = function(src){
            self.setPosition($scope.currentIndex + 1);
            this.trackNavEvent('Next',src || 'auto');
        };

        readyTimeout = $timeout(function(){
            $log.warn('Not all players are ready, but proceding anyway!');
            $scope.ready = true;
        }, 3000);

        $scope.$on('$destroy',function(){
            $log.info('I am slain!');
            self.stopVideoTracking();
        });

        $scope.$on('analyticsReady',function(){
            $log.info('Analytics are ready, finish tracker setup.');
            tracker.alias({
                'category'      : 'eventCategory',
                'action'        : 'eventAction',
                'label'         : 'eventLabel',
                'expMode'       : 'dimension1',
                'expId'         : 'dimension2',
                'expTitle'      : 'dimension3',
                'expVersion'    : 'dimension10',
                'href'          : 'dimension11',
                'slideCount'    : 'dimension4',
                'slideId'       : 'dimension5',
                'slideTitle'    : 'dimension6',
                'slideIndex'    : 'dimension7',
                'videoDuration' : 'dimension8',
                'videoSource'   : 'dimension9'
            });
            tracker.set({
                'expMode'    : appData.mode,
                'expId'      : appData.experience.id,
                'expVersion' : appData.experience.versionId,
                'expTitle'   : appData.experience.data.title,
                'href'       : c6Defines.kHref,
                'slideCount' : $scope.deck.length
            });
//            tracker.trackPage(self.getTrackingData());
        });

        $scope.$on('shouldStart', function() {
            if ($scope.currentIndex < 0) {
                self.start();
            }
        });

        $scope.$on('positionDidChange', function(event, i) {
            if (i >= 0) {
                tracker.trackPage(self.getTrackingData());
            }
        });

        $log.log('Rumble Controller is initialized!');

    }])

    .controller('DeckController', ['$scope','c6EventEmitter','c6AppData',
    function                      ( $scope , c6EventEmitter , c6AppData ) {
        var self = this,
            adCount = 0,
            videoAdConfig = c6AppData.experience.data.adConfig.video,
            videoDeck, adDeck;

        function AdCard(config) {
            this.id = 'rc-advertisement' + (++adCount);
            this.type = 'ad';
            this.ad = true;
            this.modules = ['displayAd'];
            this.data = {
                autoplay: true,
                skip: config.skip,
                source: config.waterfall
            };
        }

        function Deck(id, config) {
            this.id = id;
            this.active = false;
            this.cards = [];
            this.index = -1;
            this.activeCard = null;

            forEach(config, function(value, prop) {
                this[prop] = value;
            }, this);

            c6EventEmitter(this);
        }
        Deck.prototype = {
            moveTo: function(card) {
                var index = this.cards.indexOf(card),
                    oldCard = this.activeCard;

                if (card && index < 0) {
                    return this.moveTo(null);
                }

                if (card === this.activeCard) {
                    this.index = index;
                    return this;
                }

                this.index = index;
                this.activeCard = this.cards[index] || null;

                if (card !== oldCard) {
                    this.emit('deactivateCard', oldCard);
                    this.emit('activateCard', this.activeCard);
                }

                return this;
            },
            activate: function() {
                var wasNotActive = !this.active;

                this.active = true;

                if (wasNotActive) {
                    this.emit('activate');
                }

                return this;
            },
            deactivate: function() {
                var wasActive = !!this.active;

                this.active = false;

                if (wasActive) {
                    this.emit('deactivate');
                }

                return this;
            },
            reset: function() {
                return this.moveTo(null);
            },
            pop: function() {
                if (this.index === this.cards.length - 1) {
                    throw new Error('The active card cannot be popped.');
                }

                return this.cards.pop();
            },
            push: function() {
                return this.cards.push.apply(this.cards, arguments);
            },
            shift: function() {
                var currentCard = this.cards[this.index],
                    firstCard;

                if (this.index === 0) {
                    throw new Error('The active card cannot be shifted.');
                }

                firstCard = this.cards.shift();
                this.moveTo(currentCard);
                return firstCard;
            },
            update: function(cards) {
                if (cards.length < 1) {
                    return;
                }

                this.cards.length = 0;
                this.cards.push.apply(this.cards, cards);
                this.moveTo(this.activeCard);
            }
        };

        videoDeck = new Deck('video', {
            includeCard: function(card) {
                return !card.ad;
            },
            findCard: function(card) {
                return card &&
                    (this.cards.indexOf(card) > -1 ? card : undefined);
            }
        });
        adDeck = new Deck('ad', {
            includeCard: function() {
                return false;
            },
            findCard: function(card) {
                var result = (card || undefined) &&
                    card.ad ? this.cards[this.index + 1] : undefined;

                if (result) {
                    result.meta = card;
                }

                return result;
            }
        });

        this.decks = [videoDeck, adDeck];

        adDeck.on('deactivateCard', function(card) {
            if (!card) { return; }

            adDeck.shift();
        });

        $scope.$on('onDeck', function() {
            adDeck.cards.push(new AdCard(videoAdConfig));
        });

        $scope.$watchCollection('deck', function(master) {
            if (!master) { return; }

            self.decks.forEach(function(deck) {
                deck.update(master.filter(deck.includeCard));
            });
        });

        $scope.$watch('currentCard', function(currentCard) {
            self.decks.forEach(function(deck) {
                var card;

                /* jshint boss:true*/
                if (card = deck.findCard(currentCard)) {
                /* jshint boss:false*/
                    deck.activate()
                        .moveTo(card);
                } else {
                    deck.deactivate();

                    if (card === null) {
                        deck.moveTo(null);
                    }
                }
            });
        });
    }])

    .directive('navbarButton', ['assetFilter','c6Computed',
    function                   ( assetFilter , c6Computed ) {
        return {
            restrict: 'E',
            templateUrl: assetFilter('directives/navbar_button.html', 'views'),
            scope: {
                index: '=',
                currentIndex: '=',
                card: '=',
                disableWhen: '&',
                onSelect: '&'
            },
            link: function(scope) {
                var c = c6Computed(scope);

                c(scope, 'thumb', function() {
                    var thumbs = this.card.thumbs,
                        thumb = thumbs && thumbs.small;

                    return thumb ? ('url(' + thumb + ')') : '';
                }, ['card.thumbs.small']);

                c(scope, 'active', function() {
                    return !!((this.currentIndex === this.index) || this.hover);
                }, ['currentIndex', 'index', 'hover']);
            }
        };
    }])
    .controller('VideoEmbedCardController', ['$scope','ModuleService','ControlsService','EventService','c6AppData','c6ImagePreloader', 'AdTechService',
    function                                ( $scope , ModuleService , ControlsService , EventService , c6AppData , c6ImagePreloader ,  AdTechService ) {
        var self = this,
            config = $scope.config,
            profile = $scope.profile,
            _data = config._data = config._data || {
                playerEvents: {},
                textMode: true,
                modules: {
                    ballot: {
                        ballotActive: false,
                        resultsActive: false,
                        vote: null
                    },
                    displayAd: {
                        active: false
                    }
                }
            },
            player = null,
            shouldPlay = false,
            ballotTargetPlays = 0,
            resultsTargetPlays = 0;

        Object.defineProperties(this, {
            flyAway: {
                get: function() {
                    var ballot = $scope.config._data.modules.ballot,
                        behaviors = c6AppData.behaviors;

                    if (!$scope.active) { return true; }

                            /* If we have a ballot:  If the ballot is being show.   If the results are a modal and they're being shown. */
                    return (this.hasModule('ballot') && (ballot.ballotActive || (ballot.resultsActive && !behaviors.inlineVoteResults))) ||
                        /* If there is a separate view for text, and if that mode is active: */
                        (behaviors.separateTextView && _data.textMode) ||
                        /* If this is a click-to-play minireel, it hasn't been played yet and the play button is enabled */
                        (!c6AppData.experience.data.autoplay && !(_data.playerEvents.play || {}).emitCount && this.enablePlayButton);
                }
            },
            showPlay: {
                get: function() {
                    return !!player && player.paused;
                }
            }
        });

        this.enablePlayButton = (config.type !== 'dailymotion') &&
            !profile.touch &&
            !c6AppData.experience.data.autoplay;

        this.videoUrl = null;

        this.experienceTitle = c6AppData.experience.data.title;

        this.hasModule = ModuleService.hasModule.bind(ModuleService, config.modules);

        this.playVideo = function() {
            player.play();
        };

        this.dismissBallot = function() {
            ballotTargetPlays = _data.playerEvents.play.emitCount;
        };

        this.dismissBallotResults = function() {
            resultsTargetPlays = _data.playerEvents.play.emitCount;
        };

        this.showText = function() {
            player.pause();
            _data.textMode = true;
        };

        this.hideText = function() {
            if (profile.autoplay) {
                player.play();
            }

            _data.textMode = false;
        };

        $scope.$on('playerAdd', function(event, iface) {
            player = iface;

            _data.playerEvents = EventService.trackEvents(iface, ['play']);

            Object.defineProperties(_data.modules.ballot, {
                ballotActive: {
                    configurable: true,
                    get: function() {
                        var playing = (!iface.paused && !iface.ended),
                            voted = angular.isNumber(_data.modules.ballot.vote),
                            hasPlayed = _data.playerEvents.play.emitCount > ballotTargetPlays;

                        return !voted && !playing && hasPlayed;
                    }
                },
                resultsActive: {
                    get: function() {
                        var playing = (!iface.paused && !iface.ended),
                            voted = angular.isNumber(this.vote),
                            hasPlayed = _data.playerEvents.play.emitCount > resultsTargetPlays;

                        if (c6AppData.behaviors.inlineVoteResults) {
                            return voted;
                        }

                        return voted && !playing && hasPlayed;
                    }
                }
            });

            iface
                .once('ready', function() {
                    self.videoUrl = player.webHref;
                    if (shouldPlay){
                        iface.play();
                    }
                })
                .once('play', function() {
                    _data.modules.displayAd.active = true;
                })
                .on('ended', function() {
                    if (!self.hasModule('ballot')) {
                        $scope.$emit('<mr-card>:contentEnd', config.meta || config);
                    }
                });

            $scope.$watch('active', function(active, wasActive) {
                if ((active === wasActive) && (wasActive === false)){ return; }

                if (active) {
                    ControlsService.bindTo(player);

                    if (c6AppData.behaviors.canAutoplay &&
                        c6AppData.profile.autoplay &&
                        c6AppData.experience.data.autoplay) {

                        shouldPlay = true;
                        iface.play();
                    }

                    self.dismissBallot();
                    self.dismissBallotResults();

                    if(self.hasModule('displayAd')) {
                        // TODO: need to replace 'waterfall' with 1 of the 8 ad modes,
                        // ie. C6 w/ publisher fallback, Publisher only, etc.
                        AdTechService.loadAd(config);
                    }

                } else {
                    if (_data.modules.ballot.ballotActive) {
                        _data.modules.ballot.vote = -1;
                    }

                    shouldPlay = false;
                    iface.pause();
                }
            });

        });

        $scope.$watch('onDeck', function(onDeck) {
            if (onDeck && config.thumbs) {
                c6ImagePreloader.load([config.thumbs.large]);
            }
        });

        $scope.$watch('config._data.modules.ballot.vote', function(vote, prevVote) {
            if (vote === prevVote) { return; }

            self.showText();
        });

        $scope.$watch('config._data.textMode', function(textMode, wasTextMode) {
            if (textMode === wasTextMode) { return; }

            self.dismissBallot();
        });
    }])
    .directive('mrCard',['$log','$compile','$window','c6UserAgent','InflectorService',
    function            ( $log , $compile , $window , c6UserAgent , InflectorService ){
        $log = $log.context('<mr-card>');
        function fnLink(scope,$element){
            var canTwerk = false,/*(function() {
                    if ((c6UserAgent.app.name !== 'chrome') &&
                        (c6UserAgent.app.name !== 'firefox') &&
                        (c6UserAgent.app.name !== 'safari')) {

                        $log.warn('Twerking not supported on ' + c6UserAgent.app.name);
                        return false;
                    }

                    if (!scope.profile.multiPlayer || !scope.profile.autoplay){
                        $log.warn('Item cannot be twerked, device not multiplayer or autoplayable.');
                        return false;
                    }

                    return true;
                }()),*/
                type = scope.config.type,
                data = scope.config.data;

            var dasherize = InflectorService.dasherize.bind(InflectorService);

            $log.info('link:',scope);

            var inner = '<' + dasherize(type) + '-card';
            for (var key in data){
                if ((key !== 'type') && (data.hasOwnProperty(key))){
                    inner += ' ' + key.toLowerCase() + '="' + data[key] + '"';
                }
            }

            if (!scope.profile.inlineVideo){
                $log.info('Will need to regenerate the player');
                inner += ' regenerate="1"';
            }

            if (canTwerk) {
                $log.info('DAYUM! ' + c6UserAgent.app.name + ' can tweeeerrrrrk!');
                inner += ' twerk="1"';
            }

            if (scope.profile.autoplay){
                $log.info(c6UserAgent.app.name + ' can autoplay videos.');
                inner += ' autoplay="1"';
            }

            if (scope.profile.device === 'phone') {
                $log.info(c6UserAgent.device.name + ' is a phone. Using embeded controls.');
                inner += ' controls="1"';
            }

            inner += '></'  + dasherize(type) + '-card' + '>';

            $element.append($compile(inner)(scope));
        }

        return {
            restrict : 'E',
            link     : fnLink,
            scope    : {
                current : '=',
                config  : '=',
                profile : '=',
                active  : '=',
                onDeck  : '=',
                number  : '@',
                total   : '@'
            }
        };

    }]);


}());
