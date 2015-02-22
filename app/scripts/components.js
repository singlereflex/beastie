"use strict";

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

window.BL = {};

/**
 * Center the web page on the element,
 * only used if DomRenderer is being used
 * @param {DomNode} el The entities associated dom node
 */
BL.Center = function (el) {
    $("html, body").animate({
        scrollTop: $(el).offset().top - (( $(window).height() - $(this).outerHeight(true) ) / 2),
        scrollLeft: $(el).offset().left - (( $(window).width() - $(this).outerWidth(true) ) / 2)
    }, 200);
};

/**
 * A component to hook up user input to the entity
 * @param {entity} entity The game entity.
 */
BL.MoveControllerComponent = function (entity) {
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


    document.body.addEventListener("touchend", function dblClick(event) {
        if (!entity.dead) {
            var touch = event.changedTouches[0];

            event.preventDefault();

            var x = 0, y = 0;
            var center = {
                x: document.body.clientWidth / 2,
                y: document.body.clientHeight / 2
            };

            if (Math.abs(center.x - touch.clientX) > Math.abs(center.y - touch.clientY)) {
                if (0 < center.x - touch.clientX) {
                    x = -1;
                } else if (0 > center.x - touch.clientX) {
                    x = 1;
                }

            } else {
                if (0 < center.y - touch.clientY) {
                    y = -1;
                } else if (0 > center.y - touch.clientY) {
                    y = 1;
                }
            }
            entity.move(x, y);
        }
        entity.pulling(false);
    }, false);
};

/**
 * A component to attach user input to a pull action on the entity
 * @param {entity} entity The game entity.
 */
BL.PullControllerComponent = function (entity) {
    //move all this to the controller components
    entity.pulling(false);
    document.body.addEventListener("keydown", function keydown(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.pulling(true);
        }
    }, false);
    document.body.addEventListener("keyup", function keyup(event) {
        if (event.which === 16 && !entity.dead) {
            event.preventDefault();
            entity.pulling(false);
        }
    });
    document.body.addEventListener("touchmove", function (/*event*/) {
        entity.pulling(true);
    });
};
