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


        var place = function(type) {
            world.actors.place(new BL.entities[type](i, e, world));
        };

        /**
         * Submit a level and it's solution for review and eventual inclusion in the game
         * @param  {JSON} level    The JSON describing the current level
         * @param  {JSON} solution The JSON set of moves that result in a solution to the puzzle
         * @return {Boolean}       True if it looks valid and has been submitted
         */
        var submit = function(level, solution) {
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

        /**
         * Play the level you've created
         *
         * This must be done before submit becomes available
         *
         * @param  {Boolean} withBeasts If this is true populate beasts as well if not don't
         */
        var play = function(withBeasts) {

        }

        //should list types and then would be
        //able to render them in a simple loop if
        //the names of the renderer matched the constructor
        //..which they should

        $scope.types = Object.keys(BL.actors);

        $scope.activeType;
        $scope.place = function() {
            place($scope.activeType);
        };

        //init:
        var new_level = new Game('entityboard', {}, true);
    }]);
