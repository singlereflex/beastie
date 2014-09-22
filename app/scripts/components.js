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


    entity.move = function(delta_x, delta_y, entity){
      entity.el.style.top = entity.position.y + 'em'; //e.data.entity.position.y + 'em';
      entity.el.style.left = entity.position.x + 'em';
      if(e.data.entity.kind == "player"){
        $("html,body").animate({
          scrollTop: document.body.scrollTop + delta_y * 16,//e.data.deltas.delta_y * 16,
          scrollLeft: document.body.scrollLeft + delta_x * 16
        }, 200);
      }
    }

    entity.die = function(){
      document.getElementById('entityboard').removeChild(entity.el);
    }
    entity.el = document.getElementById('entityboard').appendChild(entity.el);
    if(entity.kind == 'player'){
      center(entity.el);
    }
    entity.trigger('rendered', entity);
}

function CanvasRenderer(entity){
  var square = 24;
  //rendering position needs to be offset but current player position (or canvas viewport if you want to think about it that way);
  entity.draw = function(context){//figure out the animated move part later
    // console.log(((context.canvas.width/2)/square));
    context.drawImage(sprites[entity.icon], (entity.position.x  - (viewport.x-((context.canvas.width/2)/square)))*square, (entity.position.y - (viewport.y-((context.canvas.height/2)/square)))*square, square, square);
    // if(!entity.sprite || entity.sprite.src != entity.icon){
    //   entity.sprite = new Image();
    //   entity.sprite.onload = function() {
    //       context.drawImage(entity.sprite, (entity.position.x - viewport.x)*square, (entity.position.y - viewport.y)*square, square, square);
    //   }
    //   entity.sprite.src = entity.icon;
    // } else {
    //   context.drawImage(entity.sprite, (entity.position.x - viewport.x)*square, (entity.position.y - viewport.y)*square, square, square);
    // }

  }
  entity.move = function(delta_x, delta_y, entity){
    if(entity.kind == "player"){
      viewport.x += delta_x;
      viewport.y += delta_y;
    }
  }
  entity.die = function(){
    //remove from draw loop somehow
  }
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
                center(entity.display.el);
                break;
            }
        }
    }, false);

}

function PullControllerComponent(entity){
  //move all this to the controller components
  entity.pulling(false);
  document.body.addEventListener('keydown', function keydown(event) {
      if (event.which == 16 && !entity.dead) {
          event.preventDefault();
          entity.pulling(true);
      }
  }, false);
  document.body.addEventListener('keyup', function keyup(event) {
      if (event.which == 16 && !entity.dead) {
          event.preventDefault();
          entity.pulling(false);
      }
  });
}
