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
