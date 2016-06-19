/**
 * State Component - Attach the ability for this entity to change states.
 * @param {Entity} entity
 * @param {Object} states
 * @constructor
 */
var StateComponent = function (entity, states){
    entity.states = states;
    entity.transition = function(stateName){
        var new_state = new entity.states[stateName](entity.position.x, entity.position.y, entity.world);

        // should go in a special function in the entity
        entity.world.entities[entity.position.x + "," + entity.position.y] = _.without(entity.world.entities[entity.position.x + "," + entity.position.y], entity);

        entity.world.entities.place(new_state, true)

        entity.trigger("transition", entity, new_state);
    };
};
