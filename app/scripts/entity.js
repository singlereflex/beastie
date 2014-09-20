//now this is just a concept!




/**
 * @todo move this to a component: see StateComponent
 */
// Entity.prototype.transition = function (state_name) {
//     this.state = state_name;
//
//     // if(this.states[state_name].frame !== undefined){
//     //     this.frame = this.states[state_name].frame.bind(this);
//     // }
//     if (this.states[state_name].events !== undefined) {
//         for (var key in this.states[state_name].events) {
//             if (this.states[state_name].events.hasOwnProperty(key)) {
//                 this._events[key] = {};
//                 if (this.states[state_name].events[key]) {
//                     this.on(key, this.states[state_name].events[key].bind(this));
//                 }
//
//             }
//         }
//     }
//     _.extend(this, this.states[state_name]);//that should override the correct things
//     if (this.states[state_name].components !== undefined) {
//         this.loadComponents(this.states[state_name].components)
//     }
//     this.trigger('transition', state_name);
//     this.trigger('transition:' + state_name, this);
// };
