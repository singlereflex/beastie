
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
        "mother": Mother
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
            entity.die();
        } else if (entity.kind === "egg") {
            entity.worth = 0;

            self.beastSpeed = self.beastSpeed > 45 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 5;
            entity.die();
        } else if (entity.kind === "monster" && self.kind === "mother") {
            entity.worth = 0;

            self.beastSpeed = self.beastSpeed > 40 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 10;
            entity.die();
        } else if (entity.kind === "mother" && self.kind === "mother") {
            entity.worth = 0;

            self.beastSpeed = self.beastSpeed > 30 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 20;
            entity.die();
        } else {
            throw "hit a block";
        }
    });

    this.on("completeMove", function (deltaX, deltaY, old) {
        world.entities[old.x + "," + old.y] = _.without(world.entities[old.x + "," + old.y], self);
        world.entities.place(self, true);
    });

    this.tick = world.on("tick", function () {
        self.transition("hatch");
        if(self._sleep) return;
        self.age++;
        if (self.age > Math.random() * (750 - 50) + 50) {
            if (world.entities[self.position.x + "," + self.position.y].length === 1 && world.entities[self.position.x + "," + self.position.y][0] === self) {
                self.transition("hatch");
            }
        }
    });
};

/**
 * Class property, this links related classes
 * @type {String}
 */
Egg.prototype.kind = "egg";

BL.actors[Egg.prototype.kind] = Egg;
