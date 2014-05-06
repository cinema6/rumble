(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['c6State','MiniReelService','ConfirmDialogService',
                                          'cinema6',
        function                         ( c6State , MiniReelService , ConfirmDialogService ,
                                           cinema6 ) {
            var self = this,
                appData = null;

            this.filter = 'all';

            this.copy = function(minireelId) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to copy this MiniReel?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return MiniReelService.create(minireelId)
                            .then(function open(minireel) {
                                return MiniReelService.open(minireel.id);
                            })
                            .then(function editCopy(minireel) {
                                c6State.goTo(
                                    'editor.setMode.category',
                                    { minireelId: minireel.id }
                                );
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

                        MiniReelService.publish(minireel.id);
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

                        MiniReelService.unpublish(minireel.id);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.remove = function(minireel) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this MiniReel?',
                    affirm: 'Delete',
                    cancel: 'Keep',
                    onCancel: function() {
                        ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        MiniReelService.erase(minireel.id)
                            .then(function removeFromModel() {
                                var minireels = self.model;

                                minireels.splice(minireels.indexOf(minireel), 1);
                            });

                        ConfirmDialogService.close();
                    }
                });
            };

            this.modeNameFor = function(minireel) {
                return appData &&
                    MiniReelService.modeDataOf(
                        minireel,
                        appData.experience.data.modes
                    ).name;
            };

            this.determineInclusionWithFilter = function(minireel) {
                return self.filter === 'all' || self.filter === minireel.status;
            };

            cinema6.getAppData()
                .then(function save(data) {
                    appData = data;
                });
        }])

        .controller('NewCategoryController', ['$scope',
        function                             ( $scope ) {
            var NewCtrl = $scope.NewCtrl,
                self = this;

            $scope.$watch(function() { return self.mode; }, function(mode) {
                NewCtrl.category = mode;
            });
        }])

        .controller('NewModeController', ['$scope','c6State',
        function                         ( $scope , c6State ) {
            var NewCtrl = $scope.NewCtrl;

            this.setMode = function() {
                var minireel = this.model.minireel,
                    mode = this.mode;

                minireel.mode = mode;
                c6State.goTo(NewCtrl.baseState + '.autoplay');
            };
        }]);
}());
