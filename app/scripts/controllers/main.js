'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', function ($scope, beastieEnv) {

        var frame = 0;
        var gamespeed = 45;
        var gridsize = 16;
        $scope.cellsize = 16;
        // var backgrid = new Array(gridsize);
        $scope.iconPrefix = 'icon-';
        $scope.entities = [];
        $scope.world = {};

        var env_schematics = {
            block: function(){
                return {
                    kind: 'block',
                    id: 'environment-block',
                    push: true,
                    heavy: true,
                    walk: false,
                    components: [MoveComponent, CollisionComponent],
                    events:{
                        complete_move: function(deltas){
                            // console.log(this.position);
                            $scope.$apply();
                        },
                        collided: function(entity){
                            if(entity.kind === "block"){
                                throw "hit a block";
                            }
                            if(entity.kind !== 'block'){
                                console.log('monster');
                                var delta_x = entity.position.x - this.position.x;
                                var delta_y = entity.position.y - this.position.y;
                                var neighbor = this.world.findEntityByPosition(entity.position.x+delta_x, entity.position.y+delta_y);
                                if(neighbor !== undefined && neighbor.kind === 'block'){
                                    entity.die();
                                } else {
                                    throw "chouldn't kill the monster";
                                }
                                
                            }
                        }
                    },
                    world: $scope
                }
            },
            player: function(x, y){
                return {
                    kind: 'player',
                    classVal: $scope.iconPrefix + 'entities-player',
                    keyboard: true,
                    position: {
                        x: x,
                        y: y
                    },
                    //order matthers X_x
                    components:[MoveComponent, PushComponent, PullComponent, CollisionComponent, ControllerComponent, DeathComponent, ExploreComponent],
                    events:{
                        complete_move: function(deltas){
                            // console.log(this.position);
                            $scope.$apply();
                        },
                        die: function(){
                            $scope.entities = _.without($scope.entities, this);
                            
                        },
                        collided: function(entity){
                            
                            if(entity.kind === 'monster' || entity.kind === 'mother'){
                                this.die();
                            } else {
                                throw "hit a block";
                            }
                        }
                    },
                    world: $scope
                }
            },
            egg: function(x, y){
                return {
                    kind: 'egg',
                    classVal: $scope.iconPrefix + 'entities-egg',
                    keyboard: false,
                    position: {
                        x: x,
                        y: y
                    },
                    events:{
                        die: function(){
                            $scope.entities = _.without($scope.entities, this);
                            
                        },
                        collided: function(entity){
                            // console.log("collision")
                            // console.log(entity);
                            if(entity.kind === 'player'){
                                entity.die();
                            }
                        }
                    },
                    age: 0,
                    frame: function(frame){
                        var test = Math.floor(Math.random() * 100);
                        this.age++;
                        // console.log(test);
                        if (test == 0 && this.age > 1000) {
                            console.log("hatch");
                            this.transition('hatch');
                            return true;
                            
                        }
                        return false
                        
                    },
                    components:[CollisionComponent, DeathComponent],
                    world: $scope,
                    states: {
                        hatch:{
                            kind: 'monster',
                            classVal: $scope.iconPrefix + 'entities-monster',
                            components:[MoveComponent, CollisionComponent, DeathComponent, ExploreComponent],
                            frame: function(frame){
                                // console.log("test");
                                this.age++;
                                if (!(frame % gamespeed)) {
                                    if (this.age > 2000) {
                                        console.log("evolving");
                                        // console.log("test", test);
                                        this.transition('evolve');
                                        return true;
                                    }
                                    var delta = (Math.floor(Math.random() * 3) - 1);
                                    var y = Math.floor(Math.random() * 2)
                                    // console.log((1-(y))*delta, (y)*delta);
                                    this.move((1-(y))*delta, (y)*delta);
                                    // 
                                    
                                    // console.log(test);
                                    
                                    return true;
                                } 
                                
                                return false;
                            },
                            events:{
                                complete_move: function(deltas){
                                    console.log("egg move");
                                    
                                },
                                die: function(){
                                    $scope.entities = _.without($scope.entities, this);
                                    
                                },
                                collided: function(entity){
                                    if(entity.kind === 'player'){
                                        entity.die();
                                    } else {
                                        throw "hit a block";
                                    }
                                }
                            },
                        },
                        evolve:{
                            kind: 'mother',
                            classVal: $scope.iconPrefix + 'entities-mother',
                            frame: function(frame){
                                // console.log("test");
                                if (!(frame % gamespeed)) {
                                    var delta = (Math.floor(Math.random() * 3) - 1);
                                    var y = Math.floor(Math.random() * 2)
                                    // console.log((1-(y))*delta, (y)*delta);
                                    this.move((1-(y))*delta, (y)*delta);
                                    // 
                                    var test = Math.floor(Math.random() * 1000);
                                    // console.log(test);
                                    if (test == 0) {
                                        // console.log("test", test);
                                        this.lay();
                                        
                                    }
                                    return true;
                                }
                            },
                            lay: function(){
                                $scope.entities.push(new Entity(env_schematics.egg(this.position.x, this.position.y)));
                            },
                            events:{
                                complete_move: function(deltas){
                                    
                                },
                                die: function(){
                                    $scope.entities = _.without($scope.entities, this);
                                    
                                },
                                collided: function(entity){
                                    if(entity.kind === 'player'){
                                        entity.die();
                                    } else {
                                        throw "hit a block"
                                    }
                                }
                            },
                            components:[MoveComponent, PushComponent, CollisionComponent, DeathComponent, ExploreComponent],
                        }
                    }
                }
            }
        };


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
            $scope.entities.push(new Entity(env_schematics.player(x, y)));
        }
        

        $scope.explore = function(x, y, size){
            console.log('exploreing');
            for (var i = x; i < x+size; i++) {
                // backgrid[i] = new Array(gridsize);
                for (var e = y; e < y+size; e++) {
                    if($scope.world[i+"/"+e] === undefined){
                        $scope.world[i+"/"+e] = true;
                        if(Math.floor(Math.random() * 2) > 0 && $scope.findEntityByPosition(i, e) === undefined){
                            var blocktype = env_schematics.block();
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

                $scope.entities.push(new Entity(env_schematics.egg(_x, _y)));
            }
        }
        
        $scope.gameLoop = new Entity({
                            kind: 'loop',
                            components:[],
                            world:$scope
                        });



        function animloop(){
            frame++;
           
            if(!(frame % gamespeed)){
                 var updated = false;
                for (var i = $scope.entities.length - 1; i >= 0; i--) {
                    if($scope.entities[i].frame !== undefined){
                        try{
                            updated = updated || $scope.entities[i].frame(frame);
                        } catch(e){
                            // throw e;
                            console.log(e);
                        }
                    }
                };
                if(updated){
                    $scope.$apply();
                }
            }
            
            requestAnimFrame(animloop);
        };
        $scope.explore(0,0, gridsize);
        addPlayer();
        animloop()

    }]);
