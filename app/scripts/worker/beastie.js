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
      if(entity._id === undefined){
        entity._id = _.uniqueId("mob_");
      }
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
            setTimeout(self.animloop, 40);
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
  this.icon = 'svg/uE001-entities-egg.svg';
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
    // console.log(entity);
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
  this.icon = 'svg/uE001-entities-egg.svg';
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
    // console.log(self.age);
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
      } else if (entity.kind === 'egg'){
        entity.worth = 0;
        console.info("I ate an egg, I'm such a cannible. And you get "+ entity.worth);
        self.beast_speed = self.beast_speed > 45?self.beast_speed-1:self.beast_speed;
        self.when_will_i_die += 5;
        entity.die();
      } else if (entity.kind === 'monster' && self.kind === 'mother'){
        entity.worth = 0;
        console.info("I ate an monster, I'm such a cannible. And you get "+ entity.worth);
        self.beast_speed = self.beast_speed > 40?self.beast_speed-1:self.beast_speed;
        self.when_will_i_die += 10;
        entity.die();
      } else if (entity.kind === 'mother' && self.kind === 'mother'){
        entity.worth = 0;
        console.info("I ate an mother, I'm such a cannible. And you get "+ entity.worth);
        self.beast_speed = self.beast_speed > 30?self.beast_speed-1:self.beast_speed;
        self.when_will_i_die += 20;
        entity.die();
      } else {
        throw "hit a block";
      }
  });

  this.on('complete_move', function(delta_x, delta_y, old){
    self.world.entities[old.x+","+old.y] = _.without(self.world.entities[old.x+","+old.y], self);
    self.world.entities.place(self, true);
  });

  this.age = 0;
  this.when_will_i_die = Math.random()*(4500 - 1500) + 1500;

  this.world = world;
  this.position = {
    x:x,
    y:y
  }
  this.kind = "egg";

  this.tick = this.world.on('tick', function(){
    // console.log('tick');
    self.age++;
    if (self.age > Math.random() * (750 - 250) + 250) {

      if(self.world.entities[self.position.x+","+self.position.y].length == 1 &&  self.world.entities[self.position.x+","+self.position.y][0] === self){
        self.transition("hatch");
      }
      // console.log("hatch");
      // return true;
    }
    // self.hunt(this);
  });
  // console.log(this.tick);
  this.icon = 'svg/uE001-entities-egg.svg';
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
  this.moves = [
    [0,1],
    [0,-1],
    [1,0],
    [-1,0]
  ]
  var self = this;
  self.beast_speed = 25*2;//move once every 5 seconds or die
  self.hunt = function(){

    // console.log(beast);
    if(self.probability === undefined){
      self.probability = self.beast_speed;
    }

    if(self.probability < 0){
      self.die();
      return;
    }
    // console.log(self.probability);

    if(self.probability  < 25){
      var delta = (Math.floor(Math.random() * 4));
      // var move = self.moves[delta];
      for(var i = 0; i < self.moves.length; i++){
        var move = self.moves[(delta+i)%4];
        if(self.world.findEntityByPosition(self.position.x+move[0], self.position.y+move[1]) === undefined ||
          self.world.findEntityByPosition(self.position.x+move[0], self.position.y+move[1]).length == 0
          || (self.world.findEntityByPosition(self.position.x+move[0], self.position.y+move[1])[0].kind != "block" || self.kind == "mother")){
          try {
              self.move(move[0], move[1]);
              self.probability = self.beast_speed;
              return;
          } catch (e){
              console.debug("trying something: "+ e);
          }
        }
      }
      // var y = Math.floor(Math.random() * 2);
    }
    self.probability--;
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
    if (self.age > Math.random() * (1500 - 750) + 750) {
      self.transition("mother");
      return true;
    }
    self.hunt();
  });
  // console.log(this.tick);
  MoveComponent(this);
  this.icon = 'svg/uE001-entities-egg.svg';
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
    self.age++;
    if(self.age > self.when_will_i_die){
      //you get less points if you let them die of old age
      self.worth = 1;
      console.debug("died of old age so I'm worth "+self.worth)
      self.die();
      return;
    }

    var test = Math.floor(Math.random() * 100);

    if (test == 0 && self.world.findEntityByPosition(self.position.x, self.position.y).length < 2) {
      var no_ones_around = true;
      for(var i = 0; i < self.moves.length; i++){
        var move = self.moves[i];
        if(self.world.findEntityByPosition(self.position.x+move[0], self.position.y+move[1]).length > 0){
          no_ones_around = false;
          break;
        }
      }
      if(no_ones_around){
        self.lay();
      }

    }
    self.hunt(self);
  });
  this.icon = 'svg/uE001-entities-egg.svg';
  this.removeAll('start_move');
  // this.display.render(this, 'icon-entities-mother');
  PushComponent(this);
  CollisionComponent(this);

}
