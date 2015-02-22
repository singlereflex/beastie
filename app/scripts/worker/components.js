"use strict";

/**
 * Collision Component - Trigger the collision event if entity exists in that position.
 * @param {Entity} entity
 * @constructor
 */
BL.CollisionComponent = function (entity, world) {
    entity.on("startMove", function (deltaX, deltaY) {
        var collided = world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY);

        if (collided.length > 0) {
            for(var i = 0; i < collided.length; i++){
                entity.trigger("collided", collided[i]);
            }
        }
    });
};

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
 * Move Component - Attach the ability for this entity to move.
 * @param {Entity} entity
 * @constructor
 */
BL.MoveComponent = function (entity) {
    entity.move = function (deltaX, deltaY) {
        this.trigger("startMove", deltaX, deltaY);

        //move this to an event?
        if (this.position.x + deltaX < 0 || this.position.y + deltaY < 0) {
            throw "stay on the board please";
        }

        var oldPosition = {
            x: this.position.x,
            y: this.position.y
        };

        this.position.x += deltaX;
        this.position.y += deltaY;

        this.trigger("completeMove", deltaX, deltaY, oldPosition);
    };
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
        var neighbor = world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY)[0];
        if (neighbor !== undefined && neighbor.kind === "block") {
            neighbor.move(deltaX, deltaY);
        }
    });
};

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

/**
 * Death Component - Attach the ability for this entity to die.
 * @param {Entity} entity
 * @constructor
 */
BL.DeathComponent = function (entity) {
    entity.die = function (){
        this.trigger("die");
    };
};

/**
 * State Component - Attach the ability for this entity to change states.
 * @param {Entity} entity
 * @param {Object} states
 * @constructor
 */
BL.StateComponent = function (entity, states){
    entity.states = states;
    entity.transition = function(stateName){
        entity.states[stateName].apply(entity, [entity.position.x, entity.position.y, entity.world]);
        entity.trigger("transition");
    };
};
