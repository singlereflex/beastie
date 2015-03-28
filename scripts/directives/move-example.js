"use strict";

/**
 * @ngdoc directive
 * @name beastieApp.directive:moveExample
 * @description
 * # moveExample
 */
angular.module("beastieApp")
    .directive("moveExample", function () {
        return {
            templateUrl: "entities.html",
            restrict: "E",
            transclude: true,
            scope: {},
            controller: function ($scope, $interval) {
                var frameNum = 0;
                var frames = 4;

                $scope.entities = [
                    {
                        kind: "player",
                        classVal: "icon-entities-player",
                        position: {
                            x: 1,
                            y: 1,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 0,
                            y: 0,
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
                            x: 0,
                            y: 3,
                            z: parseInt(Math.random()*4).toString()
                        }
                    },
                    {
                        kind: "block",
                        classVal: "icon-environment-block",
                        position: {
                            x: 1,
                            y: 3,
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
                            x: 3,
                            y: 1,
                            z: parseInt(Math.random()*4).toString()
                        }
                    }
                ];

                var anim = $interval(function(){

                    frameNum++;
                    frameNum %= frames;

                    switch(frameNum) {
                    case 0:
                        $scope.entities[0].position.x = 1;
                        $scope.entities[0].position.y = 1;
                        $scope.entities[5].position.y = 2;
                        break;
                    case 1:
                        $scope.entities[0].position.x = 2;
                        break;
                    case 2:
                        $scope.entities[0].position.y = 2;
                        $scope.entities[5].position.y = 3;
                        break;
                    case 3:
                        $scope.entities[0].position.x = 1;
                        break;
                    }

                }, 1000);
                $scope.$on("$destroy", function(){
                    $interval.cancel(anim);
                });
            }
        };
    });
