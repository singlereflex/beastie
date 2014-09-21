// beastie.js

var World = function(){
  this._events = {};
  var self = this;
    this.running = false;

    this.score = 0;
    this.entities = {};

    this.entities.place = function(entity, silent) {
      var loc = entity.position.x + "," + entity.position.y;
      if (!self.entities[loc]) {
        self.entities[loc] = [];
      }
      self.entities[loc].push(entity);
      if(!silent){
        self.trigger('place', entity);
      }
    }
    this.findEntityByPosition = function(x, y) {
      return this.entities[x + ',' + y] || [];
    };

    this.animloop = function() {
        // try {
          self.trigger('tick');

        // } catch (e) {
          // console.log(e);
          // self.pause();
        // }
        if (self.running) {
            setTimeout(self.animloop, 30);
        }
    }
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

}
EventComponent(World);

/*

*/
var Player = function(x, y, world){
  this._events = {};
  //behavior
  var self = this;
  this.on('complete_move', function update(delta_x, delta_y, old){
    self.world.entities[old.x+","+old.y] = _.without(self.world.entities[old.x+","+old.y], self);
    self.world.entities.place(self, true);
    // center(self.el);
  })

  this.on('die', function die(){
    self.world.entities[self.position.x+","+self.position.y] = _.without(self.world.entities[self.position.x+","+self.position.y], self);
    self.dead = true;
  });

  this.on('collided', function collision(entity){
    if (entity.kind === 'monster' || entity.kind === 'mother') {
        self.die();
    } else {
        console.info("hit a block");
    }
  });

  this.world = world;
  //setup for dom rendering
  this.position = {
    x:x,
    y:y
  }
  this.kind = "player";

  PushComponent(this);

  PullComponent(this);

  CollisionComponent(this);

  // MoveControllerComponent(this);
  // PullControllerComponent(this);

  ExploreComponent(this);
  this.icon = 'icon-entities-player';
  //this will chanage for workers:
  // this.display = new Display(this, 'icon-entities-player');
}

//Class level component!
EventComponent(Player);
MoveComponent(Player);
DeathComponent(Player);

//blocks!
var Block = function(x, y, world){
  this._events = {};


  //behavior
  var self = this;
  // this.on('rendered', function(){
  //   self.el = document.getElementById('entityboard').appendChild(self.el);
  //   self.on('complete_move', function (delta_x, delta_y) {
  //       self.el.style.top = self.position.y + 'em';
  //       self.el.style.left = self.position.x + 'em';
  //   });
  // });

  this.on('complete_move', function (delta_x, delta_y, old) {
      self.world.entities[old.x+","+old.y] = _.without(self.world.entities[old.x+","+old.y], self);
      self.world.entities.place(self, true);
  });

  this.on('collided', function (entity) {
    console.log(entity);
      if (entity) {
          if (entity.kind === "block") {
              throw "hit a block";
          }
          if (entity.kind !== 'block') {
              //check if we're squishing something :)
              var delta_x = entity.position.x - this.position.x;
              var delta_y = entity.position.y - this.position.y;
              var neighbor = this.world.findEntityByPosition(entity.position.x + delta_x, entity.position.y + delta_y)[0];
              if (neighbor !== undefined/* && neighbor.kind === 'block'*/) {
                  entity.die();
              } else {
                throw "couldn't kill monster";
              }
          }
      }
  });

  this.world = world;
  this.position = {
    x:x,
    y:y
  }
  this.kind = "block";
  this.icon = 'icon-environment-block';
  // DomRenderer(this, template({classVal: 'icon-environment-block'}));
  // this.display = new Display(this, 'icon-environment-block');
  CollisionComponent(this);
}
EventComponent(Block);
MoveComponent(Block);

//eggs!

