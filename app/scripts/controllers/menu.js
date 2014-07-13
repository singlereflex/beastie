"use strict";

/**
 * @ngdoc function
 * @name beastieApp.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the beastieApp
 */
angular.module("beastieApp")
    .controller("MenuCtrl", function ($scope) {
        $scope.entities = [];

        var letters = [
            "####   ####   ###    ####  ####  ##  ####",
            "## ##  ##    ## ##  ##      ##   ##  ##  ",
            "####   ####  #####   ###    ##   ##  ####",
            "## ##  ##    ## ##     ##   ##   ##  ##  ",
            "####   ####  ## ##  ####    ##   ##  ####"
        ];

        $scope.titleStyle = {
            width: letters[0].length+"em",
            height: letters.length+"em"
        };

        $scope.keyPressed = function(e) {
            console.log(e);
        };

        for (var i = 0; i < letters.length; i++) {
            for (var e = 0; e < letters[i].length; e++) {
                var letter = letters[i].charAt(e);
                switch (letter) {
                    case "#":
                        $scope.entities.push({
                            kind: "block",
                            classVal: "icon-environment-block",
                            position: {
                                x: e,
                                y: i,
                                z: parseInt(Math.random()*4).toString()
                            }
                        });
                        break;
                }
            }
        }
    });
