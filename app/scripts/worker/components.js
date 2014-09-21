// components.js

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
