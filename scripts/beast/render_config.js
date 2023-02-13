BL.Sprites = {
    "player": new Image(),
    "block": new Image(),
    "egg": new Image(),
    "beast": new Image(),
    "mother": new Image(),
};

BL.Sprites["player"].src = "images/entities-player.png";
BL.Sprites["block"].src = "images/environment-block.png";
BL.Sprites["egg"].src = "images/entities-egg.png";
BL.Sprites["beast"].src = "images/entities-monster.png";
BL.Sprites["mother"].src = "images/entities-mother.png";

function getSprite(type) {
  const icon = BL.Sprites[type];
  return icon;
}
