
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
      for (action of actions) {
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
  const delta_x = getRandomInt(-1, 2)
  const delta_y = getRandomInt(-1, 2)
  move(map, x, y, delta_x, delta_y);
}

function beast_age(map, x, y, age) {
  if (!map[x][y]) {
    return;
  }
  if (age > 30) {
    map[x][y] = { type: "mother", age: 0 };
  }
  map[x][y].age++;
}

function egg_age(map, x, y, age) {
  if (age > 30) {
    map[x][y] = { type: "beast", age: 0 };
  }
  map[x][y].age++;
}


function move(map, x, y, delta_x, delta_y) {
  const xx = x + delta_x;
  const yy = y + delta_y;

  const { type, age } = map[x][y];
  if (!map[xx]) {
    map[xx] = {};
  } else if (map[xx][yy]) {
    const { type: ctype, age: cage } = map[xx][yy];

    action = collide(type, ctype); // should return a function name, or trigger it's call
    // kill, die, move
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
}

function kill(map, x, y, delta_x, delta_y) {
  delete map[x][y];
}

function die(map, x, y, delta_x, delta_y) {
  delete map[x-delta_x][y-delta_y];
}

function error(map, x, y, delta_x, delta_y) {
  throw new Error("can't move");
}

function squish(map, x, y, delta_x, delta_y) {
  if (!map[x+delta_x][y+delta_y]) return;
  const { type } = map[x+delta_x][y+delta_y];
  if (type === "block") {
    kill(map, x, y, delta_x, delta_y)
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

function explore(map, x, y, size) {
  var noise = new window.SimplexNoise();

  for (var i = x; i < x + size; i++) {
    for (var e = y; e < y + size; e++) {
      if (map[i] === undefined) {
        map[i] = {};
      }
      if (map[i][e] === undefined) {
        if (noise.noise2D(i, e / 10) > 0.5 || noise.noise2D(i / 10, e) > 0.5) {
          let new_piece = "block";
          place(map, i, e, new_piece);
        } else if (noise.noise2D(i / 8, e / 8) > 0.5) {
          let new_piece = "egg";
          place(map, i, e, new_piece);
        }
      }
    }
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
      setTimeout(this.animloop.bind(this), 1000);
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
