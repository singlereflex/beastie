"use strict";
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
var viewport = {
  x:0,
  y:0
}
angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "beastieEnv", "$firebase", "$log", "$state", function ($scope, beastieEnv, $firebase, $log, $state) {
        var gridsize = 16;
        var cellsize = 16;
        var world = {};

        $scope.score = 0;


        var game = new Worker('scripts/worker/game.js');//new Game();

        // game.postMessage();
        var player = new DummyPlayer(game);
        game.addEventListener('message', function(e){
          switch(e.data.event){
            case 'place':
              world[e.data._id] = new Display(e.data.entity, e.data.icon);
              if(e.data.entity.kind == "player"){
                player.display = world[e.data._id];
                viewport.x = world[e.data._id].position.x;
                viewport.y = world[e.data._id].position.y;
              }
              break;
            case 'complete_move':
              // console.log("move");

              world[e.data._id].position = {
                x: e.data.entity.position.x,
                y: e.data.entity.position.y
              }
              world[e.data._id].kind = e.data.entity.kind
              world[e.data._id].icon = e.data.entity.icon
              world[e.data._id].move(e.data.deltas.delta_x, e.data.deltas.delta_y, e.data.entity);


            break;
            case 'die':
              world[e.data._id].die();
              delete world[e.data._id];
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

          // console.log(arguments);
        });

        var canvas = document.getElementById('entityboard')
        var context = canvas.getContext('2d');


        var frameId;
        function render(){
          for(var key in world){
            // console.log(world[key]);
            world[key].draw(context);
          }
          frameId = requestAnimationFrame(render);
        }

        render();

        var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
        // Automatically syncs everywhere in real time.
        $scope.scoreboard = $firebase(highScoreRef);

        $scope.endGame = function () {
          cancelAnimationFrame(frameId);
          game.terminate();
          player.dead = true;
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
