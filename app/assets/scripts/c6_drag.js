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

            .factory('_PositionState', ['$animate','c6EventEmitter',
            function                   ( $animate , c6EventEmitter ) {
                var copy = angular.copy;

                // PositionState: This is the base constructor for objects that represent a DOM
                // element with a position in the viewport. Its most important methods all center
                // around its "display" property. The "display" property is an object representing
                // the position and size of the element in the viewport. The "display" property has
                // the following properties: "top", "right", "bottom", "left", "width" and
                // "height". Objects with these properties are commonly referred to as (a)
                // "rect(s)".
                function PositionState() {}
                PositionState.prototype = {
                    init: function(id, $element) {
                        this.id = id;
                        this.$element = $element || null;
                        this.display = this.refresh();

                        c6EventEmitter(this);
                    },
                    // This method, given a rect object, will return a bool indicating if this
                    // element is colliding with the provided rect.
                    collidesWith: function(rect) {
                        var myRect = this.display;

                        return !(
                            rect.bottom < myRect.top ||
                            rect.top > myRect.bottom ||
                            rect.right < myRect.left ||
                            rect.left > myRect.right
                        );
                    },
                    // This method, given a rect object, will return a new rect object that
                    // represents the intersection of this element with the provided rect.
                    intersectionWith: function(rect) {
                        var myRect = this.display,
                            intersection = {
                                top: Math.max(myRect.top, rect.top),
                                right: Math.min(myRect.right, rect.right),
                                bottom: Math.min(myRect.bottom, rect.bottom),
                                left: Math.max(myRect.left, rect.left)
                            };

                        intersection.width = intersection.right - intersection.left;
                        intersection.height = intersection.bottom - intersection.top;

                        return intersection;
                    },
                    // This method updates the "display" rect with the most up-to-date position of
                    // the element in the viewport.
                    refresh: function() {
                        var $element = this.$element;

                        if (!$element) { return null; }

                        return copy($element[0].getBoundingClientRect(), this.display);
                    },
                    // This method animates the addition of a class to the element and gets the
                    // most recent position information after the animation completes.
                    addClass: function(className) {
                        var self = this;

                        $animate.addClass(this.$element, className, function() {
                            self.refresh();
                        });
                    },
                    // This method animates the removal of a class to the element and gets the most
                    // recent position information after the animation completes.
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
                // This function, given an object that was constructed with Draggable, will iterate
                // over the zones the draggable element is over and determine which zone it is
                // most over (by computing the area of all the zones' intersections with the
                // draggable item.
                //
                // This function is only used in the setPrimaryZone() method below, but the
                // function is defined here (as opposed to in that method) to keep memory usage
                // lower (because that method is called rapidly while the user is dragging an
                // element.
                function largestZoneIntersectionOf(draggable) {
                    var areaCache = {},
                        myRect = draggable.display;

                    function intersectArea(zone) {
                        var area = areaCache[zone.id],
                            intersection;

                        if (area) { return area; }

                        intersection = zone.intersectionWith(myRect);

                        // To prevent the computing of an intersection/area multiple times for the
                        // same zone, we cache the area of the intersection by zone id.
                        area = areaCache[zone.id] = intersection.width * intersection.height;

                        return area;
                    }

                    // Sort the zones we're currently over by the area of their intersection with
                    // the draggable element from highest to lowest. Return the first item.
                    return draggable.currentlyOver.sort(function(a, b) {
                        var aArea = intersectArea(a),
                            bArea = intersectArea(b);

                        if (aArea > bArea) {
                            return -1;
                        } else if (aArea < bArea) {
                            return 1;
                        }

                        return 0;
                    })[0];
                }

                // This constructor represents a draggable DOM element. It inherits methods from
                // the PositionState constructor's prototype above.
                function Draggable() {
                    var self = this;

                    // After this draggable item's collisions with the "zones" has been computed,
                    // figure out which zone we are primarily over (because we could be hovering
                    // over multiple zones.
                    function collisionsComputed(self) {
                        self.setPrimaryZone();
                    }

                    // Respond to entering a zone.
                    function enterZone(zone) {
                        var currentlyOver = self.currentlyOver;

                        currentlyOver.push(zone);

                        if (currentlyOver.length === 1) {
                            self.addClass('c6-over-zone');
                        }

                        self.addClass('c6-over-' + zone.id);
                    }

                    // Respond to leaving a zone.
                    function leaveZone(zone) {
                        var currentlyOver = self.currentlyOver;

                        currentlyOver.splice(currentlyOver.indexOf(zone), 1);

                        if (!currentlyOver.length) {
                            self.removeClass('c6-over-zone');
                        }

                        self.removeClass('c6-over-' + zone.id);
                    }

                    this.currentlyOver = [];
                    this.primaryZone = null;

                    this.init.apply(this, arguments);

                    // Setup handlers for events relating to our interactions with "zones." These
                    // events are triggered by a function in the C6DragSpaceController, a
                    // controller that has references to all draggable and zone elements.
                    this.on('enterZone', enterZone)
                        .on('leaveZone', leaveZone)
                        .on('collisionsComputed', collisionsComputed);

                }
                Draggable.prototype = new PositionState();
                // This method will set the "primaryZone" property of the draggable. The primary
                // zone is the zone that the majority of our surface are is over.
                Draggable.prototype.setPrimaryZone = function() {
                    var prevPrimary = this.primaryZone,
                        currentlyOver = this.currentlyOver,
                        self = this,
                        currPrimary;

                    // This switch statement helps up bail out of uneccessary collision rectangle
                    // computation.
                    switch (currentlyOver.length) {

                    // If the draggable is not over any zones, it can't have a primary zone.
                    case 0:
                        currPrimary = null;
                        break;

                    // If the draggable is only over one zone, that zone must be its primary zone.
                    case 1:
                        currPrimary = currentlyOver[0];
                        break;

                    // If the draggable is over multiple zones, we have to compute which zone is
                    // the primary one.
                    default:
                        currPrimary = largestZoneIntersectionOf(this);
                        break;

                    }

                    if (prevPrimary !== currPrimary) {
                        $rootScope.$apply(function() {
                            self.primaryZone = currPrimary;

                            if (currPrimary) {
                                currPrimary.emit('wonPrimary', self);
                            }

                            if (prevPrimary) {
                                prevPrimary.emit('lostPrimary', self);
                            }
                        });
                    }
                };

                return Draggable;
            }])
            .factory('_Zone', ['_PositionState',
            function          (  PositionState ) {
                // This constructor creates an object that will represent a "zone" DOM element. A
                // zone is an element that is not draggable itself, but reacts when draggable
                // elements are dragged on top of it. This objects created by this constructor
                // prototypically inherit from a PositionState object.
                function Zone() {
                    var self = this;

                    function draggableEnter(draggable) {
                        var currentlyUnder = self.currentlyUnder;

                        currentlyUnder.push(draggable);

                        if (currentlyUnder.length === 1) {
                            self.addClass('c6-drag-zone-active');
                        }

                        self.addClass('c6-drag-zone-under-' + draggable.id);
                    }

                    function draggableLeave(draggable) {
                        var currentlyUnder = self.currentlyUnder;

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

                    this.currentlyUnder = [];

                    this.init.apply(this, arguments);

                    // These events are triggered by a function in the C6DragSpaceController. This
                    // controller has references to all the draggables and zones, so as such, it is
                    // responsible for computing collisions between the two.
                    this.on('draggableEnter', draggableEnter)
                        .on('draggableLeave', draggableLeave)
                        // These events are triggered by a draggable element when a zone becomes
                        // its primary zone. The concept of a primary zone is explained in further
                        // detail above.
                        .on('wonPrimary', wonPrimary)
                        .on('lostPrimary', lostPrimary);
                }
                Zone.prototype = new PositionState();

                return Zone;
            }])

            // The controller is instantiated by the <drag-space> directive. It receives references
            // to all draggable and zone items that it contains. Its primary responsibility is to
            // detect collisions between draggables and zones, and notify those items about the
            // collision.
            .controller('C6DragSpaceController', ['$scope',
            function                             ( $scope ) {
                var forEach = angular.forEach;

                var C6DragSpaceCtrl = this;

                this.draggables = {};
                this.zones = {};
                // This is a reference to all draggables currently being dragged. There could
                // theoretically be more than one item being dragged at a time on a multitouch
                // device.
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

                    draggable.emit('collisionsComputed', draggable);
                }

                function draggableEndDrag(draggable) {
                    var currentDrags = C6DragSpaceCtrl.currentDrags;

                    $scope.$apply(function() {
                        currentDrags.splice(currentDrags.indexOf(draggable), 1);
                    });
                }

                this.addDragable = function(draggable) {
                    // These events are triggered by HammerJS drag events that are handled below in
                    // the c6-draggable directive.
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

                            // This single event handler listens to all drag events of concern and
                            // delegates to the function defined on the "events" object above.
                            function delegate(event) {
                                var type = event.type,
                                    eventPhases = events[type];

                                if (type === 'dragstart') {
                                    // Create a new context at the start of the drag lifecycle.
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

                            // Attach touch event listeners to the element.
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
