"use strict";

/* global
DomRenderer,
MoveComponent,
CollisionComponent,
PushComponent,
PullComponent,
ControllerComponent,
DeathComponent,
ExploreComponent,
FrameComponent */

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

window.gameSpeed = 45;
var template = _.template("<i class='{{ entity.classVal }}'></i>");
window.envSchematics = {
    block: function (_world) {
        return {
            kind: "block",
            id: "environment-block",
            push: true,
            heavy: true,
            walk: false,
            template: template,
            components: [DomRenderer, MoveComponent, CollisionComponent],
            events: {
                moveComplete: function (deltas) {
                    console.log("move complete: "+deltas);
                    // console.log(this.position);
                    //$scope.$apply();
                },
                moveStart: function (deltas) {
                    console.log("move block: "+deltas);
                    // console.log(this.position);
                    //$scope.$apply();
                },
                collided: function (entity) {
                    if (entity) {
                        if (entity.kind === "block") {
                            throw "hit a block";
                        }
                        if (entity.kind !== "block") {
                            console.log("monster");
                            var deltaX = entity.position.x - this.position.x;
                            var deltaY = entity.position.y - this.position.y;
                            var neighbor = this.world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY);
                            if (neighbor !== undefined && neighbor.kind === "block") {
                                entity.die();
                            } else {
                                throw "couldn't kill the monster";
                            }

                        }
                    }
                },
                rendered: function (el) {
                    this.el = document.getElementById("entityboard").appendChild(el);
                    this.on("moveComplete", function (deltas) {
                        console.log("rendered: " + deltas);
                        this.el.style.top = this.position.y + "em";
                        this.el.style.left = this.position.x + "em";
                        this.el.style.zIndex = "2";
                    });
                }
            },
            world: _world
        };
    },
    player: function (_world, x, y) {
        return {
            kind: "player",
            classVal: _world.iconPrefix + "entities-player",
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
                moveStart: function (deltas) {
                    console.log("move block: "+ deltas);
                    // console.log(this.position);
                    //$scope.$apply();
                },
                die: function () {
                    this.world.entities = _.without(this.world.entities, this);
                    document.getElementById("entityboard").removeChild(this.el);
                    this.dead = true;
                },
                collided: function (entity) {
                    if (entity.kind === "monster" || entity.kind === "mother") {
                        this.die();
                    } else {
                        console.log("hit a block");
                    }
                },
                rendered: function (el) {

                    this.el = document.getElementById("entityboard").appendChild(el);
                    this.on("moveComplete", function (deltas) {
                        console.log("move complete: "+deltas);
                        this.el.style.top = this.position.y + "em";
                        this.el.style.left = this.position.x + "em";
                    });
                }
            },
            world: _world
        };
    },
    egg: function (_world, x, y) {
        return {
            kind: "egg",
            classVal: _world.iconPrefix + "entities-egg",
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

                    this.world.entities = _.without(this.world.entities, this);
                    document.getElementById("entityboard").removeChild(this.el);
                },
                collided: function (entity) {
                    // console.log("collision")
                    // console.log(entity);
                    if (entity.kind === "player") {
                        entity.die();
                    }
                },
                rendered: function (el) {

                    this.el = document.getElementById("entityboard").appendChild(el);
                    this.on("moveComplete", function (deltas) {
                        console.log("move complete: " + deltas);
                        this.el.style.top = this.position.y + "em";
                        this.el.style.left = this.position.x + "em";
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
                    kind: "monster",
                    classVal: _world.iconPrefix + "entities-monster",
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
                        moveComplete: function (deltas) {
                            console.log("egg move: "+deltas);
                        },
                        collided: function (entity) {
                            if (entity.kind === "player") {
                                entity.die();
                            } else {
                                throw "hit a block";
                            }
                        },
                        rendered: function (el) {
                            this.el = document.getElementById("entityboard").appendChild(el);
                            this.on("moveComplete", function (deltas) {
                                console.log("move complete: " + deltas);
                                this.el.style.top = this.position.y + "em";
                                this.el.style.left = this.position.x + "em";
                            });
                        }
                    }
                },
                evolve: {
                    kind: "mother",
                    classVal: _world.iconPrefix + "entities-mother",
                    template: template,
                    worth: 30,
                    events: {
                        moveComplete: function (deltas) {
                            console.log("move complete: "+deltas);
                        },
                        collided: function (entity) {
                            if (entity.kind === "player") {
                                entity.die();
                            } else {
                                throw "hit a block";
                            }
                        },
                        rendered: function (el) {
                            this.el = document.getElementById("entityboard").appendChild(el);
                            this.on("moveComplete", function (deltas) {
                                console.log("move complete: "+deltas);
                                this.el.style.top = this.position.y + "em";
                                this.el.style.left = this.position.x + "em";
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
        };
    }
};