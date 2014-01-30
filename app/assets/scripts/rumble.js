(function(){
    'use strict';

    angular.module('c6.rumble')
    .animation('.splash-screen',[function(){
        return {
            leave: function(element,className,done){
                element.fadeOut(2000, done);
            }
        };
    }])
    .animation('.player-list-item',['$log', function($log){
        $log = $log.context('.player-list-item');
        return {
            beforeAddClass: function(element,className,done) {
                $log.log('addClass setup:',className);
                element.css({ opacity : 1, visibility : 'visible' });
                $log.info('addClass start',className);
                element.animate({
                    opacity: 0
                }, 2000, function() {
                    $log.info('addClass end',className);
                    element.css('visibility','hidden');
                    done();
                });
            },
            removeClass: function(element,className,done) {
                $log.log('removeClass setup:',className);
                element.css({ opacity : 0, visibility : 'visible' });
                $log.info('removeClass start',className);
                element.animate({
                    opacity: 1
                }, 2000, function() {
                    $log.info('removeClass end',className);
                    done();
                });
            }
        };
    }])
    .factory('rumbleVotes',['$log','$q','$timeout',function($log,$q,$timeout){
        $log = $log.context('rumbleVotes');
        var service = {}, mocks = {},
            rumbleId = null;

        service.mockReturnsData = function(rumbleId,itemId,votes, delay){
            $log.warn('Setting Mock Data');
            if (mocks[rumbleId] === undefined){
                mocks[rumbleId] = {};
            }

            if (delay === undefined){
                delay = 1000;
            }

            mocks[rumbleId][itemId] = {
                'votes' : votes,
                'delay' : delay
            };

            return this;
        };

        service.init = function(id) {
            rumbleId = id;
        };

        service.getReturnsForItem = function(itemId){
            var deferred = $q.defer(), mock;
            if (mocks[rumbleId] === undefined){
                $timeout(function(){
                    deferred.reject(
                        new Error('Unable to locate rumble [' + rumbleId + ']')
                    );
                },250);
                return deferred.promise;
            }
            
            if (mocks[rumbleId][itemId] === undefined){
                $timeout(function(){
                    deferred.reject(
                        new Error('Unable to locate item [' + itemId + ']')
                    );
                },250);
                return deferred.promise;
            }
            
            mock = mocks[rumbleId][itemId];
            $timeout(function(){
                deferred.resolve(mock.votes);
            }, mock.delay);

            return deferred.promise;
        };

        return service;
    }])
    .service('MiniReelService', ['InflectorService', 'rumbleVotes',
    function                    ( InflectorService ,  rumbleVotes ) {
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

            angular.forEach(playlist, function(video) {
                resolve(video);

                //TODO: remove this when the service works for real
                rumbleVotes.mockReturnsData(data.id, video.id, video.voting);
                delete video.voting;

                video.state = {
                    vote: -1,
                    view: 'video'
                };
                video.player = null;
            });

            return playlist;
        };
    }])
    .controller('RumbleController',['$log','$scope','$timeout','rumbleVotes','c6Computed','cinema6','MiniReelService',
    function                       ( $log , $scope , $timeout , rumbleVotes , c          , cinema6 , MiniReelService ){
        $log = $log.context('RumbleCtrl');
        var self    = this, readyTimeout,
            appData = $scope.app.data;

        $scope.deviceProfile    = appData.profile;
        $scope.title            = appData.experience.title;

        $scope.deck             = MiniReelService.createDeck(appData.experience.data);
        $scope.players          = c($scope, function(index, deck) {
            return deck.slice(0, (index + 3));
        }, ['currentIndex', 'deck']);
        $scope.currentIndex     = -1;
        $scope.currentCard      = null;
        $scope.atHead           = null;
        $scope.atTail           = null;
        $scope.currentReturns   = null;
        $scope.ready            = false;

        rumbleVotes.init(appData.experience.data.id);

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

            player.on('ended', function() {
                card.state.view = 'ballot';
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
            $scope.players().some(function(item){
                if ((!item.player) || (!item.player.isReady())){
                    result = false;
                    return true;
                }
            });

            $scope.ready = result;

            if ($scope.ready){
                $timeout.cancel(readyTimeout);
            }
        };

        this.setPosition = function(i){
            $log.info('setPosition: %1',i);
            $scope.currentReturns = null;
            $scope.currentIndex   = i;
            $scope.currentCard    = $scope.deck[$scope.currentIndex];
            $scope.atHead         = $scope.currentIndex === 0;
            $scope.atTail         = ($scope.currentIndex === ($scope.deck.length - 1));

            if ($scope.atTail) {
                $scope.$emit('reelEnd');
            } else if ($scope.atHead) {
                $scope.$emit('reelStart');
            } else {
                $scope.$emit('reelMove');
            }
        };

        this.start = function() {
            this.goForward();
            cinema6.fullscreen(true);
        };

        this.goBack = function(){
            self.setPosition($scope.currentIndex - 1);
        };

        this.goForward = function(){
            self.setPosition($scope.currentIndex + 1);
        };

        readyTimeout = $timeout(function(){
            $log.warn('Not all players are ready, but proceding anyway!');
            $scope.ready = true;
        }, 3000);

        $log.log('Rumble Controller is initialized!');
    }])
    .directive('mrCard',['$log','$compile','$window','c6UserAgent','InflectorService',
    function            ( $log , $compile , $window , c6UserAgent , InflectorService ){
        $log = $log.context('<mr-card>');
        function fnLink(scope,$element){
            var canTwerk = (function() {
                    if ((c6UserAgent.app.name !== 'chrome') &&
                        (c6UserAgent.app.name !== 'firefox') &&
                        (c6UserAgent.app.name !== 'safari')) {

                        $log.warn('Twerking not supported on ' + c6UserAgent.app.name);
                        return false;
                    }

                    if (!scope.profile.multiPlayer){
                        $log.warn('Item cannot be twerked, device not multiplayer.');
                        return false;
                    }

                    return true;
                }()),
                type = scope.config.type,
                data = scope.config.data;

            var dasherize = InflectorService.dasherize.bind(InflectorService);

            $log.info('link:',scope);
            function resize(event,noDigest){
                var pw = Math.round($window.innerWidth * 1),
                    ph = Math.round(pw * 0.5625);
                /* $element.css({
                    width : pw,
                    height: ph
                }); */
                scope.playerWidth   = pw;
                scope.playerHeight  = ph;
                if(!noDigest){
                    scope.$digest();
                }
            }

            var inner = '<' + dasherize(type) + '-card';
            for (var key in data){
                if ((key !== 'type') && (data.hasOwnProperty(key))){
                    inner += ' ' + key.toLowerCase() + '="' + data[key] + '"';
                }
            }

            // inner += ' width="{{playerWidth}}" height="{{playerHeight}}"';

            if (!scope.profile.inlineVideo){
                $log.info('Will need to regenerate the player');
                inner += ' regenerate="1"';
            }

            if (canTwerk) {
                $log.info('DAYUM! ' + c6UserAgent.app.name + ' can tweeeerrrrrk!');
                inner += ' twerk="1"';
            }

            if (scope.profile.multiPlayer){
                $log.info(c6UserAgent.app.name + ' can autoplay videos.');
                inner += ' autoplay="1"';
            }

            inner += '></'  + dasherize(type) + '-card' + '>';

            $element.append($compile(inner)(scope));

            scope.$watch('onDeck', function(onDeck) {
                if (onDeck) { scope.$broadcast('onDeck'); }
            });
            scope.$watch('active', function(active) {
                if (active) { scope.$broadcast('active'); }
            });

            $window.addEventListener('resize',resize);
            resize({},true);
        }

        return {
            restrict : 'E',
            link     : fnLink,
            scope    : {
                config  : '=',
                profile : '=',
                active  : '=',
                onDeck  : '='
            }
        };

    }]);


}());
