"use strict";
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function () {
    var lastTime = 0;
    var vendors = ["ms", "moz", "webkit", "o"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] ||
        window[vendors[x] + "CancelRequestAnimationFrame"];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }

}());

BL.Sprites = {
    "icon-entities-player": new Image(),
    "icon-environment-block": new Image(),
    "icon-entities-egg": new Image(),
    "icon-entities-monster": new Image(),
    "icon-entities-mother": new Image()
};

BL.Sprites["icon-entities-player"].src = "../../svg/entities-player.svg";
BL.Sprites["icon-environment-block"].src = "../../svg/environment-block.svg";
BL.Sprites["icon-entities-egg"].src = "../../svg/entities-egg.svg";
BL.Sprites["icon-entities-monster"].src = "../../svg/entities-monster.svg";
BL.Sprites["icon-entities-mother"].src = "../../svg/entities-mother.svg";

angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "$log", "$state", "$rootScope", function ($scope, $log, $state, $rootScope) {

        var world = {};
        var map = {};//location based store
        var queue = [];

        var index;

        //could move this to a custom type later
        var renderQueue = [];

        $scope.score = 0;

        /*
        Math.sqrt(
          (player.x-entity.position.x)
          *(player.x-entity.position.x)
          +(player.y-entity.position.y)
          *(player.y-entity.position.y)
        )
        */


        var handleMessage = function (e) {

          //move render queue
            switch (e.data.event) {
                case "remove":
                  delete world[e.data._id];
                  break;
                case "place":
                    console.log('place');
                    //only add it if we don't already have it
                    if(!world[e.data._id]){
                      world[e.data._id] = new BL.Display(e.data.entity, e.data.icon);
                      if (e.data.entity.kind === "player") {
                          player.display = world[e.data._id];
                          BL.Viewport.x = world[e.data._id].position.x;
                          BL.Viewport.y = world[e.data._id].position.y;
                      }
                    }
                    break;
                case "completeMove":
                  console.log(e.data.entity.kind);
                    //TODO: some of this can be moved to worker
                    world[e.data._id]._position = {
                        x: e.data.entity.position.x,
                        y: e.data.entity.position.y
                    };

                    break;
                case "die":
                    if (e.data.entity.kind === "player") {
                        //let some things finish moving
                        setTimeout(function () {
                            $scope.endGame();
                        }, 250);
                    } else {
                        $scope.score += e.data.worth;
                    }

                    world[e.data._id].die();
                    delete world[e.data._id];
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    break;
                case "transition":
                    world[e.data._id].render(e.data.entity, e.data.icon);
                    break;
            }

            // console.log(arguments);


            // if(!(renderQueue.indexOf(world[e.data._id]) > -1))
            //   renderQueue.push(world[e.data._id]);

        };


        var game = new Worker("scripts/worker/game.js");
        var player = new BL.DummyPlayer(game);
        var canvas = document.getElementById("entityboard");
        var context = canvas.getContext("2d");
        var frameId;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            //update worker viewport:
            game.postMessage({
                event: "viewport",
                height: canvas.height/48,
                width: canvas.width/48
            });

        }

        function render() {
            // console.info("world", _.size(world));
            var currentLength = queue.length;
            // console.info("queue", currentLength);
            for (var i = 0; i < currentLength; i++) {
              try{
                handleMessage(queue.shift());
              } catch(e){
                console.error(e);
              }
            }
            context.clearRect(0, 0, canvas.width, canvas.height);

            for(var entity in world){
              try{
                world[entity].draw(context);
              } catch (e) {
                console.error(e);
                delete world[entity];
              }
            }

            frameId = window.requestAnimationFrame(render, canvas);
        }

        game.addEventListener("message", function (e) {
            queue.push(e);
        });

        window.addEventListener("resize", resizeCanvas, false);

        $scope.endGame = function () {
            window.cancelAnimationFrame(frameId);
            player.dead = true;
            $state.go("game.ended");
        };

        $scope.submitHighscore = function (name) {
            var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
            highScoreRef.push({name: name, score: $scope.score});
            var highscores = JSON.parse(localStorage.highscores);
            console.log(highscores);
            highscores.push({
              date: moment().valueOf(),
              score: $scope.score
            });
            console.log(highscores)
            localStorage.highscores = JSON.stringify(highscores);
            $rootScope.highscores = JSON.parse(localStorage.highscores);

            $rootScope.highscores = JSON.parse(localStorage.highscores);
            var current_game = $rootScope.highscores.length-1;
            $rootScope.highscores[current_game].current = true;
            console.log($rootScope.highscores);
            $state.go("highscore");
        };

        $scope.restartGame = function () {
            location.reload();
        };

        render();
        resizeCanvas();

    }]);
