// alert("loaded");
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var template = _.template('<i class="{{ classVal }}"></i>');

var Display = function(player, icon){
  this._events = {};
  var self = this;

  this.render = function(player, icon){
    // console.log(icon);
    self.position = {
      x: player.position.x,
      y: player.position.y
    }
    self._position = {
      x: player.position.x,
      y: player.position.y
    }
    self.kind = player.kind
    self.icon = icon
    CanvasRenderer(self);
  }

  this.render(player, icon);
}
EventComponent(Display);

var DummyPlayer = function(game){
  this.move = function(delta_x, delta_y){
    game.postMessage({
      event: 'move',
      delta_x: delta_x,
      delta_y: delta_y
    });
  }
  this.pulling = function(yes){
    game.postMessage({
      event: 'pulling',
      is_pulling: yes
    })
  }
  MoveControllerComponent(this);
  PullControllerComponent(this);
}
