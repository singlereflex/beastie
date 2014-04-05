'use strict';

//globals!
var gamespeed = 45;
var series = 12;
var cutoff = 800;
var q = 12;

//music!
var pattern = new sc.Pshuf(sc.series(series), Infinity);
var scale   = new sc.Scale.minor();
var chords  = [0, 1, 4];

var msec = timbre.timevalue("BPM120 L16");
var osc  = T("saw");
var env  = T("env", {table:[0.4, [1, msec * 48], [0.2, msec * 16]]});
var gen  = T("OscGen", {osc:osc, env:env, mul:0.2});

var pan   = T("pan", gen);
var synth = pan;

// synth = T("+saw", {freq:(msec * 2)+"ms", add:0.5, mul:0.85}, synth);
synth = T("lpf" , {cutoff:cutoff, Q:q}, synth);
// synth = T("reverb", {room:0.95, damp:0.1, mix:0.75}, synth);

T("interval", {interval:msec * gamespeed}, function() {
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

