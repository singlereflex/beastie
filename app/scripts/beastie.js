// beastie.js
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var template = _.template('<i class="{{ classVal }}"></i>');

var World = function(){
    this.running = false;

    this.score = 0;
    this.entities = {};
    this.entities.place = function(entity) {
      var loc = entity.position.x + "," + entity.position.y;
      if (!this.entities[loc]) {
        this.entities[loc] = [];
      }
      this.entities[loc].push(entity);
    }
    this.findEntityByPosition = function(x, y) {
      return this.entities[x + ',' + y] || [];
    };

    function animloop() {
        try {
            this.trigger('tick');
        } catch (e) {
            // entity.pause()
        }
        if (this.running) {
            requestAnimFrame(animloop);
        }
    }
    this.start = function () {
        this.running = true;
        animloop();
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
player: function (_world, x, y) {
    return {
        kind: 'player',
        classVal: _world.iconPrefix + 'entities-player',
        keyboard: true,
        position: {
            x: x,
            y: y
        },
        template: template,
        //order matthers X_x
        components: [
            DomRenderer,
            MoveComponent,
            PushComponent,
            PullComponent,
            CollisionComponent,
            ControllerComponent,
            DeathComponent,
            ExploreComponent
        ],
        events: {
            start_move: function (deltas) {
                console.log("move block")
                // console.log(this.position);
                //$scope.$apply();
            },
            complete_move: function(deltas, old){
              this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
              this.world.entities.place(this);
            },
            die: function () {
                this.world.entities[this.position.x+","+this.position.y] = _.without(this.world.entities[this.position.x+","+this.position.y], this);
                document.getElementById('entityboard').removeChild(this.el);
                this.dead = true;
            },
            collided: function (entity) {
                if (entity.kind === 'monster' || entity.kind === 'mother') {
                    this.die();
                } else {
                    console.log("hit a block");
                }
            },
            rendered: function (el) {

                this.el = document.getElementById('entityboard').appendChild(el);
                this.on('complete_move', function (deltas) {

                    this.el.style.top = this.position.y + 'em';
                    this.el.style.left = this.position.x + 'em';

                });
            }
        },
        world: _world
    }
},
*/
var Player = function(x, y, world){
  this.world = world;
  //setup for dom rendering
  this.position = {
    x:x,
    y:y
  }
  this.kind = "player";
  DomRenderer(this, template({classVal: 'icon-entities-player'}));

  PushComponent(this);

  PullComponent(this);

  CollisionComponent(this);

  MoveControllerComponent(this);
  PullControllerComponent(this);

  ExploreComponent(this);


  //behavior
  var self = this;
  this.on('complete_move', function update(delta_x, delta_y, old){
    self.world.entities[old.x+","+old.y] = _.without(self.world.entities[old.x+","+old.y], self);
    self.world.entities.place(self);
  })

  this.on('die', function die(){
    self.world.entities[self.position.x+","+self.position.y] = _.without(self.world.entities[self.position.x+","+self.position.y], self);
    document.getElementById('entityboard').removeChild(self.el);
    self.dead = true;
  });

  this.on('collided', function collision(entity){
    if (entity.kind === 'monster' || entity.kind === 'mother') {
        self.die();
    } else {
        console.info("hit a block");
    }
  });

  this.on('rendered', function(){
    self.el = document.getElementById('entityboard').appendChild(self.el);
    self.on('complete_move', function (delta_x, delta_y) {

        self.el.style.top = self.position.y + 'em';
        self.el.style.left = self.position.x + 'em';

    });
  });
}

//Class level component!
EventComponent(Player);
MoveComponent(Player);
DeathComponent(Player);

/*
block: function (_world) {
    return {
        kind: 'block',
        id: 'environment-block',
        push: true,
        heavy: true,
        walk: false,
        template: template,
        components: [DomRenderer, MoveComponent, CollisionComponent],
        events: {
            complete_move: function (deltas, old) {
                // console.log(this.position);
                //$scope.$apply();
                console.log(this);
                this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
                this.world.entities.place(this);
            },
            start_move: function (deltas) {
                console.log("move block")
                // console.log(this.position);
                //$scope.$apply();
            },
            collided: function (entity) {
                if (entity) {
                    if (entity.kind === "block") {
                        throw "hit a block";
                    }
                    if (entity.kind !== 'block') {
                        console.log('monster');
                        var delta_x = entity.position.x - this.position.x;
                        var delta_y = entity.position.y - this.position.y;
                        var neighbor = this.world.findEntityByPosition(entity.position.x + delta_x, entity.position.y + delta_y)[0];
                        if (neighbor !== undefined && neighbor.kind === 'block') {
                            entity.die();
                        } else {
                            throw "chouldn't kill the monster";
                        }

                    }
                }
            },
            rendered: function (el) {
                this.el = document.getElementById('entityboard').appendChild(el);
                this.on('complete_move', function (deltas) {
                    this.el.style.top = this.position.y + 'em';
                    this.el.style.left = this.position.x + 'em';
                });
            }
        },
        world: _world
    }
},
*/

var Block = function(x, y, world){
  this.world = world;
  this.position = {
    x:x,
    y:y
  }
  this.kind = "block";
  DomRenderer(this, template({classVal: 'icon-environment-block'}));
  CollisionComponent(this);


  //behavior
  var self = this;
  this.on('rendered', function(){
    self.el = document.getElementById('entityboard').appendChild(self.el);
    self.on('complete_move', function (delta_x, delta_y) {
        self.el.style.top = self.position.y + 'em';
        self.el.style.left = self.position.x + 'em';
    });
  });

  this.on('complete_move', function (delta_x, delta_y, old) {
      self.world.entities[old.x+","+old.y] = _.without(self.world.entities[old.x+","+old.y], self);
      self.world.entities.place(self);
  });

  this.on('collided', function (entity) {
      if (entity) {
          if (entity.kind === "block") {
              throw "hit a block";
          }
          if (entity.kind !== 'block') {
              //check if we're squishing something :)
              var delta_x = entity.position.x - this.position.x;
              var delta_y = entity.position.y - this.position.y;
              var neighbor = this.world.findEntityByPosition(entity.position.x + delta_x, entity.position.y + delta_y)[0];
              if (neighbor !== undefined && neighbor.kind === 'block') {
                  entity.die();
              }
          }
      }
  });
}
EventComponent(Block);
MoveComponent(Block);


/*
egg: function (_world, x, y) {
    return {
        kind: 'egg',
        classVal: _world.iconPrefix + 'entities-egg',
        keyboard: false,
        position: {
            x: x,
            y: y
        },
        template: template,
        worth: 10,
        events: {
            die: function () {
                // console.log(this.world);

                this.world.entities[this.position.x+","+this.position.y] = _.without(this.world.entities[this.position.x+","+this.position.y], this);
                document.getElementById('entityboard').removeChild(this.el);
            },
            collided: function (entity) {
                // console.log("collision")
                // console.log(entity);
                if (entity.kind === 'player') {
                    entity.die();
                }
            },
            rendered: function (el) {

                this.el = document.getElementById('entityboard').appendChild(el);
                this.on('complete_move', function (deltas) {
                    this.el.style.top = this.position.y + 'em';
                    this.el.style.left = this.position.x + 'em';
                });
            }
        },
        age: 0,
        components: [
            DomRenderer,
            CollisionComponent,
            DeathComponent,
            FrameComponent
        ],
        world: _world,
        states: {
            hatch: {
                kind: 'monster',
                classVal: _world.iconPrefix + 'entities-monster',
                template: template,
                worth: 20,
                components: [
                    DomRenderer,
                    MoveComponent,
                    CollisionComponent,
                    DeathComponent,
                    ExploreComponent
                ],
                events: {
                    complete_move: function(deltas, old){
                      this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
                      this.world.entities.place(this);
                    },
                    collided: function (entity) {
                        if (entity.kind === 'player') {
                            entity.die();
                        } else {
                            throw "hit a block";
                        }
                    },
                    rendered: function (el) {
                        this.el = document.getElementById('entityboard').appendChild(el);
                        this.on('complete_move', function (deltas) {
                            this.el.style.top = this.position.y + 'em';
                            this.el.style.left = this.position.x + 'em';
                        });
                    }
                }
            },
            evolve: {
                kind: 'mother',
                classVal: _world.iconPrefix + 'entities-mother',
                template: template,
                worth: 30,
                events: {
                    complete_move: function(deltas, old){
                      this.world.entities[old.x+","+old.y] = _.without(this.world.entities[old.x+","+old.y], this);
                      this.world.entities.place(this);
                    },
                    collided: function (entity) {
                        if (entity.kind === 'player') {
                            entity.die();
                        } else {
                            console.log("hit a block");
                        }
                    },
                    rendered: function (el) {
                        this.el = document.getElementById('entityboard').appendChild(el);
                        this.on('complete_move', function (deltas) {
                            this.el.style.top = this.position.y + 'em';
                            this.el.style.left = this.position.x + 'em';
                        });
                    }
                },
                components: [
                    DomRenderer,
                    MoveComponent,
                    PushComponent,
                    CollisionComponent,
                    DeathComponent,
                    ExploreComponent
                ]
            }
        }
    }
}
*/

var Egg = function(x, y, world){
  this.world = world;
  this.position = {
    x:x,
    y:y
  }
  this.kind = "egg";
  DomRenderer(this, template({classVal: 'icon-entities-egg'}));
  CollisionComponent(this);

  StateComponent(this, {
    'hatch': Monster,
    'mother': Mother
  });
  var self = this;
  this.on('die', function die(){
    self.world.entities[self.position.x+","+self.position.y] = _.without(self.world.entities[self.position.x+","+self.position.y], self);
    document.getElementById('entityboard').removeChild(self.el);
    self.dead = true;
  });

  this.on('collided', function (entity) {
      if (entity.kind === 'player') {
          entity.die();
      }
  });

  this.on('rendered', function (el) {

      self.el = document.getElementById('entityboard').appendChild(self.el);
      self.on('complete_move', function (delta_x, delta_y) {
          self.el.style.top = self.position.y + 'em';
          self.el.style.left = self.position.x + 'em';
      });
  });

  this.on('complete_move', function(delta_x, delta_y, old){
    self.world.entities[old.x+","+old.y] = _.without(self.world.entities[old.x+","+old.y], self);
    self.world.entities.place(self);
  });

  this.age = 0;
  this.move = this.world.on('tick', function(){
    this.age++;
    if (this.age > 20) {
      this.transition("hatch");
      // return true;
    }
    // beast_move(this);
  });
}
EventComponent(Egg);
DeathComponent(Egg)


var Monster = function(){
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
  this.world.remove('tick', this.move);
  DomRenderer(this, template({classVal: 'icon-entities-monster'}));
  ExploreComponent(this);
}
MoveComponent(Monster);

var Mother = function(){
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
  this.world.remove('tick', this.move);
  DomRenderer(this, template({classVal: 'icon-entities-mother'}));
  PushComponent(this);
}
