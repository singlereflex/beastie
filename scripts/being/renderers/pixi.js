var PixiRenderer = function(board, editable){
  this._canvas = document.getElementById(board);
  // var context = canvas.getContext("2d");


  this._renderer = new PIXI.autoDetectRenderer(this._canvas.width, this._canvas.height, {
    view: this._canvas,
    transparent: true
  });

  // create an new instance of a pixi stage
  this._stage = new PIXI.Container();

  var interactive = editable || false;

  if(interactive) {
      EventComponent(this);

      this._stage.interactive = true;

      this._stage.hitArea = new PIXI.Rectangle(0, 0, this._renderer.width, this._renderer.height);

      console.debug(this._stage.hitArea);

      this._stage.on('click', function(event) {
          this.trigger('click', event);
      });

      this._stage.on('mousedown', function(event) {
          this.trigger('mousedown', event);
      });
  }

  console.debug(this._stage);
}

PixiRenderer.prototype.render = function(){
  this._renderer.render(this._stage);
}

PixiRenderer.prototype.resize = function(width, height){
  this._renderer.resize(width, height);
  if (this._stage.hitArea !== undefined) {
      this._stage.hitArea.width = this._renderer.width
      this._stage.hitArea.height = this._renderer.height;
  }
}

PixiRenderer.prototype.entity = function(entity) {
  var self = this;
  var square = 64;
  // console.info(self._stage);
  // create a new Sprite that uses the image name that we just generated as its source
  // console.debug(BL.Sprites[entity.icon]);
  // console.debug("icon:", entity.icon);
  // console.debug("icon src:", BL.Sprites[entity.icon].src);
  entity.dude = this._stage.addChild(PIXI.Sprite.fromImage(BL.Sprites[entity.icon].src));


  //rendering position needs to be offset but current player position (or canvas viewport if you want to think about it that way);
  entity.draw = function () {//figure out the animated move part later

    var step = 4;
    if (Math.abs(this._position.x - this.position.x) > 2 || Math.abs(this._position.y - this.position.y) > 2) {
      this.position.x = this._position.x;
      this.position.y = this._position.y;
    } else {
      if (!Math.abs(this._position.x - this.position.x) / step < 0.01) {
        this.position.x = (this.position.x + (this._position.x - this.position.x) / step);
        if (this.kind === "player") {
          BL.Viewport.x = this.position.x;
        }
      }
      if (!Math.abs(this._position.y - this.position.y) / step < 0.01) {
        this.position.y = (this.position.y + (this._position.y - this.position.y) / step);
        if (this.kind === "player") {
          BL.Viewport.y = this.position.y;
        }
      }
    }

    var posX = (this.position.x - (BL.Viewport.x - ((BL.Viewport.width/2) / square))) * square;
    var posY = (this.position.y - (BL.Viewport.y - ((BL.Viewport.height/2) / square))) * square;
    this.dude.position.x = posX;
    this.dude.position.y = posY;
  };

  entity.move = function (/*deltaX, deltaY, entity*/) {
  };

  entity.die = function () {
    console.log(entity);
    self._stage.removeChild(entity.dude);
  };

  entity.transition = function(new_entity, new_icon){
    this.position = {
        x: new_entity.position.x,
        y: new_entity.position.y
    };

    this._position = {
        x: new_entity.position.x,
        y: new_entity.position.y
    };
    this.id = new_entity.id;
    this.kind = new_entity.kind;
    this.icon = new_icon;

    var dude = PIXI.Sprite.fromImage(BL.Sprites[entity.icon].src);

    self._stage.removeChild(this.dude);

    this.dude = self._stage.addChild(dude);
  }

};
