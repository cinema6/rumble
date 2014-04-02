(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .directive('c6BindScroll', [function() {
            return {
                restrict: 'A',
                link: function(scope, $element, $attrs) {
                    var element_ = $element[0];

                    scope.$watch($attrs.c6BindScroll, function(scroll) {
                        element_.scrollTop = scroll.y;
                        element_.scrollLeft = scroll.x;

                        scroll.y = element_.scrollTop;
                        scroll.x = element_.scrollLeft;
                    }, true);

                    $element.on('scroll', function() {
                        var scroll = scope.$eval($attrs.c6BindScroll);

                        scope.$apply(function() {
                            scroll.x = element_.scrollLeft;
                            scroll.y = element_.scrollTop;
                        });
                    });
                }
            };
        }])

        .directive('cardTable', ['c6UrlMaker',
        function                ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/card_table.html'),
                controller: 'CardTableController',
                controllerAs: 'Ctrl',
                scope: {
                    deck: '=',
                    editCard: '&'
                }
            };
        }])

        .controller('CardTableController', ['$scope','$q','$interval',
        function                           ( $scope , $q , $interval ) {
            var self = this;

            function getDragCtrl() {
                var deferred = $q.defer(),
                    stopWatch = $scope.$watch('DragCtrl', function(DragCtrl) {
                        if (DragCtrl) {
                            deferred.resolve(DragCtrl);
                            stopWatch();
                        }
                    });

                return deferred.promise;
            }

            function handleDragEvents(DragCtrl) {
                var scrollInterval;

                function addScrollZone(zone) {
                    var multiplyer = (function() {
                        var direction = zone.id.match(/-\w+$/)[0].slice(1);

                        switch (direction) {
                        case 'left':
                            return -1;
                        case 'right':
                            return 1;
                        }
                    }());

                    function enterScrollZone(draggable) {
                        if (DragCtrl.currentDrags.indexOf(draggable) < 0) {
                            return;
                        }

                        scrollInterval = $interval(function() {
                            self.position += (5 * multiplyer);
                            DragCtrl.refresh();
                        }, 17);
                    }

                    function leaveScrollZone(draggable) {
                        var currentDrags = DragCtrl.currentDrags;

                        if (currentDrags.indexOf(draggable) < 0 && currentDrags.length) {
                            return;
                        }

                        $interval.cancel(scrollInterval);
                    }

                    zone.on('draggableEnter', enterScrollZone)
                        .on('draggableLeave', leaveScrollZone);
                }

                [
                    DragCtrl.zones['scroll-left'],
                    DragCtrl.zones['scroll-right']
                ].forEach(addScrollZone);
            }

            this.position = 0;

            getDragCtrl()
                .then(handleDragEvents);
        }]);
}());
