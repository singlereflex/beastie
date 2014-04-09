'use strict';

//globals!
var music = true;
var settings = {
    gamespeed: 45,
    series: 12,
    cutoff: 800,
    q: 12,
    test: function(){
        if(!music){
            settings.music.start();
        } else {
            settings.music.stop();
        }
    }
}

var gui = new dat.GUI({ autoPlace: false });
var customContainer = document.getElementById('top-nav');
customContainer.appendChild(gui.domElement);

  gui.add(settings, 'gamespeed');
  gui.add(settings, 'series');
  gui.add(settings, 'cutoff', 100, 1000);
  gui.add(settings, 'q', 0, 20);
  gui.add(settings, 'test');

var beast_move = function(beast){
    var delta = (Math.floor(Math.random() * 3) - 1);
    var y = Math.floor(Math.random() * 2);
    try {
        beast.move((1 - (y)) * delta, (y) * delta);
    } catch (e){
        console.log("trying something: ", e);
    }
}

//music!
var pattern = new sc.Pshuf(sc.series(settings.series), Infinity);
var scale   = new sc.Scale.minor();
var chords  = [0, 1, 4];

var msec = timbre.timevalue("BPM120 L16");
var osc  = T("saw");
var env  = T("env", {table:[0.4, [1, msec * 48], [0.2, msec * 16]]});
var gen  = T("OscGen", {osc:osc, env:env, mul:0.2});

var pan   = T("pan", gen);
var synth = pan;

// synth = T("+saw", {freq:(msec * 2)+"ms", add:0.5, mul:0.85}, synth);
synth = T("lpf" , {cutoff:settings.cutoff, Q:settings.q}, synth);
// synth = T("reverb", {room:0.95, damp:0.1, mix:0.75}, synth);

settings.music = T("interval", {interval:msec * settings.gamespeed}, function() {
  var root = pattern.next();
  chords.forEach(function(i) {
    gen.noteOn(scale.wrapAt(root + i) +60, 80); 
  });
  pan.pos.value = Math.random() * 2 - 1;
}).set({buddies:synth}).start();




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

angular.module('beastieApp', ["firebase", "ui.bootstrap"])

angular.module('beastieApp').filter('toArray', function() { return function(obj) {
    if (!(obj instanceof Object)) return obj;
    return _.map(obj, function(val, key) {
        return Object.defineProperty(val, '$key', {__proto__: null, value: key});
    });
}});

