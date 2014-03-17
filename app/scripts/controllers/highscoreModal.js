'use strict';

angular.module('beastieApp')
    .controller('HighscoreModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.ok = function (name) {
            $modalInstance.close(name);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
