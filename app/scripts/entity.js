function WorldComponent(entity) {
    entity.frame_count = 0;
    entity.running = false;
    function animloop() {
        entity.frame_count++;
        try {
            entity.trigger('frame', entity.frame_count);
        } catch (e) {
            // entity.pause()
        }
        if (entity.running) {
            requestAnimFrame(animloop);
        }
    }
    entity.start = function () {
        this.running = true;
        animloop();
    };
    entity.pause = function () {
        this.running = !this.running;
    };
    entity.stop = function () {
        this.running = false;
        this.frame_count = 0;
    };
    entity.toBeRendered = [];
    entity.on('frame', function render(frame_count) {
        for (var i = 0; i < entity.toBeRendered.length; i++) {
            this.toBeRendered[i].trigger('frame', frame_count);
        }
    });
}

function FrameComponent(entity) {
    entity.world.loop.toBeRendered.push(entity);
    // entity.loop_id = entity.world.loop.on('frame', entity.frame.bind(entity));//really need a remove thing..
    entity.on('die', function () {
        entity.world.loop.toBeRendered = _.without(entity.world.loop.toBeRendered, entity);
    });
}

function DomRenderer(entity) {
    if (entity.el !== undefined) {
        document.getElementById('entityboard').removeChild(entity.el);
    }
    var div = document.createElement('div');
    div.innerHTML = entity.template({entity: entity});
    entity.el = div;
    div.className = "entity " + entity.kind;
    div.style.left = entity.position.x + 'em';
    div.style.top = entity.position.y + 'em';
    entity.trigger('rendered', entity.el);
}

function ControllerComponent(entity) {
    //requires the MoveComponent
    document.body.addEventListener('keydown', function keydown(event) {
        if (!entity.dead) {
            switch (event.which) {
                //left
            case 37:
            case 65:
                event.preventDefault();
                // entity.move(-1, 0);
                break;
                //down
            case 40:
            case 83:
                event.preventDefault();
                // entity.move(0, 1);
                //right
                break;
            case 39:
            case 68:
                event.preventDefault();
                // entity.move(1, 0);
                break;
                //up
            case 38:
            case 87:
                event.preventDefault();
                // entity.move(0, -1);
                break;
            }
        }

    }, false);

    document.body.addEventListener('keyup', function keyUp(event) {
        console.log(event.which);
        if (!entity.dead) {
            var newX = 0, newY = 0;
            switch (event.which) {
                //left
            case 37:
            case 65:
                event.preventDefault();
                entity.move(-1, 0);
                break;
                //down
            case 40:
            case 83:
                event.preventDefault();
                entity.move(0, 1);
                //right
                break;
            case 39:
            case 68:
                event.preventDefault();
                entity.move(1, 0);
                break;
                //up
            case 38:
            case 87:
                event.preventDefault();
                entity.move(0, -1);
                break;
            case 32:
                event.preventDefault();
                center(entity.el);
                break;
            }
        }
    }, false);

    document.body.addEventListener('touchstart', function dblClick(event){
      if(!entity.dead){
        var touch = event.changedTouches[0];

        event.preventDefault();

        var x = 0, y = 0;
        var center = document.body.clientWidth/2;
        var rightCenter = {
          x: document.body.clientWidth - document.body.clientWidth/4,
          y: document.body.clientHeight/2
        }

        if(touch.clientX > center){
          if(Math.abs(rightCenter.x - touch.clientX) > Math.abs(rightCenter.y - touch.clientY)){
            if(0 < rightCenter.x - touch.clientX){
              x = -1
            } else if(0 > rightCenter.x - touch.clientX){
              x = 1;
            }

          } else {
            if(0 < rightCenter.y - touch.clientY){
              y = -1
            } else if(0 > rightCenter.y - touch.clientY){
              y = 1;
            }
          }
          entity.move(x, y);
        }
      }

      // event.x -
      // event.y -
    }, false)

    // Hammer(document).on("dragleft", function (e) {
    //     // e.preventDefault();
    //     // alert("hammer left");
    //     entity.move(-1, 0);
    // });
    // Hammer(document).on("dragup", function (e) {
    //     // e.preventDefault();
    //     // alert("hammer up");
    //     entity.move(0, -1);
    // });
    // Hammer(document).on("dragdown", function (e) {
    //     // e.preventDefault();
    //     // alert("hammer down");
    //     entity.move(0, 1);
    // });
    // Hammer(document).on("dragright", function (e) {
    //     // e.preventDefault();
    //     // alert("hammer right");
    //     entity.move(1, 0);
    // });
}

function CollisionComponent(entity) {
    entity.on('start_move', function (deltas) {
        var collided = entity.world.findEntityByPosition(entity.position.x + deltas.delta_x, entity.position.y + deltas.delta_y);

        if (collided.length > 0) {
            for(var i = 0; i < collided.length; i++){
                entity.trigger('collided', collided[i]);
            }
        }
    });
}

