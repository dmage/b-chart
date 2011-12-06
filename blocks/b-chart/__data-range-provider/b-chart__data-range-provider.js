/** @requires BEM */

(function() {

BEM.decl('b-chart__data-range-provider', {

    get : function(items) {
        var minSliceName = this.params.minSliceName,
            maxSliceName = this.params.maxSliceName,
            shiftSliceName = this.params.shiftSliceName,
            min = Number.POSITIVE_INFINITY,
            max = Number.NEGATIVE_INFINITY;

        typeof minSliceName !== 'undefined' || (minSliceName = "y");
        typeof maxSliceName !== 'undefined' || (maxSliceName = "y");
        typeof shiftSliceName !== 'undefined' || (shiftSliceName = "shift");

        for (var i = 0, l = items.length; i < l; ++i) {
            var item = items[i],
                minData = item.renderData[minSliceName] || [],
                maxData = item.renderData[maxSliceName] || [],
                shiftData = item.renderData[shiftSliceName] || [];

            var m = Math.max(minData.length, maxData.length);
            for (var j = 0; j < m; ++j) {
                var s = shiftData[j] || 0,
                    ymin = minData[j],
                    ymax = maxData[j];

                typeof ymin !== 'undefined' || (ymin = 0);
                typeof ymax !== 'undefined' || (ymax = 0);

                if (ymin !== null && min > ymin + s) {
                    min = ymin + s;
                }
                if (ymax !== null && max < ymax + s) {
                    max = ymax + s;
                }
            }
        }

        if (min == Number.POSITIVE_INFINITY) {
            min = 0;
        }
        if (min > max) {
            max = min + 1;
        }

        return {
            min: min,
            max: max
        };
    }

});

})();
