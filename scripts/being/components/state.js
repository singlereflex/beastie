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

        new_state._id = entity._id
        // should go in a special function in the entity
	position = entity.position.x + "," + entity.position.y
        delete entity.world.entities[position][entity._id]

        entity.world.entities.place(new_state, true)

        entity.trigger("transition", entity, new_state);
    };
};
