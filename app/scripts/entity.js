// alert("loaded");
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var template = _.template('<i class="{{ classVal }}"></i>');

var Display = function(player, icon){
  this._events = {};
  var self = this;
  this.on('rendered', function(){
    self.el = document.getElementById('entityboard').appendChild(self.el);
    if(player.kind == 'player'){
      center(self.el);
    }
  });

  this.render = function(player, icon){
    // console.log(icon);
    self.position = {
      x: player.position.x,
      y: player.position.y
    }
    self.kind = player.kind
    DomRenderer(self, template({classVal: icon}));
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
