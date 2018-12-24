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
            self.entities[loc] = {};
        }

	console.debug("placing", entity.kind)
        if (entity._id === undefined) {
            entity._id = entity.kind+":"+entity.position.x+","+entity.position.y
            console.debug("setting", entity.kind, "id to", entity._id)
        }
        self.entities[loc][entity._id] = entity;

        if (!silent) {
            self.trigger("place", entity);
        }
        entity.trigger("place");
    };

    this.findEntityByPosition = function (x, y) {
        return this.entities[x + "," + y] || {}
    };

    this.animloop = function () {
        // try {
        for (var loc in self.entities) {
            if (self.entities[loc] instanceof Function) {
	       continue;
	    }
	    for (let entity in self.entities[loc]) {
                try {
		    self.entities[loc][entity].tick()
		} catch {}
	    }
	}

        self.trigger("tick");

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
    }
};
