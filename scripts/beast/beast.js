/**
 * The game of beastie
 * @param {String} board For the moment the id of the canvas (or other dom element) used to render the game
 * @param {JSON} level The json description of the level to be played
 */
var Game = function(board, level, edit) {
    var self = this;

    EventComponent(this);

    var world = {
        entities:{}
    };

    var map = {}; //location based store

    var queue = [];
    //could move this to a custom type later
    var renderQueue = [];

    var game = new Worker("scripts/beast/worker/game.js");

    // var player = new BL.entities.DummyPlayer(game);

    var frameId;

    //could set this in a seperate private function
    var renderer = new PixiRenderer(board, edit);

    renderer.on('click', function(event) {
        self.trigger('click', event);
    });

    this.ongameend = function() {};

    this.score = 0;

    this.place = function(type, x, y) {
        game.postMessage({
            event: 'place',
            kind: type,
            x:x,
            y:y
        });
    }

    this.validate = function() {
        game.postMessage({
            event: 'validate'
        });
    }

    this.start = function() {
        game.postMessage({
            event: 'start'
        })
    }

    this.stop = function() {
        game.postMessage({
            event: 'stop'
        })
    }

    this.pause = function() {
        game.postMessage({
            event: 'pause'
        })
    }

    this.import = function(level) {
        for (var i = 0; i < level.length; i++) {
            console.debug(level[i])
            this.place(
                level[i].type,
                level[i].x,
                level[i].y
            )
        }
    }

    this.export = function() {
        console.debug(world);
        var result = [];
        for (var entity in world.entities) {
            result.push({
                type: world.entities[entity].kind,
                x: world.entities[entity].position.x,
                y: world.entities[entity].position.y
            });
        }
        console.debug(result);
        return result;
    }

    // var renderer = new PIXI.WebGLRenderer(canvas.width, canvas.height, {view: canvas});
    // renderer.view.className = "rendererView";

    //FIXME have to send message as well
    var handleMessage = function(e) {
        console.debug(e);
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
                        if (!self.player) {
                            self.player = new BL.entities.DummyPlayer(game);
                        }
                        self.player.display = world.entities[e.data._id];
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

        self.trigger(e.data.event, e.data)

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
        self.player.dead = true;
        this.ongameend();
    };

    render();
    resizeCanvas();
}
