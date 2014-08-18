// beastie.js
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var template = _.template('<i class="{{ entity.classVal }}"></i>');
var env_schematics = {
    block: function (_world) {
        return {
            kind: 'block',
            id: 'environment-block',
            push: true,
            heavy: true,
            walk: false,
            template: template,
            components: [DomRenderer, MoveComponent, CollisionComponent],
            events: {
                complete_move: function (deltas, old) {
                    // console.log(this.position);
                    //$scope.$apply();
                    console.log(this);
                    this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
                    this.world.entities.place(this);
                },
                start_move: function (deltas) {
                    console.log("move block")
                    // console.log(this.position);
                    //$scope.$apply();
                },
                collided: function (entity) {
                    if (entity) {
                        if (entity.kind === "block") {
                            throw "hit a block";
                        }
                        if (entity.kind !== 'block') {
                            console.log('monster');
                            var delta_x = entity.position.x - this.position.x;
                            var delta_y = entity.position.y - this.position.y;
                            var neighbor = this.world.findEntityByPosition(entity.position.x + delta_x, entity.position.y + delta_y)[0];
                            if (neighbor !== undefined && neighbor.kind === 'block') {
                                entity.die();
                            } else {
                                throw "chouldn't kill the monster";
                            }

                        }
                    }
                },
                rendered: function (el) {
                    this.el = document.getElementById('entityboard').appendChild(el);
                    this.on('complete_move', function (deltas) {
                        this.el.style.top = this.position.y + 'em';
                        this.el.style.left = this.position.x + 'em';
                    });
                }
            },
            world: _world
        }
    },
    player: function (_world, x, y) {
        return {
            kind: 'player',
            classVal: _world.iconPrefix + 'entities-player',
            keyboard: true,
            position: {
                x: x,
                y: y
            },
            template: template,
            //order matthers X_x
            components: [
                DomRenderer,
                MoveComponent,
                PushComponent,
                PullComponent,
                CollisionComponent,
                ControllerComponent,
                DeathComponent,
                ExploreComponent
            ],
            events: {
                start_move: function (deltas) {
                    console.log("move block")
                    // console.log(this.position);
                    //$scope.$apply();
                },
                complete_move: function(deltas, old){
                  this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
                  this.world.entities.place(this);
                },
                die: function () {
                    this.world.entities[this.position.x+","+this.position.y] = _.without(this.world.entities[this.position.x+","+this.position.y], this);
                    document.getElementById('entityboard').removeChild(this.el);
                    this.dead = true;
                },
                collided: function (entity) {
                    if (entity.kind === 'monster' || entity.kind === 'mother') {
                        this.die();
                    } else {
                        console.log("hit a block");
                    }
                },
                rendered: function (el) {

                    this.el = document.getElementById('entityboard').appendChild(el);
                    this.on('complete_move', function (deltas) {

                        this.el.style.top = this.position.y + 'em';
                        this.el.style.left = this.position.x + 'em';

                    });
                }
            },
            world: _world
        }
    },
    egg: function (_world, x, y) {
        return {
            kind: 'egg',
            classVal: _world.iconPrefix + 'entities-egg',
            keyboard: false,
            position: {
                x: x,
                y: y
            },
            template: template,
            worth: 10,
            events: {
                die: function () {
                    // console.log(this.world);

                    this.world.entities[this.position.x+","+this.position.y] = _.without(this.world.entities[this.position.x+","+this.position.y], this);
                    document.getElementById('entityboard').removeChild(this.el);
                },
                collided: function (entity) {
                    // console.log("collision")
                    // console.log(entity);
                    if (entity.kind === 'player') {
                        entity.die();
                    }
                },
                rendered: function (el) {

                    this.el = document.getElementById('entityboard').appendChild(el);
                    this.on('complete_move', function (deltas) {
                        this.el.style.top = this.position.y + 'em';
                        this.el.style.left = this.position.x + 'em';
                    });
                }
            },
            age: 0,
            components: [
                DomRenderer,
                CollisionComponent,
                DeathComponent,
                FrameComponent
            ],
            world: _world,
            states: {
                hatch: {
                    kind: 'monster',
                    classVal: _world.iconPrefix + 'entities-monster',
                    template: template,
                    worth: 20,
                    components: [
                        DomRenderer,
                        MoveComponent,
                        CollisionComponent,
                        DeathComponent,
                        ExploreComponent
                    ],
                    events: {
                        complete_move: function(deltas, old){
                          this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
                          this.world.entities.place(this);
                        },
                        collided: function (entity) {
                            if (entity.kind === 'player') {
                                entity.die();
                            } else {
                                throw "hit a block";
                            }
                        },
                        rendered: function (el) {
                            this.el = document.getElementById('entityboard').appendChild(el);
                            this.on('complete_move', function (deltas) {
                                this.el.style.top = this.position.y + 'em';
                                this.el.style.left = this.position.x + 'em';
                            });
                        }
                    }
                },
                evolve: {
                    kind: 'mother',
                    classVal: _world.iconPrefix + 'entities-mother',
                    template: template,
                    worth: 30,
                    events: {
                        complete_move: function(deltas, old){
                          this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
                          this.world.entities.place(this);
                        },
                        collided: function (entity) {
                            if (entity.kind === 'player') {
                                entity.die();
                            } else {
                                console.log("hit a block");
                            }
                        },
                        rendered: function (el) {
                            this.el = document.getElementById('entityboard').appendChild(el);
                            this.on('complete_move', function (deltas) {
                                this.el.style.top = this.position.y + 'em';
                                this.el.style.left = this.position.x + 'em';
                            });
                        }
                    },
                    components: [
                        DomRenderer,
                        MoveComponent,
                        PushComponent,
                        CollisionComponent,
                        DeathComponent,
                        ExploreComponent
                    ]
                }
            }
        }
    }
};
