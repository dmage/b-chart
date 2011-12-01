/** @requires BEM */

(function() {

BEM.decl('b-chart-filter__threshold', {

    run : function(item, data) {
        var min = this.params.min,
            max = this.params.max,
            y = data[this.params.sliceName || "y"],
            slices = [], s, sl,
            i = 0, j = 0, l = y.length;

        for (var name in data) {
            if (!data.hasOwnProperty(name)) {
                continue;
            }
            slices.push(data[name]);
        }
        sl = slices.length;

        typeof min !== 'undefined' || (min = Number.NEGATIVE_INFINITY);
        typeof max !== 'undefined' || (max = Number.POSITIVE_INFINITY);

        for (i = 0; i < l; ++i) {
            if (min <= y[i] && y[i] <= max) {
                for (s = 0; s < sl; ++s) {
                    var slice = slices[s];
                    slice[j] = slice[i];
                }
                ++j;
            }
        }

        for (s = 0; s < sl; ++s) {
            slices[s].length = j;
        }

        return data;
    }

});

})();
