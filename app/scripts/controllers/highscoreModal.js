'use strict';

angular.module('beastieApp')
    .controller('HighscoreModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close("some data");
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
