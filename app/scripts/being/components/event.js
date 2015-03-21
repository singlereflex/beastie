/**
 * Event Component - Attach the ability to listen to events.
 * @param {Entity} entity
 * @constructor
 */
BL.EventComponent = function (entity) {

    entity._events = {};

    entity.on = function (name, callback) {
        if (this._events[name] === undefined) {
            this._events[name] = [];
        }

        this._events[name].push(callback);
        return this._events[name].length-1;
    };

    entity.trigger = function () {
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

    entity.remove = function (eventName, eventId) {
        if(this._events === undefined){
            this._events = {};
        }
        // console.log("removing", arguments);
        // console.log(this._events[event_name].length);
        this._events[eventName][eventId] = null;
        // console.log(this._events[event_name].length);
    };

    entity.removeAll = function(eventName){
        if(this._events === undefined){
            this._events = {};
        }
        delete this._events[eventName];
    };
};
