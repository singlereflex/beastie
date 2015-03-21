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
