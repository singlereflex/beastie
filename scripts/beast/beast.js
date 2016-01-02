

/**
 * The game of beastie
 * @param {String} board For the moment the id of the canvas (or other dom element) used to render the game
 * @param {JSON} level The json description of the level to be played
 */
var Game = function(board, level, edit) {
    var self = this;
    this.ongameend = function() {};
    this.score = 0;

    var world = {
        entities:{}
    };
    var map = {}; //location based store
    var queue = [];
    //could move this to a custom type later
    var renderQueue = [];

    var game = new Worker("scripts/beast/worker/game.js");

    console.debug(game);

    var player = new BL.entities.DummyPlayer(game);

    var frameId;

    var renderer = new PixiRenderer(board, edit);
    //should extend game for a editable whatever

    console.debug(renderer);

    // var renderer = new PIXI.WebGLRenderer(canvas.width, canvas.height, {view: canvas});
    // renderer.view.className = "rendererView";

    //FIXME have to send message as well
    var handleMessage = function(e) {

        //move render queue
        switch (e.data.event) {
            case "remove":
                world.entities[e.data._id].die();
                // delete world.entities[e.data._id];
                break;
            case "place":
                console.log('place');
                //only add it if we don't already have it
                if (!world.entities[e.data._id]) {
                    e.data.entity.id = e.data._id;
                    world.entities[e.data._id] = new BL.entities.Display(e.data.entity, renderer, e.data.icon);
                    // console.log("position:", e.data.entity.position.x, e.data.entity.position.y);
                    if (e.data.entity.kind === "player") {
                        player.display = world.entities[e.data._id];
                        //FIXME shouldn't be global
                        BL.Viewport.x = world.entities[e.data._id].position.x;
                        BL.Viewport.y = world.entities[e.data._id].position.y;
                    }
                }
                break;
            case "completeMove":
                console.log(e.data.entity.kind);
                //TODO: some of this can be moved to worker
                world.entities[e.data._id]._position = {
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

                world.entities[e.data._id].die();
                // delete world.entities[e.data._id];
                break;
            case "transition":
                world.entities[e.data._id].transition(e.data.entity, e.data.icon);
                break;
        }

    };

    world.explore = function (x, y, size) {
        var noise = new Noise(Math.random());

        for (var i = x; i < x + size; i++) {
            for (var e = y; e < y + size; e++) {
                if (world.entities[i + "," + e] === undefined) {
                    if (noise.simplex2(i, e / 10) > 0.5 || noise.simplex2(i / 10, e) > 0.5) {
                        game.postMessage({
                            event: 'place',
                            kind: 'Block',
                            x:i,
                            y:e
                        });
                        // world.entities.place(new BL.actors.Block(i, e, world));
                    } else if (noise.simplex2(i / 8, e / 8) > 0.5) {
                        game.postMessage({
                            event: 'place',
                            kind: 'Egg',
                            x:i,
                            y:e
                        });
                        // world.entities.place(new BL.actors.Egg(i, e, world));
                    } else {
                        // world.entities[i + "," + e] = [];
                    }
                }
            }
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
        for (var entity in world.entities) {
            // console.debug(entity);
            world.entities[entity].draw();
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
    world.explore(1024-8,1024-8, 16);
}
