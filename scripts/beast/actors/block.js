/**
 * Block Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
var Block = function (x, y, world) {

    EventComponent(this);
    CollisionComponent(this, world);
    MoveComponent(this);
    FallComponent(this, world);
    StateComponent(this, {
        "drop": Floor
    });


    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;

    this.icon = "icon-environment-block";

    this.on("collided", function (entity, deltaX, deltaY) {
	if (entity.kind == 'player') {
	    this.move(deltaX, deltaY)
            return
	}
        throw "hit a block";
    });

    this.on("fall", function() {
        self.transition("drop");
    })

};

/**
 * Class property, this links related classes
 * @type {String}
 */
Block.prototype.kind = "block";

//be nice to have a load actor type component
BL.actors[Block.prototype.kind] = Block;
