"use strict";
//import configs
console.debug("worker");

self.importScripts("../config.js");
self.importScripts("/bower_components/underscore/underscore.js");
self.importScripts("/bower_components/noisejs/index.js");

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
self.importScripts("../actors/egg.js");
self.importScripts("../actors/monster.js");
self.importScripts("../actors/mother.js");
self.importScripts("../actors/player.js");


var noise = new Noise(Math.random());

/**
 * Attach events to new entities
 * @param entity
 */
function initEntities(entity) {

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
            console.debug("going to sleep");
            entity.sleep();
        }
    });

    entity.on("completeMove", function (deltaX, deltaY) {
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
    });

    entity.on("transition", function () {
        self.postMessage({
            event: "transition",
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

    entity.init();
}

var newWorld = function() {
    var world = new BL.entities.Level();

    return world;
};

BL.actors.player = function(xPos, yPos, world){

    this.__proto__ = new Player(xPos, yPos, world);

    var player = this;

    player.on("completeMove", function (deltaX, deltaY) {
        BL.Viewport.x = player.position.x;
        BL.Viewport.y = player.position.y;

        var delta = deltaX + deltaY; //should come out to 1 or -1
        var visible_entities, x, y, e;

        //past row/column moved x
        if (Math.abs(deltaX) > 0) {
            //delete past y
            for (y = -BL.Viewport.height; y < BL.Viewport.height; y++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.ceil(BL.Viewport.x - (BL.Viewport.width + 1) * delta),
                    Math.ceil(BL.Viewport.y + y));

                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].sleep();
                }
            }
            //wake new y
            for (y = -BL.Viewport.height; y < BL.Viewport.height; y++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.ceil(BL.Viewport.x + (BL.Viewport.width + 1) * delta),
                    Math.ceil(BL.Viewport.y + y));
                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].wake();

                }
            }
        }
        //moved y
        else {
            for (x = -BL.Viewport.width; x < BL.Viewport.width; x++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.floor(BL.Viewport.x + x),
                    Math.floor(BL.Viewport.y - (BL.Viewport.height + 1) * delta));
                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].sleep();
                }
            }
            //wake new y
            for (x = -BL.Viewport.width; x < BL.Viewport.width; x++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.floor(BL.Viewport.x + x),
                    Math.floor(BL.Viewport.y + (BL.Viewport.height + 1) * delta));
                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].wake();
                }
            }
        }
    });
    player.on("die", function () {
        self.close();
    });
    self.player = player;
};

BL.actors.player.prototype = Player

self.addEventListener("message", function (e) {
    if (e.data) {
        switch (e.data.event) {
            case "move":
                self.player.move(e.data.deltaX, e.data.deltaY);
                break;
            case "pulling":
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
                console.debug("place event:", e);
                var new_piece = new BL.actors[e.data.kind](e.data.x, e.data.y, world);
                console.debug(new_piece);
                world.entities.place(new_piece);
                break;
        }
    }
});

self.init = function() {
    var xPos = BL.Viewport.x = 1024;
    var yPos = BL.Viewport.y = 1024;

    self.world = newWorld(xPos, yPos);
    // self.player = newPlayer(xPos, yPos, self.world);

    self.world.on("place", initEntities);
    // self.world.entities.place(self.player);
    // self.world.explore(xPos - 8, yPos - 8, 16);
    self.world.start();
};

self.init();
