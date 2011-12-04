/** @requires BEM */

(function() {

BEM.decl('b-chart-filter__threshold', {

    run : function(item, data) {
        var min = this.params.min,
            max = this.params.max,
            y = data[this.params.sliceName || "y"];

        typeof min !== 'undefined' || (min = Number.NEGATIVE_INFINITY);
        typeof max !== 'undefined' || (max = Number.POSITIVE_INFINITY);

        for (var i = 0, l = y.length; i < l; ++i) {
            if (y[i] < min || max < y[i]) {
                y[i] = null;
            }
        }

        return data;
    }

});

})();
