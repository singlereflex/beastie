/**
 * Floor Constructor
 * @type {Entity}
 * @param {Number} x - X Coordinate
 * @param {Number} y - Y Coordinate
 * @param {BL.World} world - BeastLand World
 * @constructor
 */
console.log("Loaded floor")
BL.actors.Floor = function (x, y, world) {
    EventComponent(this);

    var self = this;
    this.position = {
        x: x,
        y: y
    };
    this.world = world;
    this.kind = "floor";
    this.icon = "icon-environment-floor";

};
