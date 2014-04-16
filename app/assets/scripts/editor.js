(function() {
    'use strict';

    var isNumber = angular.isNumber,
        jqLite = angular.element;

    function refresh($element) {
        $element.inheritedData('cDragCtrl').refresh();
    }

    angular.module('c6.mrmaker')
        .animation('.card__drop-zone', function() {
            return {
                beforeRemoveClass: function($element, className, done) {
                    function shrink($element, done) {
                        $element
                            .animate({
                                width: '2px'
                            },{
                                complete: done,
                                progress: function() {
                                    refresh($element);
                                }
                            });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'c6-drag-zone-active':
                        return shrink($element, done);
                    default:
                        return done();
                    }
                },
                beforeAddClass: function($element, className, done) {
                    function grow($element, done) {
                        var remPx = parseInt(
                            angular.element('html')
                                .css('font-size'),
                            10
                        );

                        $element
                            .animate({
                                width: ((10 * remPx) + 34) + 'px'
                            },{
                                complete: done,
                                progress: function() {
                                    refresh($element);
                                }
                            });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'c6-drag-zone-active':
                        return grow($element, done);
                    default:
                        return done();
                    }
                }
            };
        })

        .animation('.new__container', function() {
            return {
                beforeAddClass: function($element, className, done) {
                    function hide($element, done) {
                        $element.animate({
                            width: 0,
                            margin: 0
                        },{
                            complete: done,
                            progress: function() {
                                refresh($element);
                            }
                        });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'ng-hide':
                        return hide($element, done);
                    default:
                        return done();
                    }
                },
                removeClass: function($element, className, done) {
                    function show($element, done) {
                        $element.animate({
                            width: '2.25em',
                            margin: '0 0.75em 0 0'
                        }, {
                            complete: done,
                            progress: function() {
                                refresh($element);
                            }
                        });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'ng-hide':
                        return show($element, done);
                    default:
                        return done();
                    }
                }
            };
        })

        .animation('.card__container', function() {
            return {
                beforeAddClass: function($element, className, done) {
                    function shrink($element, done) {
                        $element.animate({
                            width: '0px'
                        }, {
                            complete: done,
                            progress: function() {
                                refresh($element);
                            }
                        });

                        return function() {
                            $element.stop();
                            $element.removeAttr('style');
                        };
                    }

                    switch (className) {
                    case 'card__container--dragging':
                        return shrink($element, done);
                    default:
                        return done();
                    }
                },
                removeClass: function($element, className, done) {
                    function grow($element, done) {
                        var zone = $element.data('cDragZone');

                        $element.animate({
                            width: '10rem'
                        }, {
                            complete: function() {
                                zone.emit('animationComplete');
                                done();
                            },
                            progress: function() {
                                refresh($element);
                            }
                        });

                        return function() {
                            $element.stop();
                            $element.removeAttr('style');
                        };
                    }

                    switch (className) {
                    case 'card__container--dragging':
                        return grow($element, done);
                    default:
                        return done();
                    }
                }
            };
        })

        .animation('.card__item', function($animate) {
            var forEach = angular.forEach,
                $ = angular.element;

            return {
                beforeRemoveClass: function($element, className, done) {
                    function zipBack($element, done) {
                        var draggable = $element.data('cDrag'),
                            dropZones = draggable.currentlyOver.filter(function(zone) {
                                return zone.id.search(/drop-zone-\w+/) > -1;
                            }),
                            dropZone = dropZones[dropZones.length - 1],
                            zone = $element.inheritedData('cDragZone');

                        function toNewPosition() {
                            var $ul = $element.closest('ul'),
                                $dropZones = $ul.find('.card__drop-zone');

                            dropZone.$element.addClass('card__drop-zone--reordering');
                            draggable.emit('reorder', dropZone);

                            zone.once('animationComplete', function() {
                                $element.animate({
                                    top: zone.display.top,
                                    left: zone.display.left
                                }, {
                                    progress: function() {
                                        draggable.refresh();
                                    },
                                    complete: function() {
                                        dropZone.$element.removeClass(
                                            [
                                                'card__drop-zone--reordering',
                                                'c6-drag-zone-active'
                                            ].join(' ')
                                        );
                                        $element.css({'top' : 0, 'left' : 0});
                                        forEach($dropZones, function(dropZone) {
                                            $animate.removeClass(
                                                $(dropZone),
                                                'c6-drag-zone-active'
                                            );
                                        });
                                        done();
                                        refresh($element);
                                    }
                                });
                            });

                            return function() {
                                dropZone.$element.removeClass(
                                    'card__drop-zone--reordering'
                                );
                            };
                        }


                        if (dropZone) {
                            return toNewPosition();
                        } else {
                            return done();
                        }
                    }

                    switch (className) {
                    case 'c6-dragging':
                        return zipBack($element, done);
                    default:
                        return done();
                    }
                }
            };
        })

        .controller('EditorController', ['cModel','c6State','$scope',
        function                        ( cModel , c6State , $scope ) {
            this.model = cModel;

            this.editCard = function(card) {
                c6State.transitionTo('editor.editCard', { id: card.id });
            };

            this.newCard = function() {
                c6State.transitionTo('editor.newCard.type');
            };

            $scope.$on('addCard', function(event, card) {
                cModel.data.deck.push(card);
            });
        }])

        .controller('EditCardController', ['$scope','cModel','c6Computed','c6State',
                                           'VideoService',
        function                          ( $scope , cModel , c6Computed , c6State ,
                                            VideoService ) {
            var c = c6Computed($scope);

            this.model = cModel;
            VideoService.createVideoUrl(c, this, 'EditCardCtrl');

            this.close = function() {
                c6State.transitionTo('editor', { id: $scope.EditorCtrl.model.id });
            };
        }])

        .controller('NewCardTypeController', ['cModel','c6State',
        function                             ( cModel , c6State ) {
            this.model = cModel;
            this.type = null;

            this.edit = function() {
                var type = this.type;

                if (!type) {
                    throw new Error('Can\'t edit before a type is chosen.');
                }

                c6State.transitionTo('editor.newCard.edit', { type: type });
            };
        }])

        .controller('NewCardEditController', ['cModel','c6Computed','$scope','VideoService',
                                              'c6State',
        function                             ( cModel , c6Computed , $scope , VideoService ,
                                               c6State ) {
            var c = c6Computed($scope);

            this.model = cModel;
            VideoService.createVideoUrl(c, this, 'NewCardEditCtrl');

            this.save = function() {
                var minireel = c6State.get('editor').cModel;

                $scope.$emit('addCard', cModel);
                c6State.transitionTo('editor', { id: minireel.id });
            };
        }])

        .controller('MRPreviewController', ['$scope','MiniReelService','postMessage', 'c6BrowserInfo',
        function                           ( $scope , MiniReelService , postMessage ,  c6BrowserInfo ) {
            var self = this,
                experience,
                session,
                player,
                card;

            this.mode = 'full';

            // this.setMode = function() {
            //     $scope.mode = this.mode;
            // };

            $scope.$on('mrPreview:initExperience', function(event, exp, iframe) {
                // the mr-preview directive sends the experience and the iframe element
                // 'card' is undefined at this point

                // store the MR player window
                player = iframe.prop('contentWindow');

                // convert the MRinator experience to a MRplayer experience
                experience = MiniReelService.preview(exp);

                // add the mode
                experience.mode = self.mode;

                // create a postMessage session (as defined in c6ui.postMessage)
                session = postMessage.createSession(player);

                // add the converted experience to the session for comparing later
                session.experience = experience;

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
                            profile: c6BrowserInfo.profile
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
            });

            $scope.$on('mrPreview:updateExperience', function(event, exp, newCard) {
                // the EditorCtrl $broadcasts the most up-to-date experience model
                // when the user clicks 'preview'.
                // it may have a newCard to go to

                // we convert the experience
                experience = MiniReelService.preview(exp);
                experience.mode = self.mode;

                // if it's been changed or we're previewing a specific card
                // then we ping the player
                // and send the updated experience
                // the MRplayer is listening in the RumbleCtrl
                // and will update the deck
                if(!angular.equals(experience, session.experience)) {
                    session.ping('mrPreview:updateExperience', experience);
                }

                if(newCard) {
                    card = MiniReelService.convertCard(newCard);
                    session.ping('mrPreview:jumpToCard', card);
                } else {
                    session.ping('mrPreview:reset');
                }
            });

            // i'm commenting out the below listener
            // cuz we aren't going to reset the player
            // when the user closes the preview

            // $scope.$on('mrPreview:closePreview', function() {
            //     // reset the card so that on the next mode change
            //     // we don't return a card to jumpTo

            //     card = null;

            //     // tell the player to reset
            //     // this will set the player index to -1
            //     // which will reset to splash page

            //     session.ping('mrPreview:reset');
            // });

            $scope.$watch(function() { 
                return self.mode;
            }, function(newMode, oldMode) {
                if(newMode === oldMode) { return; }

                // the mode has changed
                // update the mode on the experience
                experience.mode = newMode;

                // ping the MR player
                // sending 'updateMode' will trigger a refresh
                // and the player will call for another handshake
                // and will call for a specific card
                // in case we're previewing that card
                session.ping('mrPreview:updateMode');
            });

        }])

        .directive('mrPreview', [function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    scope.$watch(attrs.mrPreview, function(experience) {
                        if(experience) {
                            scope.$emit('mrPreview:initExperience', experience, element);
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
