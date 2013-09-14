'use strict';

angular.module('beastieApp')
    .constant('beastieEnv', [
        {
            name: 'empty',
            id: false,
            walkable: true
        },
        {
            name: 'block',
            id: 'environment_block',
            heavy: true,
            walkable: false
        },
        {
            name: 'wall',
            id: 'environment_wall_',
            dir: ['N','S','W','E'],
            heavy: false,
            walkable: function(dir){
                return dir < 4;
            }
        }
    ]);
