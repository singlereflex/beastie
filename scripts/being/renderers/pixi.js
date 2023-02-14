var PixiRenderer = function(board){
  var self = this;

  this._canvas = document.getElementById(board);
  // var context = canvas.getContext("2d");


  this._renderer = new PIXI.autoDetectRenderer({
    view: this._canvas,
    backgroundAlpha: 0,
  });
  //this._renderer.scale = 64;
  //this._renderer.autoDensity = true;

  // create an new instance of a pixi stage
  this._stage = new PIXI.Container();
  this._stage.setTransform(
    0,
    0,
    sprite_size,
    sprite_size,
    0,
    0,
    0,
    0,
    0,
  );
}

const sprite_size = 64;
const step = 4;

PixiRenderer.prototype.render = function(){
  for (child of this._stage.children) {
    child.x = (child.x + (child._x - child.x) / step);
    child.y = (child.y + (child._y - child.y) / step);
  }
  this._renderer.render(this._stage);
}

PixiRenderer.prototype.resize = function(width, height){
  this._renderer.resize(width, height);
}

PixiRenderer.prototype.addChild = function(type, x, y) {
  const icon = getSprite(type)
  const sprite = PIXI.Sprite.from(icon.src)
  const dude = this._stage.addChild(sprite);
  dude.setTransform(
    0,
    0,
    1/sprite_size,
    1/sprite_size,
    0,
    0,
    0,
    0,
    0,
  );
  dude.x = x;
  dude.y = y;
  dude._x = x;
  dude._y = y;

  if (type === "player") {
    const cb = dude.position.cb;
    dude.position.cb = centerOn(this, cb);
    dude.position.cb.bind(dude)();
  }

  return dude;
}

function centerOn(renderer, next) {
  return function() {
    const piece = this;
    const view_height = renderer._renderer.height/sprite_size;
    const view_width = renderer._renderer.width/sprite_size;
    renderer._stage.pivot.x = piece.position.x - view_width/2;
    renderer._stage.pivot.y = piece.position.y - view_height/2;
    next.bind(this)();
    //console.info(renderer._stage.mask)
  }
}
