/**
 * Monster Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
var Monster = function (x, y, world) {

    EventComponent(this);
    CollisionComponent(this, world);
    MoveComponent(this);
    //BL.ExploreComponent(this, world);
    DeathComponent(this);
    FallComponent(this, world);
    //StateComponent(this, {
    //    "mother": Mother
    //});

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

    this.age = 0;
    this.world = world;
    this.position = {
        x: x,
        y: y
    };

    this.hunt = function () {
	console.debug("hunting")
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
	        try {
		    self.move(move[0], move[1]);
		    self.probability = self.beastSpeed;
		    return;
	        } catch (e) {
		    console.error(e)
	        }
            }
        }
        self.probability--;
    };

    this.on("collided", function (entity) {
        if (entity) {
            if (entity.kind === "block") {
                self.trigger('die');
		return;
            }
        }
        throw "hit a monster"
    });

    this.tick =  function () {
        self.age++;
        //if (self.age > Math.random() * (1500 - 750) + 750) {
        //    self.transition("mother");
        //    return true;
        //}
        self.hunt();
    }
};

/**
 * Class property, this links related classes
 * @type {String}
 */
Monster.prototype.kind = "monster";

BL.actors[Monster.prototype.kind] = Monster;
