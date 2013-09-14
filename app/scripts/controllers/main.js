'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', function ($scope, beastieEnv) {
        var gridsize = 51;
        var backgrid = new Array(gridsize);
        $scope.iconPrefix = 'icon-';

        for (var i = 0; i < gridsize; i++) {
            backgrid[i] = Array(gridsize);
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
                keyboard: true,
                x: gridsize/2,
                y: gridsize/2
            }
        ];
    }]);
