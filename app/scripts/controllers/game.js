"use strict";
// document.body.style.width = "2048em";
// document.body.style.height = "2048em";
function center(el) {
    $("html,body").animate({
        scrollTop: $(el).offset().top - ( $(window).height() - $(this).outerHeight(true) ) / 2,
        scrollLeft: $(el).offset().left - ( $(window).width() - $(this).outerWidth(true) ) / 2
    }, 200);
}
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

        var gridsize = 16;
        $scope.cellsize = 16;
        $scope.iconPrefix = "icon-";
        $scope.entities = [];
        $scope.world = {};
        $scope.score = 0;

        $scope.findEntityByPosition = function (x, y) {
            var collisions = [];
            for (var i = $scope.entities.length - 1; i >= 0; i--) {
                if ($scope.entities[i].position.x == x && $scope.entities[i].position.y == y) {
                    collisions.push($scope.entities[i]);
                }
            }
            return collisions;
        };

        function addPlayer() {
            var x = 1024;//Math.floor(Math.random() * gridsize);
            var y = 1024;//Math.floor(Math.random() * gridsize);

            // while ($scope.findEntityByPosition(x, y) !== false) {
            //     x = Math.floor(Math.random() * gridsize);
            //     y = Math.floor(Math.random() * gridsize);
            // }

            var player = new Entity(env_schematics.player($scope, x, y));
            player.on("die", function () {
                $scope.endGame();
            });
            player.on("complete_move", function (deltas) {
                // setTimeout(function(){center(player.el);}, 100);
                // window.scrollBy(deltas.delta_x * 16, deltas.delta_y * 16);
                $("html,body").animate({
                    scrollTop: document.body.scrollTop + deltas.delta_y * 16,
                    scrollLeft: document.body.scrollLeft + deltas.delta_x * 16
                }, 200);
            });

            $scope.entities.push(player);
            center(player.el);
        }

        function placeEgg($scope, _x, _y) {
            var egg = new Entity(env_schematics.egg($scope, _x, _y));

            egg.on("die", function () {
                $scope.$apply(function () {
                    $scope.score += egg.worth;
                });
            });

            egg.frameId = egg.on("frame", function (frame) {

                if (frame % gameSpeed === 0) {
                    this.age++;
                    if (this.age > 10) {
                        console.log("should hatch");
                        this.transition("hatch");

                        return true;

                    }
                }

                return false;

            });

            egg.on("transition:hatch", function hatch(monster) {
                monster.remove("frame", monster.frameId);
                console.log("hatch");
                monster.frameId = monster.on("frame", function (frame) {

                    if (frame % gameSpeed === 0) {
                        this.age++;
                        if (this.age > 20) {
                            this.transition("evolve");
                            return true;
                        }
                        beast_move(this);
                        return true;
                    }

                    return false;

                });
            });
            egg.on("transition:evolve", function evolve(monster) {
                monster.remove("frame", monster.frameId);
                monster.lay = function () {
                    var newEgg = placeEgg($scope, this.position.x, this.position.y);
                    this.world.entities.push(newEgg);
                };
                monster.frame_id = monster.on("frame", function (frame) {
                    if (!(frame % settings.gamespeed)) {
                        //chance to lay
                        var test = Math.floor(Math.random() * 10);
                        if (test == 0 && $scope.findEntityByPosition(this.position.x, this.position.y).length < 2) {
                            this.lay();
                        }
                        beast_move(this);
                        return true;
                    } else {
                        return false;
                    }
                });
            });

            return egg;
        }

        $scope.explore = function (x, y, size) {
            for (var i = x; i < x + size; i++) {
                for (var e = y; e < y + size; e++) {
                    if ($scope.world[i + "/" + e] === undefined) {
                        $scope.world[i + "/" + e] = true;
                        if (Math.floor(Math.random() * 2) > 0 && $scope.findEntityByPosition(i, e).length < 1) {
                            var blocktype = env_schematics.block($scope);
                            blocktype.position = {
                                x: i,
                                y: e,
                                z: parseInt(Math.random() * 100, 10)
                            };
                            if (blocktype.id) {
                                blocktype.classVal = $scope.iconPrefix + blocktype.id;
                            }

                            $scope.entities.push(new Entity(blocktype));
                        }
                    }
                }
            }

            for (var n = 0; n < Math.floor(size / 5); n++) {

                var _x = Math.floor(Math.random() * size + x);
                var _y = Math.floor(Math.random() * size + y);

                while ($scope.findEntityByPosition(_x, _y).length > 0) {
                    _x = Math.floor(Math.random() * size + x);
                    _y = Math.floor(Math.random() * size + y);
                }
                var egg = placeEgg($scope, _x, _y);
                $scope.entities.push(egg);
            }
        };


        /*
         world should have
         environment = {
         loop,///the game loop
         entities,///the list of entities
         world,///a representation of the list of entities?
         explore?///the ability to add to the entities, works with world

         }
         */

        $scope.loop = new Entity({
            kind: "loop",
            components: [WorldComponent],
            world: $scope
        });

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

        $scope.submitHighscore = function () {
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
