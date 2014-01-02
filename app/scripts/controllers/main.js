'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', function ($scope, beastieEnv) {

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
                        collided: function(entity){
                            console.log("collision")
                            console.log(entity);
                            if(entity.kind === "block"){
                                throw "hit a block";
                            }
                            if(entity.kind === 'monster' || entity.kind === 'mother' || entity.kind === 'egg'){
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
                    components:[MoveComponent, PushComponent, PullComponent, CollisionComponent, ControllerComponent, DeathComponent],
                    events:{
                        complete_move: function(deltas){
                            $scope.$apply();
                        },
                        die: function(){
                            $scope.entities = _.without($scope.entities, this);
                            $scope.$apply();
                        },
                        collided: function(entity){
                            console.log("collision")
                            if(entity.kind === "block"){
                                throw "hit a block";
                            }
                            if(entity.kind === 'monster'){
                                this.die();
                               
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
                            $scope.$apply();
                        },
                        collided: function(entity){
                            // console.log("collision")
                            // console.log(entity);
                            if(entity.kind === 'player'){
                                $scope.entities = _.without($scope.entities, entity);
                                $scope.$apply();
                            }
                        }
                    },
                    frame: function(frame){
                        // console.log("test");
                        var test = Math.floor(Math.random() * 1000);
                        // console.log(test);
                        if (test == 0) {
                            // console.log("test", test);
                            this.transition('hatch');
                            console.log('egg hatch');
                            try{
                                // $scope.$apply();
                            } catch(e){

                            }
                        }
                    },
                    components:[CollisionComponent, DeathComponent],
                    world: $scope,
                    states: {
                        hatch:{
                            kind: 'monster',
                            classVal: $scope.iconPrefix + 'entities-monster',
                            components:[MoveComponent, CollisionComponent, DeathComponent],
                            frame: function(frame){
                                // console.log("test");
                                if (!(frame % gamespeed)) {
                                    this.move((Math.floor(Math.random() * 3) - 1), (Math.floor(Math.random() * 3) - 1));
                                    // $scope.$apply();
                                } else {
                                    var test = Math.floor(Math.random() * 1000);
                                    // console.log(test);
                                    if (test == 0) {
                                        // console.log("test", test);
                                        this.transition('evolve');
                                        
                                    }
                                }
                            },
                            events:{
                                complete_move: function(deltas){
                                    console.log("egg move");
                                    $scope.$apply();
                                },
                                die: function(){
                                    $scope.entities = _.without($scope.entities, this);
                                    $scope.$apply();
                                },
                                collided: function(entity){
                                    // console.log("egg collision")
                                    // console.log(entity);
                                    if(entity.kind === "block"){
                                        throw "hit a block";
                                    }
                                    if(entity.kind === 'player'){
                                        $scope.entities = _.without($scope.entities, entity);
                                        $scope.$apply();
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
                                    this.move((Math.floor(Math.random() * 3) - 1), (Math.floor(Math.random() * 3) - 1));
                                    // $scope.$apply();
                                }else {
                                    var test = Math.floor(Math.random() * 1000);
                                    // console.log(test);
                                    if (test == 0) {
                                        // console.log("test", test);
                                        this.lay();
                                        
                                    }
                                }
                            },
                            lay: function(){
                                $scope.entities.push(new Entity(env_schematics.egg(this.position.x, this.position.y)));
                            },
                            events:{
                                complete_move: function(deltas){
                                    $scope.$apply();
                                },
                                die: function(){
                                    $scope.entities = _.without($scope.entities, this);
                                    $scope.$apply();
                                },
                                collided: function(entity){
                                    // console.log("collision")
                                    // console.log(entity);
                                    if(entity.kind === "block"){
                                        throw "hit a block";
                                    }
                                    if(entity.kind === 'player'){
                                        $scope.entities = _.without($scope.entities, entity);
                                        $scope.$apply();
                                    }
                                }
                            },
                            components:[MoveComponent, CollisionComponent, DeathComponent],
                        }
                    }
                }
            }
        };

        var gridsize = 32;
        $scope.cellsize = 16;
        // var backgrid = new Array(gridsize);
        $scope.iconPrefix = 'icon-';

        $scope.findEntityByPosition = function(x, y){
            for (var i = $scope.entities.length - 1; i >= 0; i--) {
                if($scope.entities[i].position.x == x && $scope.entities[i].position.y == y){
                    return $scope.entities[i];
                }
            };
            
        }
        $scope.entities = [];
        function addPlayer(){
            var x = Math.floor(Math.random()*gridsize);
            var y = Math.floor(Math.random()*gridsize);

            while($scope.findEntityByPosition(x, y) !== undefined){
                x = Math.floor(Math.random()*gridsize);
                y = Math.floor(Math.random()*gridsize);
            }
            $scope.entities.push(new Entity(env_schematics.player(x, y)));
        }
        
        for (var i = 0; i < gridsize; i++) {
            // backgrid[i] = new Array(gridsize);
            for (var e = 0; e < gridsize; e++) {
                if(Math.floor(Math.random() * 2) > 0 || e == 0 || i == 0 || e == gridsize-1 || i == gridsize-1){
                    var blocktype = env_schematics.block();
                    blocktype.position = {
                        x: e,
                        y: i
                    }
                    var classVal = '';

                    if (blocktype.id) {
                        if (blocktype.dir) {
                            // var dir = _.chain(blocktype.dir)
                            //     .filter(function(num){ return Math.random() < 0.2; })
                            //     .value();

                            // if (!dir.length) {
                            //     dir = _.sample(blocktype.dir);
                            // } else {
                            //     dir = dir.reduce(function(memo, d){ return memo + d; });
                            // }

                            blocktype.classVal = $scope.iconPrefix + blocktype.id + dir;
                        } else {
                            blocktype.classVal = $scope.iconPrefix + blocktype.id;
                        }
                    }
                    $scope.entities.push(new Entity(blocktype));
                }
                // backgrid[i][e] = {
                //     classVal : classVal
                // };
            }
        }
        addPlayer();
        var frame = 0;
        var gamespeed = 45;

        var gameLoop = new Entity({
                            kind: 'loop',
                            components:[]
                        });

        $scope.gameLoop = gameLoop;

        // var player = new Entity($scope.entities[0]);
        //  = player;

       

        // for (var i = 0; i < 10; i++) {

        //     var x = Math.floor(Math.random()*gridsize);
        //     var y = Math.floor(Math.random()*gridsize);

        //     while($scope.findEntityByPosition(x, y) !== undefined){
        //         x = Math.floor(Math.random()*gridsize);
        //         y = Math.floor(Math.random()*gridsize);
        //     }

        //     $scope.entities.push(new Entity(env_schematics.monster(x, y)));
        // }

        // for (var i = 0; i < 5; i++) {

        //     var x = Math.floor(Math.random()*gridsize);
        //     var y = Math.floor(Math.random()*gridsize);

        //     while($scope.findEntityByPosition(x, y) !== undefined){
        //         x = Math.floor(Math.random()*gridsize);
        //         y = Math.floor(Math.random()*gridsize);
        //     }

        //     $scope.entities.push(new Entity(env_schematics.mother(x, y)));
        // }

        for (var i = 0; i < 20; i++) {

            var x = Math.floor(Math.random()*gridsize);
            var y = Math.floor(Math.random()*gridsize);

            while($scope.findEntityByPosition(x, y) !== undefined){
                x = Math.floor(Math.random()*gridsize);
                y = Math.floor(Math.random()*gridsize);
            }

            $scope.entities.push(new Entity(env_schematics.egg(x, y)));
        }

       

        function animloop(){
            frame++;
            
                // gameLoop.trigger('frame', frame);
            for (var i = $scope.entities.length - 1; i >= 0; i--) {
                if($scope.entities[i].frame !== undefined){
                    try{
                        $scope.entities[i].frame(frame);
                    } catch(e){
                        // throw e;
                        console.log(e);
                    }
                }
            };
            
            requestAnimFrame(animloop);
        };
        animloop();

    }]);
