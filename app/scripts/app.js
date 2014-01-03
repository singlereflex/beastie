'use strict';


function ControllerComponent(entity){
    //requires the MoveComponent
    document.body.addEventListener('keydown', function keydown(event){
        event.preventDefault();
    }, false);
    document.body.addEventListener('keyup', function keyup(event){
        event.preventDefault();
        var newX = 0, newY = 0;
        switch(event.which){
            //left
            case 37:
            case 65:
                entity.move(-1, 0);
            break;
            //down
            case 40:
            case 83:
                entity.move(0, 1);
            //right
            break;
            case 39:
            case 68:
                entity.move(1, 0);
            break;
            //up
            case 38:
            case 87:
                entity.move(0, -1);
            break;   
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
        // try {
        entity.trigger('start_move', {delta_x:delta_x, delta_y:delta_y})
        if(entity.position.x + delta_x < 0 ||entity.position.y + delta_y < 0){
          throw "stay on the board please";
        }
        // console.log(neighbor);
        entity.position.x += delta_x;
        entity.position.y += delta_y;
        // var neighbor = entity.world.findEntityByPosition(entity.position.x+delta_x, entity.position.y+delta_y);
        // if(neighbor !== undefined && neighbor.classVal !== "icon-environment-block"){
            
        // } else {
        //     throw "failed to move, their's a blog in the way!!";
        // }
        entity.trigger('complete_move', {delta_x:delta_x, delta_y:delta_y});
        // } catch(e){
        //     // throw e;
        //     console.log(e);
        //     entity.trigger('fail_move', {error: e});
        // }
        
        
    }
}

function PushComponent(entity){
    //subscribe to move event
    entity.on('start_move', function(deltas) {
        // var nextY = 2*deltas.delta_y;
        // var nextX = 2*deltas.delta_x;
        var neighbor = entity.world.findEntityByPosition(entity.position.x+deltas.delta_x, entity.position.y+deltas.delta_y);
        if(neighbor !== undefined && neighbor.kind === "block" ){
            console.log("move neighbor");
            neighbor.move(deltas.delta_x, deltas.delta_y);
        // if($scope.entities[entity.position.y+deltas.delta_y][entity.position.x+deltas.delta_x].kind === "block" && $scope.entities[entity.position.y+nextY][entity.position.x+nextX].classVal !== "icon-environment-block"){
        //     $scope.entities[entity.position.y+deltas.delta_y][entity.position.x+deltas.delta_x].classVal = "icon-environment-empty"
        //     $scope.entities[entity.position.y+nextY][entity.position.x+nextX].classVal = "icon-environment-block"
        // }
        }
    });
}

function PullComponent(entity){

  entity.shiftDown = false;
  document.body.addEventListener('keydown', function keydown(event){
      event.preventDefault();
      if(event.which == 16){
        entity.shiftDown = true;
      }
  }, false);
  document.body.addEventListener('keyup', function keyup(event){
      event.preventDefault();
      if(event.which == 16){
        entity.shiftDown = false;
      }
  });
  //subscribe to move event
    entity.on('complete_move', function(deltas) {
        console.log('pull');
        // var nextY = 2*deltas.delta_y;
        // var nextX = 2*deltas.delta_x;
        var neighbor = entity.world.findEntityByPosition(entity.position.x-(deltas.delta_x*2), entity.position.y-(deltas.delta_y*2));
        if(neighbor !== undefined && neighbor.kind === "block" && entity.shiftDown){
            console.log("move neighbor");
            neighbor.move(deltas.delta_x, deltas.delta_y);
        // if($scope.entities[entity.position.y+deltas.delta_y][entity.position.x+deltas.delta_x].kind === "block" && $scope.entities[entity.position.y+nextY][entity.position.x+nextX].classVal !== "icon-environment-block"){
        //     $scope.entities[entity.position.y+deltas.delta_y][entity.position.x+deltas.delta_x].classVal = "icon-environment-empty"
        //     $scope.entities[entity.position.y+nextY][entity.position.x+nextX].classVal = "icon-environment-block"
        // }
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
    for (var i = schematic.components.length - 1; i >= 0; i--) {
        schematic.components[i](this);
    };

    if(schematic.frame !== undefined){
    //     this.world.gameLoop.on('frame', schematic.frame.bind(this));
      this.frame = schematic.frame.bind(this);
    }
    if(schematic.events !== undefined){
        for(var key in schematic.events){
            this.on(key, schematic.events[key].bind(this));
        }
    }
}

Entity.prototype.on = function(name, callback) {
    if(this._events[name] === undefined){
        this._events[name] = [];
    }
    this._events[name].push(callback);
};

Entity.prototype.trigger = function(name, stuff) {
    var callbacks = this._events[name];
    // console.log(name);
    if(callbacks !== undefined){
        for (var i = callbacks.length - 1; i >= 0; i--) {
            callbacks[i](stuff);//should use arguments instead of single argument
        };
    }
};

Entity.prototype.remove = function(event_name, cb) {
  this._events[event_name] = _.without(this._events[event_name], cb);
  // console.log(_.without(this._events[event_name], cb));
  // console.log(event_name, this._events[event_name]);
  return cb;
};

Entity.prototype.transition = function(state_name) {
  this.state = state_name;

  if(this.states[state_name].frame !== undefined){
      // this.world.gameLoop.remove('frame', this.frame);
      // this.world.gameLoop.on('frame', this.states[state_name].frame.bind(this));
      this.frame = this.states[state_name].frame.bind(this);
  }
  if(this.states[state_name].events !== undefined){
    this._events = {};
    for(var key in this.states[state_name].events){
        this.on(key, this.states[state_name].events[key].bind(this));
    }
  }
  if(this.states[state_name].components !== undefined){
    for (var i = this.states[state_name].components.length - 1; i >= 0; i--) {
        this.states[state_name].components[i](this);
        // console.log(this.states[state_name].components);
    };
  }
  // console.log(this._events);
  _.extend(this, this.states[state_name]);//that should override the correct things
  this.trigger('transition', state_name);
};

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

angular.module('beastieApp', [])
  // .config(function ($routeProvider) {
  //   $routeProvider
  //     .when('/', {
  //       templateUrl: 'views/main.html',
  //       controller: 'MainCtrl'
  //     })
  //     .otherwise({
  //       redirectTo: '/'
  //     });
  // });
