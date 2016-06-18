"use strict";

angular.module("beastieApp", ["ui.router", "workshop"])
    .run(['$rootScope', function($rootScope) {
        if (!localStorage.highscores) localStorage.highscores = JSON.stringify([]);
        $rootScope.highscores = JSON.parse(localStorage.highscores);
    }]);

angular.module("beastieApp").filter("toArray", function() {
    return function(obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }
        return _.map(obj, function(val, key) {
            return Object.defineProperty(val, "$key", {
                __proto__: null,
                value: key
            });
        });
    };
});
