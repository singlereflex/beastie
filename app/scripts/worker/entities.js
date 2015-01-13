"use strict";

BL.World = function () {
    this._events = {};
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
BL.EventComponent(BL.World);

BL.Player = function (x, y, world) {
    this._events = {};

    //behavior
    var self = this;

    this.on("completeMove", function update(deltaX, deltaY, old) {
        self.world.entities[old.x + "," + old.y] = _.without(self.world.entities[old.x + "," + old.y], self);
        self.world.entities.place(self, true);
        // center(self.el);
    });

    this.on("die", function die() {
        self.world.entities[self.position.x + "," + self.position.y] = _.without(self.world.entities[self.position.x + "," + self.position.y], self);
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

    this.world = world;

    //setup for dom rendering
    this.position = {
        x: x,
        y: y
    };

    this.kind = "player";

    BL.PushComponent(this);

    BL.PullComponent(this);

    BL.CollisionComponent(this);

    BL.ExploreComponent(this);
    this.icon = "icon-entities-player";
};

//Class level component!
BL.EventComponent(BL.Player);
BL.MoveComponent(BL.Player);
BL.DeathComponent(BL.Player);

// Blocks!
BL.Block = function (x, y, world) {
    this._events = {};


    //behavior
    var self = this;
    // this.on("rendered", function(){
    //   self.el = document.getElementById("entityboard").appendChild(self.el);
    //   self.on("completeMove", function (deltaX, deltaY) {
    //       self.el.style.top = self.position.y + "em";
    //       self.el.style.left = self.position.x + "em";
    //   });
    // });

    this.on("completeMove", function (deltaX, deltaY, old) {
        self.world.entities[old.x + "," + old.y] = _.without(self.world.entities[old.x + "," + old.y], self);
        self.world.entities.place(self, true);
    });

    this.on("collided", function (entity) {
        // console.log(entity);
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

    this.world = world;
    this.position = {
        x: x,
        y: y
    };
    this.kind = "block";
    this.icon = "icon-environment-block";

    BL.CollisionComponent(this);
};

BL.EventComponent(BL.Block);
BL.MoveComponent(BL.Block);

// Eggs!
BL.Egg = function (x, y, world) {
    this._events = {};
    var self = this;
    self.worth = 10;
    this.on("die", function die() {
        // console.log(self.age);
        self.world.score += self.worth;
        // console.log(self.world.score);
        self.world.entities[self.position.x + "," + self.position.y] = _.without(self.world.entities[self.position.x + "," + self.position.y], self);
        // document.getElementById("entityboard").removeChild(self.el);
        self.dead = true;
        self._events = {};
        this.world.remove("tick", self.tick);
    });

    this.on("collided", function (entity) {
        if (entity.kind === "player") {
            entity.die();
        } else if (entity.kind === "egg") {
            entity.worth = 0;
            console.info("I ate an egg, I'm such a cannible. And you get " + entity.worth);
            self.beastSpeed = self.beastSpeed > 45 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 5;
            entity.die();
        } else if (entity.kind === "monster" && self.kind === "mother") {
            entity.worth = 0;
            console.info("I ate an monster, I'm such a cannible. And you get "+ entity.worth);
            self.beastSpeed = self.beastSpeed > 40 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 10;
            entity.die();
        } else if (entity.kind === "mother" && self.kind === "mother") {
            entity.worth = 0;
            console.info("I ate an mother, I'm such a cannible. And you get "+ entity.worth);
            self.beastSpeed = self.beastSpeed > 30 ? self.beastSpeed - 1 : self.beastSpeed;
            self.timeOfDeath += 20;
            entity.die();
        } else {
            throw "hit a block";
        }
    });

    this.on("completeMove", function (deltaX, deltaY, old) {
        self.world.entities[old.x + "," + old.y] = _.without(self.world.entities[old.x + "," + old.y], self);
        self.world.entities.place(self, true);
    });

    this.age = 0;
    this.timeOfDeath = Math.random() * (4500 - 1500) + 1500;

    this.world = world;
    this.position = {
        x: x,
        y: y
    };
    this.kind = "egg";

    this.tick = this.world.on("tick", function () {
        if(self._sleep) return;
        // console.log("tick");
        self.age++;
        if (self.age > Math.random() * (750 - 50) + 50) {

            if (self.world.entities[self.position.x + "," + self.position.y].length === 1 && self.world.entities[self.position.x + "," + self.position.y][0] === self) {
                self.transition("hatch");
            }
            // console.log("hatch");
            // return true;
        }
        // self.hunt(this);
    });
    // console.log(this.tick);
    this.icon = "icon-entities-egg";
    // BL.DomRenderer(this, template({classVal: "icon-entities-egg"}));
    // this.display = new Display(this, "icon-entities-egg");
    BL.CollisionComponent(this);

    BL.StateComponent(this, {
        "hatch": BL.Monster,
        "mother": BL.Mother
    });
};
BL.EventComponent(BL.Egg);
BL.DeathComponent(BL.Egg);

// Monsters!
BL.Monster = function () {

    this.moves = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
    ];

    var self = this;
    self.beastSpeed = 25 * 2;//move once every 5 seconds or die
    self.hunt = function () {

        // console.log(beast);
        if (self.probability === undefined) {
            self.probability = self.beastSpeed;
        }

        if (self.probability < 0) {
            self.die();
            return;
        }
        // console.log(self.probability);

        if (self.probability < 35) {
            var delta = (Math.floor(Math.random() * 4));
            // var move = self.moves[delta];
            for (var i = 0; i < self.moves.length; i++) {
                var move = self.moves[(delta + i) % 4];
                if (self.world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1]) === undefined ||
                    self.world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1]).length === 0 ||
                    (self.world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1])[0].kind !== "block" ||
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
            // var y = Math.floor(Math.random() * 2);
        }
        self.probability--;
    };

    self.worth = 20;
    if (arguments.length > 1) {
        this.position = {
            x: arguments[0],
            y: arguments[1]
        };
    }
    if (arguments.length > 2) {
        this.world = arguments[2];
    }
    this.kind = "monster";
    this.world.remove("tick", this.tick);

    this.tick = this.world.on("tick", function () {
      if(self._sleep) return;
        self.age++;
        if (self.age > Math.random() * (1500 - 750) + 750) {
            self.transition("mother");
            return true;
        }
        self.hunt();
    });
    // console.log(this.tick);
    BL.MoveComponent(this);
    this.icon = "icon-entities-monster";
    // this.display.render(this, "icon-entities-monster");
    BL.ExploreComponent(this);
};

// Mothers!
BL.Mother = function () {

    var self = this;

    self.worth = 30;

    if (arguments.length > 1) {
        self.position = {
            x: arguments[0],
            y: arguments[1]
        };
    }

    if (arguments.length > 2) {
        self.world = arguments[2];
    }

    self.kind = "mother";
    self.world.remove("tick", this.tick);

    self.lay = function () {
        var egg = new BL.Egg(self.position.x, self.position.y, self.world);
        self.world.entities.place(egg);
    };

    self.tick = this.world.on("tick", function () {
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

        if (test === 0 && self.world.findEntityByPosition(self.position.x, self.position.y).length < 2) {
            var noOneAround = true;
            for (var i = 0; i < self.moves.length; i++) {
                var move = self.moves[i];
                if (self.world.findEntityByPosition(self.position.x + move[0], self.position.y + move[1]).length > 0) {
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
    this.icon = "icon-entities-mother";
    this.removeAll("startMove");
    // this.display.render(this, "icon-entities-mother");
    BL.PushComponent(this);
    BL.CollisionComponent(this);
};
