/** @requires BEM */

(function() {
"use strict";

BEM.decl('i-units', {

    onSetMod : {
        'js' : function() {
            // ...
        }
    },

    getPrefix : function(value, unit) {
        // ...
        return {
            value: value,
            volume: 1000
        }
    },

    format : function(value, units, scale) {
        if (units == "unixtime") {
            var d = new Date(value*1000),
                hh = d.getHours(),
                mm = d.getMinutes(),
                ss = d.getSeconds();
            if (hh < 10) hh = "0" + hh;
            if (mm < 10) mm = "0" + mm;
            if (ss < 10) ss = "0" + ss;
            return hh + ":" + mm + ":" + ss;
        } else {
            return scale.format(value);
        }
    },

    formatTicks : function(ticks, units, scale) {
        var labeledTicks = [];

        if (units == "unixtime") {
            for (var i = 0, l = ticks.length; i < l; ++i) {
                var tickValue = ticks[i];
                labeledTicks.push({
                    tickValue: tickValue,
                    label: this.format(tickValue, units, scale)
                });
            }

            var d = new Date(ticks[0]*1000);
            labeledTicks[0].extraLabel = d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
        } else {
            for (var i = 0, l = ticks.length; i < l; ++i) {
                var tickValue = ticks[i];
                labeledTicks.push({
                    tickValue: tickValue,
                    label: this.format(tickValue, units, scale)
                });
            }
        }

        return labeledTicks;
    }


}, {

    siUnits : ['A', 'V', 'Hz'],

    binaryUnits : [
        'bit', 'bits', 'b',
        'byte', 'bytes', 'Byte', 'Bytes', 'B'
    ]

});

BEM.blocks['i-units'].instance = BEM.create('i-units');

})();
