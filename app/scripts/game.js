var gridsize = 16;
var cellsize = 16;

var loop = new Entity({
  kind: "loop",
  components: [WorldComponent],
});


function addPlayer() {
  var x = 1024;
  var y = 1024;

  var player = new Entity(env_schematics.player(loop, x, y));
  player.on("die", function() {
    loop.endGame();
  });
  player.on("complete_move", function(deltas) {
    // setTimeout(function(){center(player.el);}, 100);
    // window.scrollBy(deltas.delta_x * 16, deltas.delta_y * 16);
    $("html,body").animate({
      scrollTop: document.body.scrollTop + deltas.delta_y * 16,
      scrollLeft: document.body.scrollLeft + deltas.delta_x * 16
    }, 200);
  });

  loop.entities.place(player);
  center(player.el);
}

function placeEgg(loop, _x, _y) {
  var egg = new Entity(env_schematics.egg(loop, _x, _y));

  egg.on("die", function() {
    loop.$apply(function() {
      loop.score += egg.worth;
    });
  });

  egg.frameId = egg.on("frame", function(frame) {

    if (frame % gameSpeed === 0) {
      this.age++;
      if (this.age > 10 && (Math.random() > 0.25)) {
        console.log("should hatch");
        this.transition("hatch");

        return true;

      }
    }

    return false;

  });

  egg.on("transition:hatch", function hatch(monster) {
    monster.remove("frame", monster.frameId);
    console.log("hatch");
    monster.frameId = monster.on("frame", function(frame) {

      if (frame % gameSpeed === 0) {
        this.age++;
        if (this.age > 20) {
          this.transition("evolve");
          return true;
        }
        beast_move(this);
        return true;
      }

      return false;

    });
  });
  egg.on("transition:evolve", function evolve(monster) {
    monster.remove("frame", monster.frameId);
    monster.lay = function() {
      var newEgg = placeEgg(loop, this.position.x, this.position.y);
      this.world.entities.place(newEgg);
    };
    monster.frame_id = monster.on("frame", function(frame) {
      if (!(frame % settings.gamespeed)) {
        //chance to lay
        var test = Math.floor(Math.random() * 10);
        if (test == 0 && loop.findEntityByPosition(this.position.x, this.position.y).length < 2) {
          this.lay();
        }
        beast_move(this);
        return true;
      } else {
        return false;
      }
    });
  });

  return egg;
}

loop.explore = function(x, y, size) {
  for (var i = x; i < x + size; i++) {
    for (var e = y; e < y + size; e++) {
      if (loop.entities[i + "," + e] === undefined) {
        console.log(Math.floor(Math.random() * 10));
        // loop.entities[i + "," + e] = true;
        if (Math.floor(Math.random() * 1.5) > 0) {
          var blocktype = env_schematics.block(loop);
          blocktype.position = {
            x: i,
            y: e,
            z: parseInt(Math.random() * 100, 10)
          };
          if (blocktype.id) {
            blocktype.classVal = loop.iconPrefix + blocktype.id;
          }

          loop.entities.place(new Entity(blocktype));
        } else if (Math.floor(Math.random() * 50) == 0) {
          var egg = placeEgg(loop, i, e);
          loop.entities.place(egg);
        } else {
          loop.entities[i + "," + e] = [];
        }
      }
    }
  }

  // for (var n = 0; n < Math.floor(size / 5); n++) {
  //
  //     var _x = Math.floor(Math.random() * size + x);
  //     var _y = Math.floor(Math.random() * size + y);
  //
  //     while (loop.findEntityByPosition(_x, _y).length > 0) {
  //         _x = Math.floor(Math.random() * size + x);
  //         _y = Math.floor(Math.random() * size + y);
  //     }
  //     var egg = placeEgg(loop, _x, _y);
  //     loop.entities.place(egg);
  // }
};


/*
         world should have
         environment = {
         loop,///the game loop
         entities,///the list of entities
         world,///a representation of the list of entities?
         explore?///the ability to add to the entities, works with world

         }
         */
