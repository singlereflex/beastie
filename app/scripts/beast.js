var Game = function(board) {
  var self = this;
  this.ongameend = function(){};
  this.score = 0;

  var world = {};
  var map = {}; //location based store
  var queue = [];
  //could move this to a custom type later
  var renderQueue = [];

    /*
  Math.sqrt(
  (player.x-entity.position.x)
  *(player.x-entity.position.x)
  +(player.y-entity.position.y)
  *(player.y-entity.position.y)
)
*/

    var game = new Worker("scripts/worker/game.js");
    var player = new BL.DummyPlayer(game);
    var canvas = document.getElementById(board);
    // var context = canvas.getContext("2d");
    var frameId;

    var renderer = new PIXI.autoDetectRenderer(canvas.width, canvas.height, {
        view: canvas,
        transparent: true
    });
    // var renderer = new PIXI.WebGLRenderer(canvas.width, canvas.height, {view: canvas});
    // renderer.view.className = "rendererView";

    // create an new instance of a pixi stage
    var stage = new PIXI.Stage(0x000000);
    console.log(stage);
    var handleMessage = function(e) {

        //move render queue
        switch (e.data.event) {
            case "remove":
                stage.removeChild(world[e.data._id].dude);
                // delete world[e.data._id];
                break;
            case "place":
                console.log('place');
                //only add it if we don't already have it
                if (!world[e.data._id]) {
                    world[e.data._id] = new BL.Display(e.data.entity, e.data.icon);
                    stage.addChild(world[e.data._id].dude);
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
                stage.removeChild(world[e.data._id].dude);
                // delete world[e.data._id];
                break;
            case "transition":
                stage.removeChild(world[e.data._id].dude);
                world[e.data._id].render(e.data.entity, e.data.icon);
                stage.addChild(world[e.data._id].dude);
                break;
        }

        // console.log(arguments);


        // if(!(renderQueue.indexOf(world[e.data._id]) > -1))
        //   renderQueue.push(world[e.data._id]);

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
            try {
                handleMessage(queue.shift());
            } catch (e) {
                console.error(e);
            }
        }

        for (var entity in world) {
            try {
                world[entity].draw();
            } catch (e) {
                console.error(e);
                stage.removeChild(world[entity].dude);
                // delete world[entity];
            }
        }
        renderer.render(stage);
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
