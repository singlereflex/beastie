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
    //adding this here needs to be a component
    entity.sleep = function(){
      entity._sleep = true;
    }
    entity.wake = function(){
      entity._sleep = false;
    }
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
    entity.on("completeMove", function(deltaX, deltaY){
      //need to make this flexible enough to accomidate many players eventually
      //then it can go into it's own component
      var distance = Math.sqrt(
        (BL.Viewport.x-entity.position.x)
        *(BL.Viewport.x-entity.position.x)
        +(BL.Viewport.y-entity.position.y)
        *(BL.Viewport.y-entity.position.y)
      );
      var radius = Math.sqrt(
        (BL.Viewport.width)
        *(BL.Viewport.width)
        +(BL.Viewport.height)
        *(BL.Viewport.height)
      )
      if(distance > radius){
        console.debug("going to sleep");
        entity.sleep();
      }
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
        //this can go elsewhere eventually but here for now
        for(var x = -BL.Viewport.width; x < BL.Viewport.width; x++){
          for(var y = -BL.Viewport.height; y < BL.Viewport.height; y++){
            var visible_entities = player.world.findEntityByPosition(Math.floor(BL.Viewport.x+x), Math.floor(BL.Viewport.y+y));
            for(var e = 0; e < visible_entities.length; e++){
              if(visible_entities[e].kind !== "player"){
                if(visible_entities[e]._sleep){
                  visible_entities[e].wake();
                }
                var entity = visible_entities[e]
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
              }
            }
          }
        }
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
                if (noise.simplex2(i, e/10) > 0.5 || noise.simplex2(i/10, e) > 0.5) {
                    loop.entities.place(new BL.Block(i, e, loop));
                } else if (noise.simplex2(i/8, e/8) > 0.5) {
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

self.loop.explore(1024 - 8, 1024 - 8, 16);
self.loop.start();
// }
