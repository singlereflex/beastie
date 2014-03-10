'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', '$firebase', function ($scope, beastieEnv, $firebase) {
        
        var highscoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
        // Automatically syncs everywhere in realtime
        $scope.scoreboard = $firebase(highscoreRef);
        console.log($scope.scoreboard);
        var frame = 0;
        
        var gridsize = 16;
        $scope.cellsize = 16;
        // var backgrid = new Array(gridsize);
        $scope.iconPrefix = 'icon-';
        $scope.entities = [];
        $scope.world = {};
        $scope.score = 0;

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
            var player = new Entity(env_schematics.player($scope, x, y));
            player.on('die', function(){
                $scope.loop.pause();
            })
            player.on('complete_move', function(deltas){
                window.scrollBy(deltas.delta_x*16, deltas.delta_y*16);
            })
            $scope.entities.push(player);
        }
        

        $scope.recordScore = function(){
            console.log(arguments);
            console.log(this);
            highscoreRef.push({name: this.name, score: $scope.score});
            $('#board').modal({show: false});
        }


        function placeEgg($scope, _x, _y){
             var egg = new Entity(env_schematics.egg($scope, _x, _y));

            egg.on('die', function(){
                $scope.$apply(function(){
                    $scope.score += egg.worth;
                });
            });

            var frame_id = egg.on('frame', function(frame){
                // var test = Math.floor(Math.random() * 100);
                
                // console.log(this);
                // console.log(this.age);
                // console.log(test);
                if (!(frame % gamespeed)) {
                    this.age++;
                    if (this.age > 10) {
                        console.log("hatch");
                        
                        this.transition('hatch');

                        return true;
                        
                    }
                }

                return false
                
            });

            egg.on('transition:hatch', function hatch(monster){
                console.log("test");
                monster.remove('frame', frame_id);
                frame_id = monster.on('frame', function(frame){
                    // console.log("test");
                    
                    if (!(frame % gamespeed)) {
                        this.age++;
                        if (this.age > 20) {
                            console.log("evolving");
                            // console.log("test", test);
                            this.transition('evolve');
                            return true;
                        }
                        var delta = (Math.floor(Math.random() * 3) - 1);
                        var y = Math.floor(Math.random() * 2)
                        
                        console.log((1-(y))*delta, (y)*delta);
                        this.move((1-(y))*delta, (y)*delta);
                        // 
                        
                        // console.log(test);
                        
                        return true;
                    } 
                    
                    return false;
                
                });
            });
            egg.on('transition:evolve', function evolve(monster){
                monster.remove('frame', frame_id);
                monster.lay = function(){
                    var newEgg = placeEgg($scope, this.position.x, this.position.y);
                    this.world.entities.push(newEgg);
                },
                frame_id = monster.on('frame', function(frame){
                    // console.log("test");
                    if (!(frame % gamespeed)) {
                        var delta = (Math.floor(Math.random() * 3) - 1);
                        var y = Math.floor(Math.random() * 2);
                        

                        // console.log((1-(y))*delta, (y)*delta);
                        
                        // 
                        var test = Math.floor(Math.random() * 10);
                        // console.log(test);
                        if (test == 0) {
                            // console.log("test", test);
                            this.lay();
                            
                        }
                        this.move((1-(y))*delta, (y)*delta);
                        return true;
                    }
                });
            });

            return egg;
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
                var egg = placeEgg($scope, _x, _y);
                $scope.entities.push(egg);
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
