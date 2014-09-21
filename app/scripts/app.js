"use strict";

function center(el) {
    $("html,body").animate({
        scrollTop: $(el).offset().top - (( $(window).height() - $(this).outerHeight(true) ) / 2),
        scrollLeft: $(el).offset().left - (( $(window).width() - $(this).outerWidth(true) ) / 2)
    }, 200);
};

// var gui = new dat.GUI({ autoPlace: false });
// var customContainer = document.getElementById('top-nav');
// customContainer.appendChild(gui.domElement);
//
//   gui.add(settings, 'gamespeed');
//   gui.add(settings, 'series');
//   gui.add(settings, 'cutoff', 100, 1000);
//   gui.add(settings, 'q', 0, 20);
//   gui.add(settings, 'test');

angular.module("beastieApp", ["firebase", "ui.router"])
    .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/menu");

        $stateProvider
            .state("menu", {
                url: "/menu",
                templateUrl: "views/menu.html",
                controller: "MenuCtrl"
            })
            .state("help", {
                url: "/help",
                templateUrl: "views/instructions.html",
                controller: "InstructionsCtrl"
            })
            .state("highscore", {
                url: "/highscore",
                templateUrl: "views/highscore.html",
                controller: "HighscoreCtrl"
            })
            .state("game", {
                url: "/game",
                templateUrl: "views/game.html",
                controller: "GameCtrl"
            })
            .state("game.paused", {
                templateUrl: "views/game_paused.html"
            })
            .state("game.ended", {
                templateUrl: "views/game_ended.html"
            });
    }]);

angular.module("beastieApp").filter("toArray", function() {
    return function(obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }
        return _.map(obj, function(val, key) {
            return Object.defineProperty(val, "$key", {__proto__: null, value: key});
        });
    };
});
