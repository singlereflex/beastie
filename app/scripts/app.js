"use strict";

angular.module("beastieApp", ["ui.router", "firebase"])
  .run(['$rootScope', function($rootScope){
    if (!localStorage.highscores) localStorage.highscores = JSON.stringify([]);
    $rootScope.highscores = JSON.parse(localStorage.highscores);
  }])
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
            })
            .state("trainer", {
                url: "/trainer",
                templateUrl: "views/trainer.html",
                controller: "TrainerCtrl"
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
