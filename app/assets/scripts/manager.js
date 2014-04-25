(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['c6State','MiniReelService','ConfirmDialogService',
        function                         ( c6State , MiniReelService , ConfirmDialogService ) {
            var self = this;

            this.filter = 'all';

            this.copy = function(minireelId) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to copy this MiniReel?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        MiniReelService.open(minireelId)
                            .then(function copyExisting(minireel) {
                                return MiniReelService.create(minireel);
                            })
                            .then(function editCopy(minireel) {
                                c6State.goTo('editor', { minireelId: minireel.id });
                            });
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });

            };

            this.edit = function(minireel) {
                c6State.goTo('editor', { minireelId: minireel.id });
            };

            this.makePublic = function(minireel) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this MiniReel public?',
                    affirm: 'Publish',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        MiniReelService.publish(minireel);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.makePrivate = function(minireel) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this MiniReel private?',
                    affirm: 'Make Private',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        MiniReelService.unpublish(minireel);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.remove = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this MiniReel?',
                    affirm: 'Delete',
                    cancel: 'Keep',
                    onCancel: function() {
                        ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        // TODO: DELETE
                    }
                });
            };

            this.determineInclusionWithFilter = function(minireel) {
                return self.filter === 'all' || self.filter === minireel.status;
            };
        }])

        .controller('NewCategoryController', ['$scope',
        function                             ( $scope ) {
            var NewCtrl = $scope.NewCtrl,
                self = this;

            this.mode = 'lightbox';

            $scope.$watch(function() { return self.mode; }, function(mode) {
                NewCtrl.category = mode;
            });
        }])

        .controller('NewModeController', ['c6State',
        function                         ( c6State ) {
            this.launchEditor = function() {
                var minireel = this.model.minireel,
                    mode = this.mode;

                minireel.mode = mode;
                c6State.goTo('editor', { minireelId: minireel.id });
            };
        }]);
}());
