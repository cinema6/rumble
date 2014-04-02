(function() {
    'use strict';

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
                                width: '0px'
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
                        $element
                            .animate({
                                width: '10rem'
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
            var width = null;

            return {
                beforeAddClass: function($element, className, done) {
                    function hide($element, done) {
                        width = $element.width();

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
                            width: width + 'px',
                            margin: '0 10px'
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

        .animation('.card__item', function() {
            return {
                beforeRemoveClass: function($element, className, done) {
                    function zipBack($element, done) {
                        var draggable = $element.data('cDrag'),
                            dropZone = draggable.currentlyOver.filter(function(zone) {
                                return zone.id.search(/drop-zone-\w+/) > -1;
                            })[0],
                            zone = $element.inheritedData('cDragZone');

                        function backToStart() {
                            zone
                                .once('animationComplete', function() {
                                    $element.animate({
                                        top: zone.display.top,
                                        left: zone.display.left
                                    }, {
                                        complete: done,
                                        progress: function() {
                                            refresh($element);
                                        }
                                    });
                                });
                        }

                        function toNewPosition() {
                            var $container = $element.parent(),
                                $newButton = $container.nextAll('.new__container').first();

                            $container.addClass('card__container--reordering');
                            dropZone.$element.addClass('card__drop-zone--reordering');
                            $newButton.insertBefore(dropZone.$element);

                            zone.once('animationComplete', function() {
                                $element.animate({
                                    top: dropZone.display.center.y - (draggable.display.height / 2),
                                    left: dropZone.display.center.x - (draggable.display.width / 2)
                                }, {
                                    complete: function() {
                                        refresh($element);
                                        draggable.emit('reorderAnimated', dropZone);
                                        $container.removeClass(
                                            'card__container--reordering'
                                        );
                                        dropZone.$element.removeClass(
                                            'card__drop-zone--reordering'
                                        );
                                        refresh($element);
                                    },
                                    progress: function() {
                                        refresh($element);
                                    }
                                });
                            });
                        }


                        if (dropZone) {
                            toNewPosition();
                        } else {
                            backToStart();
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

        .directive('videoPreview', ['c6UrlMaker',
        function                   ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_preview.html'),
                scope: {
                    service: '@',
                    videoid: '@'
                }
            };
        }]);
}());
