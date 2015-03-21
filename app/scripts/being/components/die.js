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
