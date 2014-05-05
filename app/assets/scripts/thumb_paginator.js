(function() {
    'use strict';

    var jqLite = angular.element;

    angular.module('c6.rumble')
        .directive('thumbPaginator', ['assetFilter','c6Debounce','$window',
        function                     ( assetFilter , c6Debounce , $window ) {
            return {
                restrict: 'E',
                scope: {
                    page: '=?',
                    active: '&',
                    onNext: '&',
                    onPrev: '&',
                    disableNextWhen: '&',
                    disablePrevWhen: '&'
                },
                link: function(scope, element, attr, controller) {
                    var $$window = jqLite($window),
                        resetWidth = c6Debounce(function() {
                            controller.setWidth(element.width());
                        }, 250);

                    $$window.on('resize', resetWidth);
                    element.on('$destroy', function() {
                        $$window.off('resize', resetWidth);
                    });

                    resetWidth();

                    scope.$on('resize', function() {
                        resetWidth();
                    });
                },
                controller: 'ThumbPaginatorController',
                controllerAs: 'Ctrl',
                templateUrl: assetFilter('directives/thumb_paginator.html', 'views'),
                transclude: true
            };
        }])

        .controller('ThumbPaginatorController', ['$scope','c6Computed',
        function                                ( $scope , c6Computed ) {
            var self = this,
                c = c6Computed($scope);

            $scope.page = $scope.page || 0;

            $scope.$watch('active()', function(index, prevIndex) {
                if (index === prevIndex || index < 0) { return; }

                var targetPage = Math.floor(index / self.itemsPerPage);

                $scope.page = targetPage;
            });

            this.items = [];

            this.elementWidth = 0;
            this.minButtonWidth = 0;

            c(this, 'availableWidth', function() {
                return this.elementWidth - (this.minButtonWidth * 2);
            }, ['Ctrl.elementWidth', 'Ctrl.minButtonWidth']);

            c(this, 'itemsPerPage', function() {
                var itemWidth = (this.items[0] && this.items[0].width) || 0,
                    availableWidth = this.availableWidth;

                return itemWidth && Math.floor(availableWidth / itemWidth);
            }, ['Ctrl.availableWidth', 'Ctrl.items[0].width']);

            c(this, 'pagesCount', function() {
                return Math.ceil(this.items.length / this.itemsPerPage);
            }, ['Ctrl.itemsPerPage', 'Ctrl.items.length']);

            c(this, 'buttonWidth', function() {
                var availableWidth = this.availableWidth,
                    elementWidth = this.elementWidth,
                    items = this.items,
                    pageWidth = (function() {
                        var total = 0,
                            index = 0,
                            length = items.length;

                        for ( ; index < length; index++) {
                            if ((total + items[index].width) > availableWidth) {
                                return total;
                            }

                            total += items[index].width;
                        }

                        return total;
                    }());

                return (elementWidth - pageWidth) / 2;
            }, ['Ctrl.availableWidth', 'Ctrl.items.@each.width']);

            this.addItem = function(data) {
                this.items.push(data);
            };

            this.setWidth = function(width) {
                this.elementWidth = width;
            };

            this.setMinButtonWidth = function(minWidth) {
                this.minButtonWidth = minWidth;
            };
        }])

        .directive('thumbPaginatorItem', ['$window','c6Debounce',
        function                         ( $window , c6Debounce ) {
            return {
                restrict: 'A',
                require: '^thumbPaginator',
                link: function(scope, element, attr, controller) {
                    var $$window = jqLite($window),
                        model = {
                            width: element.outerWidth(true)
                        },
                        updateWidth = c6Debounce(function() {
                            model.width = element.outerWidth(true);
                        }, 250);

                    $$window.on('resize', updateWidth);
                    element.on('$destroy', function() {
                        $$window.off('resize', updateWidth);
                    });

                    controller.addItem(model);
                }
            };
        }])

        .directive('thumbPaginatorButton', ['$window','c6Debounce',
        function                           ( $window , c6Debounce ) {
            return {
                restrict: 'A',
                require: '^thumbPaginator',
                link: function(scope, element, attr, controller) {
                    var $$window = jqLite($window),
                        setWidth = c6Debounce(function() {
                            controller.setMinButtonWidth(
                                parseInt(
                                    element.css('min-width'),
                                    10
                                )
                            );
                        }, 250);

                    $$window.on('resize', setWidth);
                    element.on('$destroy', function() {
                        $$window.off('resize', setWidth);
                    });

                    setWidth();
                }
            };
        }]);
}());
