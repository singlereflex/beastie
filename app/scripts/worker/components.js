"use strict";

BL.CollisionComponent = function (entity) {
    entity.on("startMove", function (deltaX, deltaY) {
        var collided = entity.world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY);

        if (collided.length > 0) {
            for(var i = 0; i < collided.length; i++){
                entity.trigger("collided", collided[i]);
            }
        }
    });
};

BL.ExploreComponent = function (entity) {
    entity.on("completeMove", function () {
        if (entity.world[entity.position.x + "/" + entity.position.y] === undefined) {
            entity.world.explore(entity.position.x - 8, entity.position.y - 8, 16);
        }
    });
};

BL.MoveComponent = function (Entity) {

    var move = function (deltaX, deltaY) {
        this.trigger("startMove", deltaX, deltaY);

        //move this to an event?
        if (this.position.x + deltaX < 0 || this.position.y + deltaY < 0) {
            throw "stay on the board please";
        }

        var oldPosition = {
          x: this.position.x,
          y: this.position.y
        };

        this.position.x += deltaX;
        this.position.y += deltaY;

        this.trigger("completeMove", deltaX, deltaY, oldPosition);
    };
    if(Entity instanceof Function){
      Entity.prototype.move = move;

    } else {
      Entity.move = move;
    }
};

BL.PushComponent = function (entity) {
    //subscribe to move event
    entity.on("startMove", function (deltaX, deltaY) {
        var neighbor = entity.world.findEntityByPosition(entity.position.x + deltaX, entity.position.y + deltaY)[0];
        if (neighbor !== undefined && neighbor.kind === "block") {
            neighbor.move(deltaX, deltaY);
        }
    });
};

BL.PullComponent = function (entity) {
    //subscribe to move event
    entity.on("completeMove", function (deltaX, deltaY) {
        var neighbor = entity.world.findEntityByPosition(entity.position.x - (deltaX * 2), entity.position.y - (deltaY * 2));
        if (entity.pulling && neighbor[0] !== undefined) {
            neighbor[0].move(deltaX, deltaY);
        }
    });
};

BL.DeathComponent = function (Entity) {
    Entity.prototype.die = function (){
        this.trigger("die");
    };
};

BL.StateComponent = function (entity, states){
  entity.states = states;

  entity.transition = function(stateName){
    entity.states[stateName].apply(entity);
    entity.trigger("transition");
  };
};
