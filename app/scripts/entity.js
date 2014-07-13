"use strict";

window.WorldComponent = function (entity) {
    entity.frameCount = 0;
    entity.running = false;
    function animloop() {
        entity.frameCount++;
        try {
            entity.trigger("frame", entity.frameCount);
        } catch (e) {
            // entity.pause()
        }
        if (entity.running) {
            requestAnimFrame(animloop);
        }
    }

    entity.start = function () {
        this.running = true;
        animloop();
    };
    entity.pause = function () {
        this.running = !this.running;
    };
    entity.stop = function () {
        this.running = false;
        this.frameCount = 0;
    };
    entity.toBeRendered = [];
    entity.on("frame", function render(frameCount) {
        for (var i = 0; i < entity.toBeRendered.length; i++) {
            this.toBeRendered[i].trigger("frame", frameCount);
        }
    });
};

window.FrameComponent = function (entity) {
    entity.world.loop.toBeRendered.push(entity);
    // entity.loop_id = entity.world.loop.on("frame", entity.frame.bind(entity));//really need a remove thing..
    entity.on("die", function () {
        entity.world.loop.toBeRendered = _.without(entity.world.loop.toBeRendered, entity);
    });
};

window.DomRenderer = function (entity) {
    if (entity.el !== undefined) {
        document.getElementById("entityboard").removeChild(entity.el);
    }
    var div = document.createElement("div");
    div.innerHTML = entity.template({entity: entity});
    entity.el = div;
    div.className = "entity " + entity.kind;
    div.style.left = entity.position.x + "em";
    div.style.top = entity.position.y + "em";
    if (entity.kind === "block") {
        div.style.zIndex = parseInt(Math.random() * 3).toString();
    }
    entity.trigger("rendered", entity.el);
};

window.ControllerComponent = function (entity) {
    //requires the MoveComponent
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
                break;

            //right
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
            //var newX = 0, newY = 0;
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
            }
        }
    }, false);

    var hammer = new Hammer(document);

    hammer.on("dragleft", function (e) {
        console.log(e);
        // e.preventDefault();
        // alert("hammer left");
        entity.move(-1, 0);
    });

    hammer.on("dragup", function (e) {
        console.log(e);
        // e.preventDefault();
        // alert("hammer up");
        entity.move(0, -1);
    });

    hammer.on("dragdown", function (e) {
        console.log(e);
        // e.preventDefault();
        // alert("hammer down");
        entity.move(0, 1);
    });

    hammer.on("dragright", function (e) {
        console.log(e);
        // e.preventDefault();
        // alert("hammer right");
        entity.move(1, 0);
    });
};

window.CollisionComponent = function (entity) {
    entity.on("moveStart", function (deltas) {
        var collided = entity.world.findEntityByPosition(entity.position.x + deltas.x, entity.position.y + deltas.y);

        if (collided) {
            entity.trigger("collided", collided);
        }
    });
};

window.ExploreComponent = function (entity) {
    entity.on("moveComplete", function () {
        if (entity.world.world[entity.position.x + "/" + entity.position.y] === undefined) {
            entity.world.explore(entity.position.x - 8, entity.position.y - 8, 16);
        }
    });
};

window.MoveComponent = function (entity) {
    entity.move = function (deltaX, deltaY) {
        entity.trigger("moveStart", {x: deltaX, y: deltaY});
        if (entity.position.x + deltaX < 0 || entity.position.y + deltaY < 0) {
            throw "stay on the board please";
        }

        entity.position.x += deltaX;
        entity.position.y += deltaY;

        entity.trigger("moveComplete", {x: deltaX, y: deltaY});

    };
};

window.PushComponent = function (entity) {
    //subscribe to move event
    entity.on("moveStart", function (deltas) {
        var neighbor = entity.world.findEntityByPosition(entity.position.x + deltas.x, entity.position.y + deltas.y);
        if (neighbor !== undefined && neighbor.kind === "block") {
            neighbor.move(deltas.x, deltas.y);
        }
    });
};

window.PullComponent = function (entity) {

    entity.shiftDown = false;
    document.body.addEventListener("keydown", function keydown(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.shiftDown = true;
        }
    }, false);
    document.body.addEventListener("keyup", function keyup(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.shiftDown = false;
        }
    });
    //subscribe to move event
    entity.on("moveComplete", function (deltas) {

        var neighbor = entity.world.findEntityByPosition(entity.position.x - (deltas.x * 2), entity.position.y - (deltas.y * 2));
        if (entity.shiftDown) {
            neighbor.move(deltas.x, deltas.y);
        }
    });
};

window.DeathComponent = function (entity) {
    entity.die = function () {
        entity.trigger("die");
    };
};

var Entity = function (schematic) {
    this._events = {};
    _.extend(this, schematic);
    this.schematic = schematic;
    if (schematic.events !== undefined) {
        for (var key in schematic.events) {
            if (schematic.events.hasOwnProperty(key)) {
                this.on(key, schematic.events[key].bind(this));
            }
        }
    }
    this.loadComponents(schematic.components);
    if (schematic.frame !== undefined) {
        //     this.world.gameLoop.on("frame", schematic.frame.bind(this));
        this.frame = schematic.frame.bind(this);
    }
};

Entity.prototype.loadComponents = function (components) {
    for (var i = 0; i < components.length; i++) {
        components[i](this);
    }
};

Entity.prototype.on = function (name, callback) {
    if (this._events[name] === undefined) {
        this._events[name] = {};
    }
    var eventId = name + _.size(this._events[name]);
    this._events[name][eventId] = callback;
    return eventId;
};

Entity.prototype.trigger = function () {
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    var callbacks = this._events[name];
    if (callbacks !== undefined) {
        for (var i in callbacks) {
            if (callbacks.hasOwnProperty(i)) {
                callbacks[i].apply(this, args);
            } //should use arguments instead of single argument
        }
    }
};

Entity.prototype.remove = function (name, id) {
    this._events[name][id] = null;
    delete this._events[name][id];
};

/**
 * @todo move this to a component
 */
Entity.prototype.transition = function (stateName) {
    this.state = stateName;

    // if(this.states[state_name].frame !== undefined){
    //     this.frame = this.states[state_name].frame.bind(this);
    // }
    if (this.states[stateName].events !== undefined) {
        for (var key in this.states[stateName].events) {
            if (this.states[stateName].events.hasOwnProperty(key)) {
                this._events[key] = {};
                if (this.states[stateName].events[key]) {
                    this.on(key, this.states[stateName].events[key].bind(this));
                }

            }
        }
    }
    _.extend(this, this.states[stateName]);//that should override the correct things
    if (this.states[stateName].components !== undefined) {
        this.loadComponents(this.states[stateName].components);
    }
    this.trigger("transition", stateName);
    this.trigger("transition:" + stateName, this);
};