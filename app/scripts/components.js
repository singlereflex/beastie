"use strict";

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

window.BL = {};

BL.Schematics = {
    block: function (_world) {
        var block = {
            kind: "block",
            id: "environment-block",
            push: true,
            heavy: true,
            walk: false,
            el: null,
            components: [BL.DomRenderer, BL.MoveComponent, BL.CollisionComponent],
            events: {
                completeMove: function (deltas) {
                    console.log("move block: "+deltas);
                },
                startMove: function (deltas) {
                    console.log("move block: "+deltas);
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
                            var neighbor = this.world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY)[0];
                            if (neighbor !== undefined && neighbor.kind === "block") {
                                entity.die();
                            } else {
                                throw "shouldn't kill the monster";
                            }

                        }
                    }
                }
            },
            world: _world
        };

        return block;
    },
    player: function (_world, x, y) {
        var player = {
            kind: "player",
            classVal: _world.iconPrefix + "entities-player",
            keyboard: true,
            position: {
                x: x,
                y: y
            },
            components: [
                BL.DomRenderer,
                BL.MoveComponent,
                BL.PushComponent,
                BL.PullComponent,
                BL.CollisionComponent,
                BL.ControllerComponent,
                BL.DeathComponent,
                BL.ExploreComponent
            ],
            events: {
                startMove: function () {
                    console.log("move block");
                },
                die: function () {
                    player.world.entities = _.without(player.world.entities, this);
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

                    player.el = document.getElementById("entityboard").appendChild(el);
                    player.on("completeMove", function () {
                        player.el.style.top = player.position.y + "em";
                        player.el.style.left = player.position.x + "em";
                    });
                }
            },
            world: _world
        };

        return player;
    },
    egg: function (_world, x, y) {
        var egg = {
            kind: "egg",
            classVal: _world.iconPrefix + "entities-egg",
            keyboard: false,
            position: {
                x: x,
                y: y
            },
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
                    this.on("completeMove", function () {
                        this.el.style.top = this.position.y + "em";
                        this.el.style.left = this.position.x + "em";
                    });
                }
            },
            age: 0,
            components: [
                BL.DomRenderer,
                BL.CollisionComponent,
                BL.DeathComponent
            ],
            world: _world,
            states: {
                hatch: {
                    kind: "monster",
                    classVal: _world.iconPrefix + "entities-monster",
                    worth: 20,
                    components: [
                        BL.DomRenderer,
                        BL.MoveComponent,
                        BL.CollisionComponent,
                        BL.DeathComponent,
                        BL.ExploreComponent
                    ],
                    events: {
                        completeMove: function () {
                            console.log("egg move");
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
                            this.on("completeMove", function () {
                                this.el.style.top = this.position.y + "em";
                                this.el.style.left = this.position.x + "em";
                            });
                        }
                    }
                },
                evolve: {
                    kind: "mother",
                    classVal: _world.iconPrefix + "entities-mother",
                    worth: 30,
                    events: {
                        completeMove: function () {
                        },
                        collided: function (entity) {
                            if (entity.kind === "player") {
                                entity.die();
                            } else {
                                console.log("hit a block");
                            }
                        },
                        rendered: function (el) {
                            this.el = document.getElementById("entityboard").appendChild(el);
                            this.on("completeMove", function () {
                                this.el.style.top = this.position.y + "em";
                                this.el.style.left = this.position.x + "em";
                            });
                        }
                    },
                    components: [
                        BL.DomRenderer,
                        BL.MoveComponent,
                        BL.PushComponent,
                        BL.CollisionComponent,
                        BL.DeathComponent,
                        BL.ExploreComponent
                    ]
                }
            }
        };
        return egg;
    }
};

BL.Center = function (el) {
    $("html, body").animate({
        scrollTop: $(el).offset().top - (( $(window).height() - $(this).outerHeight(true) ) / 2),
        scrollLeft: $(el).offset().left - (( $(window).width() - $(this).outerWidth(true) ) / 2)
    }, 200);
};

BL.DomRenderer = function (entity, innerHTML) {
    if (entity.el !== undefined) {
        document.getElementById("entityboard").removeChild(entity.el);
    }
    var div = document.createElement("div");
    div.innerHTML = innerHTML;
    div.className = "entity " + entity.kind;
    div.style.left = entity.position.x + "em";
    div.style.top = entity.position.y + "em";
    entity.el = div;


    entity.move = function (deltaX, deltaY, entity) {
        entity.el.style.top = entity.position.y + "em"; //e.data.entity.position.y + "em";
        entity.el.style.left = entity.position.x + "em";
        if (entity.data.entity.kind === "player") {
            $("html,body").animate({
                scrollTop: document.body.scrollTop + deltaY * 16,//e.data.deltas.deltaY * 16,
                scrollLeft: document.body.scrollLeft + deltaX * 16
            }, 200);
        }
    };

    entity.die = function () {
        document.getElementById("entityboard").removeChild(entity.el);
    };

    entity.el = document.getElementById("entityboard").appendChild(entity.el);
    if (entity.kind === "player") {
        BL.Center(entity.el);
    }
    entity.trigger("rendered", entity);
};

