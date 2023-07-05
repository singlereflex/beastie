/**
 * The game of beastie
 * @param {String} board For the moment the id of the canvas (or other dom element) used to render the game
 * @param {JSON} level The json description of the level to be played
 */
var Game = function(board, level, mode="game") {
  var self = this;

  //EventComponent(this);

  var world = {
    entities:{}
  };

  var queue = [];
  //could move this to a custom type later
  var renderQueue = [];

  var game = new Worker(`scripts/beast/worker/${mode}.js`);

  // var player = new BL.entities.DummyPlayer(game);

  var frameId;

  //could set this in a seperate private function
  var renderer = new PixiRenderer(board);

  this.ongameend = function() {};

  this.score = 0;
  document.body.addEventListener("keyup", function keyUp(event) {
    console.info(event);
    switch (event.keyCode) {
        //left
      case 37:
      case 65:
        event.preventDefault();
        game.postMessage({
          "event": "move",
          "pull": event.shiftKey,
          x: -1,
          y: 0,
        });
        break;
        //down
      case 40:
      case 83:
        event.preventDefault();
        game.postMessage({
          "event": "move",
          "pull": event.shiftKey,
          x: 0,
          y: 1,
        });
        //right
        break;
      case 39:
      case 68:
        event.preventDefault();
        game.postMessage({
          "event": "move",
          "pull": event.shiftKey,
          x: 1,
          y: 0,
        });
        break;
        //up
      case 38:
      case 87:
        event.preventDefault();
        game.postMessage({
          "event": "move",
          "pull": event.shiftKey,
          x: 0,
          y: -1,
        });
        break;
    }
  }, false);


  function moveWithMouse(event, pull = false) {
    var x = event.clientX;
    var y = event.clientY;
    var playerX = renderer._renderer.width / 2;
    var playerY = renderer._renderer.height / 2;
    var deltaX = x - playerX;
    var deltaY = y - playerY;
    var absDeltaX = Math.abs(deltaX);
    var absDeltaY = Math.abs(deltaY);
    var directionX = 0;
    var directionY = 0;
    if (absDeltaX > absDeltaY) {
      directionX = deltaX / absDeltaX;
    } else {
      directionY = deltaY / absDeltaY;
    }
    game.postMessage({
      "event": "move",
      "pull": pull,
      x: directionX,
      y: directionY,
    });
  }

  let pulling = false;
  document.body.addEventListener("touchmove", function click(event) {
    pulling = true;
  }, false);

  // On click move the player in the direction of the click
  document.body.addEventListener("touchend", function click(event) {
    console.debug(event);
    moveWithMouse(event.changedTouches[0], pulling);
    pulling = false;
  }, false);

  this.start = function() {
    game.postMessage({
      event: "start",
    });
  }



  const map = {};

  this.place = function({ x, y, type }) {
    if (!map[x]) {
      map[x] = {};
    }
    const piece = renderer.addChild(type, x, y);
    map[x][y] = piece;
  }

  this.move = function({ x, y, delta_x, delta_y }) {
    const piece = map[x][y];
    if (!piece) {
      console.error("piece not found", arguments);
      return;
    }
    piece._x += parseInt(delta_x);
    piece._y += parseInt(delta_y);
    // could be in an event?
    if (!map[piece._x]) {
      map[piece._x] = {};
    }
    map[piece._x][piece._y] = piece;
    map[x][y] = null;
  }

  this.die = function({ x, y }) {
    const piece = map[x][y];
    renderer._stage.removeChild(piece);
    delete map[x][y];
  }

  this.handleMessage = function(e) {
    //move render queue
    const func = this[e.data.event]
    if (!func) {
      console.error("unhandled message", e);
      return;
    }
    func(e.data);
  };

  function resizeCanvas() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.resize(width, height)
  }
  //@todo should move some of this over to the renderer objects so it's more flexible
  this.render = function() {

    var currentLength = queue.length;

    for (var i = 0; i < currentLength; i++) {
      this.handleMessage(queue.shift());
    }
    renderer.render();
    frameId = window.requestAnimationFrame(this.render.bind(this));
  }

  game.addEventListener("message", function(e) {
    queue.push(e);
  });

  window.addEventListener("resize", resizeCanvas, false);

  this.endGame = function(victory) {
    window.cancelAnimationFrame(frameId);
    self.player.dead = true;
    this.ongameend(victory);
  };
  this.render();
  resizeCanvas();
}
