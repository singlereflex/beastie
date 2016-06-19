"use strict";

/**
 * Explore Component - Trigger the world to generate on entity movement.
 * @param {Entity} entity
 * @constructor
 */
BL.ExploreComponent = function (entity, world) {
    entity.on("completeMove", function () {
        if (world[entity.position.x + "/" + entity.position.y] === undefined) {
            world.explore(entity.position.x - 8, entity.position.y - 8, 16);
        }
    });
};



/**
 * Push Component - Attach the ability for this entity to push blocks.
 * @param {Entity} entity
 * @param {BL.World} world
 * @constructor
 */
BL.PushComponent = function (entity, world) {
    //subscribe to move event
    entity.on("startMove", function (deltaX, deltaY) {
        var tile = world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY);
        for (var item in tile) {
            if (tile.hasOwnProperty(item)) {
                var neighbor = tile[item];
                if (neighbor !== undefined && neighbor instanceof Block) {
                    neighbor.move(deltaX, deltaY);
                }
            }
        }

    });
};

var FallComponent = function (entity, world) {
    //subscribe to move event
    entity.on("place", function () {
        var tile = world.findEntityByPosition(entity.position.x, entity.position.y);

        if (!(tile[0] instanceof Floor)) {
            entity.trigger("fall");
        }
    });
}

/**
 * Pull Component - Attach the ability for this entity to pull blocks.
 * @param {Entity} entity
 * @constructor
 */
BL.PullComponent = function (entity, world) {
    //subscribe to move event
    entity.on("completeMove", function (deltaX, deltaY) {
        var neighbor = world.findEntityByPosition(entity.position.x - (deltaX * 2), entity.position.y - (deltaY * 2));
        if (entity.pulling && neighbor[0] !== undefined) {
            neighbor[0].move(deltaX, deltaY);
        }
    });
};
