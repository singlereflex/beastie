'use strict';

angular.module('beastieApp')
    .controller('MainCtrl', ['$scope', 'beastieEnv', function ($scope, beastieEnv) {
        
        

        function ControllerComponent(entity){
            //requires the MoveComponent
            document.body.addEventListener('keydown', function keydown(event){
                event.preventDefault();
            }, false);
            document.body.addEventListener('keyup', function keyup(event){
                event.preventDefault();
                var newX = 0, newY = 0;
                switch(event.which){
                    //left
                    case 37:
                    case 65:
                        entity.move(-1, 0);
                    break;
                    //down
                    case 40:
                    case 83:
                        entity.move(0, 1);
                    //right
                    break;
                    case 39:
                    case 68:
                        entity.move(1, 0);
                    break;
                    //up
                    case 38:
                    case 87:
                        entity.move(0, -1);
                    break;   
                }
            }, false);
        }

        function MoveComponent(entity) {
            entity.move = function(delta_x,delta_y){
                try {
                    entity.trigger('start_move', {delta_x:delta_x, delta_y:delta_y})
                    // if($scope.entities[entity.position.y+delta_y][entity.position.x+delta_x].classVal !== "icon-environment-block"){
                        entity.position.x += delta_x;
                        entity.position.y += delta_y;
                    // } else {
                    //     throw "failed to move, their's a blog in the way!!";
                    // }
                    entity.trigger('complete_move', {delta_x:delta_x, delta_y:delta_y});
                } catch(e){
                    console.log(e);
                    entity.trigger('fail_move', {error: e});
                }
                
                
            }
        }

        function PushComponent(entity){
            //subscribe to move event
            entity.on('start_move', function(deltas) {
                var nextY = 2*deltas.delta_y;
                var nextX = 2*deltas.delta_x;
                // if($scope.entities[entity.position.y+deltas.delta_y][entity.position.x+deltas.delta_x].classVal === "icon-environment-block" && $scope.entities[entity.position.y+nextY][entity.position.x+nextX].classVal !== "icon-environment-block"){
                //     $scope.entities[entity.position.y+deltas.delta_y][entity.position.x+deltas.delta_x].classVal = "icon-environment-empty"
                //     $scope.entities[entity.position.y+nextY][entity.position.x+nextX].classVal = "icon-environment-block"
                // }
            });
        }

        function PullComponent(entity){

        }

        var Entity = function(schematic){
            this._events = {};
            for (var i = schematic.components.length - 1; i >= 0; i--) {
                schematic.components[i](this);
            };
            _.extend(this, schematic);
        }

        Entity.prototype.on = function(name, callback) {
            if(this._events[name] === undefined){
                this._events[name] = [];
            }
            this._events[name].push(callback);
        };

        Entity.prototype.trigger = function(name, stuff) {
            var callbacks = this._events[name];
            if(callbacks !== undefined){
                for (var i = callbacks.length - 1; i >= 0; i--) {
                    callbacks[i](stuff);
                };
            }
        };

        var env_schematics = [
            {
                name: 'empty',
                id: 'environment-empty',
                push: false,
                heavy: false,
                walk: true,
                components: []
            },
            {
                name: 'block',
                id: 'environment-block',
                push: true,
                heavy: true,
                walk: false,
                components: [MoveComponent]
            }
        ]

        var gridsize = 32;
        $scope.cellsize = 16;
        // var backgrid = new Array(gridsize);
        $scope.iconPrefix = 'icon-';

        

        $scope.entities = [
            new Entity({
                            kind: 'player',
                            classVal: $scope.iconPrefix + 'entities-player',
                            keyboard: true,
                            position: {
                                x: Math.floor(Math.random()*gridsize),
                                y: Math.floor(Math.random()*gridsize)
                            },
                            components:[MoveComponent, ControllerComponent, PushComponent]
                        })
        ];
        $scope.environment = $scope.entities;
        
        for (var i = 0; i < gridsize; i++) {
            // backgrid[i] = new Array(gridsize);
            for (var e = 0; e < gridsize; e++) {
                var blocktype = _.sample(env_schematics);
                blocktype.position = {
                    x: e,
                    y: i
                }
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

                        blocktype.classVal = $scope.iconPrefix + blocktype.id + dir;
                    } else {
                        blocktype.classVal = $scope.iconPrefix + blocktype.id;
                    }
                }
                $scope.entities.push(new Entity(blocktype));
                // backgrid[i][e] = {
                //     classVal : classVal
                // };
            }
        }


        // var player = new Entity($scope.entities[0]);
        //  = player;

       

        for (var i = 0; i < 10; i++) {
            $scope.entities.push(new Entity({
                kind: 'monster',
                classVal: $scope.iconPrefix + 'entities-monster',
                keyboard: false,
                position: {
                    x: Math.floor(Math.random()*gridsize),
                    y: Math.floor(Math.random()*gridsize)
                },
                components:[MoveComponent]
            }));
        }

        for (var i = 0; i < 5; i++) {
            $scope.entities.push(new Entity({
                kind: 'mother',
                classVal: $scope.iconPrefix + 'entities-mother',
                keyboard: false,
                position: {
                    x: Math.floor(Math.random()*gridsize),
                    y: Math.floor(Math.random()*gridsize)
                },
                components:[MoveComponent]
            }));
        }

        for (var i = 0; i < 20; i++) {
            $scope.entities.push(new Entity({
                kind: 'egg',
                classVal: $scope.iconPrefix + 'entities-egg',
                keyboard: false,
                position: {
                    x: Math.floor(Math.random()*gridsize),
                    y: Math.floor(Math.random()*gridsize)
                },
                components:[MoveComponent]
            }));
        }

        var frame = 0;
        var gamespeed = 45;

        function animloop(){
            frame++;
            if (!(frame % gamespeed)) {
                for (var i = 0; i < $scope.entities.length; i++) {
                    var value = $scope.entities[i];
                    if (value.kind === "monster") {

                        var newX = value.position.x + (Math.floor(Math.random() * 3) - 1);
                        var newY = value.position.y + (Math.floor(Math.random() * 3) - 1);

                        newX = Math.max(0, newX);
                        newX = Math.min(gridsize-1, newX);

                        newY = Math.max(0, newY);
                        newY = Math.min(gridsize-1, newY);

                        // if($scope.entities[newY][newX].classVal !== "icon-environment-block"){
                        //     value.position.x = Math.floor(newX);
                        //     value.position.y = Math.floor(newY);
                        // }
                    }
                }
                $scope.$apply();
            }
            requestAnimFrame(animloop);
        };
        animloop();

    }]);
