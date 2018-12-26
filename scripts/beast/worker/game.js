"use strict";
//import configs

var window = {};

self.importScripts("../config.js");
self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js");
self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.4.0/simplex-noise.min.js");

self.importScripts("../../being/components/event.js");
self.importScripts("../../being/components/collision.js");
self.importScripts("../../being/components/move.js");
self.importScripts("../../being/components/die.js");
self.importScripts("../../being/components/state.js");

//FIXME update this as well
self.importScripts("components.js");

self.importScripts("../entities/level.js");
self.importScripts("../actors/block.js");
self.importScripts("../actors/floor.js");
self.importScripts("../actors/green-switch.js");
self.importScripts("../actors/red-switch.js");
self.importScripts("../actors/egg.js");
self.importScripts("../actors/monster.js");
self.importScripts("../actors/mother.js");
self.importScripts("../actors/player.js");

var noise = new window.SimplexNoise();

/**
 * Attach events to new entities
 * @param entity
 */
function initEntity(entity) {
    console.debug("creating a ", entity)
    entity.remove = function () {
        self.postMessage({
            event: "remove",
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon
        });
        entity.world.entities[entity.position.x + "," + entity.position.y] = _.without(entity.world.entities[entity.position.x + "," + entity.position.y], entity);
    }

    /**
     * Entity Functions
     */
    entity.sleep = function () {
        entity._sleep = true;
        self.postMessage({
            event: "remove",
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon
        });
    };

    entity.wake = function () {
        entity._sleep = false;
        self.postMessage({
            event: "place",
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon
        });
    };

    entity.init = function () {
        self.postMessage({
            event: "place",
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon
        });

        var distance = Math.sqrt(
            (BL.Viewport.x - entity.position.x)
            * (BL.Viewport.x - entity.position.x)
            + (BL.Viewport.y - entity.position.y)
            * (BL.Viewport.y - entity.position.y)
        );

        var radius = Math.sqrt(
            (BL.Viewport.width)
            * (BL.Viewport.width)
            + (BL.Viewport.height)
            * (BL.Viewport.height)
        );

        if (distance > radius && radius > 0) {
            entity.sleep();
        }
    };

    /**
     * Entity Listeners
     */
    entity.on("completeMove", function (/*deltaX, deltaY*/) {
        //need to make this flexible enough to accommodate many players eventually
        //then it can go into it's own component
        var distance = Math.sqrt(
            (BL.Viewport.x - entity.position.x)
            * (BL.Viewport.x - entity.position.x)
            + (BL.Viewport.y - entity.position.y)
            * (BL.Viewport.y - entity.position.y)
        );
        var radius = Math.sqrt(
            (BL.Viewport.width)
            * (BL.Viewport.width)
            + (BL.Viewport.height)
            * (BL.Viewport.height)
        );
        if (distance > radius) {

            entity.sleep();
        }
    });

    entity.on("completeMove", function (deltaX, deltaY, oldPosition) {
	console.debug("complete entity move", self)
        self.postMessage({
            event: "completeMove",
            deltas: {
                deltaX: deltaX,
                deltaY: deltaY
            },
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon
        });
    });

    entity.on("die", function () {
        self.postMessage({
            event: "die",
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon,
            worth: entity.worth
        });
        delete entity.world.entities[entity.position.x + "," + entity.position.y][entity._id];
    });

    entity.on("transition", function (from, to) {
	initEntity(to)
        self.postMessage({
            event: "transition",
            // need like a tojson
            from: {
                entity: {
                    position: {
                        x: from.position.x,
                        y: from.position.y
                    },
                    kind: from.kind
                },
                _id: from._id,
                icon: from.icon
            },
            to: {
                entity: {
                    position: {
                        x: to.position.x,
                        y: to.position.y
                    },
                    kind: to.kind
                },
                _id: to._id,
                icon: to.icon
            }
        });
    });

    entity.init();
}

var newWorld = function() {
    var world = new BL.entities.Level();

    return world;
};

self.addEventListener("message", function (e) {
    if (e.data) {
        switch (e.data.event) {

            //should move these to functions and call with reflection

            case "move":
                self.player.move(e.data.deltaX, e.data.deltaY);
		console.debug(world.entities)
                break;
            case "pulling":
		console.debug("setting pulling", e.data.isPulling)
                self.player.pulling = e.data.isPulling;
                break;
            case "viewport":
                BL.Viewport.width = e.data.width;
                BL.Viewport.height = e.data.height;
                break;
            case "kill":
                self.close();
                break;
            case "place":
                var new_piece = new BL.actors[e.data.kind](e.data.x, e.data.y, world);
                world.entities.place(new_piece);
                break;
	    case "clear":
		console.debug(world.entities[e.data.x+","+e.data.y])
	        for (var entity; entity = world.entities[e.data.x+","+e.data.y].pop();) {
		    entity.remove()
		}
		break;
            case "start":
                self.world.start();
                break;
            case "stop":
                self.world.stop();
                break;
            case "pause":
                self.world.pause();
                break;
            case "validate":
                self.world.validate();
                break;
        }
    }
});

function is_game_over(wolrd) {
    var red_switches = 0
    var green_switches = 0

    for (var loc in world.entities) {

        // should separate this
        if (loc !== 'place') {
            if (world.entities.hasOwnProperty(loc)) {
                var tile = world.entities[loc]
                for (var i = 0; i < tile.length; i++) {
                    if(tile[i].kind === "green-switch"){
                        green_switches++;
                    } else if (tile[i].kind === "red-switch"){
                        red_switches++;
                    }
                }
            }
        }
    }

    return green_switches > 0 && red_switches == 0
}

self.init = function() {
    self.world = newWorld(BL.Viewport.x, BL.Viewport.y);

    self.world.on('place', function(entity) {
        if (entity instanceof Player) {
            self.player = entity;
        }
    });

    self.world.on("place", initEntity);
    self.world.start();

    // @TODO limit how much this runs
    self.world.on(
        "tick",
        function () {
            if (is_game_over(self.world)) {
                self.postMessage({
                    event: "victory"
                })
                self.close();
            }
        }
    )

	// self.world.stop()
};

self.init();
