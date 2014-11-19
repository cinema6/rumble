define (['angular','c6_defines','tracker',
         'cards/ad','cards/recap','cards/text','cards/display_ad',
         'cards/video',
         'modules/ballot','modules/companion_ad','modules/display_ad','modules/post'],
function( angular , c6Defines  , tracker ,
          adCard   , recapCard   , textCard   , displayAdCard    ,
          videoCard   ,
          ballotModule   , companionAdModule    , displayAdModule    , postModule   ) {

    'use strict';

    var forEach = angular.forEach,
        isDefined = angular.isDefined,
        extend = angular.extend,
        copy = angular.copy;

    return angular.module('c6.rumble.minireel', [
        tracker.name,
        // Cards
        adCard.name,
        recapCard.name,
        textCard.name,
        displayAdCard.name,
        videoCard.name,
        // Modules
        ballotModule.name,
        companionAdModule.name,
        displayAdModule.name,
        postModule.name
    ])
    .animation('.js-cardItem',['$log', function($log){
        $log = $log.context('.js-cardItem');
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
                }, 300, function() {
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
    .service('MiniReelService', ['InflectorService','VideoThumbService','$q',
                                 'c6ImagePreloader','envrootFilter','$injector',
    function                    ( InflectorService , VideoThumbService , $q ,
                                  c6ImagePreloader , envrootFilter , $injector ) {
        var MiniReelService = this;

        function isSet(value) {
            return isDefined(value) && value !== null;
        }

        this.getTrackingData = function(card, index, params) {
            var experience = $injector.get('c6AppData').experience;

            function ifCard(fn) {
                return card ? fn() : '';
            }

            return extend(copy(params || {}), {
                page: '/mr/' + experience.id + '/' + ifCard(function() { return card.id; }),
                title: experience.data.title + ifCard(function() { return ' - ' + card.title; }),
                slideIndex: index,
                slideId: ifCard(function() { return card.id; }) || 'null',
                slideTitle: ifCard(function() { return card.title; }) || 'null'
            });
        };

        this.createSocialLinks = function(links) {
            var social = ['Facebook', 'Pinterest', 'Twitter', 'YouTube', 'Vimeo'];

            return Object.keys(links || {})
                .filter(function(label) {
                    return social.indexOf(label) > -1;
                })
                .map(function(label) {
                    return {
                        label: label,
                        type: label.toLowerCase(),
                        href: links[label]
                    };
                });
        };

        this.createDeck = function(data) {
            var playlist = angular.copy(data.deck),
                autoplay = isSet(data.autoplay) ? data.autoplay : true,
                autoadvance = isSet(data.autoadvance) ? data.autoadvance : true;

            function fetchThumb(card) {
                switch (card.type) {
                case 'text':
                case 'recap':
                    (function() {
                        var splash = (data.collateral || {}).splash ?
                            envrootFilter(data.collateral.splash) :
                            null,
                            isBlob = (/^blob:/).test(splash),
                            thumb = isBlob ? splash : (splash + '?cb=' + Date.now());

                        card.thumbs = card.thumbs || (splash ? {
                            small: thumb,
                            large: thumb
                        } : null);
                    }());
                    break;
                default:
                    card.thumbs = card.thumbs || null;

                    $q.when(
                        card.thumbs || VideoThumbService.getThumbs(card.type, card.data.videoid)
                    ).then(function(thumbs) {
                        card.thumbs = thumbs;

                        if (thumbs.small) {
                            c6ImagePreloader.load([thumbs.small]);
                        }
                    });
                    break;
                }
            }

            function setWebHref(card) {
                card.webHref = (function() {
                    switch (card.type) {
                    case 'youtube':
                        return 'https://www.youtube.com/watch?v=' + card.data.videoid;
                    case 'vimeo':
                        return 'http://vimeo.com/' + card.data.videoid;
                    case 'dailymotion':
                        return 'http://www.dailymotion.com/video/' + card.data.videoid;
                    case 'embedded':
                        return (function() {
                            switch (card.data.service) {
                            case 'aol':
                                return 'http://on.aol.com/video/' + card.data.videoid;
                            case 'yahoo':
                                return 'https://screen.yahoo.com/' + card.data.videoid + '.html';
                            default:
                                return null;
                            }
                        }());
                    default:
                        return null;
                    }
                }());
            }

            function setSocial(card) {
                card.social = MiniReelService.createSocialLinks(card.links);
            }

            function setDefaults(card) {
                card.placementId = card.placementId || data.placementId;
                card.data.autoadvance = isSet(card.data.autoadvance) ?
                    card.data.autoadvance : autoadvance;
            }

            function setVideoDefaults(card) {
                if (!(/^(youtube|vimeo|dailymotion|adUnit|embedded)$/).test(card.type)) { return; }

                [
                    {
                        prop: 'autoplay',
                        default: autoplay
                    },
                    {
                        prop: 'skip',
                        default: true
                    }
                ].forEach(function(config) {
                    var prop = config.prop;

                    card.data[prop] = isSet(card.data[prop]) ?
                        card.data[prop] : config.default;
                });
            }

            angular.forEach(playlist, function(video) {
                [fetchThumb, setWebHref, setDefaults, setVideoDefaults, setSocial]
                    .forEach(function(fn) {
                        return fn(video);
                    });
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

        this.vote = function(id, choiceIndex, electionIdOverride) {
            function process() {
                return true;
            }

            if (!electionId && !electionIdOverride) {
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
                election: electionIdOverride || electionId,
                ballotItem: id,
                vote: choiceIndex
            }).then(process);
        };
    }])
    .controller('RumbleController',['$log','$scope','$interval','BallotService',
                                    'c6Computed','cinema6','MiniReelService','trackerService',
    function                       ( $log , $scope , $interval, BallotService ,
                                     c6Computed , cinema6 , MiniReelService , trackerService ) {
        var self = this,
            appData = $scope.app.data,
            experience = appData.experience,
            election = appData.experience.data.election,
            c = c6Computed($scope),
            tracker = trackerService('c6mr'),
            ballotMap = {},
            navController = null,
            MasterDeckCtrl;

        function MasterDeckController() {
            var index = null,
                self = this,
                adId = 0,
                adController,
                enableDynamicAds = checkForStaticAds();

            Object.defineProperties(self, {
                currentIndex: {
                    get: function() { return index; }
                },
                currentCard: {
                    get: function() { return $scope.deck[index] || null; }
                },
                videoAdConfig: {
                    get: function() { return appData.experience.data.adConfig.video; }
                }
            });

            adController = {
                adCount: 0,
                videoCount: 0
            };

            Object.defineProperties(adController, {
                firstPlacement: {
                    get: function() {
                        return self.videoAdConfig.firstPlacement;
                    }
                },
                frequency: {
                    get: function() {
                        return self.videoAdConfig.frequency;
                    }
                },
                shouldLoadAd: {
                    get: function() {
                        var zeroFreq = this.frequency === 0,
                            hasFirst = this.firstPlacement > -1,
                            nextIsFirst = (this.videoCount + 1 === this.firstPlacement),
                            nextMatchesFreq = ((this.videoCount + 1 - this.firstPlacement) % this.frequency === 0);

                        return enableDynamicAds && hasFirst && (nextMatchesFreq || (zeroFreq && nextIsFirst));
                    }
                },
                shouldPlayAd: {
                    get: function() {
                        var hasFreq = !!(this.frequency),
                            hasFirst = this.firstPlacement > -1,
                            isFirst = (this.videoCount === this.firstPlacement) && (this.adCount < 1),
                            adCountMatchesFreq = (this.adCount <= ((this.videoCount - this.firstPlacement) / this.frequency));

                        return enableDynamicAds && hasFirst && (isFirst || (hasFreq && adCountMatchesFreq));
                    }
                }
            });

            function AdCard(config) {
                this.id = 'rc-advertisement' + (++adId);
                this.type = 'ad';
                this.ad = true;
                this.modules = [];
                this.data = {
                    autoplay: true,
                    autoadvance: true,
                    skip: config.skip,
                    source: config.waterfall
                };
            }

            function checkForStaticAds() {
                return !$scope.deck.filter(function(card) {
                    return card.ad && card.id;
                }).length;
            }

            this.convertToCard = function(i) {
                var currentIndex = $scope.currentIndex,
                    isGoingForward = (i - currentIndex) > 0,
                    previousCard = $scope.deck[i + (isGoingForward ? -1 : 1)],
                    currentCard = $scope.currentCard,
                    nextCard = $scope.deck[i+1],
                    toCard = $scope.deck[i];

                index = i;

                if (currentCard && currentCard.ad && currentCard.dynamic) {
                    // only called when dynamic ads have been inserted
                    self.removeAd(currentCard);
                    if (isGoingForward) {
                        index = Math.max(0, index - 1);
                    }
                }

                if (nextCard && nextCard.ad && !nextCard.visited) {
                    // only called when static ads are used
                    self.adOnDeck();
                    nextCard.preloaded = true;
                }

                if (previousCard && previousCard.ad && !previousCard.visited) {
                    // this is also for showing static ads when skipping
                    // to a card before or after an ad
                    index = Math.max(0, index + (isGoingForward ? -1 : 1));
                    toCard = $scope.deck[index];
                }

                if (toCard && toCard.ad) {
                    if (toCard.visited) {
                        // skipping an ad that's already played
                        index = i + (isGoingForward ? 1 : -1);
                    } else if (!toCard.preloaded) {
                        // loading an ad card into the deck when a static ad
                        // is jumped to without getting the chance to preload
                        self.adOnDeck();
                    }
                }

                return {
                    currentIndex: index,
                    currentCard: $scope.deck[index] || null
                };
            };

            this.showAd = function() {
                $scope.deck.splice(index, 0, {
                    ad: true,
                    dynamic: true,
                    type: 'ad',
                    data: {
                        autoadvance: true
                    }
                });
                adController.adCount++;
            };

            this.removeAd = function(card) {
                $scope.deck.splice($scope.deck.indexOf(card), 1);
            };

            this.adOnDeck = function() {
                $scope.$broadcast('adOnDeck', new AdCard(self.videoAdConfig));
            };

            $scope.$watch('deck', function() {
                enableDynamicAds = checkForStaticAds();
            });

            $scope.$on('deckControllerReady', function() {
                if (adController.firstPlacement === 0 && enableDynamicAds) {
                    self.adOnDeck();
                }
            });

            $scope.$on('positionWillChange', function(event, i) {
                var toCard = $scope.deck[i] || null;

                if (toCard) {
                    if (!toCard.ad) {
                        if (adController.shouldLoadAd) {
                            self.adOnDeck();
                        }

                        if (adController.shouldPlayAd) {
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
                $scope.deck.forEach(function(card) {
                    card.visited = false;
                    if (card.preloaded) {
                        card.preloaded = false;
                    }
                });
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

        function getTrackingData(params) {
            return MiniReelService.getTrackingData($scope.currentCard, $scope.currentIndex, params);
        }

        $log = $log.context('RumbleCtrl');

        $scope.deviceProfile    = appData.profile;
        $scope.title            = experience.data.title;

        $scope.deck             = MiniReelService.createDeck(experience.data);

        MasterDeckCtrl = new MasterDeckController();

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
        $scope.ready            = true;
        c($scope, 'prevThumb', function() {
            var index = this.currentIndex - 1,
                card;

            for ( ; index > -1; index--) {
                card = this.deck[index];

                if (isAd(card)) { continue; }

                return (card || null) && (card.thumbs || {}).small || null;
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

                return (card || null) && (card.thumbs || {}).small || null;
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

        $scope.$on('<mr-card>:contentEnd', function(event, card) {
            if ($scope.currentCard === card && card.data.autoadvance) {
                self.goForward();
            }
        });

        $scope.$on('<mr-card>:init', function($event, provideNavController) {
            provideNavController(navController = new NavController($scope.nav));
        });

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

        this.moduleActive = function(module) {
            var modules = (($scope.currentCard || {}).modules || []);

            return modules.indexOf(module) > -1;
        };

        this.trackNavEvent = function(action,label){
            tracker.trackEvent(getTrackingData({
                category : 'Navigation',
                action   : action,
                label    : label
            }));
        };

        this.setPosition = function(i){
            var toCard = MasterDeckCtrl.convertToCard(i);

            if (toCard.currentIndex > $scope.deck.length - 1) { return; }

            $log.info('setPosition: %1', toCard.currentIndex);

            if ($scope.$emit('positionWillChange', toCard.currentIndex).defaultPrevented) {
                return;
            }

            $scope.currentIndex = MasterDeckCtrl.currentIndex;
            $scope.currentCard = MasterDeckCtrl.currentCard;

            $log.info('Now on card:', MasterDeckCtrl.currentCard);

            $scope.$emit('positionDidChange', MasterDeckCtrl.currentIndex);
        };

        this.jumpTo = function(card) {
            this.setPosition($scope.deck.indexOf(card));
        };

        this.start = function() {
            self.setPosition(0);
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
        });

        $scope.$on('shouldStart', function() {
            if ($scope.currentIndex < 0) {
                self.start();
            }
        });

        $scope.$on('positionDidChange', function(event, i) {
            var visited;

            if ($scope.currentCard){
                visited = !!$scope.currentCard.visited;
                $scope.currentCard.visited = true;
            }

            if ((i === 0) &&  (visited === false) ){
                // On the first card for the first time, reset the GA session.
                tracker.trackPage(getTrackingData({ sessionControl : 'start' }));
            } else
            if (i >= 0) {
                tracker.trackPage(getTrackingData());
            }
        });

        $log.log('Rumble Controller is initialized!');

    }])

    .filter('deck', [function() {
        var noopCards = [];

        return function(deck, index, buffer) {
            var first = index - buffer,
                last = index + buffer;

            return deck.map(function(card, index) {
                return (index >= first && index <= last) ?
                    card : (noopCards[index] || (noopCards[index] = {
                        type: 'noop'
                    }));
            });
        };
    }])

    .controller('DeckController', ['$scope','c6EventEmitter',
    function                      ( $scope , c6EventEmitter ) {
        var self = this,
            videoDeck, adDeck;

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

        $scope.$on('adOnDeck', function(event, card) {
            adDeck.push(card);
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

        $scope.$emit('deckControllerReady');
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

    .directive('mrCard',['$log','$compile','$window','c6UserAgent','InflectorService','c6AppData',
    function            ( $log , $compile , $window , c6UserAgent , InflectorService , c6AppData ){
        $log = $log.context('<mr-card>');
        function fnLink(scope,$element){
            var type = (function() {
                switch (scope.config.type) {
                case 'youtube':
                case 'vimeo':
                case 'dailymotion':
                case 'adUnit':
                case 'embedded':
                    return 'video';
                default:
                    return InflectorService.dasherize(scope.config.type);
                }
            }() + '-card');

            $log.info('link:',scope);

            scope.title = c6AppData.experience.data.title;

            scope.hasModule = function(module) {
                return scope.config.modules.indexOf(module) > -1;
            };

            $element.append($compile(['<', type, '></', type, '>'].join(''))(scope));
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
                nav     : '=',
                number  : '@',
                total   : '@'
            }
        };

    }]);
});
