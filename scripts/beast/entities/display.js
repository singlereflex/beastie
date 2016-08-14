/**
 * A component to sit above the render layer for an entity
 * @param {Entity} player The entity to be displayed
 * @param {String} icon   A path to the image for the entity
 */

// @TODO handle this through inheritance
var layers = {
    "floor": "background",
    "red-switch": "background",
    "green-switch": "background",
    "player": "foreground"
}

BL.entities.Display = function (
    player,
    renderer,
    icon,
    dimension
) {
    this._events = {};

    EventComponent(this);

    var self = this;

    this.render = function (player, icon) {
        self.position = {
            x: player.position.x,
            y: player.position.y
        };

        self._position = {
            x: player.position.x,
            y: player.position.y
        };
        self.id = player.id;
        self.kind = player.kind;
        self.icon = icon;
        self.dimension = (dimension ? dimension : (layers[self.kind]?layers[self.kind]:"middleground"))
        renderer.entity(self);
    };

    this.render(player, icon);
};
