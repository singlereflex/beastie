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
            id: 'environment-block',
            heavy: true,
            walkable: false
        },
        {
            name: 'wall',
            id: 'environment-wall-',
            dir: ['n','s','w','e'],
            heavy: false,
            walkable: function(dir){
                return dir < 4;
            }
        }
    ]);
