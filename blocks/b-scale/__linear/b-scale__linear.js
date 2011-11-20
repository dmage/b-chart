/** @requires BEM */

(function() {

BEM.decl('b-scale__linear', {

    update : function() {
        var inputMin = this.inputMin;
        var outputMin = this.outputMin;
        var factor = (this.outputMax - outputMin)/(this.inputMax - inputMin);

        this.f = function(x) {
            return outputMin + (x - inputMin)*factor;
        }
    },

    input : function(min, max) {
        if (min >= max) {
            console.log('b-scale__linear.input: min >= max;', { min: min, max: max });
            this.inputMax = min;
            this.inputMin = max;
        } else {
            this.inputMin = min;
            this.inputMax = max;
        }

        this.update();
    },

    output : function(min, max) {
        if (min >= max) {
            console.log('b-scale__linear.output: min >= max;', { min: min, max: max });
            this.outputMax = min;
            this.outputMin = max;
        } else {
            this.outputMin = min;
            this.outputMax = max;
        }

        this.update();
    },

    f : function(x) {
        return undefined;
    },

    fInv : function(x) {
        return this.inputMin + (x - this.outputMin)/this.factor;
    },

    ticks : function(nmin, nmax) {
        var delta = (this.inputMax - this.inputMin)/(nmin - 1);
        var result = [this.inputMin];
        var x = result[0];
        for (var i = 1; i < nmin - 1; ++i) {
            x += delta;
            result.push(x);
        }
        result.push(this.inputMax);
        return result;
    }

});

})();