function ExploreComponent(entity) {
    entity.on('complete_move', function () {
        if (entity.world.world[entity.position.x + "/" + entity.position.y] === undefined) {
            entity.world.explore(entity.position.x - 8, entity.position.y - 8, 16);
        }
    });
}

function MoveComponent(entity) {
    entity.move = function (delta_x, delta_y) {
        entity.trigger('start_move', {delta_x: delta_x, delta_y: delta_y});
        if (entity.position.x + delta_x < 0 || entity.position.y + delta_y < 0) {
            throw "stay on the board please";
        }
        var old_position = {
          x: entity.position.x,
          y: entity.position.y
        };
        entity.position.x += delta_x;
        entity.position.y += delta_y;

        entity.trigger('complete_move', {delta_x: delta_x, delta_y: delta_y}, old_position);

    }
}

function PushComponent(entity) {
    //subscribe to move event
    entity.on('start_move', function (deltas) {
        var neighbor = entity.world.findEntityByPosition(entity.position.x + deltas.delta_x, entity.position.y + deltas.delta_y)[0];
        if (neighbor !== undefined && neighbor.kind === "block") {
            neighbor.move(deltas.delta_x, deltas.delta_y);
        }
    });
}

function PullComponent(entity) {

    entity.shiftDown = false;
    document.body.addEventListener('keydown', function keydown(event) {
        if (event.which == 16 && !entity.dead) {
            event.preventDefault();
            entity.shiftDown = true;
        }
    }, false);
    document.body.addEventListener('keyup', function keyup(event) {
        if (event.which == 16 && !entity.dead) {
            event.preventDefault();
            entity.shiftDown = false;
        }
    });

    document.body.addEventListener('touchstart', function dblClick(event){

      var center = document.body.clientWidth/2;

      if(event.touches.length > 1){
        event.preventDefault();
        entity.shiftDown = true;
      }


    }, false);
    document.body.addEventListener('touchend', function dblClick(event){

      var center = document.body.clientWidth/2;


      if(event.touches.length < 2){
        entity.shiftDown = false;
      }

    }, false)

    //subscribe to move event
    entity.on('complete_move', function (deltas) {

        var neighbor = entity.world.findEntityByPosition(entity.position.x - (deltas.delta_x * 2), entity.position.y - (deltas.delta_y * 2));
        if (entity.shiftDown) {
            neighbor[0].move(deltas.delta_x, deltas.delta_y);
        }
    });
}

function DeathComponent(entity) {
    entity.die = function () {
        entity.trigger('die');
    }
}

var Entity = function (schematic) {
    this._events = {};
    _.extend(this, schematic);
    this.schematic = schematic;
    if (schematic.events !== undefined) {
        for (var key in schematic.events) {
            if (schematic.events.hasOwnProperty(key)) this.on(key, schematic.events[key].bind(this));
        }
    }
    this.loadComponents(schematic.components);
    if (schematic.frame !== undefined) {
        //     this.world.gameLoop.on('frame', schematic.frame.bind(this));
        this.frame = schematic.frame.bind(this);
    }
};

Entity.prototype.loadComponents = function (components) {
    for (var i = 0; i < components.length; i++) {
        components[i](this);
    }
};

Entity.prototype.on = function (name, callback) {
    if (this._events[name] === undefined) {
        this._events[name] = {};
    }
    var event_id = name + _.size(this._events[name]);
    this._events[name][event_id] = callback;
    return event_id;
};

Entity.prototype.trigger = function () {
  //so that we can use array functions, arguments is not a true array
    var arguments = Array.prototype.slice.call(arguments);
    var name = arguments.shift();
    var callbacks = this._events[name];
    if (callbacks !== undefined) {
        for (var i in callbacks) {
            if (callbacks.hasOwnProperty(i)) callbacks[i].apply(this, arguments);//should use arguments instead of single argument
        }
    }
};

Entity.prototype.remove = function (event_name, event_id) {
    this._events[event_name][event_id] = null;
    delete this._events[event_name][event_id];
};

/**
 * @todo move this to a component
 */
Entity.prototype.transition = function (state_name) {
    this.state = state_name;

    // if(this.states[state_name].frame !== undefined){
    //     this.frame = this.states[state_name].frame.bind(this);
    // }
    if (this.states[state_name].events !== undefined) {
        for (var key in this.states[state_name].events) {
            if (this.states[state_name].events.hasOwnProperty(key)) {
                this._events[key] = {};
                if (this.states[state_name].events[key]) {
                    this.on(key, this.states[state_name].events[key].bind(this));
                }

            }
        }
    }
    _.extend(this, this.states[state_name]);//that should override the correct things
    if (this.states[state_name].components !== undefined) {
        this.loadComponents(this.states[state_name].components)
    }
    this.trigger('transition', state_name);
    this.trigger('transition:' + state_name, this);
};
