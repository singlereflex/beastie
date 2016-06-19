/**
 * Floor Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */

Floor = function (x, y, world) {
    EventComponent(this);

    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;
    this.icon = "icon-environment-floor";

};

/**
 * Class property, this links related classes
 * @type {String}
 */
Floor.prototype.kind = "floor";

BL.actors[Floor.prototype.kind] = Floor;
