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
                            width: 0
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
                            width: width + 'px'
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

        .animation('.card__item', function() {
            var draggableStartPositions = {};

            return {
                addClass: function($element, className, done) {
                    var draggable;

                    if (className !== 'c6-dragging') {
                        return done();
                    }

                    draggable = $element.data('cDrag');

                    draggableStartPositions[draggable.id] = {
                        top: draggable.display.top,
                        left: draggable.display.left
                    };

                    return done();
                },
                beforeRemoveClass: function($element, className, done) {
                    function zipBack() {
                        var draggable = $element.data('cDrag');

                        $element.animate({
                            top: draggableStartPositions[draggable.id].top,
                            left: draggableStartPositions[draggable.id].left
                        }, {
                            complete: done,
                            progress: function() {
                                draggable.refresh();
                            }
                        });
                    }

                    if (className !== 'c6-dragging') {
                        return done();
                    } else {
                        return zipBack();
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
