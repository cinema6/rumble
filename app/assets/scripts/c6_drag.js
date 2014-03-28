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
        var copy = angular.copy;

        angular.module('c6.drag', ['c6.ui'])
            .value('hammer', hammer)

            .factory('_PositionState', ['$animate','c6EventEmitter',
            function                   ( $animate , c6EventEmitter ) {
                function PositionState() {}
                PositionState.prototype = {
                    init: function(id, $element) {
                        this.id = id;
                        this.$element = $element || null;
                        this.display = this.refresh();

                        c6EventEmitter(this);
                    },
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
                        var $element = this.$element;

                        if (!$element) { return null; }

                        return copy($element[0].getBoundingClientRect(), this.display);
                    },
                    addClass: function(className) {
                        var self = this;

                        $animate.addClass(this.$element, className, function() {
                            self.refresh();
                        });
                    },
                    removeClass: function(className) {
                        var self = this;

                        $animate.removeClass(this.$element, className, function() {
                            self.refresh();
                        });
                    }
                };

                return PositionState;
            }])
            .factory('_Draggable', ['_PositionState','$rootScope',
            function               (  PositionState , $rootScope ) {
                function Draggable() {
                    var self = this,
                        currentlyOver;

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

                    function computePrimaryZone(draggable, myRect, currentlyOver) {
                        var prevPrimary = draggable.primaryZone,
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
                            $rootScope.$apply(function() {
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

                    function enterZone(zone) {
                        currentlyOver.push(zone);

                        if (currentlyOver.length === 1) {
                            self.addClass('c6-over-zone');
                        }

                        self.addClass('c6-over-' + zone.id);
                    }

                    function leaveZone(zone) {
                        currentlyOver.splice(currentlyOver.indexOf(zone), 1);

                        if (!currentlyOver.length) {
                            self.removeClass('c6-over-zone');
                        }

                        self.removeClass('c6-over-' + zone.id);
                    }

                    this.currentlyOver = currentlyOver = [];
                    this.primaryZone = null;

                    this.init.apply(this, arguments);

                    this.on('enterZone', enterZone)
                        .on('leaveZone', leaveZone)
                        .on('collisionsComputed', computePrimaryZone);

                }
                Draggable.prototype = new PositionState();

                return Draggable;
            }])
            .factory('_Zone', ['_PositionState',
            function          (  PositionState ) {
                function Zone() {
                    var self = this,
                        currentlyUnder;

                    function draggableEnter(draggable) {
                        currentlyUnder.push(draggable);

                        if (currentlyUnder.length === 1) {
                            self.addClass('c6-drag-zone-active');
                        }

                        self.addClass('c6-drag-zone-under-' + draggable.id);
                    }

                    function draggableLeave(draggable) {
                        currentlyUnder.splice(currentlyUnder.indexOf(draggable), 1);

                        if (!currentlyUnder.length) {
                            self.removeClass('c6-drag-zone-active');
                        }

                        self.removeClass('c6-drag-zone-under-' + draggable.id);
                    }

                    function wonPrimary(draggable) {
                        self.addClass('c6-drag-zone-primary');
                        self.addClass('c6-drag-zone-primary-of-' + draggable.id);
                    }

                    function lostPrimary(draggable) {
                        self.removeClass('c6-drag-zone-primary');
                        self.removeClass('c6-drag-zone-primary-of-' + draggable.id);
                    }

                    this.currentlyUnder = currentlyUnder = [];

                    this.init.apply(this, arguments);

                    this.on('draggableEnter', draggableEnter)
                        .on('draggableLeave', draggableLeave)
                        .on('wonPrimary', wonPrimary)
                        .on('lostPrimary', lostPrimary);
                }
                Zone.prototype = new PositionState();

                return Zone;
            }])

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

                    draggable.emit(
                        'collisionsComputed',
                        draggable,
                        draggable.display,
                        draggable.currentlyOver
                    );
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

            .directive('c6DragZone', ['_Zone',
            function                 (  Zone ) {
                return {
                    restrict: 'EAC',
                    require: '^c6DragSpace',
                    link: function(scope, $element, $attrs, C6DragSpaceCtrl) {
                        var zone = new Zone($attrs.id, $element);

                        C6DragSpaceCtrl.addZone(zone);
                        $element.data('cDragZone', zone);

                        scope.$on('$destroy', function() {
                            zone.removeAllListeners();
                            C6DragSpaceCtrl.removeZone(zone);
                        });
                    }
                };
            }])

            .directive('c6Draggable', ['hammer','_Draggable',
            function                  ( hammer ,  Draggable ) {
                var noop = angular.noop;

                return {
                    restrict: 'AC',
                    require: '?^c6DragSpace',
                    link: function(scope, $element, $attrs, C6DragSpaceCtrl) {
                        var touchable = hammer($element[0]),
                            draggable = new Draggable($attrs.id, $element);

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
                                            draggable.refresh();

                                            this.start = {
                                                top: draggable.display.top,
                                                left: draggable.display.left
                                            };
                                        },
                                        modify: function() {
                                            draggable.addClass('c6-dragging');
                                            $element.css({
                                                top: px(this.start.top),
                                                left: px(this.start.left)
                                            });
                                        },
                                        notify: function() {
                                            draggable.emit('begin', draggable);
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
                                            draggable.refresh();
                                            draggable.emit('move', draggable, draggable.display);
                                        }
                                    },
                                    dragend: {
                                        modify: function() {
                                            draggable.removeClass('c6-dragging');
                                        },
                                        notify: function() {
                                            draggable.refresh();
                                            draggable.emit('move', draggable, draggable.display);
                                            draggable.emit('end', draggable);
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


                        if (C6DragSpaceCtrl) {
                            C6DragSpaceCtrl.addDragable(draggable);
                        }

                        $element.data('cDrag', draggable);

                        listenForEvents();


                        scope.$on('$destroy', function() {
                            draggable.removeAllListeners();

                            if (C6DragSpaceCtrl) {
                                C6DragSpaceCtrl.removeDraggable(draggable);
                            }
                        });
                    }
                };
            }]);
    });
}());
