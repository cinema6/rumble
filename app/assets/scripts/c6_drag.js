(function() {
    'use strict';
    /* global define:true */

    var styles = document.createElement('style');

    styles.type = 'text/css';
    styles.appendChild(document.createTextNode([
        '.c6-dragging {',
        '    position: fixed !important;',
        '}'
    ].join('\n')));
    document.getElementsByTagName('head')[0].appendChild(styles);

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
                        zone.emit('draggableEnter', draggable);
                        draggable.emit('enterZone', zone);
                    }

                    function remove() {
                        zone.emit('draggableLeave', draggable);
                        draggable.emit('leaveZone', zone);
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

                this.removeZone = function(zone) {
                    delete this.zones[zone.id];
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

            .directive('c6DragZone', ['c6EventEmitter','$animate',
            function                 ( c6EventEmitter , $animate ) {
                var copy = angular.copy;

                function ZoneState(id, element) {
                    this.id = id;
                    this.currentlyUnder = [];
                    this.element = element;
                    this.display = this.refresh();

                    c6EventEmitter(this);
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
                        var zoneState = new ZoneState($attrs.id, $element[0]),
                            currentlyUnder = zoneState.currentlyUnder;

                        function draggableEnter(draggable) {
                            currentlyUnder.push(draggable);

                            if (currentlyUnder.length === 1) {
                                $animate.addClass($element, 'c6-drag-zone-active');
                            }

                            $animate.addClass($element, 'c6-drag-zone-under-' + draggable.id);
                        }

                        function draggableLeave(draggable) {
                            currentlyUnder.splice(currentlyUnder.indexOf(draggable), 1);

                            if (!currentlyUnder.length) {
                                $animate.removeClass($element, 'c6-drag-zone-active');
                            }

                            $animate.removeClass($element, 'c6-drag-zone-under-' + draggable.id);
                        }

                        function wonPrimary(draggable) {
                            $animate.addClass(
                                $element,
                                'c6-drag-zone-primary'
                            );
                            $animate.addClass(
                                $element,
                                'c6-drag-zone-primary-of-' + draggable.id
                            );
                        }

                        function lostPrimary(draggable) {
                            $animate.removeClass(
                                $element,
                                'c6-drag-zone-primary'
                            );
                            $animate.removeClass(
                                $element,
                                'c6-drag-zone-primary-of-' + draggable.id
                            );
                        }

                        zoneState
                            .on('draggableEnter', draggableEnter)
                            .on('draggableLeave', draggableLeave)
                            .on('wonPrimary', wonPrimary)
                            .on('lostPrimary', lostPrimary);

                        C6DragSpaceCtrl.addZone(zoneState);
                        $element.data('cDragZone', zoneState);

                        scope.$on('$destroy', function() {
                            zoneState.removeAllListeners();
                            C6DragSpaceCtrl.removeZone(zoneState);
                        });
                    }
                };
            }])

            .directive('c6Draggable', ['hammer','c6EventEmitter','$animate',
            function                  ( hammer , c6EventEmitter , $animate ) {
                var copy = angular.copy,
                    noop = angular.noop;

                function DragState(id, element) {
                    this.id = id;
                    this.element = element;
                    this.display = this.refresh();
                    this.currentlyOver = [];
                    this.primaryZone = null;

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
                            dragState = new DragState($attrs.id, $element[0]),
                            currentlyOver = dragState.currentlyOver;

                        function enterZone(zone) {
                            currentlyOver.push(zone);

                            if (currentlyOver.length === 1) {
                                $animate.addClass($element, 'c6-over-zone');
                            }

                            $animate.addClass($element, 'c6-over-' + zone.id);
                        }

                        function leaveZone(zone) {
                            currentlyOver.splice(currentlyOver.indexOf(zone), 1);

                            if (!currentlyOver.length) {
                                $animate.removeClass($element, 'c6-over-zone');
                            }

                            $animate.removeClass($element, 'c6-over-' + zone.id);
                        }

                        function px(num) {
                            return num + 'px';
                        }

                        function listenForEvents() {
                            var context,
                                // The "draggable" directive only cares about three events:
                                // dragstart, drag+ and dragend. These three events, executed in
                                // that particular order, make up one "drag lifecycle."
                                // Different business must be taken care of during each individual
                                // event, but there is a similar pattern. For this reason, each
                                // event can further be broken down into three phases: setup,
                                // modify and notify. Below, all three events and their phases are
                                // mapped out. Each function is invoked with a context object ({})
                                // as "this" that is created at the beginning of every lifecycle
                                // (the "dragstart" event.) So, for example, "this" is the same in
                                // the setup phase of dragstart AND the notify phase of dragend.
                                events = {
                                    dragstart: {
                                        setup: function() {
                                            dragState.refresh();

                                            this.start = {
                                                top: dragState.display.top,
                                                left: dragState.display.left
                                            };
                                        },
                                        modify: function() {
                                            $animate.addClass($element, 'c6-dragging');
                                            $element.css({
                                                top: px(this.start.top),
                                                left: px(this.start.left)
                                            });
                                        },
                                        notify: function() {
                                            dragState.emit('begin', dragState);
                                        }
                                    },
                                    drag: {
                                        setup: function(event) {
                                            event.gesture.preventDefault();
                                        },
                                        modify: function(event) {
                                            $element.css({
                                                top: px(this.start.top + event.gesture.deltaY),
                                                left: px(this.start.left + event.gesture.deltaX)
                                            });
                                        },
                                        notify: function() {
                                            dragState.refresh();
                                            dragState.emit('move', dragState, dragState.display);
                                        }
                                    },
                                    dragend: {
                                        modify: function() {
                                            $animate.removeClass($element, 'c6-dragging');
                                        },
                                        notify: function() {
                                            dragState.refresh();
                                            dragState.emit('move', dragState, dragState.display);
                                            dragState.emit('end', dragState);
                                        }
                                    }
                                };

                            function delegate(event) {
                                var type = event.type,
                                    eventPhases = events[type];

                                if (type === 'dragstart') {
                                    // Create a new context at the start of the drag lifecycle
                                    context = {};
                                }

                                // Call the hook for every phase
                                for (var hooks = ['setup', 'modify', 'notify'], index = 0;
                                    // Length of the array is hardcoded here for performance
                                    // reasons. If you add a hook, don't forget to increase this
                                    // number.
                                    index < 3;
                                    index++) {
                                    (eventPhases[hooks[index]] || noop).call(context, event);
                                }
                            }

                            // Attach touch event listeners to element
                            touchable.on('dragstart drag dragend', delegate);
                        }

                        function intersectArea(rect1, rect2) {
                            var top = Math.max(rect1.top, rect2.top),
                                right = Math.min(rect1.right, rect2.right),
                                bottom = Math.min(rect1.bottom, rect2.bottom),
                                left = Math.max(rect1.left, rect2.left),
                                width = right - left,
                                height = bottom - top;

                            return width * height;
                        }

                        function findLargestIntersectionWith(rect, items) {
                            var areaCache = {};

                            items.sort(function(a, b) {
                                var aArea = areaCache[a.id] ||
                                    (areaCache[a.id] = intersectArea(a.display, rect)),
                                    bArea = areaCache[b.id] ||
                                        (areaCache[b.id] = intersectArea(b.display, rect));

                                if (aArea > bArea) {
                                    return -1;
                                } else if (aArea < bArea) {
                                    return 1;
                                }

                                return 0;
                            });

                            return currentlyOver[0];
                        }

                        function computePrimaryZone(draggable, myRect) {
                            var currentlyOver = draggable.currentlyOver,
                                prevPrimary = draggable.primaryZone,
                                currPrimary;

                            switch (currentlyOver.length) {

                            case 0:
                                currPrimary = null;
                                break;

                            case 1:
                                currPrimary = currentlyOver[0];
                                break;

                            default:
                                currPrimary = findLargestIntersectionWith(myRect, currentlyOver);
                                break;

                            }

                            if (prevPrimary !== currPrimary) {
                                scope.$apply(function() {
                                    draggable.primaryZone = currPrimary;

                                    if (currPrimary) {
                                        currPrimary.emit('wonPrimary', draggable);
                                    }

                                    if (prevPrimary) {
                                        prevPrimary.emit('lostPrimary', draggable);
                                    }
                                });
                            }
                        }

                        if (C6DragSpaceCtrl) {
                            C6DragSpaceCtrl.addDragable(dragState);

                            dragState.on('move', computePrimaryZone);

                            scope.$on('$destroy', function() {
                                dragState.removeAllListeners();
                                C6DragSpaceCtrl.removeDraggable(dragState);
                            });
                        }

                        $element.data('cDrag', dragState);

                        listenForEvents();

                        dragState.on('enterZone', enterZone)
                            .on('leaveZone', leaveZone);
                    }
                };
            }]);
    });
}());
