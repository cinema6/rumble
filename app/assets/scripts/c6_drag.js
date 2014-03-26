(function() {
    'use strict';
    /* global define:true */

    define(['hammer'], function(hammer) {
        angular.module('c6.drag', ['c6.ui'])
            .value('hammer', hammer)

            .controller('C6DragSpaceController', ['$scope',
            function                             ( $scope ) {
                var forEach = angular.forEach;

                var C6DragSpaceCtrl = this;

                this.draggables = {};
                this.zones = {};
                this.currentDrags = [];

                function draggableBeginDrag(draggable) {
                    forEach(C6DragSpaceCtrl.zones, function(zone) {
                        zone.refresh();
                    });

                    $scope.$apply(function() {
                        C6DragSpaceCtrl.currentDrags.push(draggable);
                    });
                }

                function draggableMove(draggable, rect) {
                    var id, zone, currentlyUnder, isCollision, isTracked,
                        zones = C6DragSpaceCtrl.zones;

                    function add() {
                        currentlyUnder.push(draggable);
                    }

                    function remove() {
                        currentlyUnder.splice(currentlyUnder.indexOf(draggable), 1);
                    }

                    for (id in zones) {
                        zone = zones[id];
                        currentlyUnder = zone.currentlyUnder;
                        isCollision = zone.collidesWith(rect);
                        isTracked = currentlyUnder.indexOf(draggable) > -1;


                        if (isCollision && !isTracked) {
                            $scope.$apply(add);
                        } else if (!isCollision && isTracked) {
                            $scope.$apply(remove);
                        }
                    }
                }

                function draggableEndDrag(draggable) {
                    var currentDrags = C6DragSpaceCtrl.currentDrags;

                    $scope.$apply(function() {
                        currentDrags.splice(currentDrags.indexOf(draggable), 1);
                    });
                }

                this.addDragable = function(draggable) {
                    draggable
                        .on('begin', draggableBeginDrag)
                        .on('move', draggableMove)
                        .on('end', draggableEndDrag);

                    this.draggables[draggable.id] = draggable;
                };

                this.removeDraggable = function(draggable) {
                    delete this.draggables[draggable.id];
                };

                this.addZone = function(zone) {
                    this.zones[zone.id] = zone;
                };
            }])

            .directive('c6DragSpace', [function() {
                return {
                    restrict: 'EAC',
                    controller: 'C6DragSpaceController',
                    scope: true,
                    link: function(scope, $element, $attrs, Controller) {
                        if ($attrs.controllerAs) {
                            scope[$attrs.controllerAs] = Controller;
                        }
                    }
                };
            }])

            .directive('c6DragZone', [function() {
                var copy = angular.copy;

                function ZoneState(id, element) {
                    this.id = id;
                    this.currentlyUnder = [];
                    this.element = element;
                    this.display = this.refresh();
                }
                ZoneState.prototype = {
                    collidesWith: function(rect) {
                        var myRect = this.display;

                        return !(
                            rect.bottom < myRect.top ||
                            rect.top > myRect.bottom ||
                            rect.right < myRect.left ||
                            rect.left > myRect.right
                        );
                    },
                    refresh: function() {
                        return copy(this.element.getBoundingClientRect(), this.display);
                    }
                };

                return {
                    restrict: 'EAC',
                    require: '^c6DragSpace',
                    link: function(scope, $element, $attrs, C6DragSpaceCtrl) {
                        var zoneState = new ZoneState($attrs.id, $element[0]);

                        C6DragSpaceCtrl.addZone(zoneState);
                    }
                };
            }])

            .directive('c6Draggable', ['hammer','c6EventEmitter','$animate',
            function                  ( hammer , c6EventEmitter , $animate ) {
                var copy = angular.copy;

                function DragState(id, element) {
                    this.id = id;
                    this.element = element;
                    this.display = this.refresh();

                    c6EventEmitter(this);
                }
                DragState.prototype = {
                    refresh: function() {
                        return copy(this.element.getBoundingClientRect(), this.display);
                    }
                };

                return {
                    restrict: 'AC',
                    require: '?^c6DragSpace',
                    link: function(scope, $element, $attrs, C6DragSpaceCtrl) {
                        var touchable = hammer($element[0]),
                            position = null,
                            dragState = new DragState($attrs.id, $element[0]);

                        function px(num) {
                            return num + 'px';
                        }

                        function beforeDrag() {
                            dragState.refresh();
                            dragState.emit('begin', dragState);

                            position = {
                                top: dragState.display.top,
                                left: dragState.display.left
                            };

                            $animate.addClass($element, 'c6-dragging');
                            $element.css({
                                position: 'fixed',
                                top: px(position.top),
                                left: px(position.left)
                            });
                        }

                        function drag(event) {
                            var gesture = event.gesture;

                            gesture.preventDefault();

                            $element.css({
                                top: px(position.top + gesture.deltaY),
                                left: px(position.left + gesture.deltaX)
                            });
                            dragState.refresh();

                            dragState.emit('move', dragState, dragState.display);
                        }

                        function afterDrag() {
                            $animate.removeClass($element, 'c6-dragging');
                            $element.css({
                                position: 'static'
                            });

                            dragState.refresh();
                            dragState.emit('move', dragState, dragState.display);
                            dragState.emit('end', dragState);
                        }

                        if (C6DragSpaceCtrl) {
                            C6DragSpaceCtrl.addDragable(dragState);

                            scope.$on('$destroy', function() {
                                dragState.removeAllListeners();
                                C6DragSpaceCtrl.removeDraggable(dragState);
                            });
                        }

                        touchable.on('dragstart', beforeDrag)
                            .on('drag', drag)
                            .on('dragend', afterDrag);
                    }
                };
            }]);
    });
}());
