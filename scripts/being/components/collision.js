/**
 * Collision Component - Trigger the collision event if entity exists in that position.
 * @param {Entity} entity
 * @constructor
 */
var CollisionComponent = function (entity, world) {
  entity.on("startMove", function (deltaX, deltaY) {
    var collided = world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY);

    for(i in collided){
      collided[i].trigger("collided", entity, deltaX, deltaY);
    }
  });
};
