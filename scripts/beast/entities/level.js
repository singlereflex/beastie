
const ticks = {
  "mother": [random_move],
  "beast": [random_move, beast_age],
  "egg": [egg_age],
}

function tick(map) {
  for (const x in map) {
    for (const y in map[x]) {
      if (!map[x][y]) continue;
      const { type, age } = map[x][y];
      const actions = ticks[type] || [];
      for (const action of actions) {
        try {
          action(map, parseInt(x), parseInt(y), age);
        } catch (e) {
          if (e.message === "can't move") {
            continue
          }
          throw e
        }
      }
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function random_move(map, x, y) {
  const delta = getRandomInt(-1, 2);
  const virtical = getRandomInt(0, 2) > 0;
  if (virtical) {
    move(map, x, y, 0, delta);
  } else {
    move(map, x, y, delta, 0);
  }
}

function beast_age(map, x, y, age) {
  if (!map[x][y]) {
    return;
  }
  if (age > 30) {
    self.postMessage({
      event: "die",
      x,
      y,
    });
    place(map, x, y, "mother");
  }
  map[x][y].age += getRandomInt(0, 3);
}

function egg_age(map, x, y, age) {
  if (age > 30) {
    self.postMessage({
      event: "die",
      x,
      y,
    });
    place(map, x, y, "beast");
  }
  map[x][y].age += getRandomInt(0, 3);
}


function move(map, x, y, delta_x, delta_y, pulling) {
  console.debug(pulling);
  const xx = x + delta_x;
  const yy = y + delta_y;

  const { type, age } = map[x][y];
  if (!map[xx]) {
    map[xx] = {};
  } else if (map[xx][yy]) {
    const { type: ctype, age: cage } = map[xx][yy];
    action = collide(type, ctype);
    action(map, xx, yy, delta_x, delta_y);

  }

  map[xx][yy] = map[x][y];
  delete map[x][y];

  self.postMessage({
    event: "move",
    x,
    y,
    delta_x,
    delta_y,
  });

  if (pulling) {
    console.debug("trying to pull");
    const xp = x - delta_x;
    const yp = y - delta_y;
    const { type: ptype, age: page } = map[xp][yp];
    // can move to a pulling set of rules like collision
    if (ptype === "block") {
      move(map, xp, yp, delta_x, delta_y);
    }
  }

  explore(map, xx, xx, 10);
}

function kill(map, x, y, delta_x, delta_y) {
  delete map[x][y];
  self.postMessage({
    event: "die",
    x,
    y,
  });
}

function die(map, x, y, delta_x, delta_y) {
  delete map[x-delta_x][y-delta_y];
  self.postMessage({
    event: "die",
    x: x-delta_x,
    y: y-delta_y,
  });
}

function error(map, x, y, delta_x, delta_y) {
  throw new Error("can't move");
}

function squish(map, x, y, delta_x, delta_y) {
  if (!map[x+delta_x][y+delta_y]) error(map, x, y, delta_x, delta_y);
  const { type } = map[x+delta_x][y+delta_y];
  if (type === "block") {
    kill(map, x, y, delta_x, delta_y)
    return;
  }
  error(map, x, y, delta_x, delta_y);
}

function collide(type, ctype) {
  return collisions[type][ctype];
}

collisions = {
  "player": {
    "mother": die,
    "beast": die,
    "egg": kill,
    "block": move,
  },
  "mother": {
    "player": kill,
    "mother": error,
    "beast": kill,
    "egg": kill,
    "block": move,
  },
  "beast": {
    "player": kill,
    "mother": die,
    "beast": error,
    "egg": error,
    "block": error,
  },
  "block": {
    "player": squish,
    "mother": squish,
    "beast": squish,
    "egg": squish,
    "block": error,
  },
}

const noise = new window.SimplexNoise();
const global_bounds = {
  x_min: 10,
  x_max: 10,
  y_min: 10,
  y_max: 10,
}
function explore(map, x, y, size) {
  const bounds = {
    x_min: x-size,
    x_max: x+size,
    y_min: y-size,
    y_max: y+size,
  }
  //explore from the global x_min to local x_min.. accross the local y_min to y_max
  //explore from the global x_max to the local x_max.. accross the local y_min to y_max
  if (global_bounds.x_min > bounds.x_min) {
    for (var x = global_bounds.x_min; x > bounds.x_min; x--) {
      for (var y = bounds.y_min; y < bounds.y_max; y++) {
        if (map[x] === undefined) {
          map[x] = {};
        }
        if (map[x][y] === undefined) {
          if (noise.noise2D(x, y / 10) > 0.5 || noise.noise2D(x / 10, y) > 0.5) {
            let new_piece = "block";
            place(map, x, y, new_piece);
          } else if (noise.noise2D(x / 8, y / 8) > 0.7) {
            let new_piece = "egg";
            place(map, x, y, new_piece);
          }
        }
      }
    }
    global_bounds.x_min = bounds.x_min;
  }

  if (global_bounds.x_max < bounds.x_max) {
    for (var x = global_bounds.x_max; x < bounds.x_max; x++) {
      for (var y = bounds.y_min; y < bounds.y_max; y++) {
        if (map[x] === undefined) {
          map[x] = {};
        }
        if (map[x][y] === undefined) {
          if (noise.noise2D(x, y / 10) > 0.5 || noise.noise2D(x / 10, y) > 0.5) {
            let new_piece = "block";
            place(map, x, y, new_piece);
          } else if (noise.noise2D(x / 8, y / 8) > 0.7) {
            let new_piece = "egg";
            place(map, x, y, new_piece);
          }
        }
      }
    }
    global_bounds.x_max = bounds.x_max;
  }
  // same for y

  if (global_bounds.y_min > bounds.y_min) {
    for (var y = global_bounds.y_min; y > bounds.y_min; y--) {
      for (var x = bounds.x_min; x < bounds.x_max; x++) {
        if (map[x] === undefined) {
          map[x] = {};
        }
        if (map[x][y] === undefined) {
          if (noise.noise2D(x, y / 10) > 0.5 || noise.noise2D(x / 10, y) > 0.5) {
            let new_piece = "block";
            place(map, x, y, new_piece);
          } else if (noise.noise2D(x / 8, y / 8) > 0.7) {
            let new_piece = "egg";
            place(map, x, y, new_piece);
          }
        }
      }
    }
    global_bounds.y_min = bounds.y_min;
  }

  if (global_bounds.y_max < bounds.y_max) {
    for (var y = global_bounds.y_max; y < bounds.y_max; y++) {
      for (var x = bounds.x_min; x < bounds.x_max; x++) {
        if (map[x] === undefined) {
          map[x] = {};
        }
        if (map[x][y] === undefined) {
          if (noise.noise2D(x, y / 10) > 0.5 || noise.noise2D(x / 10, y) > 0.5) {
            let new_piece = "block";
            place(map, x, y, new_piece);
          } else if (noise.noise2D(x / 8, y / 8) > 0.7) {
            let new_piece = "egg";
            place(map, x, y, new_piece);
          }
        }
      }
    }
    global_bounds.y_max = bounds.y_max;
  }
}

function place(map, x, y, type) {
  // note that this is always the name of the function and the args
  if (map[x] === undefined) {
    map[x] = {};
  }

  map[x][y] = { type, age: 0 };
  self.postMessage({
    event: "place",
    x,
    y,
    type,
  });
}

/**
 * BeastLand World Constructor
 * @constructor
 */
BL.entities.Level = function () {

  this.running = false;
  this.score = 0;
  this.entities = {};

  this.animloop = function () {
    tick(this.entities);

    if (this.running) {
      setTimeout(this.animloop.bind(this), 500);
    }

  };

  this.start = function () {
    this.running = true;
    this.animloop();
  };

  this.stop = function () {
    this.running = false;
  }
};
