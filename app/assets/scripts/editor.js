(function() {
    'use strict';

    var isNumber = angular.isNumber,
        jqLite = angular.element,
        equals = angular.equals,
        copy = angular.copy;

    angular.module('c6.mrmaker')
        .controller('EditorController', ['c6State','$scope','MiniReelService',
        function                        ( c6State , $scope , MiniReelService ) {
            var self = this;

            this.preview = false;
            this.editTitle = false;

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

            $scope.$on('addCard', function(event, card, index) {
                self.model.data.deck.splice(index, 0, card);
            });

            this.previewMode = function(card) {
                self.preview = true;
                $scope.$broadcast('mrPreview:updateExperience', self.model, card);
            };

            this.closePreview = function() {
                this.preview = false;
            };
        }])

        .controller('EditCardController', ['$scope','c6Computed','c6State','VideoService',
        function                          ( $scope , c6Computed , c6State , VideoService ) {
            var c = c6Computed($scope);

            VideoService.createVideoUrl(c, this, 'EditCardCtrl');

            this.close = function() {
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

        .controller('EmbedController', ['$scope','cinema6',
        function                       ( $scope , cinema6 ) {
            var self = this,
                EditorCtrl = $scope.EditorCtrl;

            this.modes = [
                {
                    name: 'Responsive Auto-fit *',
                    value: 'responsive'
                },
                {
                    name: 'Custom Size',
                    value: 'custom'
                }
            ];
            this.mode = this.modes[0].value;

            this.size = {
                width: 650,
                height: 522
            };

            this.c6EmbedSrc = null;
            cinema6.getAppData()
                .then(function setC6EmbedSrc(data) {
                    self.c6EmbedSrc = data.experience.data.c6EmbedSrc;
                });

            Object.defineProperties(this, {
                code: {
                    get: function() {
                        return '<script src="' +
                            this.c6EmbedSrc +
                            '" data-exp="' +
                            EditorCtrl.model.id +
                            '"' + (this.mode === 'custom' ?
                                (' data-width="' +
                                    this.size.width +
                                    '" data-height="' +
                                    this.size.height + '"') :
                                '') +
                            '></script>';
                    }
                }
            });
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
                        $$window = jqLite($window),
                        scanDeferred = null,
                        notifyScan = c6Debounce(function(args) {
                            var item = args[0];

                            scanDeferred.notify(markerValue(item));
                        }, 250);

                    function markerValue(marker) {
                        var pxTraveled = marker.display.center.x - seekBar.display.left,
                            totalPx = seekBar.display.width;

                        return (pxTraveled * duration()) / totalPx;
                    }

                    function duration() {
                        return parseFloat(scope.duration);
                    }

                    function start() {
                        return scope.start || 0;
                    }

                    function end() {
                        return isNumber(scope.end) ? scope.end : duration();
                    }

                    scope.position = {};
                    Object.defineProperties(scope.position, {
                        startMarker: {
                            get: function() {
                                return ((seekBar.display.width * start()) /
                                    duration()) + 'px';
                            }
                        },
                        endMarker: {
                            get: function() {
                                return ((seekBar.display.width * end()) /
                                    duration()) + 'px';
                            }
                        },
                        playhead: {
                            get: function() {
                                var currentTime = scope.currentTime;

                                return ((currentTime / duration()) * 100) + '%';
                            }
                        }
                    });

                    function adjustPosition(item, desired) {
                        var halfWidth = (item.display.width / 2),
                            seekDisplay = seekBar.display;

                        switch (item.id) {
                        case 'start-marker':
                            // The start marker can't move past the left side of the timeline or
                            // past the end marker.
                            endMarker.refresh();
                            return Math.max(
                                seekDisplay.left - halfWidth,
                                Math.min(
                                    desired.left,
                                    endMarker.display.center.x - halfWidth
                                )
                            );

                        case 'end-marker':
                            // The end marker can't move past the right side of the timeline or
                            // past the start marker.
                            startMarker.refresh();
                            return Math.max(
                                startMarker.display.center.x - halfWidth,
                                Math.min(
                                    desired.left,
                                    seekDisplay.right - halfWidth
                                )
                            );
                        }
                    }

                    function begin(item) {
                        var marker = item.id.replace(/-marker$/, ''),
                            fnName;

                        marker = marker.slice(0, 1).toUpperCase() + marker.slice(1);
                        fnName = 'on' + marker + 'Scan';

                        scanDeferred = $q.defer();

                        scope[fnName]({
                            promise: scanDeferred.promise
                        });
                    }

                    function beforeMove(item, event) {
                        var desired = event.desired,
                            $marker = item.$element;

                        event.preventDefault();

                        $marker.css({
                            left: adjustPosition(item, desired) + 'px'
                        });

                        notifyScan(item);
                    }

                    function dropStart(item) {
                        scope.$apply(function() {
                            var scopeProp = item.id.replace(/-marker$/, ''),
                                seconds = markerValue(item);

                            scope[scopeProp] = seconds;
                            scanDeferred.resolve(seconds);
                        });
                        item.$element.css('top', 'auto');
                    }

                    function resize() {
                        DragCtrl.refresh();
                        scope.$digest();
                    }

                    $$window.on('resize', resize);

                    [startMarker, endMarker].forEach(function(marker) {
                        marker.on('begin', begin)
                            .on('beforeMove', beforeMove)
                            .on('dropStart', dropStart);
                    });

                    scope.$on('$destroy', function() {
                        $$window.off('resize', resize);
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
                            video.currentTime = time;
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
