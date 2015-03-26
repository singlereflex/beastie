"use strict";

/**
 * BeastLand World Constructor
 * @constructor
 */
BL.World = function () {

    EventComponent(this);

    var self = this;
    this.running = false;
    this.score = 0;
    this.entities = {};
    this.entities.place = function (entity, silent) {
        var loc = entity.position.x + "," + entity.position.y;
        if (!self.entities[loc]) {
            self.entities[loc] = [];
        }

        self.entities[loc].push(entity);
        if (entity._id === undefined) {
            entity._id = _.uniqueId("mob_");
        }
        if (!silent) {
            self.trigger("place", entity);
        }
    };

    this.findEntityByPosition = function (x, y) {
        return this.entities[x + "," + y] || [];
    };

    this.animloop = function () {
        // try {
        self.trigger("tick");

        // } catch (e) {
        // console.log(e);
        // self.pause();
        // }
        if (self.running) {
            setTimeout(self.animloop, 120);
        }
    };

    this.start = function () {
        this.running = true;
        self.animloop();
    };

    this.pause = function () {
        this.running = !this.running;
    };

    this.stop = function () {
        this.running = false;
    };

};

/**
 * A Beast.Land world entity
 * @typedef {Object} Entity
 */

/**
 * Player Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
BL.Player = function (x, y, world) {

    EventComponent(this);
    BL.PushComponent(this, world);
    BL.PullComponent(this, world);
    CollisionComponent(this, world);
    BL.ExploreComponent(this, world);
    MoveComponent(this);
    DeathComponent(this);

    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;
    this.kind = "player";
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
        if (entity.kind === "monster" || entity.kind === "mother") {
            self.die();
        } else if(entity.kind === "egg"){
            entity.die();
        } else {
            console.info("hit a block");
        }
    });

};

/**
 * Block Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
BL.Block = function (x, y, world) {

    EventComponent(this);
    CollisionComponent(this, world);
    MoveComponent(this);

    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;
    this.kind = "block";
    this.icon = "icon-environment-block";

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

};

/**
 * Egg Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
BL.Egg = function (x, y, world) {

    EventComponent(this);
    CollisionComponent(this, world);
    DeathComponent(this);
    StateComponent(this, {
        "hatch": BL.Monster,
        "mother": BL.Mother
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
    this.kind = "egg";
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
            console.info("I ate an egg, I'm such a cannibal. And you get " + entity.worth);
            self.beastSpeed = self.beastSpeed > 45 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 5;
            entity.die();
        } else if (entity.kind === "monster" && self.kind === "mother") {
            entity.worth = 0;
            console.info("I ate an monster, I'm such a cannibal. And you get "+ entity.worth);
            self.beastSpeed = self.beastSpeed > 40 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 10;
            entity.die();
        } else if (entity.kind === "mother" && self.kind === "mother") {
            entity.worth = 0;
            console.info("I ate an mother, I'm such a cannibal. And you get "+ entity.worth);
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
 * Monster Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
BL.Monster = function (x, y, world) {

    MoveComponent(this);
    BL.ExploreComponent(this, world);

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
 * Mother Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
BL.Mother = function (x, y, world) {

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
