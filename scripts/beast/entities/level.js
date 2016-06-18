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

        //trial run
        var newTile = self.entities[loc].slice()
        newTile.push(entity)
        self.validateTile(newTile);

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


    // Note that this is game specific.. hmm
    this.validate = function() {
        for (var loc in this.entities) {
            // should separate this
            if (loc !== 'place') {
                if (this.entities.hasOwnProperty(loc)) {
                    var tile = this.entities[loc]
                    this.validateTile(tile);
                }
            }
        }
        return true;
    }

    this.validateTile = function(tile) {
        var valid = tile.length < 3;
        valid &= tile[0] instanceof Floor
        if (tile.length > 1) {
            valid &= !(tile[1] instanceof Floor)
        }

        if (!valid) {
            throw {
                message: "Invalid Level",
                tile: tile
            }
        }

        return valid
    }


};
