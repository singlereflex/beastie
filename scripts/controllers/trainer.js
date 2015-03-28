"use strict";

/**
 * @ngdoc function
 * @name beastieApp.controller:InstructionsCtrl
 * @description
 * # TrainerCtrl
 * Controller of the beastieApp
 */
angular.module("beastieApp")
    .controller("TrainerCtrl", function ($scope, $interval, $timeout) {

        var entities = [
            1, // player
            0 // block
        ];

        var actions = [
            { x: 0.5, y: 0 }, // down
            { x: 0.5, y: 1 }, // up
            { x: 0, y: 0.5 },  // left
            { x: 1, y: 0.5 }  // right
        ];

        function basicInstincts() {
            var instincts = [];
            var inputKey, outputAttract, outputRepel;

            for (var x = 0; x < 2; x++) {
                inputKey = (-1+(x*2))+",0";
                outputAttract = {
                    input: {},
                    output: {
                        x: -1+(x*2),
                        y: 0.5
                    }
                };
                outputRepel = {
                    input: {},
                    output: {
                        x: 0.5,
                        y: -1+(x*2)
                    }
                };
                outputAttract.input[inputKey] = entities[0]; // go toward player
                outputRepel.input[inputKey] = entities[1]; // go away from walls
                instincts.push(outputAttract);
                instincts.push(outputRepel);
            }

            for (var y = 0; y < 2; y++) {
                inputKey = "0,"+(-1+(y*2));
                outputAttract = {
                    input: {},
                    output: {
                        x: 0.5,
                        y:  -1+(x*2)
                    }
                };
                outputRepel = {
                    input: {},
                    output: {
                        x: -1+(x*2),
                        y: 0.5
                    }
                };
                outputAttract.input[inputKey] = entities[0]; // go toward player
                outputRepel.input[inputKey] = entities[1]; // go away from walls
                instincts.push(outputAttract);
                instincts.push(outputRepel);
            }

            return instincts;

        }

        function randomTraining() {

            var randomY = Math.floor(Math.random()*5)-2;
            var randomX = Math.floor(Math.random()*5)-2;

            var randomKey = randomY+","+randomX;
            var randomEntity = entities[Math.floor(Math.random() * entities.length)];
            var randomAction = actions[Math.floor(Math.random() * actions.length)];

            var output = {
                input: {},
                output: randomAction
            };

            output.input[randomKey] = randomEntity;

            return output;
        }

        function randomTrainings(complexity) {
            var trainings = basicInstincts();

            for (var x = 0; x < complexity; x++) {
                trainings.push(randomTraining());
            }

            return trainings;
        }

        function initializeTrainers(num, complexity) {
            if (window.localStorage.bestTwo) {
                $scope.bestTwo = JSON.parse(window.localStorage.bestTwo);
            }
            $scope.bestScore = 1;
            $scope.gen = 0;
            $scope.roundTime = 30 + (($scope.gen*2) + 1);
            $scope.trainings = [];
            for (var x = 0; x < num; x++) {
                $scope.trainings.push({
                    name: randomName(),
                    ready: false,
                    gen: 0,
                    score: 0,
                    trainings: randomTrainings(complexity)
                });
            }
        }

        function evolveTrainers() {
            $scope.roundTime = 100 + (($scope.gen*2) + 1);
            $scope.gen++;

            //reset scores
            $scope.bestTwo[0].score = 0;
            $scope.bestTwo[1].score = 0;

            //Always include the parent generation
            var trainings = [
                $scope.bestTwo[0],
                $scope.bestTwo[1]
            ];

            //Get Genetic pool
            var trainingPool = _.shuffle($scope.bestTwo[0].trainings.concat($scope.bestTwo[1].trainings));

            //Generate random children
            for (var c = 0; c < 6; c++) {
                var mixed = trainingPool.slice(0, Math.ceil(trainingPool.length/2));
                trainings.push({
                    name: childName($scope.bestTwo[0].name, $scope.bestTwo[1].name),
                    gen: $scope.gen,
                    score: 0,
                    trainings: mixed
                });
            }

            //Generate random mutations from mother
            for (var m = 0; m < 4; m++) {
                var additions = randomTrainings(4);
                var mutations = _.shuffle($scope.bestTwo[0].trainings).slice(0, 3).concat(additions);
                trainings.push({
                    name: mutantName($scope.bestTwo[0].name),
                    gen: $scope.gen,
                    score: 0,
                    trainings: mutations
                });
            }

            ////Generate entirely new peers
            for (var x = 0; x < 3; x++) {
                trainings.push({
                    name: randomName(),
                    gen: 0,
                    score: 0,
                    trainings: randomTrainings(15)
                });
            }
            $scope.trainings = trainings;

        }

        var possibleNames = ["es","de","por","die","go","sho","nan","vis","lot","vor","ker","and","rod","dir","kee","cho","vert","quo","dar","wor","fe","ohm","san","sin","cos","tan","var","pot","vin","mer","pol","net","org","tee","lie","art","zit","wee","red","yoke", "a","e","i","o","u","y"];

        function randomName() {
            return [
                possibleNames[Math.floor(Math.random()*possibleNames.length)],
                possibleNames[Math.floor(Math.random()*possibleNames.length)],
                possibleNames[Math.floor(Math.random()*possibleNames.length)]
            ];
        }

        function childName(mother, father) {
            return [
                Math.random() < 0.5 ? father[0] : mother[0],
                Math.random() < 0.5 ? mother[1] : possibleNames[Math.floor(Math.random()*possibleNames.length)],
                possibleNames[Math.floor(Math.random()*possibleNames.length)]
            ];
        }

        function mutantName(mother) {
            return [
                mother[0],
                Math.random() < 0.5 ? mother[1] : possibleNames[Math.floor(Math.random()*possibleNames.length)],
                possibleNames[Math.floor(Math.random()*possibleNames.length)]
            ];
        }

        $scope.status = "Initializing...";
        initializeTrainers(15, 10);
        var wait = false;

        function interator(){
            if ($scope.roundTime > 0) {
                $scope.roundTime--;
                angular.forEach($scope.trainings, function(training){
                    if (angular.isFunction(training.tick)) {
                        training.tick();
                    }
                });
            } else if (!wait) {
                var bestTwo = _.sortBy($scope.trainings, function(training){ return training.score; }).reverse().slice(0,2);
                wait = true;
                if (bestTwo[0].score < 1 && $scope.gen < 1) {
                    $scope.status = "Evolution Failed, Retrying...";
                    $scope.trainings = [];
                    $timeout(function(){
                        $scope.status = "Training Beasts...";
                        initializeTrainers(15, 10);
                        wait = false;
                    }, 2000);
                } else if (bestTwo[0].score < $scope.bestScore) {
                    $scope.status = "Evolution Regressed, Retrying a Generational Mix...";
                    $scope.trainings = [];
                    $scope.bestTwo[1] = bestTwo[0];
                    $timeout(function(){
                        $scope.status = "Training Beasts...";
                        evolveTrainers(15, 10);
                        wait = false;
                    }, 2000);
                } else {
                    $scope.bestTwo = bestTwo;
                    $scope.bestScore = $scope.bestTwo[0].score;

                    $scope.status = "Evolution Succeeded, Using "+
                    $scope.bestTwo[0].name.join("")+"-"+$scope.bestTwo[0].gen+
                    " and "+$scope.bestTwo[1].name.join("")+"-"+$scope.bestTwo[1].gen+"...";
                    $scope.trainings = [];
                    $timeout(function(){
                        $scope.status = "Training Beasts...";
                        evolveTrainers(15, 10);
                        wait = false;
                    }, 2000);
                }
            }
        }

        var stopTime;

        $scope.$watch("trainings", function(val){

            var allReady = true;
            for (var i = 0; i < val.length; i++) {
                if (!val[i].ready) {
                    allReady = false;
                }
            }

            if (allReady) {
                $interval.cancel(stopTime);
                stopTime = $interval(interator, 20);
            } else {
                $interval.cancel(stopTime);
            }

        }, true);
    });
