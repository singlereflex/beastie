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

        //should list types and then would be
        //able to render them in a simple loop if
        //the names of the renderer matched the constructor
        //..which they should

        $scope.types = Object.keys(BL.actors);

        $scope.activeType;
        $scope.place = function() {
            place($scope.activeType);
        };


    }]);
