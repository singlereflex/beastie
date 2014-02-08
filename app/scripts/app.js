'use strict';

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
        	console.log("using this one");
            window.setTimeout(callback, 1000 / 60);
        };
})();

angular.module('beastieApp', ["firebase"])

