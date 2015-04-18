"use strict";

/**
 * @ngdoc directive
 * @name beastieApp.directive:pullExample
 * @description
 * # pullExample
 */
angular.module("beastieApp")
    .directive("pullExample", function () {
        return {
            templateUrl: "entities.html",
            restrict: "E",
            transclude: true,
            scope: {},
            controller: function ($scope, $interval) {
                var frameNum = 0;
                var frames = 8;

                $scope.entities = [
                    {
                        kind: "player",
                        classVal: "icon-entities-player",
                        position: {
                            x: 2,
                            y: 0,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 2,
                            y: 2,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 3,
                            y: 0,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 1,
                            y: 2,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 2,
                            y: 3,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 3,
                            y: 1,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 0,
                            y: 1,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 3,
                            y: 3,
                            z: parseInt(Math.random()*4).toString()
                        }
                    }
                ];

                var anim = $interval(function(){

                    frameNum++;
                    frameNum %= frames;

                    var player = $scope.entities[0].position;
                    var block1 = $scope.entities[1];
                    var block2 = $scope.entities[2];

                    switch(frameNum) {
                    case 0:
                        player.x = 2;
                        player.y = 0;
                        break;
                    case 1:
                        player.x = 2;
                        player.y = 1;
                        break;
                    case 2:
                        player.x = 2;
                        player.y = 0;
                        block1.position.y = 1;
                        break;
                    case 3:
                        player.x = 1;
                        player.y = 0;
                        block2.position.x = 2;
                        break;
                    case 4:
                        player.x = 0;
                        player.y = 0;
                        block2.position.x = 1;
                        break;
                    case 5:
                        player.x = -1;
                        player.y = 0;
                        block2.position.x = 0;
                        break;
                    case 6:
                        player.x = -1;
                        player.y = -1;
                        break;
                    case 7:
                        player.x = 2;
                        player.y = -1;
                        block1.position.y = 2;
                        block2.position.x = 3;
                        break;
                    }

                }, 500);
                $scope.$on("$destroy", function(){
                    $interval.cancel(anim);
                });
            }
        };
    });