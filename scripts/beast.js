
/**
 * The game of beastie
 * @param {String} board For the moment the id of the canvas (or other dom element) used to render the game
 * @param {JSON} level The json description of the level to be played
 */
var Game = function(board, level) {
  var self = this;
  this.ongameend = function(){};
  this.score = 0;

  var world = {};
  var map = {}; //location based store
  var queue = [];
  //could move this to a custom type later
  var renderQueue = [];

    var game = new Worker("scripts/worker/game.js");
    var player = new BL.DummyPlayer(game);

    var frameId;

    var renderer = new PixiRenderer(board);

    // var renderer = new PIXI.WebGLRenderer(canvas.width, canvas.height, {view: canvas});
    // renderer.view.className = "rendererView";


    var handleMessage = function(e) {

        //move render queue
        switch (e.data.event) {
            case "remove":
              world[e.data._id].die();
                // delete world[e.data._id];
                break;
            case "place":
                console.log('place');
                //only add it if we don't already have it
                if (!world[e.data._id]) {
                  e.data.entity.id = e.data._id;
                    world[e.data._id] = new BL.Display(e.data.entity, renderer, e.data.icon);
                    // console.log("position:", e.data.entity.position.x, e.data.entity.position.y);
                    if (e.data.entity.kind === "player") {
                        player.display = world[e.data._id];
                        BL.Viewport.x = world[e.data._id].position.x;
                        BL.Viewport.y = world[e.data._id].position.y;
                    }
                }
                break;
            case "completeMove":
                console.log(e.data.entity.kind);
                //TODO: some of this can be moved to worker
                world[e.data._id]._position = {
                    x: e.data.entity.position.x,
                    y: e.data.entity.position.y
                };

                break;
            case "die":
                if (e.data.entity.kind === "player") {
                    //let some things finish moving
                    setTimeout(function() {
                        self.endGame();
                    }, 250);
                } else {
                    this.score += e.data.worth;
                }

                world[e.data._id].die();
                // delete world[e.data._id];
                break;
            case "transition":
                world[e.data._id].transition(e.data.entity, e.data.icon);
                break;
        }

    };




    function resizeCanvas() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            renderer.resize(width, height)
                //update worker viewport:
            BL.Viewport.width = width;
            BL.Viewport.height = height;
            game.postMessage({
                event: "viewport",
                height: height,
                width: width
            });

        }
        //@todo should move some of this over to the renderer objects so it's more flexible
    function render() {
        // console.info("world", _.size(world));
        var currentLength = queue.length;
        // console.info("queue", currentLength);
        for (var i = 0; i < currentLength; i++) {
          handleMessage(queue.shift());
        }
        // @todo this should be moved, the only point of it is animation
        for (var entity in world) {
          world[entity].draw();
        }
        renderer.render();
        frameId = window.requestAnimationFrame(render);
    }

    game.addEventListener("message", function(e) {
        queue.push(e);
    });

    window.addEventListener("resize", resizeCanvas, false);

    this.endGame = function() {
        window.cancelAnimationFrame(frameId);
        player.dead = true;
        this.ongameend();
    };

    render();
    resizeCanvas();
}
