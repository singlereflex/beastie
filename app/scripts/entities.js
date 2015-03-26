"use strict";

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

/**
 * A component to sit above the render layer for an entity
 * @param {Entity} player The entity to be displayed
 * @param {String} icon   A path to the image for the entity
 */
BL.Display = function (player, renderer, icon) {
    this._events = {};
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

//Attach events to the display, useful for a render event
//Only used for dom renderer
EventComponent(BL.Display);

/**
 * A main thread component to allow interaction between
 * a controlled player and the worker manageing the game state.
 * @param {worker} game The worker to post messages to.
 */
BL.DummyPlayer = function (game) {
    this.move = function (deltaX, deltaY) {
        game.postMessage({
            event: "move",
            deltaX: deltaX,
            deltaY: deltaY
        });
    };

    this.pulling = function (yes) {
        game.postMessage({
            event: "pulling",
            isPulling: yes
        });
    };

    MoveControllerComponent(this);
    BL.PullControllerComponent(this);
};
