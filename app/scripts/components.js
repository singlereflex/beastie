// components.js


// function FrameComponent(entity) {
//     entity.world.loop.toBeRendered.push(entity);
//     // entity.loop_id = entity.world.loop.on('frame', entity.frame.bind(entity));//really need a remove thing..
//     entity.on('die', function () {
//         entity.world.loop.toBeRendered = _.without(entity.world.loop.toBeRendered, entity);
//     });
// }

function DomRenderer(entity, innerHTML) {
    if (entity.el !== undefined) {
        document.getElementById('entityboard').removeChild(entity.el);
    }
    var div = document.createElement('div');
    div.innerHTML = innerHTML;
    div.className = "entity " + entity.kind;
    div.style.left = entity.position.x + 'em';
    div.style.top = entity.position.y + 'em';
    entity.el = div;
    entity.trigger('rendered', entity);
}

function MoveControllerComponent(entity) {
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
        // console.log(event.which);
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
}

function PullControllerComponent(entity){
  //move all this to the controller components
  entity.pulling = false;
  document.body.addEventListener('keydown', function keydown(event) {
      if (event.which == 16 && !entity.dead) {
          event.preventDefault();
          entity.pulling = true;
      }
  }, false);
  document.body.addEventListener('keyup', function keyup(event) {
      if (event.which == 16 && !entity.dead) {
          event.preventDefault();
          entity.pulling = false;
      }
  });

  document.body.addEventListener('touchstart', function dblClick(event){

    var center = document.body.clientWidth/2;

    if(event.touches.length > 1){
      event.preventDefault();
      entity.pulling = true;
    }


  }, false);
  document.body.addEventListener('touchend', function dblClick(event){

    var center = document.body.clientWidth/2;


    if(event.touches.length < 2){
      entity.pulling = false;
    }

  }, false)
}

function CollisionComponent(entity) {
    entity.on('start_move', function (delta_x, delta_y) {
        var collided = entity.world.findEntityByPosition(entity.position.x + delta_x, entity.position.y + delta_y);

        if (collided.length > 0) {
            for(var i = 0; i < collided.length; i++){
                entity.trigger('collided', collided[i]);
            }
        }
    });
}

function ExploreComponent(entity) {
    entity.on('complete_move', function () {
        if (entity.world[entity.position.x + "/" + entity.position.y] === undefined) {
            entity.world.explore(entity.position.x - 8, entity.position.y - 8, 16);
        }
    });
}

function MoveComponent(Entity) {

    var move = function (delta_x, delta_y) {
        this.trigger('start_move', delta_x, delta_y);
        //move this to an event?
        if (this.position.x + delta_x < 0 || this.position.y + delta_y < 0) {
            throw "stay on the board please";
        }

        var old_position = {
          x: this.position.x,
          y: this.position.y
        };
        this.position.x += delta_x;
        this.position.y += delta_y;

        this.trigger('complete_move', delta_x, delta_y, old_position);
    }
    if(Entity instanceof Function){
      Entity.prototype.move = move;

    } else {
      Entity.move = move;
    }
}

function PushComponent(entity) {
    //subscribe to move event
    entity.on('start_move', function (delta_x, delta_y) {
        var neighbor = entity.world.findEntityByPosition(entity.position.x + delta_x, entity.position.y + delta_y)[0];
        if (neighbor !== undefined && neighbor.kind === "block") {
            neighbor.move(delta_x, delta_y);
        }
    });
}

function PullComponent(entity) {
    //subscribe to move event
    entity.on('complete_move', function (delta_x, delta_y) {
        var neighbor = entity.world.findEntityByPosition(entity.position.x - (delta_x * 2), entity.position.y - (delta_y * 2));
        if (entity.pulling) {
            neighbor[0].move(delta_x, delta_y);
        }
    });
}

function DeathComponent(Entity) {
    Entity.prototype.die = function (){
        this.trigger('die');
    }
}

function StateComponent(entity, states){
  entity.states = states;

  entity.transition = function(state_name){
    //this?
    entity.states[state_name].apply(entity);
  }
}

function EventComponent(Entity){
  Entity.prototype.on = function (name, callback) {
      if (this._events[name] === undefined) {
          this._events[name] = [];
      }

      this._events[name].push(callback);
      return this._events[name].length-1;
  };

  Entity.prototype.trigger = function () {
    //so that we can use array functions, arguments is not a true array
      var arguments = Array.prototype.slice.call(arguments);
      var name = arguments.shift();
      var callbacks = this._events[name];
      if (callbacks !== undefined) {
        for (var i = 0; i < callbacks.length; i++) {
          if(callbacks[i]){
            callbacks[i].apply(this, arguments);
          }
        }
      }
  };

  Entity.prototype.remove = function (event_name, event_id) {
    // console.log("removing", arguments);
    // console.log(this._events[event_name].length);
    this._events[event_name][event_id] = null;
    // console.log(this._events[event_name].length);
  };

  Entity.prototype.removeAll = function(event_name){
    if(this._events === undefined){
      this._events = {};
    }
    delete this._events[event_name];
  }
}