var Egg = function(x, y, world){
  this._events = {};
  var self = this;
  self.worth = 10;
  this.on('die', function die(){
    console.log(self.worth);
    self.world.score += self.worth;
    // console.log(self.world.score);
    self.world.entities[self.position.x+","+self.position.y] = _.without(self.world.entities[self.position.x+","+self.position.y], self);
    // document.getElementById('entityboard').removeChild(self.el);
    self.dead = true;
    self._events = {};
    this.world.remove('tick', self.tick);
  });

  this.on('collided', function (entity) {
      if (entity.kind === 'player') {
        entity.die();
      } else {
        throw "hit a block";
      }
  });

  // this.on('rendered', function (el) {
  //
  //     self.el = document.getElementById('entityboard').appendChild(self.el);
  //     self.on('complete_move', function (delta_x, delta_y) {
  //         self.el.style.top = self.position.y + 'em';
  //         self.el.style.left = self.position.x + 'em';
  //     });
  // });

  this.on('complete_move', function(delta_x, delta_y, old){
    self.world.entities[old.x+","+old.y] = _.without(self.world.entities[old.x+","+old.y], self);
    self.world.entities.place(self, true);
  });

  this.age = 0;


  this.world = world;
  this.position = {
    x:x,
    y:y
  }
  this.kind = "egg";

  this.tick = this.world.on('tick', function(){
    // console.log('tick');
    self.age++;
    if (self.age > Math.random() * (1000 - 100) + 100) {

      if(self.world.entities[self.position.x+","+self.position.y].length == 1 &&  self.world.entities[self.position.x+","+self.position.y][0] === self){
        self.transition("hatch");
      }
      // console.log("hatch");
      // return true;
    }
    // self.hunt(this);
  });
  // console.log(this.tick);
  this.icon = 'icon-entities-egg';
  // DomRenderer(this, template({classVal: 'icon-entities-egg'}));
  // this.display = new Display(this, 'icon-entities-egg');
  CollisionComponent(this);

  StateComponent(this, {
    'hatch': Monster,
    'mother': Mother
  });
}
EventComponent(Egg);
DeathComponent(Egg)


var Monster = function(){
  var self = this;
  var beast_speed = 10000;
  self.hunt = function(){

    // console.log(beast);
    if(self.probability === undefined){
      self.probability = beast_speed;
    }
    self.probability--;
    // console.log(self.probability);
    var yes = Math.floor(Math.random() * (self.probability));
    if(self.probability < 0){
      self.die();
    }
    else if(yes  < 100){
      var delta = (Math.floor(Math.random() * 3) - 1);
      var y = Math.floor(Math.random() * 2);
      try {
          self.move((1 - (y)) * delta, (y) * delta);
          self.probability = beast_speed;
      } catch (e){
          console.log("trying something: ", e);
      }
    }
  }

  self.worth = 20;
  if(arguments.length > 1){
    this.position = {
      x:arguments[0],
      y:arguments[1]
    }
  }
  if(arguments.length > 2){
    this.world = arguments[2];
  }
  this.kind = "monster";
  this.world.remove('tick', this.tick);

  this.tick = this.world.on('tick', function(){
    self.age++;
    if (self.age > Math.random() * (100000 - 1000) + 1000) {
      self.transition("mother");
      return true;
    }
    self.hunt(self);
  });
  // console.log(this.tick);
  MoveComponent(this);
  this.icon = 'icon-entities-monster';
  // this.display.render(this, 'icon-entities-monster');
  ExploreComponent(this);
}

var Mother = function(){
  var self = this;
  self.worth = 30;
  if(arguments.length > 1){
    this.position = {
      x:arguments[0],
      y:arguments[1]
    }
  }
  if(arguments.length > 2){
    this.world = arguments[2];
  }
  this.kind = "mother";
  this.world.remove('tick', this.tick);

  this.lay = function() {
    var egg = new Egg(self.position.x, self.position.y, self.world);
    self.world.entities.place(egg);
  };
  this.tick = this.world.on("tick", function() {
    var test = Math.floor(Math.random() * 50);
    if (test == 0 && self.world.findEntityByPosition(self.position.x, self.position.y).length < 2) {
      self.lay();
    }
    self.hunt(self);
  });
  this.icon = 'icon-entities-mother';
  // this.display.render(this, 'icon-entities-mother');
  PushComponent(this);

}
