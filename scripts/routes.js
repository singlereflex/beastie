"use strict";

angular.module("beastieApp")
    .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
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
            .state("workshop", {
                url: "/workshop",
                templateUrl: "views/workshop.html",
                controller: "WorkshopCtrl"
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
