
var _move = function (deltaX, deltaY) {
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
/**
 * Move Component - Attach the ability for this entity to move.
 * @param {Entity} entity
 * @constructor
 */
var MoveComponent = function (entity) {
    entity.move = _move;
};
