(function() {
    'use strict';

    var isNumber = angular.isNumber,
        equals = angular.equals,
        copy = angular.copy,
        forEach = angular.forEach;

    angular.module('c6.mrmaker')
        .controller('EditorController', ['c6State','$scope','MiniReelService',
        function                        ( c6State , $scope , MiniReelService ) {
            var self = this,
                AppCtrl = $scope.AppCtrl;

            this.preview = false;
            this.editTitle = false;

            Object.defineProperties(this, {
                prettyMode: {
                    get: function() {
                        var categories = AppCtrl.config && AppCtrl.config.data.modes,
                            targetMode = this.model.mode;

                        return categories && (function() {
                            var result;

                            forEach(categories, function(category) {
                                forEach(category.modes, function(mode) {
                                    if (mode.value === targetMode) {
                                        result = mode.name;
                                    }
                                });
                            });

                            return result;
                        }());
                    }
                }
            });

            this.publish = function() {
                MiniReelService.publish(this.model);
            };

            this.makePrivate = function() {
                MiniReelService.unpublish(this.model);
            };

            this.editCard = function(card) {
                c6State.goTo('editor.editCard.copy', { cardId: card.id });
            };

            this.newCard = function(insertionIndex) {
                c6State.goTo('editor.newCard', { insertionIndex: insertionIndex });
            };

            this.deleteCard = function(card) {
                var deck = this.model.data.deck;

                deck.splice(deck.indexOf(card), 1);
            };

            this.previewMode = function(card) {
                self.preview = true;
                $scope.$broadcast('mrPreview:updateExperience', self.model, card);
            };

            this.closePreview = function() {
                this.preview = false;
            };

            $scope.$on('addCard', function(event, card, index) {
                self.model.data.deck.splice(index, 0, card);
            });

            $scope.$on('updateCard', function(event, cardProxy) {
                var card = self.model.data.deck.filter(function(card) {
                    return card.id === cardProxy.id;
                })[0];

                copy(cardProxy, card);
            });
        }])

        .controller('EditCardController', ['$scope','c6Computed','c6State','VideoService',
        function                          ( $scope , c6Computed , c6State , VideoService ) {
            var c = c6Computed($scope);

            VideoService.createVideoUrl(c, this, 'EditCardCtrl');

            this.save = function() {
                $scope.$emit('updateCard', this.model);

                c6State.goTo('editor');
            };
        }])

        .controller('NewCardController', ['$scope','c6State','c6StateParams','MiniReelService',
        function                         ( $scope , c6State , c6StateParams , MiniReelService ) {
            this.type = 'video';

            this.edit = function() {
                MiniReelService.setCardType(this.model, this.type);

                $scope.$emit('addCard', this.model, c6StateParams.insertionIndex);
                c6State.goTo('editor.editCard.copy', { cardId: this.model.id });
            };
        }])

        .controller('PreviewController',['$scope','MiniReelService','postMessage','c6BrowserInfo',
        function                        ( $scope , MiniReelService , postMessage , c6BrowserInfo ) {
            var self = this,
                profile,
                card;

            // set a default device mode
            this.device = 'desktop';

            // set a profile based on the current browser
            // this is needed to instantiate a player
            profile = c6BrowserInfo.profile;

            // override the device setting for previewing
            profile.device = this.device;

            $scope.$on('mrPreview:initExperience', function(event, experience, session) {
                // convert the MRinator experience to a MRplayer experience
                experience = MiniReelService.convertForPlayer(experience);

                // add the converted experience to the session for comparing later
                session.experience = copy(experience);

                // add the listener for 'handshake' request
                // we aren't using once() cuz the MR player
                // will be calling for this every time we change modes
                session.on('handshake', function(data, respond) {
                    respond({
                        success: true,
                        appData: {
                            // this will send the most updated experience
                            // whenever the MR player is (re)loaded
                            experience: experience,
                            profile: profile
                        }
                    });
                });

                // add a listener for the 'getCard' request.
                // when a user is previewing a specific card
                // we remember it, and if they change the mode
                // and the app reloads, it's going to call back
                // and see if it still needs to go to that card
                session.on('mrPreview:getCard', function(data, respond) {
                    respond(card);
                });

                // register another listener within the init handler
                // this will share the session
                $scope.$on('mrPreview:updateExperience', function(event, experience, newCard) {
                    // the EditorCtrl $broadcasts the most up-to-date experience model
                    // when the user clicks 'preview'.
                    // it may have a newCard to go to

                    // we convert the experience
                    experience = MiniReelService.convertForPlayer(experience);

                    // if it's been changed or we're previewing a specific card
                    // then we ping the player
                    // and send the updated experience
                    // the MRplayer is listening in the RumbleCtrl
                    // and will update the deck
                    if(!equals(experience, session.experience)) {
                        session.ping('mrPreview:updateExperience', experience);
                    }

                    if(newCard) {
                        card = MiniReelService.convertCard(newCard);
                        session.ping('mrPreview:jumpToCard', card);
                    } else {
                        session.ping('mrPreview:reset');
                    }
                });

                $scope.$watch(function() {
                    return self.device;
                }, function(newDevice, oldDevice) {
                    if(newDevice === oldDevice) { return; }

                    profile.device = newDevice;

                    // ping the MR player
                    // sending 'updateMode' will trigger a refresh
                    // and the player will call for another handshake
                    // and will call for a specific card
                    // in case we're previewing that card
                    session.ping('mrPreview:updateMode');
                });
            });
        }])

        .directive('mrPreview', ['postMessage',
        function                ( postMessage ) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var iframe,
                        session;

                    scope.$watch(attrs.mrPreview, function(experience) {
                        if(experience) {
                            // store the MR player window
                            iframe = element.prop('contentWindow');

                            // create a postMessage session (as defined in c6ui.postMessage)
                            session = postMessage.createSession(iframe);

                            scope.$emit('mrPreview:initExperience', experience, session);
                        }
                    });
                }
            };
        }])

        .directive('videoTrimmer', ['c6UrlMaker','$window','c6Debounce','$q',
        function                   ( c6UrlMaker , $window , c6Debounce , $q ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_trimmer.html'),
                scope: {
                    duration: '@',
                    currentTime: '=',
                    start: '=',
                    end: '=',
                    onStartScan: '&',
                    onEndScan: '&'
                },
                link: function(scope, $element) {
                    var DragCtrl = $element.children('div').data('cDragCtrl'),
                        startMarker = $element.find('#start-marker').data('cDrag'),
                        endMarker = $element.find('#end-marker').data('cDrag'),
                        seekBar = $element.find('#seek-bar').data('cDragZone'),
                        currentScanDeferred = null,
                        notifyProgress = c6Debounce(function(args) {
                            var value = args[0],
                                scopeProp = args[1];

                            currentScanDeferred.notify(value);
                            scope[scopeProp + 'Stamp'] = secondsToTimestamp(value);
                        }, 250);

                    function start() {
                        return scope.start || 0;
                    }

                    function end() {
                        return isNumber(scope.end) ? scope.end : scope.duration;
                    }

                    function secondsToTimestamp(seconds) {
                        var minutes = Math.floor(seconds / 60);
                        seconds = Math.floor(seconds - (minutes * 60));

                        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
                    }

                    function positionToValue(rect, prop) {
                        var pxMoved = rect.left - seekBar.display.left,
                            total = seekBar.display.width;

                        if (prop === 'end') {
                            pxMoved += rect.width;
                        }

                        return ((pxMoved * scope.duration) / total);
                    }

                    function scopePropForMarker(marker) {
                        return marker.id.replace(/-marker$/, '');
                    }

                    function constrain(marker, desired) {
                        switch (marker.id) {
                        case 'start-marker':
                            endMarker.refresh();

                            return Math.max(
                                Math.min(
                                    desired.left,
                                    endMarker.display.left
                                ),
                                seekBar.display.left
                            );

                        case 'end-marker':
                            return Math.max(
                                Math.min(
                                    desired.left,
                                    seekBar.display.right - desired.width
                                ),
                                startMarker.display.left
                            );
                        }
                    }

                    function begin(marker) {
                        var scopeProp = scopePropForMarker(marker),
                            methodBit = scopeProp.substring(0, 1).toUpperCase() +
                                scopeProp.substring(1);

                        currentScanDeferred = $q.defer();

                        scope['on' + methodBit + 'Scan']({
                            promise: currentScanDeferred.promise
                        });
                    }

                    function beforeMove(marker, event) {
                        var $marker = marker.$element,
                            desired = event.desired,
                            position = constrain(marker, desired),
                            scopeProp = scopePropForMarker(marker);

                        event.preventDefault();

                        $marker.css({
                            left: position + 'px'
                        });

                        notifyProgress(
                            positionToValue(
                                desired,
                                scopeProp
                            ),
                            scopeProp
                        );
                    }

                    function dropStart(marker) {
                        var scopeProp = scopePropForMarker(marker);

                        scope[scopeProp] = positionToValue(marker.display, scopeProp);
                        currentScanDeferred.resolve(scope[scopeProp]);

                        marker.$element.css('top', '');
                    }

                    scope.startStamp = secondsToTimestamp(start());
                    scope.endStamp = secondsToTimestamp(end());

                    scope.position = {};
                    Object.defineProperties(scope.position, {
                        startMarker: {
                            get: function() {
                                return ((scope.start * seekBar.display.width) /
                                    scope.duration) + 'px';
                            }
                        },
                        endMarker: {
                            get: function() {
                                if (DragCtrl.currentDrags[0] === endMarker) {
                                    return endMarker.display.left + 'px';
                                }

                                endMarker.refresh();

                                return ((end() * seekBar.display.width) /
                                    scope.duration) - endMarker.display.width + 'px';
                            }
                        },
                        playhead: {
                            get: function() {
                                return ((scope.currentTime * 100) / scope.duration) + '%';
                            }
                        }
                    });

                    [startMarker, endMarker].forEach(function(marker) {
                        marker.on('begin', begin)
                            .on('beforeMove', beforeMove)
                            .on('dropStart', dropStart);
                    });

                    scope.$watch(start, function(start) {
                        scope.startStamp = secondsToTimestamp(start);
                    });
                    scope.$watch(end, function(end) {
                        scope.endStamp = secondsToTimestamp(end);
                    });
                }
            };
        }])

        .directive('videoPreview', ['c6UrlMaker','$timeout',
        function                   ( c6UrlMaker , $timeout ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_preview.html'),
                scope: {
                    service: '@',
                    videoid: '@',
                    start: '=',
                    end: '='
                },
                link: function(scope, $element) {
                    function controlVideo($video) {
                        var video = $video.data('video'),
                            startScanTime = null;

                        function start() {
                            return scope.start || 0;
                        }
                        function end() {
                            return scope.end || Infinity;
                        }

                        function handleEvents() {
                            video.on('timeupdate', function timeupdate() {
                                    var startTime = start(),
                                        endTime = end();

                                    if (isNumber(startScanTime)) {
                                        return;
                                    }

                                    if (video.currentTime < (startTime - 1)) {
                                        video.currentTime = startTime;
                                    }

                                    if (video.currentTime >= endTime) {
                                        video.pause();
                                    }
                                })
                                .on('playing', function playing() {
                                    if (video.currentTime >= end()) {
                                        video.currentTime = start();
                                    }
                                });

                            scope.video = video;
                        }

                        function scan(time) {
                            if (video.readyState < 3) {
                                video.play();
                            }

                            if (video.readyState > 0) {
                                video.currentTime = time;
                            }
                        }

                        function finishScan() {
                            video.currentTime = startScanTime;

                            startScanTime = null;
                        }

                        if (!video) { return; }

                        scope.onMarkerSeek = function(promise) {
                            startScanTime = video.currentTime;

                            promise.then(finishScan, null, scan);
                        };

                        Object.defineProperties(scope, {
                            currentTime: {
                                configurable: true,
                                get: function() {
                                    if (isNumber(startScanTime)) {
                                        return startScanTime;
                                    }

                                    return video.currentTime;
                                }
                            }
                        });

                        video.once('ready', handleEvents);
                    }


                    scope.$watch('videoid', function(id) {
                        if (!id) { return; }

                        $timeout(function() {
                            controlVideo($element.find('div *'));
                        });
                    });
                }
            };
        }]);
}());
