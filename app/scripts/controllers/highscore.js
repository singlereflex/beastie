"use strict";

angular.module("beastieApp")
    .controller("HighscoreCtrl", ["$scope", "$firebase", function ($scope, $firebase) {
        // console.log('here');
        $scope.pageSize = 10;
        var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
        // Automatically syncs everywhere in real time.
        $scope.scoreboard = $firebase(highScoreRef).$asArray();
        //weirdness because of firebase:
        
        // Automatically syncs everywhere in real time.

    }]);
