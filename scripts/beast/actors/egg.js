
/**
 * Egg Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
var Egg = function (x, y, world) {

    EventComponent(this);
    CollisionComponent(this, world);
    DeathComponent(this);
    FallComponent(this, world);
    StateComponent(this, {
        "hatch": Monster,
    });

    var self = this;
    this.worth = 10;
    this.age = 0;
    this.timeOfDeath = Math.random() * (4500 - 1500) + 1500;
    this.world = world;
    this.position = {
        x: x,
        y: y
    };

    this.icon = "icon-entities-egg";

    this.on("die", function die() {
        world.score += self.worth;
        world.entities[self.position.x + "," + self.position.y] = _.without(world.entities[self.position.x + "," + self.position.y], self);
        self.dead = true;
        self._events = {};
        this.world.remove("tick", self.tick);
    });

    this.on("collided", function (entity) {
        if (entity.kind === "player") {
            self.die();
            return;
        } 
	throw "hit an egg"
    });

    this.tick = function () {
        self.age++;
        if (self.age > Math.random() * (750 - 50) + 50) {
	    self.transition("hatch");
        }
    }
};

/**
 * Class property, this links related classes
 * @type {String}
 */
Egg.prototype.kind = "egg";

BL.actors[Egg.prototype.kind] = Egg;
