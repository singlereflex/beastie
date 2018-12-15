/**
 * Death Component - Attach the ability for this entity to die.
 * @param {Entity} entity
 * @constructor
 */
var DeathComponent = function (entity) {
    entity.die = function (){
        this.trigger("die");
    };

    entity.on('fall', function(){
        this.trigger('die');
    })
};
