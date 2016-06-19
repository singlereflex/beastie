"use strict";

/**
 * @ngdoc directive
 * @name beastieApp.directive:menuOptions
 * @description
 * # menuOptions
 */
angular.module("beastieApp")
    .directive("menuOptions", function () {
        return {
            restrict: "C",
            link: function postLink($scope, $element) {

                $scope.activeIndex = 0;
                $scope.menuItems = $element.find("li");
                $scope.length = $scope.menuItems.length;

                $scope.$watch("activeIndex", function(val){
                    $scope.menuItems.each(function(index){
                        if (index === val) {
                            this.className = "active";
                        } else {
                            this.className = "";
                        }
                    });
                });
                
                document.onkeydown = function() {

                    switch (window.event.keyCode) {
                    case 87:
                    case 38:
                        //alert("up");
                        $scope.$apply(function(){
                            $scope.activeIndex = ($scope.activeIndex + $scope.length-1) % $scope.length;
                        });

                        break;
                    case 83:
                    case 40:
                        //alert("down");
                        $scope.$apply(function(){
                            $scope.activeIndex = ($scope.activeIndex + 1) % $scope.length;
                        });

                        break;
                    case 13:
                        $scope.menuItems[$scope.activeIndex].firstChild.click();
                    }
                };
            }
        };
    });
