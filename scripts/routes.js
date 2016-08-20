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
                url: "/workshop?level",
                templateUrl: "views/workshop.html",
                controller: "WorkshopCtrl",
                resolve: {
                    level: function($stateParams) {
                        console.debug("gets here");
                        if ($stateParams.level) {
                            return JSON.parse($stateParams.level);
                        }
                        return {}
                    }
                }
            })
            .state("game", {
                url: "/game",
                templateUrl: "views/game.html",
                abstract: true
            })
            .state("game.level", {
                url: "?level",
                controller: "GameCtrl",
                resolve: {
                    level: function($stateParams) {
                        return JSON.parse($stateParams.level);
                    }
                }
            })
            .state("game.puzzle", {
                url: "/:puzzle/:level?",
                controller: "GameCtrl",
                resolve: {
                    puzzle: function($http, $stateParams) {
                        //read file
                        return $http.get("/levels/"+$stateParams.puzzle+".json");
                    },
                    level: function(puzzle, $stateParams) {
                        var level_index = $stateParams.level || 0;
                        return puzzle.data[level_index];
                    }
                }
            })
            .state("game.paused", {
                templateUrl: "views/game_paused.html"
            })
            .state("game.ended", {
                templateUrl: "views/game_ended.html"
            });
    }]);
