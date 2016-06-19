"use strict";


angular.module("beastieApp")
    .controller("GameCtrl", ["$scope", "$log", "$state", "$rootScope", function($scope, $log, $state, $rootScope) {

        var game_o_beast = new Game('entityboard');
        $scope.score = game_o_beast.score;
        game_o_beast.ongameend = function() {
            var highscores = JSON.parse(localStorage.highscores);

            highscores.push({
                date: moment().valueOf(),
                score: game_o_beast.score
            });

            localStorage.highscores = JSON.stringify(highscores);
            $rootScope.highscores = JSON.parse(localStorage.highscores);

            var current_game = $rootScope.highscores.length - 1;
            $rootScope.highscores[current_game].current = true;

            $state.go("game.ended");
        };

        $scope.submitHighscore = function(name) {

            $state.go("highscore");
        };

        $scope.restartGame = function() {
            location.reload();
        };

    }]);
