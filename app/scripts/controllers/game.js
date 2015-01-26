"use strict";
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ["ms", "moz", "webkit", "o"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] ||
            window[vendors[x] + "CancelRequestAnimationFrame"];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

}());

BL.Sprites = {
    "icon-entities-player": new Image(),
    "icon-environment-block": new Image(),
    "icon-entities-egg": new Image(),
    "icon-entities-monster": new Image(),
    "icon-entities-mother": new Image()
};

BL.Sprites["icon-entities-player"].src = "svg/entities-player.svg";
BL.Sprites["icon-environment-block"].src = "svg/environment-block.svg";
BL.Sprites["icon-entities-egg"].src = "svg/entities-egg.svg";
BL.Sprites["icon-entities-monster"].src = "svg/entities-monster.svg";
BL.Sprites["icon-entities-mother"].src = "svg/entities-mother.svg";

angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "$log", "$state", "$rootScope", function($scope, $log, $state, $rootScope) {

        var game_o_beast = new Game('entityboard');
        $scope.score = game_o_beast.score;
        game_o_beast.ongameend = function() {
            var highscores = JSON.parse(localStorage.highscores);
            console.log(highscores);
            highscores.push({
                date: moment().valueOf(),
                score: game_o_beast.score
            });
            console.log(highscores)
            localStorage.highscores = JSON.stringify(highscores);
            $rootScope.highscores = JSON.parse(localStorage.highscores);

            var current_game = $rootScope.highscores.length - 1;
            $rootScope.highscores[current_game].current = true;

            $state.go("game.ended");
        };

        $scope.submitHighscore = function(name) {
            var highScoreRef = new Firebase("https://highscore.firebaseio.com/beastie");
            highScoreRef.push({
                name: name,
                score: game_o_beast.score
            });

            console.log($rootScope.highscores);
            $state.go("highscore");
        };

        $scope.restartGame = function() {
            location.reload();
        };

    }]);
