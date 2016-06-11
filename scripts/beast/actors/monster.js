/**
 * Monster Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
var Monster = function (x, y, world) {

    MoveComponent(this);
    // BL.ExploreComponent(this, world);

    this.moves = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
    ];
    var self = this;
    this.beastSpeed = 25 * 2;//move once every 5 seconds or die
    this.worth = 20;
    this.kind = "monster";
    this.icon = "icon-entities-monster";

    this.hunt = function () {

        if (self.probability === undefined) {
            self.probability = self.beastSpeed;
        }

        if (self.probability < 0) {
            self.die();
            return;
        }

        if (self.probability < 35) {
            var delta = (Math.floor(Math.random() * 4));
            for (var i = 0; i < self.moves.length; i++) {
                var move = self.moves[(delta + i) % 4];
                if (world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1]) === undefined ||
                    world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1]).length === 0 ||
                    (world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1])[0].kind !== "block" ||
                    self.kind === "mother")) {
                    try {
                        self.move(move[0], move[1]);
                        self.probability = self.beastSpeed;
                        return;
                    } catch (e) {
                        console.debug("trying something: " + e);
                    }
                }
            }
        }
        self.probability--;
    };

    world.removeAll(this.tick);

    this.tick = world.on("tick", function () {
      if(self._sleep) return;
        self.age++;
        if (self.age > Math.random() * (1500 - 750) + 750) {
            self.transition("mother");
            return true;
        }
        self.hunt();
    });
};

/**
 * Class property, this links related classes
 * @type {String}
 */
Monster.prototype.kind = "monster";

BL.actors[Monster.prototype.kind] = Monster;
