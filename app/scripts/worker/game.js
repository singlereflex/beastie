"use strict";

self.BL = {};

self.importScripts("../../bower_components/underscore/underscore.js");
self.importScripts("../../bower_components/noisejs/index.js");
self.importScripts("../shared/components.js");
self.importScripts("components.js");
self.importScripts("entities.js");

var loop = new BL.World();
self.loop = loop;

var noise = new Noise(Math.random());

loop.on("place", function (entity) {
    // console.log(entity.icon);
    self.postMessage({
        event: "place",
        entity: {
            position: {
                x: entity.position.x,
                y: entity.position.y
            },
            kind: entity.kind
        },
        _id: entity._id,
        icon: entity.icon
    });
    entity.on("completeMove", function (deltaX, deltaY) {
        self.postMessage({
            event: "completeMove",
            deltas: {
                deltaX: deltaX,
                deltaY: deltaY
            },
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon
        });
    });
    entity.on("die", function () {
        self.postMessage({
            event: "die",
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon,
            worth: entity.worth
        });
    });
    entity.on("transition", function () {
        self.postMessage({
            event: "transition",
            entity: {
                position: {
                    x: entity.position.x,
                    y: entity.position.y
                },
                kind: entity.kind
            },
            _id: entity._id,
            icon: entity.icon
        });
    });
});

function addPlayer() {
    var x = 1024;
    var y = 1024;
    BL.Viewport.x = x;
    BL.Viewport.y = y;
    var player = new BL.Player(x, y, loop);
    player.on("completeMove", function () {
        BL.Viewport.x = player.position.x;
        BL.Viewport.y = player.position.y;
    });
    player.on("die", function () {
        self.close();
    });
    loop.entities.place(player);
    // center(player.el);
    return player;
}


function placeEgg(loop, _x, _y) {
    return new BL.Egg(_x, _y, loop);
}

self.loop.explore = function (x, y, size) {
    for (var i = x; i < x + size; i++) {
        for (var e = y; e < y + size; e++) {
            if (loop.entities[i + "," + e] === undefined) {
                if (noise.simplex2(i/15, e/2) > 0.4 || noise.simplex2(i/2, e/15) > 0.4) {
                    loop.entities.place(new BL.Block(i, e, loop));
                } else if (Math.floor(Math.random() * 50) === 0) {
                    var egg = placeEgg(loop, i, e);
                    loop.entities.place(egg);
                } else {
                    loop.entities[i + "," + e] = [];
                }
            }
        }
    }
};


var player = addPlayer();

self.addEventListener("message", function (e) {
    if (e.data) {
        switch (e.data.event) {
            case "move":
                player.move(e.data.deltaX, e.data.deltaY);
                break;
            case "pulling":
                player.pulling = e.data.isPulling;
                break;
            case "viewport":
                BL.Viewport.width = e.data.width;
                BL.Viewport.height = e.data.height;
                break;
            case "kill":
                self.close();
                break;
        }
    }
});

self.loop.explore(1024 - 24, 1024 - 24, 48);
self.loop.start();
// }
