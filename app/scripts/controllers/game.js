"use strict";
// document.body.style.width = "2048em";
// document.body.style.height = "2048em";

angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "beastieEnv", "$firebase", "$log", "$state", function ($scope, beastieEnv, $firebase, $log, $state) {
        var gridsize = 16;
        var cellsize = 16;
        var world = {};

        $scope.score = 0;


        var game = new Worker('/scripts/worker/game.js');//new Game();

        // game.postMessage();

        game.addEventListener('message', function(e){
          switch(e.data.event){
            case 'place':
              world[e.data._id] = new Display(e.data.entity, e.data.icon);
              break;
            case 'complete_move':
              console.log("move");

              world[e.data._id].el.style.top = e.data.entity.position.y + 'em';
              world[e.data._id].el.style.left = e.data.entity.position.x + 'em';
            break;
            case 'die':
              document.getElementById('entityboard').removeChild(world[e.data._id].el);
              // delete world[e.data._id];
              if(e.data.entity.kind == "player"){
                $scope.endGame();
              } else {
                $scope.score += e.data.worth;
              }
              if(!$scope.$$phase){
                $scope.$apply();
              }
            break;
            case 'transition':
              world[e.data._id].render(e.data.entity, e.data.icon);
            break;
          }

          console.log(arguments);
        });

        var player = new DummyPlayer(game);

        var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
        // Automatically syncs everywhere in real time.
        $scope.scoreboard = $firebase(highScoreRef);

        $scope.endGame = function () {
          //game.terminate();
          $state.go("game.ended");
        };

        $scope.submitHighscore = function(name) {
          console.log(arguments)
            highScoreRef.push({name: name, score: $scope.score});
            $state.go("highscore");
        };

        $scope.restartGame = function () {
            location.reload();
        };
    }]);
