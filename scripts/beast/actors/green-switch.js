/**
 * GreenSwitch Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */

GreenSwitch = function (x, y, world) {
    EventComponent(this);

    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;
    this.icon = "icon-environment-switch-green";

};

/**
 * Class property, this links related classes
 * @type {String}
 */
GreenSwitch.prototype.kind = "green-switch";

BL.actors[GreenSwitch.prototype.kind] = GreenSwitch;
