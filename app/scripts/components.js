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
