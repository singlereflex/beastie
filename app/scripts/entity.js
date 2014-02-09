
function WorldComponent(entity){
  entity.frame_count = 0;
  entity.running = false;
  function animloop(){
      entity.frame_count++;
      try{
        entity.trigger('frame', entity.frame_count);
      } catch(e) {
        console.log(e);
        console.log(e.stack);
        // entity.pause()
      }
      if(entity.running){
        requestAnimFrame(animloop);
      }
  };
  entity.start = function(){
    this.running = true;
    animloop();
  }

  entity.pause = function(){
    this.running = !this.running;
  }

  entity.stop = function(){
    this.running = false;
    this.frame_count = 0;
  }
  entity.toBeRendered = [];
  entity.on('frame', function render(frame_count){
    // console.log(entity.toBeRendered.length);
    for(var i = 0; i < entity.toBeRendered.length; i++){
      this.toBeRendered[i].trigger('frame', frame_count);
    }
    
  });
  
}

function FrameComponent(entity){
  entity.world.loop.toBeRendered.push(entity);
  // entity.loop_id = entity.world.loop.on('frame', entity.frame.bind(entity));//really need a remove thing..
  entity.on('die', function(){
    entity.world.loop.toBeRendered = _.without(entity.world.loop.toBeRendered , entity);
  });
}

function DomRenderer(entity){
  if(entity.el !== undefined){
    document.getElementById('entityboard').removeChild(entity.el);
  }
  var div = document.createElement('div');
  div.innerHTML = entity.template({entity: entity});
  entity.el = div;
  div.className = "entity "+entity.kind;
  div.style.left = entity.position.x+'em';
  div.style.top = entity.position.y+'em';
  // console.log(entity.el);
  entity.trigger('rendered', entity.el);
}

function ControllerComponent(entity){
    //requires the MoveComponent
    document.body.addEventListener('keydown', function keydown(event){
      if(!entity.dead){
        switch(event.which){
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
    document.body.addEventListener('keyup', function keyup(event){
      if(!entity.dead){
        var newX = 0, newY = 0;
        switch(event.which){
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
        }
      }
    }, false);

    Hammer(document).on("dragleft", function(e) {
      // e.preventDefault();
      // alert("hammer left");
      entity.move(-1, 0);
    });
    Hammer(document).on("dragup", function(e) {
      // e.preventDefault();
      // alert("hammer up");
      entity.move(0, -1);
    });
    Hammer(document).on("dragdown", function(e) {
      // e.preventDefault();
      // alert("hammer down");
      entity.move(0, 1);
    });
    Hammer(document).on("dragright", function(e) {
      // e.preventDefault();
      // alert("hammer right");
      entity.move(1, 0);
    });
}

function CollisionComponent(entity){
    entity.on('start_move', function(deltas){
        var collided = entity.world.findEntityByPosition(entity.position.x+deltas.delta_x, entity.position.y+deltas.delta_y);
        if(collided !== undefined){
            entity.trigger('collided', collided);
        }
    });
}

function ExploreComponent(entity){
  entity.on('complete_move', function(deltas){
    if(entity.world.world[entity.position.x+"/"+entity.position.y] === undefined){
        entity.world.explore(entity.position.x-8, entity.position.y-8, 16);
    }
  });
}

function MoveComponent(entity) {
    entity.move = function(delta_x,delta_y){
        entity.trigger('start_move', {delta_x:delta_x, delta_y:delta_y})
        if(entity.position.x + delta_x < 0 ||entity.position.y + delta_y < 0){
          throw "stay on the board please";
        }

        entity.position.x += delta_x;
        entity.position.y += delta_y;
        
        entity.trigger('complete_move', {delta_x:delta_x, delta_y:delta_y});
       
    }
}

function PushComponent(entity){
    //subscribe to move event
    entity.on('start_move', function(deltas) {
      console.log("test");
        var neighbor = entity.world.findEntityByPosition(entity.position.x+deltas.delta_x, entity.position.y+deltas.delta_y);
        console.log(neighbor);
        if(neighbor !== undefined && neighbor.kind === "block" ){
            neighbor.move(deltas.delta_x, deltas.delta_y);
        }
    });
}

function PullComponent(entity){

  entity.shiftDown = false;
  document.body.addEventListener('keydown', function keydown(event){
    if(event.which == 16 && !entity.dead){
      console.log("test shift");
      event.preventDefault();
      entity.shiftDown = true;
    }
  }, false);
  document.body.addEventListener('keyup', function keyup(event){
    if(event.which == 16 && !entity.dead){
      event.preventDefault();
      entity.shiftDown = false;
    }
  });
  //subscribe to move event
  entity.on('complete_move', function(deltas) {

    var neighbor = entity.world.findEntityByPosition(entity.position.x-(deltas.delta_x*2), entity.position.y-(deltas.delta_y*2));
    if(entity.shiftDown){
      console.log(deltas);
      neighbor.move(deltas.delta_x, deltas.delta_y);
    }
  });
}

function DeathComponent(entity){
    entity.die = function(){
        entity.trigger('die');
    }
}

var Entity = function(schematic){
    this._events = {};
    _.extend(this, schematic);
    this.schematic = schematic;
    if(schematic.events !== undefined){
        for(var key in schematic.events){
            this.on(key, schematic.events[key].bind(this));
        }
    }
    this.loadComponents(schematic.components);
    if(schematic.frame !== undefined){
    //     this.world.gameLoop.on('frame', schematic.frame.bind(this));
      this.frame = schematic.frame.bind(this);
    }
}

Entity.prototype.loadComponents = function(components) {
  for (var i = 0; i < components.length; i++) {
    components[i](this);
  };
};

Entity.prototype.on = function(name, callback) {
    if(this._events[name] === undefined){
        this._events[name] = {};
    }
    var event_id = name + _.size(this._events[name]);
    this._events[name][event_id] = callback;
    return event_id;
};

Entity.prototype.trigger = function() {

    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    // console.log(name);
    var callbacks = this._events[name];
    // console.log(callbacks);
    // console.log(name);
    // console.log(name, callbacks);
    if(callbacks !== undefined){
      // console.log(callbacks);
        for (var i in callbacks) {
          // console.log(i);
            callbacks[i].apply(this, args);//should use arguments instead of single argument
        };
    }
};

Entity.prototype.remove = function(event_name, event_id) {
  this._events[event_name][event_id] = null;
  delete this._events[event_name][event_id];
};

/**
 * @todo move this to a component
 */
Entity.prototype.transition = function(state_name) {
  this.state = state_name;

  // if(this.states[state_name].frame !== undefined){
  //     this.frame = this.states[state_name].frame.bind(this);
  // }
  if(this.states[state_name].events !== undefined){
    for(var key in this.states[state_name].events){
        this._events[key] = {};
        if(this.states[state_name].events[key]){
          this.on(key, this.states[state_name].events[key].bind(this));
        }
    }
  }
  // console.log(this._events);
  _.extend(this, this.states[state_name]);//that should override the correct things
  if(this.states[state_name].components !== undefined){
    this.loadComponents(this.states[state_name].components)
  }
  this.trigger('transition', state_name);
  this.trigger('transition:'+state_name, this);
};