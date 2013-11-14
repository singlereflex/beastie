'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', function ($scope, beastieEnv) {
        var gridsize = 32;
        $scope.cellsize = 16;
        var backgrid = new Array(gridsize);
        $scope.iconPrefix = 'icon-';

        for (var i = 0; i < gridsize; i++) {
            backgrid[i] = new Array(gridsize);
            for (var e = 0; e < gridsize; e++) {
                var blocktype = _.sample(beastieEnv);
                var classVal = '';

                if (blocktype.id) {
                    if (blocktype.dir) {
                        var dir = _.chain(blocktype.dir)
                            .filter(function(num){ return Math.random() < 0.2; })
                            .value();

                        if (!dir.length) {
                            dir = _.sample(blocktype.dir);
                        } else {
                            dir = dir.reduce(function(memo, d){ return memo + d; });
                        }

                        classVal = $scope.iconPrefix + blocktype.id + dir;
                    } else {
                        classVal = $scope.iconPrefix + blocktype.id;
                    }
                }

                backgrid[i][e] = {
                    classVal : classVal
                };
            }
        }

        $scope.environment = backgrid;

        $scope.entities = [
            {
                kind: 'player',
                classVal: $scope.iconPrefix + 'entities-player',
                keyboard: true,
                x: Math.floor(Math.random()*gridsize),
                y: Math.floor(Math.random()*gridsize)
            }
        ];

        for (var i = 0; i < 10; i++) {
            $scope.entities.push({
                kind: 'monster',
                classVal: $scope.iconPrefix + 'entities-monster',
                keyboard: false,
                x: Math.floor(Math.random()*gridsize),
                y: Math.floor(Math.random()*gridsize)
            });
        }

        for (var i = 0; i < 5; i++) {
            $scope.entities.push({
                kind: 'mother',
                classVal: $scope.iconPrefix + 'entities-mother',
                keyboard: false,
                x: Math.floor(Math.random()*gridsize),
                y: Math.floor(Math.random()*gridsize)
            });
        }

        for (var i = 0; i < 20; i++) {
            $scope.entities.push({
                kind: 'egg',
                classVal: $scope.iconPrefix + 'entities-egg',
                keyboard: false,
                x: Math.floor(Math.random()*gridsize),
                y: Math.floor(Math.random()*gridsize)
            });
        }

        var frame = 0;
        var gamespeed = 45;

        (function animloop(){
            frame++;

            requestAnimFrame(animloop);
            if (!(frame % gamespeed)) {
                for (var i = 0; i < $scope.entities.length; i++) {
                    var value = $scope.entities[i];
                    if (value.kind === "monster") {

                        var newX = value.x + (Math.floor(Math.random() * 3) - 1);
                        var newY = value.y + (Math.floor(Math.random() * 3) - 1);

                        newX = Math.max(0, newX);
                        newX = Math.min(gridsize-1, newX);

                        newY = Math.max(0, newY);
                        newY = Math.min(gridsize-1, newY);

                        value.x = Math.floor(newX);
                        value.y = Math.floor(newY);
                    }
                }
                $scope.$apply();
            }
        })();

    }]);
