/**
 * Event Component - Attach the ability to listen to events.
 * @param {Entity} entity
 * @constructor
 */
var EventComponent = function (entity) {

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
	try {
            this._events[eventName][eventId] = null;
	} catch(err) {
	    console.debug("tried to remove event: ", eventName, eventId)
	}
    };

    entity.removeAll = function(eventName){
        if(this._events === undefined){
            this._events = {};
        }
        delete this._events[eventName];
    };
};
