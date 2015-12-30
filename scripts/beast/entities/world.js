/**
 * BeastLand World Constructor
 * @constructor
 */
BL.entities.Level = function () {

    EventComponent(this);

    var self = this;
    this.running = false;
    this.score = 0;
    this.entities = {};
    this.entities.place = function (entity, silent) {
        var loc = entity.position.x + "," + entity.position.y;
        if (!self.entities[loc]) {
            self.entities[loc] = [];
        }

        self.entities[loc].push(entity);
        if (entity._id === undefined) {
            entity._id = _.uniqueId("mob_");
        }
        if (!silent) {
            self.trigger("place", entity);
        }
    };

    this.findEntityByPosition = function (x, y) {
        return this.entities[x + "," + y] || [];
    };

    this.animloop = function () {
        // try {
        self.trigger("tick");

        // } catch (e) {
        // console.log(e);
        // self.pause();
        // }
        if (self.running) {
            setTimeout(self.animloop, 250);
        }
    };

    this.start = function () {
        this.running = true;
        self.animloop();
    };

    this.pause = function () {
        this.running = !this.running;
    };

    this.stop = function () {
        this.running = false;
    };

};
