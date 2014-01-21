// beastie.js
_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g
};
var gamespeed = 45;
var template = _.template('<i class="{{ entity.classVal }}"></i>');
var env_schematics = {
    block: function(_world){
        return {
            kind: 'block',
            id: 'environment-block',
            push: true,
            heavy: true,
            walk: false,
            template:template,
            components: [DomRenderer, MoveComponent, CollisionComponent],
            events:{
                complete_move: function(deltas){
                    // console.log(this.position);
                    //$scope.$apply();
                },
                start_move: function(deltas){
                	console.log("move block")
                    // console.log(this.position);
                    //$scope.$apply();
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
                },
                rendered: function(el){
                    this.el = document.getElementById('entityboard').appendChild(el);
                    this.on('complete_move', function(deltas){
                        this.el.style.top = this.position.y+'em';
                        this.el.style.left = this.position.x+'em';
                    });
                }
            },
            world: _world
        }
    },
    player: function(_world, x, y){
        return {
            kind: 'player',
            classVal: _world.iconPrefix + 'entities-player',
            keyboard: true,
            position: {
                x: x,
                y: y
            },
            template:template,
            //order matthers X_x
            components:[
                DomRenderer, 
                MoveComponent,
                PushComponent,
                PullComponent,
                CollisionComponent, 
                ControllerComponent, 
                DeathComponent, 
                ExploreComponent],
            events:{
                start_move: function(deltas){
                    console.log("move block")
                    // console.log(this.position);
                    //$scope.$apply();
                },
                die: function(){
                    this.world.entities = _.without(this.world.entities, this);
                    document.getElementById('entityboard').removeChild(this.el);
                },
                collided: function(entity){
                    
                    if(entity.kind === 'monster' || entity.kind === 'mother'){
                        this.die();
                    } else {
                        console.log("hit a block");
                    }
                },
                rendered: function(el){

                    this.el = document.getElementById('entityboard').appendChild(el);
                    this.on('complete_move', function(deltas){
                        this.el.style.top = this.position.y+'em';
                        this.el.style.left = this.position.x+'em';
                    });
                }
            },
            world: _world
        }
    },
    egg: function(_world, x, y){
        return {
            kind: 'egg',
            classVal: _world.iconPrefix + 'entities-egg',
            keyboard: false,
            position: {
                x: x,
                y: y
            },
            template:template,
            events:{
                die: function(){
                    this.world.entities = _.without(this.world.entities, this);
                    document.getElementById('entityboard').removeChild(this.el);
                },
                collided: function(entity){
                    // console.log("collision")
                    // console.log(entity);
                    if(entity.kind === 'player'){
                        entity.die();
                    }
                },
                rendered: function(el){

                    this.el = document.getElementById('entityboard').appendChild(el);
                    this.on('complete_move', function(deltas){
                        this.el.style.top = this.position.y+'em';
                        this.el.style.left = this.position.x+'em';
                    });
                }
            },
            age: 0,
            frame: function(frame){
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
                
            },
            components:[
                DomRenderer, 
                CollisionComponent, 
                DeathComponent, 
                FrameComponent
            ],
            world: _world,
            states: {
                hatch:{
                    kind: 'monster',
                    classVal: _world.iconPrefix + 'entities-monster',
                    template:template,
                    components:[
                        DomRenderer, 
                        MoveComponent, 
                        CollisionComponent, 
                        DeathComponent, 
                        ExploreComponent, 
                        FrameComponent],
                    frame: function(frame){
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
                            this.world.entities = _.without(this.world.entities, this);
                            document.getElementById('entityboard').removeChild(this.el);
                        },
                        collided: function(entity){
                            if(entity.kind === 'player'){
                                entity.die();
                            } else {
                                throw "hit a block";
                            }
                        },
                        rendered: function(el){
                            this.el = document.getElementById('entityboard').appendChild(el);
                            this.on('complete_move', function(deltas){
                                this.el.style.top = this.position.y+'em';
                                this.el.style.left = this.position.x+'em';
                            });
                        }
                    },
                },
                evolve:{
                    kind: 'mother',
                    classVal: _world.iconPrefix + 'entities-mother',
                    frame: function(frame){
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
                    },
                    lay: function(){
                        this.world.entities.push(new Entity(env_schematics.egg(this.position.x, this.position.y)));
                    },
                    template:template,
                    events:{
                        complete_move: function(deltas){
                            
                        },
                        die: function(){
                            this.world.entities = _.without(this.world.entities, this);
                            document.getElementById('entityboard').removeChild(this.el);
                        },
                        collided: function(entity){
                            if(entity.kind === 'player'){
                                entity.die();
                            } else {
                                throw "hit a block"
                            }
                        },
                        rendered: function(el){
                            this.el = document.getElementById('entityboard').appendChild(el);
                            this.on('complete_move', function(deltas){
                                this.el.style.top = this.position.y+'em';
                                this.el.style.left = this.position.x+'em';
                            });
                        }
                    },
                    components:[
                        DomRenderer, 
                        MoveComponent, 
                        PushComponent, 
                        CollisionComponent, 
                        DeathComponent, 
                        ExploreComponent, 
                        FrameComponent],
                }
            }
        }
    }
};