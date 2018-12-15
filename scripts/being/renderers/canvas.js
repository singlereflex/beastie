var CanvasRenderer = function(board){
  this._canvas = document.getElementById(board);
  this._context = this._canvas.getContext("2d");
  this._world = {};
}

CanvasRenderer.prototype.render = function(){
  //draw everything
  var square = 24;
  this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  var context = this._context;
  context.globalAlpha = 1;

  for(var key in this._world){
    var entity = this._world[key];
    var posX = (entity.position.x - (BL.Viewport.x - ((context.canvas.width / 2) / square))) * square;
    var posY = (entity.position.y - (BL.Viewport.y - ((context.canvas.height / 2) / square))) * square;


    if (entity.kind === "block") {
      context.shadowOffsetY = (-(entity.position.y - BL.Viewport.y)/12)+5;
      context.shadowOffsetX = -(entity.position.x - BL.Viewport.x)/3;
      context.shadowBlur = 4;
      context.shadowColor = "rgba(255,255,255,0.4)";
      context.strokeStyle="red";
      context.fillStyle = "rgba(200,200,200,0.4)";
      context.fillRect(posX+0.5, posY+0.5, square+0.5, square+0.5);
    } else {
      context.shadowColor = "transparent";
      context.shadowBlur = 0;

      var variedShade = (Math.random()/4)+0.75;
      context.globalAlpha = variedShade;

      context.drawImage(BL.Sprites[entity.icon], posX+0.5, posY+0.5, square+0.5, square+0.5);
    }
  }
}

CanvasRenderer.prototype.resize = function(width, height){
  this._canvas.width = width;
  this._canvas.height = height;
}


/**
* The rendering logic for using the canvas and vanilla javascript
* @param {entity} entity The game entity to be rendered
*/
CanvasRenderer.prototype.entity = function(entity) {
  var self = this;
  var square = 24;

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

  };

  entity.move = function (/*deltaX, deltaY, entity*/) {
  };

  entity.die = function () {
    delete self._world[entity.id];
  };
  this._world[entity.id] = entity;
};
