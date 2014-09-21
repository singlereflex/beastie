
function EventComponent(Entity){
  Entity.prototype.on = function (name, callback) {
      if (this._events[name] === undefined) {
          this._events[name] = [];
      }

      this._events[name].push(callback);
      return this._events[name].length-1;
  };

  Entity.prototype.trigger = function () {
    //so that we can use array functions, arguments is not a true array
      var arguments = Array.prototype.slice.call(arguments);
      var name = arguments.shift();
      var callbacks = this._events[name];
      if (callbacks !== undefined) {
        for (var i = 0; i < callbacks.length; i++) {
          if(callbacks[i]){
            callbacks[i].apply(this, arguments);
          }
        }
      }
  };

  Entity.prototype.remove = function (event_name, event_id) {
    // console.log("removing", arguments);
    // console.log(this._events[event_name].length);
    this._events[event_name][event_id] = null;
    // console.log(this._events[event_name].length);
  };

  Entity.prototype.removeAll = function(event_name){
    if(this._events === undefined){
      this._events = {};
    }
    delete this._events[event_name];
  }
}
