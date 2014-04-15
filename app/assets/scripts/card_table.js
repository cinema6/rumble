(function() {
    'use strict';

    var forEach = angular.forEach;

    angular.module('c6.mrmaker')
        .directive('c6BindScroll', ['c6Debounce',
        function                   ( c6Debounce ) {
            return {
                restrict: 'A',
                link: function(scope, $element, $attrs) {
                    var element_ = $element[0],
                        update = c6Debounce(function() {
                            var scroll = scope.$eval($attrs.c6BindScroll);

                            scope.$apply(function() {
                                scroll.x = element_.scrollLeft;
                                scroll.y = element_.scrollTop;
                            });
                        }, 100);

                    scope.$watch($attrs.c6BindScroll, function(scroll) {
                        element_.scrollTop = scroll.y;
                        element_.scrollLeft = scroll.x;

                        scroll.y = element_.scrollTop;
                        scroll.x = element_.scrollLeft;
                    }, true);

                    $element.on('scroll', update);
                }
            };
        }])

        .directive('renderDeck', [function() {
            return {
                transclude: 'element',
                link: function(scope, $element, attrs, controller, transclude) {
                    var deck = attrs.renderDeck,
                        $parent = $element.parent(),
                        cache = {};

                    function CardView(data) {
                        var cardScope = scope.$new();

                        cardScope.this = data;

                        this.$element = transclude(cardScope, function($clone) {
                            $parent.append($clone);
                        });
                        this.data = data;
                        this.scope = cardScope;
                    }

                    scope.$watchCollection(deck, function(deck) {
                        forEach(deck, function(card) {
                            var view = cache[card.id];

                            if (view) {
                                $parent.append(view.$element);
                            } else {
                                cache[card.id] = new CardView(card);
                            }
                        });

                        forEach(cache, function(view, id) {
                            if (deck.indexOf(view.data) < 0) {
                                delete cache[id];
                                view.scope.$destroy();
                                view.$element.remove();
                            }
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
                    editCard: '&',
                    previewMode: '&'
                }
            };
        }])

        .controller('CardTableController', ['$scope','$q','$interval',
        function                           ( $scope , $q , $interval ) {
            var self = this,
                forEach = angular.forEach;

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
                            self.position.x += (5 * multiplyer);
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

                function addCard(card) {
                    function reorder(zone) {
                        var deck = $scope.deck,
                            afterId = zone.id.match(/rc-\w+/)[0],
                            afterCard = null,
                            myCard = null,
                            myIndex = -1;

                        forEach(deck, function(crd, index) {
                            if (crd.id === afterId) {
                                afterCard = crd;
                            }

                            if (crd.id === card.id) {
                                myCard = crd;
                                myIndex = index;
                            }
                        });

                        $scope.$apply(function() {
                            deck.splice(myIndex, 1);
                            deck.splice(deck.indexOf(afterCard) + 1, 0, myCard);
                        });
                    }

                    function dropStart(cardDraggable) {
                        var deck, cardIndex;

                        if (cardDraggable.currentlyOver.length) {
                            return;
                        }

                        deck = $scope.deck;
                        cardIndex = (function() {
                            var result = -1;

                            deck.some(function(card, index) {
                                if (card.id === cardDraggable.id) {
                                    result = index;
                                    return true;
                                }
                            });

                            return result;
                        }());

                        $scope.$apply(function() {
                            deck.splice(cardIndex, 1);
                        });
                    }

                    card.on('reorder', reorder)
                        .on('dropStart', dropStart);
                }

                [
                    DragCtrl.zones['scroll-left'],
                    DragCtrl.zones['scroll-right']
                ].forEach(addScrollZone);

                forEach(DragCtrl.draggables, addCard);

                $scope.$watch('Ctrl.position.x', function() {
                    DragCtrl.refresh();
                });
            }

            this.position = { x: 0 };

            getDragCtrl()
                .then(handleDragEvents);
        }]);
}());
