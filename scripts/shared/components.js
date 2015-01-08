BL.EventComponent = function (Entity) {
    Entity.prototype.on = function (name, callback) {
        if (this._events[name] === undefined) {
            this._events[name] = [];
        }

        this._events[name].push(callback);
        return this._events[name].length-1;
    };

    Entity.prototype.trigger = function () {
        //so that we can use array functions, arguments is not a true array
        var args = Array.prototype.slice.call(arguments);
        var name = args.shift();
        var callbacks = this._events[name];
        if (callbacks !== undefined) {
            for (var i = 0; i < callbacks.length; i++) {
                if(callbacks[i]){
                    callbacks[i].apply(this, args);
                }
            }
        }
    };

    Entity.prototype.remove = function (eventName, eventId) {
        // console.log("removing", arguments);
        // console.log(this._events[event_name].length);
        this._events[eventName][eventId] = null;
        // console.log(this._events[event_name].length);
    };

    Entity.prototype.removeAll = function(eventName){
        if(this._events === undefined){
            this._events = {};
        }
        delete this._events[eventName];
    };
};

BL.Viewport = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};
