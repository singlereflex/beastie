"use strict";

angular.module("beastieApp")
    .controller("WorkshopCtrl", ["$scope", "$log", "$state", "$rootScope", function($scope, $log, $state, $rootScope) {

        // world.entities.place(new BL.Block(i, e, world));
        //
        // world.entities.place(new BL.Egg(i, e, world));
        //
        // world.entities[i + "," + e] = [];
        //
        // world.entities.place(new BL.Monster(i, e, world));
        //
        // world.entities.place(new BL.Mother(i, e, world));
        //
        // world.entities.place(new BL.Floor(i, e, world));
        //
        // world.entities.place(new BL.Switch(i, e, world));

        /**
         * Submit a level and it's solution for review and eventual inclusion in the game
         * @param  {JSON} level    The JSON describing the current level
         * @param  {JSON} solution The JSON set of moves that result in a solution to the puzzle
         * @return {Boolean}       True if it looks valid and has been submitted
         */
        var submit = function(level, solution) {
            return;
            //can only level a game for consideration if you've beaten it
            var TestGame = new Game(level);
            for(var i = 0; i < solution.length; i++) {
                //call whatever solution[i] says
            }
            if (Game.won) {
                //do stuff
                return true;
            }
            return false;
        }

        // world.explore = function (x, y, size) {
        //     var noise = new Noise(Math.random());
        //
        //     for (var i = x; i < x + size; i++) {
        //         for (var e = y; e < y + size; e++) {
        //             if (world.entities[i + "," + e] === undefined) {
        //                 if (noise.simplex2(i, e / 10) > 0.5 || noise.simplex2(i / 10, e) > 0.5) {
        //                     self.place('Block', i, e);
        //                     // world.entities.place(new BL.actors.Block(i, e, world));
        //                 } else if (noise.simplex2(i / 8, e / 8) > 0.5) {
        //                     self.place('Egg', i, e);
        //                     // world.entities.place(new BL.actors.Egg(i, e, world));
        //                 } else {
        //                     // world.entities[i + "," + e] = [];
        //                 }
        //             }
        //         }
        //     }
        // };

        //should list types and then would be
        //able to render them in a simple loop if
        //the names of the renderer matched the constructor
        //..which they should

        $scope.types = [
            'Egg',
            'Block',
            'Floor',
            // 'Switch'
        ];

        $scope.activeType = $scope.types[0];
        $scope.setType = function(type) {
            $scope.activeType = type;
        }
        //init:
        var new_level = new Game('entityboard', {}, true);

        new_level.on('click', function(event) {
            console.debug($scope.activeType);
            new_level.place($scope.activeType, event.data.global.x, event.data.global.y);
        });

        $scope.submit = function() {
            new_level.export();
        }
    }]);
