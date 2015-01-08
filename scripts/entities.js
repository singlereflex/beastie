"use strict";

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

BL.Display = function (player, icon) {
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

        self.kind = player.kind;
        self.icon = icon;
        BL.CanvasRenderer(self);
    };

    this.render(player, icon);
};

BL.EventComponent(BL.Display);

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

    BL.MoveControllerComponent(this);
    BL.PullControllerComponent(this);
};
