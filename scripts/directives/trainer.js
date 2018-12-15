"use strict";

/**
 * @ngdoc directive
 * @name beastieApp.directive:killExample
 * @description
 * # killExample
 */
angular.module("beastieApp")
    .directive("trainer", function () {
        return {
            templateUrl: "entities.html",
            restrict: "E",
            transclude: true,
            scope: {
                training: "="
            },
            controller: function ($scope) {

                var trainer = new Worker("scripts/worker/trainer.js");

                $scope.$on("destroy", function(){
                    trainer.terminate();
                });

                $scope.training.board = {
                    x: 50,
                    y: 50,
                    bounds: 5
                };

                trainer.postMessage({
                    event: "train",
                    trainings: $scope.training.trainings
                });

                $scope.training.ready = false;

                $scope.entities = [
                    {
                        kind: "monster",
                        classVal: "icon-entities-monster",
                        trainee: true,
                        position: {
                            x: 2,
                            y: 2
                        }
                    },
                    {
                        kind: "player",
                        classVal: "icon-entities-player",
                        position: {
                            x: 0,
                            y: Math.floor(Math.random()*5)
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 1,
                            y: Math.floor(Math.random()*5)
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 3,
                            y: Math.floor(Math.random()*5)
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 4,
                            y: Math.floor(Math.random()*5)
                        }
                    }
                ];

                var smartEntity = $scope.entities[0];

                trainer.addEventListener("message", function (e) {
                    if (e.data) {
                        switch (e.data.event) {
                            case "trained":
                                $scope.$apply(function(){
                                    $scope.training.ready = true;
                                });
                                break;
                            case "action":
                                angular.forEach(e.data.action, function(val, key){
                                    var newPos = {
                                        x: smartEntity.position.x,
                                        y: smartEntity.position.y
                                    };

                                    newPos[key] -= val;

                                    var other = _.filter($scope.entities, function(ent){
                                        return ent.position.x === newPos.x && ent.position.y === newPos.y;
                                    });

                                    var canMove = true;

                                    if (other.length) {
                                        switch (other[0].kind) {
                                            case "player":
                                                $scope.training.score += 30;

                                                other[0].dead = true;
                                                break;
                                            case "block":
                                                $scope.training.score -= 1;
                                                canMove = false;
                                                break;
                                        }
                                    }

                                    if (canMove) {

                                        $scope.training.board[key] += val;
                                        smartEntity.position = newPos;

                                        angular.forEach($scope.entities, function(ent){
                                            ent.position[key] += val;
                                                ent.position[key] = (ent.position[key] + 500) % $scope.training.board.bounds;

                                        });

                                    }
                                });
                                break;
                        }
                    }
                });

                $scope.training.tick = function(){

                    angular.forEach($scope.entities, function(ent, index){
                        if (ent.dead) {

                            var test, newPos;

                            var testPos = function(ent){
                                return ent.position.x === newPos.x &&
                                    ent.position.y === newPos.y;
                            };

                            do {

                                newPos = {
                                    x: Math.floor(Math.random()*5),
                                    y: Math.floor(Math.random()*5)
                                };

                                test = _.filter($scope.entities, testPos);

                            } while (test.length > 0);

                            $scope.entities.splice(index, 1);
                            $scope.entities.push({
                                kind: "player",
                                classVal: "icon-entities-player",
                                position: newPos
                            });

                        }
                    });

                    var closeby = _.filter($scope.entities, function(other){
                        return Math.abs(smartEntity.position.x - other.position.x) < 3 &&
                            Math.abs(smartEntity.position.y - other.position.y) < 3;
                    });

                    var surroundings = {};

                    for (var i = 0; i < closeby.length; i++) {
                        var key = (smartEntity.position.x - closeby[i].position.x) + "," + (smartEntity.position.y - closeby[i].position.y);
                        var ent = 0.5;
                        switch (closeby[i].kind) {
                            case "player":
                                ent = 1;
                                break;
                            case "egg":
                                ent = 0.75;
                                break;
                            case "mother":
                                ent = 0.25;
                                break;
                            case "block":
                                ent = 0;
                                break;
                        }

                        surroundings[key] = ent;
                    }

                    trainer.postMessage({
                        event: "think",
                        surroundings: surroundings
                    });
                };

            }
        };
    });
