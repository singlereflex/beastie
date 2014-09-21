"use strict";
// document.body.style.width = "2048em";
// document.body.style.height = "2048em";

angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "beastieEnv", "$firebase", "$log", "$state", function ($scope, beastieEnv, $firebase, $log, $state) {
        var gridsize = 16;
        var cellsize = 16;
        var world = {};

        _.templateSettings = {
            interpolate: /\{\{(.+?)\}\}/g
        };
        var template = _.template('<i class="{{ classVal }}"></i>');


        var game = new Worker('/scripts/game.js');//new Game();
        game.postMessage();

        function DomRenderer(entity, innerHTML) {
            if (entity.el !== undefined) {
                document.getElementById('entityboard').removeChild(entity.el);
            }
            var div = document.createElement('div');
            div.innerHTML = innerHTML;
            div.className = "entity " + entity.kind;
            div.style.left = entity.position.x + 'em';
            div.style.top = entity.position.y + 'em';
            entity.el = div;
            entity.trigger('rendered', entity);
        }

        var Display = function(player, icon){
          this._events = {};
          var self = this;
          this.on('rendered', function(){
            self.el = document.getElementById('entityboard').appendChild(self.el);
            if(player.kind == 'player'){
              center(self.el);
            }
            // player.el = self.el;
            // player.on('complete_move', function (delta_x, delta_y) {
            //     self.el.style.top = player.position.y + 'em';
            //     self.el.style.left = player.position.x + 'em';
            // });
          });
          // player.on('die', function(){
          //   document.getElementById('entityboard').removeChild(self.el);
          // });

          this.render = function(player, icon){
            console.log(icon);
            self.position = {
              x: player.position.x,
              y: player.position.y
            }
            self.kind = player.kind
            DomRenderer(self, template({classVal: icon}));
          }

          this.render(player, icon);
        }
        EventComponent(Display);

        game.addEventListener('message', function(e){
          switch(e.data.event){
            case 'place':
              if(world[e.data.id] === undefined){
                world[e.data.id] = []
              }
              world[e.data.id].push(new Display(e.data.entity, e.data.icon))
              break;
            case 'complete_move':
              // world[e.data.id].el.style.top = e.data.entity.position.y + 'em';
              // world[e.data.id].el.style.left = e.data.entity.position.x + 'em';
            break;
            case 'die':
            break;
            case 'transition':
            break;
          }

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
