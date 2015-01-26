var PixiRenderer = function(board){
  this._canvas = document.getElementById(board);
  // var context = canvas.getContext("2d");


  this._renderer = new PIXI.autoDetectRenderer(this._canvas.width, this._canvas.height, {
    view: this._canvas,
    transparent: true
  });

  // create an new instance of a pixi stage
  this._stage = new PIXI.Stage(0x000000);


}

PixiRenderer.prototype.render = function(){
  this._renderer.render(this._stage);
}

PixiRenderer.prototype.resize = function(width, height){
  this._renderer.resize(width, height);
}

PixiRenderer.prototype.entity = function(entity) {
  var self = this;
  var square = 24;

  // create a new Sprite that uses the image name that we just generated as its source
  // console.debug(BL.Sprites[entity.icon]);
  console.debug("icon", entity.icon);
  var dude = PIXI.Sprite.fromImage(BL.Sprites[entity.icon].src);

  // set the anchor point so the the dude texture is centerd on the sprite
  dude.anchor.x = dude.anchor.y = 0.5;

  // dude.scale.x = dude.scale.y = 0.8 + Math.random() * 0.3;

  // finally let's set the dude to be a random position..
  dude.position.x = entity.position.x;
  dude.position.y = entity.position.y;

  dude.blendMode = PIXI.blendModes.ADD
  // time to add the dude to the pond container!
  // stage.addChild(dude);

  entity.dude = dude;

  //rendering position needs to be offset but current player position (or canvas viewport if you want to think about it that way);
  entity.draw = function () {//figure out the animated move part later

    var step = 4;
    if (Math.abs(entity._position.x - entity.position.x) > 2 || Math.abs(entity._position.y - entity.position.y) > 2) {
      entity.position.x = entity._position.x;
      entity.position.y = entity._position.y;
    } else {
      if (!Math.abs(entity._position.x - entity.position.x) / step < 0.01) {
        entity.position.x = (entity.position.x + (entity._position.x - entity.position.x) / step);
        if (entity.kind === "player") {
          BL.Viewport.x = entity.position.x;
        }
      }
      if (!Math.abs(entity._position.y - entity.position.y) / step < 0.01) {
        entity.position.y = (entity.position.y + (entity._position.y - entity.position.y) / step);
        if (entity.kind === "player") {
          BL.Viewport.y = entity.position.y;
        }
      }
    }

    var posX = (entity.position.x - (BL.Viewport.x - ((BL.Viewport.width/2) / square))) * square;
    var posY = (entity.position.y - (BL.Viewport.y - ((BL.Viewport.height/2) / square))) * square;
    entity.dude.position.x = posX;
    entity.dude.position.y = posY;
  };

  entity.move = function (/*deltaX, deltaY, entity*/) {
  };

  entity.die = function () {
    self._stage.removeChild(entity.dude);
  };

  this._stage.addChild(entity.dude);
};
