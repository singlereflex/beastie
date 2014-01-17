'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', function ($scope, beastieEnv) {
        
        var frame = 0;
        
        var gridsize = 16;
        $scope.cellsize = 16;
        // var backgrid = new Array(gridsize);
        $scope.iconPrefix = 'icon-';
        $scope.entities = [];
        $scope.world = {};

        $scope.findEntityByPosition = function(x, y){
            for (var i = $scope.entities.length - 1; i >= 0; i--) {
                if($scope.entities[i].position.x == x && $scope.entities[i].position.y == y){
                    return $scope.entities[i];
                }
            };
            
        }

        function addPlayer(){
            var x = Math.floor(Math.random()*gridsize);
            var y = Math.floor(Math.random()*gridsize);

            while($scope.findEntityByPosition(x, y) !== undefined){
                x = Math.floor(Math.random()*gridsize);
                y = Math.floor(Math.random()*gridsize);
            }
            $scope.entities.push(new Entity(env_schematics.player($scope, x, y)));
        }
        

        $scope.explore = function(x, y, size){
            console.log('exploreing');
            for (var i = x; i < x+size; i++) {
                // backgrid[i] = new Array(gridsize);
                for (var e = y; e < y+size; e++) {
                    if($scope.world[i+"/"+e] === undefined){
                        $scope.world[i+"/"+e] = true;
                        if(Math.floor(Math.random() * 2) > 0 && $scope.findEntityByPosition(i, e) === undefined){
                            var blocktype = env_schematics.block($scope);
                            blocktype.position = {
                                x: i,
                                y: e
                            }
                            var classVal = '';

                            if (blocktype.id) {
                                blocktype.classVal = $scope.iconPrefix + blocktype.id;
                            }
                            // console.log(blocktype);
                            $scope.entities.push(new Entity(blocktype));
                        }
                    }
                }
            }
            for (var i = 0; i < Math.floor(size/5); i++) {

                var _x = Math.floor(Math.random()*size + x);
                var _y = Math.floor(Math.random()*size + y);

                while($scope.findEntityByPosition(_x, _y) !== undefined){
                    _x = Math.floor(Math.random()*size + x);
                    _y = Math.floor(Math.random()*size + y);
                }

                $scope.entities.push(new Entity(env_schematics.egg($scope, _x, _y)));
            }
        }

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
                            components:[WorldComponent],
                            world:$scope
                        });
        $scope.explore(0,0, gridsize);
        addPlayer();
        $scope.loop.start();
        // $scope.loop.pause();
    }]);
