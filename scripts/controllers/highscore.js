"use strict";

angular.module("beastieApp")
    .controller("HighscoreCtrl", ["$scope", function ($scope) {
        // console.log('here');
        $scope.pageSize = 10;

        $scope.local_highscores = JSON.parse(localStorage.highscores)
        $scope.moment = moment;
        $scope.local = true;
    }]);
