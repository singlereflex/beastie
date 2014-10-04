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

var sprites = {};
sprites['icon-entities-player'] = new Image();
sprites['icon-entities-player'].src = '../../svg/uE004-entities-player.svg';
sprites['icon-environment-block'] = new Image();
sprites['icon-environment-block'].src = '../../svg/uE005-environment-block.svg';
sprites['icon-entities-egg'] = new Image();
sprites['icon-entities-egg'].src = '../../svg/uE001-entities-egg.svg';
sprites['icon-entities-monster'] = new Image();
sprites['icon-entities-monster'].src = '../../svg/uE002-entities-monster.svg';
sprites['icon-entities-mother'] = new Image();
sprites['icon-entities-mother'].src = '../../svg/uE003-entities-mother.svg';

angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "$log", "$state", function ($scope, $log, $state) {
        var gridsize = 16;
        var cellsize = 16;
        var world = {};
        var queue = [];
        var renderQueue = [];
        $scope.score = 0;

        var handleMessage = function(e){
          switch(e.data.event){
            case 'place':
              world[e.data._id] = new Display(e.data.entity, e.data.icon);
              if(e.data.entity.kind == "player"){
                player.display = world[e.data._id];
                viewport.x = world[e.data._id].position.x;
                viewport.y = world[e.data._id].position.y;
              }
              if(world[e.data._id].position.x < viewport.x+(canvas.width/2)/24
              && world[e.data._id].position.x > viewport.x-(canvas.width/2)/24
              && world[e.data._id].position.y < viewport.y+(canvas.height/2)/24
              && world[e.data._id].position.y > viewport.y-(canvas.height/2)/24){
                renderQueue.push(world[e.data._id]);
              }
              break;
            case 'complete_move':
              // console.log("move");

              world[e.data._id]._position = {
                x: e.data.entity.position.x,
                y: e.data.entity.position.y
              }

              if(world[e.data._id]._position.x < viewport.x+(canvas.width/2)/24
              && world[e.data._id]._position.x > viewport.x-(canvas.width/2)/24
              && world[e.data._id]._position.y < viewport.y+(canvas.height/2)/24
              && world[e.data._id]._position.y > viewport.y-(canvas.height/2)/24){
                var index = renderQueue.indexOf(world[e.data._id]);
                if(index < 0){
                  renderQueue.push(world[e.data._id]);
                }
              } else {
                var index = renderQueue.indexOf(world[e.data._id]);
                if(index > -1){
                  renderQueue.splice(index, 1);
                }
              }
              // world[e.data._id].kind = e.data.entity.kind
              // world[e.data._id].icon = e.data.entity.icon
              // world[e.data._id].move(e.data.deltas.delta_x, e.data.deltas.delta_y, e.data.entity);


            break;
            case 'die':

              if(e.data.entity.kind == "player"){
                //let some things finish moving
                setTimeout(function(){
                  $scope.endGame();
                }, 250);
              } else {
                $scope.score += e.data.worth;
              }
              var index = renderQueue.indexOf(world[e.data._id]);
              if(index > -1){
                renderQueue.splice(index, 1);
              }
              world[e.data._id].die();
              delete world[e.data._id];
              if(!$scope.$$phase){
                $scope.$apply();
              }
            break;
            case 'transition':
              world[e.data._id].render(e.data.entity, e.data.icon);
            break;
          }

          // console.log(arguments);
        };



        var game = new Worker('scripts/worker/game.js');//new Game();

        // game.postMessage();
        var player = new DummyPlayer(game);
        game.addEventListener('message', function(e){
          queue.push(e);
        });
        window.addEventListener('resize', resizeCanvas, false);
        var canvas = document.getElementById('entityboard');

        var context = canvas.getContext('2d');
        function resizeCanvas() {

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            //update worker viewport:
            game.postMessage({
              event: 'viewport',
              height: canvas.width,
              width: canvas.height
            });
        }
        resizeCanvas();

        var frameId;
        function render(){
          var current_length = queue.length;
          for(var i = 0; i < current_length; i++){
            handleMessage(queue.shift());
          }

          context.clearRect(0,0,canvas.width, canvas.height);
          console.log(renderQueue.length);
          for(var i = 0; i < renderQueue.length; i++){
            renderQueue[i].draw(context);
          }
          frameId = requestAnimationFrame(render);
        }

        render();

        $scope.endGame = function () {
          cancelAnimationFrame(frameId);
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
