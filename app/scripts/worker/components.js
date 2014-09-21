// components.js


// function FrameComponent(entity) {
//     entity.world.loop.toBeRendered.push(entity);
//     // entity.loop_id = entity.world.loop.on('frame', entity.frame.bind(entity));//really need a remove thing..
//     entity.on('die', function () {
//         entity.world.loop.toBeRendered = _.without(entity.world.loop.toBeRendered, entity);
//     });
// }

/*



*/
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
    entity.trigger('transition');
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
