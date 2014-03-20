'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', '$firebase', '$modal', '$log', function ($scope, beastieEnv, $firebase, $modal, $log) {

        var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
        // Automatically syncs everywhere in realtime
        $scope.scoreboard = $firebase(highScoreRef);

        var gridsize = 16;
        $scope.cellsize = 16;
        $scope.iconPrefix = 'icon-';
        $scope.entities = [];
        $scope.world = {};
        $scope.score = 0;

        $scope.findEntityByPosition = function (x, y) {
            for (var i = $scope.entities.length - 1; i >= 0; i--) {
                if ($scope.entities[i].position.x == x && $scope.entities[i].position.y == y) {
                    return $scope.entities[i];
                }
            }
            return false;
        };

        function addPlayer() {
            var x = Math.floor(Math.random() * gridsize);
            var y = Math.floor(Math.random() * gridsize);

            while ($scope.findEntityByPosition(x, y) !== false) {
                x = Math.floor(Math.random() * gridsize);
                y = Math.floor(Math.random() * gridsize);
            }

            var player = new Entity(env_schematics.player($scope, x, y));
            player.on('die', function () {
                $scope.endGame();
            });
            player.on('complete_move', function (deltas) {
                window.scrollBy(deltas.delta_x * 16, deltas.delta_y * 16);
            });

            $scope.entities.push(player);
        }

        function placeEgg($scope, _x, _y) {
            var egg = new Entity(env_schematics.egg($scope, _x, _y));

            egg.on('die', function () {
                $scope.$apply(function () {
                    $scope.score += egg.worth;
                });
            });

            egg.frame_id = egg.on('frame', function (frame) {
                if (!(frame % gamespeed)) {
                    this.age++;
                    if (this.age > 10) {

                        this.transition('hatch');

                        return true;

                    }
                }

                return false

            });

            egg.on('transition:hatch', function hatch(monster) {
                monster.remove('frame', monster.frame_id);
                monster.frame_id = monster.on('frame', function (frame) {

                    if (!(frame % gamespeed)) {
                        this.age++;
                        if (this.age > 20) {
                            this.transition('evolve');
                            return true;
                        }
                        var delta = (Math.floor(Math.random() * 3) - 1);
                        var y = Math.floor(Math.random() * 2);
                        this.move((1 - (y)) * delta, (y) * delta);

                        return true;
                    }

                    return false;

                });
            });
            egg.on('transition:evolve', function evolve(monster) {
                monster.remove('frame', monster.frame_id);
                monster.lay = function () {
                    var newEgg = placeEgg($scope, this.position.x, this.position.y);
                    this.world.entities.push(newEgg);
                };
                monster.frame_id = monster.on('frame', function (frame) {
                    if (!(frame % gamespeed)) {
                        var delta = (Math.floor(Math.random() * 3) - 1);
                        var y = Math.floor(Math.random() * 2);
                        var test = Math.floor(Math.random() * 10);
                        if (test == 0) {
                            this.lay();
                        }
                        this.move((1 - (y)) * delta, (y) * delta);
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
                        if (Math.floor(Math.random() * 2) > 0 && $scope.findEntityByPosition(i, e) === false) {
                            var blocktype = env_schematics.block($scope);
                            blocktype.position = {
                                x: i,
                                y: e
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

                while ($scope.findEntityByPosition(_x, _y) !== false) {
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
            kind: 'loop',
            components: [WorldComponent],
            world: $scope
        });

        $scope.pauseGame = function() {
            $scope.loop.pause();

            var modalInstance = $modal.open({
                templateUrl: 'views/modal_score_list.html',
                controller: 'HighscoreModalCtrl',
                scope: $scope
            });

            modalInstance.result.then(function (selectedItem) {
                $log.info(selectedItem);
                $scope.loop.start();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
                $scope.loop.start();
            });
        };

        $scope.endGame = function() {
            $scope.loop.stop();

            var modalInstance = $modal.open({
                templateUrl: 'views/modal_score_submit.html',
                controller: 'HighscoreModalCtrl',
                scope: $scope
            });

            modalInstance.result.then(function (name) {
                $log.info(name);
                highScoreRef.push({name: name, score: $scope.score});
                location.reload();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
                location.reload();
            });

        };

        $scope.explore(0, 0, gridsize);
        addPlayer();
        $scope.loop.start();


    }]);
