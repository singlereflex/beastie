"use strict";
// document.body.style.width = "2048em";
// document.body.style.height = "2048em";

angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "beastieEnv", "$firebase", "$log", "$state", function ($scope, beastieEnv, $firebase, $log, $state) {

        $scope.music = music;
        $scope.pauseMusic = function (event) {
            event.preventDefault();
            if (!music) {
                settings.music.start();
            } else {
                settings.music.stop();
            }
            music = !music;
            $scope.music = music;
        };

        var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
        // Automatically syncs everywhere in real time.
        $scope.scoreboard = $firebase(highScoreRef);


        $scope.iconPrefix = "icon-";


        

        $scope.pauseGame = function () {
            $scope.loop.pause();
        };

        $scope.endGame = function () {
            $scope.loop.stop();
            $state.go("game.ended");

//            var modalInstance = $modal.open({
//                templateUrl: "views/modal_score_submit.html",
//                controller: "HighscoreModalCtrl",
//                scope: $scope
//            });
//
//            modalInstance.result.then(function (name) {
//                $log.info(name);
//                highScoreRef.push({name: name, score: $scope.score});
//                location.reload();
//            }, function () {
//                $log.info("Modal dismissed at: " + new Date());
//                location.reload();
//            });

        };

        $scope.submitHighscore = function(name) {
          console.log(arguments)
            highScoreRef.push({name: name, score: $scope.score});
            $state.go("highscore");
        };

        $scope.restartGame = function () {
            location.reload();
        };

        addPlayer();
        $scope.explore(1024 - 8, 1024 - 8, gridsize);
        $scope.loop.start();


    }]);
