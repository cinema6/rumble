(function() {
    'use strict';
    /* global define:true */

    define(['hammer'], function(hammer) {
        angular.module('c6.drag', ['c6.drag'])
            .value('hammer', hammer)

            .controller('C6DragSpaceController', [function() {
                this.draggables = {};
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

            .directive('c6Draggable', ['hammer',
            function                  ( hammer ) {
                return {
                    restrict: 'AC',
                    link: function(scope, $element) {
                        var touchable = hammer($element[0]),
                            position = null;

                        function px(num) {
                            return num + 'px';
                        }

                        function beforeDrag(event) {
                            var currentPosition = $element[0].getBoundingClientRect();

                            event.gesture.preventDefault();

                            position = {
                                top: currentPosition.top,
                                left: currentPosition.left
                            };

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
                        }

                        function afterDrag(event) {
                            event.gesture.preventDefault();

                            $element.css({
                                position: 'static'
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
