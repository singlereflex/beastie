"use strict";

self.importScripts("../../bower_components/brain/brain-0.6.3.min.js");

var trainer = new brain.NeuralNetwork();

function think(surroundings) {
    var thought = trainer.run(surroundings);
    var xoff = thought.x - 0.5;
    var yoff = thought.y - 0.5;

    // if the x offset from 0.5 is greater than the y offset
    if (Math.abs(xoff) > Math.abs(yoff)) {
        var vert = xoff < 0 ? -1 : 1;
        return { x: vert };
    } else {
        var horz = yoff < 0 ? -1 : 1;
        return { y: horz };
    }
}

self.addEventListener("message", function (e) {
    if (e.data) {
        switch (e.data.event) {
            case "train":
                console.log("numOfTrainings: "+e.data.trainings.length);
                var status = trainer.train(e.data.trainings, {
                    errorThresh: 0.25,
                    log: false
                });
                self.postMessage({
                    event: "trained",
                    status: status
                });
                break;
            case "think":
                var thought = think(e.data.surroundings);
                self.postMessage({
                    event: "action",
                    action: thought
                });
                break;
        }
    }
});
