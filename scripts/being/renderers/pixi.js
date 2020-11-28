var PixiRenderer = function(board){
    var self = this;

  this._canvas = document.getElementById(board);
  // var context = canvas.getContext("2d");


  this._renderer = new PIXI.autoDetectRenderer(this._canvas.width, this._canvas.height, {
    view: this._canvas,
    transparent: true
  });

  // create an new instance of a pixi stage
  this._stage = new PIXI.Container();

  this._layers = {
      "background":new PIXI.DisplayObjectContainer(),
      "middleground":new PIXI.DisplayObjectContainer(),
      "foreground":new PIXI.DisplayObjectContainer()
  }

  this._stage.addChild(this._layers['background'])
  this._stage.addChild(this._layers['middleground'])
  this._stage.addChild(this._layers['foreground'])

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

  // create a new Sprite that uses the image name that we just generated as its source


  entity.dude = this._layers[entity.dimension].addChild(PIXI.Sprite.fromImage(BL.Sprites[entity.icon].src));


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

    self._layers[entity.dimension].removeChild(entity.dude);
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

    self._layers[entity.dimension].removeChild(this.dude);

    this.dude = self._layers[entity.dimension].addChild(dude);
  }

};
