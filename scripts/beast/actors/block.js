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

    //is this duplicated everywhere?
    this.on("completeMove", function (deltaX, deltaY, old) {

        world.entities[old.x + "," + old.y] = _.without(world.entities[old.x + "," + old.y], self);
        world.entities.place(self, true);
    });

    this.on("collided", function (entity) {
        if (entity) {
            if (entity.kind === "block") {
                throw "hit a block";
            }
            if (entity.kind !== "block") {
                //check if we"re squishing something :)
                var deltaX = entity.position.x - this.position.x;
                var deltaY = entity.position.y - this.position.y;
                var neighbor = this.world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY)[0];
                if (neighbor !== undefined/* && neighbor.kind === "block"*/) {
                    entity.die();
                } else {
                    throw "couldn't kill monster";
                }
            }
        }
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
