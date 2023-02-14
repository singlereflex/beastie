"use strict";
//import configs

var window = {};

self.importScripts("../config.js");
//self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js");
self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.4.0/simplex-noise.min.js");


self.importScripts("../entities/level.js");

var noise = new window.SimplexNoise();

var newWorld = function() {
  var world = new BL.entities.Level();
  return world;
};

function findPlayer(map) {
  for (const x in map) {
    for(const y in map[x]) {
      if (!map[x][y]) continue;
      const { type } = map[x][y];
      if (type === "player") {
        return { x, y };
      }
    }
  }
}

self.addEventListener("message", function (e) {
  if (e.data) {
    console.debug(e.data);
    switch (e.data.event) {

        //should move these to functions and call with reflection

      case "move":
        const { x, y } = findPlayer(self.world.entities);
        move(self.world.entities, parseInt(x), parseInt(y), parseInt(e.data.x), parseInt(e.data.y));
        break;
      case "pulling":
        console.debug("setting pulling", e.data.isPulling)
        break;
      case "viewport":
        BL.Viewport.width = e.data.width;
        BL.Viewport.height = e.data.height;
        break;
      case "kill":
        self.close();
        break;
      case "place":
        break;
      case "clear":
        break;
      case "start":
        self.world.start();
        break;
      case "stop":
        self.world.stop();
        break;
      case "pause":
        self.world.pause();
        break;
    }
  }
});

function is_game_over(wolrd) {
  return false
}

self.init = function() {
  self.world = newWorld();

  explore(self.world.entities, 0, 0, 25);
  place(self.world.entities, 10, 10, "player");

};

self.init();
