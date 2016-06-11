/**
 * Mother Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
var Mother = function (x, y, world) {

    BL.PushComponent(this, world);
    CollisionComponent(this, world);

    var self = this;
    this.worth = 30;
    this.kind = "mother";
    this.icon = "icon-entities-mother";
    this.position = {
        x: x,
        y: y
    };
    this.world = world;

    this.lay = function () {
        var egg = new BL.Egg(self.position.x, self.position.y, world);
        world.entities.place(egg);
    };

    this.tick = world.on("tick", function () {
      if(self._sleep) return;
        self.age++;
        if (self.age > self.timeOfDeath) {
            //you get less points if you let them die of old age
            self.worth = 1;
            console.debug("died of old age so I'm worth "+ self.worth );
            self.die();
            return;
        }

        var test = Math.floor(Math.random() * 100);

        if (test === 0 && world.findEntityByPosition(self.position.x, self.position.y).length < 2) {
            var noOneAround = true;
            for (var i = 0; i < self.moves.length; i++) {
                var move = self.moves[i];
                if (world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1]).length > 0) {
                    noOneAround = false;
                    break;
                }
            }
            if (noOneAround) {
                self.lay();
            }

        }
        self.hunt(self);
    });
};

BL.actors[Mother.prototype.kind] = Mother;
