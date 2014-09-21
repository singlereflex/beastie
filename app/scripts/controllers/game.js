"use strict";
// document.body.style.width = "2048em";
// document.body.style.height = "2048em";

angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "beastieEnv", "$firebase", "$log", "$state", function ($scope, beastieEnv, $firebase, $log, $state) {
        var gridsize = 16;
        var cellsize = 16;
        var game = new Worker('/scripts/game.js');//new Game();
        game.postMessage();
        game.addEventListener('message', function(e){
          console.log(arguments);
        });

        $scope.game = game;

        //for the moment:

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







        $scope.pauseGame = function () {
            game.loop.pause();
        };

        $scope.endGame = function () {
            game.loop.stop();
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
/*
        var player = game.addPlayer();
        player.on("die", function() {
          $scope.endGame();
        });
        player.on("complete_move", function(delta_x, delta_y) {
          // setTimeout(function(){center(player.el);}, 100);
          // window.scrollBy(deltas.delta_x * 16, deltas.delta_y * 16);
          $("html,body").animate({
            scrollTop: document.body.scrollTop + delta_y * 16,
            scrollLeft: document.body.scrollLeft + delta_x * 16
          }, 200);
        });
        game.loop.explore(1024 - 8, 1024 - 8, gridsize);
        game.loop.start();
*/

    }]);
