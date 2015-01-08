"use strict";

/**
 * @ngdoc function
 * @name beastieApp.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the beastieApp
 */
angular.module("beastieApp")
    .controller("MenuCtrl", function ($scope) {

        function handleCacheEvent(e) {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
            console.debug(e);
        }

        $scope.appCache = window.applicationCache;
        try {
            $scope.appCache.update();
        } catch (e) {
            $scope.updateState = "downloading cache...";
        }

        // Fired after the first cache of the manifest.
        $scope.appCache.addEventListener("cached", function (e) {
            $scope.updateState = "up to date";
            handleCacheEvent(e);
        }, false);

        // Checking for an update. Always the first event fired in the sequence.
        $scope.appCache.addEventListener("checking", function (e) {
            if ($scope.updateState !== "updated (reload to see)") {
                $scope.updateState = "looking for update...";
            }
            handleCacheEvent(e);
        }, false);

        // An update was found. The browser is fetching resources.
        $scope.appCache.addEventListener("downloading", function (e) {
            $scope.updateState = "updating...";
            handleCacheEvent(e);
        }, false);

        // The manifest returns 404 or 410, the download failed,
        // or the manifest changed while the download was in progress.
        $scope.appCache.addEventListener("error", handleCacheEvent, false);

        // Fired after the first download of the manifest.
        $scope.appCache.addEventListener("noupdate", function (e) {
            if ($scope.updateState !== "updated (reload to see)") {
                $scope.updateState = "up to date";
            }
            handleCacheEvent(e);
        }, false);

        // Fired if the manifest file returns a 404 or 410.
        // This results in the application cache being deleted.
        $scope.appCache.addEventListener("obsolete", handleCacheEvent, false);

        // Fired for each resource listed in the manifest as it is being fetched.
        $scope.appCache.addEventListener("progress", handleCacheEvent, false);

        // Fired when the manifest resources have been newly redownloaded.
        $scope.appCache.addEventListener("updateready", function (e) {
            $scope.updateState = "updated (reload to see)";
            window.location.reload();
            handleCacheEvent(e);
            $scope.appCache.swapCache();


        }, false);

        $scope.entities = [];

        var letters = [
            "####   #####   ###    ####  ######",
            "## ##  ##     ## ##  ##       ##  ",
            "####   #####  #####   ###     ##  ",
            "## ##  ##     ## ##     ##    ##  ",
            "####   #####  ## ##  ####     ##  ",
            "                                  ",
            "       ##      ###   ##  ##  #### ",
            "       ##     ## ##  ### ##  ## ##",
            "       ##     #####  ######  ## ##",
            "   ##  ##     ## ##  ## ###  ## ##",
            "   ##  #####  ## ##  ##  ##  #### "
        ];

        $scope.titleStyle = {
            width: letters[0].length + "em",
            height: letters.length + "em"
        };

        $scope.keyPressed = function (e) {
            console.log(e);
        };

        $scope.fullscreen = function () {
            /*
             var docElm = document.documentElement;

             if (docElm.requestFullscreen) {
             docElm.requestFullscreen();
             }
             else if (docElm.mozRequestFullScreen) {
             docElm.mozRequestFullScreen();
             }
             else if (docElm.webkitRequestFullScreen) {
             docElm.webkitRequestFullScreen();
             }
             else if (docElm.msRequestFullscreen) {
             docElm.msRequestFullscreen();
             }
             */
        };

        for (var i = 0; i < letters.length; i++) {
            for (var e = 0; e < letters[i].length; e++) {
                var letter = letters[i].charAt(e);
                switch (letter) {
                    case "#":
                        $scope.entities.push({
                            kind: "block",
                            classVal: "icon-environment-block",
                            position: {
                                x: e,
                                y: i,
                                z: parseInt(Math.random() * 4).toString()
                            }
                        });
                        break;
                }
            }
        }
    });
