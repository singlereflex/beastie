// var Game = function() {

  importScripts('/beastie/bower_components/underscore/underscore.js');
  importScripts('components.js');
  importScripts('beastie.js');

  var loop = new World();
  self.loop = loop;

  loop.on('place', function(entity){
    // console.log(entity.icon);
    self.postMessage({
      event: 'place',
      entity: {
        position:{
          x: entity.position.x,
          y: entity.position.y
        },
        kind: entity.kind
      },
      _id:entity._id,
      icon:entity.icon
    })
    entity.on('complete_move', function(delta_x, delta_y, old){
      self.postMessage({
        event: 'complete_move',
        entity: {
          position:{
            x: entity.position.x,
            y: entity.position.y
          },
          kind: entity.kind
        },
        _id:entity._id,
        icon: entity.icon
      });
    });
    entity.on('die', function(){
      self.postMessage({
        event: 'die',
        entity: {
          position:{
            x: entity.position.x,
            y: entity.position.y
          },
          kind: entity.kind
        },
        _id:entity._id,
        icon: entity.icon,
        worth: entity.worth
      });
    })
    entity.on('transition', function(){
      self.postMessage({
        event: 'transition',
        entity: {
          position:{
            x: entity.position.x,
            y: entity.position.y
          },
          kind: entity.kind
        },
        _id:entity._id,
        icon: entity.icon
      });
    });
  });

  this.addPlayer = function() {
    var x = 1024;
    var y = 1024;

    var player = new Player(x, y, loop);

    loop.entities.place(player);
    // center(player.el);
    return player;
  }


  function placeEgg(loop, _x, _y) {
    var egg = new Egg(_x, _y, loop);
    return egg;
  }

  self.loop.explore = function(x, y, size) {
    for (var i = x; i < x + size; i++) {
      for (var e = y; e < y + size; e++) {
        if (loop.entities[i + "," + e] === undefined) {
          if (Math.floor(Math.random() * 1.5) > 0) {
            loop.entities.place(new Block(i, e, loop));
          } else if (Math.floor(Math.random() * 50) == 0) {
            var egg = placeEgg(loop, i, e);
            loop.entities.place(egg);
          } else {
            loop.entities[i + "," + e] = [];
          }
        }
      }
    }
  };


  var player = this.addPlayer();

  self.addEventListener('message', function(e){
    if(e.data){
      switch(e.data.event){
        case 'move':
          player.move(e.data.delta_x, e.data.delta_y);
          break;
        case 'pulling':
          player.pulling = e.data.is_pulling;
          break;
      }
    }
  })

  player.on('die', function(){
    self.close();
  });

  this.loop.explore(1024 - 8, 1024 - 8, 16);
  this.loop.start();
// }
