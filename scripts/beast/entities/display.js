/**
 * A component to sit above the render layer for an entity
 * @param {Entity} player The entity to be displayed
 * @param {String} icon   A path to the image for the entity
 */
BL.entities.Display = function (player, renderer, icon) {
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
        renderer.entity(self);
    };

    this.render(player, icon);
};
