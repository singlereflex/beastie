"use strict";

angular.module("beastieApp")
    .constant("beastieEnv", [
        {
            name: "empty",
            id: "environment-empty",
            push: false,
            heavy: false,
            walk: true,
            components: []
        },
        {
            name: "block",
            id: "environment-block",
            push: true,
            heavy: true,
            walk: false,
            components: []
        }
        // {
        //     name: "wall",
        //     id: "environment-wall-",
        //     dir: ["n","s","w","e"],
        //     push: function(dir){

        //     },
        //     heavy: false,
        //     walk: false
        // }
    ]);
