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
