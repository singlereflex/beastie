"use strict";
//import configs


self.importScripts("../config.js");
self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js");

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
        delete entity.world.entities[entity.position.x + "," + entity.position.y][entity._id];
    }

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
    };

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
                let new_piece = new BL.actors[e.data.kind](e.data.x, e.data.y, world);
		let occupants = world.findEntityByPosition(e.data.x, e.data.y)
		for (let id in occupants) {
		    if (occupants[id].kind != "floor") {
	                world.entities[e.data.x+","+e.data.y][id].remove()
		    }
		}
                world.entities.place(new_piece);
                break;
	    case "clear":
		console.debug(world.entities[e.data.x+","+e.data.y])
	        for (var id in world.entities[e.data.x+","+e.data.y]) {
		    let entity = world.entities[e.data.x+","+e.data.y][id]
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

self.init = function() {
    self.world = newWorld(BL.Viewport.x, BL.Viewport.y);

    self.world.on('place', function(entity) {
        if (entity instanceof Player) {
            self.player = entity;
        }
    });

    self.world.on("place", initEntity);
};

self.init();
