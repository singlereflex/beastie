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
	console.debug("moving player", self._id)
        world.entities.place(self, true);
        // center(self.el);
    });
    BL.PullComponent(this, world);

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

    var player = this;

    player.on("completeMove", function (deltaX, deltaY) {
        BL.Viewport.x = player.position.x;
        BL.Viewport.y = player.position.y;

        var delta = deltaX + deltaY; //should come out to 1 or -1
        var visible_entities, x, y, e;

        //past row/column moved x
        if (Math.abs(deltaX) > 0) {
            //delete past y
            for (y = -BL.Viewport.height; y < BL.Viewport.height; y++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.ceil(BL.Viewport.x - (BL.Viewport.width + 1) * delta),
                    Math.ceil(BL.Viewport.y + y));

                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].sleep();
                }
            }
            //wake new y
            for (y = -BL.Viewport.height; y < BL.Viewport.height; y++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.ceil(BL.Viewport.x + (BL.Viewport.width + 1) * delta),
                    Math.ceil(BL.Viewport.y + y));
                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].wake();

                }
            }
        }
        //moved y
        else {
            for (x = -BL.Viewport.width; x < BL.Viewport.width; x++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.floor(BL.Viewport.x + x),
                    Math.floor(BL.Viewport.y - (BL.Viewport.height + 1) * delta));
                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].sleep();
                }
            }
            //wake new y
            for (x = -BL.Viewport.width; x < BL.Viewport.width; x++) {
                visible_entities = player.world.findEntityByPosition(
                    Math.floor(BL.Viewport.x + x),
                    Math.floor(BL.Viewport.y + (BL.Viewport.height + 1) * delta));
                for (e = 0; e < visible_entities.length; e++) {
                    visible_entities[e].wake();
                }
            }
        }
    });
    player.on("die", function () {
        self.close();
    });

};

/**
 * Class property, this links related classes
 * @type {String}
 */
Player.prototype.kind = "player";

BL.actors[Player.prototype.kind] = Player;
