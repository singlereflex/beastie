var TouchMoveControllerComponent = function (entity) {
  document.body.addEventListener("touchend", function dblClick(event) {
      if (!entity.dead) {
          var touch = event.changedTouches[0];

          event.preventDefault();

          var x = 0, y = 0;
          var center = {
              x: document.body.clientWidth / 2,
              y: document.body.clientHeight / 2
          };

          if (Math.abs(center.x - touch.clientX) > Math.abs(center.y - touch.clientY)) {
              if (0 < center.x - touch.clientX) {
                  x = -1;
              } else if (0 > center.x - touch.clientX) {
                  x = 1;
              }

          } else {
              if (0 < center.y - touch.clientY) {
                  y = -1;
              } else if (0 > center.y - touch.clientY) {
                  y = 1;
              }
          }
          entity.move(x, y);
      }
      entity.pulling(false);
  }, false);
};
