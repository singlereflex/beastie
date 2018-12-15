/**
 * RedSwitch Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */

RedSwitch = function (x, y, world) {
    EventComponent(this);
    CollisionComponent(this, world);
    StateComponent(this, {
        "flip": GreenSwitch
    });

    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;
    this.icon = "icon-environment-switch-red";

    this.on("collided", function (entity) {
        console.info(arguments)
        if (entity) {
            if (entity.kind === "player") {
                self.transition("flip");
            }
        }
    });

};

/**
 * Class property, this links related classes
 * @type {String}
 */
RedSwitch.prototype.kind = "red-switch";

BL.actors[RedSwitch.prototype.kind] = RedSwitch;
