"use strict";

angular.module("beastieApp")
    .controller("HighscoreCtrl", ["$scope", "$firebase", function ($scope, $firebase) {

        var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
        // Automatically syncs everywhere in real time.
        $scope.scoreboard = $firebase(highScoreRef);

    }]);
