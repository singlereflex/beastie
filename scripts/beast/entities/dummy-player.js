/**
 * A main thread component to allow interaction between
 * a controlled player and the worker manageing the game state.
 * @param {worker} game The worker to post messages to.
 */
BL.entities.DummyPlayer = function (game) {
    this.move = function (deltaX, deltaY) {
        game.postMessage({
            event: "move",
            deltaX: deltaX,
            deltaY: deltaY
        });
    };

    this.pulling = function (yes) {
        game.postMessage({
            event: "pulling",
            isPulling: yes
        });
    };

    MoveControllerComponent(this);
    BL.PullControllerComponent(this);
};
