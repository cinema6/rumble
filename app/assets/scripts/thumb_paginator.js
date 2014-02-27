(function() {
    'use strict';

    angular.module('c6.rumble')
        .directive('thumbPaginator', ['c6UrlMaker','c6Debounce','$window',
        function                     ( c6UrlMaker , c6Debounce , $window ) {
            return {
                restrict: 'E',
                scope: {
                    page: '=?',
                    active: '&'
                },
                link: function(scope, element, attr, controller) {
                    var resetWidth = c6Debounce(function() {
                        controller.setWidth(element.width());
                    }, 250);

                    angular.element($window).bind('resize', resetWidth);

                    resetWidth();
                },
                controller: 'ThumbPaginatorController',
                controllerAs: 'Ctrl',
                templateUrl: c6UrlMaker('views/directives/thumb_paginator.html'),
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

            c(this, 'canGoForward', function() {
                return $scope.page < (this.pagesCount - 1);
            }, ['page', 'Ctrl.pagesCount']);

            c(this, 'canGoBack', function() {
                return $scope.page > 0;
            }, ['page']);

            this.nextPage = function() {
                if (this.canGoForward) {
                    $scope.page++;
                }
            };

            this.previousPage = function() {
                if (this.canGoBack) {
                    $scope.page--;
                }
            };

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

        .directive('thumbPaginatorItem', [function() {
            return {
                restrict: 'A',
                require: '^thumbPaginator',
                link: function(scope, element, attr, controller) {
                    controller.addItem({
                        width: element.outerWidth(true)
                    });
                }
            };
        }])

        .directive('thumbPaginatorButton', [function() {
            return {
                restrict: 'A',
                require: '^thumbPaginator',
                link: function(scope, element, attr, controller) {
                    controller.setMinButtonWidth(parseInt(element.css('min-width'), 10));
                }
            };
        }]);
}());
