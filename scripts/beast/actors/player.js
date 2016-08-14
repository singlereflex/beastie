/**
 * Player Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
var Player = function (x, y, world) {

    EventComponent(this);
    BL.PushComponent(this, world);
    BL.PullComponent(this, world);
    CollisionComponent(this, world);
    // BL.ExploreComponent(this, world);
    MoveComponent(this);
    DeathComponent(this);
    FallComponent(this, world);

    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;

    this.icon = "icon-entities-player";

    this.on("completeMove", function update(deltaX, deltaY, old) {
        world.entities[old.x + "," + old.y] = _.without(world.entities[old.x + "," + old.y], self);
        world.entities.place(self, true);
        // center(self.el);
    });

    this.on("die", function die() {
        world.entities[self.position.x + "," + self.position.y] = _.without(world.entities[self.position.x + "," + self.position.y], self);
        self.dead = true;
    });

    this.on("collided", function collision(entity) {
        //should handle this differently
        if (entity.kind === "monster" || entity.kind === "mother") {
            self.die();
        } else if(entity.kind === "egg"){
            entity.die();
        } else if (entity.kind === "red-switch") {
            entity.transition("flip");
        } else if(entity instanceof Block){

        }
    });

};

/**
 * Class property, this links related classes
 * @type {String}
 */
Player.prototype.kind = "player";

BL.actors[Player.prototype.kind] = Player;