BL.CanvasRenderer = function(entity) {
    var square = 24;
    //rendering position needs to be offset but current player position (or canvas viewport if you want to think about it that way);
    entity.draw = function (context) {//figure out the animated move part later

        var step = 4;
        if (Math.abs(entity._position.x - entity.position.x) > 2 || Math.abs(entity._position.y - entity.position.y) > 2) {
            entity.position.x = entity._position.x;
            entity.position.y = entity._position.y;
        } else {
            if (!Math.abs(entity._position.x - entity.position.x) / step < 0.01) {
                entity.position.x = (entity.position.x + (entity._position.x - entity.position.x) / step);
                if (entity.kind === "player") {
                    BL.Viewport.x = entity.position.x;
                }
            }
            if (!Math.abs(entity._position.y - entity.position.y) / step < 0.01) {
                entity.position.y = (entity.position.y + (entity._position.y - entity.position.y) / step);
                if (entity.kind === "player") {
                    BL.Viewport.y = entity.position.y;
                }
            }
        }

        context.drawImage(BL.Sprites[entity.icon], (entity.position.x - (BL.Viewport.x - ((context.canvas.width / 2) / square))) * square, (entity.position.y - (BL.Viewport.y - ((context.canvas.height / 2) / square))) * square, square, square);


    };

    entity.move = function (/*deltaX, deltaY, entity*/) {
        // if(entity.kind == "player"){
        //   viewport.x += deltaX;
        //   viewport.y += deltaY;
        // }
    };

    entity.die = function () {
        //remove from draw loop somehow
    };
};

BL.MoveControllerComponent = function (entity) {
    //requires the BL.MoveComponent
    document.body.addEventListener("keydown", function keydown(event) {
        if (!entity.dead) {
            switch (event.which) {
                //left
                case 37:
                case 65:
                    event.preventDefault();
                    // entity.move(-1, 0);
                    break;
                //down
                case 40:
                case 83:
                    event.preventDefault();
                    // entity.move(0, 1);
                    //right
                    break;
                case 39:
                case 68:
                    event.preventDefault();
                    // entity.move(1, 0);
                    break;
                //up
                case 38:
                case 87:
                    event.preventDefault();
                    // entity.move(0, -1);
                    break;
            }
        }

    }, false);

    document.body.addEventListener("keyup", function keyUp(event) {
        if (!entity.dead) {
            switch (event.which) {
                //left
                case 37:
                case 65:
                    event.preventDefault();
                    entity.move(-1, 0);
                    break;
                //down
                case 40:
                case 83:
                    event.preventDefault();
                    entity.move(0, 1);
                    //right
                    break;
                case 39:
                case 68:
                    event.preventDefault();
                    entity.move(1, 0);
                    break;
                //up
                case 38:
                case 87:
                    event.preventDefault();
                    entity.move(0, -1);
                    break;
                case 32:
                    event.preventDefault();
                    BL.Center(entity.display.el);
                    break;
            }
        }
    }, false);


    document.body.addEventListener("touchend", function dblClick(event) {
        if (!entity.dead) {
            var touch = event.changedTouches[0];

            event.preventDefault();

            var x = 0, y = 0;
            var center = {
                x: document.body.clientWidth / 2,
                y: document.body.clientHeight / 2
            };

            if (Math.abs(center.x - touch.clientX) > Math.abs(center.y - touch.clientY)) {
                if (0 < center.x - touch.clientX) {
                    x = -1;
                } else if (0 > center.x - touch.clientX) {
                    x = 1;
                }

            } else {
                if (0 < center.y - touch.clientY) {
                    y = -1;
                } else if (0 > center.y - touch.clientY) {
                    y = 1;
                }
            }
            entity.move(x, y);
        }
        entity.pulling(false);
    }, false);
};

BL.PullControllerComponent = function (entity) {
    //move all this to the controller components
    entity.pulling(false);
    document.body.addEventListener("keydown", function keydown(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.pulling(true);
        }
    }, false);
    document.body.addEventListener("keyup", function keyup(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.pulling(false);
        }
    });
    document.body.addEventListener("touchmove", function (/*event*/) {
        entity.pulling(true);
    });
};
