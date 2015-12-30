BL = {
    actors: {},
    entities: {}
};

BL.Sprites = {
    "icon-entities-player": new Image(),
    "icon-environment-block": new Image(),
    "icon-entities-egg": new Image(),
    "icon-entities-monster": new Image(),
    "icon-entities-mother": new Image()
};

BL.Sprites["icon-entities-player"].src = "images/entities-player.png";
BL.Sprites["icon-environment-block"].src = "images/environment-block.png";
BL.Sprites["icon-entities-egg"].src = "images/entities-egg.png";
BL.Sprites["icon-entities-monster"].src = "images/entities-monster.png";
BL.Sprites["icon-entities-mother"].src = "images/entities-mother.png";

//FIXME shouldn't be global, could be a constructor?
BL.Viewport = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};
