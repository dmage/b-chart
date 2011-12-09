/** @requires BEM */

(function() {

BEM.decl('b-scale__linear', {

    update : function() {
        var inputMin = this.inputMin;
        var outputMin = this.outputMin;
        var factor = (this.outputMax - outputMin)/(this.inputMax - inputMin);

        this.f = function f(x) {
            return outputMin + (x - inputMin)*factor;
        };

        this.fInv = function fInv(x) {
            return inputMin + (x - outputMin)/factor;
        };
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
        return undefined;
    },

    ticks : function(n) {
        var range = (this.inputMax - this.inputMin);
        var delta = range/n;

        var l = Math.ceil(Math.log(delta)/Math.log(10));

        delta /= Math.pow(10, l - 2);
        var volume = 100;

        // Searching nearest factor of volume
        var rounded_delta = Math.round(delta),
            diff = 0;
        for (var i = 1; i < volume; ++i) {
            if (rounded_delta <= delta) {
                diff = Math.floor(i/2);
            } else {
                diff = -Math.floor(i/2);
            }
            rounded_delta = Math.round(delta) + diff;
            if (volume % rounded_delta == 0) {
                break;
            }
        }

        delta = rounded_delta*Math.pow(10, l - 2);

        var result = [],
            x = Math.ceil(this.inputMin/delta)*delta;
        while (x <= this.inputMax) {
            result.push(x);
            x += delta;
        }

        return result;
    },

    format : function(value) {
        return Math.round(value*100)/100;
    }

});

})();
