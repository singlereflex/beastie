/**
 * A component to hook up user input to the entity
 * @param {entity} entity The game entity.
 */
var MoveControllerComponent = function (entity) {
    //requires the BL.MoveComponent

    document.body.addEventListener("keyup", function keyUp(event) {
        if (!entity.dead) {
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
                    BL.Center(entity.display.el);
                    break;
            }
        }
    }, false);



};
