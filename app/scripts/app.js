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
}

function CollisionComponent(entity){
    entity.on('start_move', function(deltas){
        var collided = entity.world.findEntityByPosition(entity.position.x+deltas.delta_x, entity.position.y+deltas.delta_y);
        if(collided !== undefined){
            entity.trigger('collided', collided);
        }
    });

    entity.on('collided', function(collided){
        if(collided.kind === "block"){
            throw "hit a block";
        }
    })
}

function MoveComponent(entity) {
    entity.move = function(delta_x,delta_y){
        // try {
        entity.trigger('start_move', {delta_x:delta_x, delta_y:delta_y})
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
    entity.on('start_move', function(deltas) {
        // var nextY = 2*deltas.delta_y;
        // var nextX = 2*deltas.delta_x;
        var neighbor = entity.world.findEntityByPosition(entity.position.x-deltas.delta_x, entity.position.y-deltas.delta_y);
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
    for (var i = schematic.components.length - 1; i >= 0; i--) {
        schematic.components[i](this);
    };
    if(schematic.frame !== undefined){
        this.world.gameLoop.on('frame', schematic.frame.bind(this));
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
    if(callbacks !== undefined){
        for (var i = callbacks.length - 1; i >= 0; i--) {
            callbacks[i](stuff);
        };
    }
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
